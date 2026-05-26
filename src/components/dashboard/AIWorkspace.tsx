import { useEffect, useRef, useState, useCallback } from "react";
import { Sparkles, RefreshCw, Copy, Download, CheckCheck, Loader2 } from "lucide-react";
import {
  generateGovernanceReport,
  generateWeeklyReport,
  generateImpactAnalysis,
} from "../../lib/claudeApi";

const tabs = [
  { id: "CR Document",        label: "CR Document"        },
  { id: "Governance Summary", label: "Governance Summary" },
  { id: "Weekly Report",      label: "Weekly Report"      },
  { id: "Executive Summary",  label: "Executive Summary"  },
  { id: "Health Analysis",    label: "Health Analysis"    },
];

const staticContent: Record<string, string> = {
  "Executive Summary": `EXECUTIVE DELIVERY SUMMARY

Enterprise delivery velocity improved by 18% this sprint.
Automation coverage: 81%
Governance processing time reduced from 11 hours to 2.4 hours.
AI-generated documentation count: 128
Projected annual operational savings: $480,000
Platform Health: 94.3%`,

  "Health Analysis": `ENTERPRISE INTEGRATION HEALTH ANALYSIS

Jira: Operational
Azure DevOps: Healthy
MuleSoft: Minor latency warnings
Salesforce: Operational
Zoho Desk: Operational

Overall Platform Health: 94.3%
AI Recommendation: Enable proactive alerting for MuleSoft APIs.`,
};

export function AIWorkspace({ selectedEvent }: { selectedEvent: any }) {
  const [activeTab, setActiveTab] = useState("CR Document");
  const [content,   setContent]   = useState("");
  const [loading,   setLoading]   = useState(false);
  const [copied,    setCopied]    = useState(false);

  const selectedEventRef = useRef(selectedEvent);
  useEffect(() => { selectedEventRef.current = selectedEvent; }, [selectedEvent]);

  const handleGenerate = useCallback(async () => {
    if (staticContent[activeTab]) {
      setContent(staticContent[activeTab]);
      return;
    }

    const event = selectedEventRef.current ?? {
      svc: "Order API", source: "MuleSoft", id: "MULE-2391",
      sev: "critical", summary: "SLA breach detected — p95 latency 1.8s",
      conf: 96, docs: ["LLD", "Runbook"],
    };

    setLoading(true);
    setContent("");

    try {
      if (activeTab === "CR Document") {
        setContent(await generateImpactAnalysis(event));
      } else if (activeTab === "Governance Summary") {
        setContent(await generateGovernanceReport([event]));
      } else if (activeTab === "Weekly Report") {
        setContent(await generateWeeklyReport([event]));
      }
    } catch {
      setContent("Unable to generate content. Make sure the server is running on port 3001.");
    }

    setLoading(false);
  }, [activeTab]);

  useEffect(() => { handleGenerate(); }, [handleGenerate]);

  function handleCopy() {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleExport() {
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${activeTab.replace(/\s/g, "-").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
  }

  return (
    <div
      className="rounded-2xl p-5 relative z-0 flex flex-col"
      style={{
        background: "var(--card)",
        border: "1px solid rgba(124,110,245,0.11)",
        borderRadius: "1rem",
        boxShadow: "0 1px 4px rgba(124,110,245,0.06)",
        height: "calc(100vh - 120px)",
      }}
    >
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 shrink-0">
        <div>
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Generated Output
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Powered by Claude · live backend data</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleGenerate} disabled={loading}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium gradient-primary-bg text-primary-foreground disabled:opacity-50">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {loading ? "Generating..." : "Generate"}
          </button>
          <button onClick={handleGenerate} disabled={loading}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs border border-border bg-card/50 hover:bg-secondary/50 disabled:opacity-50">
            <RefreshCw className="h-3.5 w-3.5" /> Regenerate
          </button>
          <button onClick={handleCopy} disabled={!content || loading}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs border border-border bg-card/50 hover:bg-secondary/50 disabled:opacity-50">
            {copied ? <CheckCheck className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button onClick={handleExport} disabled={!content || loading}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs gradient-primary-bg text-primary-foreground disabled:opacity-50">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto shrink-0"
        style={{ borderBottom: "1px solid rgba(124,110,245,0.10)" }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-1 text-xs whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "text-primary border-b-2 border-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="rounded-xl border border-border p-5 overflow-y-auto flex-1"
        style={{ background: "var(--muted)", minHeight: 0 }}>
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-xs">Generating {activeTab}…</p>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap text-xs leading-6 text-foreground/85 font-sans">
            {content || "Click Generate to create AI content."}
          </pre>
        )}
      </div>
    </div>
  );
}
