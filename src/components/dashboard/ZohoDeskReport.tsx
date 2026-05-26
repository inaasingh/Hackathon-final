import { useState } from "react";
import {
  Ticket, AlertTriangle, CheckCircle2, Clock, Pause,
  RefreshCw, ExternalLink, ChevronDown, ChevronUp,
  AlertCircle, Users, BarChart3, Zap, FileDown, Loader2,
  FileSpreadsheet, Cloud,
} from "lucide-react";
import { generateZohoReport } from "@/lib/zohoReportPdf";
import { generateHealthCheckXLSX } from "@/lib/xlsxHealthReport";

// ── Static mock data (no fetch on load) ──────────────────────────
const MOCK_TICKETS = [
  { id: "ZD-4821", subject: "Order API — 504 Gateway Timeout on checkout flow",  status: "Open",     priority: "Urgent", dept: "Platform Engineering", assignee: "Rahul Mehta",   age: "2h ago"  },
  { id: "ZD-4819", subject: "MuleSoft Payment Gateway circuit breaker tripped",   status: "Open",     priority: "High",   dept: "Integration Ops",      assignee: "Priya Sharma",  age: "3h ago"  },
  { id: "ZD-4817", subject: "Salesforce CRM sync latency exceeds 1.2s SLA",       status: "On Hold",  priority: "High",   dept: "CRM Operations",       assignee: "Neha Kulkarni", age: "14h ago" },
  { id: "ZD-4815", subject: "Governance doc auto-generation failed for Q2 deck",  status: "Open",     priority: "Medium", dept: "Governance",            assignee: "Arun Patel",    age: "1d ago"  },
  { id: "ZD-4813", subject: "Inventory Sync missing 3 SKUs post-migration",       status: "Open",     priority: "High",   dept: "Platform Engineering", assignee: "Rahul Mehta",   age: "1d ago"  },
  { id: "ZD-4810", subject: "Pricing Engine returning stale cache for 15 min",    status: "Resolved", priority: "Medium", dept: "Integration Ops",      assignee: "Priya Sharma",  age: "2d ago"  },
  { id: "ZD-4808", subject: "Azure DevOps webhook not triggering on PR merge",    status: "Resolved", priority: "Medium", dept: "Platform Engineering", assignee: "Arun Patel",    age: "2d ago"  },
  { id: "ZD-4805", subject: "Weekly governance report sent to wrong recipients",  status: "Resolved", priority: "Low",    dept: "Governance",            assignee: "Neha Kulkarni", age: "3d ago"  },
  { id: "ZD-4801", subject: "Zoho contract renewal alert missed for 2 vendors",   status: "Resolved", priority: "High",   dept: "Governance",            assignee: "Arun Patel",    age: "4d ago"  },
  { id: "ZD-4796", subject: "HubSpot deal stage not syncing to CRM dashboard",    status: "Open",     priority: "Low",    dept: "CRM Operations",       assignee: "Priya Sharma",  age: "6d ago"  },
];

const SUMMARY = {
  total:     10,
  open:       5,
  onHold:     1,
  resolved:   4,
  overdue:    2,
  byPriority: { Urgent: 1, High: 4, Medium: 3, Low: 2 },
  byDept: [
    { name: "Platform Engineering", count: 3 },
    { name: "Governance",           count: 3 },
    { name: "Integration Ops",      count: 2 },
    { name: "CRM Operations",       count: 2 },
  ],
};

// ── Config ────────────────────────────────────────────────────────
const priorityCfg: Record<string, { col: string; bg: string }> = {
  Urgent: { col: "#e05c5c", bg: "#ffeaea" },
  High:   { col: "#f0a500", bg: "#fff7e6" },
  Medium: { col: "#7c6ef5", bg: "#ede8ff" },
  Low:    { col: "#52b788", bg: "#edfaf3" },
};

const statusCfg: Record<string, { col: string; bg: string; Icon: typeof CheckCircle2 }> = {
  "Open":     { col: "#e05c5c", bg: "#ffeaea", Icon: AlertCircle  },
  "On Hold":  { col: "#f0a500", bg: "#fff7e6", Icon: Pause        },
  "Resolved": { col: "#52b788", bg: "#edfaf3", Icon: CheckCircle2 },
};

