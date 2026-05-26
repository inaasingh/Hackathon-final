import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, {
  useRef, useState, useEffect, useCallback, memo,
} from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { auth } from "../lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

/* ═══════════════════════════════════════════════════════════════════
   FadingVideo — rAF-driven crossfade loop, zero CSS transitions
════════════════════════════════════════════════════════════════════ */
const FADE_MS       = 500;
const FADE_OUT_LEAD = 0.55;

function FadingVideo({
  src, className, style,
}: {
  src: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const rafRef      = useRef<number>(0);
  const fadingOutRef = useRef(false);

  const fadeTo = useCallback((target: number, duration: number) => {
    const v = videoRef.current;
    if (!v) return;
    cancelAnimationFrame(rafRef.current);
    const start = performance.now();
    const from  = parseFloat(v.style.opacity) || 0;
    function step(now: number) {
      const t = Math.min((now - start) / duration, 1);
      v!.style.opacity = String(from + (target - from) * t);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.style.opacity = "0";

    function onLoaded() {
      v!.style.opacity = "0";
      v!.play().catch(() => {});
      fadeTo(1, FADE_MS);
    }
    function onTimeUpdate() {
      const rem = v!.duration - v!.currentTime;
      if (!fadingOutRef.current && rem <= FADE_OUT_LEAD && rem > 0) {
        fadingOutRef.current = true;
        fadeTo(0, FADE_MS);
      }
    }
    function onEnded() {
      v!.style.opacity = "0";
      setTimeout(() => {
        v!.currentTime = 0;
        v!.play().catch(() => {});
        fadingOutRef.current = false;
        fadeTo(1, FADE_MS);
      }, 100);
    }

    v.addEventListener("loadeddata",  onLoaded);
    v.addEventListener("timeupdate",  onTimeUpdate);
    v.addEventListener("ended",       onEnded);
    return () => {
      cancelAnimationFrame(rafRef.current);
      v.removeEventListener("loadeddata",  onLoaded);
      v.removeEventListener("timeupdate",  onTimeUpdate);
      v.removeEventListener("ended",       onEnded);
    };
  }, [fadeTo]);

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay muted playsInline preload="auto"
      className={className}
      style={{ opacity: 0, ...style }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════
   BlurText — word-by-word stagger blur-in
════════════════════════════════════════════════════════════════════ */
function BlurText({
  text,
  style,
}: {
  text: string;
  style?: React.CSSProperties;
}) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <p
      ref={ref}
      style={{
        display: "flex", flexWrap: "wrap",
        justifyContent: "flex-start", rowGap: "0.05em",
        margin: 0,
        ...style,
      }}
    >
      {text.split(" ").map((word, i) => (
        <motion.span
          key={i}
          initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
          animate={inView ? {
            filter: ["blur(10px)", "blur(5px)", "blur(0px)"],
            opacity: [0, 0.5, 1],
            y:      [50, -5, 0],
          } : {}}
          transition={{
            duration: 0.7, times: [0, 0.5, 1],
            ease: "easeOut",
            delay: (i * 100) / 1000,
          }}
          style={{ display: "inline-block", marginRight: "0.22em" }}
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Inline icons
════════════════════════════════════════════════════════════════════ */
function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
function MicrosoftIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 21 21">
      <rect x="1"  y="1"  width="9" height="9" fill="#F25022"/>
      <rect x="11" y="1"  width="9" height="9" fill="#7FBA00"/>
      <rect x="1"  y="11" width="9" height="9" fill="#00A4EF"/>
      <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
    </svg>
  );
}
function GitHubIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24">
      <path fill="rgba(255,255,255,0.85)" d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 17.07 3.633 16.7 3.633 16.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Stat card
════════════════════════════════════════════════════════════════════ */
const StatCard = memo(function StatCard({
  value, label,
}: { value: string; label: string }) {
  return (
    <div
      className="liquid-glass"
      style={{ borderRadius: 20, padding: "18px 22px", minWidth: 130 }}
    >
      <div style={{
        fontFamily: "'Instrument Serif', serif",
        fontStyle: "italic",
        fontSize: 34,
        color: "#fff",
        lineHeight: 1,
        letterSpacing: "-1px",
      }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontWeight: 300, marginTop: 6, fontFamily: "'Barlow', sans-serif" }}>
        {label}
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════════
   Glass input
════════════════════════════════════════════════════════════════════ */
const glassInput: React.CSSProperties = {
  width: "100%",
  padding: "13px 18px",
  borderRadius: 14,
  fontSize: 14,
  color: "#fff",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  outline: "none",
  fontFamily: "'Barlow', sans-serif",
  fontWeight: 300,
  boxSizing: "border-box",
  backdropFilter: "blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.06)",
};

/* ═══════════════════════════════════════════════════════════════════
   Main page
════════════════════════════════════════════════════════════════════ */
export default function LoginPage() {
  const navigate    = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mode,    setMode]    = useState<"signin" | "signup">("signin");

  const emailRef    = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const nameRef     = useRef<HTMLInputElement>(null);

  function doLogin() {
    setLoading(true);
    setTimeout(() => { auth.login(); navigate({ to: "/" }); }, 600);
  }

  /* Focus ring for glass inputs */
  function onFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.border = "1px solid rgba(255,255,255,0.28)";
    e.currentTarget.style.boxShadow = "inset 0 1px 1px rgba(255,255,255,0.08), 0 0 0 3px rgba(255,255,255,0.04)";
  }
  function onBlur(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)";
    e.currentTarget.style.boxShadow = "inset 0 1px 1px rgba(255,255,255,0.06)";
  }

  return (
    <div style={{
      display: "flex", height: "100vh", width: "100vw",
      overflow: "hidden", background: "#000",
      fontFamily: "'Barlow', sans-serif",
    }}>

      {/* ══════════════════════════════════════════════════
          LEFT PANEL — cinematic hero
      ═════════════════════════════════════════════════ */}
      <div style={{
        width: "55%",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Background video — 120% w/h, top-anchored */}
        <FadingVideo
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
          style={{
            position: "absolute",
            left: "50%", top: 0,
            transform: "translateX(-50%)",
            width: "120%", height: "120%",
            objectFit: "cover",
            objectPosition: "top",
            zIndex: 0,
          }}
        />

        {/* z-10 content */}
        <div style={{
          position: "relative", zIndex: 10,
          display: "flex", flexDirection: "column",
          height: "100%", padding: "32px 44px",
        }}>

          {/* ── Logo ── */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ display: "flex", alignItems: "center", gap: 12 }}
          >
            <div
              className="liquid-glass"
              style={{
                width: 48, height: 48, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: "italic", fontSize: 24, color: "#fff", lineHeight: 1,
              }}>
                a
              </span>
            </div>
            <span style={{
              fontSize: 15, fontWeight: 600,
              color: "rgba(255,255,255,0.9)", letterSpacing: "-0.3px",
            }}>
              AbsoluteLabs
            </span>
          </motion.div>

          {/* ── Hero content, vertically centred ── */}
          <div style={{
            flex: 1,
            display: "flex", flexDirection: "column",
            justifyContent: "center",
          }}>

            {/* Badge */}
            <motion.div
              initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
              animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: "easeOut", delay: 0.4 }}
              style={{ marginBottom: 24 }}
            >
              <div
                className="liquid-glass"
                style={{
                  borderRadius: 9999,
                  padding: "5px 5px 5px 5px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{
                  background: "#fff", color: "#000",
                  borderRadius: 9999, padding: "2px 10px",
                  fontSize: 10, fontWeight: 700,
                }}>
                  New
                </span>
                <span style={{
                  fontSize: 12, color: "rgba(255,255,255,0.88)",
                  paddingRight: 10, fontFamily: "'Barlow', sans-serif",
                }}>
                  AI-Powered Integration Copilot — Now Live
                </span>
              </div>
            </motion.div>

            {/* Headline — word-by-word blur-in */}
            <BlurText
              text="Enterprise Integration Intelligence"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: "italic",
                fontSize: "clamp(2.6rem, 4.8vw, 4.8rem)",
                color: "#fff",
                lineHeight: 0.88,
                letterSpacing: "-3px",
                marginBottom: 6,
                maxWidth: 580,
              }}
            />
            <BlurText
              text="Platform"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: "italic",
                fontSize: "clamp(2.6rem, 4.8vw, 4.8rem)",
                color: "#fff",
                lineHeight: 0.88,
                letterSpacing: "-3px",
                marginBottom: 24,
              }}
            />

            {/* Subheading */}
            <motion.p
              initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
              animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: "easeOut", delay: 0.85 }}
              style={{
                fontSize: 14, color: "rgba(255,255,255,0.65)",
                fontWeight: 300, lineHeight: 1.65,
                maxWidth: 440, marginBottom: 36,
                fontFamily: "'Barlow', sans-serif",
              }}
            >
              Detect cascading failures across MuleSoft, Salesforce and Azure
              in minutes — not hours. Your AI copilot correlates incidents
              before customers notice.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
              animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: "easeOut", delay: 1.05 }}
              style={{ display: "flex", gap: 14, flexWrap: "wrap" }}
            >
              <StatCard value="8 min"  label="Mean Time to RCA"      />
              <StatCard value="94%"    label="AI Confidence Score"   />
              <StatCard value="25+"    label="Retail Clients Live"    />
            </motion.div>
          </div>

          {/* ── Partner names ── */}
          <motion.div
            initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut", delay: 1.3 }}
            style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 4 }}
          >
            <div
              className="liquid-glass"
              style={{
                borderRadius: 9999, padding: "4px 14px",
                display: "inline-flex", alignSelf: "flex-start",
              }}
            >
              <span style={{
                fontSize: 11, color: "rgba(255,255,255,0.65)",
                fontWeight: 500, fontFamily: "'Barlow', sans-serif",
              }}>
                Trusted by leading retail brands
              </span>
            </div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "baseline" }}>
              {["Mulberry", "Wren", "Fenwick", "Harvey Nichols", "Clarks"].map(name => (
                <span
                  key={name}
                  style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontStyle: "italic",
                    fontSize: 20,
                    color: "rgba(255,255,255,0.8)",
                    letterSpacing: "-0.5px",
                  }}
                >
                  {name}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          RIGHT PANEL — login form
      ═════════════════════════════════════════════════ */}
      <div style={{
        width: "45%",
        background: "rgba(4, 2, 14, 0.97)",
        display: "flex", flexDirection: "column",
        position: "relative", overflow: "hidden",
      }}>

        {/* Decorative orbs — static, no animation */}
        <div style={{
          position: "absolute", top: -120, right: -70,
          width: 420, height: 420, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,124,246,0.11) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -100, left: -50,
          width: 360, height: 360, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(90,60,200,0.09) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />

        <div style={{
          flex: 1,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "40px 52px",
          position: "relative", zIndex: 1,
        }}>
          <motion.div
            initial={{ filter: "blur(10px)", opacity: 0, y: 30 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.55 }}
            style={{ width: "100%", maxWidth: 390 }}
          >

            {/* ── Mode toggle tabs ── */}
            <div
              className="liquid-glass"
              style={{
                borderRadius: 9999,
                padding: 4,
                display: "flex",
                marginBottom: 36,
              }}
            >
              {(["signin", "signup"] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  style={{
                    flex: 1,
                    padding: "9px 0",
                    fontSize: 13,
                    fontWeight: mode === m ? 600 : 400,
                    color: mode === m ? "#fff" : "rgba(255,255,255,0.38)",
                    background: mode === m ? "rgba(255,255,255,0.1)" : "transparent",
                    border: "none",
                    borderRadius: 9999,
                    cursor: "pointer",
                    fontFamily: "'Barlow', sans-serif",
                    transition: "background 0.2s, color 0.2s",
                    boxShadow: mode === m
                      ? "inset 0 1px 1px rgba(255,255,255,0.12)"
                      : "none",
                  }}
                >
                  {m === "signin" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            {/* ── Heading ── */}
            <h1 style={{
              fontFamily: "'Instrument Serif', serif",
              fontStyle: "italic",
              fontSize: 48,
              color: "#fff",
              lineHeight: 0.92,
              letterSpacing: "-2.5px",
              margin: "0 0 10px",
              whiteSpace: "pre-line",
            }}>
              {mode === "signin" ? "Welcome\nback" : "Join\nSynapse"}
            </h1>
            <p style={{
              fontSize: 13, color: "rgba(255,255,255,0.4)",
              marginBottom: 32, fontWeight: 300,
              fontFamily: "'Barlow', sans-serif",
            }}>
              {mode === "signin"
                ? "Sign in to your AbsoluteLabs workspace"
                : "Start delivering smarter with AI"}
            </p>

            {/* ── Inputs ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

              {mode === "signup" && (
                <input
                  ref={nameRef}
                  type="text"
                  placeholder="Full name"
                  autoComplete="off"
                  spellCheck={false}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  style={glassInput}
                />
              )}

              <input
                ref={emailRef}
                type="text"
                placeholder="Email address"
                autoComplete="off"
                spellCheck={false}
                onFocus={onFocus}
                onBlur={onBlur}
                style={glassInput}
              />

              <input
                ref={passwordRef}
                type="text"
                placeholder="Password"
                autoComplete="off"
                spellCheck={false}
                onFocus={onFocus}
                onBlur={onBlur}
                style={{ ...glassInput, WebkitTextSecurity: "disc" as any }}
              />

              {mode === "signin" && (
                <div style={{ textAlign: "right", marginTop: -4 }}>
                  <span style={{
                    fontSize: 12, color: "rgba(255,255,255,0.35)",
                    cursor: "pointer", fontWeight: 400,
                  }}>
                    Forgot password?
                  </span>
                </div>
              )}

              {/* Primary CTA */}
              <button
                type="button"
                disabled={loading}
                onClick={doLogin}
                className="liquid-glass-strong"
                style={{
                  marginTop: 8,
                  width: "100%",
                  padding: "14px 20px",
                  borderRadius: 9999,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#fff",
                  background: "transparent",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "'Barlow', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                    {mode === "signin" ? "Signing in…" : "Creating account…"}
                  </>
                ) : (
                  <>
                    {mode === "signin" ? "Sign In" : "Create Account"}
                    <ArrowRightIcon />
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "24px 0" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
              <span style={{
                fontSize: 11, color: "rgba(255,255,255,0.28)",
                fontWeight: 400, fontFamily: "'Barlow', sans-serif",
              }}>
                or continue with
              </span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
            </div>

            {/* Social buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { label: "Google",    icon: <GoogleIcon /> },
                { label: "Microsoft", icon: <MicrosoftIcon /> },
                { label: "GitHub",    icon: <GitHubIcon /> },
              ].map(({ label, icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={doLogin}
                  className="liquid-glass"
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    padding: "11px 10px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.8)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'Barlow', sans-serif",
                  }}
                >
                  {icon}
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <p style={{
              textAlign: "center",
              fontSize: 11,
              color: "rgba(255,255,255,0.22)",
              marginTop: 28,
              lineHeight: 1.6,
              fontFamily: "'Barlow', sans-serif",
            }}>
              By continuing, you agree to our{" "}
              <span style={{ color: "rgba(255,255,255,0.45)", cursor: "pointer" }}>Terms of Service</span>{" "}&amp;{" "}
              <span style={{ color: "rgba(255,255,255,0.45)", cursor: "pointer" }}>Privacy Policy</span>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Spin keyframe for loading icon */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.28); }
        input { color-scheme: dark; }
      `}</style>
    </div>
  );
}
