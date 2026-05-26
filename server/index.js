require("dotenv").config();
const express  = require("express");
const cors     = require("cors");
const fs       = require("fs");
const path     = require("path");
const PptxGenJS = require("pptxgenjs");
const app      = express();

// ── Ticket history store (persists between server restarts) ──────────
const STORE_FILE = path.join(__dirname, "ticketStore.json");

function loadStore() {
  try {
    if (fs.existsSync(STORE_FILE)) return JSON.parse(fs.readFileSync(STORE_FILE, "utf-8"));
  } catch (e) { console.warn("⚠️  Could not read ticketStore.json:", e.message); }
  return { snapshots: [] };
}

function saveTicketSnapshot(tickets, project) {
  const store = loadStore();
  store.snapshots.push({ capturedAt: new Date().toISOString(), project, tickets });
  const cutoff = new Date(Date.now() - 90 * 86_400_000).toISOString();
  store.snapshots = store.snapshots.filter(s => s.capturedAt > cutoff);
  try { fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2)); } catch (e) {}
}

function getTicketsForPeriod(project, days) {
  const store  = loadStore();
  const cutoff = new Date(Date.now() - days * 86_400_000).toISOString();
  const ticketMap = new Map();
  for (const snap of store.snapshots) {
    if (snap.capturedAt < cutoff) continue;
    if (project && snap.project && snap.project !== project) continue;
    for (const t of snap.tickets) ticketMap.set(t.id, t);
  }
  return Array.from(ticketMap.values());
}

app.use(cors());
app.use(express.json());

// In-memory store of events (starts empty, fills as webhooks fire)
let webhookEvents = [];

// ── SIMULATED JIRA WEBHOOK ──
app.post("/webhooks/jira", (req, res) => {
  const event = {
    id: `JIRA-${Math.floor(Math.random() * 9000) + 1000}`,
    sev: "warning",
    source: "Jira",
    svc: req.body.service ?? "Order Management",
    summary: req.body.summary ?? "Ticket updated: Retry logic modified for downstream timeout handling",
    conf: 88,
    ts: "just now",
    docs: ["LLD", "CR", "Runbook"],
    receivedAt: new Date().toISOString(),
  };
  webhookEvents.unshift(event);
  console.log("📥 Jira webhook received:", event.id);
  res.json({ success: true, event });
});

// ── SIMULATED AZURE DEVOPS WEBHOOK ──
app.post("/webhooks/devops", (req, res) => {
  const event = {
    id: `ADO-${Math.floor(Math.random() * 900) + 100}`,
    sev: "success",
    source: "Azure",
    svc: req.body.service ?? "Retail Order API",
    summary: req.body.summary ?? "Deployment completed successfully — Release-" + (Math.floor(Math.random() * 50) + 150),
    conf: 99,
    ts: "just now",
    docs: ["CR", "Governance Report", "Deployment Summary"],
    receivedAt: new Date().toISOString(),
  };
  webhookEvents.unshift(event);
  console.log("📥 Azure DevOps webhook received:", event.id);
  res.json({ success: true, event });
});

// ── SIMULATED MULESOFT WEBHOOK ──
app.post("/webhooks/mulesoft", (req, res) => {
  const event = {
    id: `MULE-${Math.floor(Math.random() * 9000) + 1000}`,
    sev: "critical",
    source: "MuleSoft",
    svc: req.body.service ?? "Payment Gateway Integration",
    summary: req.body.summary ?? "API timeout changed: 5000ms → 8000ms. Circuit breaker threshold updated.",
    conf: 95,
    ts: "just now",
    docs: ["LLD", "Runbook", "Health Report"],
    receivedAt: new Date().toISOString(),
  };
  webhookEvents.unshift(event);
  console.log("📥 MuleSoft webhook received:", event.id);
  res.json({ success: true, event });
});

// ── SIMULATED ZOHO WEBHOOK ──
app.post("/webhooks/zoho", (req, res) => {
  const event = {
    id: `ZOHO-${Math.floor(Math.random() * 900) + 100}`,
    sev: "info",
    source: "Zoho",
    svc: req.body.service ?? "Contract Vault",
    summary: req.body.summary ?? "Governance risk score recalculated — 3 contracts approaching renewal",
    conf: 91,
    ts: "just now",
    docs: ["Governance Report", "Contract Snapshot"],
    receivedAt: new Date().toISOString(),
  };
  webhookEvents.unshift(event);
  console.log("📥 Zoho webhook received:", event.id);
  res.json({ success: true, event });
});

// ── GET ALL EVENTS (frontend polls this) ──
app.get("/events", (req, res) => {
  res.json({ events: webhookEvents });
});

// ── CLEAR EVENTS ──
app.delete("/events", (req, res) => {
  webhookEvents = [];
  res.json({ success: true });
});

// ── HEALTH CHECK ──
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    eventsReceived: webhookEvents.length,
    uptime: process.uptime().toFixed(0) + "s",
    timestamp: new Date().toISOString(),
  });
});

// ── INTEGRATION HEALTH ──
app.get("/health/integrations", (req, res) => {
  res.json({
    services: [
      { name: "Order API",        uptime: "99.42", latency: "1.8s",  err: "2.1%",  sla: "warning"  },
      { name: "Inventory Sync",   uptime: "99.98", latency: "120ms", err: "0.02%", sla: "healthy"  },
      { name: "Pricing Engine",   uptime: "99.91", latency: "210ms", err: "0.1%",  sla: "healthy"  },
      { name: "CRM Sync",         uptime: "98.74", latency: "640ms", err: "1.4%",  sla: "warning"  },
      { name: "MuleSoft Runtime", uptime: "99.99", latency: "45ms",  err: "0.0%",  sla: "healthy"  },
      { name: "Salesforce Conn.", uptime: "97.21", latency: "1.2s",  err: "3.8%",  sla: "critical" },
    ],
  });
});

