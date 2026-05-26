import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, AlertTriangle, Activity, RefreshCw, ChevronRight } from "lucide-react";

const BACKEND = (import.meta as any).env?.VITE_BACKEND_URL || "http://localhost:3001";

// ── Service-flow nodes ────────────────────────────────────────────────────────
interface ServiceNode {
  id:       string;
  label:    string;
  sublabel: string;
  x: number; y: number;
  color: string;
  icon:  string;
  source: string;
}

// viewBox: 0 0 650 370   node size: 110 × 60
const NODES: ServiceNode[] = [
  // col 1 — deployment triggers
  { id: "azure-deploy",   label: "Release Pipeline",  sublabel: "Azure DevOps · CI/CD",      x: 15,  y: 80,  color: "#52b788", icon: "🚀", source: "AzureDeploy"  },
  { id: "jira-tracker",   label: "MULE-2391",          sublabel: "Jira · Deployment ticket",   x: 15,  y: 235, color: "#4da8da", icon: "📋", source: "JiraTracker"  },
  // col 2 — origin service
  { id: "order-api",      label: "p-orders-mb-api",   sublabel: "Order API · v2.1 schema",    x: 195, y: 158, color: "#f0a500", icon: "🛒", source: "OrderAPI"     },
  // col 3 — integration orchestration
  { id: "mulesoft-flow",  label: "MB-005 Flow",        sublabel: "MuleSoft · DataWeave xform", x: 363, y: 65,  color: "#e05c5c", icon: "⚡", source: "MuleSoftFlow" },
  { id: "oms-service",    label: "OMS Fulfilment",     sublabel: "OMNIX · Order routing",      x: 363, y: 238, color: "#e05c5c", icon: "🏭", source: "OMSService"   },
  // col 4 — downstream consumers
  { id: "salesforce-crm", label: "CRM Sync API",       sublabel: "s-salesforce-mb-api",        x: 510, y: 115, color: "#9b8ff5", icon: "☁️", source: "SalesforceCRM"},
  { id: "zoho-desk",      label: "Zoho Desk",          sublabel: "Support · ticket spike",      x: 510, y: 268, color: "#f0a500", icon: "🎫", source: "ZohoDesk"     },
];

// node centre helpers (cx = x + 55,  cy = y + 30)
function nc(n: ServiceNode) { return { cx: n.x + 55, cy: n.y + 30 }; }

// ── Directed edges ────────────────────────────────────────────────────────────
const EDGES: Array<{ from: string; to: string; label: string }> = [
  { from: "azure-deploy",   to: "order-api",      label: "Release-149"    },
  { from: "jira-tracker",   to: "order-api",      label: "triggers deploy" },
  { from: "order-api",      to: "mulesoft-flow",  label: "payload v2.1"   },
  { from: "order-api",      to: "oms-service",    label: "order events"   },
  { from: "mulesoft-flow",  to: "salesforce-crm", label: "CRM sync"       },
  { from: "mulesoft-flow",  to: "zoho-desk",      label: "routes tickets" },
  { from: "oms-service",    to: "zoho-desk",      label: "failures → tix" },
];

// ── Blast radius map ──────────────────────────────────────────────────────────
const BLAST_MAP: Record<string, string[]> = {
  AzureDeploy:   ["azure-deploy", "order-api", "mulesoft-flow", "oms-service", "salesforce-crm", "zoho-desk"],
  JiraTracker:   ["jira-tracker", "order-api"],
  OrderAPI:      ["order-api", "mulesoft-flow", "oms-service", "salesforce-crm", "zoho-desk"],
  MuleSoftFlow:  ["mulesoft-flow", "oms-service", "salesforce-crm", "zoho-desk"],
  OMSService:    ["oms-service", "zoho-desk"],
  SalesforceCRM: ["salesforce-crm", "zoho-desk"],
  ZohoDesk:      ["zoho-desk"],
};

