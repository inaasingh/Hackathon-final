import { motion } from "framer-motion";
import { useState } from "react";
import { Brain, ChevronDown, FileText, Server, AlertTriangle, GitBranch, Sparkles } from "lucide-react";

const SEV_COLORS: Record<string, string> = {
  critical: "text-critical",
  warning:  "text-warning",
  success:  "text-success",
  info:     "text-info",
};

const NODE_TONES: Record<string, string> = {
  critical: "border-critical/60 text-critical bg-critical/10",
  warning:  "border-warning/60 text-warning bg-warning/10",
  info:     "border-info/60 text-info bg-info/10",
  success:  "border-success/60 text-success bg-success/10",
  ai:       "border-ai/60 text-ai bg-[oklch(0.72_0.2_295)]/10",
};

// ── Strip prod-s- / prod-p- prefix and -mb-api suffix for clean display ──────
function cleanName(svc: string): string {
  return svc
    .replace(/^prod-[sp]-/, "")
    .replace(/-mb-api$/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace("Sfsc", "SFSC")
    .replace("Oms", "OMS")
    .replace("Api", "API")
    .replace("Crm", "CRM");
}

// ── Per-event blast radius configs — each event shows a different topology ───
type BlastNode = { label: string; tone: string; x: string; y: string };
type BlastConfig = {
  nodes: BlastNode[];
  downstream: number;
  deps: number;
  reasoning: string;
  actions: string[];
};

function getBlastConfig(e: any): BlastConfig {
  const svc = e.svc ?? "";

  // SFSC Order Sync failure
  if (svc.includes("sfsc-order") || e.id?.includes("441397") || e.id?.includes("2391")) {
    return {
      nodes: [
        { label: "OMS",          tone: "critical", x: "14%", y: "28%" },
        { label: "Salesforce",   tone: "critical", x: "86%", y: "28%" },
        { label: "Receipt API",  tone: "warning",  x: "20%", y: "78%" },
        { label: "Dispatch Svc", tone: "info",     x: "80%", y: "78%" },
      ],
      downstream: 2, deps: 7,
      reasoning: `SFSC Order Sync TECHERROR — First Name field exceeds Salesforce max length (20 chars). ` +
        `Blast radius hits OMS (order stuck in retry queue), Salesforce (Sales_Header_c not created), ` +
        `Receipt API (no receipt generated — customer email not sent), and Dispatch Service (order not released for fulfilment). ` +
        `AI confidence: ${e.conf}%. Fix: truncate First Name in OMS payload transformer before SFSC call.`,
      actions: [
        "Apply First Name truncation fix (max 20 chars) to OMS transformer",
        "Replay failed orders from CloudHub dead-letter queue",
        e.sev === "critical" ? "Notify Mulberry Platform Team — P2 SLA active" : "Monitor retry queue for 30 minutes",
      ],
    };
  }

  // OMS dispatch failure
  if (svc.includes("oms") || e.id?.includes("441376")) {
    return {
      nodes: [
        { label: "Dispatch Svc",  tone: "critical", x: "14%", y: "28%" },
        { label: "SFSC Sync",     tone: "warning",  x: "86%", y: "28%" },
        { label: "Inventory",     tone: "warning",  x: "20%", y: "78%" },
        { label: "CRM",           tone: "info",     x: "80%", y: "78%" },
      ],
      downstream: 2, deps: 5,
      reasoning: `OMS dispatch failure — LinkedHashMap cast exception in OMS transformer. ` +
        `Dispatch Service is blocked (order stuck in retry queue), SFSC Sync degraded (partial order record), ` +
        `Inventory not decremented, CRM showing stale order status. ` +
        `AI confidence: ${e.conf}%. Fix: add null-safe cast to Sales_Header in the OMS transformer and redeploy.`,
      actions: [
        "Add null-safe LinkedHashMap cast to OMS transformer",
        "Replay TSB order from CloudHub retry queue",
        "Verify Inventory and CRM sync after fix",
      ],
    };
  }

  // Receipt API failure
  if (svc.includes("receipt") || e.id?.includes("441392") || e.id?.includes("441362")) {
    return {
      nodes: [
        { label: "Email Service",    tone: "critical", x: "14%", y: "28%" },
        { label: "PDF Generator",    tone: "warning",  x: "86%", y: "28%" },
        { label: "Customer Portal",  tone: "info",     x: "20%", y: "78%" },
        { label: "Audit Log",        tone: "success",  x: "80%", y: "78%" },
      ],
      downstream: 1, deps: 4,
      reasoning: `Receipt API TECHERROR — compositeResponse null on order confirmation. ` +
        `Email Service is blocked (customer receipt not sent), PDF Generator failed (no receipt document), ` +
        `Customer Portal showing incomplete order history. Audit Log unaffected. ` +
        `AI confidence: ${e.conf}%. Fix: add retry handler for null compositeResponse in CloudHub receipt flow.`,
      actions: [
        "Add retry handler for null compositeResponse in receipt flow",
        "Manually trigger receipt generation for affected orders",
        "Set explicit charset=UTF-8 on all HTTP response builders",
      ],
    };
  }

  // Partner API failure
  if (svc.includes("partner") || e.id?.includes("441379")) {
    return {
      nodes: [
        { label: "Salesforce",    tone: "warning",  x: "14%", y: "28%" },
        { label: "Sales Line",    tone: "critical", x: "86%", y: "28%" },
        { label: "Order Confirm", tone: "info",     x: "20%", y: "78%" },
        { label: "Analytics",     tone: "success",  x: "80%", y: "78%" },
      ],
      downstream: 1, deps: 3,
      reasoning: `Partner API sync error — httpStatusCode 201 with empty body. ` +
        `Sales Line record creation unconfirmed in Salesforce (referenceId missing), ` +
        `Order Confirmation status delayed. Analytics unaffected. ` +
        `AI confidence: ${e.conf}%. Fix: add response body validation and individual line item verification step.`,
      actions: [
        "Add referenceId null-check to Partner API composite response handler",
        "Verify Sales_Line_c records individually in Salesforce",
        "Replay affected partner orders after fix deployed",
      ],
    };
  }

  // Pricing / Retry logic events
  if (svc.includes("Pricing") || svc.includes("pricing") || e.source === "Jira") {
    return {
      nodes: [
        { label: "Checkout API",  tone: "warning",  x: "14%", y: "28%" },
        { label: "Product Svc",   tone: "info",     x: "86%", y: "28%" },
        { label: "Cache Layer",   tone: "warning",  x: "20%", y: "78%" },
        { label: "OMS",           tone: "success",  x: "80%", y: "78%" },
      ],
      downstream: 1, deps: 4,
      reasoning: `Pricing Engine retry logic updated — downstream timeout handling improved. ` +
        `Checkout API may see brief latency during the config rollout. ` +
        `Cache Layer invalidation required post-deploy. OMS unaffected. ` +
        `AI confidence: ${e.conf}%. Monitor Checkout API p95 latency for 30 minutes post-deploy.`,
      actions: [
        "Invalidate pricing cache post-deploy",
        "Monitor Checkout API latency for 30 minutes",
        "Validate retry logic in staging before prod rollout",
      ],
    };
  }

  // Successful deployment
  if (e.sev === "success" || svc.includes("Inventory")) {
    return {
      nodes: [
        { label: "OMS",          tone: "success", x: "14%", y: "28%" },
        { label: "Salesforce",   tone: "success", x: "86%", y: "28%" },
        { label: "Receipt API",  tone: "success", x: "20%", y: "78%" },
        { label: "Warehouse",    tone: "info",    x: "80%", y: "78%" },
      ],
      downstream: 0, deps: 4,
      reasoning: `Deployment completed successfully — all downstream systems healthy. ` +
        `OMS, Salesforce, Receipt API all confirmed operational post-deploy. ` +
        `Warehouse sync verified. No rollback required. ` +
        `AI confidence: ${e.conf}%. All clear — no action needed.`,
      actions: [
        "Close deployment ticket — all systems green",
        "Update release notes with verified downstream checks",
        "Schedule post-deploy review in 24 hours",
      ],
    };
  }

  // Governance / Zoho / contract events
  if (e.source === "Zoho" || svc.includes("Contract")) {
    return {
      nodes: [
        { label: "Gov Dashboard", tone: "ai",      x: "14%", y: "28%" },
        { label: "Audit Trail",   tone: "info",    x: "86%", y: "28%" },
        { label: "Compliance",    tone: "warning", x: "20%", y: "78%" },
        { label: "Reports",       tone: "success", x: "80%", y: "78%" },
      ],
      downstream: 0, deps: 3,
      reasoning: `Governance risk score recalculated — contract review window approaching. ` +
        `Compliance dashboard flagged for review. Audit trail updated. ` +
        `Reports regenerated with latest risk scores. ` +
        `AI confidence: ${e.conf}%. Schedule governance review with platform lead.`,
      actions: [
        "Schedule governance review with platform lead",
        "Regenerate compliance report with updated risk scores",
        "Notify contract owner of upcoming review window",
      ],
    };
  }

  // Generic fallback — still varied
  return {
    nodes: [
      { label: "Downstream API", tone: "warning", x: "14%", y: "28%" },
      { label: "Data Layer",     tone: "info",    x: "86%", y: "28%" },
      { label: "Sync Service",   tone: "warning", x: "20%", y: "78%" },
      { label: "Monitoring",     tone: "success", x: "80%", y: "78%" },
    ],
    downstream: 1, deps: 4,
    reasoning: `Detected ${e.sev?.toUpperCase()} event on ${cleanName(svc)} (${e.id}) via ${e.source}. ` +
      `${e.summary}. AI confidence: ${e.conf}%. ` +
      `Impacted documents: ${e.docs?.join(", ") ?? "N/A"}. ` +
      `Recommend reviewing affected downstream services and updating documentation.`,
    actions: [
      `Investigate root cause on ${cleanName(svc)}`,
      "Notify integration owner and update runbook",
      e.sev === "critical" ? "Raise P2 incident and page on-call engineer" : "Monitor for 30 minutes",
    ],
  };
}

function Node({ x, y, label, tone, big }: any) {
  return (
    <motion.div
      key={label}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      style={{ left: x, top: y }}
      className={`absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg border text-[10px] font-medium backdrop-blur ${NODE_TONES[tone] ?? NODE_TONES.info} ${big ? "ai-glow text-xs px-3 py-1.5" : ""}`}
    >
      {label}
    </motion.div>
  );
}

function Edge({ x1, y1, x2, y2, tone }: any) {
  const colors: Record<string, string> = {
    critical: "oklch(0.6 0.22 25 / 50%)",
    warning:  "oklch(0.75 0.18 85 / 45%)",
    info:     "oklch(0.7 0.18 220 / 40%)",
    success:  "oklch(0.7 0.18 145 / 40%)",
    ai:       "oklch(0.7 0.18 270 / 40%)",
  };
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={colors[tone] ?? colors.info}
        strokeWidth="1"
        strokeDasharray="4 3"
      />
    </svg>
  );
}

