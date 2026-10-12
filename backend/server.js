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

app.listen(3000, () => console.log("Server running on port 3000"));