import { useState } from "react";
import { CalendarClock, Clock, X, ExternalLink, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const schedules = [
  {
    type: "Weekly",
    name: "Governance PPT generation",
    next: "Mon 09:00",
    freq: "Weekly",
    status: "scheduled",
    pdf: "/reports/governance-report.pdf",
    filename: "governance-report.pdf",
  },
  {
    type: "Weekly",
    name: "Deployment summaries",
    next: "Fri 18:00",
    freq: "Weekly",
    status: "scheduled",
    pdf: "/reports/weekly-report.pdf",
    filename: "weekly-report.pdf",
  },
  {
    type: "Weekly",
    name: "Delivery metrics aggregation",
    next: "Sun 23:00",
    freq: "Weekly",
    status: "running",
    pdf: "/reports/weekly-report.pdf",
    filename: "weekly-report.pdf",
  },
  {
    type: "Monthly",
    name: "Executive deck",
    next: "Jun 1, 08:00",
    freq: "Monthly",
    status: "scheduled",
    pdf: "/reports/monthly-report.pdf",
    filename: "monthly-report.pdf",
  },
  {
    type: "Monthly",
    name: "SLA analysis",
    next: "Jun 1, 09:00",
    freq: "Monthly",
    status: "scheduled",
    pdf: "/reports/health-check.pdf",
    filename: "health-check.pdf",
  },
  {
    type: "Monthly",
    name: "Contract snapshots",
    next: "Jun 5, 10:00",
    freq: "Monthly",
    status: "scheduled",
    pdf: "/reports/governance-report.pdf",
    filename: "governance-report.pdf",
  },
  {
    type: "Monthly",
    name: "Health trend report",
    next: "Jun 7, 09:00",
    freq: "Monthly",
    status: "draft",
    pdf: "/reports/health-check.pdf",
    filename: "health-check.pdf",
  },
];

const statusTone: Record<string, string> = {
  scheduled: "bg-info/15 text-info border-info/30",
  running: "bg-success/15 text-success border-success/30",
  draft: "bg-muted text-muted-foreground border-border",
};

export function Schedules() {
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  return (
    <>
      <div
        className="rounded-2xl p-5"
        style={{
          background: "var(--card)",
          border: "1px solid rgba(124,110,245,0.11)",
          boxShadow: "0 1px 4px rgba(124,110,245,0.06)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold tracking-tight flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            Automation Schedules
          </h2>

          <span className="text-[10px] text-muted-foreground">
            7 active jobs
          </span>
        </div>

        <div className="space-y-1">
          {schedules.map((s, i) => (
            <button
              key={s.name}
              onClick={() => setSelectedDoc(s)}
              className="w-full text-left relative flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-secondary/40 transition border border-transparent hover:border-border"
            >
              <div className="flex flex-col items-center w-12 shrink-0">
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    s.type === "Weekly"
                      ? "bg-primary/15 text-primary"
                      : "bg-ai/15 text-ai"
                  }`}
                >
                  {s.type}
                </span>
              </div>

              <div className="relative shrink-0">
                <div className="h-2 w-2 rounded-full gradient-primary-bg" />

                {i < schedules.length - 1 && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-px h-6 bg-border" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {s.name}
                </div>

                <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Next: {s.next} · {s.freq}
                </div>
              </div>

              <span
                className={`text-[10px] px-1.5 py-0.5 rounded border ${statusTone[s.status]}`}
              >
                {s.status === "running" && (
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-success mr-1 animate-pulse" />
                )}

                {s.status.toUpperCase()}
              </span>

              <span className="text-[10px] text-muted-foreground hidden md:inline">
                open report
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* PDF MODAL */}
      <AnimatePresence>
        {selectedDoc && (
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
            style={{ zIndex: 10000 }}
            onClick={() => setSelectedDoc(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl flex flex-col rounded-2xl overflow-hidden"
              style={{
                height: "90vh",
                background: "var(--card)",
                border: "1px solid rgba(124,110,245,0.15)",
                boxShadow: "0 32px 80px rgba(28,24,40,0.22)",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-6 py-4 shrink-0"
                style={{ borderBottom: "1px solid rgba(124,110,245,0.10)" }}
              >
                <div>
                  <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                    {selectedDoc.name}
                  </h2>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                    Auto-generated enterprise schedule report
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={selectedDoc.pdf}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs border transition hover:bg-secondary"
                    style={{ borderColor: "rgba(124,110,245,0.18)", color: "var(--foreground)" }}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open tab
                  </a>

                  <a
                    href={selectedDoc.pdf}
                    download={selectedDoc.filename}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs text-white transition hover:opacity-90"
                    style={{ background: "linear-gradient(135deg,#7c6ef5,#a78ef8)" }}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </a>

                  <button
                    onClick={() => setSelectedDoc(null)}
                    className="h-8 w-8 rounded-lg border flex items-center justify-center transition hover:bg-secondary"
                    style={{ borderColor: "rgba(124,110,245,0.18)" }}
                  >
                    <X className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
                  </button>
                </div>
              </div>

              {/* PDF iframe */}
              <iframe
                src={`${selectedDoc.pdf}#toolbar=1&navpanes=0`}
                className="w-full flex-1 bg-gray-100 border-0"
                title={selectedDoc.name}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}