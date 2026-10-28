# ScopeGuard

**Never work for free again.**

ScopeGuard is an AI assistant for freelancers. It reads a contract and a client's message, decides whether the request is covered, and, if it isn't, prepares a change-order invoice through the PayPal Invoicing API. If the client doesn't pay, it drafts escalating payment reminders. The freelancer stays in control at every step.

Built for the PayPal AI Hackathon ("Build What's Next with PayPal and AI").

## What it does

1. **Scope check (AI).** Paste a contract and a client message. The AI says whether the request is in or out of scope, quotes the contract sentence it relied on, estimates hours and price, and reports its confidence. Borderline cases (medium or low confidence) are flagged for the freelancer to review.
2. **Change-order invoice (PayPal).** For out-of-scope work, ScopeGuard creates a draft invoice with the PayPal Invoicing API. The freelancer can edit the work description and price before creating it.
3. **Freelancer override.** If the AI says "in scope" but the freelancer disagrees, **Bill anyway** lets them invoice it with their own description and price.
4. **Send and track (PayPal).** Send the invoice to the client and check its status (SENT, PAID, and so on) from the app.
5. **Polite Chaser (AI).** For unpaid invoices, the AI drafts a reminder at three levels: friendly, firm, or an offer to split the amount into installments. Emails use the real invoice number, amount, and payment link from PayPal.

The AI recommends and the freelancer decides. Nothing is billed or sent without the freelancer clicking a button.

## Tools used

- **PayPal Invoicing API v2 (sandbox):** create draft invoices, send them, and read their status. OAuth tokens come from the PayPal REST API.
- **Google Gemini API:** scope analysis (structured JSON output) and reminder email drafting.
- **Node.js + Express** backend, **React + Vite** frontend.
- **AI coding assistant:** Claude was used as a coding assistant while building this project.

## Run it yourself

### Prerequisites

- Node.js 18 or newer (the backend uses the built-in `fetch`)
- A free PayPal developer account at https://developer.paypal.com
- A Gemini API key from https://aistudio.google.com

### 1. PayPal sandbox setup

1. In the PayPal developer dashboard, open **Testing Tools → Sandbox Accounts**. You need:
   - a **Business** account (the freelancer). **Set its country to United States.** In our testing the Invoicing API returned `NOT_AUTHORIZED` for a business account created with country IN.
   - a **Personal** account (the client). Copy its email address.
2. Open **Apps & Credentials** (Sandbox), click **Create App**, and link it to the US Business account.
3. In the app's features, tick **Invoicing** and click **Save Changes**.
4. Copy the app's **Client ID** and **Secret**.

### 2. Backend

```
cd backend
npm install
```

Copy `.env.example` to a new file named `.env` and fill in your values:

```
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_SECRET=your_sandbox_secret
TEST_CLIENT_EMAIL=email_of_the_sandbox_personal_account
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=a_current_gemini_flash_model_id
GEMINI_FALLBACK_MODEL=optional_backup_model_id
```

Gemini model IDs change over time. If you get a "model not found" error, pick a current Flash model ID from Google AI Studio.

Start the server:

```
node server.js
```

It listens on http://localhost:3000. Check it at http://localhost:3000/test-paypal, which should return `{"got_token":true}`.

### 3. Frontend

In a second terminal:

```
cd frontend
npm install
npm run dev
```

Open the address Vite prints (usually http://localhost:5173).

### 4. Try it

Contract:

```
Freelancer will build a 5-page website with a contact form. Rate: $50/hour. Includes 2 rounds of revisions per page. Logo design and copywriting are not included.
```

Try these client messages:

| Message | Expected result |
|---|---|
| Can you also design a logo for us? | Out of scope, priced at hours x $50 |
| Fix the typo on the About page and add an FAQ page. | Only the FAQ page (a 6th page) is billed |
| Thanks, have a great weekend! | In scope, no invoice |
| Can you add a testimonials section to the homepage? | Borderline, flagged for review |

Then click **Create draft invoice**, **Send to client**, and try the three reminder levels.

To see a payment: open https://sandbox.paypal.com in a private window, log in as the sandbox **Personal** account, and pay the invoice. Click **Refresh status** in the app, and it changes to PAID.

You can view the invoices as the freelancer by logging in to https://sandbox.paypal.com with the sandbox **Business** account and opening Invoicing.

## Notes and limitations

- Everything runs against the **PayPal sandbox**. No real money is involved.
- The AI's price is an estimate and can vary between runs, so the freelancer reviews and edits it before the invoice is created.
- When a contract does not clearly cover a request, the AI should report medium or low confidence. The app shows a warning, and the final decision is the freelancer's.
- Reminders are drafted for the freelancer to copy and send. ScopeGuard does not email clients directly.
- The payment-plan reminder offers installments in text only. Splitting an invoice automatically is a possible future feature.
- CORS is open for local development and should be restricted before any deployment.
- Use fake contracts only. Do not paste real client data into the app.

## Project structure

```
backend/    Express server: PayPal Invoicing calls and Gemini prompts
frontend/   React (Vite) app
```

## License

MIT (see the LICENSE file).

## Author

Built by Triple Threat for the PayPal AI Hackathon.
Demo video: