import { useState } from "react";
import { Zap, Loader2, CheckCheck } from "lucide-react";

const BACKEND = "https://webhook.site/bb96551e-850a-4947-92e0-6b70bab51687";

const triggers = [
  {
    label: "Jira Ticket Update",
    source: "Jira",
    col: "#4da8da",
    endpoint: "/webhooks/jira",
    payload: { service: "Order Management API", summary: "Retry count increased from 2 to 5 — RETAIL-4821" },
    fallback: { sev: "warning", docs: ["BRD", "TDD"] },
  },
  {
    label: "Azure Deployment",
    source: "Azure",
    col: "#52b788",
    endpoint: "/webhooks/devops",
    payload: { service: "Retail Order API", summary: "Release-147 deployed to production successfully" },
    fallback: { sev: "success", docs: ["Release", "LLD"] },
  },
  {
    label: "MuleSoft API Change",
    source: "MuleSoft",
    col: "#e05c5c",
    endpoint: "/webhooks/mulesoft",
    payload: { service: "Payment Gateway", summary: "Timeout changed 5000ms → 8000ms. Circuit breaker enabled." },
    fallback: { sev: "critical", docs: ["LLD", "Runbook"] },
  },
  {
    label: "Zoho Governance",
    source: "Zoho",
    col: "#f0a500",
    endpoint: "/webhooks/zoho",
    payload: { service: "Contract Vault", summary: "Q2 governance risk score updated — 3 items need review" },
    fallback: { sev: "info", docs: ["GovDeck"] },
  },
];

function makeClientEvent(t: (typeof triggers)[0]) {
  const prefixes: Record<string, string> = {
    Jira: "JIRA", Azure: "ADO", MuleSoft: "MULE", Zoho: "ZOHO",
  };
  const prefix = prefixes[t.source] ?? t.source.toUpperCase();
  return {
    sev:     t.fallback.sev,
    source:  t.source,
    id:      `${prefix}-${Math.floor(Math.random() * 9000) + 1000}`,
    svc:     t.payload.service,
    summary: t.payload.summary,
    conf:    Math.floor(Math.random() * 10) + 87,
    ts:      "just now",
    docs:    t.fallback.docs,
  };
}

export function WebhookTrigger({ onNewEvent }: { onNewEvent: (event: any) => void }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [fired,   setFired]   = useState<string | null>(null);

  async function trigger(t: (typeof triggers)[0]) {
    setLoading(t.source);

    let event: any = null;

    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 4000);
      const res = await fetch(`${BACKEND}${t.endpoint}`, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(t.payload),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      const data = await res.json();
      if (data.event) event = data.event;
    } catch {
      // backend offline or timed out — create event client-side
    }

    if (!event) event = makeClientEvent(t);

    onNewEvent(event);
    setFired(t.source);
    setTimeout(() => setFired(null), 2500);
    setLoading(null);
  }

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "var(--card)",
        border: "1px solid rgba(124,110,245,0.11)",
        boxShadow: "0 1px 4px rgba(124,110,245,0.06)",
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-4 w-4" style={{ color: "#7c6ef5" }} />
        <div>
          <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            Simulate Live Updates
          </h2>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            See how Synapse reacts when something changes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {triggers.map(t => (
          <button
            key={t.source}
            onClick={() => trigger(t)}
            disabled={loading !== null}
            className="flex items-center gap-3 p-3 rounded-xl text-left transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: `${t.col}10`,
              border: `1px solid ${t.col}66`,
            }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold" style={{ color: t.col }}>{t.source}</p>
              <p className="text-xs truncate mt-0.5" style={{ color: "var(--muted-foreground)" }}>{t.label}</p>
            </div>
            <div className="shrink-0">
              {loading === t.source ? (
                <Loader2 className="h-4 w-4 animate-spin" style={{ color: "var(--muted-foreground)" }} />
              ) : fired === t.source ? (
                <CheckCheck className="h-4 w-4" style={{ color: "#52b788" }} />
              ) : (
                <Zap className="h-4 w-4" style={{ color: t.col }} />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
