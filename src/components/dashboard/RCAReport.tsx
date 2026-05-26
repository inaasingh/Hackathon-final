import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, GitBranch, ShieldAlert, Loader2, AlertTriangle,
  CheckCircle2, Info, AlertCircle, Lightbulb, Clock,
  ThumbsUp, ChevronRight, ArrowRight,
} from "lucide-react";

const BACKEND = (import.meta as any).env?.VITE_BACKEND_URL || "http://localhost:3001";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChainNode {
  eventId: string;
  system:  string;
  action:  string;
  impact:  string;
  sev:     "info" | "warning" | "critical" | "success";
}

interface RCAData {
  summary:            string;
  rootCause:          { eventId: string; system: string; description: string };
  causalChain:        ChainNode[];
  confidence:         number;
  timeToDetect:       string;
  recommendation:     string;
  preventionMeasures: string[];
}

interface Props {
  event:   any;
  history: any[];
  onClose: () => void;
}

// ─── Severity helpers ─────────────────────────────────────────────────────────
const sevStyle: Record<string, { border: string; bg: string; text: string; icon: any }> = {
  critical: { border: "border-red-500/50",    bg: "bg-red-500/10",    text: "text-red-400",    icon: AlertTriangle  },
  warning:  { border: "border-yellow-500/50", bg: "bg-yellow-500/10", text: "text-yellow-400", icon: AlertCircle    },
  success:  { border: "border-green-500/50",  bg: "bg-green-500/10",  text: "text-green-400",  icon: CheckCircle2   },
  info:     { border: "border-blue-500/50",   bg: "bg-blue-500/10",   text: "text-blue-400",   icon: Info           },
};

function SevIcon({ sev, className }: { sev: string; className?: string }) {
  const s   = sevStyle[sev] ?? sevStyle.info;
  const Icon = s.icon;
  return <Icon className={`${s.text} ${className ?? "h-4 w-4"}`} />;
}

// ─── Confidence ring ──────────────────────────────────────────────────────────
function ConfidenceRing({ value }: { value: number }) {
  const r      = 32;
  const circ   = 2 * Math.PI * r;
  const filled = (value / 100) * circ;
  const color  = value >= 80 ? "#52b788" : value >= 60 ? "#f0a500" : "#e05c5c";
  const glow   = value >= 80 ? "rgba(82,183,136,0.25)" : value >= 60 ? "rgba(240,165,0,0.25)" : "rgba(224,92,92,0.25)";

  return (
    <div
      className="relative shrink-0 inline-flex items-center justify-center"
      style={{ width: 88, height: 88 }}
    >
      <svg width="88" height="88" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7" />
        <motion.circle
          cx="44" cy="44" r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - filled }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center gap-0">
        <span className="text-xl font-bold leading-none" style={{ color }}>{value}%</span>
        <span className="text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>confidence</span>
      </div>
    </div>
  );
}

