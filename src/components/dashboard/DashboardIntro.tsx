/**
 * DashboardIntro — Animated entry screen
 * Shows on first load: time-based greeting → system status items → enter dashboard
 */
import { useEffect, useState } from "react";
import { ArrowRight, LayoutDashboard, Ticket, FileBarChart2, Bell, Presentation, ShieldCheck } from "lucide-react";

const ITEMS = [
  { icon: LayoutDashboard, color: "#C6C1F7", label: "One place for all your support operations",         delay: 600  },
  { icon: Ticket,          color: "#52b788", label: "AI reads and prioritises every ticket automatically", delay: 1000 },
  { icon: Bell,            color: "#e05c5c", label: "Get alerted before issues become problems",           delay: 1400 },
  { icon: ShieldCheck,     color: "#ACEDF3", label: "Root cause analysis traced by AI in seconds",         delay: 1800 },
  { icon: FileBarChart2,   color: "#f0a500", label: "Governance reports written for you automatically",    delay: 2200 },
  { icon: Presentation,    color: "#FE92C9", label: "Download a boardroom-ready PowerPoint instantly",     delay: 2600 },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardIntro({ onEnter }: { onEnter: () => void }) {
  const [greetingVisible,  setGreetingVisible]  = useState(false);
  const [subtitleVisible,  setSubtitleVisible]  = useState(false);
  const [visibleItems,     setVisibleItems]     = useState<number[]>([]);
  const [btnVisible,       setBtnVisible]       = useState(false);
  const [exiting,          setExiting]          = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setGreetingVisible(true),  200));
    timers.push(setTimeout(() => setSubtitleVisible(true),  550));

    ITEMS.forEach((item, i) => {
      timers.push(setTimeout(() => {
        setVisibleItems(prev => [...prev, i]);
      }, item.delay));
    });

    timers.push(setTimeout(() => setBtnVisible(true), 3100));

    return () => timers.forEach(clearTimeout);
  }, []);

  function handleEnter() {
    setExiting(true);
    setTimeout(onEnter, 500);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #0d0b14 0%, #191723 50%, #1e1a2e 100%)",
        opacity: exiting ? 0 : 1,
        transition: "opacity 0.5s ease",
        pointerEvents: exiting ? "none" : "auto",
      }}
    >
      {/* Background decorative blobs */}
      <div style={{ position: "absolute", top: "10%",  left: "15%",  width: 400, height: 400, borderRadius: "50%", background: "rgba(124,110,245,0.06)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "15%", width: 300, height: 300, borderRadius: "50%", background: "rgba(198,193,247,0.05)", filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "40%",  right: "25%",  width: 200, height: 200, borderRadius: "50%", background: "rgba(82,183,136,0.04)", filter: "blur(50px)", pointerEvents: "none" }} />

      <div className="relative z-10 w-full max-w-lg px-8">

        {/* Greeting */}
        <div
          style={{
            opacity: greetingVisible ? 1 : 0,
            transform: greetingVisible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#9b8ff5" }}>
            Synapse · AI Delivery Copilot
          </p>
          <h1 className="text-4xl font-bold leading-tight" style={{ color: "#F3F2FF" }}>
            {getGreeting()},<br />
            <span style={{ color: "#C6C1F7" }}>welcome back.</span>
          </h1>
        </div>

        {/* Subtitle */}
        <div
          className="mt-3 mb-8"
          style={{
            opacity: subtitleVisible ? 1 : 0,
            transform: subtitleVisible ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}
        >
          <p className="text-sm" style={{ color: "rgba(243,242,255,0.45)" }}>
            Your AI-powered command centre for retail support operations.
          </p>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: "linear-gradient(90deg, rgba(198,193,247,0.3) 0%, transparent 100%)",
            marginBottom: "1.5rem",
            opacity: subtitleVisible ? 1 : 0,
            transition: "opacity 0.5s ease 0.2s",
          }}
        />

        {/* Feature items */}
        <div className="space-y-3 mb-8">
          {ITEMS.map((item, i) => {
            const visible = visibleItems.includes(i);
            const Icon = item.icon;
            return (
              <div
                key={i}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateX(0)" : "translateX(-12px)",
                  transition: "opacity 0.4s ease, transform 0.4s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: `${item.color}18`,
                    border: `1px solid ${item.color}30`,
                  }}
                >
                  <Icon style={{ width: 14, height: 14, color: item.color }} />
                </div>
                <span className="text-sm" style={{ color: "rgba(243,242,255,0.75)" }}>
                  {item.label}
                </span>
                {visible && (
                  <span
                    style={{
                      marginLeft: "auto", fontSize: 10, fontWeight: 600,
                      color: item.color, opacity: 0.8,
                      animation: "fadeIn 0.3s ease",
                    }}
                  >
                    ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Enter button */}
        <div
          style={{
            opacity: btnVisible ? 1 : 0,
            transform: btnVisible ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}
        >
          <button
            onClick={handleEnter}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99]"
            style={{
              background: "linear-gradient(135deg, #7c6ef5 0%, #a78ef8 100%)",
              boxShadow: "0 4px 24px rgba(124,110,245,0.35)",
            }}
          >
            Open Dashboard
            <ArrowRight style={{ width: 15, height: 15 }} />
          </button>
          <p className="text-center text-[10px] mt-3" style={{ color: "rgba(243,242,255,0.25)" }}>
            Absolute Retail Consulting · {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