function Card({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: string }) {
  const tm: Record<string, string> = {
    ai:       "text-ai bg-[oklch(0.72_0.2_295)]/10",
    info:     "text-info bg-info/10",
    critical: "text-critical bg-critical/10",
    warning:  "text-warning bg-warning/10",
    success:  "text-success bg-success/10",
  };
  return (
    <div className="rounded-xl border border-border bg-card/40 p-3">
      <div className="flex items-center justify-between">
        <div className={`h-7 w-7 rounded-md flex items-center justify-center ${tm[tone] ?? tm.info}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="text-lg font-semibold">{value}</span>
      </div>
      <div className="text-[11px] text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

export function ImpactPanel({ selectedEvent }: { selectedEvent: any }) {
  const [open, setOpen] = useState(true);

  const e = selectedEvent ?? {
    svc: "prod-s-sfsc-order-mb-api",
    source: "MuleSoft",
    id: "MULE-441397",
    sev: "critical",
    summary: "TECHERROR — OMS to SFSC Order Sync failed. First Name exceeds max length (20 chars)",
    conf: 94,
    docs: ["OMS Integration LLD", "SFSC Runbook", "Order Sync Runbook"],
    customer: "Mulberry",
    orderRef: "TSB185361-rcvd",
    assignee: "SE",
    priority: "P3",
  };

  const sevColor  = SEV_COLORS[e.sev] ?? SEV_COLORS.info;
  const blast     = getBlastConfig(e);
  const docCount  = String(e.docs?.length ?? 3);
  const nodeCount = String(blast.nodes.length);
  const displayName = cleanName(e.svc ?? "");

  return (
    <div className="glass rounded-2xl p-5">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-ai" /> Blast Radius Analysis
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {e.id} · <span className={sevColor}>{displayName}</span>
            {e.customer ? ` · ${e.customer}` : ""}
          </p>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-ai/10 text-ai border border-ai/30">
          AI {e.conf}%
        </span>
      </div>

      {/* BLAST RADIUS MAP */}
      <div className="relative h-44 rounded-xl border border-border bg-background/40 grid-bg overflow-hidden mb-4">
        {/* Center — epicenter node */}
        <Node x="50%" y="50%" label={displayName} tone={e.sev} big />

        {/* Surrounding affected systems */}
        {blast.nodes.map((n, i) => (
          <Node key={`${e.id}-node-${i}`} x={n.x} y={n.y} label={n.label} tone={n.tone} />
        ))}

        {/* Edges — colored by target node severity */}
        {blast.nodes.map((n, i) => (
          <Edge key={`${e.id}-edge-${i}`} x1="50%" y1="50%" x2={n.x} y2={n.y} tone={n.tone} />
        ))}
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 gap-2">
        <Card icon={FileText}      label="Impacted Docs"    value={docCount}                   tone="ai"      />
        <Card icon={Server}        label="Affected Systems" value={nodeCount}                   tone="info"    />
        <Card icon={AlertTriangle} label="Downstream Risks" value={String(blast.downstream)}   tone={blast.downstream > 0 ? "critical" : "success"} />
        <Card icon={GitBranch}     label="Dependencies"     value={String(blast.deps)}         tone="warning" />
      </div>

      {/* WHY THIS MATTERS */}
      <div className="mt-4 rounded-xl border border-border bg-secondary/30 overflow-hidden">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium hover:bg-secondary/50"
        >
          <span className="inline-flex items-center gap-2">
            <Brain className="h-3.5 w-3.5 text-ai" /> Why This Matters
          </span>
          <ChevronDown className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            className="px-4 pb-3 text-xs text-muted-foreground leading-relaxed border-t border-border"
          >
            {blast.reasoning}
          </motion.div>
        )}
      </div>

      {/* RECOMMENDED NEXT STEPS */}
      <div className="mt-4">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
          Recommended Next Steps
        </div>
        <div className="space-y-1.5">
          {blast.actions.map((a) => (
            <button
              key={a}
              className="w-full text-left text-xs px-3 py-2 rounded-lg border border-border bg-card/50 hover:bg-card hover:glow-border transition flex items-center justify-between"
            >
              <span>{a}</span>
              <span className="text-[10px] gradient-text font-medium">RUN</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