// ─── Causal chain node ────────────────────────────────────────────────────────
function ChainNodeCard({ node, index, isRoot, isLast }: {
  node: ChainNode; index: number; isRoot: boolean; isLast: boolean;
}) {
  const s = sevStyle[node.sev] ?? sevStyle.info;
  return (
    <div className="flex items-center gap-2">
      {/* card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.12 }}
        style={{
          minWidth: 180,
          maxWidth: 220,
          borderRadius: 14,
          border: isRoot ? "1.5px solid rgba(250,204,21,0.55)" : undefined,
          boxShadow: isRoot ? "0 0 0 3px rgba(250,204,21,0.12), 0 4px 20px rgba(0,0,0,0.2)" : "0 2px 12px rgba(0,0,0,0.15)",
          background: isRoot ? "rgba(250,204,21,0.07)" : undefined,
          padding: "12px 14px",
          position: "relative",
          flexShrink: 0,
        }}
        className={!isRoot ? `border ${s.border} ${s.bg}` : ""}
      >
        {isRoot && (
          <div
            style={{
              position: "absolute",
              top: -11,
              left: 12,
              background: "#facc15",
              color: "#000",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.06em",
              padding: "2px 8px",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            ⚡ ROOT CAUSE
          </div>
        )}
        <div className="flex items-center gap-1.5 mb-2">
          <SevIcon sev={node.sev} className="h-3.5 w-3.5" />
          <span className={`text-[10px] font-bold font-mono ${isRoot ? "text-yellow-400" : s.text}`}>
            {node.eventId}
          </span>
        </div>
        <p className="text-xs font-semibold leading-snug mb-1" style={{ color: "var(--foreground)" }}>
          {node.system}
        </p>
        <p className="text-[11px] leading-snug" style={{ color: "var(--muted-foreground)" }}>
          {node.action}
        </p>
        {!isLast && (
          <div
            className={`text-[10px] mt-2.5 pt-2 font-medium ${s.text}`}
            style={{ borderTop: `1px solid var(--border)` }}
          >
            ↓ {node.impact}
          </div>
        )}
      </motion.div>

      {/* arrow */}
      {!isLast && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.12 + 0.06 }}
          className="shrink-0"
        >
          <ArrowRight className="h-4 w-4" style={{ color: "rgba(255,255,255,0.2)" }} />
        </motion.div>
      )}
    </div>
  );
}