// ── Per-source blast scenarios ────────────────────────────────────────────────
const BLAST_SCENARIOS: Record<string, Record<string, { prediction: string; confidence: number; detail: string }>> = {
  AzureDeploy: {
    critical: {
      prediction: "Release-149 introduced a breaking payload schema change to p-orders-mb-api (orderLines → lineItems field rename) without a downstream integration review gate. MuleSoft DataWeave transform MB-005 still references the legacy field name — all order routing is now failing with MULE:TRANSFORMATION errors. Recommend immediate rollback or emergency hotfix to the DataWeave script at line 47.",
      confidence: 97,
      detail: "Deploy: Release-149 · 14:02 UTC · Jira: MULE-2391 · schema: v2.0→v2.1 · gate missed: integration-contract-check",
    },
    warning: {
      prediction: "Release-149 is queued for deployment. Pre-deploy contract validation found 2 downstream MuleSoft flows still referencing the legacy orderLines schema field. Deploy should be held pending DataWeave transform update to avoid a transformation cascade failure.",
      confidence: 88,
      detail: "Deploy hold: 2 transform references unresolved · MB-005 · MB-019 · estimated fix: 45 min",
    },
    success: {
      prediction: "Release-149 deployed cleanly. All MuleSoft DataWeave transforms validated against the updated p-orders-mb-api v2.1 schema before deploy. OMS, Salesforce CRM, and Zoho Desk all confirmed healthy post-deploy. No ticket spike detected.",
      confidence: 99,
      detail: "Deploy time: 3m 51s · integration gates: all passed · schema contract tests: 14/14 green",
    },
    info: {
      prediction: "Azure DevOps release pipeline configuration updated. New integration contract validation gate added to the deployment checklist — downstream MuleSoft schema compatibility will now be checked automatically on every Order API release.",
      confidence: 92,
      detail: "Gate added: integration-contract-check · enforced on: p-orders-mb-api · effective: next release",
    },
  },

  JiraTracker: {
    warning: {
      prediction: "MULE-2391 was closed without the mandatory 'downstream integration reviewed' checklist item being marked complete. This ticket approved the Release-149 deployment that contained the breaking schema change. An audit flag has been raised for the sprint retrospective.",
      confidence: 91,
      detail: "MULE-2391 · Sprint 47 · closed by: Arun Patel · missing gate: integration-contract-check",
    },
    critical: {
      prediction: "MULE-2391 Jira webhook is not delivering status updates to the Order API deployment pipeline. Release-149 cannot auto-close the deployment gate — CI/CD pipeline is blocked awaiting Jira confirmation. Manual unblock required.",
      confidence: 85,
      detail: "Webhook failures: 7 · last delivery: 41m ago · pipeline: blocked at gate 3/5",
    },
    info: {
      prediction: "MULE-2391 updated with post-incident RCA findings. Root cause documented: schema change deployed without integration contract review. Prevention measures added as subtasks for the next sprint.",
      confidence: 88,
      detail: "MULE-2391 · status: RCA Complete · subtasks added: 4 · next sprint: prevention measures",
    },
  },

  OrderAPI: {
    critical: {
      prediction: "p-orders-mb-api v2.1 schema change has broken all 3 downstream consumers. MuleSoft MB-005 DataWeave transform is throwing MULE:TRANSFORMATION on every order event — 'field not found: orderLines'. OMS fulfilment queue blocked with 67 orders. Salesforce CRM sync halted. Checkout abandonment rate up 38%. Rollback or DataWeave hotfix required immediately.",
      confidence: 95,
      detail: "Error rate: 100% on /api/orders · schema: v2.1 (lineItems) · consumers broken: 3/3 · orders blocked: 67",
    },
    warning: {
      prediction: "p-orders-mb-api p95 latency at 2.3s — above the 1.5s SLA. MuleSoft MB-005 flow showing increased transformation processing time. OMS fulfilment queue growing. Salesforce CRM sync accumulating a 6-minute backlog. Checkout is functional but degraded.",
      confidence: 86,
      detail: "p95: 2.3s · p99: 4.8s · OMS queue depth: 14 · Salesforce lag: 6min",
    },
    success: {
      prediction: "p-orders-mb-api fully healthy post-incident recovery. DataWeave transform MB-005 hotfixed — all 67 blocked OMS orders replayed from the dead-letter queue. Salesforce CRM backfilled with 847 stale records. Zoho Desk ticket creation rate returned to baseline.",
      confidence: 99,
      detail: "Recovery complete · 67 orders replayed · 847 SF records backfilled · checkout error rate: 0%",
    },
  },

  MuleSoftFlow: {
    critical: {
      prediction: "MB-005 Order→OMS integration flow is in FAILED state. DataWeave transformation at line 47 throws MULE:TRANSFORMATION — 'payload.orderLines[0]' not found in the updated v2.1 schema. Circuit breaker opened after 8 consecutive failures. All downstream order routing to OMS and Salesforce CRM sync are blocked. Manual fix: update DataWeave script reference from 'orderLines' to 'lineItems'.",
      confidence: 96,
      detail: "Flow: MB-005 · error: MULE:TRANSFORMATION line 47 · circuit breaker: OPEN · failures: 67 · queue: dead-letter",
    },
    warning: {
      prediction: "MB-005 flow processing latency elevated — DataWeave transformation time has increased 3× in the last 15 minutes. OMS routing is processing but accumulating a backlog. Salesforce CRM sync running 8 minutes behind. Schema field ambiguity in the transform may be causing repeated re-parsing.",
      confidence: 84,
      detail: "Transform time: avg 2.1s (baseline: 0.7s) · OMS queue: 23 pending · SF lag: 8min",
    },
    success: {
      prediction: "MB-005 DataWeave transform patched — field reference updated from 'payload.orderLines[0]' to 'payload.lineItems[0]'. Flow restarted cleanly. Dead-letter queue replay triggered — all 67 blocked orders are now routing to OMS. Salesforce CRM sync has resumed.",
      confidence: 98,
      detail: "Hotfix: DataWeave line 47 · flow restarted: 14:38 UTC · DLQ replay: 67/67 processed · SF sync: resumed",
    },
    info: {
      prediction: "MB-005 flow configuration reviewed. DataWeave schema validation added as a pre-flight check — transformation will now fail-fast with a clear error message if the Order API schema version does not match the expected contract.",
      confidence: 87,
      detail: "Config updated: schema validation added · contract version pinned: v2.1 · alert on mismatch: enabled",
    },
  },

  OMSService: {
    critical: {
      prediction: "OMNIX OMS fulfilment queue is blocked. 67 order events are stuck in the dead-letter queue — no routing events are being received from MuleSoft MB-005 following the DataWeave transformation failure. Warehouse pick-and-pack operations have no new orders. Customer order confirmations are failing, directly driving the Zoho Desk ticket spike.",
      confidence: 93,
      detail: "OMS queue: 67 orders blocked · DLQ depth: 67 · warehouse: idle · customer impact: order confirmation failure",
    },
    warning: {
      prediction: "OMNIX OMS receiving order routing events intermittently. 14 orders queued with delayed processing — average fulfilment delay now 18 minutes above SLA. Despatching team has been manually reviewing the queue. MuleSoft flow intermittent failures are the upstream cause.",
      confidence: 82,
      detail: "Queue depth: 14 · processing delay: +18min vs SLA · manual review: active",
    },
    success: {
      prediction: "OMNIX OMS fulfilment queue fully recovered. All 67 blocked orders replayed successfully from the MuleSoft dead-letter queue. Warehouse operations have resumed normal throughput. No orders were lost — all customers will receive their original confirmation.",
      confidence: 99,
      detail: "DLQ replay: 67/67 success · warehouse throughput: normal · no orders lost · SLA: recovering",
    },
  },

  SalesforceCRM: {
    critical: {
      prediction: "s-salesforce-mb-api CRM sync has halted. Order events are not reaching Salesforce because the upstream MuleSoft MB-005 transformation is failing. 847 order records have not been updated in the last 2 hours. Sales dashboards showing incorrect pipeline figures. Revenue reporting is stale. Billing integration may produce incorrect invoices if not resolved.",
      confidence: 91,
      detail: "Sync halted: 14:06 UTC · records stale: 847 · pipeline delta: £142K unreported · billing risk: active",
    },
    warning: {
      prediction: "Salesforce CRM sync running 12 minutes behind due to upstream MuleSoft latency. 142 order records are queued for update. API rate limit currently at 71% of daily allocation. Revenue figures will reconcile automatically once the upstream flow normalises — no manual action required yet.",
      confidence: 86,
      detail: "Sync lag: 12min · queued records: 142 · API usage: 71,200/100,000 · rate cap risk: 3h",
    },
    success: {
      prediction: "Salesforce CRM sync fully recovered. 847 stale records backfilled via manual sync trigger. Pipeline reporting and revenue dashboards now accurate. Zoho Desk open tickets linked to the affected orders have been updated with resolution notes automatically.",
      confidence: 99,
      detail: "Backfill: 847/847 records · sync latency: 0.3s · API rate: 28% used · dashboards: accurate",
    },
    info: {
      prediction: "Salesforce API rate limit at 54% of daily allocation — well within threshold. CRM sync operating normally. 312 order records updated in the last hour. No action required.",
      confidence: 94,
      detail: "API calls: 54,200/100,000 · last sync: 2min ago · record match: 100% · zero conflicts",
    },
  },

  ZohoDesk: {
    critical: {
      prediction: "Zoho Desk is experiencing a 340% ticket spike. 31 new 'Order not confirmed' tickets created in the last 45 minutes — all classified Urgent by the Groq AI pipeline with urgency scores 88–95. The Mulberry and Clarks accounts have both breached their SLA response window. The ticket surge is a direct downstream symptom of the OMS fulfilment failure caused by the MuleSoft schema mismatch.",
      confidence: 94,
      detail: "Ticket spike: 31 in 45min (+340% baseline) · urgency avg: 91/100 · SLA breach: 2 accounts · cause: OMS block",
    },
    warning: {
      prediction: "Zoho Desk ticket volume elevated — 12 new checkout-related tickets in the last 30 minutes, 2× above baseline. AI classification is routing all to Platform Engineering. Response time SLAs are at 68% utilisation. If the upstream OMS failure is not resolved within 30 minutes, SLA breach becomes likely.",
      confidence: 81,
      detail: "Tickets: 12 in 30min (+100% baseline) · SLA utilisation: 68% · breach window: 30min",
    },
    success: {
      prediction: "Zoho Desk ticket volume has returned to baseline. The 31 incident tickets have been auto-resolved by the pipeline with a root cause explanation drafted by Groq AI. Customer communications have been sent to all affected accounts. Post-incident review ticket created in Jira.",
      confidence: 98,
      detail: "31 tickets resolved · auto-response sent: 31/31 · Jira PIR: MULE-2394 · ticket rate: baseline",
    },
    info: {
      prediction: "Zoho Desk operating normally. AI pipeline classifying and routing tickets within SLA. Current open ticket count: 7. Average Groq urgency score: 64/100. No unusual patterns detected.",
      confidence: 96,
      detail: "Open: 7 · avg urgency: 64 · SLA compliance: 97.4% · pipeline: live",
    },
  },
};

