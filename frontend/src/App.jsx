import { useState } from "react";

const API = "http://localhost:3000";

async function api(path, body) {
  const options = body
    ? {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    : undefined;
  const res = await fetch(API + path, options);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.message || "Something went wrong");
  }
  return data;
}

const box = { border: "1px solid #ccc", padding: 16, marginTop: 16 };

export default function App() {
  const [contract, setContract] = useState("");
  const [message, setMessage] = useState("");
  const [scope, setScope] = useState(null);
  const [override, setOverride] = useState(false);
  const [work, setWork] = useState("");
  const [price, setPrice] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [sent, setSent] = useState(false);
  const [status, setStatus] = useState(null);
  const [freelancerName, setFreelancerName] = useState("");
  const [clientName, setClientName] = useState("");
  const [reminder, setReminder] = useState(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function run(label, action) {
    setBusy(label);
    setError("");
    try {
      await action();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  function handleCheck() {
    run("Checking...", async () => {
      setScope(null);
      setOverride(false);
      setWork("");
      setPrice("");
      setInvoiceId("");
      setSent(false);
      setStatus(null);
      setReminder(null);
      const data = await api("/check-scope", { contract, message });
      setScope(data);
      setWork(data.extra_work || "");
      setPrice(data.suggested_price_usd > 0 ? String(data.suggested_price_usd) : "");
    });
  }

  function handleCreate() {
    run("Creating...", async () => {
      const data = await api("/create-invoice", {
        extra_work: work,
        hours: scope.hours,
        reason: override
          ? "Additional work requested by the client"
          : scope.reason,
        price: Number(price),
      });
      setInvoiceId(data.invoice.invoice_id);
    });
  }

  function handleSend() {
    run("Sending...", async () => {
      await api("/send-invoice", { invoice_id: invoiceId });
      setSent(true);
      setStatus(await api("/invoice-status/" + invoiceId));
    });
  }

  function handleStatus() {
    run("Refreshing...", async () => {
      setStatus(await api("/invoice-status/" + invoiceId));
    });
  }

  function handleReminder(level) {
    run("Drafting...", async () => {
      setReminder(
        await api("/draft-reminder", {
          invoice_id: invoiceId,
          level,
          freelancer_name: freelancerName,
          client_name: clientName,
        })
      );
    });
  }

  const showForm = scope && (!scope.in_scope || override);

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>ScopeGuard</h1>
      <p>Never work for free again.</p>

      <h3>Contract</h3>
      <textarea
        rows={6}
        style={{ width: "100%" }}
        value={contract}
        onChange={(e) => setContract(e.target.value)}
        placeholder="Paste the contract text here"
      />

      <h3>Client message</h3>
      <textarea
        rows={4}
        style={{ width: "100%" }}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Paste the client's latest message here"
      />

      <button
        onClick={handleCheck}
        disabled={!!busy || !contract || !message}
        style={{ marginTop: 12 }}
      >
        {busy === "Checking..." ? busy : "Check scope"}
      </button>

      {busy && <p>{busy}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {scope && (
        <div style={box}>
          <h3>{scope.in_scope ? "In scope" : "Out of scope"}</h3>
          <p>{scope.reason}</p>
          {scope.contract_clause && (
            <p>
              <em>Contract says: {scope.contract_clause}</em>
            </p>
          )}
          <p>Confidence: {scope.confidence}</p>
          {scope.confidence !== "high" && (
            <p style={{ color: "orange" }}>
              Borderline case: please review before billing.
            </p>
          )}
          {scope.in_scope && !override && !invoiceId && (
            <button onClick={() => setOverride(true)} disabled={!!busy}>
              Bill anyway
            </button>
          )}
        </div>
      )}

      {showForm && (
        <div style={box}>
          <h3>{override ? "Bill at your discretion" : "Draft invoice"}</h3>
          {!override && <p>AI estimate: {scope.hours} hours</p>}
          <p>
            <label>
              Work:{" "}
              <input
                style={{ width: "70%" }}
                value={work}
                onChange={(e) => setWork(e.target.value)}
                placeholder="Describe the extra work"
                disabled={!!invoiceId}
              />
            </label>
          </p>
          <p>
            <label>
              Price (USD):{" "}
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={!!invoiceId}
              />
            </label>
          </p>
          {!invoiceId && (
            <button
              onClick={handleCreate}
              disabled={!!busy || !work.trim() || !(Number(price) > 0)}
            >
              Create draft invoice
            </button>
          )}
        </div>
      )}

      {invoiceId && (
        <div style={box}>
          <h3>Invoice</h3>
          <p>Draft created: {invoiceId}</p>

          {!sent && (
            <button onClick={handleSend} disabled={!!busy}>
              Send to client
            </button>
          )}

          {sent && (
            <div>
              <p>Sent to the client.</p>
              <button onClick={handleStatus} disabled={!!busy}>
                Refresh status
              </button>
              {status && (
                <p>
                  Status: <strong>{status.status}</strong> | Total: {status.total}
                  {status.due_date ? " | Due: " + status.due_date : ""}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {sent && (
        <div style={box}>
          <h3>Payment follow-up</h3>
          <input
            placeholder="Your name"
            value={freelancerName}
            onChange={(e) => setFreelancerName(e.target.value)}
          />{" "}
          <input
            placeholder="Client's name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
          <div style={{ marginTop: 12 }}>
            <button onClick={() => handleReminder(1)} disabled={!!busy}>
              1 Friendly
            </button>{" "}
            <button onClick={() => handleReminder(2)} disabled={!!busy}>
              2 Firm
            </button>{" "}
            <button onClick={() => handleReminder(3)} disabled={!!busy}>
              3 Payment plan
            </button>
          </div>

          {reminder && reminder.needed === false && <p>{reminder.message}</p>}
          {reminder && reminder.needed && (
            <div style={{ marginTop: 12 }}>
              <strong>{reminder.subject}</strong>
              <p style={{ whiteSpace: "pre-wrap" }}>{reminder.body}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}