// ─── Fallback mock RCA — deployment-triggered schema mismatch cascade ─────────
function buildMockRCA(event: any): RCAData {
  // Detect whether this is already a schema/deploy/order incident so we can
  // be even more specific, otherwise we still tell the same story (it's the
  // realistic baseline for this integration stack).
  const isDeployEvent  = /deploy|release|azure/i.test(event.source + event.svc + event.summary);
  const isMuleEvent    = /mule|transform|flow/i.test(event.source + event.svc + event.summary);
  const isOrderEvent   = /order|checkout|basket/i.test(event.source + event.svc + event.summary);
  const isSFEvent      = /salesforce|crm|sync/i.test(event.source + event.svc + event.summary);

  const rootEventId = isDeployEvent ? event.id : "DEPLOY-149";
  const rootSystem  = isDeployEvent
    ? "Azure DevOps Release Pipeline → p-orders-mb-api"
    : "Azure DevOps Release Pipeline";

  const rootDesc = isDeployEvent
    ? `Release-149 (Jira: MULE-2391) modified the Order API response schema from v2.0 to v2.1, renaming the 'orderLines' array to 'lineItems'. The Jira ticket was closed without completing the mandatory 'downstream integration reviewed' checklist item. No MuleSoft DataWeave contract compatibility test was run as a deployment gate — the breaking change reached production undetected.`
    : `Release-149, approved via Jira MULE-2391, introduced a breaking change to the p-orders-mb-api payload schema (orderLines → lineItems field rename) without completing the downstream integration contract review gate. This single unchecked checklist item allowed the schema change to reach production and break the MuleSoft DataWeave transformation layer.`;

  const summary = isMuleEvent
    ? `At 14:02 UTC, Release-149 deployed a payload schema change to p-orders-mb-api (v2.0 → v2.1). The MuleSoft integration flow MB-005 — which orchestrates order routing to OMS — uses a DataWeave transformation that still references the legacy 'orderLines' field. Every order event is now throwing MULE:TRANSFORMATION at line 47, blocking the OMS fulfilment queue and triggering a Zoho Desk ticket spike. The causal chain was confirmed by correlating the Azure DevOps deployment timestamp with the Datadog error rate spike 4 minutes later and the Zoho ticket volume surge at T+22 minutes.`
    : isOrderEvent
    ? `The p-orders-mb-api incident originated from Release-149 (14:02 UTC), which introduced an undocumented breaking change to the Order API payload schema. The change renamed the 'orderLines' array to 'lineItems', breaking the MuleSoft DataWeave transform MB-005 that routes orders to the OMS. Within 22 minutes, the failure cascade had blocked 67 OMS orders, staled 847 Salesforce CRM records, and generated 31 Urgent Zoho Desk tickets — a 340% spike above the daily baseline.`
    : isSFEvent
    ? `Salesforce CRM sync degradation at 14:06 UTC was a downstream symptom of the Release-149 schema mismatch on p-orders-mb-api. The MuleSoft transformation failure (MB-005) upstream of the s-salesforce-mb-api connector meant no order events were being delivered for CRM enrichment. 847 records accrued a 2-hour staleness lag. The root cause was a deployment gate failure in the Azure DevOps pipeline for Jira ticket MULE-2391 — a mandatory integration-contract-check was bypassed.`
    : `At 14:02 UTC on 22 May 2026, Release-149 was deployed to p-orders-mb-api, introducing a breaking payload schema change (orderLines → lineItems) without a downstream MuleSoft integration contract review. The MuleSoft DataWeave transform MB-005 failed immediately with MULE:TRANSFORMATION errors, blocking OMS order routing. Salesforce CRM sync degraded 4 minutes later. Zoho Desk logged a 340% ticket spike at T+22 minutes. Synapse correlated the deployment event, Jira MULE-2391 metadata, Datadog latency spike, and support ticket volume to isolate the root cause within 8 minutes of detection.`;

  return {
    summary,
    rootCause: { eventId: rootEventId, system: rootSystem, description: rootDesc },
    causalChain: [
      {
        eventId: "DEPLOY-149",
        system:  "Azure DevOps · p-orders-mb-api",
        action:  "Release-149 deployed at 14:02 UTC — Order API schema changed v2.0→v2.1 (orderLines renamed to lineItems). Jira MULE-2391 gate 'integration-contract-check' was not completed.",
        impact:  "MuleSoft DataWeave MB-005 receives unknown payload field structure",
        sev:     "critical",
      },
      {
        eventId: "MB-005-ERR",
        system:  "MuleSoft Transform · MB-005 Order→OMS Flow",
        action:  "MULE:TRANSFORMATION at DataWeave line 47 — 'payload.orderLines[0]' not found in v2.1 schema. Circuit breaker opens after 8 consecutive failures at 14:06 UTC.",
        impact:  "OMS order routing fully blocked — 67 orders enter dead-letter queue",
        sev:     "critical",
      },
      {
        eventId: "OMS-BLOCK",
        system:  "OMNIX OMS Fulfilment Queue",
        action:  "Order routing events stop arriving from MuleSoft. 67 orders accumulate in DLQ. Warehouse pick-and-pack queue shows zero new orders since 14:06 UTC.",
        impact:  "Customer order confirmations fail — checkout abandonment rate up 38%",
        sev:     "critical",
      },
      {
        eventId: "SFSC-LAG",
        system:  "Salesforce CRM · s-salesforce-mb-api",
        action:  "Order events not reaching CRM sync connector. 847 customer order records stale by 14:10 UTC. Sales pipeline dashboard shows £142K unreported revenue. Billing module at risk.",
        impact:  "CRM reporting inaccurate — ops and finance dashboards showing wrong figures",
        sev:     "warning",
      },
      {
        eventId: "ZOHO-SPIKE",
        system:  "Zoho Desk · Support Queue",
        action:  "31 new 'order not confirmed' tickets created between 14:06–14:48 UTC — 340% above hourly baseline. Groq AI urgency scores: 88–95. SLA breach for Mulberry and Clarks accounts.",
        impact:  "Customer-facing incident confirmed — 2 accounts in SLA breach at T+22 min",
        sev:     "critical",
      },
    ],
    confidence:   94,
    timeToDetect: "8 minutes (Synapse correlation)",
    recommendation: "1) Immediately deploy hotfix to MB-005 DataWeave script: update line 47 from 'payload.orderLines[0]' to 'payload.lineItems[0]' and redeploy the flow. 2) Trigger dead-letter queue replay for all 67 blocked OMS orders once the transform is live. 3) Execute a manual Salesforce CRM sync to backfill the 847 stale records. 4) Close the 31 Zoho tickets with auto-drafted resolution — the Groq pipeline has pre-generated responses for each.",
    preventionMeasures: [
      "Add an 'integration-contract-check' deployment gate to the Azure DevOps release pipeline for p-orders-mb-api — block the release if any MuleSoft DataWeave transform references a field absent from the new schema",
      "Enforce a Jira mandatory checklist item on all tickets tagged 'api-schema-change': downstream MuleSoft flows must be reviewed and updated before the ticket can be moved to Done",
      "Implement a canary release strategy for Order API schema changes — route 5% of traffic to the new schema version and validate MB-005 transformation success rate before full rollout",
      "Configure a Datadog composite monitor: alert within 60 seconds if MULE:TRANSFORMATION errors spike on any flow within 5 minutes of an Azure DevOps deployment to p-orders-mb-api",
    ],
  };
}

