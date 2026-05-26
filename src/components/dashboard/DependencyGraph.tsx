import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, AlertTriangle, Activity, RefreshCw, ChevronRight } from "lucide-react";

const BACKEND = (import.meta as any).env?.VITE_BACKEND_URL || "http://localhost:3001";

interface ServiceNode {
  id: string; label: string; sublabel: string;
  x: number;  y: number;
  color: string; icon: string; source: string;
}

// viewBox: 0 0 720 420   node: 115 × 58
// 4 columns: CI/CD → API/Observe → Integration → Downstream
const NODES: ServiceNode[] = [
  { id: "azure-devops", label: "Release Pipeline",  sublabel: "Azure DevOps · CI/CD",        x: 10,  y: 65,  color: "#0078d4", icon: "🚀", source: "AzureDevOps"  },
  { id: "jira",         label: "MULE-2391",          sublabel: "Jira · Deployment ticket",    x: 10,  y: 265, color: "#0052cc", icon: "📋", source: "JiraTracker"  },
  { id: "order-api",    label: "p-orders-mb-api",   sublabel: "Order API · v2.1 schema",     x: 188, y: 160, color: "#f0a500", icon: "🛒", source: "OrderAPI"     },
  { id: "datadog",      label: "APM Monitoring",    sublabel: "Datadog · Observability",      x: 188, y: 330, color: "#774aa4", icon: "📊", source: "Datadog"      },
  { id: "mulesoft",     label: "MB-005 Flow",        sublabel: "MuleSoft CloudHub · xform",  x: 373, y: 55,  color: "#1f5dc2", icon: "⚡", source: "MuleSoftFlow" },
  { id: "adyen",        label: "Payment Gateway",   sublabel: "Adyen · /checkout API",        x: 373, y: 265, color: "#0abf53", icon: "💳", source: "Adyen"        },
  { id: "salesforce",   label: "CRM Sync API",       sublabel: "Salesforce · s-sf-mb-api",   x: 558, y: 28,  color: "#00a1e0", icon: "☁️", source: "SalesforceCRM"},
  { id: "oms",          label: "OMS Fulfilment",     sublabel: "OMNIX · Order routing",       x: 558, y: 175, color: "#e05c5c", icon: "📦", source: "OMSService"   },
  { id: "zoho-desk",    label: "Zoho Desk",          sublabel: "Support · ticket queue",      x: 558, y: 325, color: "#f0a500", icon: "🎫", source: "ZohoDesk"     },
];

function nc(n: ServiceNode) { return { cx: n.x + 57, cy: n.y + 29 }; }

interface Edge { from: string; to: string; label: string; cp?: [number, number]; }
const EDGES: Edge[] = [
  { from: "jira",         to: "azure-devops", label: "PR approval",      cp: [25, 192]  },
  { from: "azure-devops", to: "order-api",    label: "deploys v2.1"                     },
  { from: "order-api",    to: "mulesoft",     label: "order events"                     },
  { from: "order-api",    to: "datadog",      label: "APM metrics",      cp: [215, 268] },
  { from: "mulesoft",     to: "salesforce",   label: "CRM sync"                         },
  { from: "mulesoft",     to: "oms",          label: "order routing"                    },
  { from: "mulesoft",     to: "adyen",        label: "payment trigger",  cp: [396, 180] },
  { from: "adyen",        to: "salesforce",   label: "payment records"                  },
  { from: "oms",          to: "zoho-desk",    label: "failures → tix",   cp: [593, 278] },
  { from: "datadog",      to: "jira",         label: "alert → ticket"                   },
];

const BLAST_MAP: Record<string, string[]> = {
  AzureDevOps:  ["azure-devops", "order-api", "mulesoft", "oms", "salesforce", "adyen", "zoho-desk"],
  JiraTracker:  ["jira", "azure-devops", "order-api"],
  OrderAPI:     ["order-api", "mulesoft", "oms", "salesforce", "adyen", "datadog", "zoho-desk"],
  Datadog:      ["datadog", "jira", "azure-devops"],
  MuleSoftFlow: ["mulesoft", "oms", "salesforce", "adyen", "zoho-desk"],
  Adyen:        ["adyen", "salesforce", "zoho-desk"],
  SalesforceCRM:["salesforce", "zoho-desk"],
  OMSService:   ["oms", "zoho-desk"],
  ZohoDesk:     ["zoho-desk"],
};

