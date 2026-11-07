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

const STEPS = [
  { id: 1, label: "01. Scope Audit" },
  { id: 2, label: "02. AI Verdict" },
  { id: 3, label: "03. PayPal Billing" },
  { id: 4, label: "04. Chaser Engine" },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
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
  const [explanation, setExplanation] = useState(null);
  const [copiedExp, setCopiedExp] = useState(false); 
  const [invoices, setInvoices] = useState([]);
  const [showLedger, setShowLedger] = useState(false);

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
      setExplanation(null);
      const data = await api("/check-scope", { contract, message });
      setScope(data);
      setWork(data.extra_work || "");
      setPrice(data.suggested_price_usd > 0 ? String(data.suggested_price_usd) : "");
      setCurrentStep(2);
    });
  }

  function handleCreate() {
    run("Creating PayPal draft invoice...", async () => {
      const data = await api("/create-invoice", {
        extra_work: work,
        hours: scope ? scope.hours : 0,
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

  function handleSendReminder() {
    run("Sending reminder via PayPal...", async () => {
      const data = await api("/send-paypal-reminder", {
        invoice_id: invoiceId,
        reminder_text: reminder.body
      });
      if (data.success) {
        alert("Reminder sent successfully to the client!");
      }
    });
  }

  function handleDraftExplanation() {
    run("Drafting polite explanation...", async () => {
      setExplanation(
        await api("/draft-explanation", {
          message,
          extra_work: work,
          price: Number(price),
          freelancer_name: freelancerName,
          client_name: clientName,
        })
      );
    });
  }

  function handleCopyExplanation() {
    if (!explanation || !explanation.body) return;
    const fullText = `Subject: ${explanation.subject}\n\n${explanation.body}`;
    navigator.clipboard.writeText(fullText);
    setCopiedExp(true);
    setTimeout(() => setCopiedExp(false), 2000);
  }

  function handleFetchInvoices() {
    run("Fetching invoice ledger...", async () => {
      const data = await api("/list-invoices");
      setInvoices(data.invoices || []);
      setShowLedger(true);
    });
  }

  function handleSelectInvoice(inv) {
    setInvoiceId(inv.id);
    setSent(true); 
    setStatus(inv.status); 
    setShowLedger(false);
    setCurrentStep(4); // Jump directly to the Chaser Engine
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
    setExplanation(null);
    setError("");
    setCurrentStep(1);
  }

  const canGoToBilling = scope && (!scope.in_scope || override);

  return (
    <div className="sg-page">
      <style>{`
        * { box-sizing: border-box; }
        .sg-page {
          background-color: #0b0f17;
          background-image: 
            radial-gradient(circle at 50% 5%, rgba(56, 189, 248, 0.08) 0%, rgba(11, 15, 23, 0) 65%),
            radial-gradient(circle at 85% 20%, rgba(99, 102, 241, 0.05) 0%, rgba(11, 15, 23, 0) 50%);
          min-height: 100vh;
          color: #e2e8f0;
          font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 32px 20px 48px 20px;
        }
        .sg-container {
          width: 100%;
          max-width: 740px;
          display: flex;
          flex-direction: column;
        }
        .sg-card {
          background: rgba(18, 24, 38, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          padding: 26px;
          box-shadow: 0 16px 36px -10px rgba(0, 0, 0, 0.35), 0 0 1px 1px rgba(255, 255, 255, 0.02) inset;
          animation: sgFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes sgFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .sg-pulse-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: #34d399;
          box-shadow: 0 0 8px rgba(52, 211, 153, 0.6);
          animation: sgPulse 2.4s infinite ease-in-out;
        }
        @keyframes sgPulse {
          0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.5); }
          70% { transform: scale(1.15); box-shadow: 0 0 0 6px rgba(52, 211, 153, 0); }
          100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
        }
        .sg-textarea, .sg-input {
          width: 100%;
          background: rgba(11, 15, 23, 0.65);
          color: #f1f5f9;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 13.5px;
          font-family: inherit;
          line-height: 1.55;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .sg-textarea:focus, .sg-input:focus {
          border-color: rgba(56, 189, 248, 0.5);
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.08);
        }
        .sg-preset-btn {
          background: rgba(255, 255, 255, 0.04);
          color: #94a3b8;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 8px;
          padding: 5px 11px;
          font-size: 11.5px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .sg-preset-btn:hover {
          color: #f1f5f9;
          border-color: rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.08);
        }
        .sg-stepper {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 20px;
        }
        .sg-step-node {
          padding: 9px 8px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 500;
          text-align: center;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .sg-step-node.active {
          background: rgba(56, 189, 248, 0.08);
          border-color: rgba(56, 189, 248, 0.35);
          color: #38bdf8;
          font-weight: 600;
        }
        .sg-step-node.completed {
          color: #94a3b8;
          border-color: rgba(255, 255, 255, 0.08);
        }
        .sg-step-node.disabled {
          cursor: not-allowed;
          opacity: 0.4;
        }
      `}</style>

      <div className="sg-container">
        {/* Softer Header */}
        <header style={{ marginBottom: 22, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{
              fontSize: 23,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              margin: 0,
              color: "#f8fafc"
            }}>
              ScopeGuard
            </h1>
            <p style={{ color: "#94a3b8", fontSize: 13, margin: "3px 0 0 0" }}>
              AI Scope Creep Protector & Automated PayPal Billing Agent
            </p>
            <button
              onClick={handleFetchInvoices}
              disabled={!!busy}
              style={{
                marginTop: 14,
                background: "rgba(255, 255, 255, 0.05)",
                color: "#e2e8f0",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 8,
                padding: "6px 14px",
                fontSize: 12,
                cursor: busy ? "not-allowed" : "pointer",
                fontWeight: 500
              }}
            >
              {busy === "Fetching invoice ledger..." ? "Loading..." : "🧾 View Invoice Ledger"}
            </button>
          </div>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: "rgba(52, 211, 153, 0.08)",
            color: "#34d399",
            border: "1px solid rgba(52, 211, 153, 0.2)",
            padding: "5px 12px",
            borderRadius: 9999,
            fontSize: 12,
            fontWeight: 500,
            fontFamily: "monospace"
          }}>
            <span className="sg-pulse-dot"></span>
            PayPal Sandbox: Connected
          </div>
        </header>

        {showLedger ? (
          <div className="sg-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#f8fafc" }}>RECENT INVOICES</span>
              <button
                onClick={() => setShowLedger(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 12 }}
              >
                ✕ Close
              </button>
            </div>
            
            {invoices.length === 0 ? (
              <div style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No invoices found.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {invoices.map((inv) => (
                  <div key={inv.id} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "rgba(11, 15, 23, 0.5)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    padding: "12px 16px",
                    borderRadius: 8
                  }}>
                    <div>
                      <strong style={{ color: "#e2e8f0", fontSize: 13, display: "block" }}>{inv.id}</strong>
                      <span style={{ color: "#94a3b8", fontSize: 11 }}>Status: {inv.status}</span>
                    </div>
                    <button
                      onClick={() => handleSelectInvoice(inv)}
                      style={{
                        backgroundColor: "#38bdf8",
                        color: "#0f172a",
                        border: "none",
                        borderRadius: 6,
                        padding: "6px 12px",
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      Remind →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>

        {/* Softer Stepper */}
        <div className="sg-stepper">
          {STEPS.map((s) => {
            const isActive = currentStep === s.id;
            const isCompleted =
              (s.id === 1 && scope) ||
              (s.id === 2 && scope) ||
              (s.id === 3 && sent);
            const isAccessible =
              s.id === 1 ||
              (s.id === 2 && scope) ||
              (s.id === 3 && canGoToBilling) ||
              (s.id === 4 && sent);

            return (
              <button
                key={s.id}
                type="button"
                className={`sg-step-node ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""} ${!isAccessible ? "disabled" : ""}`}
                disabled={!isAccessible}
                onClick={() => isAccessible && setCurrentStep(s.id)}
              >
                {isCompleted && !isActive ? "✓" : null}
                {s.label}
              </button>
            );
          })}
        </div>

        {/* STEP 1: Audit Input View */}
        {currentStep === 1 && (
          <div className="sg-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: "#38bdf8", letterSpacing: "0.06em", fontFamily: "monospace" }}>
                STEP 01 / CONTRACT & REQUEST AUDIT
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button type="button" onClick={() => loadPreset("creep")} className="sg-preset-btn">
                  ⚡ Scope Creep
                </button>
                <button type="button" onClick={() => loadPreset("inScope")} className="sg-preset-btn">
                  ⚡ In-Scope
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#94a3b8", marginBottom: 6, letterSpacing: "0.03em" }}>
                Contract Baseline
              </label>
              <textarea
                rows={4}
                className="sg-textarea"
                value={contract}
                onChange={(e) => setContract(e.target.value)}
                placeholder="Paste contract scope, revision clauses, and rates..."
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#94a3b8", marginBottom: 6, letterSpacing: "0.03em" }}>
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
                width: "100%",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: 10,
                padding: "11px",
                fontSize: 13.5,
                fontWeight: 600,
                cursor: !!busy || !contract || !message ? "not-allowed" : "pointer",
                opacity: !!busy || !contract || !message ? 0.6 : 1,
                boxShadow: "0 4px 14px rgba(37, 99, 235, 0.25)",
                transition: "opacity 0.2s ease",
              }}
            >
              {busy === "Analyzing contract & request..." ? busy : "Analyze Scope with Gemini AI →"}
            </button>

            {busy && <p style={{ color: "#38bdf8", marginTop: 12, fontSize: 13 }}>{busy}</p>}
            {error && (
              <p style={{ color: "#f87171", marginTop: 12, fontSize: 13, backgroundColor: "rgba(239, 68, 68, 0.08)", padding: 10, borderRadius: 8, border: "1px solid rgba(239, 68, 68, 0.15)" }}>
                {error}
              </p>
            )}
          </div>
        )}

        {/* STEP 2: Verdict View */}
        {currentStep === 2 && scope && (
          <div className="sg-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: "#38bdf8", letterSpacing: "0.06em", fontFamily: "monospace" }}>
                STEP 02 / AUDIT VERDICT
              </span>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 12, cursor: "pointer" }}
              >
                ← Back to Inputs
              </button>
            </div>

            <div style={{ marginBottom: 12 }}>
              <span style={{
                display: "inline-block",
                padding: "5px 12px",
                borderRadius: 9999,
                fontSize: 11.5,
                fontWeight: 600,
                letterSpacing: "0.04em",
                backgroundColor: scope.in_scope ? "rgba(52, 211, 153, 0.1)" : "rgba(248, 113, 113, 0.1)",
                color: scope.in_scope ? "#34d399" : "#f87171",
                border: `1px solid ${scope.in_scope ? "rgba(52, 211, 153, 0.25)" : "rgba(248, 113, 113, 0.25)"}`,
              }}>
                {scope.in_scope ? "Verdict: In Scope" : "Verdict: Out of Scope Detected"}
              </span>
            </div>

            <p style={{ fontSize: 14, color: "#e2e8f0", lineHeight: 1.6, margin: "6px 0 14px 0" }}>
              {scope.reason}
            </p>

            {scope.contract_clause && (
              <div style={{
                borderLeft: "2px solid #38bdf8",
                backgroundColor: "rgba(56, 189, 248, 0.05)",
                padding: "10px 14px",
                borderRadius: "0 10px 10px 0",
                color: "#bae6fd",
                fontSize: 13,
                marginBottom: 14,
                lineHeight: 1.5,
              }}>
                <strong style={{ color: "#38bdf8", display: "block", marginBottom: 2, fontSize: 11.5 }}>Audited Clause:</strong>
                <em>"{scope.contract_clause}"</em>
              </div>
            )}

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
              padding: "12px 14px",
              backgroundColor: "rgba(11, 15, 23, 0.55)",
              borderRadius: 10,
              border: "1px solid rgba(255, 255, 255, 0.06)",
              fontSize: 12,
              marginBottom: 16
            }}>
              <div>
                <span style={{ color: "#94a3b8", display: "block", fontSize: 11 }}>EFFORT</span>
                <strong style={{ color: "#f8fafc", fontSize: 13 }}>{scope.hours || 0} hrs</strong>
              </div>
              <div>
                <span style={{ color: "#94a3b8", display: "block", fontSize: 11 }}>SUGGESTED AMENDMENT</span>
                <strong style={{ color: "#34d399", fontSize: 13 }}>${scope.suggested_price_usd || 0} USD</strong>
              </div>
              <div>
                <span style={{ color: "#94a3b8", display: "block", fontSize: 11 }}>CONFIDENCE</span>
                <strong style={{ color: scope.confidence === "high" ? "#34d399" : "#fbbf24", fontSize: 13 }}>
                  {scope.confidence ? scope.confidence.toUpperCase() : "NORMAL"}
                </strong>
              </div>
            </div>

            {/* NEW CLIENT COMMUNICATION BLOCK */}
            {!scope.in_scope && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.03em" }}>
                    CLIENT COMMUNICATION
                  </span>
                  <button
                    onClick={handleDraftExplanation}
                    disabled={!!busy}
                    style={{
                      background: "rgba(56, 189, 248, 0.1)",
                      color: "#38bdf8",
                      border: "1px solid rgba(56, 189, 248, 0.25)",
                      borderRadius: 8,
                      padding: "6px 12px",
                      fontSize: 11.5,
                      fontWeight: 500,
                      cursor: busy ? "not-allowed" : "pointer",
                    }}
                  >
                    {busy === "Drafting polite explanation..." ? "Drafting..." : "✍️ Draft Polite Reply"}
                  </button>
                </div>

                {explanation && (
                  <div style={{
                    backgroundColor: "rgba(11, 15, 23, 0.65)",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                    borderRadius: 10,
                    padding: 14,
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: "#cbd5e1",
                  }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                      paddingBottom: 8,
                      marginBottom: 8
                    }}>
                      <span style={{ color: "#f8fafc", fontWeight: 600 }}>Subject: {explanation.subject}</span>
                      <button
                        onClick={handleCopyExplanation}
                        style={{
                          background: copiedExp ? "rgba(52, 211, 153, 0.15)" : "rgba(255, 255, 255, 0.06)",
                          color: copiedExp ? "#34d399" : "#cbd5e1",
                          border: `1px solid ${copiedExp ? "rgba(52, 211, 153, 0.3)" : "rgba(255, 255, 255, 0.1)"}`,
                          borderRadius: 6,
                          padding: "3px 8px",
                          fontSize: 11.5,
                          cursor: "pointer",
                          fontWeight: 500
                        }}
                      >
                        {copiedExp ? "✓ Copied!" : "📋 Copy"}
                      </button>
                    </div>
                    <div style={{ whiteSpace: "pre-wrap" }}>{explanation.body}</div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              {!scope.in_scope && (
                <button
                  onClick={() => setCurrentStep(3)}
                  style={{
                    flex: 1,
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 10,
                    padding: "11px 16px",
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.25)",
                  }}
                >
                  Proceed to PayPal Billing →
                </button>
              )}

              {scope.in_scope && !override && (
                <button
                  onClick={() => {
                    setOverride(true);
                    setCurrentStep(3);
                  }}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    color: "#f8fafc",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: 10,
                    padding: "11px 16px",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Override & Bill Anyway →
                </button>
              )}

              {scope.in_scope && override && (
                <button
                  onClick={() => setCurrentStep(3)}
                  style={{
                    flex: 1,
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 10,
                    padding: "11px 16px",
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.25)",
                  }}
                >
                  Continue to Discretionary Billing →
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: PayPal Billing View */}
        {currentStep === 3 && (
          <div className="sg-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: "#38bdf8", letterSpacing: "0.06em", fontFamily: "monospace" }}>
                STEP 03 / PAYPAL BILLING
              </span>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 12, cursor: "pointer" }}
              >
                ← Back to Verdict
              </button>
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 12px 0", color: "#f8fafc" }}>
              {override ? "Discretionary Invoice Builder" : "Scope Amendment Invoice"}
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#94a3b8", marginBottom: 6, letterSpacing: "0.03em" }}>
                  Deliverable Description
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
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#94a3b8", marginBottom: 6, letterSpacing: "0.03em" }}>
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

            {!invoiceId ? (
              <button
                onClick={handleCreate}
                disabled={!!busy || !work.trim() || !(Number(price) > 0)}
                style={{
                  width: "100%",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 10,
                  padding: "11px",
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: !!busy || !work.trim() || !(Number(price) > 0) ? "not-allowed" : "pointer",
                  opacity: !!busy || !work.trim() || !(Number(price) > 0) ? 0.6 : 1,
                  boxShadow: "0 4px 14px rgba(37, 99, 235, 0.25)",
                }}
              >
                {busy === "Creating PayPal draft invoice..." ? busy : "Create PayPal Draft Invoice"}
              </button>
            ) : (
              <div style={{ padding: "14px", backgroundColor: "rgba(11, 15, 23, 0.55)", borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.06)", marginTop: 10 }}>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 10px 0" }}>
                  Draft Invoice ID: <strong style={{ fontFamily: "monospace", color: "#38bdf8" }}>{invoiceId}</strong>
                </p>

                {!sent ? (
                  <button
                    onClick={handleSend}
                    disabled={!!busy}
                    style={{
                      width: "100%",
                      backgroundColor: "#059669",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 10,
                      padding: "11px",
                      fontSize: 13.5,
                      fontWeight: 600,
                      cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(5, 150, 105, 0.25)",
                    }}
                  >
                    {busy === "Delivering via PayPal API..." ? busy : "Send Invoice to Client"}
                  </button>
                ) : (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ color: "#34d399", fontWeight: 500, fontSize: 13 }}>
                        ✓ Delivered to Client Sandbox Ledger
                      </span>
                      <button
                        onClick={handleStatus}
                        disabled={!!busy}
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                          color: "#f8fafc",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          borderRadius: 8,
                          padding: "5px 11px",
                          fontSize: 12,
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
                        padding: "10px 14px",
                        backgroundColor: "rgba(11, 15, 23, 0.7)",
                        borderRadius: 8,
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                        fontSize: 12.5,
                        fontFamily: "monospace",
                        marginBottom: 12
                      }}>
                        <span>STATUS: <strong style={{ color: status.status === "PAID" ? "#34d399" : "#38bdf8" }}>{status.status}</strong></span>
                        <span>TOTAL: <strong>${status.total} USD</strong></span>
                      </div>
                    )}

                    <button
                      onClick={() => setCurrentStep(4)}
                      style={{
                        width: "100%",
                        backgroundColor: "#2563eb",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: 10,
                        padding: "11px",
                        fontSize: 13.5,
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(37, 99, 235, 0.25)",
                      }}
                    >
                      Proceed to Polite Chaser Engine →
                    </button>
                  </div>
                )}
              </div>
            )}

            {busy && <p style={{ color: "#38bdf8", marginTop: 12, fontSize: 13 }}>{busy}</p>}
            {error && (
              <p style={{ color: "#f87171", marginTop: 12, fontSize: 13, backgroundColor: "rgba(239, 68, 68, 0.08)", padding: 10, borderRadius: 8, border: "1px solid rgba(239, 68, 68, 0.15)" }}>
                {error}
              </p>
            )}
          </div>
        )}

        {/* STEP 4: Chaser Engine View */}
        {currentStep === 4 && sent && (
          <div className="sg-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: "#38bdf8", letterSpacing: "0.06em", fontFamily: "monospace" }}>
                STEP 04 / CHASER ENGINE
              </span>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 12, cursor: "pointer" }}
              >
                ← Back to Billing
              </button>
            </div>

            <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 14px 0" }}>
              Progressive escalating reminders generated by Gemini from live PayPal invoice details.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#94a3b8", marginBottom: 6, letterSpacing: "0.03em" }}>
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
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#94a3b8", marginBottom: 6, letterSpacing: "0.03em" }}>
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

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              <button
                onClick={() => handleReminder(1)}
                disabled={!!busy}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  color: "#f8fafc",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Tier 1: Friendly Nudge
              </button>
              <button
                onClick={() => handleReminder(2)}
                disabled={!!busy}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  color: "#f8fafc",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Tier 2: Firm Follow-Up
              </button>
              <button
                onClick={() => handleReminder(3)}
                disabled={!!busy}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  color: "#f8fafc",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Tier 3: Payment Plan Offer
              </button>
            </div>

            {reminder && reminder.needed && (
              <div style={{
                backgroundColor: "rgba(11, 15, 23, 0.65)",
                border: "1px solid rgba(255, 255, 255, 0.07)",
                borderRadius: 10,
                padding: 14,
                marginBottom: 14,
                fontSize: 13,
                lineHeight: 1.6,
                color: "#cbd5e1",
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                  paddingBottom: 8,
                  marginBottom: 8
                }}>
                  <span style={{ color: "#f8fafc", fontWeight: 600 }}>Subject: {reminder.subject}</span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={handleSendReminder}
                      disabled={!!busy}
                      style={{
                        background: "rgba(37, 99, 235, 0.15)",
                        color: "#60a5fa",
                        border: "1px solid rgba(37, 99, 235, 0.3)",
                        borderRadius: 6,
                        padding: "3px 8px",
                        fontSize: 11.5,
                        cursor: busy ? "not-allowed" : "pointer",
                        fontWeight: 500
                      }}
                    >
                      {busy === "Sending reminder via PayPal..." ? "Sending..." : "📤 Send via PayPal"}
                    </button>
                    <button
                      onClick={handleCopyEmail}
                      style={{
                        background: copied ? "rgba(52, 211, 153, 0.15)" : "rgba(255, 255, 255, 0.06)",
                        color: copied ? "#34d399" : "#cbd5e1",
                        border: `1px solid ${copied ? "rgba(52, 211, 153, 0.3)" : "rgba(255, 255, 255, 0.1)"}`,
                        borderRadius: 6,
                        padding: "3px 8px",
                        fontSize: 11.5,
                        cursor: "pointer",
                        fontWeight: 500
                      }}
                    >
                      {copied ? "✓ Copied!" : "📋 Copy"}
                    </button>
                  </div>
                </div>
                <div style={{ whiteSpace: "pre-wrap" }}>{reminder.body}</div>
              </div>
            )}

            <div style={{ textAlign: "right", marginTop: 14, borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: 12 }}>
              <button
                onClick={handleReset}
                style={{
                  background: "transparent",
                  color: "#94a3b8",
                  border: "1px dashed rgba(255, 255, 255, 0.12)",
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontSize: 11.5,
                  cursor: "pointer"
                }}
              >
                ↺ Reset & Start New Audit
              </button>
            </div>
          </div>
        )}
        
        </>
      )}
      </div>
    </div>
  );
}