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

app.get("/test-paypal", async (req, res) => {
  try {
    await getAccessToken();
    res.json({ got_token: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/create-test-invoice", async (req, res) => {
  try {
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
          note: "Change order: extra logo design (outside original contract)",
        },
        primary_recipients: [
          { billing_info: { email_address: process.env.TEST_CLIENT_EMAIL } },
        ],
        items: [
          {
            name: "Logo design (extra work)",
            quantity: "1",
            unit_amount: { currency_code: "USD", value: "150.00" },
          },
        ],
      }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/token-scope", async (req, res) => {
  try {
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
    res.json({ scope: data.scope });
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

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/" +
        process.env.GEMINI_MODEL +
        ":generateContent",
      {
        method: "POST",
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
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    const text = data.candidates[0].content.parts[0].text;
    res.json(JSON.parse(text));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));