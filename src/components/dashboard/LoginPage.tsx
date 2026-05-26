import { useState, useEffect } from "react";

const CONNECTORS = [
  { name: "Slack",      icon: "💬", color: "#4A154B" },
  { name: "Notion",     icon: "📝", color: "#000000" },
  { name: "Asana",      icon: "🎯", color: "#F06A6A" },
  { name: "HubSpot",    icon: "🔶", color: "#FF7A59" },
  { name: "Linear",     icon: "⚡", color: "#5E6AD2" },
  { name: "Figma",      icon: "🎨", color: "#A259FF" },
  { name: "Box",        icon: "📦", color: "#0061D5" },
  { name: "Atlassian",  icon: "🔷", color: "#0052CC" },
  { name: "Microsoft",  icon: "🪟", color: "#00A4EF" },
  { name: "Intercom",   icon: "💭", color: "#1F8DED" },
  { name: "Canva",      icon: "🖌️", color: "#00C4CC" },
  { name: "Monday",     icon: "📅", color: "#FF3D57" },
];

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`;

function AnimatedCard({
  delay,
  rotate,
  style,
  children,
}: {
  delay: string;
  rotate: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        animation: `floatCard 6s ease-in-out infinite`,
        animationDelay: delay,
        transform: `rotate(${rotate})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [loading, setLoading]           = useState(false);
  const [activeConnector, setActiveConnector] = useState<number | null>(null);
  const [tick, setTick]                 = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((p) => p + 1), 2000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setActiveConnector(tick % CONNECTORS.length);
  }, [tick]);

  const handleLogin = () => {
    if (!email || !password) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1800);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F0E8",
        backgroundImage: GRAIN_SVG,
        backgroundSize: "200px 200px",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Georgia', serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes pulseRing {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0;   }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes connectorPop {
          0%   { transform: scale(1);    }
          50%  { transform: scale(1.15); }
          100% { transform: scale(1);    }
        }
        @keyframes spin {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
        .al-connector:hover {
          transform: scale(1.12) !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
        }
        .al-input {
          outline: none;
          border: 1.5px solid #D4C9B0;
          background: rgba(255,255,255,0.6);
          width: 100%;
          padding: 14px 16px;
          font-size: 15px;
          font-family: 'Georgia', serif;
          border-radius: 10px;
          color: #2C2416;
          transition: all 0.2s;
          box-sizing: border-box;
        }
        .al-input:focus {
          border-color: #7B5EA7;
          background: rgba(255,255,255,0.9);
          box-shadow: 0 0 0 3px rgba(123,94,167,0.12);
        }
        .al-input::placeholder { color: #A89880; }
        .al-btn-primary {
          width: 100%;
          padding: 15px;
          background: #2C2416;
          color: #F5F0E8;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-family: 'Georgia', serif;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: all 0.2s;
        }
        .al-btn-primary:hover:not(:disabled) {
          background: #7B5EA7;
          transform: translateY(-1px);
        }
        .al-btn-primary:disabled { opacity: 0.75; cursor: not-allowed; }
        .al-btn-sso {
          width: 100%;
          margin-top: 14px;
          padding: 13px;
          background: transparent;
          border: 0.5px solid #D4C9B0;
          border-radius: 10px;
          font-size: 14px;
          color: #2C2416;
          cursor: pointer;
          font-family: system-ui, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .al-btn-sso:hover { background: rgba(255,255,255,0.6); }
      `}</style>

      {/* Decorative blobs */}
      <div style={{ position:"absolute", top:-120, right:-80, width:480, height:480, borderRadius:"50%", background:"radial-gradient(circle,rgba(123,94,167,0.18) 0%,transparent 70%)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:-100, left:-60, width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(180,150,100,0.15) 0%,transparent 70%)", pointerEvents:"none" }} />

      {/* Floating preview cards */}
      <AnimatedCard delay="0s" rotate="-4deg" style={{ position:"absolute", top:80, left:40, zIndex:1 }}>
        <div style={{ background:"rgba(255,255,255,0.75)", backdropFilter:"blur(8px)", border:"0.5px solid rgba(255,255,255,0.9)", borderRadius:16, padding:"16px 20px", width:220, boxShadow:"0 8px 32px rgba(0,0,0,0.08)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#E24B4A" }} />
            <span style={{ fontSize:11, color:"#888", letterSpacing:"0.06em", fontFamily:"system-ui" }}>CONTRACT RISK</span>
          </div>
          <div style={{ fontSize:20, fontWeight:600, color:"#2C2416", marginBottom:4 }}>Acme Corp</div>
          <div style={{ fontSize:12, color:"#E24B4A", display:"flex", alignItems:"center", gap:4, fontFamily:"system-ui" }}>
            <span>⚠</span> 18 days remaining
          </div>
        </div>
      </AnimatedCard>

      <AnimatedCard delay="1.5s" rotate="3deg" style={{ position:"absolute", top:200, right:40, zIndex:1 }}>
        <div style={{ background:"rgba(255,255,255,0.75)", backdropFilter:"blur(8px)", border:"0.5px solid rgba(255,255,255,0.9)", borderRadius:16, padding:"16px 20px", width:200, boxShadow:"0 8px 32px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize:11, color:"#888", letterSpacing:"0.06em", marginBottom:10, fontFamily:"system-ui" }}>CONNECTORS ACTIVE</div>
          <div style={{ fontSize:28, fontWeight:600, color:"#7B5EA7" }}>12</div>
          <div style={{ display:"flex", gap:4, marginTop:8 }}>
            {CONNECTORS.slice(0,5).map((c) => (
              <div key={c.name} style={{ width:24, height:24, borderRadius:"50%", background:"#F5F0E8", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>{c.icon}</div>
            ))}
          </div>
        </div>
      </AnimatedCard>

      <AnimatedCard delay="3s" rotate="-2deg" style={{ position:"absolute", bottom:160, left:60, zIndex:1 }}>
        <div style={{ background:"rgba(255,255,255,0.75)", backdropFilter:"blur(8px)", border:"0.5px solid rgba(255,255,255,0.9)", borderRadius:16, padding:"16px 20px", width:190, boxShadow:"0 8px 32px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize:11, color:"#888", letterSpacing:"0.06em", marginBottom:8, fontFamily:"system-ui" }}>AI ASSESSMENT</div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {["Renewal risk","SLA alert","Middleware dep."].map((t,i) => (
              <div key={t} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#2C2416", fontFamily:"system-ui" }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background: i===0 ? "#E24B4A" : "#F0A500", flexShrink:0 }} />
                {t}
              </div>
            ))}
          </div>
        </div>
      </AnimatedCard>

      <AnimatedCard delay="2s" rotate="5deg" style={{ position:"absolute", bottom:120, right:60, zIndex:1 }}>
        <div style={{ background:"rgba(123,94,167,0.12)", backdropFilter:"blur(8px)", border:"0.5px solid rgba(123,94,167,0.3)", borderRadius:16, padding:"16px 20px", width:180, boxShadow:"0 8px 32px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize:11, color:"#7B5EA7", letterSpacing:"0.06em", marginBottom:8, fontFamily:"system-ui" }}>WORKFLOWS</div>
          <div style={{ fontSize:24, fontWeight:600, color:"#2C2416" }}>3 active</div>
          <div style={{ fontSize:12, color:"#7B5EA7", marginTop:4, fontFamily:"system-ui" }}>↑ 2 triggered today</div>
        </div>
      </AnimatedCard>

      {/* Nav */}
      <nav style={{ padding:"24px 48px", display:"flex", justifyContent:"space-between", alignItems:"center", position:"relative", zIndex:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, background:"#2C2416", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ width:16, height:16, border:"2px solid #F5F0E8", borderRadius:3 }} />
          </div>
          <span style={{ fontSize:18, fontWeight:600, color:"#2C2416", letterSpacing:"-0.02em" }}>AbsoluteLabs</span>
        </div>
        <div style={{ display:"flex", gap:32, fontSize:14, color:"#6B5C45" }}>
          {["Product","Integrations","Pricing","About"].map((n) => (
            <a key={n} href="#" style={{ textDecoration:"none", color:"inherit" }}>{n}</a>
          ))}
        </div>
      </nav>

      {/* Main login area */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 24px", position:"relative", zIndex:5 }}>
        <div style={{ width:"100%", maxWidth:440, animation:"slideInUp 0.7s ease both" }}>

          {/* Hero text */}
          <div style={{ textAlign:"center", marginBottom:36 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(123,94,167,0.1)", border:"0.5px solid rgba(123,94,167,0.25)", borderRadius:100, padding:"6px 14px", fontSize:12, color:"#7B5EA7", letterSpacing:"0.05em", marginBottom:20, fontFamily:"system-ui" }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#7B5EA7", animation:"pulseRing 1.5s infinite" }} />
              ENTERPRISE AI PLATFORM
            </div>
            <h1 style={{ fontSize:38, fontWeight:600, color:"#2C2416", margin:"0 0 12px", lineHeight:1.2, letterSpacing:"-0.03em" }}>
              Your workflows,<br />intelligently connected.
            </h1>
            <p style={{ fontSize:15, color:"#6B5C45", lineHeight:1.7, margin:0 }}>
              AbsoluteLabs unifies your enterprise tools into one AI-powered workspace — surfacing risks, automating actions, and keeping your team in flow.
            </p>
          </div>

          {/* Connectors */}
          <div style={{ marginBottom:32 }}>
            <p style={{ fontSize:11, color:"#A89880", textAlign:"center", letterSpacing:"0.08em", marginBottom:14, fontFamily:"system-ui" }}>CONNECTS WITH</p>
            <div style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:10 }}>
              {CONNECTORS.map((c, i) => (
                <div
                  key={c.name}
                  className="al-connector"
                  title={c.name}
                  style={{
                    width:44, height:44, borderRadius:12,
                    background: activeConnector === i ? c.color : "rgba(255,255,255,0.8)",
                    border: `0.5px solid ${activeConnector === i ? "transparent" : "rgba(0,0,0,0.08)"}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:20, cursor:"default",
                    transition:"all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
                    animation: activeConnector === i ? "connectorPop 0.4s ease" : "none",
                    boxShadow: activeConnector === i ? `0 4px 16px ${c.color}44` : "none",
                  }}
                >
                  {c.icon}
                </div>
              ))}
            </div>
          </div>

          {/* Login card */}
          <div style={{ background:"rgba(255,255,255,0.65)", backdropFilter:"blur(20px)", border:"0.5px solid rgba(255,255,255,0.9)", borderRadius:20, padding:"36px", boxShadow:"0 20px 60px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.9) inset" }}>
            <h2 style={{ fontSize:20, fontWeight:600, color:"#2C2416", margin:"0 0 6px", letterSpacing:"-0.02em" }}>Welcome back</h2>
            <p style={{ fontSize:13, color:"#A89880", margin:"0 0 28px", fontFamily:"system-ui" }}>Sign in to your AbsoluteLabs workspace</p>

            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <input
                className="al-input"
                type="email"
                placeholder="Work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="al-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              <div style={{ display:"flex", justifyContent:"flex-end" }}>
                <a href="#" style={{ fontSize:13, color:"#7B5EA7", textDecoration:"none", fontFamily:"system-ui" }}>Forgot password?</a>
              </div>
              <button className="al-btn-primary" onClick={handleLogin} disabled={loading}>
                {loading ? (
                  <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                    <span style={{ width:16, height:16, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.8s linear infinite" }} />
                    Signing in…
                  </span>
                ) : "Sign in →"}
              </button>
            </div>

            <div style={{ marginTop:24, paddingTop:24, borderTop:"0.5px solid rgba(0,0,0,0.07)", display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ flex:1, height:"0.5px", background:"rgba(0,0,0,0.07)" }} />
              <span style={{ fontSize:12, color:"#A89880", fontFamily:"system-ui" }}>OR CONTINUE WITH SSO</span>
              <div style={{ flex:1, height:"0.5px", background:"rgba(0,0,0,0.07)" }} />
            </div>
            <button className="al-btn-sso">🪟 Microsoft SSO</button>
          </div>

          <p style={{ textAlign:"center", marginTop:20, fontSize:12, color:"#A89880", fontFamily:"system-ui" }}>
            Don't have an account?{" "}
            <a href="#" style={{ color:"#7B5EA7", textDecoration:"none" }}>Request access</a>
          </p>
        </div>
      </div>
    </div>
  );
}