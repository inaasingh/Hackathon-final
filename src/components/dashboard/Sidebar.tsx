import { useState } from "react";
import {
  Sparkles, LayoutDashboard, Activity, FileText,
  HeartPulse, ShieldCheck, Settings, LogOut,
  CalendarClock, Bot, Lightbulb, ExternalLink,
  Cloud, GitBranch, BarChart2, CloudCog, Plug,
} from "lucide-react";
import logoSrc from "../../assets/logo.png";
import { auth } from "../../lib/auth";
import type { IntegrationId } from "./IntegrationHub";

const LOGO_SRC     = logoSrc;
const COMPANY_NAME = "AbsoluteLabs";

const navItems = [
  { icon: LayoutDashboard, label: "Overview",        scrollTo: "top"                       },
  { icon: Activity,        label: "Live Updates",    scrollTo: "event-stream",  badge: 12  },
  { icon: FileText,        label: "Smart Reports",   scrollTo: "ai-workspace",  badge: 3   },
  { icon: HeartPulse,      label: "System Health",   scrollTo: "integration-health"        },
  { icon: CalendarClock,   label: "Schedules",       scrollTo: "schedules"                 },
  { icon: Lightbulb,       label: "Recommendations", scrollTo: "recommendations"           },
  { icon: Bot,             label: "AI Copilot",      scrollTo: null,            badge: "AI"},
  { icon: ShieldCheck,     label: "Compliance",      scrollTo: null                        },
  { icon: Settings,        label: "Settings",        scrollTo: null                        },
];

// Integration connectors shown in the sidebar
const integrations: {
  id: IntegrationId;
  icon: typeof Cloud;
  label: string;
  url: string;
  color: string;
  dotColor: string;
}[] = [
  { id: "mulesoft",  icon: Cloud,      label: "MuleSoft CloudHub",  url: "https://anypoint.mulesoft.com/cloudhub", color: "#002060", dotColor: "#52b788" },
  { id: "anypoint",  icon: CloudCog,   label: "Anypoint Studio",    url: "https://anypoint.mulesoft.com",          color: "#1976d2", dotColor: "#52b788" },
  { id: "jira",      icon: GitBranch,  label: "Jira",               url: "https://www.atlassian.com/software/jira",color: "#0052cc", dotColor: "#52b788" },
  { id: "salesforce", icon: BarChart2,  label: "Salesforce CRM",     url: "https://login.salesforce.com",           color: "#00a1e0", dotColor: "#52b788" },
  { id: "zoho",      icon: Plug,       label: "Zoho Desk",          url: "https://desk.zoho.in",                   color: "#e05c5c", dotColor: "#52b788" },
];

interface Props {
  onIntegrationSelect?: (id: IntegrationId) => void;
}

export function Sidebar({ onIntegrationSelect }: Props) {
  const [active, setActive] = useState("Overview");

  function handleNav(item: typeof navItems[0]) {
    setActive(item.label);
    if (!item.scrollTo) return;
    if (item.scrollTo === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    document.getElementById(item.scrollTo)?.scrollIntoView({ behavior: "smooth" });
  }

  function handleIntegration(intg: typeof integrations[0]) {
    setActive(intg.label);
    // Scroll to the integration section
    document.getElementById("integration-hub")?.scrollIntoView({ behavior: "smooth" });
    // Notify parent to switch tab
    onIntegrationSelect?.(intg.id);
  }

  return (
    <aside
      className="flex flex-col shrink-0 h-screen"
      style={{
        width: 220,
        background: "var(--sidebar)",
        borderRight: "1px solid rgba(124,110,245,0.10)",
        zIndex: 10,
        position: "relative",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-5 h-[68px] shrink-0"
        style={{ borderBottom: "1px solid rgba(124,110,245,0.08)" }}
      >
        {LOGO_SRC ? (
          <>
            <img
              src={LOGO_SRC}
              alt={COMPANY_NAME}
              className="h-8 w-auto max-w-[32px] object-contain shrink-0"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
            <span className="font-bold text-base tracking-tight" style={{ color: "var(--foreground)" }}>
              {COMPANY_NAME}
            </span>
          </>
        ) : (
          <>
            <div
              className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg,#7c6ef5,#a78ef8)" }}
            >
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight" style={{ color: "var(--foreground)" }}>
              {COMPANY_NAME}
            </span>
          </>
        )}
      </div>

      {/* ── Scrollable nav + integrations ── */}
      <div className="flex-1 overflow-y-auto">
        <nav className="px-3 pt-4 pb-1 space-y-0.5">
          {navItems.map(item => {
            const isActive = active === item.label;
            return (
              <button
                key={item.label}
                onClick={() => handleNav(item)}
                className="relative w-full flex items-center gap-3 px-3 h-10 rounded-xl text-sm transition-all"
                style={{
                  background: isActive ? "var(--secondary)" : "transparent",
                  color: isActive ? "var(--primary)" : "var(--muted-foreground)",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full transition-all duration-200"
                  style={{ width: 3, height: 20, background: "var(--primary)", opacity: isActive ? 1 : 0 }}
                />
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge != null && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: isActive ? "var(--primary)" : "var(--secondary)",
                      color: isActive ? "var(--primary-foreground)" : "var(--primary)",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* ── Integrations section — immediately after nav ── */}
        <div className="px-3 pb-3" style={{ borderTop: "1px solid rgba(124,110,245,0.08)" }}>
          <p className="px-3 pt-2 text-[10px] font-bold uppercase tracking-widest mb-1"
            style={{ color: "var(--muted-foreground)", opacity: 0.6 }}>
            Integrations
          </p>
          {integrations.map(intg => {
            const isActive = active === intg.label;
            return (
              <div key={intg.id} className="relative flex items-center group">
                <button
                  onClick={() => handleIntegration(intg)}
                  className="relative w-full flex items-center gap-2.5 px-3 h-9 rounded-xl text-sm transition-all"
                  style={{
                    background: isActive ? `${intg.color}14` : "transparent",
                    color:      isActive ? intg.color : "var(--muted-foreground)",
                    fontWeight: isActive ? 600 : 400,
                  }}
                  title={`View ${intg.label} data`}
                >
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full transition-all duration-200"
                    style={{ width: 3, height: 18, background: intg.color, opacity: isActive ? 1 : 0 }}
                  />
                  <span
                    className="h-1.5 w-1.5 rounded-full shrink-0 animate-pulse"
                    style={{ background: intg.dotColor }}
                  />
                  <intg.icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="flex-1 text-left text-xs truncate">{intg.label}</span>
                  <a
                    href={intg.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="opacity-0 group-hover:opacity-70 hover:!opacity-100 transition-opacity p-0.5 rounded"
                    title={`Open ${intg.label}`}
                  >
                    <ExternalLink className="h-3 w-3" style={{ color: "var(--muted-foreground)" }} />
                  </a>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Sign out — always pinned to bottom ── */}
      <div className="px-3 py-4 shrink-0" style={{ borderTop: "1px solid rgba(124,110,245,0.08)" }}>
        <button
          onClick={() => auth.logout()}
          className="w-full flex items-center gap-3 px-3 h-10 rounded-xl text-sm transition-all"
          style={{ color: "var(--muted-foreground)" }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = "var(--muted)")}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