const BLAST_SCENARIOS: Record<string, Record<string, { prediction: string; confidence: number; detail: string }>> = {
  AzureDevOps: {
    critical: {
      prediction: "Release-149 introduced a breaking payload schema change to p-orders-mb-api (orderLines → lineItems field rename) without a downstream integration review gate. MuleSoft DataWeave transform MB-005 still references the legacy field name — all order routing now failing with MULE:TRANSFORMATION errors. Adyen payment trigger flow and Salesforce CRM sync both halted. Recommend immediate rollback or emergency hotfix to DataWeave line 47.",
      confidence: 97,
      detail: "Deploy: Release-149 · 14:02 UTC · Jira: MULE-2391 · schema v2.0→v2.1 · gate missed: integration-contract-check · 6 downstream services impacted",
    },
    warning: {
      prediction: "Release-149 is queued. Pre-deploy contract scan found 2 downstream MuleSoft flows still referencing the legacy orderLines field. Deployment held pending DataWeave transform update — MB-005 and MB-019 both need patching before release proceeds.",
      confidence: 88,
      detail: "Deploy hold: 2 unresolved transform references · MB-005 · MB-019 · estimated fix: 45 min · gated by: integration-contract-check",
    },
    success: {
      prediction: "Release-149 deployed cleanly. All MuleSoft DataWeave transforms validated against the updated p-orders-mb-api v2.1 schema before deploy. OMS, Salesforce CRM, Adyen, and Zoho Desk all confirmed healthy post-deploy. Zero ticket spike detected.",
      confidence: 99,
      detail: "Deploy time: 3m 51s · 14 integration gates: all passed · schema contract tests: 14/14 green · post-deploy monitoring: nominal",
    },
  },
  JiraTracker: {
    warning: {
      prediction: "MULE-2391 was closed without the mandatory 'downstream integration reviewed' checklist item completed. This ticket approved Release-149 which contained the breaking schema change. An audit flag has been raised for the sprint retrospective.",
      confidence: 91,
      detail: "MULE-2391 · Sprint 47 · closed by: Arun Patel · missing gate: integration-contract-check · flagged: retrospective",
    },
    critical: {
      prediction: "MULE-2391 Jira webhook is not delivering status updates to the Azure DevOps pipeline. Release-149 cannot auto-close the deployment gate — pipeline blocked at gate 3/5. Manual unblock required from the platform team.",
      confidence: 85,
      detail: "Webhook failures: 7 · last delivery: 41m ago · pipeline: blocked at gate 3/5 · manual intervention: required",
    },
  },
  OrderAPI: {
    critical: {
      prediction: "p-orders-mb-api v2.1 schema change has broken all 3 downstream MuleSoft consumers. MB-005 DataWeave transform throwing MULE:TRANSFORMATION on every order event. OMS fulfilment queue blocked with 67 orders. Salesforce CRM sync halted. Adyen payment triggers failing. Checkout abandonment up 38%.",
      confidence: 95,
      detail: "Error rate: 100% on /api/orders · schema: v2.1 (lineItems) · consumers broken: 3/3 · orders blocked: 67 · Adyen: 0 txn processed",
    },
    warning: {
      prediction: "p-orders-mb-api p95 latency at 2.3s — above the 1.5s SLA. MuleSoft MB-005 flow showing elevated transformation time. OMS queue growing at +4/min. Salesforce CRM accumulating a 6-minute backlog. Datadog fired alert ord-latency-p95.",
      confidence: 86,
      detail: "p95: 2.3s · p99: 4.8s · OMS queue depth: 14 · Salesforce lag: 6min · Datadog: alert fired",
    },
    success: {
      prediction: "p-orders-mb-api fully healthy post-recovery. DataWeave transform MB-005 hotfixed — all 67 blocked OMS orders replayed from the dead-letter queue. Salesforce CRM backfilled with 847 stale records. Adyen payment processing resumed. Checkout error rate: 0%.",
      confidence: 99,
      detail: "Recovery · 67 orders replayed · 847 SF records backfilled · Adyen: normal · Datadog: all monitors green",
    },
  },
  Datadog: {
    warning: {
      prediction: "Datadog fired ord-latency-p99 alert — p99 latency on p-orders-mb-api breached 2.8s (SLA: 2.0s). Jira ticket MULE-2395 auto-created (P3). Azure DevOps notified to hold Release-150 pending investigation. MuleSoft DataWeave transform time trending 2.4× above baseline.",
      confidence: 85,
      detail: "p99: 2.8s · alert: ord-latency-p99 · Jira: MULE-2395 (auto-created) · Release-150: hold · MuleSoft transform avg: 1.9s",
    },
    critical: {
      prediction: "Datadog fired 4 critical monitors simultaneously — Order API p95 3.2s, MuleSoft error rate 8.4%, Salesforce Connector uptime 94.1% (below SLA), OMS queue depth 67. Auto-ticket MULE-2398 created and assigned to Platform Engineering. Azure DevOps Release-150 pipeline blocked.",
      confidence: 92,
      detail: "Monitors fired: 4 critical · auto-ticket: MULE-2398 · release hold: Release-150 · on-call paged: 14:47 UTC · P1 incident declared",
    },
    info: {
      prediction: "Datadog dashboards healthy across all monitored services. Order API p95 at 380ms, MuleSoft error rate 0.02%, Salesforce Connector uptime 99.9%, OMS queue depth 0. No Jira tickets auto-raised in the last 24h.",
      confidence: 96,
      detail: "All monitors: GREEN · SLA compliance: 99.94% · last alert: 3d ago · Jira auto-tickets (24h): 0",
    },
  },
  MuleSoftFlow: {
    critical: {
      prediction: "MB-005 Order→OMS integration flow is in FAILED state. DataWeave transformation at line 47 throws MULE:TRANSFORMATION — payload.orderLines[0] not found in v2.1 schema. Circuit breaker opened after 8 consecutive failures. Downstream routing to OMS, Salesforce CRM sync, and Adyen payment triggers all blocked.",
      confidence: 96,
      detail: "Flow: MB-005 · error: MULE:TRANSFORMATION line 47 · circuit breaker: OPEN · failures: 67 · DLQ depth: 67 · Adyen triggers: 0",
    },
    warning: {
      prediction: "MB-005 flow processing latency elevated — DataWeave transformation time 3× above baseline over the last 15 minutes. OMS routing active but accumulating a 23-item backlog. Salesforce CRM sync running 8 minutes behind. Adyen payment flow intermittent timeouts.",
      confidence: 84,
      detail: "Transform time: avg 2.1s (baseline: 0.7s) · OMS queue: 23 pending · SF lag: 8min · Adyen timeouts: 4",
    },
    success: {
      prediction: "MB-005 DataWeave transform patched — field reference updated from payload.orderLines[0] to payload.lineItems[0]. Flow restarted cleanly. Dead-letter queue replay triggered — all 67 blocked orders now routing to OMS. Salesforce CRM sync resumed. Adyen processing normally.",
      confidence: 98,
      detail: "Hotfix: DataWeave line 47 · flow restart: 14:38 UTC · DLQ replay: 67/67 · SF sync: resumed · Adyen: normal",
    },
  },
  Adyen: {
    critical: {
      prediction: "Adyen payment gateway returning HTTP 503 on all /checkout endpoints. MuleSoft payment trigger flow MB-012 circuit breaker OPEN after 15 consecutive failures. Salesforce billing records halted — £89,400 in pending transactions not posted. Zoho Desk receiving 'Payment declined' ticket surge (+280% baseline). Manual fallback via Stripe backup recommended.",
      confidence: 94,
      detail: "Adyen: 503 all endpoints · MB-012 circuit breaker: OPEN · stalled txn: £89,400 · Zoho spike: +280% · Stripe fallback: available",
    },
    warning: {
      prediction: "Adyen response times elevated — p95 at 1.8s vs 400ms SLA. MuleSoft MB-012 payment flow queue building with 23 pending transactions. Salesforce billing sync running 7 minutes behind. Adyen status page showing EU-WEST region partial incident.",
      confidence: 83,
      detail: "Adyen p95: 1.8s · MB-012 queue: 23 · SF billing lag: 7min · Adyen status: EU-WEST partial · checkout: degraded",
    },
    success: {
      prediction: "Adyen payment gateway fully recovered. EU-WEST region incident resolved. MuleSoft MB-012 circuit breaker reset — all 23 queued transactions replayed successfully. Salesforce billing records backfilled. Zoho Desk payment-related ticket volume returning to baseline.",
      confidence: 97,
      detail: "Adyen: 200 OK · MB-012: CLOSED (reset) · 23 txn replayed · SF billing: backfilled · Zoho: normalising",
    },
  },
  SalesforceCRM: {
    critical: {
      prediction: "s-salesforce-mb-api CRM sync halted. Upstream MuleSoft MB-005 transformation failure means order events not reaching Salesforce. 847 order records stale for 2+ hours. Sales dashboards showing incorrect pipeline figures — £142K unreported. Billing integration risk if not resolved.",
      confidence: 91,
      detail: "Sync halted: 14:06 UTC · stale records: 847 · pipeline delta: £142K · billing risk: active · Zoho cases: unlinked",
    },
    warning: {
      prediction: "Salesforce CRM sync running 12 minutes behind due to upstream MuleSoft latency. 142 order records queued for update. API daily rate at 71% allocation. Revenue figures will reconcile automatically once upstream flow normalises.",
      confidence: 86,
      detail: "Sync lag: 12min · queued records: 142 · API usage: 71,200/100,000 · rate cap risk: 3h · auto-resolve: expected",
    },
    success: {
      prediction: "Salesforce CRM sync fully recovered. 847 stale records backfilled via manual sync trigger. Pipeline reporting and revenue dashboards now accurate. Zoho Desk tickets auto-updated with resolution notes.",
      confidence: 99,
      detail: "Backfill: 847/847 · sync latency: 0.3s · API rate: 28% used · dashboards: accurate · Zoho: auto-resolved",
    },
  },
  OMSService: {
    critical: {
      prediction: "OMNIX OMS fulfilment queue blocked. 67 order events stuck in dead-letter queue — no routing events from MuleSoft MB-005. Warehouse pick-and-pack idle. Customer order confirmations failing, directly driving the Zoho Desk ticket spike (+340%).",
      confidence: 93,
      detail: "OMS queue: 67 blocked · DLQ depth: 67 · warehouse: idle · Zoho spike: +340% · customer impact: order confirmation failure",
    },
    warning: {
      prediction: "OMNIX OMS receiving order routing events intermittently. 14 orders queued with delayed processing — average fulfilment delay +18 minutes above SLA. Despatching team manually reviewing the queue.",
      confidence: 82,
      detail: "Queue depth: 14 · processing delay: +18min vs SLA · manual review: active · MuleSoft: intermittent",
    },
    success: {
      prediction: "OMNIX OMS fulfilment queue fully recovered. All 67 blocked orders replayed from the MuleSoft dead-letter queue. Warehouse throughput normal. No orders lost.",
      confidence: 99,
      detail: "DLQ replay: 67/67 · warehouse: normal throughput · orders lost: 0 · SLA: recovering",
    },
  },
  ZohoDesk: {
    critical: {
      prediction: "Zoho Desk experiencing a 340% ticket spike. 31 new 'Order not confirmed' tickets created in the last 45 minutes — all classified Urgent by the Groq AI pipeline with urgency scores 88–95. Mulberry and Clarks accounts have both breached their SLA response window. Direct downstream symptom of the OMS fulfilment failure.",
      confidence: 94,
      detail: "Ticket spike: 31 in 45min (+340%) · urgency avg: 91/100 · SLA breach: 2 accounts · cause: OMS block",
    },
    warning: {
      prediction: "Zoho Desk ticket volume elevated — 12 new checkout-related tickets in the last 30 minutes (2× baseline). AI classification routing all to Platform Engineering. SLA utilisation at 68%. If OMS failure not resolved within 30 minutes, breach is likely.",
      confidence: 81,
      detail: "Tickets: 12 in 30min (+100%) · SLA utilisation: 68% · breach window: ~30min · routing: Platform Engineering",
    },
    success: {
      prediction: "Zoho Desk ticket volume returned to baseline. The 31 incident tickets auto-resolved with root cause drafted by Groq AI. Customer communications sent. Post-incident review ticket created in Jira (MULE-2394).",
      confidence: 98,
      detail: "31 tickets resolved · auto-response: 31/31 sent · Jira PIR: MULE-2394 · ticket rate: baseline",
    },
    info: {
      prediction: "Zoho Desk operating normally. AI pipeline classifying and routing tickets within SLA. Current open ticket count: 7. Average Groq urgency score: 64/100. No unusual patterns detected.",
      confidence: 96,
      detail: "Open: 7 · avg urgency: 64 · SLA compliance: 97.4% · pipeline: live · last spike: 3d ago",
    },
  },
};

