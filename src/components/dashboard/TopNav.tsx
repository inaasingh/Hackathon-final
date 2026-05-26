import { Bell, FileBarChart, Presentation, Brain, Search, X, Download, Copy, CheckCheck, Loader2, Sparkles } from "lucide-react";
import companyLogo from "@/assets/logo.png";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { mockEvents } from "../../data/mockEvents";
import { generateWeeklyReport, generateGovernanceReport } from "../../lib/claudeApi";

export function TopNav() {
  const [modal, setModal] = useState<{ title: string; content: string } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleWeeklyReport() {
    setLoading("weekly");
    try {
      const content = await generateWeeklyReport(mockEvents);
      setModal({ title: "Weekly Delivery Report", content });
    } catch {
      setModal({ title: "Weekly Delivery Report", content: "Error: Check your API key in claudeApi.ts" });
    }
    setLoading(null);
  }

  async function handleGovernanceDeck() {
    setLoading("gov");
    try {
      const content = await generateGovernanceReport(mockEvents);
   setModal({
  title: "Executive Governance Deck",
  content:
    "GENERATED FROM LIVE ENTERPRISE TELEMETRY\n\n" +
    content,
});
    } catch {
      setModal({ title: "Governance Report", content: "Error: Check your API key in claudeApi.ts" });
    }
    setLoading(null);
  }

  function handleCopy() {
    if (!modal) return;
    navigator.clipboard.writeText(modal.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    if (!modal) return;
    const blob = new Blob([modal.content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${modal.title.replace(/ /g, "-")}.pdf`;
    a.click();
  }

  return (
    <>
      <header className="sticky top-0 z-30 glass border-b border-border/60">
        <div className="flex items-center justify-between px-6 h-16">

          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="relative h-10 w-10 rounded-xl overflow-hidden ai-glow border border-border bg-white flex items-center justify-center">
  <img
    src={companyLogo}
    alt="Company Logo"
    className="h-full w-full object-cover"
  />
</div>
              <div className="leading-tight">
                <div className="text-sm font-semibold tracking-tight">Synapse</div>
                <div className="text-[11px] text-muted-foreground">Your business, always in sync</div>
              </div>
            </div>
            <span className="ml-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-success/15 text-success border border-success/30">
              <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-success">
                <span className="absolute inset-0 rounded-full bg-success animate-ping" />
              </span>
              LIVE
            </span>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search updates, reports, systems…"
                className="w-full h-9 rounded-lg bg-input/50 border border-border pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">

            {/* Weekly Summary */}
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleWeeklyReport}
              disabled={loading !== null}
              className="hidden lg:inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border transition bg-card/60 border-border text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === "weekly" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileBarChart className="h-3.5 w-3.5" />}
              {loading === "weekly" ? "Creating…" : "This Week's Summary"}
            </motion.button>

            {/* Compliance Report */}
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGovernanceDeck}
              disabled={loading !== null}
              className="hidden lg:inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border transition bg-card/60 border-border text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === "gov" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Presentation className="h-3.5 w-3.5" />}
              {loading === "gov" ? "Creating…" : "Compliance Report"}
            </motion.button>

            {/* Smart Insights */}
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="hidden lg:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-medium gradient-primary-bg border-transparent text-primary-foreground ai-glow"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Smart Insights
            </motion.button>

            {/* Bell */}
            <button className="relative h-9 w-9 rounded-lg border border-border bg-card/50 hover:bg-secondary/50 transition flex items-center justify-center">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-critical ring-2 ring-background" />
            </button>

            {/* Avatar */}
            <div className="h-9 w-9 rounded-full gradient-ai-bg flex items-center justify-center text-xs font-semibold text-primary-foreground">
              AK
            </div>
          </div>
        </div>
      </header>

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setModal(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card border border-border rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg gradient-primary-bg flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <h2 className="font-semibold text-sm">{modal.title}</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/30">
                  AI Generated
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-secondary border border-border hover:bg-secondary/80 transition"
                >
                  {copied ? <CheckCheck className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg gradient-primary-bg text-primary-foreground hover:opacity-90 transition"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
                <button
                  onClick={() => setModal(null)}
                  className="h-7 w-7 rounded-lg border border-border bg-secondary/50 hover:bg-secondary flex items-center justify-center transition"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto rounded-xl bg-card/30 border border-border p-4">
              <pre className="text-xs text-foreground/85 whitespace-pre-wrap leading-relaxed font-sans">
                {modal.content}
              </pre>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}