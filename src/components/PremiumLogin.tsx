/**
 * PremiumLogin — rendered outside TanStack Router (from main.jsx).
 * Uncontrolled inputs → zero React work while typing.
 * Memoised RightPanel → never re-renders on tab / loading state changes.
 */
import React, { useRef, useState, memo } from "react";
import { Sparkles, ArrowRight, Loader2, Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import logoSrc from "../assets/logo.png";

interface Props { onLogin: () => void; }

/* ── Social icons ─────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21">
      <rect x="1"  y="1"  width="9" height="9" fill="#F25022"/>
      <rect x="11" y="1"  width="9" height="9" fill="#7FBA00"/>
      <rect x="1"  y="11" width="9" height="9" fill="#00A4EF"/>
      <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
    </svg>
  );
}
function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#1c1828" d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 17.07 3.633 16.7 3.633 16.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

/* ── Right panel — memoised, animated, never re-renders ─────────
   Safe because: uncontrolled inputs mean no parent re-renders,
   and radial-gradient replaces filter:blur() (no GPU blur cost).  */
const RightPanel = memo(function RightPanel() {
  return (
    <div style={{
      width: "45%",
      background: "#100a24",
      position: "relative",
      overflow: "hidden",
      flexShrink: 0,
    }}>
      {/* Animated gradient orbs — radial-gradient, no filter:blur */}
      <div style={{
        position: "absolute", top: "-80px", left: "-60px",
        width: "500px", height: "500px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(110,60,240,0.80) 0%, transparent 62%)",
        animation: "blob-drift-1 10s ease-in-out infinite",
        willChange: "transform",
      }}/>
      <div style={{
        position: "absolute", top: "30%", right: "-80px",
        width: "420px", height: "420px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(150,80,255,0.65) 0%, transparent 62%)",
        animation: "blob-drift-2 13s ease-in-out infinite",
        willChange: "transform",
      }}/>
      <div style={{
        position: "absolute", bottom: "-60px", left: "5%",
        width: "380px", height: "380px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(200,60,160,0.55) 0%, transparent 62%)",
        animation: "blob-drift-3 11s ease-in-out infinite",
        willChange: "transform",
      }}/>
      <div style={{
        position: "absolute", top: "10%", right: "20%",
        width: "280px", height: "280px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(60,80,220,0.40) 0%, transparent 62%)",
        animation: "blob-drift-4 16s ease-in-out infinite",
        willChange: "transform",
      }}/>

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 1,
        height: "100%", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "48px 44px", gap: "30px",
      }}>
        {/* Headline */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "7px",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "999px", padding: "5px 14px", marginBottom: "20px",
          }}>
            <Sparkles size={12} color="#c084fc"/>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#c084fc", letterSpacing: "0.04em" }}>
              AI DELIVERY COPILOT
            </span>
          </div>
          <h2 style={{
            fontSize: "38px", fontWeight: 900, color: "#ffffff",
            lineHeight: 1.12, letterSpacing: "-1px", margin: 0,
            textAlign: "center",
          }}>
            Your code ships.<br/>
            <span style={{
              background: "linear-gradient(135deg, #c084fc 0%, #e879f9 50%, #818cf8 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              The docs write themselves.
            </span>
          </h2>
          <p style={{
            fontSize: "15px", textAlign: "center",
            color: "rgba(255,255,255,0.55)", lineHeight: 1.65, maxWidth: "320px",
            margin: "16px auto 0",
          }}>
            AbsoluteLabs detects every change across your stack and instantly generates governance docs, runbooks, and impact reports — so your team never slows down.
          </p>
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", maxWidth: "340px" }}>
          {["Real-time monitoring", "AI impact analysis", "Auto-generated docs", "128 docs / week"].map(pill => (
            <div key={pill} style={{
              padding: "6px 14px",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.13)",
              borderRadius: "999px", fontSize: "12px",
              color: "rgba(255,255,255,0.70)", fontWeight: 500,
            }}>{pill}</div>
          ))}
        </div>

        {/* Stats card */}
        <div style={{
          width: "100%", maxWidth: "340px",
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "18px", padding: "22px 24px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
            <div style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: "#52b788", boxShadow: "0 0 8px rgba(82,183,136,0.9)",
            }}/>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.90)" }}>
              Platform Overview
            </span>
            <span style={{ marginLeft: "auto", fontSize: "11px", color: "rgba(255,255,255,0.40)" }}>LIVE</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "18px" }}>
            {[
              { value: "94.3%", label: "Health",    color: "#52b788" },
              { value: "128",   label: "Docs/wk",   color: "#c084fc" },
              { value: "78%",   label: "Time saved", color: "#a78ef8" },
            ].map(({ value, label, color }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "22px", fontWeight: 800, color, letterSpacing: "-0.5px" }}>{value}</div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", marginTop: "3px", fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
            {[
              { name: "Order API", pct: 94, color: "#52b788" },
              { name: "CRM Sync",  pct: 79, color: "#f0a500" },
              { name: "MuleSoft",  pct: 99, color: "#52b788" },
            ].map(({ name, pct, color }) => (
              <div key={name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "rgba(255,255,255,0.45)", marginBottom: "4px" }}>
                  <span>{name}</span>
                  <span style={{ color, fontWeight: 700 }}>{pct}%</span>
                </div>
                <div style={{ height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "999px" }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

/* ── Main export ─────────────────────────────────────────────── */
export function PremiumLogin({ onLogin }: Props) {
  /* State only changes on button clicks — NEVER on keystrokes */
  const [tab,     setTab]     = useState<"in"|"up">("in");
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  /* Uncontrolled refs — typing = zero React work */
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef  = useRef<HTMLInputElement>(null);
  const nameRef  = useRef<HTMLInputElement>(null);

  function doLogin() {
    setLoading(true);
    setTimeout(onLogin, 650);
  }

  /* Shared input style — defined outside render for stability */
  const inputWrap: React.CSSProperties = {
    position: "relative", display: "flex", alignItems: "center",
  };
  const inputEl: React.CSSProperties = {
    width: "100%", padding: "13px 16px 13px 42px",
    border: "1.5px solid rgba(124,110,245,0.22)",
    borderRadius: "12px", fontSize: "14px", color: "#1c1828",
    background: "rgba(255,255,255,0.82)",
    outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  };
  const iconStyle: React.CSSProperties = {
    position: "absolute", left: "14px",
    color: "rgba(124,110,245,0.55)", pointerEvents: "none", flexShrink: 0,
  };

  return (
    <>
      {/* ── CSS injected once — keyframes + grain ── */}
      <style>{`
        @keyframes blob-drift-1 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(40px,-30px) scale(1.06); }
          66%      { transform: translate(-20px,18px) scale(0.95); }
        }
        @keyframes blob-drift-2 {
          0%,100% { transform: translate(0,0) scale(1); }
          40%      { transform: translate(-45px,25px) scale(1.10); }
          70%      { transform: translate(28px,-40px) scale(0.92); }
        }
        @keyframes blob-drift-3 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(30px,35px) scale(1.05); }
        }
        @keyframes blob-drift-4 {
          0%,100% { transform: translate(0,0) scale(0.96); }
          50%      { transform: translate(-35px,-25px) scale(1.08); }
        }
        .pl-input:focus {
          border-color: rgba(124,110,245,0.60) !important;
          box-shadow: 0 0 0 3px rgba(124,110,245,0.10) !important;
        }
        .pl-social:hover {
          background: rgba(255,255,255,0.95) !important;
          border-color: rgba(124,110,245,0.38) !important;
        }
      `}</style>

      <div style={{
        display: "flex", height: "100vh", width: "100vw", overflow: "hidden",
        fontFamily: 'ui-sans-serif,-apple-system,"Inter",system-ui,sans-serif',
      }}>

        {/* ══ LEFT PANEL ════════════════════════════════════════ */}
        <div style={{
          width: "55%", flexShrink: 0,
          position: "relative", overflow: "hidden",
          display: "flex", flexDirection: "column",
          background: "#f5f0eb",
        }}>

          {/* Grain texture — position:absolute, NO mixBlendMode, just opacity */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='260'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='260' height='260' filter='url(%23g)'/%3E%3C/svg%3E")`,
            backgroundSize: "160px 160px",
            opacity: 0.055,
            pointerEvents: "none",
            zIndex: 0,
          }}/>

          {/* Subtle purple warmth blob — fully static */}
          <div style={{
            position: "absolute", top: "-120px", right: "-80px",
            width: "380px", height: "380px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,110,245,0.08) 0%, transparent 65%)",
            pointerEvents: "none", zIndex: 0,
          }}/>
          <div style={{
            position: "absolute", bottom: "-100px", left: "-60px",
            width: "340px", height: "340px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(167,142,248,0.07) 0%, transparent 65%)",
            pointerEvents: "none", zIndex: 0,
          }}/>

          {/* Nav */}
          <nav style={{
            position: "relative", zIndex: 1,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "20px 40px",
            borderBottom: "1px solid rgba(124,110,245,0.10)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img
                src={logoSrc} alt="AbsoluteLabs"
                style={{ height: "32px", width: "32px", objectFit: "contain" }}
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
              <span style={{ fontWeight: 800, fontSize: "15px", color: "#1c1828", letterSpacing: "-0.3px" }}>
                AbsoluteLabs
              </span>
            </div>
            <div style={{ display: "flex", gap: "24px" }}>
              {["Home","About","Features","Contact"].map(l => (
                <span key={l} style={{ fontSize: "13px", color: "#8a8399", cursor: "default", fontWeight: 500 }}>{l}</span>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setTab("in")} style={{
                padding: "7px 16px", fontSize: "13px", fontWeight: 500, color: "#3d3660",
                background: "transparent", border: "1px solid rgba(124,110,245,0.28)",
                borderRadius: "8px", cursor: "pointer", fontFamily: "inherit",
              }}>Login</button>
              <button onClick={() => setTab("up")} style={{
                padding: "7px 16px", fontSize: "13px", fontWeight: 600, color: "#fff",
                background: "linear-gradient(135deg,#7c6ef5,#a78ef8)",
                border: "none", borderRadius: "8px", cursor: "pointer", fontFamily: "inherit",
              }}>Sign up</button>
            </div>
          </nav>

          {/* Form */}
          <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            padding: "32px 40px", position: "relative", zIndex: 1,
          }}>
            <div style={{ width: "100%", maxWidth: "400px" }}>

              {/* Badge */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: "rgba(124,110,245,0.10)",
                border: "1px solid rgba(124,110,245,0.20)",
                borderRadius: "999px", padding: "4px 12px", marginBottom: "16px",
              }}>
                <Sparkles size={12} color="#7c6ef5"/>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#7c6ef5", letterSpacing: "0.03em" }}>
                  AI DELIVERY COPILOT
                </span>
              </div>

              <h1 style={{
                fontSize: "28px", fontWeight: 800, color: "#1c1828",
                letterSpacing: "-0.5px", margin: "0 0 6px",
              }}>
                {tab === "in" ? "Welcome back" : "Create your account"}
              </h1>
              <p style={{ fontSize: "14px", color: "#7a7595", margin: "0 0 28px" }}>
                {tab === "in"
                  ? "Sign in to your AbsoluteLabs workspace"
                  : "Start delivering smarter with AI"}
              </p>

              {/* Tabs */}
              <div style={{
                display: "flex", marginBottom: "26px",
                borderBottom: "2px solid rgba(124,110,245,0.12)",
              }}>
                {([["in","Sign In"],["up","Sign Up"]] as const).map(([t, label]) => (
                  <button key={t} onClick={() => { setTab(t); setLoading(false); }} style={{
                    padding: "8px 20px", fontSize: "14px",
                    fontWeight: tab === t ? 700 : 500,
                    color: tab === t ? "#7c6ef5" : "#8a8399",
                    background: "transparent", border: "none",
                    borderBottom: tab === t ? "2px solid #7c6ef5" : "2px solid transparent",
                    marginBottom: "-2px", cursor: "pointer", fontFamily: "inherit",
                  }}>{label}</button>
                ))}
              </div>

              {/* ── INPUTS — no <form>, no type=password, uncontrolled refs ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

                {tab === "up" && (
                  <div style={inputWrap}>
                    <User size={15} style={iconStyle}/>
                    <input ref={nameRef} className="pl-input"
                      type="text" placeholder="Full name"
                      autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                      style={inputEl}
                    />
                  </div>
                )}

                <div style={inputWrap}>
                  <Mail size={15} style={iconStyle}/>
                  <input ref={emailRef} className="pl-input"
                    type="text" placeholder="Email address"
                    autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                    style={inputEl}
                  />
                </div>

                <div style={inputWrap}>
                  <Lock size={15} style={iconStyle}/>
                  <input ref={passRef} className="pl-input"
                    type="text" placeholder="Password"
                    autoComplete="off" autoCorrect="off" spellCheck={false}
                    style={{
                      ...inputEl,
                      paddingRight: "44px",
                      WebkitTextSecurity: showPw ? "none" : ("disc" as any),
                    }}
                  />
                  {/* Eye toggle — single click, tiny state update, acceptable */}
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    style={{
                      position: "absolute", right: "13px",
                      background: "transparent", border: "none",
                      cursor: "pointer", padding: 0,
                      color: "#8a8399", display: "flex", alignItems: "center",
                    }}
                  >
                    {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
              </div>

              {tab === "in" && (
                <div style={{ textAlign: "right", marginTop: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#7c6ef5", cursor: "pointer", fontWeight: 500 }}>
                    Forgot password?
                  </span>
                </div>
              )}

              {/* Submit */}
              <button
                type="button"
                onClick={doLogin}
                disabled={loading}
                style={{
                  marginTop: "20px", width: "100%", padding: "13px",
                  background: loading
                    ? "rgba(124,110,245,0.55)"
                    : "linear-gradient(135deg,#7c6ef5,#a78ef8)",
                  color: "#fff", border: "none", borderRadius: "12px",
                  fontSize: "14px", fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  boxShadow: "0 4px 18px rgba(124,110,245,0.32)",
                }}
              >
                {loading
                  ? <><Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }}/>{tab === "in" ? "Signing in…" : "Creating account…"}</>
                  : <>{tab === "in" ? "Sign In" : "Create Account"}<ArrowRight size={16}/></>
                }
              </button>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
                <div style={{ flex: 1, height: "1px", background: "rgba(124,110,245,0.14)" }}/>
                <span style={{ fontSize: "12px", color: "#8a8399", fontWeight: 500 }}>or continue with</span>
                <div style={{ flex: 1, height: "1px", background: "rgba(124,110,245,0.14)" }}/>
              </div>

              {/* Social */}
              <div style={{ display: "flex", gap: "10px" }}>
                {[
                  { label: "Google",    Icon: GoogleIcon    },
                  { label: "Microsoft", Icon: MicrosoftIcon },
                  { label: "GitHub",    Icon: GitHubIcon    },
                ].map(({ label, Icon }) => (
                  <button key={label} type="button" className="pl-social"
                    onClick={doLogin}
                    style={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                      gap: "6px", padding: "10px 8px",
                      background: "rgba(255,255,255,0.85)",
                      border: "1.5px solid rgba(124,110,245,0.18)",
                      borderRadius: "10px", fontSize: "13px", fontWeight: 600,
                      color: "#1c1828", cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    <Icon/><span>{label}</span>
                  </button>
                ))}
              </div>

              <p style={{ textAlign: "center", fontSize: "12px", color: "#a09ab8", marginTop: "24px" }}>
                By continuing you agree to our{" "}
                <span style={{ color: "#7c6ef5", cursor: "pointer" }}>Terms of Service</span>{" "}&amp;{" "}
                <span style={{ color: "#7c6ef5", cursor: "pointer" }}>Privacy Policy</span>
              </p>
            </div>
          </div>
        </div>

        {/* ══ RIGHT PANEL — memoised, animated, never re-renders ══ */}
        <RightPanel/>
      </div>
    </>
  );
}
