import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, RefreshCw, Download, Loader2, CheckCircle2, AlertCircle, Clock, BarChart2, Wifi, WifiOff } from "lucide-react";

interface Stats {
  total: number;
  open: number;
  pending: number;
  resolved: number;
  critical: number;
}

const BACKEND = (import.meta as any).env?.VITE_BACKEND_URL || "http://localhost:3001";

export function ZohoReport() {
  const [open,       setOpen]       = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [testing,    setTesting]    = useState(false);
  const [report,     setReport]     = useState("");
  const [stats,      setStats]      = useState<Stats | null>(null);
  const [usedMock,   setUsedMock]   = useState(false);
  const [connStatus, setConnStatus] = useState<"idle"|"ok"|"fail">("idle");
  const [connMsg,    setConnMsg]    = useState("");
  const [depts,      setDepts]      = useState<string[]>([]);

  async function testConnection() {
    setTesting(true);
    setConnStatus("idle");
    try {
      const r = await fetch(`${BACKEND}/zoho/test`);
      const d = await r.json();
      if (d.ok) {
        setConnStatus("ok");
        setConnMsg(d.message);
        setDepts(d.departments?.map((dep: any) => dep.name) ?? []);
      } else {
        setConnStatus("fail");
        setConnMsg(d.error + (d.missing?.length ? ` — Missing: ${d.missing.join(", ")}` : ""));
      }
    } catch {
      setConnStatus("fail");
      setConnMsg("Backend not reachable — make sure server is running on port 3001");
    }
    setTesting(false);
  }

  async function generateReport() {
    setLoading(true);
    setReport("");
    try {
      const r = await fetch(`${BACKEND}/zoho/report`, { method: "POST" });
      const d = await r.json();
      if (d.report) {
        setReport(d.report);
        setStats(d.stats);
        setUsedMock(d.usedMock ?? false);
        setDepts(prev => d.departments?.length ? d.departments : prev);
      } else {
        setReport("Failed to generate report: " + (d.error ?? "Unknown error"));
      }
    } catch {
      setReport("Could not reach backend. Make sure the server is running:\n  cd server && node index.js");
    }
    setLoading(false);
  }

  function handleExport() {
    const blob = new Blob([report], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `zoho-support-report-${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
  }

  const resolutionRate = stats && stats.total > 0
    ? Math.round((stats.resolved / stats.total) * 100)
    : 0;

  return (
    <>
      {/* ── Trigger button ── */}
      <button
        onClick={() => { setOpen(true); }}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 shadow-md"
        style={{ background: "linear-gradient(135deg,#f0a500,#e07b00)" }}
      >
        <FileText className="h-4 w-4" />
        Zoho Live Report
      </button>

      {/* ── Modal ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
            onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: "var(--card)", border: "1px solid rgba(240,165,0,0.25)" }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-6 py-4 shrink-0"
                style={{ borderBottom: "1px solid rgba(240,165,0,0.12)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(240,165,0,0.15)" }}>
                    <FileText className="h-4 w-4 text-[#f0a500]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Zoho Desk — Live Support Report</h2>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      AI-generated from real ticket data
                    </p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-secondary transition">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">

                {/* ── Step 1: Test Connection ── */}
                <div className="rounded-xl p-4 space-y-3" style={{ background: "var(--background)", border: "1px solid rgba(124,110,245,0.10)" }}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
                      Step 1 — Test Zoho Connection
                    </p>
                    <button
                      onClick={testConnection}
                      disabled={testing}
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition hover:opacity-80"
                      style={{ background: "rgba(124,110,245,0.12)", color: "#9b8ff5", border: "1px solid rgba(124,110,245,0.2)" }}
                    >
                      {testing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wifi className="h-3 w-3" />}
                      {testing ? "Testing…" : "Test Connection"}
                    </button>
                  </div>

                  {connStatus !== "idle" && (
                    <div
                      className="flex items-start gap-2 p-3 rounded-lg text-xs"
                      style={{
                        background: connStatus === "ok" ? "rgba(82,183,136,0.08)" : "rgba(224,92,92,0.08)",
                        border: `1px solid ${connStatus === "ok" ? "rgba(82,183,136,0.25)" : "rgba(224,92,92,0.25)"}`,
                        color: connStatus === "ok" ? "#52b788" : "#e05c5c",
                      }}
                    >
                      {connStatus === "ok"
                        ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        : <AlertCircle  className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
                      <span>{connMsg}</span>
                    </div>
                  )}

                  {connStatus === "fail" && (
                    <div className="text-xs space-y-1 pt-1" style={{ color: "var(--muted-foreground)" }}>
                      <p className="font-semibold">Add these to <code className="px-1 py-0.5 rounded" style={{ background: "var(--muted)" }}>server/.env</code>:</p>
                      <pre className="rounded-lg p-3 text-[10px] leading-5 overflow-x-auto" style={{ background: "var(--muted)" }}>
{`ZOHO_CLIENT_ID=your_client_id
ZOHO_CLIENT_SECRET=your_client_secret
ZOHO_REFRESH_TOKEN=your_refresh_token
ZOHO_ORG_ID=your_org_id
ZOHO_REGION=in`}
                      </pre>
                      <p>See the setup guide below for how to get these ↓</p>
                    </div>
                  )}

                  {depts.length > 0 && connStatus === "ok" && (
                    <div className="flex flex-wrap gap-1.5">
                      {depts.slice(0, 12).map(d => (
                        <span key={d} className="text-[10px] px-2 py-0.5 rounded-md font-medium"
                          style={{ background: "rgba(82,183,136,0.10)", color: "#52b788", border: "1px solid rgba(82,183,136,0.2)" }}>
                          {d}
                        </span>
                      ))}
                      {depts.length > 12 && <span className="text-[10px] text-muted-foreground">+{depts.length - 12} more</span>}
                    </div>
                  )}
                </div>

                {/* ── Step 2: Generate Report ── */}
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
                    Step 2 — Generate AI Report
                  </p>
                  <div className="flex items-center gap-2">
                    {report && (
                      <button onClick={handleExport} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition hover:opacity-80"
                        style={{ background: "rgba(240,165,0,0.12)", color: "#f0a500", border: "1px solid rgba(240,165,0,0.2)" }}>
                        <Download className="h-3 w-3" /> Export
                      </button>
                    )}
                    <button
                      onClick={generateReport}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 text-xs px-4 py-1.5 rounded-lg font-semibold text-white transition hover:opacity-90"
                      style={{ background: loading ? "#aaa" : "linear-gradient(135deg,#f0a500,#e07b00)" }}
                    >
                      {loading
                        ? <><Loader2 className="h-3 w-3 animate-spin" /> Generating…</>
                        : <><BarChart2 className="h-3 w-3" /> {report ? "Regenerate" : "Generate Report"}</>}
                    </button>
                  </div>
                </div>

                {/* ── Stats row ── */}
                {stats && (
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { label: "Total",    val: stats.total,    col: "#9b8ff5", Icon: BarChart2   },
                      { label: "Open",     val: stats.open,     col: "#e05c5c", Icon: AlertCircle },
                      { label: "Pending",  val: stats.pending,  col: "#f0a500", Icon: Clock       },
                      { label: "Resolved", val: stats.resolved, col: "#52b788", Icon: CheckCircle2},
                      { label: "Critical", val: stats.critical, col: "#e05c5c", Icon: AlertCircle },
                    ].map(({ label, val, col, Icon }) => (
                      <div key={label} className="rounded-xl p-3 text-center" style={{ background: `${col}10`, border: `1px solid ${col}25` }}>
                        <p className="text-lg font-bold" style={{ color: col }}>{val}</p>
                        <p className="text-[10px] font-medium mt-0.5" style={{ color: "var(--muted-foreground)" }}>{label}</p>
                      </div>
                    ))}
                  </div>
                )}

                {stats && (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full" style={{ background: "var(--muted)" }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${resolutionRate}%`, background: resolutionRate >= 70 ? "#52b788" : resolutionRate >= 40 ? "#f0a500" : "#e05c5c" }} />
                    </div>
                    <span className="text-xs font-semibold" style={{ color: resolutionRate >= 70 ? "#52b788" : "#f0a500" }}>{resolutionRate}% resolved</span>
                    {usedMock && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"
                        style={{ background: "rgba(240,165,0,0.12)", color: "#f0a500", border: "1px solid rgba(240,165,0,0.2)" }}>
                        <WifiOff className="h-2.5 w-2.5" /> Mock data
                      </span>
                    )}
                    {!usedMock && stats && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"
                        style={{ background: "rgba(82,183,136,0.12)", color: "#52b788", border: "1px solid rgba(82,183,136,0.2)" }}>
                        <Wifi className="h-2.5 w-2.5" /> Live data
                      </span>
                    )}
                  </div>
                )}

                {/* ── Report text ── */}
                {loading && (
                  <div className="flex flex-col items-center justify-center gap-3 py-10 text-muted-foreground">
                    <Loader2 className="h-7 w-7 animate-spin text-[#f0a500]" />
                    <p className="text-xs">Pulling Zoho tickets and generating AI report…</p>
                  </div>
                )}

                {report && !loading && (
                  <div className="rounded-xl border p-5" style={{ background: "var(--background)", borderColor: "rgba(240,165,0,0.15)" }}>
                    <pre className="whitespace-pre-wrap text-xs leading-6 font-sans" style={{ color: "var(--foreground)" }}>
                      {report}
                    </pre>
                  </div>
                )}

                {/* ── Credentials guide (collapsed by default) ── */}
                <CredentialsGuide />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function CredentialsGuide() {
  const [show, setShow] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(124,110,245,0.12)" }}>
      <button
        onClick={() => setShow(s => !s)}
        className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold hover:bg-secondary/40 transition"
        style={{ color: "var(--muted-foreground)" }}
      >
        <span>📖 How to get Zoho credentials (3 mins)</span>
        <span>{show ? "▲" : "▼"}</span>
      </button>
      {show && (
        <div className="px-4 pb-4 space-y-3 text-xs" style={{ color: "var(--foreground)", borderTop: "1px solid rgba(124,110,245,0.08)" }}>
          <div className="pt-3 space-y-2">
            <p className="font-bold text-[#9b8ff5]">Step 1 — Create a Self Client</p>
            <ol className="space-y-1 list-decimal pl-4" style={{ color: "var(--muted-foreground)" }}>
              <li>Go to <strong style={{ color: "var(--foreground)" }}>api-console.zoho.in</strong> (or .com if your org is on .com)</li>
              <li>Click <strong style={{ color: "var(--foreground)" }}>Self Client</strong> → <strong style={{ color: "var(--foreground)" }}>Create Now</strong></li>
              <li>Copy the <strong style={{ color: "var(--foreground)" }}>Client ID</strong> and <strong style={{ color: "var(--foreground)" }}>Client Secret</strong></li>
            </ol>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-[#9b8ff5]">Step 2 — Generate Grant Token</p>
            <ol className="space-y-1 list-decimal pl-4" style={{ color: "var(--muted-foreground)" }}>
              <li>In Self Client → click <strong style={{ color: "var(--foreground)" }}>Generate Code</strong></li>
              <li>Paste this scope exactly:</li>
            </ol>
            <pre className="rounded-lg p-2.5 text-[10px] leading-4 overflow-x-auto my-1"
              style={{ background: "var(--muted)", color: "#52b788" }}>
{`Desk.tickets.READ,Desk.basic.READ,Desk.contacts.READ`}
            </pre>
            <ol start={3} className="space-y-1 list-decimal pl-4" style={{ color: "var(--muted-foreground)" }}>
              <li>Set time duration to <strong style={{ color: "var(--foreground)" }}>10 minutes</strong></li>
              <li>Click <strong style={{ color: "var(--foreground)" }}>Create</strong> — copy the <strong style={{ color: "var(--foreground)" }}>Grant Token</strong> shown</li>
            </ol>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-[#9b8ff5]">Step 3 — Exchange for Refresh Token</p>
            <p style={{ color: "var(--muted-foreground)" }}>Run this in terminal (replace the values):</p>
            <pre className="rounded-lg p-2.5 text-[10px] leading-5 overflow-x-auto"
              style={{ background: "var(--muted)", color: "#52b788" }}>
{`curl -X POST "https://accounts.zoho.in/oauth/v2/token" \\
  -d "code=YOUR_GRANT_TOKEN" \\
  -d "client_id=YOUR_CLIENT_ID" \\
  -d "client_secret=YOUR_CLIENT_SECRET" \\
  -d "redirect_uri=https://www.zoho.com/books/oauth-redirect.html" \\
  -d "grant_type=authorization_code"`}
            </pre>
            <p style={{ color: "var(--muted-foreground)" }}>Copy <strong style={{ color: "var(--foreground)" }}>refresh_token</strong> from the response.</p>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-[#9b8ff5]">Step 4 — Get Org ID</p>
            <ol className="space-y-1 list-decimal pl-4" style={{ color: "var(--muted-foreground)" }}>
              <li>Log in to <strong style={{ color: "var(--foreground)" }}>desk.zoho.in</strong></li>
              <li>Go to <strong style={{ color: "var(--foreground)" }}>Settings → Developer Space → API</strong></li>
              <li>Copy the <strong style={{ color: "var(--foreground)" }}>Org ID</strong> shown at the top</li>
            </ol>
          </div>
          <div className="space-y-2">
            <p className="font-bold text-[#9b8ff5]">Step 5 — Add to .env</p>
            <pre className="rounded-lg p-2.5 text-[10px] leading-5 overflow-x-auto"
              style={{ background: "var(--muted)", color: "#f0a500" }}>
{`# server/.env
ZOHO_REGION=in
ZOHO_CLIENT_ID=1000.xxxxxxxxxxxx
ZOHO_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ZOHO_REFRESH_TOKEN=1000.xxxxxxxx.xxxxxxxx
ZOHO_ORG_ID=123456789`}
            </pre>
            <p style={{ color: "var(--muted-foreground)" }}>Restart the server, then click <strong style={{ color: "var(--foreground)" }}>Test Connection</strong> above.</p>
          </div>
        </div>
      )}
    </div>
  );
}
