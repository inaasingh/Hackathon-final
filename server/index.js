require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const app     = express();

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
  if (!zohoCredentialsSet) {
    console.log("   ⚠️  Credentials not configured — mock data will be served");
  } else {
    console.log("   ✅  Live Zoho Desk connection active");
  }
});
