import { useState, useEffect, useCallback } from "react";
import {
  Ticket, AlertTriangle, CheckCircle2, Clock, Pause,
  ExternalLink, ChevronDown, ChevronUp,
  AlertCircle, BarChart3, Loader2,
  Activity, CloudCog, Wifi, WifiOff, X, Download,
  Server, Zap, Brain, Radio, ListChecks, MonitorCheck,
} from "lucide-react";
import {
  MULESOFT_APIS, MULESOFT_ALERTS,
  MULESOFT_SCHEDULERS, JIRA_TICKETS,
} from "@/data/mockIntegrationData";
import { PROJECT_TICKETS } from "@/data/projectTickets";
import { useTicketPipeline } from "@/hooks/useTicketPipeline";
import { generateHealthCheckXLSX } from "@/lib/xlsxHealthReport";

const BACKEND = "http://localhost:3001";

export type IntegrationId = "zoho" | "mulesoft" | "anypoint" | "jira" | "datadog";

export const INTEGRATIONS: {
  id: IntegrationId; label: string; shortLabel: string;
  color: string; bg: string; url: string;
}[] = [
  { id: "zoho",      label: "Zoho Desk",        shortLabel: "Zoho",      color: "#e05c5c", bg: "#ffeaea", url: "https://desk.zoho.in"               },
  { id: "mulesoft",  label: "MuleSoft CloudHub", shortLabel: "CloudHub",  color: "#002060", bg: "#e8eaf6", url: "https://anypoint.mulesoft.com/cloudhub" },
  { id: "anypoint",  label: "Anypoint Studio",   shortLabel: "Anypoint",  color: "#1976d2", bg: "#e3f2fd", url: "https://anypoint.mulesoft.com"      },
  { id: "jira",      label: "Jira",              shortLabel: "Jira",      color: "#0052cc", bg: "#e6f0ff", url: "https://www.atlassian.com/software/jira" },
  { id: "datadog",   label: "Datadog",           shortLabel: "Datadog",   color: "#774aa4", bg: "#f3e8ff", url: "https://app.datadoghq.com"          },
];

const priorityCfg: Record<string, { col: string; bg: string }> = {
  Urgent: { col: "#e05c5c", bg: "#ffeaea" }, High: { col: "#f0a500", bg: "#fff7e6" },
  Critical:{ col:"#e05c5c", bg:"#ffeaea" }, Medium:{ col:"#7c6ef5", bg:"#ede8ff" },
  Low:    { col: "#52b788", bg: "#edfaf3" },
};
const statusCfg: Record<string, { col: string; bg: string; Icon: any }> = {
  "Open":        { col: "#e05c5c", bg: "#ffeaea", Icon: AlertCircle  },
  "In Progress": { col: "#7c6ef5", bg: "#ede8ff", Icon: Activity     },
  "On Hold":     { col: "#f0a500", bg: "#fff7e6", Icon: Pause        },
  "Done":        { col: "#52b788", bg: "#edfaf3", Icon: CheckCircle2 },
  "Resolved":    { col: "#52b788", bg: "#edfaf3", Icon: CheckCircle2 },
};

