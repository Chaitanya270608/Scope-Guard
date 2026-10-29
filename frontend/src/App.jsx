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

// Fintech Dark Design Tokens (Pure React Inline Styles)
const S = {
  page: {
    backgroundColor: "#0b0f19",
    minHeight: "100vh",
    color: "#f8fafc",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    padding: "40px 20px 100px 20px",
  },
  container: {
    maxWidth: 760,
    margin: "0 auto",
  },
  header: {
    marginBottom: 32,
    borderBottom: "1px solid #1e293b",
    paddingBottom: 24,
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: 800,
    letterSpacing: "-0.03em",
    margin: 0,
    background: "linear-gradient(135deg, #ffffff 40%, #94a3b8 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  tagline: {
    color: "#94a3b8",
    fontSize: 14,
    margin: "6px 0 0 0",
  },
  badgeConnected: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    color: "#34d399",
    border: "1px solid rgba(16, 185, 129, 0.25)",
    padding: "6px 14px",
    borderRadius: 9999,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "monospace",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "#10b981",
    boxShadow: "0 0 8px #10b981",
  },
  card: {
    backgroundColor: "#131b2e",
    border: "1px solid #1e293b",
    borderRadius: 12,
    padding: 24,
    marginTop: 20,
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25)",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 700,
    margin: "0 0 16px 0",
    color: "#f8fafc",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    color: "#94a3b8",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "#0b0f19",
    color: "#f8fafc",
    border: "1px solid #334155",
    borderRadius: 8,
    padding: "12px 14px",
    fontSize: 14,
    fontFamily: "inherit",
    lineHeight: 1.5,
    resize: "vertical",
    outline: "none",
  },
  input: {
    boxSizing: "border-box",
    backgroundColor: "#0b0f19",
    color: "#f8fafc",
    border: "1px solid #334155",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 14,
    outline: "none",
  },
  btnPrimary: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: 8,
    padding: "12px 22px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnSecondary: {
    backgroundColor: "#1e293b",
    color: "#f8fafc",
    border: "1px solid #334155",
    borderRadius: 8,
    padding: "9px 16px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnSend: {
    backgroundColor: "#059669",
    color: "#ffffff",
    border: "none",
    borderRadius: 8,
    padding: "11px 20px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  pillInScope: {
    display: "inline-block",
    padding: "5px 12px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    color: "#34d399",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    marginBottom: 12,
  },
  pillOutOfScope: {
    display: "inline-block",
    padding: "5px 12px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    color: "#f87171",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    marginBottom: 12,
  },
  quoteBox: {
    borderLeft: "3px solid #38bdf8",
    backgroundColor: "rgba(56, 189, 248, 0.08)",
    padding: "12px 16px",
    borderRadius: "0 8px 8px 0",
    color: "#bae6fd",
    fontSize: 13.5,
    margin: "14px 0",
    lineHeight: 1.5,
  },
  metricsRow: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
    padding: "12px 16px",
    backgroundColor: "#0b0f19",
    borderRadius: 8,
    border: "1px solid #1e293b",
    fontSize: 13,
    marginTop: 12,
  },
  statusRow: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
    padding: "12px 16px",
    backgroundColor: "#0b0f19",
    borderRadius: 8,
    border: "1px solid #1e293b",
    fontSize: 13,
    fontFamily: "monospace",
    alignItems: "center",
    marginTop: 14,
  },
  emailPreview: {
    backgroundColor: "#0b0f19",
    border: "1px solid #334155",
    borderRadius: 8,
    padding: 18,
    marginTop: 14,
    fontSize: 13.5,
    lineHeight: 1.6,
    color: "#cbd5e1",
  },
};

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
    run("Analyzing contract & request...", async () => {
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
    run("Creating PayPal draft invoice...", async () => {
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
    run("Delivering via PayPal API...", async () => {
      await api("/send-invoice", { invoice_id: invoiceId });
      setSent(true);
      setStatus(await api("/invoice-status/" + invoiceId));
    });
  }

  function handleStatus() {
    run("Polling invoice status...", async () => {
      setStatus(await api("/invoice-status/" + invoiceId));
    });
  }

  function handleReminder(level) {
    run("Drafting payment reminder...", async () => {
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
    <div style={S.page}>
      <div style={S.container}>
        {/* Navigation & Live Indicator */}
        <header style={S.header}>
          <div style={S.headerRow}>
            <div>
              <h1 style={S.title}>ScopeGuard</h1>
              <p style={S.tagline}>
                Never work for free again — AI scope auditor & automated PayPal billing agent
              </p>
            </div>
            <div style={S.badgeConnected}>
              <span style={S.dot}></span>
              PayPal US Sandbox: Connected
            </div>
          </div>
        </header>

        {/* Card 1: Input & Scope Audit */}
        <div style={S.card}>
          <h3 style={S.cardTitle}>1. Contract & Request Auditor</h3>

          <div style={{ marginBottom: 16 }}>
            <label style={S.label}>Contract Baseline</label>
            <textarea
              rows={5}
              style={S.textarea}
              value={contract}
              onChange={(e) => setContract(e.target.value)}
              placeholder="Paste agreed contract scope, revision clauses, and rates..."
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={S.label}>Incoming Client Message</label>
            <textarea
              rows={4}
              style={S.textarea}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste client's requested changes or extra work..."
            />
          </div>

          <button
            onClick={handleCheck}
            disabled={!!busy || !contract || !message}
            style={{
              ...S.btnPrimary,
              opacity: !!busy || !contract || !message ? 0.6 : 1,
              cursor: !!busy || !contract || !message ? "not-allowed" : "pointer",
            }}
          >
            {busy === "Analyzing contract & request..." ? busy : "Analyze Scope with AI"}
          </button>

          {busy && <p style={{ color: "#38bdf8", marginTop: 12, fontSize: 13.5 }}>{busy}</p>}
          {error && (
            <p style={{ color: "#f87171", marginTop: 12, fontSize: 13.5, backgroundColor: "rgba(239,68,68,0.1)", padding: 10, borderRadius: 6 }}>
              {error}
            </p>
          )}
        </div>

        {/* Card 2: AI Verdict & Clause Auditor */}
        {scope && (
          <div style={S.card}>
            <div style={scope.in_scope ? S.pillInScope : S.pillOutOfScope}>
              {scope.in_scope ? "Verdict: In Scope" : "Verdict: Out of Scope Detected"}
            </div>

            <p style={{ fontSize: 14.5, color: "#f1f5f9", lineHeight: 1.5, margin: "6px 0 12px 0" }}>
              {scope.reason}
            </p>

            {scope.contract_clause && (
              <div style={S.quoteBox}>
                <strong style={{ color: "#38bdf8" }}>Contract Clause: </strong>
                <span>"{scope.contract_clause}"</span>
              </div>
            )}

            <div style={S.metricsRow}>
              <span>Estimated Effort: <strong style={{ color: "#f8fafc" }}>{scope.hours || 0} hrs</strong></span>
              <span>Suggested Rate: <strong style={{ color: "#34d399" }}>${scope.suggested_price_usd || 0} USD</strong></span>
              <span>Confidence: <strong style={{ color: scope.confidence === "high" ? "#34d399" : "#fbbf24" }}>{scope.confidence.toUpperCase()}</strong></span>
            </div>

            {scope.confidence !== "high" && (
              <p style={{ color: "#fbbf24", fontSize: 13, marginTop: 10 }}>
                Notice: Borderline request. Review contract clauses before billing.
              </p>
            )}

            {scope.in_scope && !override && !invoiceId && (
              <div style={{ marginTop: 16 }}>
                <button onClick={() => setOverride(true)} disabled={!!busy} style={S.btnSecondary}>
                  Override & Bill Anyway
                </button>
              </div>
            )}
          </div>
        )}

        {/* Card 3: PayPal Draft Invoice & Status Ledger */}
        {showForm && (
          <div style={S.card}>
            <h3 style={S.cardTitle}>
              2. {override ? "Discretionary Invoice Builder" : "Scope Amendment Invoice"}
            </h3>

            {!override && (
              <p style={{ fontSize: 13.5, color: "#94a3b8", margin: "0 0 16px 0" }}>
                AI Estimated Effort: <strong style={{ color: "#f8fafc" }}>{scope.hours} hours</strong>
              </p>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 14, marginBottom: 16 }}>
              <div>
                <label style={S.label}>Line Item Work Description</label>
                <input
                  style={{ ...S.input, width: "100%" }}
                  value={work}
                  onChange={(e) => setWork(e.target.value)}
                  placeholder="Describe billable deliverables..."
                  disabled={!!invoiceId}
                />
              </div>

              <div>
                <label style={S.label}>Price (USD)</label>
                <input
                  type="number"
                  style={{ ...S.input, width: "100%" }}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  disabled={!!invoiceId}
                />
              </div>
            </div>

            {!invoiceId && (
              <button
                onClick={handleCreate}
                disabled={!!busy || !work.trim() || !(Number(price) > 0)}
                style={{
                  ...S.btnPrimary,
                  opacity: !!busy || !work.trim() || !(Number(price) > 0) ? 0.6 : 1,
                  cursor: !!busy || !work.trim() || !(Number(price) > 0) ? "not-allowed" : "pointer",
                }}
              >
                Create PayPal Draft Invoice
              </button>
            )}
          </div>
        )}

        {/* PayPal Active Invoice Status */}
        {invoiceId && (
          <div style={S.card}>
            <h3 style={S.cardTitle}>3. PayPal Invoicing Ledger</h3>
            <p style={{ fontSize: 13.5, color: "#94a3b8", margin: "0 0 14px 0" }}>
              Draft Invoice ID: <span style={{ fontFamily: "monospace", color: "#38bdf8" }}>{invoiceId}</span>
            </p>

            {!sent && (
              <button onClick={handleSend} disabled={!!busy} style={S.btnSend}>
                Send Invoice to Client
              </button>
            )}

            {sent && (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <span style={{ color: "#34d399", fontWeight: 600, fontSize: 13.5 }}>
                    Delivered to Client Sandbox Account
                  </span>
                  <button onClick={handleStatus} disabled={!!busy} style={S.btnSecondary}>
                    Refresh Status
                  </button>
                </div>

                {status && (
                  <div style={S.statusRow}>
                    <span>STATUS: <strong style={{ color: status.status === "PAID" ? "#34d399" : "#38bdf8" }}>{status.status}</strong></span>
                    <span>TOTAL: <strong>${status.total} USD</strong></span>
                    {status.due_date && <span>DUE: <strong>{status.due_date}</strong></span>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Card 4: Polite Chaser Follow-Up Engine */}
        {sent && (
          <div style={S.card}>
            <h3 style={S.cardTitle}>4. Polite Chaser — Automated Payment Reminders</h3>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 16px 0" }}>
              Progressive 3-tier escalating email reminders generated by Gemini from real PayPal invoice records.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={S.label}>Freelancer Name</label>
                <input
                  style={{ ...S.input, width: "100%" }}
                  placeholder="e.g. Alex Rivera"
                  value={freelancerName}
                  onChange={(e) => setFreelancerName(e.target.value)}
                />
              </div>
              <div>
                <label style={S.label}>Client Name</label>
                <input
                  style={{ ...S.input, width: "100%" }}
                  placeholder="e.g. Sarah Jenkins"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={() => handleReminder(1)} disabled={!!busy} style={S.btnSecondary}>
                Tier 1: Friendly Nudge
              </button>
              <button onClick={() => handleReminder(2)} disabled={!!busy} style={S.btnSecondary}>
                Tier 2: Firm Follow-Up
              </button>
              <button onClick={() => handleReminder(3)} disabled={!!busy} style={S.btnSecondary}>
                Tier 3: Payment Plan Offer
              </button>
            </div>

            {reminder && reminder.needed === false && (
              <p style={{ color: "#34d399", marginTop: 14, fontSize: 13.5 }}>{reminder.message}</p>
            )}

            {reminder && reminder.needed && (
              <div style={S.emailPreview}>
                <div style={{ color: "#f8fafc", fontWeight: 700, marginBottom: 8, borderBottom: "1px solid #1e293b", paddingBottom: 6 }}>
                  Subject: {reminder.subject}
                </div>
                <div style={{ whiteSpace: "pre-wrap" }}>{reminder.body}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}