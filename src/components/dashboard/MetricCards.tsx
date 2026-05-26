import {
  GitPullRequest, FileText, ClipboardCheck,
  AlertTriangle, ShieldCheck, ArrowUpRight, ArrowDownRight,
} from "lucide-react";

const metrics = [
  { label: "Updates Today",   value: "47",    trend: "+12%",  up: true,  icon: GitPullRequest, col: "#7c6ef5", bg: "#ede8ff", spark: [28,35,31,42,38,44,47] },
  { label: "Reports Created", value: "128",   trend: "+24%",  up: true,  icon: FileText,        col: "#9b8ff5", bg: "#f0edff", spark: [82,90,98,104,115,121,128] },
  { label: "Needs Attention", value: "9",     trend: "-3",    up: false, icon: ClipboardCheck,  col: "#f0a500", bg: "#fff7e6", spark: [14,13,12,11,11,10,9] },
  { label: "Urgent Issues",   value: "2",     trend: "+1",    up: true,  icon: AlertTriangle,   col: "#e05c5c", bg: "#ffeaea", spark: [1,1,2,1,2,1,2] },
  { label: "Overall Health",  value: "94.3%", trend: "+1.2%", up: true,  icon: ShieldCheck,     col: "#52b788", bg: "#edfaf3", spark: [91.2,92.0,92.8,93.2,93.8,94.1,94.3] },
];

function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const w = 72, h = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const barW = Math.floor((w - (data.length - 1) * 3) / data.length);
  const lastIdx = data.length - 1;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      {data.map((v, i) => {
        const barH = Math.max(3, Math.round(((v - min) / range) * (h - 4)));
        const x = i * (barW + 3);
        const y = h - barH;
        return (
          <rect
            key={i} x={x} y={y} width={barW} height={barH} rx={2}
            fill={color}
            opacity={i === lastIdx ? 1 : 0.35 + (i / lastIdx) * 0.45}
          />
        );
      })}
    </svg>
  );
}

export function MetricCards() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="rounded-2xl p-4 cursor-default transition-transform duration-150 hover:-translate-y-0.5"
          style={{
            background: "var(--card)",
            border: "1px solid rgba(124,110,245,0.11)",
            boxShadow: "0 1px 4px rgba(124,110,245,0.06)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: m.bg }}>
              <m.icon className="h-4 w-4" style={{ color: m.col }} />
            </div>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold" style={{ color: m.up ? "#52b788" : "#f0a500" }}>
              {m.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {m.trend}
            </span>
          </div>
          <p className="text-2xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>{m.value}</p>
          <p className="text-[11px] mt-0.5 mb-2" style={{ color: "var(--muted-foreground)" }}>{m.label}</p>
          <MiniBarChart data={m.spark} color={m.col} />
        </div>
      ))}
    </div>
  );
}
