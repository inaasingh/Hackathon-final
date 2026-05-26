import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, BarChart2, CalendarDays, HeartPulse, X, Download, ExternalLink, FileText } from "lucide-react";

const reports = [
  {
    icon: BookOpen,
    col: "#e05c5c",
    bg: "#ffeaea",
    title: "Runbook",
    sub: "Order API · Emergency recovery",
    tag: "Critical",
    pdf: "/reports/runbook.pdf",
    filename: "runbook.pdf",
  },
  {
    icon: BarChart2,
    col: "#7c6ef5",
    bg: "#ede8ff",
    title: "Weekly Governance",
    sub: "Auto-generated · This week",
    tag: "Weekly",
    pdf: "/reports/weekly-report.pdf",
    filename: "weekly-report.pdf",
  },
  {
    icon: CalendarDays,
    col: "#52b788",
    bg: "#edfaf3",
    title: "Monthly Governance",
    sub: "May 2026 · Executive deck",
    tag: "Monthly",
    pdf: "/reports/monthly-report.pdf",
    filename: "monthly-report.pdf",
  },
  {
    icon: HeartPulse,
    col: "#f0a500",
    bg: "#fff7e6",
    title: "Health Check",
    sub: "Live snapshot · All systems",
    tag: "Live",
    pdf: "/reports/health-check.pdf",
    filename: "health-check.pdf",
  },
];

// Secondary docs shown as quick-access chips
const extraDocs = [
  { label: "BRD",               pdf: "/reports/brd.pdf",               filename: "brd.pdf"               },
  { label: "TDD",               pdf: "/reports/tdd.pdf",               filename: "tdd.pdf"               },
  { label: "Governance Report", pdf: "/reports/governance-report.pdf", filename: "governance-report.pdf" },
  { label: "Architecture",      pdf: "/reports/architecture.png",      filename: "architecture.png"      },
];

export function QuickReports() {
  const [selected, setSelected] = useState<(typeof reports)[0] | null>(null);

  function handleDownload(pdf: string, filename: string) {
    const a = document.createElement("a");
    a.href = pdf;
    a.download = filename;
    a.click();
  }

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
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              Reports &amp; Runbooks
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              Click to preview · Download any document
            </p>
          </div>
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: "#ede8ff", color: "#7c6ef5" }}
          >
            {reports.length + extraDocs.length} documents
          </span>
        </div>

        {/* Main 4 cards */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {reports.map((r, i) => (
            <button
              key={r.title}
              onClick={() => setSelected(r)}
              className="text-left p-4 rounded-xl transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md group"
              style={{ background: r.bg, border: `1.5px solid ${r.col}55` }}
            >
              <div className="flex items-start justify-between mb-2">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${r.col}22` }}
                >
                  <r.icon className="h-4 w-4" style={{ color: r.col }} />
                </div>
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: `${r.col}20`, color: r.col }}
                >
                  {r.tag}
                </span>
              </div>
              <p className="text-xs font-semibold leading-tight" style={{ color: "var(--foreground)" }}>
                {r.title}
              </p>
              <p className="text-[10px] mt-0.5 leading-tight" style={{ color: "var(--muted-foreground)" }}>
                {r.sub}
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-medium" style={{ color: r.col }}>
                  <ExternalLink className="h-3 w-3" /> Preview
                </span>
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-medium ml-auto"
                  style={{ color: "var(--muted-foreground)" }}
                  onClick={e => { e.stopPropagation(); handleDownload(r.pdf, r.filename); }}
                >
                  <Download className="h-3 w-3" /> Save
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Extra docs as chips */}
        <div
          className="rounded-xl px-3 py-2.5 flex items-center gap-2 flex-wrap"
          style={{ background: "var(--muted)", border: "1px solid rgba(124,110,245,0.08)" }}
        >
          <span className="text-[10px] font-semibold shrink-0" style={{ color: "var(--muted-foreground)" }}>
            More docs:
          </span>
          {extraDocs.map(d => (
            <button
              key={d.label}
              onClick={() => {
                // For PNG open inline, for PDFs use setSelected-like approach via a cast
                setSelected({ icon: FileText, col: "#9b8ff5", bg: "#f0edff", title: d.label, sub: d.filename, tag: "Doc", pdf: d.pdf, filename: d.filename });
              }}
              className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg transition hover:bg-secondary"
              style={{ border: "1px solid rgba(124,110,245,0.18)", color: "var(--foreground)" }}
            >
              <FileText className="h-3 w-3" />
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── PDF PREVIEW MODAL ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            style={{ zIndex: 10000 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-5xl flex flex-col rounded-2xl overflow-hidden"
              style={{
                height: "90vh",
                background: "var(--card)",
                border: "1px solid rgba(124,110,245,0.15)",
                boxShadow: "0 32px 80px rgba(28,24,40,0.22)",
              }}
            >
              {/* Modal header */}
              <div
                className="flex items-center justify-between px-6 py-4 shrink-0"
                style={{ borderBottom: "1px solid rgba(124,110,245,0.10)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-9 w-9 rounded-xl flex items-center justify-center"
                    style={{ background: selected.bg }}
                  >
                    <selected.icon className="h-4 w-4" style={{ color: selected.col }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                      {selected.title}
                    </h3>
                    <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{selected.sub}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Open in new tab */}
                  <a
                    href={selected.pdf}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs border transition hover:bg-secondary"
                    style={{ borderColor: "rgba(124,110,245,0.18)", color: "var(--foreground)" }}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open tab
                  </a>

                  {/* Download */}
                  <button
                    onClick={() => handleDownload(selected.pdf, selected.filename)}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs text-white transition hover:opacity-90"
                    style={{ background: "linear-gradient(135deg,#7c6ef5,#a78ef8)" }}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>

                  {/* Close */}
                  <button
                    onClick={() => setSelected(null)}
                    className="h-8 w-8 rounded-lg border flex items-center justify-center transition hover:bg-secondary"
                    style={{ borderColor: "rgba(124,110,245,0.18)" }}
                  >
                    <X className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
                  </button>
                </div>
              </div>

              {/* PDF / image viewer */}
              <div className="flex-1 overflow-hidden bg-gray-100">
                {selected.filename.endsWith(".png") || selected.filename.endsWith(".jpg") ? (
                  <div className="w-full h-full flex items-center justify-center p-6 overflow-auto">
                    <img
                      src={selected.pdf}
                      alt={selected.title}
                      className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
                    />
                  </div>
                ) : (
                  <iframe
                    src={`${selected.pdf}#toolbar=1&navpanes=0`}
                    title={selected.title}
                    className="w-full h-full border-0"
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
