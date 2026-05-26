import { useState, useEffect } from "react";
import { RefreshCw, AlertTriangle, CheckCircle2, AlertCircle, Info, GitBranch } from "lucide-react";
import { mockEvents } from "../../data/mockEvents";
import { RCAReport } from "./RCAReport";

const sevConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  critical: { icon: AlertTriangle, color: "#e05c5c", bg: "#ffeaea", label: "Critical" },
  warning:  { icon: AlertCircle,   color: "#f0a500", bg: "#fff7e6", label: "Warning"  },
  success:  { icon: CheckCircle2,  color: "#52b788", bg: "#edfaf3", label: "Resolved" },
  info:     { icon: Info,          color: "#4da8da", bg: "#e8f6fd", label: "Info"     },
};

const sourceCols: Record<string, string> = {
  Jira: "#4da8da", Azure: "#52b788", MuleSoft: "#e05c5c", Zoho: "#f0a500", Salesforce: "#9b8ff5",
};

export function EventStream({
  onSelect,
  liveEvents = [],
}: {
  onSelect: (event: any) => void;
  liveEvents?: any[];
}) {
  const [events,   setEvents]   = useState<any[]>(mockEvents);
  const [selected, setSelected] = useState<string | null>(null);
  const [rcaEvent, setRcaEvent] = useState<any | null>(null);

  useEffect(() => {
    if (!liveEvents.length) return;
    const latest = liveEvents[0];
    if (!latest?.id) return;
    setEvents(prev => {
      if (prev.find(e => e.id === latest.id)) return prev;
      return [latest, ...prev].slice(0, 12);
    });
  }, [liveEvents.length]);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--card)",
        border: "1px solid rgba(124,110,245,0.11)",
        boxShadow: "0 1px 4px rgba(124,110,245,0.06)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(124,110,245,0.08)" }}>
        <div>
          <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            What's Happening Right Now
            <span className="inline-block ml-2 h-2 w-2 rounded-full bg-success align-middle animate-pulse" />
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Live updates from all your connected systems
          </p>
        </div>
        <button
          onClick={() => setEvents(mockEvents)}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition hover:bg-secondary"
          style={{ border: "1px solid rgba(124,110,245,0.15)", color: "var(--muted-foreground)" }}
        >
          <RefreshCw className="h-3 w-3" /> Refresh
        </button>
      </div>

      {/* List — plain buttons, CSS hover only */}
      <div className="divide-y" style={{ borderColor: "rgba(124,110,245,0.06)" }}>
        {events.map(e => {
          const cfg    = sevConfig[e.sev] ?? sevConfig.info;
          const Icon   = cfg.icon;
          const srcCol = sourceCols[e.source] ?? "#7c6ef5";
          const isSel  = selected === e.id;

          return (
            <div
              key={e.id}
              className="flex items-center gap-4 px-5 py-3.5 transition-colors group"
              style={{ background: isSel ? "var(--secondary)" : "transparent" }}
            >
              {/* main clickable row */}
              <button
                onClick={() => { setSelected(e.id); onSelect(e); }}
                className="flex items-center gap-4 flex-1 min-w-0 text-left"
              >
                <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
                  <Icon className="h-3.5 w-3.5" style={{ color: cfg.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${srcCol}18`, color: srcCol }}>
                      {e.source.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">{e.id}</span>
                    <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{e.svc}</span>
                  </div>
                  <p className="text-xs truncate" style={{ color: "var(--foreground)" }}>{e.summary}</p>
                </div>

                <div className="shrink-0 text-right w-16">
                  <p className="text-xs font-bold" style={{ color: cfg.color }}>{e.conf}%</p>
                  <div className="h-1 rounded-full mt-1 w-full" style={{ background: "var(--muted)" }}>
                    <div className="h-full rounded-full" style={{ width: `${e.conf}%`, background: cfg.color, opacity: 0.7 }} />
                  </div>
                  <p className="text-[10px] mt-1" style={{ color: "var(--muted-foreground)" }}>{e.ts}</p>
                </div>
              </button>

              {/* RCA button — always visible */}
              <button
                onClick={() => setRcaEvent(e)}
                title="Run Root Cause Analysis"
                className="shrink-0 flex items-center gap-1.5 px-2.5 h-7 rounded-lg border border-yellow-400/40
                  bg-yellow-400/10 hover:bg-yellow-400/20 hover:border-yellow-400/60
                  transition-all duration-150"
              >
                <GitBranch className="h-3 w-3 text-yellow-400" />
                <span className="text-[10px] font-semibold text-yellow-400">RCA</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* RCA Modal */}
      {rcaEvent && (
        <RCAReport
          event={rcaEvent}
          history={events}
          onClose={() => setRcaEvent(null)}
        />
      )}
    </div>
  );
}
