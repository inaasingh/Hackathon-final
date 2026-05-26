/**
 * mockIntegrationData.ts
 * Realistic mock data for all integrations — structured to match
 * the real company report format (CloudHub/MuleSoft, Jira, Salesforce, Zoho).
 */

// ── MuleSoft CloudHub — API Registry ─────────────────────────────────────────
export const MULESOFT_APIS = [
  { api: "p-orders-mb-api",        workerSize: "Small",  workers: 2, status: "Started", runtime: "4.6.21" },
  { api: "p-inventory-mb-api",     workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
  { api: "p-fulfillment-mb-api",   workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
  { api: "p-shipment-mb-api",      workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
  { api: "p-returns-mb-api",       workerSize: "Small",  workers: 1, status: "Started", runtime: "4.4.0"  },
  { api: "p-refund-mb-api",        workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
  { api: "p-customersync-mb-api",  workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
  { api: "p-product-mb-api",       workerSize: "Medium", workers: 2, status: "Started", runtime: "4.6.21" },
  { api: "p-notification-mb-api",  workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
  { api: "p-receipt-mb-api",       workerSize: "Small",  workers: 1, status: "Started", runtime: "4.4.0"  },
  { api: "p-stock-mb-api",         workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
  { api: "p-sales-mb-api",         workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
  { api: "s-salesforce-mb-api",    workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
  { api: "s-sfsc-customer-mb-api", workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
  { api: "s-sfsc-order-mb-api",    workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
  { api: "e-sfsc-mb-events",       workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
  { api: "s-adyen-mb-api",         workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
  { api: "e-adyen-mb-api",         workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
  { api: "s-oms-mb-api",           workerSize: "Medium", workers: 2, status: "Started", runtime: "4.6.21" },
  { api: "s-scheduler-mb-api",     workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
  { api: "s-gcp-ods-mb-api",       workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
  { api: "s-epos-mb-api",          workerSize: "Small",  workers: 1, status: "Started", runtime: "4.4.0"  },
  { api: "s-audit-mb-api",         workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
  { api: "s-hybris-mb-api",        workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
  { api: "s-sql-ods-mb-api",       workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
  { api: "s-mule-support-mb-api",  workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
  { api: "s-manhattan-mb-api",     workerSize: "Small",  workers: 1, status: "Started", runtime: "4.4.0"  },
  { api: "s-partner-mb-api",       workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
  { api: "s-sfmc-mb-api",          workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
  { api: "s-zigzag-mb-api",        workerSize: "Small",  workers: 1, status: "Started", runtime: "4.4.0"  },
];

// ── MuleSoft CloudHub — Scheduler Registry ───────────────────────────────────
export const MULESOFT_SCHEDULERS = [
  { no: 1,  scheduler: "MB-005-ORDERS-HYBRID-OMS-Flow_Scheduler",  api: "s-scheduler-mb-api",  description: "Polls hybrid OMS for new orders and pushes to fulfilment",      scheduleTime: "Every 5 mins",  frequency: "Polling",  expectedBehaviour: "Runs continuously, processes pending orders",  status: "Enabled"  },
  { no: 2,  scheduler: "MB-006-LOCATIONMAPPING-REFRESH",            api: "s-scheduler-mb-api",  description: "Refreshes store location mapping table from GCP lookup",        scheduleTime: "01:00 AM",      frequency: "Daily",    expectedBehaviour: "Completes within 5 mins, refreshes cache",    status: "Enabled"  },
  { no: 3,  scheduler: "MB-019-GCP-ORDERS-DAILY-SYNC",             api: "s-gcp-ods-mb-api",    description: "Daily sync of order data from OMS to GCP data warehouse",       scheduleTime: "02:30 AM",      frequency: "Daily",    expectedBehaviour: "Exports full order dataset to GCP",           status: "Enabled"  },
  { no: 4,  scheduler: "MB-026-SHIPMENT-OMNI-SCHEDULER",           api: "s-oms-mb-api",        description: "Sends shipment updates to OMNI5 channel from OMS",             scheduleTime: "Every 15 mins", frequency: "Polling",  expectedBehaviour: "Dispatches shipment events to omnichannel",    status: "Enabled"  },
  { no: 5,  scheduler: "MB-040-PRIMA-MANHATTAN-SYNC",              api: "s-manhattan-mb-api",  description: "Syncs product/stock data between Prima ERP and Manhattan WMS",  scheduleTime: "Every 30 mins", frequency: "Polling",  expectedBehaviour: "Bidirectional stock reconciliation",           status: "Enabled"  },
  { no: 6,  scheduler: "MB-044-PRIMA-PRODUCT-REFRESH",             api: "p-product-mb-api",    description: "Refreshes product master data from Prima into platform",        scheduleTime: "03:00 AM",      frequency: "Daily",    expectedBehaviour: "Full product catalogue sync",                  status: "Enabled"  },
  { no: 7,  scheduler: "MB-061-ZIGZAG-RETURNS-SCHEDULER",          api: "s-zigzag-mb-api",     description: "Processes return authorisations from Zigzag into OMS",         scheduleTime: "Every 10 mins", frequency: "Polling",  expectedBehaviour: "Picks up new returns and creates OMS records", status: "Enabled"  },
  { no: 8,  scheduler: "MB-065-NUORDER-SALES-SCHEDULER",           api: "s-partner-mb-api",    description: "Exports wholesale sales data to NuOrder portal",               scheduleTime: "Every 1 hour",  frequency: "Hourly",   expectedBehaviour: "Sends daily sales summary to NuOrder",         status: "Enabled"  },
  { no: 9,  scheduler: "MB-066-EOD-TULIP-PRIMA",                   api: "s-epos-mb-api",       description: "End-of-day EPOS reconciliation between Tulip and Prima ERP",   scheduleTime: "12:00–12:59 AM",frequency: "Every 15m",expectedBehaviour: "Reconciles daily till transactions",           status: "Enabled"  },
  { no: 10, scheduler: "MB-071-ASN-PRIMA-HARRODS",                 api: "s-partner-mb-api",    description: "Sends Advance Ship Notices from Prima to Harrods portal",      scheduleTime: "07:30 PM",      frequency: "Daily",    expectedBehaviour: "Dispatches ASN for all Harrods bound stock",   status: "Enabled"  },
  { no: 11, scheduler: "MB-072-HARRODS-ASN-CONFIRMATION",          api: "s-partner-mb-api",    description: "Polls Harrods for ASN delivery confirmations",                  scheduleTime: "Every 2 hours", frequency: "Polling",  expectedBehaviour: "Updates OMS with confirmed deliveries",        status: "Enabled"  },
  { no: 12, scheduler: "OMNIX-CUBISCANSYNC-SCHEDULER",             api: "s-oms-mb-api",        description: "Syncs Cubiscan dimensioning data to OMNIX WMS",                scheduleTime: "Every 30 mins", frequency: "Polling",  expectedBehaviour: "Uploads parcel dimensions for carrier booking", status: "Enabled"  },
  { no: 13, scheduler: "NORDSTROM-PARTNERSALES-FLOW",              api: "s-partner-mb-api",    description: "Daily Nordstrom wholesale sales export",                        scheduleTime: "06:00 AM",      frequency: "Daily",    expectedBehaviour: "Exports prior day sales for Nordstrom account", status: "Enabled" },
  { no: 14, scheduler: "MB-RECOVERABLE-ORDERS-RETRY",              api: "s-scheduler-mb-api",  description: "Retries recoverable failed orders from dead-letter queue",      scheduleTime: "Every 10 mins", frequency: "Polling",  expectedBehaviour: "Picks up and replays failed order events",     status: "Enabled"  },
  { no: 15, scheduler: "MB-SALESFORCE-CUSTOMER-REFRESH",           api: "s-salesforce-mb-api", description: "Syncs updated customer profiles from SFSC to OMS",             scheduleTime: "Every 1 hour",  frequency: "Hourly",   expectedBehaviour: "Delta sync of changed customer records",       status: "Disabled" },
];

// ── MuleSoft CloudHub — Major Alerts (this week) ─────────────────────────────
export const MULESOFT_ALERTS = [
  {
    api:     "p-orders-mb-api",
    alerts:  "~47 alerts",
    reason:  "Payment type 'Complete Sale' returning null from GCP lookup table. Orders failing at MB19.1 – TechError: Null Data GCP Lookup. Downstream Aptos publish blocked for affected orders.",
  },
  {
    api:     "s-salesforce-mb-api",
    alerts:  "~12 alerts",
    reason:  "Customer first name + last name exceeds 20-character Salesforce field limit. Orders failing SFSC import. Affected records manually reprocessed by support team.",
  },
  {
    api:     "s-epos-mb-api",
    alerts:  "~8 alerts",
    reason:  "Tulip EPOS orders failing with NULL GCP store lookup. Incorrect store location returned due to FromStoreID priority logic in Mule transform. Fix pending architecture review.",
  },
  {
    api:     "s-gcp-ods-mb-api",
    alerts:  "~3 alerts",
    reason:  "GCP daily sales sync job stuck on 1st of month — missing sales data for 24-hour window. Job restarted manually at 09:00. Root cause: GCP scheduler timeout on month-boundary partition.",
  },
  {
    api:     "p-fulfillment-mb-api",
    alerts:  "~5 alerts",
    reason:  "Fulfilment files not received from Aptos for 6 orders post-migration window. Aptos confirmed files sent — Mule SFTP pick-up schedule mismatch suspected. Under investigation.",
  },
];

// ── MuleSoft — Connector Versions ────────────────────────────────────────────
export const CONNECTOR_VERSIONS = [
  { api: "p-orders-mb-api",        sftp: "3.1.4", ftp: "1.5.0", anypointMq: "1.1.0", http: "3.1.3", salesforce: "10.10.4", cloudhub: "1.7.3" },
  { api: "p-inventory-mb-api",     sftp: "3.1.4", ftp: "1.5.0", anypointMq: "1.1.0", http: "3.1.3", salesforce: "-",       cloudhub: "1.7.3" },
  { api: "p-fulfillment-mb-api",   sftp: "3.1.7", ftp: "1.5.1", anypointMq: "1.1.0", http: "3.1.3", salesforce: "-",       cloudhub: "1.7.3" },
  { api: "s-salesforce-mb-api",    sftp: "3.1.4", ftp: "-",     anypointMq: "1.1.0", http: "3.1.3", salesforce: "10.10.4", cloudhub: "1.7.3" },
  { api: "s-sfsc-customer-mb-api", sftp: "3.1.4", ftp: "-",     anypointMq: "1.1.0", http: "3.1.3", salesforce: "10.10.4", cloudhub: "1.7.3" },
  { api: "s-sfsc-order-mb-api",    sftp: "3.1.4", ftp: "-",     anypointMq: "1.1.0", http: "3.1.3", salesforce: "10.10.4", cloudhub: "1.7.3" },
  { api: "s-adyen-mb-api",         sftp: "3.1.4", ftp: "1.5.0", anypointMq: "-",     http: "3.1.7", salesforce: "-",       cloudhub: "1.7.3" },
  { api: "s-oms-mb-api",           sftp: "3.1.7", ftp: "1.5.1", anypointMq: "1.3.4", http: "3.1.7", salesforce: "-",       cloudhub: "1.7.3" },
  { api: "s-gcp-ods-mb-api",       sftp: "3.1.4", ftp: "1.5.0", anypointMq: "-",     http: "3.1.7", salesforce: "-",       cloudhub: "1.7.3" },
  { api: "s-manhattan-mb-api",     sftp: "3.1.4", ftp: "1.5.0", anypointMq: "1.1.0", http: "3.1.3", salesforce: "-",       cloudhub: "1.7.3" },
];

// ── Weekly Highlights / Lowlights ─────────────────────────────────────────────
export const WEEKLY_HIGHLIGHTS = {
  period: (() => {
    const now = new Date();
    const mon = new Date(now); mon.setDate(now.getDate() - now.getDay() + 1);
    const fri = new Date(mon); fri.setDate(mon.getDate() + 4);
    const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
    return `${fmt(mon)} to ${fmt(fri)}`;
  })(),
  highlights: [
    "All 30 CloudHub APIs maintained 'Started' status throughout the week with no unplanned downtime.",
    "Order API p95 latency returned to within SLA (< 800ms) following retry policy rollback on Wednesday.",
    "Zigzag returns integration processed 143 return authorisations with zero failures.",
    "MB-065 EOD Tulip-Prima reconciliation completed successfully every night of the week.",
    "Salesforce customer sync backlog cleared — 1,240 pending records processed within 2 hours.",
  ].join("\n"),
  lowlights: [
    "GCP daily sales job stuck on Monday morning — 24-hour data gap before manual restart at 09:00.",
    "Salesforce import failures (~12 alerts) due to name field length limit — orders required manual reprocessing.",
    "Fulfilment files from Aptos not received for 6 orders — root cause under investigation (SFTP schedule mismatch suspected).",
    "MB-SALESFORCE-CUSTOMER-REFRESH scheduler disabled following staging test — not yet re-enabled in production.",
  ].join("\n"),
  escalations: [
    "GCP store location lookup incorrect for EPOS orders — Mule transform applies FromStoreID incorrectly. Architecture review scheduled for next sprint.",
    "Aptos fulfilment file SFTP pick-up mismatch — joint investigation with Aptos support team ongoing.",
  ].join("\n"),
  reprocessed: "All 12 Salesforce import failures manually reprocessed. 6 Aptos fulfilment orders held pending SFTP investigation.",
};

// ── Daily Preliminary Check ───────────────────────────────────────────────────
export const PRELIMINARY_CHECK = [
  {
    no: 1, category: "CloudHub",
    task: "Is CloudHub up and running?",
    mon: "Yes", tue: "Yes", wed: "Yes", thu: "Yes", fri: "Yes",
    comments: "All environments healthy throughout the week.",
  },
  {
    no: 2, category: "CloudHub",
    task: "Are all integrations deployed and running?",
    mon: "Yes", tue: "Yes", wed: "Yes", thu: "Yes", fri: "Yes",
    comments: "30/30 APIs in Started state. MB-SALESFORCE-CUSTOMER-REFRESH disabled (known).",
  },
  {
    no: 3, category: "CloudHub",
    task: "Are alerts getting raised in CloudHub and emails being sent properly?",
    mon: "Yes", tue: "Yes", wed: "Yes", thu: "Yes", fri: "Yes",
    comments: "Alert notifications firing correctly to support inbox.",
  },
  {
    no: 4, category: "CloudHub",
    task: "In CloudHub, is the Memory Utilisation less than 80%?",
    mon: "Yes", tue: "Yes", wed: "Yes", thu: "Yes", fri: "Yes",
    comments: "Peak: 71% on p-orders-mb-api (Wednesday peak load).",
  },
  {
    no: 5, category: "CloudHub",
    task: "In CloudHub, CPU utilisation is less than 80%?",
    mon: "Yes", tue: "Yes", wed: "Yes", thu: "Yes", fri: "Yes",
    comments: "Peak: 68% on s-oms-mb-api during order batch processing.",
  },
];

// ── Zoho Desk Tickets ─────────────────────────────────────────────────────────
export const ZOHO_TICKETS = [
  { id: "ZD-4821", subject: "Order API — 504 Gateway Timeout on checkout flow",  status: "Open",     priority: "Urgent", dept: "Platform Engineering", assignee: "Rahul Mehta",   age: "2h ago"  },
  { id: "ZD-4819", subject: "MuleSoft Payment Gateway circuit breaker tripped",   status: "Open",     priority: "High",   dept: "Integration Ops",      assignee: "Priya Sharma",  age: "3h ago"  },
  { id: "ZD-4817", subject: "Salesforce CRM sync latency exceeds 1.2s SLA",       status: "On Hold",  priority: "High",   dept: "CRM Operations",       assignee: "Neha Kulkarni", age: "14h ago" },
  { id: "ZD-4815", subject: "Governance doc auto-generation failed for Q2 deck",  status: "Open",     priority: "Medium", dept: "Governance",            assignee: "Arun Patel",    age: "1d ago"  },
  { id: "ZD-4813", subject: "Inventory Sync missing 3 SKUs post-migration",       status: "Open",     priority: "High",   dept: "Platform Engineering", assignee: "Rahul Mehta",   age: "1d ago"  },
  { id: "ZD-4810", subject: "Pricing Engine returning stale cache for 15 min",    status: "Resolved", priority: "Medium", dept: "Integration Ops",      assignee: "Priya Sharma",  age: "2d ago"  },
  { id: "ZD-4808", subject: "Azure DevOps webhook not triggering on PR merge",    status: "Resolved", priority: "Medium", dept: "Platform Engineering", assignee: "Arun Patel",    age: "2d ago"  },
  { id: "ZD-4805", subject: "Weekly governance report sent to wrong recipients",  status: "Resolved", priority: "Low",    dept: "Governance",            assignee: "Neha Kulkarni", age: "3d ago"  },
  { id: "ZD-4801", subject: "Zoho contract renewal alert missed for 2 vendors",   status: "Resolved", priority: "High",   dept: "Governance",            assignee: "Arun Patel",    age: "4d ago"  },
  { id: "ZD-4796", subject: "HubSpot deal stage not syncing to CRM dashboard",    status: "Open",     priority: "Low",    dept: "CRM Operations",       assignee: "Priya Sharma",  age: "6d ago"  },
];

// ── Jira Tickets ──────────────────────────────────────────────────────────────
export const JIRA_TICKETS = [
  { id: "MULE-2391", summary: "Order API SLA breach — p95 latency 1.8s vs 800ms target", status: "In Progress", priority: "Critical", assignee: "Rahul Mehta",   sprint: "Sprint 47", updated: "2h ago"  },
  { id: "MULE-2389", summary: "Retry policy rollback required on MuleSoft Order API",     status: "Done",        priority: "High",     assignee: "Priya Sharma",  sprint: "Sprint 47", updated: "3h ago"  },
  { id: "MULE-2385", summary: "Jira RETAIL-4821 — retry logic update for OMS timeouts",   status: "In Review",   priority: "Medium",   assignee: "Neha Kulkarni", sprint: "Sprint 47", updated: "1d ago"  },
  { id: "MULE-2380", summary: "Release-147 production deployment — Retail Order API",     status: "Done",        priority: "Medium",   assignee: "Arun Patel",    sprint: "Sprint 47", updated: "1d ago"  },
  { id: "MULE-2376", summary: "Inventory Sync missing SKUs after Aptos migration",        status: "Open",        priority: "High",     assignee: "Rahul Mehta",   sprint: "Sprint 47", updated: "2d ago"  },
  { id: "MULE-2371", summary: "CRM Sync latency optimisation — scale review required",    status: "In Progress", priority: "Medium",   assignee: "Priya Sharma",  sprint: "Sprint 47", updated: "2d ago"  },
  { id: "MULE-2368", summary: "Pricing Engine stale cache — TTL config update",           status: "Done",        priority: "Low",      assignee: "Neha Kulkarni", sprint: "Sprint 46", updated: "3d ago"  },
  { id: "MULE-2362", summary: "Azure DevOps webhook fix for PR merge trigger",            status: "Done",        priority: "Medium",   assignee: "Arun Patel",    sprint: "Sprint 46", updated: "3d ago"  },
];