// ── Sub-components ────────────────────────────────────────────────
function SummaryCard({ label, value, icon: Icon, col, bg }: {
  label: string; value: number; icon: typeof Ticket; col: string; bg: string;
}) {
  return (
    <div className="flex-1 rounded-xl p-3.5 flex flex-col gap-1 min-w-0"
      style={{ background: bg, border: `1px solid ${col}33` }}>
      <div className="h-6 w-6 rounded-lg flex items-center justify-center" style={{ background: `${col}22` }}>
        <Icon className="h-3.5 w-3.5" style={{ color: col }} />
      </div>
      <p className="text-2xl font-bold leading-none mt-1" style={{ color: col }}>{value}</p>
      <p className="text-[10px] font-medium" style={{ color: col, opacity: 0.75 }}>{label}</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export function ZohoDeskReport() {
  const [expanded,       setExpanded]       = useState(false);
  const [refreshing,     setRefreshing]     = useState(false);
  const [generating,     setGenerating]     = useState(false);
  const [generatingXlsx, setGeneratingXlsx] = useState(false);

  const visible = expanded ? MOCK_TICKETS : MOCK_TICKETS.slice(0, 5);

  function handleGenerateReport() {
    setGenerating(true);
    setTimeout(() => {
      try { generateZohoReport(MOCK_TICKETS); }
      finally { setGenerating(false); }
    }, 300);
  }

  function handleGenerateXlsx() {
    setGeneratingXlsx(true);
    setTimeout(() => {
      try { generateHealthCheckXLSX(); }
      finally { setGeneratingXlsx(false); }
    }, 300);
  }

  function handleRefresh() {
    setRefreshing(true);
    // single attempt, short timeout, just re-renders — backend optional
    const ctrl = new AbortController();
    const timer = setTimeout(() => { ctrl.abort(); setRefreshing(false); }, 2500);
    fetch("http://localhost:3001/api/zoho/report", { signal: ctrl.signal })
      .then(r => r.json())
      .then(() => { clearTimeout(timer); setRefreshing(false); })
      .catch(() => { clearTimeout(timer); setRefreshing(false); });
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--card)",
        border: "1px solid rgba(124,110,245,0.11)",
        boxShadow: "0 1px 4px rgba(124,110,245,0.06)",
      }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid rgba(124,110,245,0.08)" }}>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl flex items-center justify-center"
            style={{ background: "#ffeaea" }}>
            <Ticket className="h-4 w-4" style={{ color: "#e05c5c" }} />
          </div>
          <div>
            <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
              Integration Reports
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: "#f0a50020", color: "#f0a500" }}>
                DEMO
              </span>
            </h2>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              Zoho Desk tickets · CloudHub health · MuleSoft APIs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Health Check XLSX — CloudHub/MuleSoft format */}
          <button
            onClick={handleGenerateXlsx}
            disabled={generatingXlsx}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#002060,#1a4a8a)" }}
            title="Generate CloudHub Health Check XLSX (6-sheet report)"
          >
            {generatingXlsx
              ? <><Loader2 className="h-3 w-3 animate-spin" /> Generating…</>
              : <><FileSpreadsheet className="h-3 w-3" /> Health Check XLSX</>
            }
          </button>

          {/* Zoho Desk PDF */}
          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#7c6ef5,#a78ef8)" }}
            title="Generate Zoho Desk PDF report"
          >
            {generating
              ? <><Loader2 className="h-3 w-3 animate-spin" /> Generating…</>
              : <><FileDown className="h-3 w-3" /> Zoho PDF</>
            }
          </button>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8 w-8 rounded-xl border flex items-center justify-center transition hover:bg-secondary disabled:opacity-40"
            style={{ borderColor: "rgba(124,110,245,0.18)" }}
            title="Refresh from backend"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
              style={{ color: "var(--muted-foreground)" }} />
          </button>
          <a
            href="https://desk.zoho.in"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium text-white transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#e05c5c,#f0784a)" }}
          >
            <ExternalLink className="h-3 w-3" />
            Open Desk
          </a>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex gap-3">
          <SummaryCard label="Total"    value={SUMMARY.total}    icon={Ticket}       col="#7c6ef5" bg="#ede8ff" />
          <SummaryCard label="Open"     value={SUMMARY.open}     icon={AlertCircle}  col="#e05c5c" bg="#ffeaea" />
          <SummaryCard label="On Hold"  value={SUMMARY.onHold}   icon={Pause}        col="#f0a500" bg="#fff7e6" />
          <SummaryCard label="Resolved" value={SUMMARY.resolved} icon={CheckCircle2} col="#52b788" bg="#edfaf3" />
          <SummaryCard label="Overdue"  value={SUMMARY.overdue}  icon={Clock}        col="#e05c5c" bg="#ffeaea" />
        </div>
      </div>

      {/* ── 2-col: Priority + Department ── */}
      <div className="grid grid-cols-2 gap-0"
        style={{ borderTop: "1px solid rgba(124,110,245,0.08)", borderBottom: "1px solid rgba(124,110,245,0.08)" }}>

        {/* Priority */}
        <div className="px-5 py-4" style={{ borderRight: "1px solid rgba(124,110,245,0.08)" }}>
          <p className="text-xs font-semibold mb-3 flex items-center gap-1.5" style={{ color: "var(--foreground)" }}>
            <BarChart3 className="h-3.5 w-3.5 text-primary" /> Priority Breakdown
          </p>
          <div className="space-y-2.5">
            {(["Urgent","High","Medium","Low"] as const).map(p => {
              const count = SUMMARY.byPriority[p];
              const pct   = Math.round((count / SUMMARY.total) * 100);
              const cfg   = priorityCfg[p];
              return (
                <div key={p}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{p}</span>
                    <span className="text-xs font-bold" style={{ color: cfg.col }}>
                      {count} <span className="font-normal text-muted-foreground">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "var(--muted)" }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: cfg.col }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department */}
        <div className="px-5 py-4">
          <p className="text-xs font-semibold mb-3 flex items-center gap-1.5" style={{ color: "var(--foreground)" }}>
            <Users className="h-3.5 w-3.5 text-primary" /> By Department
          </p>
          <div className="space-y-2.5">
            {SUMMARY.byDept.map(d => {
              const pct = Math.round((d.count / SUMMARY.total) * 100);
              return (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="text-[11px] flex-1 truncate" style={{ color: "var(--foreground)" }}>{d.name}</span>
                  <div className="w-16 h-1.5 rounded-full shrink-0" style={{ background: "var(--muted)" }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#7c6ef5" }} />
                  </div>
                  <span className="text-[11px] font-semibold w-4 text-right" style={{ color: "var(--muted-foreground)" }}>{d.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Ticket list ── */}
      <div className="px-5 py-4">
        <p className="text-xs font-semibold mb-3 flex items-center gap-1.5" style={{ color: "var(--foreground)" }}>
          <Zap className="h-3.5 w-3.5 text-primary" /> Recent Tickets
        </p>

        <div className="space-y-1.5">
          {visible.map(t => {
            const sCfg = statusCfg[t.status]   ?? statusCfg["Open"];
            const pCfg = priorityCfg[t.priority] ?? priorityCfg["Medium"];
            const StatusIcon = sCfg.Icon;
            return (
              <div key={t.id}
                className="flex items-start gap-3 rounded-xl p-3 hover:bg-secondary/40 transition-colors border border-transparent hover:border-border">
                <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: sCfg.bg }}>
                  <StatusIcon className="h-3.5 w-3.5" style={{ color: sCfg.col }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium leading-snug truncate" style={{ color: "var(--foreground)" }}>
                    {t.subject}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="text-[10px] font-mono" style={{ color: "var(--muted-foreground)" }}>#{t.id}</span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: sCfg.bg, color: sCfg.col }}>{t.status}</span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: pCfg.bg, color: pCfg.col }}>{t.priority}</span>
                    <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{t.dept}</span>
                    <span className="text-[10px] ml-auto shrink-0" style={{ color: "var(--muted-foreground)" }}>{t.age}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {MOCK_TICKETS.length > 5 && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition hover:bg-secondary/40"
            style={{ border: "1px dashed rgba(124,110,245,0.20)", color: "var(--muted-foreground)" }}
          >
            {expanded
              ? <><ChevronUp   className="h-3.5 w-3.5" /> Show less</>
              : <><ChevronDown className="h-3.5 w-3.5" /> Show {MOCK_TICKETS.length - 5} more tickets</>}
          </button>
        )}
      </div>

      {/* ── Alert footer ── */}
      <div className="mx-5 mb-4 rounded-xl px-4 py-3 flex items-start gap-3"
        style={{ background: "#ffeaea", border: "1px solid #e05c5c33" }}>
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#e05c5c" }} />
        <p className="text-xs leading-relaxed" style={{ color: "#e05c5c" }}>
          <strong>1 urgent ticket</strong> requires immediate attention.{" "}
          <strong>2 tickets are overdue</strong> and past their SLA deadline.
        </p>
      </div>
    </div>
  );
}
