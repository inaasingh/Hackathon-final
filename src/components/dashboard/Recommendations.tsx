import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, X, CheckCircle2, AlertTriangle, ShieldAlert, Download, Copy, CheckCheck, AlertCircle, Info } from "lucide-react";
import { useState } from "react";

/* ── Structured data ─────────────────────────────────────────── */
type RiskItem   = { text: string; sev: "critical" | "warning" | "info" };
type ActionItem = string;
type Section =
  | { type: "keyvals";  label: string; items: { k: string; v: string; highlight?: boolean }[] }
  | { type: "risks";    label: string; items: RiskItem[] }
  | { type: "actions";  label: string; items: ActionItem[] }
  | { type: "badge";    label: string; value: string; col: string; bg: string };

const recs: {
  title: string; desc: string; sev: "info" | "warning" | "critical";
  sections: Section[];
}[] = [
  {
    title: "Regenerate LLD due to deployment changes",
    desc:  "Inventory Sync v2.14.3 introduced 4 new endpoints.",
    sev:   "info",
    sections: [
      {
        type: "keyvals", label: "DETECTED CHANGE",
        items: [
          { k: "System",  v: "Inventory Sync" },
          { k: "Version", v: "v2.14.3" },
          { k: "Finding", v: "4 new endpoints detected", highlight: true },
        ],
      },
      {
        type: "risks", label: "AI FINDINGS",
        items: [
          { text: "Existing LLD is outdated",             sev: "warning"  },
          { text: "Swagger contract mismatch possible",    sev: "warning"  },
          { text: "Downstream consumers not yet notified", sev: "info"     },
        ],
      },
      {
        type: "actions", label: "RECOMMENDED ACTIONS",
        items: [
          "Regenerate LLD for Inventory Sync",
          "Trigger architecture review board",
          "Notify API consumers via Slack & email",
          "Revalidate all downstream integrations",
        ],
      },
      { type: "badge", label: "BUSINESS IMPACT", value: "Integration mismatch risk reduced by 82%", col: "#4da8da", bg: "#e8f6fd" },
    ],
  },
  {
    title: "Governance deck due in 2 days",
    desc:  "Auto-prepared draft is 87% complete.",
    sev:   "warning",
    sections: [
      {
        type: "keyvals", label: "DECK STATUS",
        items: [
          { k: "Completion",   v: "87%",            highlight: true },
          { k: "Due date",     v: "In 2 days"  },
          { k: "Owner",        v: "@priya"      },
        ],
      },
      {
        type: "risks", label: "PENDING SECTIONS",
        items: [
          { text: "Executive KPI summary not generated",  sev: "warning"  },
          { text: "Financial variance section missing",   sev: "warning"  },
          { text: "Delivery dependencies not linked",     sev: "info"     },
        ],
      },
      {
        type: "actions", label: "RECOMMENDED ACTIONS",
        items: [
          "Auto-generate executive KPI section via AI",
          "Pull Jira sprint metrics for this period",
          "Validate RAG status across all workstreams",
        ],
      },
      { type: "badge", label: "ESTIMATED COMPLETION", value: "12 minutes with AI automation", col: "#f0a500", bg: "#fff7e6" },
    ],
  },
  {
    title: "CRM sync health below threshold",
    desc:  "Error rate 1.4% vs 0.5% target. Investigate.",
    sev:   "critical",
    sections: [
      {
        type: "keyvals", label: "INTEGRATION ALERT",
        items: [
          { k: "System",        v: "CRM Sync Pipeline" },
          { k: "Error Rate",    v: "1.4%",   highlight: true },
          { k: "Target",        v: "0.5%"  },
        ],
      },
      {
        type: "risks", label: "AI ROOT CAUSE PREDICTION",
        items: [
          { text: "API retry saturation detected",       sev: "critical" },
          { text: "MuleSoft queue congestion likely",    sev: "critical" },
          { text: "Timeout escalation in progress",      sev: "warning"  },
        ],
      },
      {
        type: "actions", label: "RECOMMENDED ACTIONS",
        items: [
          "Increase retry backoff interval immediately",
          "Scale integration worker pool horizontally",
          "Enable alert escalation for CRM Sync",
          "Activate fallback queue to prevent data loss",
        ],
      },
      { type: "badge", label: "RISK LEVEL", value: "HIGH — immediate action required", col: "#e05c5c", bg: "#ffeaea" },
    ],
  },
  {
    title: "Contract renewal risk detected",
    desc:  "Vendor Acme Corp · expiry in 18 days.",
    sev:   "warning",
    sections: [
      {
        type: "keyvals", label: "VENDOR RISK DETECTION",
        items: [
          { k: "Vendor",           v: "Acme Corp"       },
          { k: "Contract Expiry",  v: "18 days remaining", highlight: true },
          { k: "Dependency",       v: "Middleware support" },
        ],
      },
      {
        type: "risks", label: "AI RISK ASSESSMENT",
        items: [
          { text: "Renewal approval not initiated",        sev: "critical" },
          { text: "Dependency risk on middleware support", sev: "warning"  },
          { text: "Possible SLA interruption if expired",  sev: "warning"  },
        ],
      },
      {
        type: "actions", label: "RECOMMENDED ACTIONS",
        items: [
          "Trigger procurement workflow immediately",
          "Notify delivery governance team",
          "Escalate to vendor management",
        ],
      },
      { type: "badge", label: "BUSINESS RISK", value: "Medium-High — 18-day window", col: "#f0a500", bg: "#fff7e6" },
    ],
  },
];

