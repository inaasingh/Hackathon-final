import { useState } from "react";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 800);
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f5f0eb",
      fontFamily: "system-ui, sans-serif",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 400,
        background: "#ffffff",
        borderRadius: 16,
        padding: "40px 36px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        border: "1px solid #e8e2f0",
      }}>
        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "#7c6ef5",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>A</span>
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#1c1828" }}>AbsoluteLabs</span>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1c1828", margin: "0 0 6px" }}>
          Welcome back
        </h1>
        <p style={{ fontSize: 13, color: "#7a7595", margin: "0 0 28px" }}>
          Sign in to your workspace
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#1c1828" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
              style={{
                padding: "10px 12px",
                border: "1.5px solid #ddd8f0",
                borderRadius: 8,
                fontSize: 14,
                color: "#1c1828",
                outline: "none",
                background: "#fff",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#1c1828" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              style={{
                padding: "10px 12px",
                border: "1.5px solid #ddd8f0",
                borderRadius: 8,
                fontSize: 14,
                color: "#1c1828",
                outline: "none",
                background: "#fff",
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: 12, color: "#e05c5c", margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              padding: "11px",
              background: loading ? "#a89cf5" : "#7c6ef5",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 12, color: "#b0a8c8", marginTop: 20 }}>
          No account?{" "}
          <a href="#" style={{ color: "#7c6ef5", textDecoration: "none" }}>Request access</a>
        </p>
      </div>
    </div>
  );
}
