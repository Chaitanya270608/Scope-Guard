import { useState } from "react";

const API = "http://localhost:3000";

export default function App() {
  const [contract, setContract] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheck() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(API + "/change-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contract, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

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
        disabled={loading || !contract || !message}
        style={{ marginTop: 12 }}
      >
        {loading ? "Checking..." : "Check scope"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && result.scope.in_scope && (
        <p style={{ color: "green" }}>
          In scope: {result.scope.reason} No invoice needed.
        </p>
      )}

      {result && !result.scope.in_scope && (
        <div style={{ border: "1px solid #ccc", padding: 16, marginTop: 16 }}>
          <h3>Out of scope</h3>
          <p>{result.scope.reason}</p>
          <p>Extra work: {result.scope.extra_work}</p>
          <p>
            Estimate: {result.scope.hours} hours, ${result.scope.suggested_price_usd}
          </p>
          <p>Draft invoice created: {result.invoice.invoice_id}</p>
        </div>
      )}
    </div>
  );
}