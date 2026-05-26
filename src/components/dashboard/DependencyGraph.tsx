import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, AlertTriangle, Activity, RefreshCw, ChevronRight } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type NodeSev  = "critical" | "warning" | "recovering" | "unaffected";
type TotalSev = "critical" | "warning" | "success";

interface SNode {
  id: string; label: string; sub: string;
  x: number; y: number; w: number; h: number;
  col: string; icon: string;
}

interface NImpact { nid: string; sev: NodeSev; note: string }

interface Scenario {
  id: string; btn: string; trigger: string;
  sev: TotalSev; conf: number;
  pred: string; detail: string;
  impacts: NImpact[];
}

// ── Colour maps ───────────────────────────────────────────────────────────────
const SC: Record<NodeSev, string | null> = {
  critical:   "#e05c5c",
  warning:    "#f0a500",
  recovering: "#52b788",
  unaffected: null,
};
const TC: Record<TotalSev, string> = {
  critical: "#e05c5c",
  warning:  "#f0a500",
  success:  "#52b788",
};
const SL: Record<NodeSev, string> = {
  critical:   "CRIT",
  warning:    "WARN",
  recovering: "OK",
  unaffected: "—",
};

// ── Node centre helper ────────────────────────────────────────────────────────
function nc(n: SNode) { return { cx: n.x + n.w / 2, cy: n.y + n.h / 2 }; }

// ── Service nodes  (ViewBox 0 0 760 385) ─────────────────────────────────────
//   Col 1 (triggers)  x=10
//   Col 2 (hub)       x=205
//   Col 3 (services)  x=415
//   Col 4 (outcomes)  x=605
const NODES: SNode[] = [
  // --- triggers ---
  { id:"azure",   label:"Azure DevOps",   sub:"CI/CD · Release pipeline",   x:10,  y:22,  w:130, h:56, col:"#0078d4", icon:"🚀" },
  { id:"datadog", label:"Datadog",        sub:"APM · Metrics · Alerting",   x:10,  y:258, w:130, h:56, col:"#9b59b6", icon:"📊" },
  // --- hub ---
  { id:"mulesoft",label:"MuleSoft",       sub:"Integration Platform · ESB", x:205, y:150, w:150, h:68, col:"#00a1e0", icon:"⚡" },
  // --- downstream services ---
  { id:"oms",     label:"OMS API",        sub:"prod-s-oms-mb-api",          x:415, y:18,  w:130, h:56, col:"#f0a500", icon:"🏭" },
  { id:"sfsc",    label:"Salesforce",     sub:"prod-s-sfsc-order-mb-api",   x:415, y:108, w:130, h:56, col:"#00a1e0", icon:"☁️" },
  { id:"receipt", label:"Receipt API",    sub:"prod-p-receipt-mb-api",      x:415, y:198, w:130, h:56, col:"#52b788", icon:"🧾" },
  { id:"partner", label:"Partner API",    sub:"prod-s-partner-mb-api",      x:415, y:288, w:130, h:56, col:"#9b8ff5", icon:"🤝" },
  // --- outcomes ---
  { id:"jira",    label:"Jira",           sub:"Incident · Sprint tracking", x:605, y:18,  w:130, h:56, col:"#0052cc", icon:"📋" },
  { id:"zoho",    label:"Zoho Desk",      sub:"Mulberry Support · 454 open",x:605, y:262, w:130, h:56, col:"#e8503a", icon:"🎫" },
];

// ── Edges ─────────────────────────────────────────────────────────────────────
type EStyle = "normal" | "monitor" | "outcome";
const EDGES: Array<{ from: string; to: string; lbl: string; sty: EStyle }> = [
  { from:"azure",   to:"mulesoft", lbl:"deploy trigger",  sty:"normal"  },
  { from:"datadog", to:"mulesoft", lbl:"monitors",        sty:"monitor" },
  { from:"mulesoft",to:"oms",      lbl:"MB20.21 sync",    sty:"normal"  },
  { from:"mulesoft",to:"sfsc",     lbl:"order sync",      sty:"normal"  },
  { from:"mulesoft",to:"receipt",  lbl:"receipt gen",     sty:"normal"  },
  { from:"mulesoft",to:"partner",  lbl:"partner events",  sty:"normal"  },
  { from:"oms",     to:"jira",     lbl:"auto-incident",   sty:"outcome" },
  { from:"sfsc",    to:"zoho",     lbl:"CRM → tickets",   sty:"outcome" },
];