// Distinct colour per chain reaction
const SIMULATIONS = [
  { src: "AzureDevOps",  sev: "critical", label: "Schema Deploy",     color: "#e05c5c" },
  { src: "OrderAPI",     sev: "warning",  label: "API Latency Spike",  color: "#f0a500" },
  { src: "Adyen",        sev: "critical", label: "Payment Outage",    color: "#9b8ff5" },
  { src: "Datadog",      sev: "warning",  label: "Monitor Alert",     color: "#4da8da" },
  { src: "MuleSoftFlow", sev: "critical", label: "Transform Fail",    color: "#e05c5c" },
  { src: "OMSService",   sev: "critical", label: "OMS Blocked",       color: "#e05c5c" },
  { src: "AzureDevOps",  sev: "success",  label: "Recovery Deploy",   color: "#52b788" },
] as const;

const NODE_SOURCE_MAP: Record<string, string> = {
  "azure-devops": "AzureDevOps", "jira": "JiraTracker",  "order-api": "OrderAPI",
  "datadog": "Datadog",          "mulesoft": "MuleSoftFlow", "adyen": "Adyen",
  "salesforce": "SalesforceCRM", "oms": "OMSService",    "zoho-desk": "ZohoDesk",
};
const NODE_COLOR_MAP: Record<string, string> = {
  "azure-devops": "#e05c5c", "jira": "#4da8da",  "order-api": "#f0a500",
  "datadog": "#4da8da",      "mulesoft": "#e05c5c", "adyen": "#9b8ff5",
  "salesforce": "#f0a500",   "oms": "#e05c5c",   "zoho-desk": "#e05c5c",
};
const NODE_DEFAULT_SEV: Record<string, string> = {
  "azure-devops": "critical", "jira": "warning",  "order-api": "critical",
  "datadog": "warning",       "mulesoft": "critical", "adyen": "critical",
  "salesforce": "warning",    "oms": "critical",  "zoho-desk": "critical",
};