interface BlastResult {
  source:        string;
  affectedNodes: string[];
  affectedCount: number;
  prediction:    string;
  severity:      string;
  confidence:    number;
  detail?:       string;
}

// ── Animated pulse dot along edge ────────────────────────────────────────────
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
  const [blastResult,  setBlastResult]  = useState<BlastResult | null>(null);
  const [activeNodes,  setActiveNodes]  = useState<Set<string>>(new Set());
  const [analyzing,    setAnalyzing]    = useState(false);
  const [lastEventId,  setLastEventId]  = useState<string | null>(null);
  const [hovered,      setHovered]      = useState<string | null>(null);
  const prevLenRef = useRef(0);

  // Auto-trigger on new live event
  useEffect(() => {
    if (!liveEvents.length) return;
    const newest = liveEvents[0];
    if (!newest?.id || newest.id === lastEventId) return;
    if (liveEvents.length <= prevLenRef.current) return;
    prevLenRef.current = liveEvents.length;
    setLastEventId(newest.id);
    // Map generic event sources to our node sources
    const srcMap: Record<string, string> = {
      Azure:      "AzureDeploy",
      MuleSoft:   "MuleSoftFlow",
      Jira:       "JiraTracker",
      Zoho:       "ZohoDesk",
      Salesforce: "SalesforceCRM",
      OrderAPI:   "OrderAPI",
    };
    const mappedSrc = srcMap[newest.source] ?? "OrderAPI";
    runBlastRadius(mappedSrc, newest.sev, newest.summary);
  }, [liveEvents.length]);

  async function runBlastRadius(source: string, sev: string, summary: string) {
    setAnalyzing(true);
    const affected = BLAST_MAP[source] ?? ["order-api"];
    setActiveNodes(new Set(affected));
    try {
      const r = await fetch(`${BACKEND}/blast-radius`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ source, sev, summary, affectedNodes: affected }),
      });
      if (r.ok) {
        const data = await r.json();
        setBlastResult(data);
      } else {
        setBlastResult(mockBlast(source, affected, sev));
      }
    } catch {
      setBlastResult(mockBlast(source, affected, sev));
    }
    setAnalyzing(false);
  }

  function mockBlast(source: string, affected: string[], sev: string): BlastResult {
    const scene = BLAST_SCENARIOS[source]?.[sev];
    const fallback: Record<string, string> = {
      critical: "Critical failure propagating through the integration layer — downstream consumers are affected. Immediate investigation required.",
      warning:  "Degraded performance detected upstream. Downstream services are accumulating backlog.",
      success:  "All systems healthy across the integration chain. No downstream impact detected.",
      info:     "Configuration change propagated. Downstream services unaffected.",
    };
    return {
      source,
      affectedNodes: affected,
      affectedCount: affected.length,
      prediction: scene?.prediction ?? fallback[sev] ?? fallback.info,
      severity:   sev,
      confidence: scene?.confidence ?? (sev === "critical" ? 93 : sev === "warning" ? 82 : 88),
      detail:     scene?.detail,
    };
  }

  const NODE_SOURCE_MAP: Record<string, string> = {
    "azure-deploy":   "AzureDeploy",
    "jira-tracker":   "JiraTracker",
    "order-api":      "OrderAPI",
    "mulesoft-flow":  "MuleSoftFlow",
    "oms-service":    "OMSService",
    "salesforce-crm": "SalesforceCRM",
    "zoho-desk":      "ZohoDesk",
  };

  const NODE_DEFAULT_SEV: Record<string, string> = {
    "azure-deploy":   "critical",
    "jira-tracker":   "warning",
    "order-api":      "critical",
    "mulesoft-flow":  "critical",
    "oms-service":    "critical",
    "salesforce-crm": "warning",
    "zoho-desk":      "critical",
  };

  function handleNodeClick(node: ServiceNode) {
    const src = NODE_SOURCE_MAP[node.id] ?? node.source;
    const sev = NODE_DEFAULT_SEV[node.id] ?? "warning";
    const affected = BLAST_MAP[src] ?? [node.id];
    setActiveNodes(new Set(affected));
    setBlastResult(mockBlast(src, affected, sev));
  }

  const sevColor: Record<string, string> = {
    critical: "#e05c5c", warning: "#f0a500", success: "#52b788", info: "#4da8da",
  };
  const blastColor = blastResult ? (sevColor[blastResult.severity] ?? "#9b8ff5") : "#9b8ff5";

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "var(--card)", border: "1px solid rgba(124,110,245,0.11)", boxShadow: "0 1px 4px rgba(124,110,245,0.06)" }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid rgba(124,110,245,0.08)" }}>
        <div>
          <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
            <Zap className="h-4 w-4 text-[#9b8ff5]" />
            Integration Flow Dependency Map
            {activeNodes.size > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse"
                style={{ background: `${blastColor}18`, color: blastColor }}>
                <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ background: blastColor }} />
                BLAST RADIUS ACTIVE
              </span>
            )}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Service-flow topology · schema mismatch origin · click any node to trace AI blast radius
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

        {/* ── SVG graph ── */}
        <div className="relative rounded-xl overflow-hidden"
          style={{ background: "var(--background)", border: "1px solid rgba(124,110,245,0.08)" }}>
          <svg viewBox="0 0 650 375" style={{ width: "100%", display: "block" }}>
            <defs>
              <marker id="arr"  markerWidth="7" markerHeight="7" refX="5" refY="2.5" orient="auto">
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

            {/* ── Faint schema-change annotation ── */}
            <text x="195" y="148" fontSize="7.5" fill="rgba(240,165,0,0.55)" fontFamily="system-ui,sans-serif" fontStyle="italic">
              ⚠ schema v2.0 → v2.1
            </text>
            <text x="363" y="55" fontSize="7.5" fill="rgba(224,92,92,0.55)" fontFamily="system-ui,sans-serif" fontStyle="italic">
              ✕ MULE:TRANSFORMATION line 47
            </text>

            {/* ── Edges ── */}
            {EDGES.map(edge => {
              const fn = NODES.find(n => n.id === edge.from)!;
              const tn = NODES.find(n => n.id === edge.to)!;
              const a  = nc(fn);
              const b  = nc(tn);
              const isActive = activeNodes.has(edge.from) && activeNodes.has(edge.to);
              const mx = (a.cx + b.cx) / 2;
              const my = (a.cy + b.cy) / 2;
              // Slight curve for aesthetics
              const dx = b.cx - a.cx;
              const dy = b.cy - a.cy;
              const cpx = mx;
              const cpy = my - Math.abs(dy) * 0.12;
              return (
                <g key={`${edge.from}-${edge.to}`}>
                  <path
                    id={`edge-${edge.from}-${edge.to}`}
                    d={`M ${a.cx} ${a.cy} Q ${cpx} ${cpy} ${b.cx} ${b.cy}`}
                    stroke={isActive ? blastColor : "rgba(124,110,245,0.22)"}
                    strokeWidth={isActive ? 2 : 1.5}
                    fill="none"
                    markerEnd={isActive ? "url(#arr-a)" : "url(#arr)"}
                    strokeDasharray={isActive ? "none" : "4 3"}
                    style={{ filter: isActive ? "url(#glow)" : "none", transition: "all 0.35s ease" }}
                  />
                  <text x={mx} y={my - 7} textAnchor="middle" fontSize="7.5"
                    fill={isActive ? `${blastColor}cc` : "rgba(124,110,245,0.42)"}
                    fontFamily="system-ui,sans-serif">
                    {edge.label}
                  </text>
                  {isActive && <PulseDot from={fn} to={tn} color={blastColor} />}
                </g>
              );
            })}

            {/* ── Nodes ── */}
            {NODES.map(node => {
              const isActive  = activeNodes.has(node.id);
              const isHovered = hovered === node.id;
              const col       = isActive ? blastColor : node.color;
              const { cx, cy } = nc(node);

              return (
                <g key={node.id} style={{ cursor: "pointer" }}
                  onClick={() => handleNodeClick(node)}
                  onMouseEnter={() => setHovered(node.id)}
                  onMouseLeave={() => setHovered(null)}>

                  {/* pulse ring */}
                  {isActive && (
                    <circle cx={cx} cy={cy} r={38} fill="none"
                      stroke={blastColor} strokeWidth="1.5" opacity="0.25"
                      style={{ filter: "url(#glow)" }}>
                      <animate attributeName="r"       values="32;42;32" dur="1.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.3;0.08;0.3" dur="1.8s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* card */}
                  <rect x={node.x} y={node.y} width={110} height={60} rx={10}
                    fill={isActive ? `${blastColor}14` : isHovered ? `${node.color}10` : "var(--card,#1e1a2e)"}
                    stroke={isActive ? blastColor : isHovered ? node.color : `${node.color}45`}
                    strokeWidth={isActive ? 2 : 1.5}
                    style={{ transition: "all 0.3s ease", filter: isActive ? "url(#glow-soft)" : "none" }}
                  />

                  {/* severity dot */}
                  {isActive && (
                    <circle cx={node.x + 102} cy={node.y + 8} r={5} fill={blastColor}>
                      <animate attributeName="opacity" values="1;0.2;1" dur="0.75s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* icon */}
                  <text x={node.x + 8} y={node.y + 22} fontSize="13" style={{ userSelect: "none" }}>
                    {node.icon}
                  </text>

                  {/* label */}
                  <text x={node.x + 26} y={node.y + 21} fontSize="8.5" fontWeight="700"
                    fill={isActive ? blastColor : "var(--foreground,#f0ece8)"}
                    fontFamily="system-ui,sans-serif"
                    style={{ transition: "fill 0.3s ease" }}>
                    {node.label}
                  </text>

                  {/* sublabel */}
                  <text x={node.x + 8} y={node.y + 36} fontSize="7"
                    fill={isActive ? `${blastColor}bb` : "rgba(150,140,200,0.65)"}
                    fontFamily="system-ui,sans-serif">
                    {node.sublabel}
                  </text>

                  {/* status bar */}
                  <rect x={node.x + 8} y={node.y + 49}
                    width={isActive ? 94 : 47} height={4} rx={2}
                    fill={isActive ? blastColor : `${node.color}55`}
                    style={{ transition: "all 0.5s ease" }}
                  />
                </g>
              );
            })}

            {/* ── Flow label annotations ── */}
            <text x="118" y="175" fontSize="7" fill="rgba(124,110,245,0.35)" fontFamily="system-ui,sans-serif">Deploy trigger</text>
            <text x="118" y="245" fontSize="7" fill="rgba(77,168,218,0.35)" fontFamily="system-ui,sans-serif">Jira gate</text>

            {/* ── Legend ── */}
            <g transform="translate(0,350)">
              <circle cx={16} cy={10} r={4} fill="rgba(124,110,245,0.45)" />
              <text x={25} y={14} fontSize="8" fill="rgba(124,110,245,0.55)" fontFamily="system-ui,sans-serif">normal flow</text>
              <circle cx={100} cy={10} r={4} fill={blastColor || "#e05c5c"} />
              <text x={109} y={14} fontSize="8" fill="rgba(124,110,245,0.55)" fontFamily="system-ui,sans-serif">blast radius</text>
              <text x={230} y={14} fontSize="8" fill="rgba(124,110,245,0.38)" fontFamily="system-ui,sans-serif">click any node to trace →</text>
            </g>
          </svg>
        </div>

        {/* ── Blast Radius Result Card ── */}
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
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold" style={{ color: blastColor }}>
                      AI Blast Radius · {blastResult.affectedCount} services affected
                    </p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: `${blastColor}20`, color: blastColor }}>
                      {blastResult.confidence}% confidence
                    </span>
                  </div>

                  {/* Affected chips */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
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
                    <p className="text-[10px] font-mono px-2 py-1 rounded-lg"
                      style={{ color: blastColor, background: `${blastColor}10`, opacity: 0.9 }}>
                      {blastResult.detail}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Empty state ── */}
        {!blastResult && !analyzing && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: "rgba(124,110,245,0.05)", border: "1px dashed rgba(124,110,245,0.15)" }}>
            <Activity className="h-4 w-4 shrink-0" style={{ color: "#9b8ff5" }} />
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              <strong style={{ color: "#9b8ff5" }}>Click any node</strong> to run AI blast radius analysis — the graph traces how a deployment-triggered schema mismatch cascades from Order API through MuleSoft transforms to OMS, Salesforce CRM, and Zoho Desk ticket spikes.
            </p>
          </div>
        )}

        {/* ── Simulate row ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold uppercase tracking-wide shrink-0"
            style={{ color: "var(--muted-foreground)" }}>
            Simulate:
          </span>
          {([
            { src: "AzureDeploy",   sev: "critical", label: "Schema Deploy"    },
            { src: "MuleSoftFlow",  sev: "critical", label: "Transform Fail"   },
            { src: "OrderAPI",      sev: "critical", label: "Order API 500"    },
            { src: "OMSService",    sev: "critical", label: "OMS Blocked"      },
            { src: "SalesforceCRM", sev: "warning",  label: "CRM Degraded"     },
            { src: "ZohoDesk",      sev: "critical", label: "Ticket Spike"     },
            { src: "AzureDeploy",   sev: "success",  label: "Recovery Deploy"  },
          ] as const).map(({ src, sev, label }, i) => {
            const col = sev === "critical" ? "#e05c5c" : sev === "warning" ? "#f0a500" : "#52b788";
            const affected = BLAST_MAP[src] ?? [];
            return (
              <button key={i}
                onClick={() => { setActiveNodes(new Set(affected)); setBlastResult(mockBlast(src, affected, sev)); }}
                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg transition hover:opacity-80"
                style={{ background: `${col}12`, border: `1px solid ${col}35`, color: col }}>
                <ChevronRight className="h-2.5 w-2.5" />{label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