// ── Blast scenarios (realistic, per-node severity) ────────────────────────────
const SCENARIOS: Scenario[] = [
  // ① Breaking schema deploy
  {
    id:"schema-deploy", btn:"Schema Deploy", trigger:"azure",
    sev:"critical", conf:97,
    pred:"Release-149 deployed a breaking payload schema change — field 'orderLines' renamed to 'lineItems' without an integration contract review gate. MuleSoft MB20.21 (OMS to SFSC Order Sync) is throwing MULE:TRANSFORMATION on every order event. OMS queue blocked with 67 orders. Salesforce CRM sync halted. Receipt API degraded — partial data only. Partner feeds unaffected. Datadog P1 fired.",
    detail:"Ticket #441376 · prod-s-oms-mb-api · MB20.21 · MULE:TRANSFORMATION error · Orders blocked: 67 · Salesforce: 0 records synced",
    impacts:[
      { nid:"azure",   sev:"critical",   note:"Release-149 introduced breaking OMS schema change, gate missed" },
      { nid:"mulesoft",sev:"critical",   note:"MB20.21 throwing MULE:TRANSFORMATION on every order event" },
      { nid:"oms",     sev:"critical",   note:"Queue blocked · 67 orders in dead-letter queue" },
      { nid:"sfsc",    sev:"critical",   note:"OMS-to-SFSC sync halted · 0 records reaching Salesforce" },
      { nid:"receipt", sev:"warning",    note:"Partial order data · receipts generating with missing fields" },
      { nid:"partner", sev:"unaffected", note:"Isolated feed — no impact from schema change" },
      { nid:"datadog", sev:"critical",   note:"P1 alert fired · 8 monitors in RED state" },
      { nid:"jira",    sev:"critical",   note:"MULE-2391 auto-created · P1 · assigned: Platform Eng" },
      { nid:"zoho",    sev:"critical",   note:"+34 tickets in 45 min · SLA breached for 2 accounts" },
    ],
  },
  // ② MuleSoft runtime down — everything breaks
  {
    id:"mulesoft-down", btn:"MuleSoft Down", trigger:"mulesoft",
    sev:"critical", conf:99,
    pred:"MuleSoft Runtime is completely unreachable — all 4 integration flows offline simultaneously. No order events routing to OMS or Salesforce. Receipt generation blocked entirely. Partner API feeds dead. Total integration layer outage affecting every Mulberry downstream system at once.",
    detail:"Runtime unreachable · 4/4 flows ERROR: prod-s-oms-mb-api · prod-s-sfsc-order-mb-api · prod-p-receipt-mb-api · prod-s-partner-mb-api",
    impacts:[
      { nid:"azure",   sev:"unaffected", note:"Pipeline healthy — unrelated to runtime outage" },
      { nid:"mulesoft",sev:"critical",   note:"Runtime DOWN · 4/4 flows in ERROR state" },
      { nid:"oms",     sev:"critical",   note:"No inbound events from MuleSoft · queue completely frozen" },
      { nid:"sfsc",    sev:"critical",   note:"SFSC order sync fully halted" },
      { nid:"receipt", sev:"critical",   note:"Receipt generation blocked entirely" },
      { nid:"partner", sev:"critical",   note:"All partner feeds dead" },
      { nid:"datadog", sev:"critical",   note:"P0 alert fired · 12 monitors RED · on-call paged" },
      { nid:"jira",    sev:"critical",   note:"P0 incident auto-raised · all-hands response" },
      { nid:"zoho",    sev:"critical",   note:"Ticket flood across all categories" },
    ],
  },
  // ③ OMS TECHERROR (matches real ticket #441368 / #441376)
  {
    id:"oms-error", btn:"OMS Sync Error", trigger:"oms",
    sev:"critical", conf:94,
    pred:"prod-s-oms-mb-api TECHERROR — business exception in MB20.21 OMS-to-SFSC sync. Error: 'First Name: data value too long (max length=20)'. Customer data failing field validation in Salesforce. Receipt API reads from a separate OMS endpoint — fully unaffected. Partner API not impacted. Mulberry Support queue at 454 open tickets.",
    detail:"Ticket #441368 · TECHERROR · MB20.21 OMS→SFSC · order TSB185361-rcvd · First Name > 20 chars · SFSC httpStatusCode: 201 · body: errors present · 0 records written",
    impacts:[
      { nid:"azure",   sev:"unaffected", note:"No deployment in progress" },
      { nid:"mulesoft",sev:"warning",    note:"MB20.21 flow in retry loop · 3 consecutive TECHERROR" },
      { nid:"oms",     sev:"critical",   note:"TECHERROR · field validation failure · TSB prefix orders blocked" },
      { nid:"sfsc",    sev:"critical",   note:"Rejecting all affected records · 0 orders synced for TSB prefix" },
      { nid:"receipt", sev:"unaffected", note:"Reads from separate OMS endpoint · fully operational" },
      { nid:"partner", sev:"unaffected", note:"No impact" },
      { nid:"datadog", sev:"warning",    note:"OMS error rate alert fired · P3 severity" },
      { nid:"jira",    sev:"warning",    note:"P3 ticket MULE-2394 raised · Business Exception" },
      { nid:"zoho",    sev:"critical",   note:"#441368 #441376 open · 454 total in Mulberry Support" },
    ],
  },
  // ④ Salesforce slow — partial blast, other services fine
  {
    id:"sfsc-slow", btn:"Salesforce Slow", trigger:"sfsc",
    sev:"warning", conf:87,
    pred:"prod-s-sfsc-order-mb-api response times elevated to 4.2s (SLA: 2s). MuleSoft SFSC flow accumulating a 12-minute sync backlog — 142 order records queued. OMS, Receipt, and Partner APIs are all fully operational and unaffected. Revenue dashboard showing stale data. SLA breach risk in ~25 minutes if not resolved.",
    detail:"prod-s-sfsc-order-mb-api · p95: 4.2s vs 2s SLA · sync lag: 12 min · queued: 142 records · API rate: 71% · no data loss yet",
    impacts:[
      { nid:"azure",   sev:"unaffected", note:"No active deployment" },
      { nid:"mulesoft",sev:"warning",    note:"SFSC flow backing up · other 3 flows completely healthy" },
      { nid:"oms",     sev:"unaffected", note:"Processing orders normally — fully operational" },
      { nid:"sfsc",    sev:"warning",    note:"p95 latency 4.2s · SLA 2s · breach imminent in ~25 min" },
      { nid:"receipt", sev:"unaffected", note:"Generating receipts normally" },
      { nid:"partner", sev:"unaffected", note:"Healthy" },
      { nid:"datadog", sev:"warning",    note:"SLA latency threshold alert · amber state" },
      { nid:"jira",    sev:"unaffected", note:"Below P3 threshold — no incident raised" },
      { nid:"zoho",    sev:"warning",    note:"3 tickets: delayed order confirmation emails" },
    ],
  },
  // ⑤ Receipt API isolated failure (real ticket #441392)
  {
    id:"receipt-error", btn:"Receipt Error", trigger:"receipt",
    sev:"warning", conf:88,
    pred:"prod-p-receipt-mb-api TECHERROR — custom application notification. Receipt generation failing for all Mulberry orders. OMS and Salesforce are both healthy and unaffected. Partner API not impacted. Blast radius is fully isolated — customers complete checkout successfully but receive no email receipt.",
    detail:"Ticket #441392 · prod-p-receipt-mb-api · TECHERROR · receipt delivery failure · OMS/SFSC/partner flows all healthy",
    impacts:[
      { nid:"azure",   sev:"unaffected", note:"No deployment active" },
      { nid:"mulesoft",sev:"warning",    note:"Receipt flow in error · other 3 flows healthy" },
      { nid:"oms",     sev:"unaffected", note:"Fully operational" },
      { nid:"sfsc",    sev:"unaffected", note:"Fully operational" },
      { nid:"receipt", sev:"critical",   note:"TECHERROR · receipts not generating for any Mulberry order" },
      { nid:"partner", sev:"unaffected", note:"Not affected" },
      { nid:"datadog", sev:"warning",    note:"Receipt error rate alert · isolated spike" },
      { nid:"jira",    sev:"unaffected", note:"Below P3 threshold — monitoring only" },
      { nid:"zoho",    sev:"warning",    note:"Ticket #441392 open · receipt complaint cluster" },
    ],
  },
  // ⑥ Full recovery
  {
    id:"recovery", btn:"Full Recovery", trigger:"azure",
    sev:"success", conf:99,
    pred:"Hotfix deployed — Release-149a. DataWeave transform MB20.21 patched: 'orderLines' → 'lineItems', First Name field now truncated to 20-char max before Salesforce sync. All 4 MuleSoft flows restarted cleanly. 67 blocked orders replayed from dead-letter queue. Salesforce CRM backfilled with 847 records. All Datadog monitors green. Zoho Desk ticket volume back at baseline.",
    detail:"Hotfix: Release-149a · MB20.21 DataWeave patched · 67 DLQ orders replayed · 847 SF records backfilled · All monitors: GREEN",
    impacts:[
      { nid:"azure",   sev:"recovering", note:"Release-149a deployed cleanly · all integration gates passed" },
      { nid:"mulesoft",sev:"recovering", note:"All 4 flows RUNNING · DLQ replay: 67/67 complete" },
      { nid:"oms",     sev:"recovering", note:"67 orders replayed · queue clear · normal throughput" },
      { nid:"sfsc",    sev:"recovering", note:"847 records backfilled · sync latency: 0.3s" },
      { nid:"receipt", sev:"recovering", note:"Receipt generation fully resumed" },
      { nid:"partner", sev:"recovering", note:"Partner feeds live" },
      { nid:"datadog", sev:"recovering", note:"All 12 monitors back to GREEN" },
      { nid:"jira",    sev:"recovering", note:"MULE-2391 resolved · PIR scheduled for sprint retro" },
      { nid:"zoho",    sev:"recovering", note:"31 incident tickets auto-resolved · baseline restored" },
    ],
  },
];