// ── Shared: AI Report Modal ───────────────────────────────────────────────────
function ReportModal({ system, stats, items, onClose }: {
  system: string; stats: any; items: any[]; onClose: () => void;
}) {
  const [report,   setReport]   = useState("");
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${BACKEND}/report`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ system, stats, items }),
        });
        const d = await r.json();
        setReport(d.report || "Failed to generate report.");
      } catch {
        setReport("Could not reach backend.\nMake sure the server is running:\n  cd server && node index.js");
      }
      setLoading(false);
    })();
  }, []);

  function download() {
    const blob = new Blob([report], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${system}-governance-report-${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
  }

  const intg = INTEGRATIONS.find(i => i.id === system);
  const col  = intg?.color ?? "#9b8ff5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-xl max-h-[85vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "var(--card)", border: `1px solid ${col}30` }}>
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: `1px solid ${col}15` }}>
          <div>
            <h3 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
              {intg?.label ?? system} — AI Governance Report
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              Generated · {new Date().toDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {report && !loading && (
              <button onClick={download}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold text-white"
                style={{ background: `linear-gradient(135deg,${col},${col}cc)` }}>
                <Download className="h-3 w-3" /> Download
              </button>
            )}
            <button onClick={onClose} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-secondary transition">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
        {/* body */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
              <Loader2 className="h-7 w-7 animate-spin" style={{ color: col }} />
              <p className="text-xs">Generating AI report from live data…</p>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap text-xs leading-6 font-sans" style={{ color: "var(--foreground)" }}>
              {report}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Shared: Stats row ─────────────────────────────────────────────────────────
function StatCards({ cards }: { cards: { label: string; value: number | string; col: string; bg: string; Icon?: any }[] }) {
  return (
    <div className="flex gap-3">
      {cards.map(s => (
        <div key={s.label} className="flex-1 rounded-xl p-3 flex flex-col gap-1"
          style={{ background: s.bg, border: `1px solid ${s.col}33` }}>
          {s.Icon && <s.Icon className="h-3.5 w-3.5 mb-0.5" style={{ color: s.col }} />}
          <p className="text-xl font-bold leading-none" style={{ color: s.col }}>{s.value}</p>
          <p className="text-[10px] font-medium" style={{ color: s.col, opacity: 0.75 }}>{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ── Shared: Tab header row ────────────────────────────────────────────────────
function TabHeader({ subtitle, url, label, isLive, onReport, system, stats, items, hideReport }: {
  subtitle: string; url: string; label: string; isLive: boolean;
  onReport: () => void; system: string; stats: any; items: any[]; hideReport?: boolean;
}) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div>
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{subtitle}</p>
        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold mt-1 px-1.5 py-0.5 rounded-full`}
          style={{
            background: isLive ? "rgba(82,183,136,0.10)" : "rgba(240,165,0,0.10)",
            color: isLive ? "#52b788" : "#f0a500",
            border: `1px solid ${isLive ? "rgba(82,183,136,0.25)" : "rgba(240,165,0,0.25)"}`,
          }}>
          {isLive ? <Wifi className="h-2.5 w-2.5" /> : <WifiOff className="h-2.5 w-2.5" />}
          {isLive ? "Live data" : "Mock data"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {!hideReport && (
          <button onClick={onReport}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold text-white hover:opacity-90 transition"
            style={{ background: "linear-gradient(135deg,#7c6ef5,#a78ef8)" }}>
            <BarChart3 className="h-3 w-3" /> Generate Report
          </button>
        )}
        <a href={url} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium text-white transition hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#002060,#1a4a8a)" }}>
          <ExternalLink className="h-3 w-3" /> Open {label}
        </a>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ZOHO TAB — Real-time pipeline via WebSocket
// ══════════════════════════════════════════════════════════════════════════════
function ZohoTab({ activeProject }: { activeProject?: string }) {
  const { tickets: pipelineTickets, stats, status, lastEvent, processing } = useTicketPipeline();
  const [expanded,       setExpanded]       = useState(false);
  const [showReport,     setShowReport]     = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [pptLoading,     setPptLoading]     = useState(false);
  const [fetchSource,    setFetchSource]    = useState<"loading" | "live" | "mock">("loading");
  const [projectBase,    setProjectBase]    = useState<any[]>(
    PROJECT_TICKETS[activeProject ?? "Mulberry Support Team"] ?? []
  );

  // Fetch live tickets from backend (Zoho) or fall back to mock
  useEffect(() => {
    setFetchSource("loading");
    fetch(`${BACKEND}/api/zoho/tickets`)
      .then(r => { if (!r.ok) throw new Error("non-ok"); return r.json(); })
      .then(data => {
        const raw: any[] = data.tickets ?? [];
        if (raw.length > 0) {
          const normalised = raw.map((t: any) => ({
            id:         t.id ?? t.ticketNumber ?? "",
            subject:    t.subject ?? "",
            status:     t.status ?? "Open",
            priority:   t.priority ?? "Medium",
            department: typeof t.department === "string"
                          ? { name: t.department }
                          : (t.department ?? { name: "General" }),
            contact: {
              firstName: t.assignee?.split(" ")[0] ?? "Agent",
              lastName:  t.assignee?.split(" ")[1] ?? "",
              email:     "",
            },
            aiAnalysis: {
              urgencyScore: t.priority === "Urgent" ? 90
                          : t.priority === "High"   ? 72
                          : t.priority === "Medium" ? 50 : 30,
            },
          }));
          setProjectBase(normalised);
          setFetchSource(data.source === "zoho" ? "live" : "mock");
        } else {
          setProjectBase(PROJECT_TICKETS[activeProject ?? "Mulberry Support Team"] ?? []);
          setFetchSource("mock");
        }
      })
      .catch(() => {
        setProjectBase(PROJECT_TICKETS[activeProject ?? "Mulberry Support Team"] ?? []);
        setFetchSource("mock");
      });
  }, [activeProject]);

  // Reset expanded/selected when project switches
  useEffect(() => {
    setExpanded(false);
    setSelectedTicket(null);
  }, [activeProject]);

  // Merge: live pipeline tickets first (deduped), then project base
  const pipelineIds = new Set(pipelineTickets.map((t: any) => t.id));
  const tickets = [
    ...pipelineTickets,
    ...projectBase.filter((t: any) => !pipelineIds.has(t.id)),
  ];

  async function downloadGovernancePPT(period: "weekly" | "monthly") {
    setPptLoading(true);
    const proj = activeProject ?? "Mulberry Support Team";
    try {
      const res = await fetch(
        `${BACKEND}/api/ppt/${period}?project=${encodeURIComponent(proj)}`,
        { method: "POST" }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Server error" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const blob    = await res.blob();
      const url     = URL.createObjectURL(blob);
      const a       = document.createElement("a");
      a.href        = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      a.download    = `AbsoluteLabs-${period === "weekly" ? "Weekly" : "Monthly"}-Governance-${dateStr}.pptx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(`Failed to generate ${period} PPT: ${(e as Error).message}\n\nMake sure the server is running: npm run server`);
    } finally {
      setPptLoading(false);
    }
  }

  const isLive   = fetchSource === "live";
  const visible  = expanded ? tickets : tickets.slice(0, 6);
  // Always compute stats from the full merged list so project tickets are counted
  const liveStats = {
    total:    tickets.length,
    open:     tickets.filter((t: any) => t.status === "Open").length,
    onHold:   tickets.filter((t: any) => t.status === "On Hold").length,
    resolved: tickets.filter((t: any) => ["Resolved","Closed"].includes(t.status)).length,
    urgent:   tickets.filter((t: any) => t.priority === "Urgent").length,
    avgUrgency: Math.round(
      tickets.reduce((s: number, t: any) => s + (t.aiAnalysis?.urgencyScore ?? 50), 0) / (tickets.length || 1)
    ),
  };

  return (
    <div className="space-y-4">
      {selectedTicket && <TicketDetailModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />}

      {/* ── Governance Report PPT buttons — TOP PRIORITY ACTION ── */}
      <div className="rounded-2xl p-4" style={{ background: "rgba(198,193,247,0.06)", border: "1px solid rgba(198,193,247,0.18)" }}>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4" style={{ color: "#C6C1F7" }} />
          <span className="text-sm font-semibold" style={{ color: "#C6C1F7" }}>Governance Reports</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full ml-auto" style={{ background: "rgba(198,193,247,0.12)", color: "#9b8ff5" }}>
            .pptx · ABL format
          </span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => downloadGovernancePPT("weekly")}
            disabled={pptLoading}
            className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#272437,#C6C1F7 320%)", border: "1px solid rgba(198,193,247,0.4)" }}
          >
            {pptLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Weekly Governance Report
          </button>
          <button
            onClick={() => downloadGovernancePPT("monthly")}
            disabled={pptLoading}
            className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#272437,#9b8ff5 280%)", border: "1px solid rgba(155,143,245,0.4)" }}
          >
            {pptLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Monthly Governance Report
          </button>
        </div>
        <p className="text-[10px] mt-2" style={{ color: "rgba(255,255,255,0.3)" }}>
          {fetchSource === "live" ? "✓ Synced with live Zoho data" : "Using cached ticket data — start server for live Zoho sync"}
        </p>
      </div>

      {/* Header */}
      <TabHeader
        subtitle={`${liveStats.total} tickets · ${activeProject ?? "Mulberry Support Team"}`}
        url="https://desk.zoho.in" label="Zoho Desk"
        isLive={isLive} onReport={() => {}}
        system="zoho" stats={liveStats} items={tickets}
        hideReport
      />

      {/* Pipeline status bar */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
        style={{
          background: status === "connected" ? "rgba(82,183,136,0.06)" : "rgba(240,165,0,0.06)",
          border: `1px solid ${status === "connected" ? "rgba(82,183,136,0.2)" : "rgba(240,165,0,0.2)"}`,
        }}>
        <Radio className="h-3 w-3 shrink-0" style={{ color: status === "connected" ? "#52b788" : "#f0a500" }} />
        <span style={{ color: status === "connected" ? "#52b788" : "#f0a500" }}>
          {status === "connected" ? "Pipeline live" : status === "connecting" ? "Connecting…" : "Pipeline offline — run: node pipeline.js"}
        </span>
        {processing && (
          <span className="flex items-center gap-1 ml-auto" style={{ color: "#9b8ff5" }}>
            <Loader2 className="h-3 w-3 animate-spin" />
            <Brain className="h-3 w-3" />
            AI processing…
          </span>
        )}
        {lastEvent && !processing && (
          <span className="ml-auto text-[10px] truncate max-w-[200px]" style={{ color: "var(--muted-foreground)" }}>
            {lastEvent}
          </span>
        )}
      </div>

      {/* Drop-zone hint */}
      <div className="rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs"
        style={{ background: "rgba(124,110,245,0.05)", border: "1px dashed rgba(124,110,245,0.2)" }}>
        <Zap className="h-3.5 w-3.5 shrink-0" style={{ color: "#9b8ff5" }} />
        <span style={{ color: "var(--muted-foreground)" }}>
          Drop any <code className="px-1 rounded" style={{ background: "var(--muted)" }}>.json</code> ticket file into{" "}
          <code className="px-1 rounded" style={{ background: "var(--muted)" }}>server/data/inbox/</code>{" "}
          → AI auto-classifies &amp; updates here in real-time. Use{" "}
          <strong style={{ color: "#9b8ff5" }}>sample-new-ticket.json</strong> to test.
        </span>
      </div>

      {/* Stats */}
      <StatCards cards={[
        { label: "Total",    value: liveStats.total,    col: "#7c6ef5", bg: "#ede8ff", Icon: Ticket       },
        { label: "Open",     value: liveStats.open,     col: "#e05c5c", bg: "#ffeaea", Icon: AlertCircle  },
        { label: "On Hold",  value: liveStats.onHold,   col: "#f0a500", bg: "#fff7e6", Icon: Pause        },
        { label: "Resolved", value: liveStats.resolved, col: "#52b788", bg: "#edfaf3", Icon: CheckCircle2 },
      ]} />

      {/* Avg urgency bar */}
      {stats && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--muted)" }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${stats.avgUrgency}%`,
                background: stats.avgUrgency > 75 ? "#e05c5c" : stats.avgUrgency > 50 ? "#f0a500" : "#52b788",
              }} />
          </div>
          <span className="text-[10px] font-semibold shrink-0" style={{ color: "var(--muted-foreground)" }}>
            Avg AI urgency: <strong style={{ color: stats.avgUrgency > 75 ? "#e05c5c" : "#f0a500" }}>{stats.avgUrgency}</strong>/100
          </span>
        </div>
      )}

      {/* Ticket list */}
      {status === "connecting" && tickets.length === 0 ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
          <Loader2 className="h-4 w-4 animate-spin" /> Connecting to pipeline…
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((t: any) => {
            const sCfg = statusCfg[t.status] ?? statusCfg["Open"];
            const pCfg = priorityCfg[t.priority] ?? priorityCfg["Medium"];
            const SI   = sCfg.Icon;
            const ai   = t.aiAnalysis;

            return (
              <button key={t.id}
                onClick={() => setSelectedTicket(t)}
                className="w-full text-left rounded-xl p-3 hover:bg-secondary/40 transition border border-transparent hover:border-border"
                style={{ background: t.isEscalated ? "rgba(224,92,92,0.04)" : "transparent" }}>
                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: sCfg.bg }}>
                    <SI className="h-3.5 w-3.5" style={{ color: sCfg.col }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium leading-snug truncate" style={{ color: "var(--foreground)" }}>{t.subject}</p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="text-[10px] font-mono" style={{ color: "var(--muted-foreground)" }}>#{t.id}</span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: sCfg.bg, color: sCfg.col }}>{t.status}</span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: pCfg.bg, color: pCfg.col }}>{t.priority}</span>
                      <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{t.department?.name ?? ""}</span>
                      {t.isEscalated && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#ffeaea", color: "#e05c5c" }}>ESCALATED</span>
                      )}
                    </div>
                    {/* AI urgency bar */}
                    {ai && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <Brain className="h-2.5 w-2.5 shrink-0" style={{ color: "#9b8ff5" }} />
                        <div className="flex-1 h-1 rounded-full" style={{ background: "var(--muted)" }}>
                          <div className="h-full rounded-full"
                            style={{
                              width: `${ai.urgencyScore}%`,
                              background: ai.urgencyScore > 80 ? "#e05c5c" : ai.urgencyScore > 60 ? "#f0a500" : "#52b788",
                            }} />
                        </div>
                        <span className="text-[9px] font-semibold shrink-0" style={{ color: "var(--muted-foreground)" }}>
                          {ai.urgencyScore}/100
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] shrink-0 mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                    {new Date(t.createdTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {tickets.length > 6 && (
        <button onClick={() => setExpanded(e => !e)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium hover:bg-secondary/40 transition"
          style={{ border: "1px dashed rgba(124,110,245,0.20)", color: "var(--muted-foreground)" }}>
          {expanded ? <><ChevronUp className="h-3.5 w-3.5" /> Show less</> : <><ChevronDown className="h-3.5 w-3.5" /> Show {tickets.length - 6} more</>}
        </button>
      )}
    </div>
  );
}

// ── Ticket detail modal with AI analysis ─────────────────────────────────────
// ── Smart ticket-specific investigation guide ─────────────────────────────────
function deriveInvestigationGuide(ticket: any, ai: any): {
  steps: string[];
  systems: { system: string; action: string }[];
} {
  const subj    = (ticket.subject      || "").toLowerCase();
  const desc    = (ticket.description  || "").toLowerCase();
  const pattern = (ai?.pattern         || "").toLowerCase();
  const client  = ticket.department?.name || ticket.team?.name || "";

  // ── keyword flags ──────────────────────────────────────────────────────────
  const is500         = subj.includes("500")            || desc.includes("500 error");
  const is504         = subj.includes("504")            || desc.includes("504");
  const isCheckout    = subj.includes("checkout")       || desc.includes("checkout");
  const isDeploy      = subj.includes("deploy")         || desc.includes("deploy")         || desc.includes("release");
  const isCircuit     = subj.includes("circuit breaker")|| desc.includes("circuit breaker");
  const isPayment     = subj.includes("payment")        || desc.includes("payment");
  const isSalesforce  = subj.includes("salesforce")     || desc.includes("salesforce");
  const isLatency     = subj.includes("latency")        || subj.includes("timeout")        || subj.includes("slow") || desc.includes("latency");
  const isInventory   = subj.includes("inventory")      || subj.includes("stock")          || desc.includes("stock discrepanc");
  const isPriceFeed   = subj.includes("price")          || subj.includes("pricing")        || desc.includes("price");
  const isCache       = pattern.includes("cache")       || desc.includes("cache");
  const isAccess      = subj.includes("access")         || subj.includes("onboarding")     || subj.includes("provisioned") || subj.includes("permission");
  const isSAP         = subj.includes("sap")            || desc.includes("sap");
  const isScheduler   = subj.includes("scheduler")      || subj.includes("feed")           || desc.includes("scheduler");
  const isMulesoft    = subj.includes("mulesoft")       || desc.includes("mulesoft")       || desc.includes("cloudhub");
  const isCRM         = subj.includes("crm")            || desc.includes("crm sync");
  const isWren        = client.toLowerCase().includes("wren");
  const isFenwick     = client.toLowerCase().includes("fenwick");

  // ── 500 errors after deployment ────────────────────────────────────────────
  if (is500 && isDeploy && isCheckout) return {
    steps: [
      `Identify the exact release deployed at the time ${client ? "for " + client : ""} — review Azure DevOps deployment history`,
      "Check CloudHub logs for the checkout / payment confirmation flow — filter by 500 error codes since deployment time",
      "Isolate whether the 500 is thrown by MuleSoft, the payment provider, or the frontend — check each log separately",
      "If a clear regression is found in the deployment diff: initiate a rollback via Azure DevOps immediately",
      "Notify the client with an ETA once root cause is confirmed — revenue impact is active",
    ],
    systems: [
      { system: "Azure",    action: `Find the release deployed at 14:00 UTC — review the diff and assess rollback risk` },
      { system: "CloudHub", action: "Filter checkout flow logs for HTTP 500 — check payment confirmation step specifically" },
      { system: "Datadog",  action: "Check checkout error rate monitor — confirm % of users affected and when it started" },
    ],
  };

  // ── 504 / gateway timeout on checkout ─────────────────────────────────────
  if (is504 && isCheckout) return {
    steps: [
      "Check Order API p95 latency in Datadog — confirm if 504s are ongoing or have resolved",
      "Review CloudHub worker allocation for Order API — check if all workers are saturated or queuing",
      "Trace the 504 upstream — check if the timeout is from Salesforce, inventory API, or the payment provider",
      "If still active: immediately increase CloudHub worker count or trigger auto-scaling",
      "Verify silent payment failures — cross-check order records vs payment gateway transaction logs",
    ],
    systems: [
      { system: "Datadog",  action: "Check Order API latency graph — find the exact time 504s started and current rate" },
      { system: "CloudHub", action: "Check Order API worker utilisation and queue depth — scale up if needed" },
      { system: "Jira",     action: "Check if any config change was made to Order API retry or timeout settings recently" },
    ],
  };

  // ── circuit breaker ────────────────────────────────────────────────────────
  if (isCircuit && isPayment) return {
    steps: [
      "Check CloudHub for the Payment Gateway flow — confirm circuit breaker state (open/closed/half-open)",
      "Review the error threshold that triggered the circuit breaker — check if the underlying cause is still active",
      "Check the payment provider status page for any declared outages or degraded service",
      "Do NOT reset the circuit breaker until the root cause is confirmed — resetting too early will re-trip it",
      "Once payment provider is healthy: reset circuit breaker and monitor for 10 minutes before closing this ticket",
    ],
    systems: [
      { system: "CloudHub", action: "Find the Payment Gateway flow — check circuit breaker state and error logs" },
      { system: "Datadog",  action: "Check payment API error rate monitor — review the spike that triggered the breaker" },
      { system: "Jira",     action: "Log the incident timeline for post-mortem — note trigger time and resolution steps" },
    ],
  };

  // ── Salesforce CRM latency ─────────────────────────────────────────────────
  if (isSalesforce && (isLatency || isCRM)) return {
    steps: [
      "Check Salesforce API response times in Datadog — confirm whether Salesforce itself is slow or MuleSoft connector is",
      "Review MuleSoft Salesforce connector configuration — check connection pool size and timeout settings",
      "Check Salesforce governor limits in the Salesforce admin panel — confirm API call limits haven't been hit",
      "If Salesforce is healthy: tune the MuleSoft connector batch size to reduce per-call overhead",
      "Consider async CRM sync for non-critical updates to prevent SLA breach on critical flows",
    ],
    systems: [
      { system: "CloudHub",   action: "Check Salesforce connector config — review connection pool and timeout values" },
      { system: "Datadog",    action: "Compare Salesforce API latency vs MuleSoft processing time to isolate bottleneck" },
      { system: "Salesforce", action: "Check governor limits dashboard — verify API call count and daily limits" },
    ],
  };

  // ── Inventory / stock sync (Wren Kitchens / Infor) ────────────────────────
  if (isInventory) return {
    steps: [
      `Check CloudHub inventory sync scheduler for ${client || "this client"} — confirm last successful run timestamp`,
      "Compare stock record counts between source system and destination — identify which SKUs are mismatched",
      isSAP || isWren
        ? "Check Infor / SAP product master for schema changes — a field mapping change can silently break sync"
        : "Check source system for any recent schema or field mapping changes",
      "Review CloudHub sync logs for the specific error — look for 'record not found' or 'mapping failed' errors",
      "Trigger a manual targeted re-sync for the affected SKUs once root cause is confirmed",
    ],
    systems: [
      { system: "CloudHub", action: `Find the inventory sync flow for ${client || "this client"} — check scheduler last run and error log` },
      { system: "Jira",     action: "Check if any recent changes were made to the inventory mapping or transformation logic" },
      { system: "Datadog",  action: "Check for any inventory sync failure alerts that fired before this ticket was raised" },
    ],
  };

  // ── Price feed / cache ─────────────────────────────────────────────────────
  if (isPriceFeed || isCache) return {
    steps: [
      `Confirm whether cache invalidation was triggered after the pricing engine update for ${client || "this client"}`,
      isCache
        ? "Manually flush the price cache — check the cache management tool or CDN purge endpoint"
        : "Check CloudHub price feed scheduler — verify it ran after the pricing engine was updated",
      "Verify the prices are correct in the source pricing engine before re-propagating to avoid pushing wrong prices",
      "Confirm price propagation to frontend after cache flush — check 3-5 specific promotional SKUs",
      "If prices still not updating: check if the frontend is reading from a secondary cache layer",
    ],
    systems: [
      { system: "CloudHub", action: `Check price feed sync flow for ${client || "this client"} — verify last run and confirm correct data was sent` },
      { system: "Datadog",  action: "Check for CDN cache miss alerts or price feed delivery failure monitors" },
      { system: "Zoho",     action: "Check if similar price propagation issues were raised during previous sale events" },
    ],
  };

  // ── Access / onboarding ────────────────────────────────────────────────────
  if (isAccess) return {
    steps: [
      `Confirm the employee's full details — name, role, and which systems they need access to at ${client || "this client"}`,
      "Check Azure AD — verify if the account exists but hasn't been assigned to the correct security groups",
      "Check if the onboarding automation flow ran in CloudHub — look for provisioning job logs",
      "If automation failed: manually provision access via the admin portal and log the exception",
      "Raise a Jira task to investigate why the automated provisioning failed to prevent recurrence",
    ],
    systems: [
      { system: "Azure",    action: "Check Azure AD — find user account, verify group membership and licence assignment" },
      { system: "CloudHub", action: "Find onboarding provisioning flow — check logs for this employee's job run" },
      { system: "Jira",     action: "Log access provisioning task for audit trail and flag automation failure" },
    ],
  };

  // ── MuleSoft generic ──────────────────────────────────────────────────────
  if (isMulesoft || isScheduler) return {
    steps: [
      "Open CloudHub and find the specific flow mentioned in the ticket — confirm it is in Started state",
      "Filter flow logs by the timestamp in the ticket — look for ERROR or WARN level entries",
      "Check if a scheduler is involved — confirm it ran at the expected time and review output record count",
      "Determine if this is a data issue (bad payload) or infrastructure issue (connectivity, timeout)",
      "If infrastructure: check CloudHub worker health. If data: identify which record caused the failure",
    ],
    systems: [
      { system: "CloudHub", action: "Find the affected flow — check runtime status, worker health, and error logs" },
      { system: "Datadog",  action: "Check MuleSoft integration monitors for alerts around the ticket timestamp" },
      { system: "Jira",     action: "Check for any recent deployments or config changes to this flow" },
    ],
  };

  // ── Default fallback ──────────────────────────────────────────────────────
  return {
    steps: [
      `Identify the exact system causing the issue in this ${client ? client + " " : ""}ticket — read description carefully`,
      "Check CloudHub for any related integration flows — look for errors around the ticket creation time",
      "Search Zoho for similar tickets from this client or department raised in the last 7 days",
      "Check Datadog for any monitors that fired around the same time as this ticket",
      "Escalate to senior engineer if the issue is still unclear after initial investigation",
    ],
    systems: [
      { system: "Zoho",     action: `Search for related tickets from ${client || "this client"} — identify if this is a recurring pattern` },
      { system: "CloudHub", action: "Check integration flow status and logs around the ticket creation timestamp" },
      { system: "Datadog",  action: "Review any active monitors or recent alert history for the affected service" },
    ],
  };
}

function TicketDetailModal({ ticket, onClose }: { ticket: any; onClose: () => void }) {
  const ai  = ticket.aiAnalysis;
  const sCfg = statusCfg[ticket.status] ?? statusCfg["Open"];
  const pCfg = priorityCfg[ticket.priority] ?? priorityCfg["Medium"];
  const SI   = sCfg.Icon;

  // Always use keyword-derived guide for ticket-specific steps
  const { steps, systems } = deriveInvestigationGuide(ticket, ai);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "var(--card)", border: "1px solid rgba(124,110,245,0.2)" }}>

        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(124,110,245,0.08)" }}>
          <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: sCfg.bg }}>
            <SI className="h-4 w-4" style={{ color: sCfg.col }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-snug" style={{ color: "var(--foreground)" }}>{ticket.subject}</p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-[10px] font-mono font-bold" style={{ color: "#9b8ff5" }}>#{ticket.id}</span>
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: sCfg.bg, color: sCfg.col }}>{ticket.status}</span>
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: pCfg.bg, color: pCfg.col }}>{ticket.priority}</span>
            </div>
          </div>
          <button onClick={onClose} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-secondary transition shrink-0">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Description */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--muted-foreground)" }}>Description</p>
            <p className="text-xs leading-5" style={{ color: "var(--foreground)" }}>{ticket.description}</p>
          </div>

          {/* Contact + Dept */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3" style={{ background: "var(--background)", border: "1px solid rgba(124,110,245,0.08)" }}>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--muted-foreground)" }}>Contact</p>
              <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{ticket.contact?.firstName} {ticket.contact?.lastName}</p>
              <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{ticket.contact?.email}</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: "var(--background)", border: "1px solid rgba(124,110,245,0.08)" }}>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "var(--muted-foreground)" }}>Department</p>
              <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{ticket.department?.name}</p>
              <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{ticket.channel} · {ticket.classification}</p>
            </div>
          </div>

          {/* AI Analysis */}
          {ai && (
            <div className="rounded-xl p-4 space-y-3"
              style={{ background: "rgba(155,143,245,0.06)", border: "1px solid rgba(155,143,245,0.2)" }}>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4" style={{ color: "#9b8ff5" }} />
                <p className="text-xs font-bold" style={{ color: "#9b8ff5" }}>AI Analysis — Groq LLaMA 3</p>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold"
                  style={{ background: ai.urgencyScore > 80 ? "#ffeaea" : ai.urgencyScore > 60 ? "#fff7e6" : "#edfaf3",
                           color: ai.urgencyScore > 80 ? "#e05c5c" : ai.urgencyScore > 60 ? "#f0a500" : "#52b788" }}>
                  Urgency {ai.urgencyScore}/100
                </span>
              </div>

              <div>
                <p className="text-[10px] font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>PATTERN DETECTED</p>
                <p className="text-xs" style={{ color: "var(--foreground)" }}>{ai.pattern}</p>
              </div>

              {ai.riskFlag && (
                <div className="flex items-start gap-2 rounded-lg px-3 py-2"
                  style={{ background: "rgba(224,92,92,0.08)", border: "1px solid rgba(224,92,92,0.2)" }}>
                  <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5 text-[#e05c5c]" />
                  <p className="text-[11px]" style={{ color: "#e05c5c" }}>{ai.riskFlag}</p>
                </div>
              )}

              <div>
                <p className="text-[10px] font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>AI DRAFT RESPONSE</p>
                <div className="rounded-lg p-3 text-xs leading-5"
                  style={{ background: "var(--card)", border: "1px solid rgba(124,110,245,0.12)", color: "var(--foreground)" }}>
                  {ai.draftResponse}
                </div>
              </div>

              <div className="flex items-center gap-4 text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                <span>Est. resolution: <strong style={{ color: "var(--foreground)" }}>{ai.estimatedResolutionHours}h</strong></span>
                <span>Category: <strong style={{ color: "var(--foreground)" }}>{ai.category}</strong></span>
                <span className="ml-auto">Processed: {new Date(ai.processedAt).toLocaleTimeString("en-GB")}</span>
              </div>
            </div>
          )}

          {/* ── RECOMMENDED STEPS ── */}
          <div className="rounded-xl p-4 space-y-3"
            style={{ background: "rgba(82,183,136,0.05)", border: "1px solid rgba(82,183,136,0.2)" }}>
            <div className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" style={{ color: "#52b788" }} />
              <p className="text-xs font-bold" style={{ color: "#52b788" }}>Recommended Steps for Engineer</p>
            </div>
            <ol className="space-y-2">
              {steps.map((step: string, i: number) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span
                    className="shrink-0 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
                    style={{ background: "rgba(82,183,136,0.15)", color: "#52b788" }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-xs leading-5" style={{ color: "var(--foreground)" }}>{step}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* ── SYSTEMS TO CHECK ── */}
          <div className="rounded-xl p-4 space-y-3"
            style={{ background: "rgba(124,110,245,0.05)", border: "1px solid rgba(124,110,245,0.18)" }}>
            <div className="flex items-center gap-2">
              <MonitorCheck className="h-4 w-4" style={{ color: "#9b8ff5" }} />
              <p className="text-xs font-bold" style={{ color: "#9b8ff5" }}>Systems to Investigate</p>
            </div>
            <div className="space-y-2">
              {systems.map((s: { system: string; action: string }, i: number) => {
                const sysColors: Record<string, { col: string; bg: string }> = {
                  CloudHub:  { col: "#002060", bg: "rgba(0,32,96,0.08)"    },
                  Jira:      { col: "#0052cc", bg: "rgba(0,82,204,0.08)"   },
                  Datadog:   { col: "#774aa4", bg: "rgba(119,74,164,0.08)" },
                  Zoho:      { col: "#e05c5c", bg: "rgba(224,92,92,0.08)"  },
                  Salesforce:{ col: "#00a1e0", bg: "rgba(0,161,224,0.08)"  },
                  Azure:     { col: "#0078d4", bg: "rgba(0,120,212,0.08)"  },
                };
                const cfg = sysColors[s.system] ?? { col: "#9b8ff5", bg: "rgba(155,143,245,0.08)" };
                return (
                  <div key={i} className="flex items-start gap-2.5 rounded-lg px-3 py-2"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.col}30` }}>
                    <span
                      className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5"
                      style={{ background: cfg.col, color: "#fff" }}
                    >
                      {s.system}
                    </span>
                    <p className="text-xs leading-5" style={{ color: "var(--foreground)" }}>{s.action}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resolution if closed */}
          {ticket.resolution && (
            <div className="rounded-xl p-3" style={{ background: "rgba(82,183,136,0.06)", border: "1px solid rgba(82,183,136,0.2)" }}>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: "#52b788" }}>Resolution</p>
              <p className="text-xs" style={{ color: "var(--foreground)" }}>{ticket.resolution}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MULESOFT TAB
// ══════════════════════════════════════════════════════════════════════════════
function MuleSoftTab({ activeProject }: { activeProject?: string }) {
  const [services,   setServices]   = useState<any[]>([]);
  const [isLive,     setIsLive]     = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [showAll,    setShowAll]    = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${BACKEND}/health/integrations`);
        if (r.ok) { const d = await r.json(); setServices(d.services ?? []); setIsLive(true); }
      } catch {}
      setLoading(false);
    })();
  }, []);

  // Merge backend health with mock API list for display
  const apis    = MULESOFT_APIS;
  const visible = showAll ? apis : apis.slice(0, 8);
  const stats   = {
    total:      apis.length,
    running:    apis.filter(a => a.status === "Started").length,
    alerts:     MULESOFT_ALERTS.length,
    schedulers: MULESOFT_SCHEDULERS.filter(s => s.status === "Enabled").length,
  };

  return (
    <div className="space-y-5">
      {showReport && <ReportModal system="mulesoft" stats={stats} items={[...apis.slice(0,10), ...MULESOFT_ALERTS]} onClose={() => setShowReport(false)} />}

      <TabHeader subtitle={`${apis.length} APIs · CloudHub Production`} url="https://anypoint.mulesoft.com/cloudhub" label="CloudHub"
        isLive={isLive} onReport={() => setShowReport(true)} system="mulesoft" stats={stats} items={apis} />

      {/* Health Check XLSX Download */}
      <button
        onClick={() => { try { generateHealthCheckXLSX(activeProject); } catch(e) { alert("Failed to generate report"); } }}
        className="w-full inline-flex items-center justify-center gap-2 h-9 px-4 rounded-xl text-xs font-semibold text-white transition hover:opacity-90"
        style={{ background: "linear-gradient(135deg,#002060,#1a4a8a)", border: "1px solid rgba(0,32,96,0.4)" }}
      >
        <Download className="h-3.5 w-3.5" />
        Download Weekly Health Check Report (.xlsx)
      </button>

      {/* Backend health cards if live */}
      {!loading && services.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {services.slice(0, 3).map(s => {
            const up = parseFloat(s.uptime);
            const col = up >= 99 ? "#52b788" : up >= 95 ? "#f0a500" : "#e05c5c";
            return (
              <div key={s.name} className="rounded-xl p-3" style={{ background: "var(--secondary)", border: `1px solid ${col}30` }}>
                <p className="text-[10px] font-semibold truncate mb-1" style={{ color: "var(--muted-foreground)" }}>{s.name}</p>
                <p className="text-sm font-bold" style={{ color: col }}>{s.uptime}%</p>
                <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{s.latency} · {s.err} err</p>
              </div>
            );
          })}
        </div>
      )}

      <StatCards cards={[
        { label: "Total APIs",  value: stats.total,      col: "#002060", bg: "#e8eaf6" },
        { label: "Running",     value: stats.running,    col: "#52b788", bg: "#edfaf3" },
        { label: "Alerts",      value: stats.alerts,     col: "#e05c5c", bg: "#ffeaea" },
        { label: "Schedulers",  value: stats.schedulers, col: "#7c6ef5", bg: "#ede8ff" },
      ]} />

      <div>
        <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: "var(--foreground)" }}>
          <Server className="h-3.5 w-3.5 text-primary" /> Deployed APIs
        </p>
        <div className="space-y-1">
          {visible.map((api: any) => (
            <div key={api.api} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/40 transition">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ background: "#52b788", boxShadow: "0 0 6px #52b78866" }} />
              <span className="text-xs font-mono flex-1" style={{ color: "var(--foreground)" }}>{api.api}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: "#e8eaf6", color: "#002060" }}>{api.workerSize}</span>
              <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{api.workers}w · v{api.runtime}</span>
            </div>
          ))}
        </div>
        {apis.length > 8 && (
          <button onClick={() => setShowAll(s => !s)}
            className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium hover:bg-secondary/40 transition"
            style={{ border: "1px dashed rgba(0,32,96,0.20)", color: "var(--muted-foreground)" }}>
            {showAll ? <><ChevronUp className="h-3.5 w-3.5" /> Collapse</> : <><ChevronDown className="h-3.5 w-3.5" /> Show all {apis.length} APIs</>}
          </button>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: "var(--foreground)" }}>
          <AlertTriangle className="h-3.5 w-3.5" style={{ color: "#e05c5c" }} /> Active Alerts
        </p>
        {MULESOFT_ALERTS.map((a: any, i: number) => (
          <div key={i} className="rounded-xl p-3 mb-2" style={{ background: "#ffeaea", border: "1px solid #e05c5c33" }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono font-bold" style={{ color: "#002060" }}>{a.api}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#e05c5c22", color: "#e05c5c" }}>{a.alerts} alerts</span>
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: "#5a3a3a" }}>{a.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ANYPOINT TAB
// ══════════════════════════════════════════════════════════════════════════════
const ANYPOINT_FLOWS = [
  { name: "MB-005 Orders → OMS Flow",           type: "API-Led",   layer: "Process",    status: "Running", lastRun: "2m ago",  calls: "1,240/day" },
  { name: "MB-019 GCP Daily Sync",              type: "Batch",     layer: "Process",    status: "Running", lastRun: "8h ago",  calls: "1/day"     },
  { name: "MB-040 Prima ↔ Manhattan Sync",      type: "Scheduler", layer: "System",     status: "Running", lastRun: "28m ago", calls: "48/day"    },
  { name: "MB-061 Zigzag Returns Processor",    type: "Listener",  layer: "System",     status: "Running", lastRun: "4m ago",  calls: "143/day"   },
  { name: "MB-065 EOD Tulip-Prima Reconcile",   type: "Scheduler", layer: "System",     status: "Running", lastRun: "11h ago", calls: "4/day"     },
  { name: "MB-066 Recoverable Order Retry",     type: "Scheduler", layer: "Process",    status: "Running", lastRun: "6m ago",  calls: "144/day"   },
  { name: "SFSC Customer Sync",                 type: "API-Led",   layer: "System",     status: "Paused",  lastRun: "2h ago",  calls: "24/day"    },
  { name: "Adyen Payment Webhook Listener",     type: "Listener",  layer: "Experience", status: "Running", lastRun: "1m ago",  calls: "320/day"   },
];

function AnypointTab() {
  const [showReport, setShowReport] = useState(false);
  const running = ANYPOINT_FLOWS.filter(f => f.status === "Running").length;
  const paused  = ANYPOINT_FLOWS.filter(f => f.status === "Paused").length;
  const stats   = { total: ANYPOINT_FLOWS.length, running, paused };

  const layerColor = (l: string) => {
    if (l === "Experience") return { col: "#7c6ef5", bg: "#ede8ff" };
    if (l === "Process")    return { col: "#002060", bg: "#e8eaf6" };
    return                         { col: "#52b788", bg: "#edfaf3" };
  };

  return (
    <div className="space-y-5">
      {showReport && <ReportModal system="anypoint" stats={stats} items={ANYPOINT_FLOWS} onClose={() => setShowReport(false)} />}

      <TabHeader subtitle={`${ANYPOINT_FLOWS.length} flows · API-Led Connectivity`} url="https://anypoint.mulesoft.com" label="Anypoint"
        isLive={false} onReport={() => setShowReport(true)} system="anypoint" stats={stats} items={ANYPOINT_FLOWS} />

      <StatCards cards={[
        { label: "Total Flows", value: ANYPOINT_FLOWS.length, col: "#1976d2", bg: "#e3f2fd" },
        { label: "Running",     value: running,               col: "#52b788", bg: "#edfaf3" },
        { label: "Paused",      value: paused,                col: "#f0a500", bg: "#fff7e6" },
        { label: "Experience",  value: ANYPOINT_FLOWS.filter(f=>f.layer==="Experience").length, col: "#7c6ef5", bg: "#ede8ff" },
      ]} />

      <div className="space-y-1.5">
        {ANYPOINT_FLOWS.map((f, i) => {
          const lc = layerColor(f.layer);
          return (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/40 transition border border-transparent hover:border-border">
              <span className="h-2 w-2 rounded-full shrink-0"
                style={{ background: f.status === "Running" ? "#52b788" : "#f0a500", boxShadow: f.status === "Running" ? "0 0 6px #52b78866" : "none" }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: "var(--foreground)" }}>{f.name}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>{f.type} · {f.calls}</p>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0" style={{ background: lc.bg, color: lc.col }}>{f.layer}</span>
              <span className="text-[10px] shrink-0" style={{ color: "var(--muted-foreground)" }}>{f.lastRun}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// JIRA TAB
// ══════════════════════════════════════════════════════════════════════════════
function JiraTab() {
  const [allTeams,   setAllTeams]   = useState<any[]>([]);
  const [isLive,     setIsLive]     = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${BACKEND}/api/teams`);
        if (r.ok) { const d = await r.json(); if (d.teams?.length) { setAllTeams(d.teams); setIsLive(d.teams.some((t:any)=>t.live)); } }
      } catch {}
      setLoading(false);
    })();
  }, []);

  // Aggregate jira stats from teams or fall back to mock
  const jiraStats = allTeams.length > 0
    ? allTeams.reduce((acc, t) => ({
        total:      acc.total      + (t.jira?.total      ?? 0),
        open:       acc.open       + (t.jira?.open       ?? 0),
        inProgress: acc.inProgress + (t.jira?.inProgress ?? 0),
        done:       acc.done       + (t.jira?.done       ?? 0),
        critical:   acc.critical   + (t.jira?.critical   ?? 0),
      }), { total: 0, open: 0, inProgress: 0, done: 0, critical: 0 })
    : { total: JIRA_TICKETS.length, open: JIRA_TICKETS.filter(t=>t.status==="Open").length,
        inProgress: JIRA_TICKETS.filter(t=>t.status==="In Progress").length,
        done: JIRA_TICKETS.filter(t=>t.status==="Done").length, critical: 0 };

  const displayTickets = JIRA_TICKETS;

  return (
    <div className="space-y-4">
      {showReport && <ReportModal system="jira" stats={jiraStats} items={displayTickets} onClose={() => setShowReport(false)} />}

      <TabHeader subtitle={`${jiraStats.total} issues · ${allTeams.length || 1} teams`} url="https://www.atlassian.com/software/jira" label="Jira"
        isLive={isLive} onReport={() => setShowReport(true)} system="jira" stats={jiraStats} items={displayTickets} />

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Fetching Jira data…
        </div>
      ) : (
        <StatCards cards={[
          { label: "Total",       value: jiraStats.total,      col: "#0052cc", bg: "#e6f0ff" },
          { label: "In Progress", value: jiraStats.inProgress, col: "#7c6ef5", bg: "#ede8ff" },
          { label: "Open",        value: jiraStats.open,       col: "#e05c5c", bg: "#ffeaea" },
          { label: "Done",        value: jiraStats.done,       col: "#52b788", bg: "#edfaf3" },
        ]} />
      )}

      <div className="space-y-1.5">
        {displayTickets.map((t: any) => {
          const sCfg = statusCfg[t.status] ?? statusCfg["Open"];
          const pCfg = priorityCfg[t.priority] ?? priorityCfg["Medium"];
          const SI   = sCfg.Icon;
          return (
            <div key={t.id} className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/40 transition border border-transparent hover:border-border">
              <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: sCfg.bg }}>
                <SI className="h-3.5 w-3.5" style={{ color: sCfg.col }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium leading-snug" style={{ color: "var(--foreground)" }}>{t.summary}</p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="text-[10px] font-mono font-bold" style={{ color: "#0052cc" }}>{t.id}</span>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: sCfg.bg, color: sCfg.col }}>{t.status}</span>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: pCfg.bg, color: pCfg.col }}>{t.priority}</span>
                  <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{t.sprint}</span>
                  <span className="text-[10px] ml-auto" style={{ color: "var(--muted-foreground)" }}>{t.updated}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DATADOG TAB
// ══════════════════════════════════════════════════════════════════════════════
const DATADOG_MONITORS = [
  { name: "Order API — p95 Latency",     status: "ALERT", value: "1.8s",  threshold: "< 800ms", service: "p-orders-mb-api",     updated: "2m ago"  },
  { name: "CloudHub CPU Utilisation",    status: "OK",    value: "68%",   threshold: "< 80%",   service: "all-workers",         updated: "1m ago"  },
  { name: "CloudHub Memory",             status: "OK",    value: "71%",   threshold: "< 80%",   service: "all-workers",         updated: "1m ago"  },
  { name: "MuleSoft Error Rate",         status: "WARN",  value: "3.8%",  threshold: "< 1%",    service: "s-salesforce-mb-api", updated: "5m ago"  },
  { name: "Salesforce Connector",        status: "WARN",  value: "1.2s",  threshold: "< 500ms", service: "s-salesforce-mb-api", updated: "8m ago"  },
  { name: "Inventory Sync Throughput",   status: "OK",    value: "99.8%", threshold: "> 99%",   service: "p-inventory-mb-api",  updated: "3m ago"  },
  { name: "Payment Gateway Error Rate",  status: "ALERT", value: "12.4%", threshold: "< 0.5%",  service: "e-adyen-mb-api",      updated: "15m ago" },
  { name: "GCP Data Pipeline Lag",       status: "OK",    value: "0s",    threshold: "< 60s",   service: "s-gcp-ods-mb-api",    updated: "4m ago"  },
];

function DatadogTab() {
  const [services,   setServices]   = useState<any[]>([]);
  const [isLive,     setIsLive]     = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${BACKEND}/health/integrations`);
        if (r.ok) { const d = await r.json(); setServices(d.services ?? []); setIsLive(true); }
      } catch {}
    })();
  }, []);

  const alerts = DATADOG_MONITORS.filter(m => m.status === "ALERT").length;
  const warns  = DATADOG_MONITORS.filter(m => m.status === "WARN").length;
  const ok     = DATADOG_MONITORS.filter(m => m.status === "OK").length;
  const stats  = { total: DATADOG_MONITORS.length, alerts, warns, ok };

  function monitorColor(s: string) {
    if (s === "ALERT") return { col: "#e05c5c", bg: "#ffeaea" };
    if (s === "WARN")  return { col: "#f0a500", bg: "#fff7e6" };
    return                    { col: "#52b788", bg: "#edfaf3" };
  }

  return (
    <div className="space-y-5">
      {showReport && <ReportModal system="datadog" stats={stats} items={DATADOG_MONITORS} onClose={() => setShowReport(false)} />}

      <TabHeader subtitle={`${DATADOG_MONITORS.length} monitors · Infrastructure + APM`} url="https://app.datadoghq.com" label="Datadog"
        isLive={isLive} onReport={() => setShowReport(true)} system="datadog" stats={stats} items={DATADOG_MONITORS} />

      {/* Live backend health if available */}
      {services.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {services.slice(0, 3).map(s => {
            const up = parseFloat(s.uptime);
            const col = up >= 99 ? "#52b788" : up >= 95 ? "#f0a500" : "#e05c5c";
            return (
              <div key={s.name} className="rounded-xl p-3" style={{ background: "var(--secondary)", border: `1px solid ${col}30` }}>
                <p className="text-[10px] font-semibold truncate mb-1" style={{ color: "var(--muted-foreground)" }}>{s.name}</p>
                <p className="text-sm font-bold" style={{ color: col }}>{s.uptime}%</p>
                <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{s.latency}</p>
              </div>
            );
          })}
        </div>
      )}

      <StatCards cards={[
        { label: "Monitors",  value: stats.total,  col: "#774aa4", bg: "#f3e8ff" },
        { label: "Alerting",  value: alerts,       col: "#e05c5c", bg: "#ffeaea" },
        { label: "Warning",   value: warns,        col: "#f0a500", bg: "#fff7e6" },
        { label: "OK",        value: ok,           col: "#52b788", bg: "#edfaf3" },
      ]} />

      <div className="space-y-1.5">
        {DATADOG_MONITORS.map((m, i) => {
          const mc = monitorColor(m.status);
          return (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/40 transition border border-transparent hover:border-border">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 w-12 text-center" style={{ background: mc.bg, color: mc.col }}>{m.status}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: "var(--foreground)" }}>{m.name}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>{m.service}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-bold" style={{ color: mc.col }}>{m.value}</p>
                <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{m.threshold}</p>
              </div>
              <span className="text-[10px] shrink-0 w-14 text-right" style={{ color: "var(--muted-foreground)" }}>{m.updated}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB BUTTON
// ══════════════════════════════════════════════════════════════════════════════
function TabButton({ id, label, color, bg, active, onClick }: {
  id: string; label: string; color: string; bg: string; active: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0"
      style={{
        background: active ? bg : "transparent",
        color:      active ? color : "var(--muted-foreground)",
        border:     active ? `1.5px solid ${color}44` : "1.5px solid transparent",
        boxShadow:  active ? `0 1px 6px ${color}22` : "none",
      }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />{label}
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════════════
interface Props { activeIntegration?: IntegrationId; activeProject?: string; }

export function IntegrationHub({ activeIntegration, activeProject }: Props) {
  const [activeTab, setActiveTab] = useState<IntegrationId>("zoho");

  useEffect(() => { if (activeIntegration) setActiveTab(activeIntegration); }, [activeIntegration]);

  const current = INTEGRATIONS.find(i => i.id === activeTab)!;

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "var(--card)", border: "1px solid rgba(124,110,245,0.11)", boxShadow: "0 1px 4px rgba(124,110,245,0.06)" }}>

      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(124,110,245,0.08)" }}>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: current.bg }}>
            <CloudCog className="h-4 w-4" style={{ color: current.color }} />
          </div>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Integration Hub</h2>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              Connected systems · real-time data · auto-generated reports
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: "#edfaf3", color: "#52b788" }}>
          <span className="h-1.5 w-1.5 rounded-full bg-[#52b788] animate-pulse inline-block" />
          {INTEGRATIONS.length} CONNECTED
        </span>
      </div>

      <div className="flex items-center gap-1.5 px-5 py-3 overflow-x-auto"
        style={{ borderBottom: "1px solid rgba(124,110,245,0.08)", background: "var(--muted)" }}>
        {INTEGRATIONS.map(intg => (
          <TabButton key={intg.id} id={intg.id} label={intg.shortLabel}
            color={intg.color} bg={intg.bg} active={activeTab === intg.id} onClick={() => setActiveTab(intg.id)} />
        ))}
      </div>

      <div className="p-5">
        {activeTab === "zoho"     && <ZohoTab activeProject={activeProject} />}
        {activeTab === "mulesoft" && <MuleSoftTab activeProject={activeProject} />}
        {activeTab === "anypoint" && <AnypointTab />}
        {activeTab === "jira"     && <JiraTab />}
        {activeTab === "datadog"  && <DatadogTab />}
      </div>
    </div>
  );
}
