/**
 * DashboardIntro — Access confirmation + animated entry screen.
 * Shows the logged-in user's name, role, and which project(s) they can access.
 */
import { useEffect, useState } from "react";
import { ArrowRight, Lock, ShieldCheck, Layers } from "lucide-react";
import { auth } from "@/lib/auth";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardIntro({ onEnter }: { onEnter: () => void }) {
  const [visible,  setVisible]  = useState(false);
  const [btnReady, setBtnReady] = useState(false);
  const [exiting,  setExiting]  = useState(false);

  const user    = auth.getUser();
  const isAdmin = !user || user.projects.length === 0;

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true),   150);
    const t2 = setTimeout(() => setBtnReady(true), 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  function handleEnter() {
    setExiting(true);
    setTimeout(onEnter, 400);
  }

  // Avatar colours — cycle through a set based on first initial
  const avatarBg = isAdmin
    ? "linear-gradient(135deg,#52b788,#38a169)"
    : "linear-gradient(135deg,#7c6ef5,#a78ef8)";

  const displayName = user?.displayName ?? "Guest";
  const initials    = user?.initials    ?? "??";
  const role        = user?.role        ?? "Viewer";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg,#0d0b14 0%,#191723 50%,#1e1a2e 100%)",
        opacity: exiting ? 0 : 1,
        transition: "opacity 0.4s ease",
        pointerEvents: exiting ? "none" : "auto",
      }}
    >
      {/* Background blobs */}
      <div style={{ position:"absolute", top:"10%",  left:"15%",  width:400, height:400, borderRadius:"50%", background:"rgba(124,110,245,0.06)", filter:"blur(80px)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:"10%", right:"15%", width:300, height:300, borderRadius:"50%", background:"rgba(198,193,247,0.05)", filter:"blur(60px)", pointerEvents:"none" }} />

      <div
        className="relative z-10 w-full max-w-md px-8"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        {/* ── Header label ── */}
        <p className="text-xs font-semibold tracking-widest uppercase mb-6" style={{ color:"#9b8ff5" }}>
          Synapse · AI Delivery Copilot
        </p>

        {/* ── User avatar + greeting ── */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="h-16 w-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0"
            style={{ background: avatarBg, boxShadow:"0 8px 24px rgba(124,110,245,0.35)" }}
          >
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium mb-0.5" style={{ color:"rgba(243,242,255,0.5)" }}>
              {getGreeting()} 👋
            </p>
            <h1 className="text-2xl font-bold leading-tight" style={{ color:"#F3F2FF" }}>
              {displayName}
            </h1>
            <p className="text-xs mt-0.5" style={{ color:"rgba(243,242,255,0.4)" }}>{role}</p>
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{ height:1, background:"linear-gradient(90deg,rgba(198,193,247,0.25) 0%,transparent 100%)", marginBottom:"1.5rem" }} />

        {/* ── ACCESS PANEL — the key visual ── */}
        <div
          className="rounded-2xl p-5 mb-6"
          style={{
            background: isAdmin
              ? "rgba(82,183,136,0.07)"
              : "rgba(124,110,245,0.08)",
            border: isAdmin
              ? "1px solid rgba(82,183,136,0.25)"
              : "1px solid rgba(124,110,245,0.25)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            {isAdmin
              ? <Layers    className="h-4 w-4" style={{ color:"#52b788" }} />
              : <Lock      className="h-4 w-4" style={{ color:"#9b8ff5" }} />
            }
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: isAdmin ? "#52b788" : "#9b8ff5" }}>
              {isAdmin ? "Admin Access — All Projects" : "Project Access"}
            </p>
          </div>

          {isAdmin ? (
            <p className="text-sm" style={{ color:"rgba(243,242,255,0.65)" }}>
              You have <strong style={{ color:"#52b788" }}>unrestricted access</strong> to all client projects and integrations.
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-xs mb-3" style={{ color:"rgba(243,242,255,0.45)" }}>
                Your account has been scoped to the following project:
              </p>
              {user!.projects.map(proj => (
                <div
                  key={proj}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                  style={{ background:"rgba(124,110,245,0.12)", border:"1px solid rgba(124,110,245,0.2)" }}
                >
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" style={{ color:"#9b8ff5" }} />
                  <span className="text-sm font-semibold" style={{ color:"#F3F2FF" }}>{proj}</span>
                  <span
                    className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background:"rgba(124,110,245,0.2)", color:"#C6C1F7" }}
                  >
                    ACTIVE
                  </span>
                </div>
              ))}
              <p className="text-[10px] mt-2" style={{ color:"rgba(243,242,255,0.3)" }}>
                Contact your AbsoluteLabs administrator to request access to additional projects.
              </p>
            </div>
          )}
        </div>

        {/* ── Enter button ── */}
        <div
          style={{
            opacity: btnReady ? 1 : 0,
            transform: btnReady ? "translateY(0)" : "translateY(6px)",
            transition: "opacity 0.4s ease, transform 0.4s ease",
          }}
        >
          <button
            onClick={handleEnter}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.99]"
            style={{
              background: isAdmin
                ? "linear-gradient(135deg,#52b788,#38a169)"
                : "linear-gradient(135deg,#7c6ef5,#a78ef8)",
              boxShadow: isAdmin
                ? "0 4px 24px rgba(82,183,136,0.3)"
                : "0 4px 24px rgba(124,110,245,0.35)",
            }}
          >
            Open Dashboard
            <ArrowRight style={{ width:15, height:15 }} />
          </button>
          <p className="text-center text-[10px] mt-3" style={{ color:"rgba(243,242,255,0.2)" }}>
            AbsoluteLabs · {new Date().toLocaleDateString("en-GB",{ weekday:"long", day:"numeric", month:"long" })}
          </p>
        </div>
      </div>
    </div>
  );
}