interface BlastResult {
  source: string; affectedNodes: string[]; affectedCount: number;
  prediction: string; severity: string; confidence: number;
  detail?: string; color?: string;
}

function PulseDot({ from, to, color }: { from: ServiceNode; to: ServiceNode; color: string }) {
  const dur = (1.4 + Math.random() * 0.7).toFixed(2);
  return (
    <circle r="3.5" fill={color} opacity="0.9">
      <animateMotion dur={`${dur}s`} repeatCount="indefinite" calcMode="linear">
        <mpath xlinkHref={`#edge-${from.id}-${to.id}`} />
      </animateMotion>
    </circle>
  );
}

export function DependencyGraph({ liveEvents = [] }: { liveEvents?: any[] }) {
  const [blastResult, setBlastResult] = useState<BlastResult | null>(null);
  const [activeNodes, setActiveNodes] = useState<Set<string>>(new Set());
  const [analyzing,   setAnalyzing]   = useState(false);
  const [lastEventId, setLastEventId] = useState<string | null>(null);
  const [hovered,     setHovered]     = useState<string | null>(null);
  const prevLenRef = useRef(0);

  useEffect(() => {
    if (!liveEvents.length) return;
    const newest = liveEvents[0];
    if (!newest?.id || newest.id === lastEventId) return;
    if (liveEvents.length <= prevLenRef.current) return;
    prevLenRef.current = liveEvents.length;
    setLastEventId(newest.id);
    const srcMap: Record<string, string> = {
      Azure: "AzureDevOps", MuleSoft: "MuleSoftFlow", Jira: "JiraTracker",
      Zoho: "ZohoDesk", Salesforce: "SalesforceCRM", OrderAPI: "OrderAPI",
    };
    runBlast(srcMap[newest.source] ?? "OrderAPI", newest.sev, "#e05c5c");
  }, [liveEvents.length]);

  async function runBlast(source: string, sev: string, color: string) {
    setAnalyzing(true);
    const affected = BLAST_MAP[source] ?? ["order-api"];
    setActiveNodes(new Set(affected));
    try {
      const r = await fetch(`${BACKEND}/blast-radius`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, sev, summary: "", affectedNodes: affected }),
      });
      if (r.ok) { const data = await r.json(); setBlastResult({ ...data, color }); }
      else { setBlastResult(mockBlast(source, affected, sev, color)); }
    } catch { setBlastResult(mockBlast(source, affected, sev, color)); }
    setAnalyzing(false);
  }

  function mockBlast(source: string, affected: string[], sev: string, color?: string): BlastResult {
    const scene = BLAST_SCENARIOS[source]?.[sev];
    const fallback: Record<string, string> = {
      critical: "Critical failure propagating through the integration layer — downstream consumers affected.",
      warning:  "Degraded performance detected upstream. Downstream services accumulating backlog.",
      success:  "All systems healthy across the integration chain. No downstream impact.",
      info:     "Configuration change propagated. Downstream services unaffected.",
    };
    return {
      source, affectedNodes: affected, affectedCount: affected.length,
      prediction: scene?.prediction ?? fallback[sev] ?? fallback.info,
      severity: sev,
      confidence: scene?.confidence ?? (sev === "critical" ? 93 : sev === "warning" ? 82 : 88),
      detail: scene?.detail, color,
    };
  }

  function handleNodeClick(node: ServiceNode) {
    const src = NODE_SOURCE_MAP[node.id] ?? node.source;
    const sev = NODE_DEFAULT_SEV[node.id] ?? "warning";
    const col = NODE_COLOR_MAP[node.id]   ?? "#9b8ff5";
    const affected = BLAST_MAP[src] ?? [node.id];
    setActiveNodes(new Set(affected));
    setBlastResult(mockBlast(src, affected, sev, col));
  }

  const blastColor = blastResult?.color ?? "#9b8ff5";

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "var(--card)", border: "1px solid rgba(124,110,245,0.11)", boxShadow: "0 1px 4px rgba(124,110,245,0.06)" }}>

      <div className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid rgba(124,110,245,0.08)" }}>
        <div>
          <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
            <Zap className="h-4 w-4 text-[#9b8ff5]" />
            Integration Dependency Map
            {activeNodes.size > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse"
                style={{ background: `${blastColor}18`, color: blastColor }}>
                <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ background: blastColor }} />
                BLAST RADIUS · {activeNodes.size} services
              </span>
            )}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            9-service pipeline topology · click any node or simulate a chain reaction below
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeNodes.size > 0 && (
            <button onClick={() => { setActiveNodes(new Set()); setBlastResult(null); }}
              className="text-xs px-3 py-1.5 rounded-xl transition hover:bg-secondary"
              style={{ border: "1px solid rgba(124,110,245,0.15)", color: "var(--muted-foreground)" }}>
              Clear
            </button>
          )}
          {analyzing && (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "#9b8ff5" }}>
              <RefreshCw className="h-3 w-3 animate-spin" /> Analysing…
            </div>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4">
        <div className="relative rounded-xl overflow-hidden"
          style={{ background: "var(--background)", border: "1px solid rgba(124,110,245,0.08)" }}>
          <svg viewBox="0 0 720 420" style={{ width: "100%", display: "block" }}>
            <defs>
              <marker id="arr" markerWidth="7" markerHeight="7" refX="5" refY="2.5" orient="auto">
                <path d="M0,0 L0,5 L7,2.5 z" fill="rgba(124,110,245,0.35)" />
              </marker>
              <marker id="arr-a" markerWidth="7" markerHeight="7" refX="5" refY="2.5" orient="auto">
                <path d="M0,0 L0,5 L7,2.5 z" fill={blastColor} />
              </marker>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="glow-soft">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Column labels */}
            <text x="14"  y="20" fontSize="6.5" fill="rgba(124,110,245,0.35)" fontFamily="system-ui,sans-serif" fontWeight="700" letterSpacing="0.6">CI/CD &amp; TICKETING</text>
            <text x="192" y="20" fontSize="6.5" fill="rgba(124,110,245,0.35)" fontFamily="system-ui,sans-serif" fontWeight="700" letterSpacing="0.6">API &amp; OBSERVABILITY</text>
            <text x="377" y="20" fontSize="6.5" fill="rgba(124,110,245,0.35)" fontFamily="system-ui,sans-serif" fontWeight="700" letterSpacing="0.6">INTEGRATION LAYER</text>
            <text x="562" y="20" fontSize="6.5" fill="rgba(124,110,245,0.35)" fontFamily="system-ui,sans-serif" fontWeight="700" letterSpacing="0.6">DOWNSTREAM SYSTEMS</text>

            {/* Schema annotations when relevant nodes are active */}
            {(activeNodes.has("order-api") || activeNodes.has("mulesoft")) && (
              <>
                <text x="192" y="150" fontSize="7.5" fill="rgba(240,165,0,0.80)" fontFamily="system-ui,sans-serif" fontStyle="italic">⚠ schema v2.0 → v2.1</text>
                <text x="377" y="44"  fontSize="7.5" fill="rgba(224,92,92,0.80)"  fontFamily="system-ui,sans-serif" fontStyle="italic">✕ MULE:TRANSFORMATION line 47</text>
              </>
            )}

            {/* Edges */}
            {EDGES.map(edge => {
              const fn = NODES.find(n => n.id === edge.from)!;
              const tn = NODES.find(n => n.id === edge.to)!;
              const a  = nc(fn);
              const b  = nc(tn);
              const isActive = activeNodes.has(edge.from) && activeNodes.has(edge.to);
              const cpx = edge.cp ? edge.cp[0] : (a.cx + b.cx) / 2;
              const cpy = edge.cp ? edge.cp[1] : (a.cy + b.cy) / 2 - Math.abs(b.cy - a.cy) * 0.12;
              return (
                <g key={`${edge.from}-${edge.to}`}>
                  <path
                    id={`edge-${edge.from}-${edge.to}`}
                    d={`M ${a.cx} ${a.cy} Q ${cpx} ${cpy} ${b.cx} ${b.cy}`}
                    stroke={isActive ? blastColor : "rgba(124,110,245,0.20)"}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    fill="none"
                    markerEnd={isActive ? "url(#arr-a)" : "url(#arr)"}
                    strokeDasharray={isActive ? "none" : "4 3"}
                    style={{ filter: isActive ? "url(#glow)" : "none", transition: "all 0.35s ease" }}
                  />
                  <text x={cpx} y={cpy - 5} textAnchor="middle" fontSize="7"
                    fill={isActive ? `${blastColor}cc` : "rgba(124,110,245,0.38)"}
                    fontFamily="system-ui,sans-serif">
                    {edge.label}
                  </text>
                  {isActive && <PulseDot from={fn} to={tn} color={blastColor} />}
                </g>
              );
            })}

            {/* Nodes */}
            {NODES.map(node => {
              const isActive  = activeNodes.has(node.id);
              const isHovered = hovered === node.id;
              const col = isActive ? blastColor : node.color;
              const { cx, cy } = nc(node);
              return (
                <g key={node.id} style={{ cursor: "pointer" }}
                  onClick={() => handleNodeClick(node)}
                  onMouseEnter={() => setHovered(node.id)}
                  onMouseLeave={() => setHovered(null)}>
                  {isActive && (
                    <circle cx={cx} cy={cy} r={38} fill="none"
                      stroke={blastColor} strokeWidth="1.5" opacity="0.2"
                      style={{ filter: "url(#glow)" }}>
                      <animate attributeName="r"       values="32;42;32" dur="1.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.3;0.06;0.3" dur="1.8s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <rect x={node.x} y={node.y} width={115} height={58} rx={10}
                    fill={isActive ? `${blastColor}14` : isHovered ? `${node.color}0e` : "var(--card,#1e1a2e)"}
                    stroke={isActive ? blastColor : isHovered ? node.color : `${node.color}40`}
                    strokeWidth={isActive ? 2 : 1.5}
                    style={{ transition: "all 0.3s ease", filter: isActive ? "url(#glow-soft)" : "none" }}
                  />
                  {isActive && (
                    <circle cx={node.x + 108} cy={node.y + 9} r={5} fill={blastColor}>
                      <animate attributeName="opacity" values="1;0.2;1" dur="0.75s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {/* Brand colour strip */}
                  <rect x={node.x} y={node.y + 10} width={3} height={38} rx={1.5}
                    fill={isActive ? blastColor : node.color} opacity={isActive ? 1 : 0.7} />
                  <text x={node.x + 10} y={node.y + 23} fontSize="13" style={{ userSelect: "none" }}>{node.icon}</text>
                  <text x={node.x + 28} y={node.y + 22} fontSize="8.5" fontWeight="700"
                    fill={isActive ? blastColor : "var(--foreground,#f0ece8)"}
                    fontFamily="system-ui,sans-serif" style={{ transition: "fill 0.3s ease" }}>
                    {node.label}
                  </text>
                  <text x={node.x + 10} y={node.y + 36} fontSize="6.8"
                    fill={isActive ? `${blastColor}bb` : "rgba(150,140,200,0.60)"}
                    fontFamily="system-ui,sans-serif">
                    {node.sublabel}
                  </text>
                  <rect x={node.x + 10} y={node.y + 48} width={isActive ? 95 : 48} height={3.5} rx={1.75}
                    fill={isActive ? blastColor : `${node.color}50`}
                    style={{ transition: "all 0.5s ease" }} />
                </g>
              );
            })}

            {/* Legend */}
            <g transform="translate(0,402)">
              <circle cx={16}  cy={10} r={4} fill="rgba(124,110,245,0.40)" />
              <text   x={25}  y={14} fontSize="8" fill="rgba(124,110,245,0.50)" fontFamily="system-ui,sans-serif">normal flow</text>
              <circle cx={110} cy={10} r={4} fill={blastColor || "#e05c5c"} />
              <text   x={119} y={14} fontSize="8" fill="rgba(124,110,245,0.50)" fontFamily="system-ui,sans-serif">blast radius active</text>
              <text   x={270} y={14} fontSize="8" fill="rgba(124,110,245,0.35)" fontFamily="system-ui,sans-serif">click any node to trace →</text>
            </g>
          </svg>
        </div>

        {/* Blast result */}
        <AnimatePresence>
          {blastResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="rounded-xl p-4"
              style={{ background: `${blastColor}10`, border: `1px solid ${blastColor}35` }}>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${blastColor}20` }}>
                  <AlertTriangle className="h-4 w-4" style={{ color: blastColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold" style={{ color: blastColor }}>
                      AI Blast Radius · {blastResult.affectedCount} services in chain
                    </p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: `${blastColor}20`, color: blastColor }}>
                      {blastResult.confidence}% confidence
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {blastResult.affectedNodes.map(nid => {
                      const node = NODES.find(n => n.id === nid);
                      if (!node) return null;
                      return (
                        <span key={nid} className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md"
                          style={{ background: `${blastColor}14`, color: blastColor, border: `1px solid ${blastColor}30` }}>
                          {node.icon} {node.label}
                        </span>
                      );
                    })}
                  </div>
                  <p className="text-xs leading-5 mb-2" style={{ color: "var(--foreground)" }}>
                    {blastResult.prediction}
                  </p>
                  {blastResult.detail && (
                    <p className="text-[10px] font-mono px-2 py-1.5 rounded-lg leading-5"
                      style={{ color: blastColor, background: `${blastColor}10` }}>
                      {blastResult.detail}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!blastResult && !analyzing && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: "rgba(124,110,245,0.05)", border: "1px dashed rgba(124,110,245,0.15)" }}>
            <Activity className="h-4 w-4 shrink-0" style={{ color: "#9b8ff5" }} />
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              <strong style={{ color: "#9b8ff5" }}>Click any node</strong> to trace its blast radius — or simulate below. Each chain type fires in a distinct colour: red (critical), orange (latency), purple (payment), blue (monitoring), green (recovery).
            </p>
          </div>
        )}

        {/* Simulate buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold uppercase tracking-wide shrink-0"
            style={{ color: "var(--muted-foreground)" }}>
            Simulate:
          </span>
          {SIMULATIONS.map(({ src, sev, label, color }, i) => {
            const affected = BLAST_MAP[src] ?? [];
            return (
              <button key={i}
                onClick={() => { setActiveNodes(new Set(affected)); setBlastResult(mockBlast(src, affected, sev, color)); }}
                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg transition hover:opacity-80"
                style={{ background: `${color}12`, border: `1px solid ${color}35`, color }}>
                <ChevronRight className="h-2.5 w-2.5" />{label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