// ════════════════════════════════════════════════════════════════
// ZOHO DESK INTEGRATION
// ════════════════════════════════════════════════════════════════

const {
  ZOHO_CLIENT_ID,
  ZOHO_CLIENT_SECRET,
  ZOHO_REFRESH_TOKEN,
  ZOHO_ORG_ID,
  ZOHO_REGION = "in",

  // Per-project Zoho department IDs.
  // Get these from Zoho Desk → Setup → Departments → copy the ID from the URL.
  ZOHO_DEPT_MULBERRY,
  ZOHO_DEPT_WOLVERINE,
  ZOHO_DEPT_CLARKS,
  ZOHO_DEPT_HARVEY,
  ZOHO_DEPT_WREN,
  ZOHO_DEPT_BARBOUR,
  ZOHO_DEPT_FOOTASYLUM,
} = process.env;

/**
 * Maps a dashboard project name → Zoho department ID.
 * Populate the env vars above with IDs from your Zoho Desk admin panel.
 */
const PROJECT_DEPT_IDS = {
  "Mulberry Support Team":   ZOHO_DEPT_MULBERRY   || "",
  "Wolverine-Support Team":  ZOHO_DEPT_WOLVERINE  || "",
  "Clarks Support Team":     ZOHO_DEPT_CLARKS     || "",
  "Harvey Nichols":          ZOHO_DEPT_HARVEY     || "",
  "Wren Kitchens":           ZOHO_DEPT_WREN       || "",
  "Barbour Support":         ZOHO_DEPT_BARBOUR    || "",
  "FootAsylum Support Team": ZOHO_DEPT_FOOTASYLUM || "",
};

const ZOHO_AUTH_BASE = `https://accounts.zoho.${ZOHO_REGION}/oauth/v2/token`;
const ZOHO_DESK_BASE = `https://desk.zoho.${ZOHO_REGION}/api/v1`;

const zohoCredentialsSet =
  ZOHO_CLIENT_ID &&
  ZOHO_CLIENT_SECRET &&
  ZOHO_REFRESH_TOKEN &&
  ZOHO_ORG_ID &&
  ZOHO_CLIENT_ID !== "your_client_id_here";

let cachedToken = null;
let tokenExpiry = 0;

async function getZohoAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const params = new URLSearchParams({
    refresh_token: ZOHO_REFRESH_TOKEN,
    client_id:     ZOHO_CLIENT_ID,
    client_secret: ZOHO_CLIENT_SECRET,
    grant_type:    "refresh_token",
  });

  const res  = await fetch(`${ZOHO_AUTH_BASE}?${params}`, { method: "POST" });
  const data = await res.json();

  if (!data.access_token) {
    throw new Error(`Zoho token error: ${JSON.stringify(data)}`);
  }

  cachedToken  = data.access_token;
  tokenExpiry  = Date.now() + (Number(data.expires_in) * 1000) - 30_000;
  console.log("🔑 Zoho access token refreshed");
  return cachedToken;
}

async function zohoGet(path, query = {}) {
  const token = await getZohoAccessToken();
  const qs    = new URLSearchParams(query).toString();
  const url   = `${ZOHO_DESK_BASE}${path}${qs ? "?" + qs : ""}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      orgId:         ZOHO_ORG_ID,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Zoho API ${res.status}: ${text}`);
  }
  return res.json();
}

// ── Mock data (used when credentials are not configured) ──────────
const MOCK_TICKETS = [
  { id: "ZD-4821", subject: "Order API — 504 Gateway Timeout on checkout flow", status: "Open",     priority: "Urgent", department: "Platform Engineering", assignee: "Rahul Mehta",   createdTime: "2026-05-15T06:12:00Z", dueDate: "2026-05-15T18:00:00Z", channel: "Web" },
  { id: "ZD-4819", subject: "MuleSoft Payment Gateway circuit breaker tripped",  status: "Open",     priority: "High",   department: "Integration Ops",      assignee: "Priya Sharma",  createdTime: "2026-05-15T05:44:00Z", dueDate: "2026-05-15T20:00:00Z", channel: "API" },
  { id: "ZD-4817", subject: "Salesforce CRM sync latency exceeds 1.2s SLA",      status: "On Hold",  priority: "High",   department: "CRM Operations",       assignee: "Neha Kulkarni", createdTime: "2026-05-14T14:30:00Z", dueDate: "2026-05-16T09:00:00Z", channel: "Email" },
  { id: "ZD-4815", subject: "Governance doc auto-generation failed for Q2 deck", status: "Open",     priority: "Medium", department: "Governance",            assignee: "Arun Patel",    createdTime: "2026-05-14T11:00:00Z", dueDate: "2026-05-16T12:00:00Z", channel: "Web" },
  { id: "ZD-4813", subject: "Inventory Sync missing 3 SKUs post-migration",      status: "Open",     priority: "High",   department: "Platform Engineering", assignee: "Rahul Mehta",   createdTime: "2026-05-14T09:22:00Z", dueDate: "2026-05-15T23:59:00Z", channel: "Slack" },
  { id: "ZD-4810", subject: "Pricing Engine returning stale cache > 15 min",     status: "Resolved", priority: "Medium", department: "Integration Ops",      assignee: "Priya Sharma",  createdTime: "2026-05-13T16:05:00Z", dueDate: "2026-05-14T16:05:00Z", channel: "Web" },
  { id: "ZD-4808", subject: "Azure DevOps webhook not triggering on PR merge",   status: "Resolved", priority: "Medium", department: "Platform Engineering", assignee: "Arun Patel",    createdTime: "2026-05-13T10:40:00Z", dueDate: "2026-05-14T10:40:00Z", channel: "API" },
  { id: "ZD-4805", subject: "Weekly governance report sent to wrong recipients", status: "Resolved", priority: "Low",    department: "Governance",            assignee: "Neha Kulkarni", createdTime: "2026-05-12T09:00:00Z", dueDate: "2026-05-13T09:00:00Z", channel: "Email" },
  { id: "ZD-4801", subject: "Zoho contract renewal alert missed for 2 vendors",  status: "Resolved", priority: "High",   department: "Governance",            assignee: "Arun Patel",    createdTime: "2026-05-11T14:22:00Z", dueDate: "2026-05-12T14:22:00Z", channel: "Web" },
  { id: "ZD-4799", subject: "Jira webhook payload schema changed — parsing fail","status": "Resolved",priority: "Medium", department: "Integration Ops",      assignee: "Rahul Mehta",   createdTime: "2026-05-10T08:15:00Z", dueDate: "2026-05-11T08:15:00Z", channel: "API" },
  { id: "ZD-4796", subject: "HubSpot deal stage not syncing to CRM dashboard",   status: "Open",     priority: "Low",    department: "CRM Operations",       assignee: "Priya Sharma",  createdTime: "2026-05-09T17:30:00Z", dueDate: "2026-05-17T17:30:00Z", channel: "Web" },
  { id: "ZD-4790", subject: "Monthly exec deck PDF corrupt on mobile devices",   status: "On Hold",  priority: "Low",    department: "Governance",            assignee: "Neha Kulkarni", createdTime: "2026-05-08T13:00:00Z", dueDate: "2026-05-18T13:00:00Z", channel: "Email" },
];