/* ── Severity configs ─────────────────────────────────────────── */
const cardTone: Record<string, string> = {
  info:     "border-[#4da8da]/30 bg-[#4da8da]/5",
  warning:  "border-[#f0a500]/30 bg-[#f0a500]/5",
  critical: "border-[#e05c5c]/30 bg-[#e05c5c]/5",
};

const riskCfg: Record<string, { bg: string; col: string; Icon: any }> = {
  critical: { bg: "#ffeaea", col: "#e05c5c", Icon: AlertCircle  },
  warning:  { bg: "#fff7e6", col: "#f0a500", Icon: AlertTriangle },
  info:     { bg: "#e8f6fd", col: "#4da8da", Icon: Info          },
};

const headerIcon: Record<string, any> = {
  critical: AlertTriangle,
  warning:  ShieldAlert,
  info:     CheckCircle2,
};

/* ── Helpers to export plain text ─────────────────────────────── */
function sectionsToText(rec: (typeof recs)[0]): string {
  const lines: string[] = [rec.title, rec.desc, ""];
  for (const s of rec.sections) {
    lines.push(`── ${s.label} ──`);
    if (s.type === "keyvals")  s.items.forEach(i => lines.push(`${i.k}: ${i.v}`));
    if (s.type === "risks")    s.items.forEach(i => lines.push(`• [${i.sev.toUpperCase()}] ${i.text}`));
    if (s.type === "actions")  s.items.forEach((a, i) => lines.push(`${i + 1}. ${a}`));
    if (s.type === "badge")    lines.push(`${s.label}: ${s.value}`);
    lines.push("");
  }
  return lines.join("\n");
}