// ── Animated pulse dot along an edge ─────────────────────────────────────────
function PulseDot({ edgeId, color }: { edgeId: string; color: string }) {
  const dur = useRef((1.2 + Math.random() * 0.8).toFixed(2));
  return (
    <circle r="3.5" fill={color} opacity="0.9">
      <animateMotion dur={`${dur.current}s`} repeatCount="indefinite" calcMode="linear">
        <mpath xlinkHref={`#${edgeId}`} />
      </animateMotion>
    </circle>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export function DependencyGraph({ liveEvents = [] }: { liveEvents?: any[] }) {
  const [active,    setActive]    = useState<Scenario | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [lastEvId,  setLastEvId]  = useState<string | null>(null);
  const [hovered,   setHovered]   = useState<string | null>(null);
  const prevLenRef = useRef(0);

  // Auto-trigger on new live event
  useEffect(() => {
    if (!liveEvents.length) return;
    const newest = liveEvents[0];
    if (!newest?.id || newest.id === lastEvId) return;
    if (liveEvents.length <= prevLenRef.current) return;
    prevLenRef.current = liveEvents.length;
    setLastEvId(newest.id);
    const map: Record<string, string> = {
      Azure: "schema-deploy", MuleSoft: "mulesoft-down",
      Jira:  "oms-error",     Zoho:     "receipt-error",
    };
    const s = SCENARIOS.find(sc => sc.id === (map[newest.source] ?? "oms-error")) ?? SCENARIOS[0];
    trigger(s);
  }, [liveEvents.length]);

  function trigger(s: Scenario) {
    setAnalyzing(true);
    setTimeout(() => { setActive(s); setAnalyzing(false); }, 500);
  }

  function handleNodeClick(node: SNode) {
    const s = SCENARIOS.find(sc => sc.trigger === node.id);
    if (s) trigger(s);
  }

  // Per-node helpers
  function impact(nid: string) { return active?.impacts.find(i => i.nid === nid) ?? null; }
  function isActive(nid: string) { const i = impact(nid); return !!i && i.sev !== "unaffected"; }
  function nodColor(nid: string) { const i = impact(nid); return (i && SC[i.sev]) ?? null; }
  function isDimmed(nid: string) { return !!active && !isActive(nid); }

  // Edge color: use the "to" node's severity
  function edgeCol(from: string, to: string): string | null {
    if (!active) return null;
    const fi = impact(from); const ti = impact(to);
    if (!fi || !ti || fi.sev === "unaffected" || ti.sev === "unaffected") return null;
    return SC[ti.sev] ?? null;
  }

  const overallColor = active ? TC[active.sev] : "#9b8ff5";
  const affectedCount = active ? active.impacts.filter(i => i.sev !== "unaffected").length : 0;

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background:"var(--card)", border:"1px solid rgba(124,110,245,0.11)", boxShadow:"0 1px 4px rgba(124,110,245,0.06)" }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom:"1px solid rgba(124,110,245,0.08)" }}>
        <div>
          <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color:"var(--foreground)" }}>
            <Zap className="h-4 w-4 text-[#9b8ff5]" />
            Integration Dependency Graph
            {active && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse"
                style={{ background:`${overallColor}18`, color:overallColor }}>
                <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ background:overallColor }} />
                BLAST RADIUS ACTIVE
              </span>
            )}
          </h2>
          <p className="text-xs mt-0.5" style={{ color:"var(--muted-foreground)" }}>
            Real Mulberry topology · MuleSoft as integration hub · click any node to trace cascade impact
          </p>
        </div>
        <div className="flex items-center gap-2">
          {active && (
            <button onClick={() => setActive(null)}
              className="text-xs px-3 py-1.5 rounded-xl transition hover:bg-secondary"
              style={{ border:"1px solid rgba(124,110,245,0.15)", color:"var(--muted-foreground)" }}>
              Clear
            </button>
          )}
          {analyzing && (
            <div className="flex items-center gap-1.5 text-xs" style={{ color:"#9b8ff5" }}>
              <RefreshCw className="h-3 w-3 animate-spin" /> Analysing…
            </div>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4">

        {/* ── SVG Dependency Graph ── */}
        <div className="relative rounded-xl overflow-hidden"
          style={{ background:"var(--background)", border:"1px solid rgba(124,110,245,0.08)" }}>
          <svg viewBox="0 0 760 385" style={{ width:"100%", display:"block" }}>
            <defs>
              {/* Arrow markers per severity */}
              <marker id="arr"   markerWidth="7" markerHeight="7" refX="5" refY="2.5" orient="auto">
                <path d="M0,0 L0,5 L7,2.5 z" fill="rgba(124,110,245,0.35)" />
              </marker>
              <marker id="arr-c" markerWidth="7" markerHeight="7" refX="5" refY="2.5" orient="auto">
                <path d="M0,0 L0,5 L7,2.5 z" fill="#e05c5c" />
              </marker>
              <marker id="arr-w" markerWidth="7" markerHeight="7" refX="5" refY="2.5" orient="auto">
                <path d="M0,0 L0,5 L7,2.5 z" fill="#f0a500" />
              </marker>
              <marker id="arr-g" markerWidth="7" markerHeight="7" refX="5" refY="2.5" orient="auto">
                <path d="M0,0 L0,5 L7,2.5 z" fill="#52b788" />
              </marker>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="glow-soft">
                <feGaussianBlur stdDeviation="1.5" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* ── Column headers ── */}
            {[
              { x:75,  label:"TRIGGERS" },
              { x:280, label:"INTEGRATION HUB" },
              { x:480, label:"DOWNSTREAM SERVICES" },
              { x:670, label:"OUTCOMES" },
            ].map(({ x, label }) => (
              <text key={label} x={x} y={11} textAnchor="middle" fontSize="7" fontWeight="600"
                fill="rgba(124,110,245,0.38)" fontFamily="system-ui,sans-serif" letterSpacing="0.5">
                {label}
              </text>
            ))}

            {/* ── Edges ── */}
            {EDGES.map(edge => {
              const fn = NODES.find(n => n.id === edge.from)!;
              const tn = NODES.find(n => n.id === edge.to)!;
              const a  = nc(fn), b = nc(tn);

              const eColor = edgeCol(edge.from, edge.to);
              const isEdgeActive = !!eColor;
              const edgeId = `e-${edge.from}-${edge.to}`;

              // Arrow marker by severity
              let marker = "url(#arr)";
              if (isEdgeActive) {
                const ti = impact(edge.to);
                marker = ti?.sev === "critical"   ? "url(#arr-c)"
                       : ti?.sev === "warning"    ? "url(#arr-w)"
                       : "url(#arr-g)";
              }

              // Control point for bezier curve
              const mx  = (a.cx + b.cx) / 2;
              const my  = (a.cy + b.cy) / 2;
              // Push control point slightly perpendicular
              const dy  = b.cy - a.cy;
              const cpy = my - Math.abs(dy) * 0.12 - 6;

              // Monitor edges always dashed; normal edges solid when active
              const dash = (edge.sty === "monitor" || !isEdgeActive) ? "4 3" : "none";
              const strokeCol = isEdgeActive
                ? eColor!
                : edge.sty === "monitor"
                  ? "rgba(155,143,245,0.28)"
                  : "rgba(124,110,245,0.2)";

              return (
                <g key={edgeId}>
                  <path
                    id={edgeId}
                    d={`M ${a.cx} ${a.cy} Q ${mx} ${cpy} ${b.cx} ${b.cy}`}
                    stroke={strokeCol}
                    strokeWidth={isEdgeActive ? 2 : 1.5}
                    fill="none"
                    markerEnd={marker}
                    strokeDasharray={dash}
                    style={{ filter:isEdgeActive ? "url(#glow)" : "none", transition:"all 0.3s ease" }}
                  />
                  {/* Edge label */}
                  <text x={mx} y={cpy - 5} textAnchor="middle" fontSize="6.5"
                    fill={isEdgeActive ? `${eColor}bb` : "rgba(124,110,245,0.38)"}
                    fontFamily="system-ui,sans-serif">
                    {edge.lbl}
                  </text>
                  {/* Pulse dot when active */}
                  {isEdgeActive && <PulseDot edgeId={edgeId} color={eColor!} />}
                </g>
              );
            })}

            {/* ── Nodes ── */}
            {NODES.map(node => {
              const imp     = impact(node.id);
              const active_ = isActive(node.id);
              const dim     = isDimmed(node.id);
              const nCol    = nodColor(node.id) ?? node.col;
              const { cx, cy } = nc(node);

              return (
                <g key={node.id}
                  style={{ cursor:"pointer" }}
                  onClick={() => handleNodeClick(node)}
                  onMouseEnter={() => setHovered(node.id)}
                  onMouseLeave={() => setHovered(null)}>

                  {/* Pulse ring */}
                  {active_ && (
                    <circle cx={cx} cy={cy} r={36} fill="none"
                      stroke={nCol} strokeWidth="1.5" opacity="0.2"
                      style={{ filter:"url(#glow)" }}>
                      <animate attributeName="r"       values="30;44;30" dur="1.9s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.22;0.05;0.22" dur="1.9s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Card */}
                  <rect
                    x={node.x} y={node.y} width={node.w} height={node.h} rx={10}
                    fill={active_ ? `${nCol}12` : hovered === node.id ? `${node.col}0a` : "var(--card,#1e1a2e)"}
                    stroke={active_ ? nCol : dim ? `${node.col}20` : hovered === node.id ? `${node.col}60` : `${node.col}42`}
                    strokeWidth={active_ ? 2 : 1.5}
                    opacity={dim ? 0.38 : 1}
                    style={{ transition:"all 0.3s ease", filter:active_ ? "url(#glow-soft)" : "none" }}
                  />

                  {/* Blinking severity dot */}
                  {active_ && (
                    <circle cx={node.x + node.w - 9} cy={node.y + 9} r={5} fill={nCol}>
                      <animate attributeName="opacity" values="1;0.15;1" dur="0.85s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Severity badge text inside dot area */}
                  {active_ && imp && (
                    <text x={node.x + node.w - 9} y={node.y + 12} textAnchor="middle"
                      fontSize="5" fontWeight="800" fill="white" fontFamily="system-ui,sans-serif">
                      {imp.sev === "critical" ? "!" : imp.sev === "warning" ? "W" : "✓"}
                    </text>
                  )}

                  {/* Icon */}
                  <text x={node.x + 8} y={node.y + 22} fontSize="13"
                    opacity={dim ? 0.35 : 1}
                    style={{ userSelect:"none" }}>
                    {node.icon}
                  </text>

                  {/* Label */}
                  <text x={node.x + 27} y={node.y + 21} fontSize="8.5" fontWeight="700"
                    fill={active_ ? nCol : dim ? "rgba(150,140,200,0.35)" : "var(--foreground,#f0ece8)"}
                    fontFamily="system-ui,sans-serif"
                    style={{ transition:"fill 0.3s ease" }}>
                    {node.label}
                  </text>

                  {/* Sub-label */}
                  <text x={node.x + 8} y={node.y + 34} fontSize="7"
                    fill={active_ ? `${nCol}99` : dim ? "rgba(150,140,200,0.22)" : "rgba(150,140,200,0.6)"}
                    fontFamily="system-ui,sans-serif">
                    {node.sub}
                  </text>

                  {/* Status bar */}
                  <rect
                    x={node.x + 8} y={node.y + node.h - 9}
                    width={active_ ? node.w - 16 : (node.w - 16) * 0.45} height={3.5} rx={2}
                    fill={active_ ? nCol : dim ? `${node.col}18` : `${node.col}48`}
                    opacity={dim ? 0.3 : 1}
                    style={{ transition:"all 0.45s ease" }}
                  />
                </g>
              );
            })}

            {/* ── Legend ── */}
            <g transform="translate(10, 370)">
              {[
                { col:"rgba(124,110,245,0.5)", lbl:"idle" },
                { col:"#e05c5c",               lbl:"critical" },
                { col:"#f0a500",               lbl:"warning" },
                { col:"#52b788",               lbl:"recovering" },
              ].map(({ col, lbl }, i) => (
                <g key={lbl} transform={`translate(${i * 110}, 0)`}>
                  <circle cx={0} cy={6} r={4} fill={col} />
                  <text x={8} y={10} fontSize="7.5" fill="rgba(124,110,245,0.5)"
                    fontFamily="system-ui,sans-serif">{lbl}</text>
                </g>
              ))}
              <text x={460} y={10} fontSize="7.5" fill="rgba(124,110,245,0.38)"
                fontFamily="system-ui,sans-serif">
                ← each node shows its own severity · click to trace cascade
              </text>
            </g>
          </svg>
        </div>

        {/* ── Blast Radius Result ── */}
        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
              transition={{ duration:0.22 }}
              className="rounded-xl p-4"
              style={{ background:`${TC[active.sev]}0d`, border:`1px solid ${TC[active.sev]}30` }}>

              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" style={{ color:TC[active.sev] }} />
                  <span className="text-xs font-bold" style={{ color:TC[active.sev] }}>
                    AI Blast Radius · {affectedCount} of {active.impacts.length} systems impacted
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background:`${TC[active.sev]}20`, color:TC[active.sev] }}>
                  {active.conf}% confidence
                </span>
              </div>

              {/* Prediction */}
              <p className="text-xs leading-5 mb-3" style={{ color:"var(--foreground)" }}>
                {active.pred}
              </p>

              {/* Per-system impact grid */}
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {active.impacts
                  .filter(i => i.sev !== "unaffected")
                  .map(imp => {
                    const node = NODES.find(n => n.id === imp.nid);
                    const col  = SC[imp.sev] ?? "#9b8ff5";
                    return (
                      <div key={imp.nid}
                        className="flex items-start gap-2 px-2.5 py-1.5 rounded-lg"
                        style={{ background:`${col}0d`, border:`1px solid ${col}28` }}>
                        <span className="text-[11px] mt-0.5 shrink-0">{node?.icon}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[9px] font-black tracking-wide px-1 rounded"
                              style={{ background:`${col}22`, color:col }}>
                              {SL[imp.sev]}
                            </span>
                            <span className="text-[10px] font-semibold truncate"
                              style={{ color:"var(--foreground)" }}>
                              {node?.label}
                            </span>
                          </div>
                          <p className="text-[9px] leading-[1.35]"
                            style={{ color:"var(--muted-foreground)" }}>
                            {imp.note}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Technical detail */}
              <p className="text-[10px] font-mono px-2.5 py-1.5 rounded-lg"
                style={{ color:TC[active.sev], background:`${TC[active.sev]}0d` }}>
                {active.detail}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Empty state ── */}
        {!active && !analyzing && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background:"rgba(124,110,245,0.05)", border:"1px dashed rgba(124,110,245,0.15)" }}>
            <Activity className="h-4 w-4 shrink-0" style={{ color:"#9b8ff5" }} />
            <p className="text-xs" style={{ color:"var(--muted-foreground)" }}>
              <strong style={{ color:"#9b8ff5" }}>Click any node</strong> to trace its blast radius.
              Each scenario shows per-system severity across the real Mulberry topology —
              nodes that are unaffected stay dimmed while impacted ones light up with their own severity level.
            </p>
          </div>
        )}

        {/* ── Simulate buttons ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold uppercase tracking-wide shrink-0"
            style={{ color:"var(--muted-foreground)" }}>
            Simulate:
          </span>
          {SCENARIOS.map(s => {
            const col      = TC[s.sev];
            const isSelected = active?.id === s.id;
            return (
              <button key={s.id}
                onClick={() => trigger(s)}
                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg transition hover:opacity-80"
                style={{
                  background: isSelected ? `${col}25` : `${col}12`,
                  border: `1px solid ${isSelected ? col : `${col}38`}`,
                  color: col,
                }}>
                <ChevronRight className="h-2.5 w-2.5" />
                {s.btn}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