function buildReport(tickets) {
  const total    = tickets.length;
  const open     = tickets.filter(t => t.status === "Open").length;
  const onHold   = tickets.filter(t => t.status === "On Hold").length;
  const resolved = tickets.filter(t => t.status === "Resolved").length;
  const escalated = tickets.filter(t => t.priority === "Urgent").length;

  const byPriority = {
    Urgent: tickets.filter(t => t.priority === "Urgent").length,
    High:   tickets.filter(t => t.priority === "High").length,
    Medium: tickets.filter(t => t.priority === "Medium").length,
    Low:    tickets.filter(t => t.priority === "Low").length,
  };

  const deptMap = {};
  for (const t of tickets) {
    deptMap[t.department] = (deptMap[t.department] || 0) + 1;
  }
  const byDepartment = Object.entries(deptMap).map(([name, count]) => ({ name, count }));
  byDepartment.sort((a, b) => b.count - a.count);

  const overdue = tickets.filter(t =>
    t.status !== "Resolved" && t.dueDate && new Date(t.dueDate) < new Date()
  ).length;

  return {
    total,
    open,
    onHold,
    resolved,
    escalated,
    overdue,
    byPriority,
    byDepartment,
    recent: tickets.slice(0, 10),
  };
}

// ── GET /api/zoho/tickets ─────────────────────────────────────────
// Query params:
//   project  - Dashboard project name (e.g. "Mulberry Support Team")
//   limit    - Max tickets to return (default 50)
//   status   - Filter by status (e.g. "Open")
app.get("/api/zoho/tickets", async (req, res) => {
  const projectName  = req.query.project || "";
  const departmentId = PROJECT_DEPT_IDS[projectName] || "";

  if (!zohoCredentialsSet) {
    console.log(`ℹ️  Zoho credentials not set — returning mock tickets (project: ${projectName || "all"})`);
    // Mock mode: return all mock tickets (frontend will use PROJECT_TICKETS for project-specific data)
    return res.json({ source: "mock", tickets: MOCK_TICKETS, project: projectName });
  }

  try {
    const limit  = req.query.limit  || 50;
    const status = req.query.status || "";
    const query  = { limit };
    if (status)       query.status       = status;
    if (departmentId) query.departmentId = departmentId;

    console.log(`🎫 Fetching Zoho tickets — project: "${projectName}", deptId: "${departmentId || "all"}"`);

    const data    = await zohoGet("/tickets", query);
    const tickets = (data.data || []).map(t => ({
      id:          t.ticketNumber,
      subject:     t.subject,
      status:      t.status,
      priority:    t.priority || "Medium",
      department:  { name: t.department?.name || "General" },
      contact: {
        firstName: t.contact?.firstName || "",
        lastName:  t.contact?.lastName  || "",
        email:     t.contact?.email     || "",
      },
      assignee:    t.assignee?.firstName
                   ? `${t.assignee.firstName} ${t.assignee.lastName || ""}`.trim()
                   : "Unassigned",
      createdTime: t.createdTime,
      modifiedTime: t.modifiedTime || t.createdTime,
      dueDate:     t.dueDate,
      channel:     t.channel || "Web",
      classification: t.classification || "Technical",
      isEscalated: t.isEscalated || false,
      isOverDue:   t.isOverDue   || false,
    }));

    console.log(`✅ Fetched ${tickets.length} Zoho Desk tickets for "${projectName || "all projects"}"`);
    saveTicketSnapshot(tickets, projectName);
    res.json({ source: "zoho", tickets, project: projectName });
  } catch (err) {
    console.error("❌ Zoho tickets error:", err.message);
    res.status(500).json({ error: err.message, source: "error" });
  }
});

// ── GET /api/zoho/report ──────────────────────────────────────────
app.get("/api/zoho/report", async (req, res) => {
  const projectName  = req.query.project || "";
  const departmentId = PROJECT_DEPT_IDS[projectName] || "";

  if (!zohoCredentialsSet) {
    console.log("ℹ️  Zoho credentials not set — returning mock report");
    return res.json({ source: "mock", ...buildReport(MOCK_TICKETS) });
  }

  try {
    const query = { limit: 100 };
    if (departmentId) query.departmentId = departmentId;

    const data    = await zohoGet("/tickets", query);
    const tickets = (data.data || []).map(t => ({
      id:          t.ticketNumber,
      subject:     t.subject,
      status:      t.status,
      priority:    t.priority || "Medium",
      department:  t.department?.name || "General",
      assignee:    t.assignee?.firstName
                   ? `${t.assignee.firstName} ${t.assignee.lastName || ""}`.trim()
                   : "Unassigned",
      createdTime: t.createdTime,
      dueDate:     t.dueDate,
      channel:     t.channel || "Web",
    }));

    console.log(`✅ Built Zoho Desk report from ${tickets.length} tickets`);
    res.json({ source: "zoho", ...buildReport(tickets) });
  } catch (err) {
    console.error("❌ Zoho report error:", err.message);
    res.status(500).json({ error: err.message, source: "error" });
  }
});

