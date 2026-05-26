import { useEffect, useState, lazy, Suspense } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

// Lazy-load the entire recharts bundle — it's large and causes SVG path recalculation
// on every page re-render when mounted eagerly.
const LazyChart = lazy(() =>
  import("recharts").then(m => ({
    default: function TrendChart() {
      const { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } = m;
      return (
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={TREND_DATA} margin={{ top: 4, right: 8, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="gradOrder" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#e05c5c" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#e05c5c" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradInv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#52b788" stopOpacity={0.20} />
                <stop offset="95%" stopColor="#52b788" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradMule" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#7c6ef5" stopOpacity={0.20} />
                <stop offset="95%" stopColor="#7c6ef5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradCrm" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f0a500" stopOpacity={0.20} />
                <stop offset="95%" stopColor="#f0a500" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,110,245,0.08)" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#7a7595" }} axisLine={false} tickLine={false} />
            <YAxis domain={[85, 101]} tick={{ fontSize: 10, fill: "#7a7595" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "var(--card)", border: "1px solid rgba(124,110,245,0.15)", borderRadius: 10, fontSize: 11 }}
              formatter={(v: any) => [`${v}%`, ""]}
            />
            <Area type="monotone" dataKey="orderApi"      name="Order API"      stroke="#e05c5c" strokeWidth={1.5} fill="url(#gradOrder)" dot={false} />
            <Area type="monotone" dataKey="inventorySync" name="Inventory Sync"  stroke="#52b788" strokeWidth={1.5} fill="url(#gradInv)"   dot={false} />
            <Area type="monotone" dataKey="muleSoft"      name="MuleSoft"        stroke="#7c6ef5" strokeWidth={1.5} fill="url(#gradMule)"  dot={false} />
            <Area type="monotone" dataKey="crmSync"       name="CRM Sync"        stroke="#f0a500" strokeWidth={1.5} fill="url(#gradCrm)"   dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      );
    },
  }))
);

const BACKEND = (import.meta as any).env?.VITE_BACKEND_URL || "http://localhost:3001";

// Simulated 7-day uptime trend data per service
const TREND_DATA = [
  { day: "Mon", orderApi: 94, inventorySync: 99.9, pricingEngine: 99.5, crmSync: 97, muleSoft: 99.9, salesforce: 95 },
  { day: "Tue", orderApi: 91, inventorySync: 99.8, pricingEngine: 99.2, crmSync: 96, muleSoft: 99.9, salesforce: 96 },
  { day: "Wed", orderApi: 88, inventorySync: 99.9, pricingEngine: 99.8, crmSync: 98, muleSoft: 100,  salesforce: 94 },
  { day: "Thu", orderApi: 95, inventorySync: 100,  pricingEngine: 99.6, crmSync: 97, muleSoft: 99.8, salesforce: 93 },
  { day: "Fri", orderApi: 90, inventorySync: 99.9, pricingEngine: 99.1, crmSync: 96, muleSoft: 99.9, salesforce: 95 },
  { day: "Sat", orderApi: 93, inventorySync: 99.9, pricingEngine: 99.4, crmSync: 99, muleSoft: 99.9, salesforce: 96 },
  { day: "Sun", orderApi: 99, inventorySync: 99.9, pricingEngine: 99.9, crmSync: 98, muleSoft: 99.9, salesforce: 97 },
];

const FALLBACK = [
  { name: "Order API",        uptime: "99.42", latency: "1.8s",  err: "2.1%",  sla: "warning"  },
  { name: "Inventory Sync",   uptime: "99.98", latency: "120ms", err: "0.02%", sla: "healthy"  },
  { name: "Pricing Engine",   uptime: "99.91", latency: "210ms", err: "0.1%",  sla: "healthy"  },
  { name: "CRM Sync",         uptime: "98.74", latency: "640ms", err: "1.4%",  sla: "warning"  },
  { name: "MuleSoft Runtime", uptime: "99.99", latency: "45ms",  err: "0.0%",  sla: "healthy"  },
  { name: "Salesforce Conn.", uptime: "97.21", latency: "1.2s",  err: "3.8%",  sla: "critical" },
];

const slaConfig: Record<string, { col: string; bg: string; label: string }> = {
  healthy:  { col: "#52b788", bg: "#edfaf3", label: "Healthy"  },
  warning:  { col: "#f0a500", bg: "#fff7e6", label: "Warning"  },
  critical: { col: "#e05c5c", bg: "#ffeaea", label: "Issue"    },
};

export function IntegrationHealth() {
  const [services,   setServices]   = useState(FALLBACK);
  const [showChart,  setShowChart]  = useState(false);

  useEffect(() => {
    // Single fetch on mount — no polling interval (polling caused TCP hang freezes on Windows)
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3000);
    fetch(`${BACKEND}/health/integrations`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(d => { if (d?.services) setServices(d.services); })
      .catch(() => { /* backend offline — keep fallback data */ })
      .finally(() => clearTimeout(timer));
    return () => ctrl.abort();
  }, []);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--card)",
        border: "1px solid rgba(124,110,245,0.11)",
        boxShadow: "0 1px 4px rgba(124,110,245,0.06)",
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid rgba(124,110,245,0.08)" }}
      >
        <div>
          <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            System Health Check
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Are all your connected tools running smoothly?
          </p>
        </div>
        <span className="text-[10px] text-muted-foreground">Live status</span>
      </div>

      <div
        className="grid grid-cols-2 md:grid-cols-3 gap-0 divide-x divide-y"
        style={{ borderColor: "rgba(124,110,245,0.07)" }}
      >
        {services.map((s, i) => {
          const cfg    = slaConfig[s.sla] ?? slaConfig.healthy;
          const uptime = parseFloat(s.uptime as unknown as string);
          return (
            <div
              key={s.name}
              className="p-4 hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: cfg.col }} />
                  <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{s.name}</span>
                </div>
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ background: cfg.bg, color: cfg.col }}
                >
                  {cfg.label}
                </span>
              </div>

              {/* Uptime bar */}
              <div className="h-1.5 rounded-full mb-2" style={{ background: "var(--muted)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${uptime}%`, background: cfg.col }}
                />
              </div>

              <div className="flex justify-between text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                <span>{s.uptime}% uptime</span>
                <span>{s.latency} · {s.err} errors</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 7-DAY UPTIME TREND CHART — lazy loaded on demand */}
      <div style={{ borderTop: "1px solid rgba(124,110,245,0.08)" }}>
        <button
          onClick={() => setShowChart(c => !c)}
          className="w-full flex items-center justify-between px-5 py-3 hover:bg-secondary/30 transition-colors"
        >
          <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
            7-Day Uptime Trend
          </p>
          {showChart
            ? <ChevronUp   className="h-3.5 w-3.5" style={{ color: "var(--muted-foreground)" }} />
            : <ChevronDown className="h-3.5 w-3.5" style={{ color: "var(--muted-foreground)" }} />}
        </button>

        {showChart && (
          <div className="px-5 pb-4">
            <Suspense fallback={
              <div className="h-[140px] flex items-center justify-center text-xs text-muted-foreground">
                Loading chart...
              </div>
            }>
              <LazyChart />
            </Suspense>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              {[
                { label: "Order API",      col: "#e05c5c" },
                { label: "Inventory Sync", col: "#52b788" },
                { label: "MuleSoft",       col: "#7c6ef5" },
                { label: "CRM Sync",       col: "#f0a500" },
              ].map(l => (
                <span key={l.label} className="inline-flex items-center gap-1.5 text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                  <span className="h-2 w-4 rounded-full inline-block" style={{ background: l.col }} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
