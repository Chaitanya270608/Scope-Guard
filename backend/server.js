require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.json());

const BASE_URL = "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  const auth = Buffer.from(
    process.env.PAYPAL_CLIENT_ID + ":" + process.env.PAYPAL_SECRET
  ).toString("base64");

  const response = await fetch(BASE_URL + "/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + auth,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  if (!data.access_token) {
    throw new Error("Could not get PayPal token");
  }
  return data.access_token;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function callGemini(model, prompt) {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/" +
      model +
      ":generateContent",
    {
      method: "POST",
      signal: AbortSignal.timeout(20000),
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    }
  );

  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}

async function checkScope(contract, message) {
  const prompt = `You are an assistant that protects freelancers from scope creep.
Compare the client's message against the contract and decide if the request is covered.
If the contract states an hourly rate, use it to price extra work. Otherwise estimate a fair price.

CONTRACT:
${contract}

CLIENT MESSAGE:
${message}

Reply with JSON only, in exactly this shape:
{"in_scope": true or false, "reason": "one or two sentences", "extra_work": "short description of the extra work, or an empty string if in scope", "hours": number, "suggested_price_usd": number}
If the request is in scope, use 0 for hours and suggested_price_usd.`;

  const models = [
    process.env.GEMINI_MODEL,
    process.env.GEMINI_FALLBACK_MODEL,
  ].filter(Boolean);
  let lastError = "Gemini request failed";

  for (const model of models) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      const result = await callGemini(model, prompt);

      if (result.ok) {
        const text = result.data.candidates[0].content.parts[0].text;
        return JSON.parse(text);
      }

      lastError = "Gemini error: " + JSON.stringify(result.data);

      if (result.status !== 503 && result.status !== 429) {
        throw new Error(lastError);
      }
      await sleep(attempt * 2000);
    }
  }

  throw new Error(lastError);
}

async function createDraftInvoice(scope, clientEmail) {
  const price = Number(scope.suggested_price_usd);
  if (!price || price <= 0) {
    throw new Error("AI did not return a valid price");
  }

  const token = await getAccessToken();

  const response = await fetch(BASE_URL + "/v2/invoicing/invoices", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      detail: {
        currency_code: "USD",
        note: "Change order: " + scope.reason,
      },
      primary_recipients: [{ billing_info: { email_address: clientEmail } }],
      items: [
        {
          name: scope.extra_work,
          description: "Estimated " + scope.hours + " hours of additional work",
          quantity: "1",
          unit_amount: { currency_code: "USD", value: price.toFixed(2) },
        },
      ],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error("PayPal error: " + JSON.stringify(data));
  }

  return { invoice_id: data.href.split("/").pop(), api_link: data.href };
}

app.get("/test-paypal", async (req, res) => {
  try {
    await getAccessToken();
    res.json({ got_token: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/check-scope", async (req, res) => {
  try {
    const { contract, message } = req.body;
    if (!contract || !message) {
      return res.status(400).json({ error: "contract and message are required" });
    }
    res.json(await checkScope(contract, message));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/change-order", async (req, res) => {
  try {
    const { contract, message } = req.body;
    if (!contract || !message) {
      return res.status(400).json({ error: "contract and message are required" });
    }

    const clientEmail = req.body.client_email || process.env.TEST_CLIENT_EMAIL;
    const scope = await checkScope(contract, message);

    if (scope.in_scope) {
      return res.json({ scope, invoice: null });
    }

    const invoice = await createDraftInvoice(scope, clientEmail);
    res.json({ scope, invoice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));