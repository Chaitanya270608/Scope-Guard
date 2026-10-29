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

// Demo Presets for 1-Click Testing & Video Recording
const DEMO_PRESETS = {
  creep: {
    contract:
      "Scope of Work: Frontend development of responsive dashboard based on Figma v1.4.\nRevision Policy: Up to two rounds of minor visual adjustments.\nHourly Rate: $50/hour for any additional requests or out-of-scope tasks.",
    message:
      "Hey! The dashboard looks good. Could you also design a custom company logo and set up a full PostgreSQL database authentication schema by tomorrow?",
  },
  inScope: {
    contract:
      "Scope of Work: Frontend development of responsive dashboard based on Figma v1.4.\nRevision Policy: Up to two rounds of minor visual adjustments.\nHourly Rate: $50/hour for any additional requests or out-of-scope tasks.",
    message:
      "Hi, can we tweak the button padding on mobile and adjust the font size of the headers as our first round of revisions?",
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
  const [copied, setCopied] = useState(false);

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

  function loadPreset(type) {
    const preset = DEMO_PRESETS[type];
    if (preset) {
      setContract(preset.contract);
      setMessage(preset.message);
    }
  }

  function handleCopyEmail() {
    if (!reminder || !reminder.body) return;
    const fullText = `Subject: ${reminder.subject}\n\n${reminder.body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleReset() {
    setContract("");
    setMessage("");
    setScope(null);
    setOverride(false);
    setWork("");
    setPrice("");
    setInvoiceId("");
    setSent(false);
    setStatus(null);
    setFreelancerName("");
    setClientName("");
    setReminder(null);
    setError("");
  }

  const showForm = scope && (!scope.in_scope || override);

  return (
    <div className="sg-page">
      <style>{`
        .sg-page {
          background-color: #080c14;
          background-image: radial-gradient(circle at 50% 0%, rgba(30, 58, 138, 0.12) 0%, rgba(8, 12, 20, 1) 75%);
          min-height: 100vh;
          color: #f8fafc;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          padding: 40px 20px 100px 20px;
          box-sizing: border-box;
        }
        .sg-container {
          max-width: 760px;
          margin: 0 auto;
        }
        .sg-card {
          background-color: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 12px;
          padding: 24px;
          margin-top: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
          transition: transform 0.2s ease, border-color 0.2s ease;
          animation: sgSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .sg-card:hover {
          border-color: #334155;
          transform: translateY(-2px);
        }
        .sg-pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #10b981;
          box-shadow: 0 0 8px #10b981;
          animation: sgPulse 2s infinite ease-in-out;
        }
        @keyframes sgPulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        @keyframes sgSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .sg-textarea, .sg-input {
          width: 100%;
          box-sizing: border-box;
          background-color: #080c14;
          color: #f8fafc;
          border: 1px solid #334155;
          border-radius: 8px;
          padding: 12px 14px;
          font-size: 14px;
          font-family: inherit;
          line-height: 1.5;
          outline: none;
          transition: border-color 0.15s ease;
        }
        .sg-textarea:focus, .sg-input:focus {
          border-color: #38bdf8;
        }
        .sg-step-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.25);
          padding: 3px 8px;
          border-radius: 4px;
          margin-bottom: 12px;
          font-family: monospace;
        }
        .sg-preset-btn {
          background: #1e293b;
          color: #94a3b8;
          border: 1px solid #334155;
          border-radius: 6px;
          padding: 4px 10px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .sg-preset-btn:hover {
          color: #f8fafc;
          border-color: #475569;
          background: #27354a;
        }
      `}</style>

      <div className="sg-container">
        {/* Navigation & Header */}
        <header style={{ marginBottom: 32, borderBottom: "1px solid #1e293b", paddingBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h1 style={{
                fontSize: 32,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                margin: 0,
                background: "linear-gradient(135deg, #ffffff 40%, #94a3b8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                ScopeGuard
              </h1>
              <p style={{ color: "#94a3b8", fontSize: 14, margin: "6px 0 0 0" }}>
                AI Scope Creep Protector & Automated PayPal Billing Agent
              </p>
            </div>
            <div style={{
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
              fontFamily: "monospace"
            }}>
              <span className="sg-pulse-dot"></span>
              PayPal US Sandbox: Connected
            </div>
          </div>
        </header>

        {/* Card 1: Input & Scope Audit */}
        <div className="sg-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            <span className="sg-step-badge">STEP 01 / AUDIT</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={() => loadPreset("creep")} className="sg-preset-btn">
                ⚡ Scope Creep Scenario
              </button>
              <button type="button" onClick={() => loadPreset("inScope")} className="sg-preset-btn">
                ⚡ In-Scope Scenario
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Contract Baseline
            </label>
            <textarea
              rows={4}
              className="sg-textarea"
              value={contract}
              onChange={(e) => setContract(e.target.value)}
              placeholder="Paste agreed contract scope, revision clauses, and rates..."
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Incoming Client Message
            </label>
            <textarea
              rows={3}
              className="sg-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste client's requested changes or extra work..."
            />
          </div>

          <button
            onClick={handleCheck}
            disabled={!!busy || !contract || !message}
            style={{
              backgroundColor: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: 8,
              padding: "12px 22px",
              fontSize: 14,
              fontWeight: 600,
              cursor: !!busy || !contract || !message ? "not-allowed" : "pointer",
              opacity: !!busy || !contract || !message ? 0.6 : 1,
              transition: "background 0.15s ease",
            }}
          >
            {busy === "Analyzing contract & request..." ? busy : "Analyze Scope with AI"}
          </button>

          {busy && <p style={{ color: "#38bdf8", marginTop: 12, fontSize: 13.5 }}>{busy}</p>}
          {error && (
            <p style={{ color: "#f87171", marginTop: 12, fontSize: 13.5, backgroundColor: "rgba(239,68,68,0.1)", padding: 10, borderRadius: 6, border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </p>
          )}
        </div>

        {/* Card 2: AI Verdict & Clause Auditor */}
        {scope && (
          <div className="sg-card">
            <span className="sg-step-badge">STEP 02 / VERDICT</span>

            <div style={{ marginTop: 4 }}>
              <span style={{
                display: "inline-block",
                padding: "6px 14px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                backgroundColor: scope.in_scope ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                color: scope.in_scope ? "#34d399" : "#f87171",
                border: `1px solid ${scope.in_scope ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                marginBottom: 12
              }}>
                {scope.in_scope ? "Verdict: In Scope" : "Verdict: Out of Scope Detected"}
              </span>
            </div>

            <p style={{ fontSize: 14.5, color: "#f1f5f9", lineHeight: 1.6, margin: "6px 0 12px 0" }}>
              {scope.reason}
            </p>

            {scope.contract_clause && (
              <div style={{
                borderLeft: "3px solid #38bdf8",
                backgroundColor: "rgba(56, 189, 248, 0.08)",
                padding: "12px 16px",
                borderRadius: "0 8px 8px 0",
                color: "#bae6fd",
                fontSize: 13.5,
                margin: "14px 0",
                lineHeight: 1.5,
              }}>
                <strong style={{ color: "#38bdf8", display: "block", marginBottom: 4 }}>Audited Contract Clause:</strong>
                <em>"{scope.contract_clause}"</em>
              </div>
            )}

            {/* Financial Ledger Receipt */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 12,
              padding: "14px 16px",
              backgroundColor: "#080c14",
              borderRadius: 8,
              border: "1px solid #1e293b",
              fontSize: 13,
              marginTop: 14
            }}>
              <div>
                <span style={{ color: "#94a3b8", display: "block", fontSize: 11 }}>ESTIMATED EFFORT</span>
                <strong style={{ color: "#f8fafc", fontSize: 14 }}>{scope.hours || 0} hrs</strong>
              </div>
              <div>
                <span style={{ color: "#94a3b8", display: "block", fontSize: 11 }}>SUGGESTED AMENDMENT</span>
                <strong style={{ color: "#34d399", fontSize: 14 }}>${scope.suggested_price_usd || 0} USD</strong>
              </div>
              <div>
                <span style={{ color: "#94a3b8", display: "block", fontSize: 11 }}>CONFIDENCE</span>
                <strong style={{ color: scope.confidence === "high" ? "#34d399" : "#fbbf24", fontSize: 14 }}>
                  {scope.confidence ? scope.confidence.toUpperCase() : "NORMAL"}
                </strong>
              </div>
            </div>

            {scope.confidence !== "high" && (
              <p style={{ color: "#fbbf24", fontSize: 13, marginTop: 10 }}>
                Notice: Borderline request. Review contract clauses before billing.
              </p>
            )}

            {scope.in_scope && !override && !invoiceId && (
              <div style={{ marginTop: 16 }}>
                <button
                  onClick={() => setOverride(true)}
                  disabled={!!busy}
                  style={{
                    backgroundColor: "#1e293b",
                    color: "#f8fafc",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    padding: "9px 16px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Override & Bill Anyway
                </button>
              </div>
            )}
          </div>
        )}

        {/* Card 3: PayPal Draft Invoice Builder */}
        {showForm && (
          <div className="sg-card">
            <span className="sg-step-badge">STEP 03 / PAYPAL BILLING</span>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px 0", color: "#f8fafc" }}>
              {override ? "Discretionary Invoice Builder" : "Scope Amendment Invoice"}
            </h3>

            {!override && (
              <p style={{ fontSize: 13.5, color: "#94a3b8", margin: "0 0 16px 0" }}>
                AI Estimated Effort: <strong style={{ color: "#f8fafc" }}>{scope.hours} hours</strong>
              </p>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 14, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Line Item Work Description
                </label>
                <input
                  className="sg-input"
                  value={work}
                  onChange={(e) => setWork(e.target.value)}
                  placeholder="Describe billable deliverables..."
                  disabled={!!invoiceId}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Price (USD)
                </label>
                <input
                  type="number"
                  className="sg-input"
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
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 8,
                  padding: "12px 22px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: !!busy || !work.trim() || !(Number(price) > 0) ? "not-allowed" : "pointer",
                  opacity: !!busy || !work.trim() || !(Number(price) > 0) ? 0.6 : 1,
                }}
              >
                Create PayPal Draft Invoice
              </button>
            )}
          </div>
        )}

        {/* PayPal Active Invoice Status */}
        {invoiceId && (
          <div className="sg-card">
            <span className="sg-step-badge">LIVE LEDGER</span>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 14px 0", color: "#f8fafc" }}>
              PayPal Invoicing Ledger
            </h3>
            <p style={{ fontSize: 13.5, color: "#94a3b8", margin: "0 0 14px 0" }}>
              Draft Invoice ID: <span style={{ fontFamily: "monospace", color: "#38bdf8", fontWeight: 700 }}>{invoiceId}</span>
            </p>

            {!sent && (
              <button
                onClick={handleSend}
                disabled={!!busy}
                style={{
                  backgroundColor: "#059669",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 8,
                  padding: "11px 20px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Send Invoice to Client
              </button>
            )}

            {sent && (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <span style={{ color: "#34d399", fontWeight: 600, fontSize: 13.5 }}>
                    ✓ Delivered to Client Sandbox Account
                  </span>
                  <button
                    onClick={handleStatus}
                    disabled={!!busy}
                    style={{
                      backgroundColor: "#1e293b",
                      color: "#f8fafc",
                      border: "1px solid #334155",
                      borderRadius: 8,
                      padding: "8px 14px",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Refresh Status
                  </button>
                </div>

                {status && (
                  <div style={{
                    display: "flex",
                    gap: 16,
                    flexWrap: "wrap",
                    padding: "12px 16px",
                    backgroundColor: "#080c14",
                    borderRadius: 8,
                    border: "1px solid #1e293b",
                    fontSize: 13,
                    fontFamily: "monospace",
                    alignItems: "center",
                    marginTop: 14
                  }}>
                    <span>STATUS: <strong style={{ color: status.status === "PAID" ? "#34d399" : "#38bdf8" }}>{status.status}</strong></span>
                    <span>TOTAL: <strong>${status.total} USD</strong></span>
                    {status.due_date && <span>DUE: <strong>{status.due_date}</strong></span>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Card 4: Polite Chaser Engine */}
        {sent && (
          <div className="sg-card">
            <span className="sg-step-badge">STEP 04 / CHASER ENGINE</span>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 10px 0", color: "#f8fafc" }}>
              Polite Chaser — Automated Payment Reminders
            </h3>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 16px 0" }}>
              Progressive 3-tier escalating email reminders generated by Gemini from real PayPal invoice records.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Freelancer Name
                </label>
                <input
                  className="sg-input"
                  placeholder="e.g. Alex Rivera"
                  value={freelancerName}
                  onChange={(e) => setFreelancerName(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Client Name
                </label>
                <input
                  className="sg-input"
                  placeholder="e.g. Sarah Jenkins"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => handleReminder(1)}
                disabled={!!busy}
                style={{
                  backgroundColor: "#1e293b",
                  color: "#f8fafc",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  padding: "9px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Tier 1: Friendly Nudge
              </button>
              <button
                onClick={() => handleReminder(2)}
                disabled={!!busy}
                style={{
                  backgroundColor: "#1e293b",
                  color: "#f8fafc",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  padding: "9px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Tier 2: Firm Follow-Up
              </button>
              <button
                onClick={() => handleReminder(3)}
                disabled={!!busy}
                style={{
                  backgroundColor: "#1e293b",
                  color: "#f8fafc",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  padding: "9px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Tier 3: Payment Plan Offer
              </button>
            </div>

            {reminder && reminder.needed === false && (
              <p style={{ color: "#34d399", marginTop: 14, fontSize: 13.5 }}>{reminder.message}</p>
            )}

            {reminder && reminder.needed && (
              <div style={{
                backgroundColor: "#080c14",
                border: "1px solid #334155",
                borderRadius: 8,
                padding: 18,
                marginTop: 14,
                fontSize: 13.5,
                lineHeight: 1.6,
                color: "#cbd5e1",
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid #1e293b",
                  paddingBottom: 8,
                  marginBottom: 10
                }}>
                  <span style={{ color: "#f8fafc", fontWeight: 700 }}>Subject: {reminder.subject}</span>
                  <button
                    onClick={handleCopyEmail}
                    style={{
                      background: copied ? "rgba(16, 185, 129, 0.2)" : "#1e293b",
                      color: copied ? "#34d399" : "#cbd5e1",
                      border: `1px solid ${copied ? "#10b981" : "#334155"}`,
                      borderRadius: 6,
                      padding: "4px 10px",
                      fontSize: 12,
                      cursor: "pointer",
                      fontWeight: 600
                    }}
                  >
                    {copied ? "✓ Copied!" : "📋 Copy Email"}
                  </button>
                </div>
                <div style={{ whiteSpace: "pre-wrap" }}>{reminder.body}</div>
              </div>
            )}

            {/* Workflow Reset Action */}
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #1e293b", textAlign: "right" }}>
              <button
                onClick={handleReset}
                style={{
                  background: "transparent",
                  color: "#94a3b8",
                  border: "1px dashed #334155",
                  borderRadius: 6,
                  padding: "8px 14px",
                  fontSize: 12,
                  cursor: "pointer"
                }}
              >
                ↺ Reset & Start New Audit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}