/* ── Component ────────────────────────────────────────────────── */
export function Recommendations() {
  const [selected, setSelected] = useState<(typeof recs)[0] | null>(null);
  const [copied,   setCopied]   = useState(false);

  function handleCopy() {
    if (!selected) return;
    navigator.clipboard.writeText(sectionsToText(selected));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleExport() {
    if (!selected) return;
    const blob = new Blob([sectionsToText(selected)], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${selected.title.replace(/\s/g, "-").toLowerCase()}.txt`;
    a.click();
  }

  return (
    <>
      {/* ── CARD LIST ── */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "var(--card)",
          border: "1px solid rgba(124,110,245,0.11)",
          boxShadow: "0 1px 4px rgba(124,110,245,0.06)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
            <Sparkles className="h-4 w-4 text-primary" />
            AI Recommendations
          </h2>
          <span className="text-[10px] text-muted-foreground">Updated just now</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {recs.map((r, i) => (
            <button
              key={r.title}
              onClick={() => setSelected(r)}
              className={`rounded-xl border p-4 transition-transform duration-150 hover:-translate-y-0.5 group text-left ${cardTone[r.sev]}`}
            >
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg,#a78ef8,#7c6ef5)" }}>
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold leading-tight" style={{ color: "var(--foreground)" }}>{r.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{r.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-foreground group-hover:translate-x-0.5 transition" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── STRUCTURED MODAL ── */}
      <AnimatePresence>
        {selected && (() => {
          const HIcon = headerIcon[selected.sev] ?? CheckCircle2;
          const sevCol = selected.sev === "critical" ? "#e05c5c" : selected.sev === "warning" ? "#f0a500" : "#4da8da";
          const sevBg  = selected.sev === "critical" ? "#ffeaea" : selected.sev === "warning" ? "#fff7e6" : "#e8f6fd";
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
              style={{ zIndex: 10000 }}
              onClick={() => setSelected(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.18 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-xl max-h-[88vh] flex flex-col rounded-2xl overflow-hidden"
                style={{
                  background: "var(--card)",
                  border: "1px solid rgba(124,110,245,0.14)",
                  boxShadow: "0 32px 80px rgba(28,24,40,0.20)",
                }}
              >
                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 py-4 shrink-0"
                  style={{ borderBottom: "1px solid rgba(124,110,245,0.09)" }}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                      style={{ background: sevBg }}>
                      <HIcon className="h-5 w-5" style={{ color: sevCol }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{selected.title}</h3>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>AI-generated enterprise recommendation</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleCopy}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs border transition hover:bg-secondary"
                      style={{ borderColor: "rgba(124,110,245,0.18)", color: "var(--foreground)" }}>
                      {copied ? <CheckCheck className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                    <button onClick={handleExport}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs text-white hover:opacity-90"
                      style={{ background: "linear-gradient(135deg,#7c6ef5,#a78ef8)" }}>
                      <Download className="h-3.5 w-3.5" /> Export
                    </button>
                    <button onClick={() => setSelected(null)}
                      className="h-8 w-8 rounded-lg border flex items-center justify-center hover:bg-secondary"
                      style={{ borderColor: "rgba(124,110,245,0.18)" }}>
                      <X className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
                    </button>
                  </div>
                </div>

                {/* ── Body ── */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {selected.sections.map((sec, si) => (
                    <div key={si}>
                      {/* Section label */}
                      <p className="text-[10px] font-bold tracking-widest mb-2" style={{ color: "var(--muted-foreground)" }}>
                        {sec.label}
                      </p>

                      {/* KEY-VALUE GRID */}
                      {sec.type === "keyvals" && (
                        <div className="grid grid-cols-3 gap-2">
                          {sec.items.map(item => (
                            <div key={item.k} className="rounded-xl p-3"
                              style={{
                                background: item.highlight ? sevBg : "var(--muted)",
                                border: item.highlight ? `1px solid ${sevCol}33` : "1px solid rgba(124,110,245,0.08)",
                              }}>
                              <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{item.k}</p>
                              <p className="text-xs font-bold mt-0.5 leading-tight"
                                style={{ color: item.highlight ? sevCol : "var(--foreground)" }}>
                                {item.v}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* RISK ROWS */}
                      {sec.type === "risks" && (
                        <div className="space-y-2">
                          {sec.items.map((item, ri) => {
                            const cfg = riskCfg[item.sev];
                            return (
                              <div key={ri} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                                style={{ background: cfg.bg, border: `1px solid ${cfg.col}30` }}>
                                <cfg.Icon className="h-3.5 w-3.5 shrink-0" style={{ color: cfg.col }} />
                                <span className="text-xs font-medium" style={{ color: cfg.col }}>{item.text}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* NUMBERED ACTIONS */}
                      {sec.type === "actions" && (
                        <div className="space-y-2">
                          {sec.items.map((action, ai) => (
                            <div key={ai} className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition hover:bg-secondary/40 cursor-default"
                              style={{ background: "var(--muted)", border: "1px solid rgba(124,110,245,0.08)" }}>
                              <span className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                style={{ background: "linear-gradient(135deg,#7c6ef5,#a78ef8)" }}>
                                {ai + 1}
                              </span>
                              <span className="text-xs font-medium flex-1" style={{ color: "var(--foreground)" }}>{action}</span>
                              <ArrowRight className="h-3.5 w-3.5 shrink-0" style={{ color: "#7c6ef5" }} />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* BADGE */}
                      {sec.type === "badge" && (
                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
                          style={{ background: sec.bg, border: `1px solid ${sec.col}33` }}>
                          <span className="text-xs font-bold" style={{ color: sec.col }}>{sec.value}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </>
  );
}