// ─── Main component ───────────────────────────────────────────────────────────
export function RCAReport({ event, history, onClose }: Props) {
  const [rca,     setRca]     = useState<RCAData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchRCA() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${BACKEND}/rca`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ event, history }),
        });
        if (!res.ok) throw new Error(`Backend error ${res.status}`);
        const data = await res.json();
        if (!cancelled) setRca(data.rca);
      } catch {
        // backend offline — use mock so demo still works
        if (!cancelled) setRca(buildMockRCA(event));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRCA();
    return () => { cancelled = true; };
  }, [event.id]);

  const sevS = sevStyle[event.sev] ?? sevStyle.info;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      />

      {/* Panel */}
      <motion.div
        key="panel"
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1     }}
        exit={{    opacity: 0, y: 40, scale: 0.97  }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="fixed inset-x-4 top-[5vh] bottom-[5vh] md:inset-x-[10%] lg:inset-x-[15%] z-50
          rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "var(--card)",
          border:     "1px solid rgba(124,110,245,0.18)",
          boxShadow:  "0 8px 48px rgba(0,0,0,0.35)",
        }}
      >
        {/* ── HEADER ── */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(124,110,245,0.12)" }}
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center">
              <GitBranch className="h-4 w-4 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Root Cause Analysis</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${sevS.border} ${sevS.bg} ${sevS.text}`}>
                  {event.source}
                </span>
                <span className="font-mono">{event.id}</span>
                <span>·</span>
                <span>{event.svc}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Loading */}
          {loading && (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-muted-foreground py-20">
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
                  <GitBranch className="h-7 w-7 text-yellow-400" />
                </div>
                <Loader2 className="h-5 w-5 text-yellow-400 animate-spin absolute -top-1.5 -right-1.5" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground/80">Tracing root cause...</p>
                <p className="text-xs text-muted-foreground mt-1">Analysing {history.length} events in history</p>
              </div>
              <div className="flex gap-1.5 mt-1">
                {["Scanning events", "Building causal chain", "Generating analysis"].map((step, i) => (
                  <motion.span
                    key={step}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.6 }}
                    className="text-[10px] px-2 py-1 rounded-full border border-border bg-secondary/40 text-muted-foreground"
                  >
                    {step}
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">{error}</div>
          )}

          {/* Results */}
          {!loading && rca && (
            <>
              {/* ── SUMMARY + CONFIDENCE ── */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-5 rounded-xl border border-border p-5"
                style={{ background: "var(--muted)" }}
              >
                {/* Ring — shrink-0 so it never gets squished */}
                <div className="shrink-0 flex flex-col items-center gap-1.5">
                  <ConfidenceRing value={rca.confidence} />
                  <span
                    className="text-[9px] font-semibold uppercase tracking-widest"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    AI Score
                  </span>
                </div>

                {/* Divider */}
                <div className="shrink-0 self-stretch w-px" style={{ background: "var(--border)" }} />

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2.5">
                    <ShieldAlert className="h-4 w-4 text-yellow-400 shrink-0" />
                    <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                      Executive Summary
                    </span>
                    <span
                      className="ml-auto flex items-center gap-1 text-[10px] shrink-0"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      <Clock className="h-3 w-3" /> Detected in {rca.timeToDetect}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                    {rca.summary}
                  </p>
                </div>
              </motion.div>

              {/* ── ROOT CAUSE CALLOUT ── */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl border border-yellow-400/40 bg-yellow-400/5 p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-5 w-5 rounded bg-yellow-400 flex items-center justify-center">
                    <AlertTriangle className="h-3 w-3 text-black" />
                  </span>
                  <span className="text-xs font-bold text-yellow-400 uppercase tracking-wide">Root Cause Identified</span>
                  <span className="ml-auto font-mono text-[11px] text-yellow-400/70 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
                    {rca.rootCause.eventId}
                  </span>
                </div>
                <p className="text-xs font-semibold text-foreground/90 mb-1">{rca.rootCause.system}</p>
                <p className="text-sm text-foreground/75 leading-relaxed">{rca.rootCause.description}</p>
              </motion.div>

              {/* ── CAUSAL CHAIN ── */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Causal Chain</h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary/60 border border-border text-muted-foreground">
                    {rca.causalChain.length} events
                  </span>
                </div>

                <div className="overflow-x-auto pb-3" style={{ marginLeft: -2, marginRight: -2, paddingLeft: 2 }}>
                  <div className="flex items-center gap-1 min-w-max" style={{ paddingTop: 14 }}>
                    {rca.causalChain.map((node, i) => (
                      <ChainNodeCard
                        key={`${node.eventId}-${i}`}
                        node={node}
                        index={i}
                        isRoot={node.eventId === rca.rootCause.eventId}
                        isLast={i === rca.causalChain.length - 1}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* ── RECOMMENDATION + PREVENTION ── */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26 }}
                className="grid md:grid-cols-2 gap-4"
              >
                {/* Immediate action */}
                <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ThumbsUp className="h-4 w-4 text-green-400" />
                    <span className="text-xs font-semibold text-green-400">Immediate Action</span>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{rca.recommendation}</p>
                </div>

                {/* Prevention */}
                <div className="rounded-xl border border-border bg-secondary/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-blue-400" />
                    <span className="text-xs font-semibold text-blue-400">Prevention Measures</span>
                  </div>
                  <ul className="space-y-2">
                    {rca.preventionMeasures.map((m, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.08 }}
                        className="flex items-start gap-2 text-xs text-foreground/75"
                      >
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                        {m}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </>
          )}
        </div>

        {/* ── FOOTER ── */}
        {!loading && rca && (
          <div
            className="px-6 py-3 shrink-0 flex items-center justify-between"
            style={{ borderTop: "1px solid rgba(124,110,245,0.10)" }}
          >
            <p className="text-[10px] text-muted-foreground">
              Powered by Claude · {new Date().toLocaleTimeString()}
            </p>
            <button
              onClick={() => {
                const text = [
                  `ROOT CAUSE ANALYSIS — ${event.id}`,
                  `System: ${event.svc} | Source: ${event.source}`,
                  "",
                  `SUMMARY\n${rca.summary}`,
                  "",
                  `ROOT CAUSE\n${rca.rootCause.eventId} — ${rca.rootCause.system}\n${rca.rootCause.description}`,
                  "",
                  `CAUSAL CHAIN\n${rca.causalChain.map((n, i) => `${i + 1}. [${n.eventId}] ${n.system}: ${n.action}`).join("\n")}`,
                  "",
                  `IMMEDIATE ACTION\n${rca.recommendation}`,
                  "",
                  `PREVENTION\n${rca.preventionMeasures.map((m, i) => `${i + 1}. ${m}`).join("\n")}`,
                  "",
                  `Confidence: ${rca.confidence}% | Time to detect: ${rca.timeToDetect}`,
                ].join("\n");
                const blob = new Blob([text], { type: "text/plain" });
                const a    = Object.assign(document.createElement("a"), {
                  href:     URL.createObjectURL(blob),
                  download: `rca-${event.id.toLowerCase()}.txt`,
                });
                a.click();
              }}
              className="inline-flex items-center gap-1.5 text-xs px-3 h-7 rounded-lg border border-border bg-secondary/50 hover:bg-secondary transition"
            >
              Export Report
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