// ── GET /api/zoho/status ─────────────────────────────────────────
app.get("/api/zoho/status", (req, res) => {
  res.json({ connected: zohoCredentialsSet });
});

// ── PPT Generation helper ────────────────────────────────────────
function monthLabel(d)  { return d.toLocaleString("en-GB", { month: "long", year: "numeric" }); }
function weekLabel(d)   {
  const start = new Date(d); start.setDate(d.getDate() - 6);
  const fmt = (x) => x.toLocaleDateString("en-GB", { day:"numeric", month:"short" });
  return `${fmt(start)} – ${fmt(d)}`;
}

async function generateGovernancePPT(tickets, periodLabel, project) {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_CUSTOM";
  pptx.defineLayout({ name: "LAYOUT_CUSTOM", width: 13.33, height: 7.5 });
  pptx.layout = "LAYOUT_CUSTOM";

  // Brand colours
  const C = {
    dark:    "191723",
    dark2:   "272437",
    purple:  "C6C1F7",
    soft:    "EAE9FB",
    light:   "F3F2FF",
    pink:    "FE92C9",
    cyan:    "ACEDF3",
    green:   "4EA72E",
    orange:  "FF9B82",
    gray:    "97999A",
    white:   "FFFFFF",
    red:     "E05C5C",
    amber:   "F0A500",
  };

  const total    = tickets.length;
  const open     = tickets.filter(t => ["Open","open"].includes(t.status)).length;
  const onHold   = tickets.filter(t => ["On Hold","on_hold"].includes(t.status)).length;
  const resolved = tickets.filter(t => ["Resolved","Closed","resolved","closed"].includes(t.status)).length;
  const urgent   = tickets.filter(t => t.priority === "Urgent" || t.priority === "P1").length;
  const inProg   = open + onHold;
  const openTix  = tickets.filter(t => !["Resolved","Closed"].includes(t.status));
  const closedTix = tickets.filter(t => ["Resolved","Closed"].includes(t.status));

  // Logo path
  const logoPath = path.join(__dirname, "abl_logo.png");
  const hasLogo  = fs.existsSync(logoPath);

  // ── Footer helper ────────────────────────────────────────────────
  function addFooter(slide, pageNum) {
    slide.addShape("rect", { x:0, y:7.22, w:13.33, h:0.28, fill:{ color: C.dark2 }, line:{ color: C.dark2 } });
    slide.addText(`© 2026 Absolute Retail Consulting LTD. All Rights Reserved.`, {
      x:0.3, y:7.24, w:9, h:0.22, fontSize:7, color: C.gray, fontFace:"Calibri",
    });
    slide.addText(String(pageNum), {
      x:12.8, y:7.24, w:0.4, h:0.22, fontSize:7, color: C.gray, fontFace:"Calibri", align:"right",
    });
  }

  // ── Left purple accent strip (used on interior slides) ──────────
  function addAccentStrip(slide) {
    slide.addShape("rect", { x:0, y:0, w:0.12, h:7.5, fill:{ color: C.purple }, line:{ color: C.purple } });
  }

  // ────────────────────────────────────────────────────────────────
  // SLIDE 1 — Cover
  // ────────────────────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: C.dark };

    // Left dark panel
    s.addShape("rect", { x:0, y:0, w:4.8, h:7.5, fill:{ color: C.dark2 }, line:{ color: C.dark2 } });
    // Purple accent line on left panel edge
    s.addShape("rect", { x:4.72, y:0, w:0.08, h:7.5, fill:{ color: C.purple }, line:{ color: C.purple } });

    // Logo on left panel
    if (hasLogo) {
      s.addImage({ path: logoPath, x:0.4, y:0.4, w:1.8, h:0.7 });
    } else {
      s.addText("AbsoluteLabs", { x:0.4, y:0.4, w:3.6, h:0.7, fontSize:18, bold:true, color:C.white, fontFace:"Calibri" });
    }

    // Main title on right
    s.addText("Monthly Support", { x:5.2, y:1.8, w:7.8, h:0.9, fontSize:36, bold:true, color:C.white, fontFace:"Calibri" });
    s.addText("Governance", { x:5.2, y:2.6, w:7.8, h:0.9, fontSize:36, bold:true, color:C.purple, fontFace:"Calibri" });
    s.addText(periodLabel, { x:5.2, y:3.55, w:7.8, h:0.55, fontSize:20, color:C.soft, fontFace:"Calibri" });
    if (project) {
      s.addText(project, { x:5.2, y:4.15, w:7.8, h:0.4, fontSize:14, color:C.gray, fontFace:"Calibri" });
    }

    // Decorative elements
    s.addShape("rect", { x:5.2, y:3.48, w:1.2, h:0.05, fill:{ color:C.pink }, line:{ color:C.pink } });

    // Footer strip
    s.addShape("rect", { x:0, y:7.22, w:13.33, h:0.28, fill:{ color:C.dark2 }, line:{ color:C.dark2 } });
    s.addText("© 2026 Absolute Retail Consulting LTD. All Rights Reserved.", {
      x:0.3, y:7.24, w:9, h:0.22, fontSize:7, color:C.gray, fontFace:"Calibri",
    });
  }

  // ────────────────────────────────────────────────────────────────
  // SLIDE 2 — Agenda
  // ────────────────────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: C.dark };
    addAccentStrip(s);

    s.addText("Agenda", { x:0.4, y:0.3, w:5, h:0.55, fontSize:28, bold:true, color:C.white, fontFace:"Calibri" });
    s.addText("CONTENTS", { x:0.4, y:0.82, w:3, h:0.3, fontSize:10, color:C.gray, fontFace:"Calibri", charSpacing:3 });
    s.addShape("rect", { x:0.4, y:1.15, w:1.0, h:0.04, fill:{ color:C.purple }, line:{ color:C.purple } });

    const items = [
      "Incident Statistics",
      "MuleSoft — Highlights & Lowlights",
      "Ticket Reviews",
      "In-Progress Issues",
      "Appendices",
    ];
    items.forEach((item, i) => {
      const y = 1.5 + i * 0.75;
      s.addShape("rect", { x:0.4, y:y+0.05, w:0.04, h:0.35, fill:{ color:C.purple }, line:{ color:C.purple } });
      s.addText(`0${i+1}`, { x:0.6, y:y, w:0.6, h:0.45, fontSize:11, bold:true, color:C.purple, fontFace:"Calibri" });
      s.addText(item,      { x:1.3, y:y+0.05, w:8, h:0.35, fontSize:14, color:C.white, fontFace:"Calibri" });
    });

    addFooter(s, 2);
  }

  // ────────────────────────────────────────────────────────────────
  // SLIDE 3 — Incident Statistics
  // ────────────────────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: C.dark };
    addAccentStrip(s);

    s.addText(`Overview of Tickets — ${periodLabel}`, {
      x:0.4, y:0.2, w:12.5, h:0.55, fontSize:22, bold:true, color:C.white, fontFace:"Calibri",
    });
    s.addText("Incident Statistics", {
      x:0.4, y:0.72, w:5, h:0.3, fontSize:11, color:C.purple, fontFace:"Calibri", charSpacing:1,
    });
    s.addShape("rect", { x:0.4, y:1.02, w:1.2, h:0.04, fill:{ color:C.purple }, line:{ color:C.purple } });

    // Stat boxes
    const stats = [
      { label:"Incidents Raised",    val:String(total),    col:C.purple, bg:"1e1a30" },
      { label:"Tickets Resolved",    val:String(resolved), col:C.cyan,   bg:"18252a" },
      { label:"P1/Urgent Issues",    val:String(urgent),   col:C.pink,   bg:"2a1a22" },
      { label:"Tickets In Progress", val:String(inProg),   col:C.orange, bg:"2a211a" },
    ];
    stats.forEach((st, i) => {
      const x = 0.4 + i * 3.15;
      const y = 1.5;
      s.addShape("roundRect", { x, y, w:2.9, h:2.0, fill:{ color:st.bg }, line:{ color:st.col, pt:1 }, rectRadius:0.1 });
      s.addText(st.val, { x, y:y+0.35, w:2.9, h:0.9, fontSize:48, bold:true, color:st.col, fontFace:"Calibri", align:"center" });
      s.addText(st.label, { x, y:y+1.3, w:2.9, h:0.4, fontSize:11, color:C.white, fontFace:"Calibri", align:"center" });
    });

    // Priority breakdown bar
    const pris = [
      { label:"Urgent", count: urgent, col:C.red },
      { label:"High",   count: tickets.filter(t=>t.priority==="High").length,   col:C.orange },
      { label:"Medium", count: tickets.filter(t=>t.priority==="Medium").length, col:C.purple },
      { label:"Low",    count: tickets.filter(t=>t.priority==="Low").length,    col:C.green  },
    ];
    s.addText("Priority Breakdown", { x:0.4, y:3.7, w:6, h:0.35, fontSize:12, bold:true, color:C.white, fontFace:"Calibri" });
    const barTotal = pris.reduce((s,p) => s+p.count, 0) || 1;
    let bx = 0.4;
    pris.forEach(p => {
      const bw = (p.count / barTotal) * 12.5;
      if (bw > 0) {
        s.addShape("rect", { x:bx, y:4.1, w:bw, h:0.35, fill:{ color:p.col }, line:{ color:p.col } });
        if (bw > 0.6) {
          s.addText(`${p.label} (${p.count})`, { x:bx+0.05, y:4.1, w:bw-0.1, h:0.35, fontSize:8, color:C.dark, fontFace:"Calibri", bold:true });
        }
        bx += bw;
      }
    });
    pris.forEach((p,i) => {
      s.addShape("rect", { x:0.4+i*3.1, y:4.6, w:0.18, h:0.18, fill:{ color:p.col }, line:{ color:p.col } });
      s.addText(`${p.label}: ${p.count}`, { x:0.65+i*3.1, y:4.58, w:2.5, h:0.22, fontSize:9, color:C.white, fontFace:"Calibri" });
    });

    addFooter(s, 3);
  }

  // ────────────────────────────────────────────────────────────────
  // SLIDE 4 — MuleSoft Highlights & Lowlights
  // ────────────────────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: C.dark };
    addAccentStrip(s);

    s.addText("MuleSoft — Highlights & Lowlights", {
      x:0.4, y:0.2, w:12.5, h:0.55, fontSize:22, bold:true, color:C.white, fontFace:"Calibri",
    });
    s.addText(`For ${periodLabel}`, { x:0.4, y:0.72, w:5, h:0.3, fontSize:11, color:C.purple, fontFace:"Calibri" });
    s.addShape("rect", { x:0.4, y:1.02, w:1.2, h:0.04, fill:{ color:C.purple }, line:{ color:C.purple } });

    // Derive highlights/lowlights from tickets
    const openErrors  = tickets.filter(t => !["Resolved","Closed"].includes(t.status));
    const closedOnes  = tickets.filter(t =>  ["Resolved","Closed"].includes(t.status));

    const highlightText = closedOnes.length > 0
      ? `${closedOnes.length} ticket${closedOnes.length>1?"s were":"was"} successfully resolved this period. ` +
        closedOnes.slice(0,2).map(t => `#${t.id} (${t.subject?.split(":")[0]?.trim()}).`).join(" ")
      : "No tickets were closed in this period. All alerts are being actively monitored.";

    const lowlightText = openErrors.length > 0
      ? openErrors.slice(0,3).map(t =>
          `${t.subject?.split(":")[0]?.trim() || t.subject} — Status: ${t.status}, Priority: ${t.priority}.`
        ).join(" ")
      : "No open issues in this period.";

    const keyAsksText = openErrors.filter(t => t.priority === "Urgent" || t.priority === "High").length > 0
      ? `${openErrors.filter(t => t.priority==="High"||t.priority==="Urgent").length} high/urgent tickets require attention. ` +
        openErrors.filter(t => t.priority==="High"||t.priority==="Urgent").slice(0,2)
          .map(t => `#${t.id}: ${t.subject?.slice(0,60)}.`).join(" ")
      : "No critical key asks at this time.";

    const sections = [
      { title:"Highlights", text: highlightText, col: C.cyan,   bg:"183028" },
      { title:"Lowlights",  text: lowlightText,  col: C.pink,   bg:"2a1825" },
      { title:"Key Asks",   text: keyAsksText,   col: C.orange, bg:"2a2018" },
    ];
    sections.forEach((sec, i) => {
      const y = 1.3 + i * 1.8;
      s.addShape("roundRect", { x:0.4, y, w:12.5, h:1.6, fill:{ color:sec.bg }, line:{ color:sec.col, pt:0.5 }, rectRadius:0.1 });
      s.addText(sec.title, { x:0.7, y:y+0.15, w:2.5, h:0.35, fontSize:13, bold:true, color:sec.col, fontFace:"Calibri" });
      s.addShape("rect", { x:0.7, y:y+0.5, w:0.04, h:0.85, fill:{ color:sec.col }, line:{ color:sec.col } });
      s.addText(sec.text, { x:0.9, y:y+0.5, w:11.8, h:0.9, fontSize:10, color:C.light, fontFace:"Calibri", valign:"top", wrap:true });
    });

    addFooter(s, 4);
  }

  // ────────────────────────────────────────────────────────────────
  // SLIDE 5 — Ticket Reviews (open/in-progress)
  // ────────────────────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: C.dark };
    addAccentStrip(s);

    s.addText("Ticket Reviews", {
      x:0.4, y:0.2, w:12.5, h:0.55, fontSize:22, bold:true, color:C.white, fontFace:"Calibri",
    });
    s.addText(`Snapshot of Incidents — ${periodLabel}  •  #${total} total`, {
      x:0.4, y:0.72, w:10, h:0.3, fontSize:11, color:C.purple, fontFace:"Calibri",
    });
    s.addShape("rect", { x:0.4, y:1.02, w:1.2, h:0.04, fill:{ color:C.purple }, line:{ color:C.purple } });

    // Table
    const headerRow = [
      { text:"Ticket #",  options:{ bold:true, color:C.dark, fill:{ color:C.purple } } },
      { text:"Subject",   options:{ bold:true, color:C.dark, fill:{ color:C.purple } } },
      { text:"Priority",  options:{ bold:true, color:C.dark, fill:{ color:C.purple } } },
      { text:"Status",    options:{ bold:true, color:C.dark, fill:{ color:C.purple } } },
      { text:"Assignee",  options:{ bold:true, color:C.dark, fill:{ color:C.purple } } },
    ];

    const priColor = { Urgent: C.red, High: C.orange, Medium: C.purple, Low: C.green };
    const statusColor = { Open:"E05C5C", "On Hold":"F0A500", Resolved:"4EA72E", Closed:"52B788" };

    const displayTix = openTix.slice(0, 10);
    const rows = [headerRow, ...displayTix.map(t => [
      { text:`#${t.id}`,           options:{ color:C.cyan,   fontSize:9 } },
      { text: (t.subject||"").slice(0, 68), options:{ color:C.light, fontSize:9 } },
      { text: t.priority||"",      options:{ color: priColor[t.priority]||C.white, fontSize:9, bold:true } },
      { text: t.status||"",        options:{ color: statusColor[t.status]||C.white, fontSize:9 } },
      { text: (t.assignee||t.contact?.firstName||"—").slice(0,22), options:{ color:C.gray, fontSize:9 } },
    ])];

    if (rows.length > 1) {
      s.addTable(rows, {
        x:0.4, y:1.2, w:12.5, h:5.7,
        colW:[1.4, 5.5, 1.2, 1.5, 2.0],
        fontFace:"Calibri",
        border:{ type:"solid", color:"2a2a3a", pt:0.5 },
        rowH: 0.48,
        fill: { color: C.dark2 },
        autoPage: false,
      });
    } else {
      s.addText("No open tickets in this period.", { x:0.4, y:2.5, w:12, h:0.5, fontSize:13, color:C.gray, fontFace:"Calibri", align:"center" });
    }

    addFooter(s, 5);
  }

  // ────────────────────────────────────────────────────────────────
  // SLIDE 6 — In-Progress Issues
  // ────────────────────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: C.dark };
    addAccentStrip(s);

    s.addText("In-Progress Issues & Change Requests", {
      x:0.4, y:0.2, w:12.5, h:0.55, fontSize:22, bold:true, color:C.white, fontFace:"Calibri",
    });
    s.addShape("rect", { x:0.4, y:0.78, w:1.2, h:0.04, fill:{ color:C.purple }, line:{ color:C.purple } });

    const progTix = tickets.filter(t => !["Resolved","Closed"].includes(t.status));

    const hdr = [
      { text:"S.No",       options:{ bold:true, color:C.dark, fill:{ color:C.purple } } },
      { text:"Ticket ID",  options:{ bold:true, color:C.dark, fill:{ color:C.purple } } },
      { text:"Created",    options:{ bold:true, color:C.dark, fill:{ color:C.purple } } },
      { text:"Priority",   options:{ bold:true, color:C.dark, fill:{ color:C.purple } } },
      { text:"Subject",    options:{ bold:true, color:C.dark, fill:{ color:C.purple } } },
      { text:"Summary",    options:{ bold:true, color:C.dark, fill:{ color:C.purple } } },
      { text:"Status",     options:{ bold:true, color:C.dark, fill:{ color:C.purple } } },
    ];
    const priCol = { Urgent: C.red, High: C.orange, Medium: C.purple, Low: C.green };
    const rows = [hdr, ...progTix.slice(0, 7).map((t, i) => {
      const created = t.createdTime
        ? new Date(t.createdTime).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })
        : "—";
      const summary = (t.description || t.subject || "").slice(0, 90);
      return [
        { text: String(i+1),              options:{ color:C.gray,  fontSize:8 } },
        { text:`#${t.id}`,                options:{ color:C.cyan,  fontSize:8, bold:true } },
        { text: created,                  options:{ color:C.light, fontSize:8 } },
        { text: t.priority||"",           options:{ color: priCol[t.priority]||C.white, fontSize:8, bold:true } },
        { text:(t.subject||"").slice(0,50), options:{ color:C.light, fontSize:8 } },
        { text: summary,                  options:{ color:C.gray,  fontSize:7 } },
        { text: t.status||"",             options:{ color:C.purple,fontSize:8 } },
      ];
    })];

    if (rows.length > 1) {
      s.addTable(rows, {
        x:0.4, y:1.0, w:12.5, h:6.0,
        colW:[0.5, 1.0, 1.0, 0.9, 2.6, 4.5, 1.1],
        fontFace:"Calibri",
        border:{ type:"solid", color:"2a2a3a", pt:0.5 },
        rowH: 0.75,
        fill: { color: C.dark2 },
        autoPage: false,
      });
    } else {
      s.addText("No in-progress tickets in this period.", { x:0.4, y:2.5, w:12, h:0.5, fontSize:13, color:C.gray, fontFace:"Calibri", align:"center" });
    }

    addFooter(s, 6);
  }

  // ────────────────────────────────────────────────────────────────
  // SLIDE 7 — Resolved Tickets
  // ────────────────────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: C.dark };
    addAccentStrip(s);

    s.addText("Resolved Tickets", {
      x:0.4, y:0.2, w:12.5, h:0.55, fontSize:22, bold:true, color:C.white, fontFace:"Calibri",
    });
    s.addText(`${closedTix.length} tickets closed this period`, {
      x:0.4, y:0.72, w:6, h:0.3, fontSize:11, color:C.green, fontFace:"Calibri",
    });
    s.addShape("rect", { x:0.4, y:1.02, w:1.2, h:0.04, fill:{ color:C.green }, line:{ color:C.green } });

    const hdr = [
      { text:"Ticket #",  options:{ bold:true, color:C.dark, fill:{ color:"3a5a3a" } } },
      { text:"Subject",   options:{ bold:true, color:C.dark, fill:{ color:"3a5a3a" } } },
      { text:"Priority",  options:{ bold:true, color:C.dark, fill:{ color:"3a5a3a" } } },
      { text:"Resolved By", options:{ bold:true, color:C.dark, fill:{ color:"3a5a3a" } } },
    ];
    const priCol = { Urgent: C.red, High: C.orange, Medium: C.purple, Low: C.green };
    const rows = [hdr, ...closedTix.slice(0,10).map(t => [
      { text:`#${t.id}`,                       options:{ color:C.cyan,  fontSize:9 } },
      { text:(t.subject||"").slice(0,70),       options:{ color:C.light, fontSize:9 } },
      { text: t.priority||"",                  options:{ color: priCol[t.priority]||C.white, fontSize:9 } },
      { text:(t.assignee||t.contact?.firstName||"Shwetha Boga").slice(0,25), options:{ color:C.green, fontSize:9 } },
    ])];

    if (rows.length > 1) {
      s.addTable(rows, {
        x:0.4, y:1.2, w:12.5, h:5.8,
        colW:[1.4, 6.5, 1.5, 2.7],
        fontFace:"Calibri",
        border:{ type:"solid", color:"1e3a1e", pt:0.5 },
        rowH: 0.48,
        fill:{ color:"1a2a1a" },
        autoPage: false,
      });
    } else {
      s.addText("No resolved tickets in this period.", { x:0.4, y:2.5, w:12, h:0.5, fontSize:13, color:C.gray, fontFace:"Calibri", align:"center" });
    }

    addFooter(s, 7);
  }

  // ────────────────────────────────────────────────────────────────
  // SLIDE 8 — Appendices
  // ────────────────────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: C.dark };
    addAccentStrip(s);

    s.addText("Appendices", { x:0.4, y:0.3, w:8, h:0.65, fontSize:28, bold:true, color:C.white, fontFace:"Calibri" });
    s.addShape("rect", { x:0.4, y:1.0, w:1.0, h:0.04, fill:{ color:C.purple }, line:{ color:C.purple } });

    const appendices = [
      "Appendix 1 — Support Subscription",
      "Appendix 2 — Ticket Lifecycle",
      "Appendix 3 — Support Desk Process",
      "Appendix 4 — Severity Levels",
      "Appendix 5 — Escalation Matrix",
    ];
    appendices.forEach((a, i) => {
      s.addText(`${i+1}.  ${a}`, {
        x:0.7, y:1.4+i*0.65, w:10, h:0.45,
        fontSize:13, color:C.light, fontFace:"Calibri",
      });
    });

    s.addText("The support processes have been outlined in accordance with the appendices listed above.",
      { x:0.7, y:5.0, w:10, h:0.6, fontSize:11, color:C.gray, fontFace:"Calibri", italic:true }
    );

    addFooter(s, 8);
  }

  // ────────────────────────────────────────────────────────────────
  // SLIDE 9 — Thank You
  // ────────────────────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    s.background = { color: C.dark };

    s.addShape("rect", { x:0, y:0, w:4.8, h:7.5, fill:{ color:C.dark2 }, line:{ color:C.dark2 } });
    s.addShape("rect", { x:4.72, y:0, w:0.08, h:7.5, fill:{ color:C.purple }, line:{ color:C.purple } });

    if (hasLogo) {
      s.addImage({ path: logoPath, x:0.4, y:0.4, w:1.8, h:0.7 });
    }

    s.addText("Thank you", { x:5.2, y:2.2, w:7.8, h:1.0, fontSize:40, bold:true, color:C.white, fontFace:"Calibri" });
    s.addText("Reach your potential — today.", { x:5.2, y:3.15, w:7.8, h:0.5, fontSize:16, color:C.purple, fontFace:"Calibri", italic:true });
    s.addShape("rect", { x:5.2, y:3.7, w:1.2, h:0.05, fill:{ color:C.pink }, line:{ color:C.pink } });

    s.addText("Our address", { x:0.4, y:5.5, w:4.0, h:0.3, fontSize:10, bold:true, color:C.gray, fontFace:"Calibri" });
    s.addText("77 Fulham Palace Road, The Foundry,\nLondon W6 8AF", { x:0.4, y:5.85, w:4.0, h:0.6, fontSize:10, color:C.light, fontFace:"Calibri" });
    s.addText("Phone & Email", { x:0.4, y:6.5, w:4.0, h:0.3, fontSize:10, bold:true, color:C.gray, fontFace:"Calibri" });
    s.addText("+44 (020) 45424426  ·  contact@absolutelabs.co", { x:0.4, y:6.82, w:4.2, h:0.25, fontSize:9, color:C.light, fontFace:"Calibri" });

    // Footer
    s.addShape("rect", { x:0, y:7.22, w:13.33, h:0.28, fill:{ color:C.dark2 }, line:{ color:C.dark2 } });
    s.addText("© 2026 Absolute Retail Consulting LTD. All Rights Reserved.", {
      x:0.3, y:7.24, w:9, h:0.22, fontSize:7, color:C.gray, fontFace:"Calibri",
    });
  }

  // Write to buffer and return
  return pptx.write({ outputType: "nodebuffer" });
}

// ── POST /api/ppt/weekly  ────────────────────────────────────────
// ── POST /api/ppt/monthly ────────────────────────────────────────
async function handlePptRequest(req, res, days) {
  const project   = req.query.project || req.body?.project || "";
  const now       = new Date();
  const periodLbl = days <= 7 ? `Week of ${weekLabel(now)}` : monthLabel(now);

  try {
    // Try to get stored history first
    let tickets = getTicketsForPeriod(project, days);

    // If no stored history, fetch live from Zoho (or use mock)
    if (tickets.length === 0) {
      if (zohoCredentialsSet) {
        const departmentId = PROJECT_DEPT_IDS[project] || "";
        const query = { limit: 100 };
        if (departmentId) query.departmentId = departmentId;
        const data = await zohoGet("/tickets", query);
        tickets = (data.data || []).map(t => ({
          id:          t.ticketNumber,
          subject:     t.subject,
          status:      t.status,
          priority:    t.priority || "Medium",
          assignee:    t.assignee?.firstName ? `${t.assignee.firstName} ${t.assignee.lastName||""}`.trim() : "Unassigned",
          description: t.description || t.subject,
          createdTime: t.createdTime,
          department:  t.department?.name || "General",
          channel:     t.channel || "Web",
        }));
        saveTicketSnapshot(tickets, project);
      } else {
        // Use mock
        tickets = MOCK_TICKETS.map(t => ({ ...t, assignee: t.assignee || "Support Team" }));
      }
    }

    console.log(`📊 Generating ${days <= 7 ? "weekly" : "monthly"} PPT for "${project||"all"}" — ${tickets.length} tickets`);
    const buffer = await generateGovernancePPT(tickets, periodLbl, project);

    const filename = `AbsoluteLabs-${days<=7?"Weekly":"Monthly"}-Governance-${now.toISOString().slice(0,10)}.pptx`;
    res.set({
      "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "Content-Disposition": `attachment; filename="${filename}"`,
    });
    res.send(buffer);
    console.log(`✅ PPT sent: ${filename}`);
  } catch (err) {
    console.error("❌ PPT generation error:", err.message);
    res.status(500).json({ error: err.message });
  }
}

app.post("/api/ppt/weekly",  (req, res) => handlePptRequest(req, res, 7));
app.post("/api/ppt/monthly", (req, res) => handlePptRequest(req, res, 30));

// ─────────────────────────────────────────────────────────────────

app.listen(3001, () => {
  console.log("🚀 AI Delivery Copilot backend running on http://localhost:3001");
  console.log("📡 Webhook endpoints ready:");
  console.log("   POST /webhooks/jira");
  console.log("   POST /webhooks/devops");
  console.log("   POST /webhooks/mulesoft");
  console.log("   POST /webhooks/zoho");
  console.log("   GET  /events");
  console.log("🎫 Zoho Desk endpoints:");
  console.log("   GET  /api/zoho/tickets");
  console.log("   GET  /api/zoho/report");
  console.log("   GET  /api/zoho/status");
  console.log("📊 Governance PPT endpoints:");
  console.log("   POST /api/ppt/weekly");
  console.log("   POST /api/ppt/monthly");
  if (!zohoCredentialsSet) {
    console.log("   ⚠️  Credentials not configured — mock data will be served");
  } else {
    console.log("   ✅  Live Zoho Desk connection active");
  }
});
