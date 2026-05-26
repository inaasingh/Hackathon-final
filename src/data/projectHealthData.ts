/**
 * projectHealthData.ts
 * Per-project health check data for all supported clients.
 * Each entry contains APIs, schedulers, alerts, connector versions,
 * weekly highlights and the daily preliminary check grid.
 */

export type ApiEntry = {
  api: string;
  workerSize: "Small" | "Medium" | "Large";
  workers: number;
  status: "Started" | "Stopped";
  runtime: string;
};

export type SchedulerEntry = {
  no: number;
  scheduler: string;
  api: string;
  description: string;
  scheduleTime: string;
  frequency: string;
  expectedBehaviour: string;
  status: "Enabled" | "Disabled";
};

export type AlertEntry = {
  api: string;
  alerts: string;
  reason: string;
};

export type ConnectorVersionEntry = {
  api: string;
  sftp: string;
  ftp: string;
  anypointMq: string;
  http: string;
  salesforce: string;
  cloudhub: string;
};

export type WeeklyHighlights = {
  period: string;
  highlights: string;
  lowlights: string;
  escalations: string;
  reprocessed: string;
};

export type PreliminaryCheckEntry = {
  no: number;
  category: string;
  task: string;
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  comments: string;
};

export type ProjectHealthData = {
  apis: ApiEntry[];
  schedulers: SchedulerEntry[];
  alerts: AlertEntry[];
  connectorVersions: ConnectorVersionEntry[];
  weeklyHighlights: WeeklyHighlights;
  preliminaryCheck: PreliminaryCheckEntry[];
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. MULBERRY SUPPORT TEAM
// ─────────────────────────────────────────────────────────────────────────────
const mulberryData: ProjectHealthData = {
  apis: [
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
  ],
  schedulers: [
    { no: 1,  scheduler: "MB-005-ORDERS-HYBRID-OMS-Flow_Scheduler",  api: "s-scheduler-mb-api",  description: "Polls hybrid OMS for new orders and pushes to fulfilment",      scheduleTime: "Every 5 mins",   frequency: "Polling",   expectedBehaviour: "Runs continuously, processes pending orders",   status: "Enabled"  },
    { no: 2,  scheduler: "MB-006-LOCATIONMAPPING-REFRESH",            api: "s-scheduler-mb-api",  description: "Refreshes store location mapping table from GCP lookup",        scheduleTime: "01:00 AM",       frequency: "Daily",     expectedBehaviour: "Completes within 5 mins, refreshes cache",     status: "Enabled"  },
    { no: 3,  scheduler: "MB-019-GCP-ORDERS-DAILY-SYNC",             api: "s-gcp-ods-mb-api",    description: "Daily sync of order data from OMS to GCP data warehouse",       scheduleTime: "02:30 AM",       frequency: "Daily",     expectedBehaviour: "Exports full order dataset to GCP",            status: "Enabled"  },
    { no: 4,  scheduler: "MB-026-SHIPMENT-OMNI-SCHEDULER",           api: "s-oms-mb-api",        description: "Sends shipment updates to OMNI5 channel from OMS",             scheduleTime: "Every 15 mins",  frequency: "Polling",   expectedBehaviour: "Dispatches shipment events to omnichannel",    status: "Enabled"  },
    { no: 5,  scheduler: "MB-040-PRIMA-MANHATTAN-SYNC",              api: "s-manhattan-mb-api",  description: "Syncs product/stock data between Prima ERP and Manhattan WMS",  scheduleTime: "Every 30 mins",  frequency: "Polling",   expectedBehaviour: "Bidirectional stock reconciliation",           status: "Enabled"  },
    { no: 6,  scheduler: "MB-044-PRIMA-PRODUCT-REFRESH",             api: "p-product-mb-api",    description: "Refreshes product master data from Prima into platform",        scheduleTime: "03:00 AM",       frequency: "Daily",     expectedBehaviour: "Full product catalogue sync",                  status: "Enabled"  },
    { no: 7,  scheduler: "MB-061-ZIGZAG-RETURNS-SCHEDULER",          api: "s-zigzag-mb-api",     description: "Processes return authorisations from Zigzag into OMS",         scheduleTime: "Every 10 mins",  frequency: "Polling",   expectedBehaviour: "Picks up new returns and creates OMS records", status: "Enabled"  },
    { no: 8,  scheduler: "MB-065-NUORDER-SALES-SCHEDULER",           api: "s-partner-mb-api",    description: "Exports wholesale sales data to NuOrder portal",               scheduleTime: "Every 1 hour",   frequency: "Hourly",    expectedBehaviour: "Sends daily sales summary to NuOrder",         status: "Enabled"  },
    { no: 9,  scheduler: "MB-066-EOD-TULIP-PRIMA",                   api: "s-epos-mb-api",       description: "End-of-day EPOS reconciliation between Tulip and Prima ERP",   scheduleTime: "12:00-12:59 AM", frequency: "Every 15m", expectedBehaviour: "Reconciles daily till transactions",           status: "Enabled"  },
    { no: 10, scheduler: "MB-071-ASN-PRIMA-HARRODS",                 api: "s-partner-mb-api",    description: "Sends Advance Ship Notices from Prima to Harrods portal",      scheduleTime: "07:30 PM",       frequency: "Daily",     expectedBehaviour: "Dispatches ASN for all Harrods bound stock",  status: "Enabled"  },
    { no: 11, scheduler: "MB-072-HARRODS-ASN-CONFIRMATION",          api: "s-partner-mb-api",    description: "Polls Harrods for ASN delivery confirmations",                 scheduleTime: "Every 2 hours",  frequency: "Polling",   expectedBehaviour: "Updates OMS with confirmed deliveries",        status: "Enabled"  },
    { no: 12, scheduler: "OMNIX-CUBISCANSYNC-SCHEDULER",             api: "s-oms-mb-api",        description: "Syncs Cubiscan dimensioning data to OMNIX WMS",               scheduleTime: "Every 30 mins",  frequency: "Polling",   expectedBehaviour: "Uploads parcel dimensions for carrier booking", status: "Enabled" },
    { no: 13, scheduler: "NORDSTROM-PARTNERSALES-FLOW",              api: "s-partner-mb-api",    description: "Daily Nordstrom wholesale sales export",                       scheduleTime: "06:00 AM",       frequency: "Daily",     expectedBehaviour: "Exports prior day sales for Nordstrom account", status: "Enabled" },
    { no: 14, scheduler: "MB-RECOVERABLE-ORDERS-RETRY",              api: "s-scheduler-mb-api",  description: "Retries recoverable failed orders from dead-letter queue",     scheduleTime: "Every 10 mins",  frequency: "Polling",   expectedBehaviour: "Picks up and replays failed order events",     status: "Enabled"  },
    { no: 15, scheduler: "MB-SALESFORCE-CUSTOMER-REFRESH",           api: "s-salesforce-mb-api", description: "Syncs updated customer profiles from SFSC to OMS",            scheduleTime: "Every 1 hour",   frequency: "Hourly",    expectedBehaviour: "Delta sync of changed customer records",       status: "Disabled" },
  ],
  alerts: [
    {
      api:    "p-orders-mb-api",
      alerts: "~47 alerts",
      reason: "Payment type 'Complete Sale' returning null from GCP lookup table. Orders failing at MB19.1 – TechError: Null Data GCP Lookup. Downstream Aptos publish blocked for affected orders.",
    },
    {
      api:    "s-salesforce-mb-api",
      alerts: "~12 alerts",
      reason: "Customer first name + last name exceeds 20-character Salesforce field limit. Orders failing SFSC import. Affected records manually reprocessed by support team.",
    },
    {
      api:    "s-epos-mb-api",
      alerts: "~8 alerts",
      reason: "Tulip EPOS orders failing with NULL GCP store lookup. Incorrect store location returned due to FromStoreID priority logic in Mule transform. Fix pending architecture review.",
    },
    {
      api:    "s-gcp-ods-mb-api",
      alerts: "~3 alerts",
      reason: "GCP daily sales sync job stuck on 1st of month — missing sales data for 24-hour window. Job restarted manually at 09:00. Root cause: GCP scheduler timeout on month-boundary partition.",
    },
    {
      api:    "p-fulfillment-mb-api",
      alerts: "~5 alerts",
      reason: "Fulfilment files not received from Aptos for 6 orders post-migration window. Aptos confirmed files sent — Mule SFTP pick-up schedule mismatch suspected. Under investigation.",
    },
  ],
  connectorVersions: [
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
  ],
  weeklyHighlights: {
    period: "19/05/2026 to 23/05/2026",
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
  },
  preliminaryCheck: [
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
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. CLARKS SUPPORT TEAM
// ─────────────────────────────────────────────────────────────────────────────
const clarksData: ProjectHealthData = {
  apis: [
    { api: "p-orders-cl-api",        workerSize: "Small",  workers: 2, status: "Started", runtime: "4.6.21" },
    { api: "p-inventory-cl-api",     workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
    { api: "p-fulfillment-cl-api",   workerSize: "Small",  workers: 1, status: "Started", runtime: "4.5.9"  },
    { api: "p-returns-cl-api",       workerSize: "Small",  workers: 1, status: "Started", runtime: "4.5.9"  },
    { api: "p-shipment-cl-api",      workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
    { api: "p-product-cl-api",       workerSize: "Medium", workers: 2, status: "Started", runtime: "4.6.21" },
    { api: "s-sap-cl-api",           workerSize: "Medium", workers: 2, status: "Started", runtime: "4.6.21" },
    { api: "s-salesforce-cl-api",    workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
    { api: "s-narvar-cl-api",        workerSize: "Small",  workers: 1, status: "Started", runtime: "4.5.9"  },
    { api: "s-klarna-cl-api",        workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
    { api: "s-agilisys-cl-api",      workerSize: "Small",  workers: 1, status: "Started", runtime: "4.4.0"  },
    { api: "s-scheduler-cl-api",     workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
  ],
  schedulers: [
    { no: 1, scheduler: "CL-001-ORDERS-SAP-SYNC",            api: "s-sap-cl-api",        description: "Polls SAP ERP for confirmed orders and pushes to fulfilment layer",     scheduleTime: "Every 5 mins",  frequency: "Polling",  expectedBehaviour: "Processes all pending SAP order confirmations",    status: "Enabled"  },
    { no: 2, scheduler: "CL-010-SAP-INVENTORY-REFRESH",      api: "s-sap-cl-api",        description: "Refreshes real-time stock levels from SAP into the platform cache",    scheduleTime: "Every 15 mins", frequency: "Polling",  expectedBehaviour: "Stock positions updated across all channels",      status: "Enabled"  },
    { no: 3, scheduler: "CL-022-NARVAR-SHIPMENT-PUSH",       api: "s-narvar-cl-api",     description: "Sends shipment tracking events from SAP to Narvar for customer comms", scheduleTime: "Every 10 mins", frequency: "Polling",  expectedBehaviour: "All despatched orders visible in Narvar within 10m", status: "Enabled" },
    { no: 4, scheduler: "CL-035-AGILISYS-STOCK-SYNC",        api: "s-agilisys-cl-api",   description: "Bidirectional stock sync between SAP and Agilisys WMS",               scheduleTime: "Every 30 mins", frequency: "Polling",  expectedBehaviour: "WMS and ERP stock levels reconciled",             status: "Enabled"  },
    { no: 5, scheduler: "CL-048-PRODUCT-MASTER-REFRESH",     api: "p-product-cl-api",    description: "Nightly full product catalogue sync from SAP to platform",            scheduleTime: "02:00 AM",      frequency: "Daily",    expectedBehaviour: "Full product record set refreshed by 03:30 AM",  status: "Enabled"  },
    { no: 6, scheduler: "CL-055-SALESFORCE-CASE-SYNC",       api: "s-salesforce-cl-api", description: "Syncs Salesforce case updates back to SAP customer records",          scheduleTime: "Every 1 hour",  frequency: "Hourly",   expectedBehaviour: "Delta case data pushed to SAP within the hour",   status: "Enabled"  },
    { no: 7, scheduler: "CL-RECOVERABLE-ORDERS-RETRY",       api: "s-scheduler-cl-api",  description: "Replays recoverable failed orders from dead-letter queue",            scheduleTime: "Every 10 mins", frequency: "Polling",  expectedBehaviour: "Failed order events retried up to 3 times",       status: "Enabled"  },
    { no: 8, scheduler: "CL-KLARNA-SETTLEMENT-DAILY",        api: "s-klarna-cl-api",     description: "Downloads daily Klarna settlement file and reconciles with SAP",      scheduleTime: "06:30 AM",      frequency: "Daily",    expectedBehaviour: "Settlement file imported and matched by 07:00 AM", status: "Disabled" },
  ],
  alerts: [
    {
      api:    "p-orders-cl-api",
      alerts: "~31 alerts",
      reason: "Checkout 500 errors caused by Klarna payment session token expiry before order confirmation. Orders failing at CL12.3 – TokenExpired: Klarna session invalid. Affects approximately 8% of Klarna basket completions. Klarna support engaged.",
    },
    {
      api:    "s-agilisys-cl-api",
      alerts: "~9 alerts",
      reason: "Agilisys WMS returning HTTP 503 during peak despatch window (14:00–16:00). Stock allocation confirmations delayed up to 45 minutes. Agilisys infrastructure team notified.",
    },
    {
      api:    "s-narvar-cl-api",
      alerts: "~4 alerts",
      reason: "Narvar tracking API rejecting shipment events with missing carrier_code field for Royal Mail tracked parcels. Fix deployed to staging — pending production release sign-off.",
    },
    {
      api:    "s-salesforce-cl-api",
      alerts: "~6 alerts",
      reason: "Salesforce case sync job timing out for bulk case updates exceeding 200 records. Batch size reduced to 100 records as interim fix — permanent solution in next sprint.",
    },
  ],
  connectorVersions: [
    { api: "p-orders-cl-api",     sftp: "3.1.4", ftp: "1.5.0", anypointMq: "1.1.0", http: "3.1.3", salesforce: "-",       cloudhub: "1.7.3" },
    { api: "p-fulfillment-cl-api",sftp: "3.1.7", ftp: "1.5.1", anypointMq: "1.1.0", http: "3.1.3", salesforce: "-",       cloudhub: "1.7.3" },
    { api: "p-returns-cl-api",    sftp: "3.1.4", ftp: "1.5.0", anypointMq: "1.1.0", http: "3.1.3", salesforce: "-",       cloudhub: "1.7.3" },
    { api: "s-sap-cl-api",        sftp: "3.1.7", ftp: "1.5.1", anypointMq: "1.3.4", http: "3.1.7", salesforce: "-",       cloudhub: "1.7.3" },
    { api: "s-salesforce-cl-api", sftp: "3.1.4", ftp: "-",     anypointMq: "1.1.0", http: "3.1.3", salesforce: "10.10.4", cloudhub: "1.7.3" },
    { api: "s-narvar-cl-api",     sftp: "3.1.4", ftp: "1.5.0", anypointMq: "-",     http: "3.1.7", salesforce: "-",       cloudhub: "1.7.3" },
    { api: "s-klarna-cl-api",     sftp: "-",     ftp: "-",     anypointMq: "-",     http: "3.1.7", salesforce: "-",       cloudhub: "1.7.3" },
    { api: "s-agilisys-cl-api",   sftp: "3.1.4", ftp: "1.5.0", anypointMq: "1.1.0", http: "3.1.3", salesforce: "-",       cloudhub: "1.7.3" },
  ],
  weeklyHighlights: {
    period: "18/05/2026 to 22/05/2026",
    highlights: [
      "All 12 CloudHub APIs remained in Started state with no unplanned restarts.",
      "CL-022 Narvar shipment push processed 892 tracking events with 99.3% success rate.",
      "SAP inventory refresh scheduler achieving sub-2-minute lag against warehouse movements.",
      "Product master refresh completed within SLA window (< 90 minutes) all 5 nights.",
      "Klarna checkout recovery plan agreed with Klarna support — hotfix targeted for Thursday.",
    ].join("\n"),
    lowlights: [
      "Klarna session token expiry causing ~8% checkout failure rate — 31 alerts raised across the week.",
      "Agilisys WMS 503 errors during peak despatch window on Tuesday and Wednesday, causing allocation delays.",
      "Narvar carrier_code rejection blocking Royal Mail tracked shipments — fix in staging, not yet live.",
      "Klarna daily settlement scheduler disabled pending fix for token refresh flow.",
    ].join("\n"),
    escalations: [
      "Klarna checkout 500 errors escalated to Klarna technical account manager — P1 raised on their side.",
      "Agilisys 503 errors during peak window escalated to Agilisys infrastructure team — capacity review requested.",
    ].join("\n"),
    reprocessed: "31 failed Klarna checkout orders manually reviewed; 18 recovered via alternative payment method, 13 awaiting customer action. 9 Agilisys allocation failures reprocessed after WMS recovery.",
  },
  preliminaryCheck: [
    {
      no: 1, category: "CloudHub",
      task: "Is CloudHub up and running?",
      mon: "Yes", tue: "Yes", wed: "Yes", thu: "Yes", fri: "Yes",
      comments: "Platform stable all week. No infrastructure incidents.",
    },
    {
      no: 2, category: "CloudHub",
      task: "Are all integrations deployed and running?",
      mon: "Yes", tue: "Yes", wed: "Yes", thu: "Yes", fri: "Yes",
      comments: "12/12 APIs in Started state. CL-KLARNA-SETTLEMENT-DAILY scheduler disabled (known — pending fix).",
    },
    {
      no: 3, category: "CloudHub",
      task: "Are alerts getting raised in CloudHub and emails being sent properly?",
      mon: "Yes", tue: "Yes", wed: "Yes", thu: "Yes", fri: "Yes",
      comments: "All alert emails delivered to support inbox. P1 Klarna alert escalated to account manager Wednesday.",
    },
    {
      no: 4, category: "CloudHub",
      task: "In CloudHub, is the Memory Utilisation less than 80%?",
      mon: "Yes", tue: "Yes", wed: "Yes", thu: "Yes", fri: "Yes",
      comments: "Peak 74% on s-sap-cl-api during Tuesday batch run. Within threshold.",
    },
    {
      no: 5, category: "CloudHub",
      task: "In CloudHub, CPU utilisation is less than 80%?",
      mon: "Yes", tue: "Yes", wed: "No",  thu: "Yes", fri: "Yes",
      comments: "Wednesday peak: 84% on p-orders-cl-api during Klarna retry storm. Manually throttled — resolved within 20 minutes.",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. HARVEY NICHOLS
// ─────────────────────────────────────────────────────────────────────────────
const harveyNicholsData: ProjectHealthData = {
  apis: [
    { api: "p-orders-hn-api",       workerSize: "Small",  workers: 2, status: "Started", runtime: "4.6.21" },
    { api: "p-inventory-hn-api",    workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
    { api: "p-fulfillment-hn-api",  workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
    { api: "p-returns-hn-api",      workerSize: "Small",  workers: 1, status: "Started", runtime: "4.5.9"  },
    { api: "p-product-hn-api",      workerSize: "Medium", workers: 2, status: "Started", runtime: "4.6.21" },
    { api: "s-oracle-hn-api",       workerSize: "Medium", workers: 2, status: "Started", runtime: "4.6.21" },
    { api: "s-salesforce-hn-api",   workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
    { api: "s-dhl-hn-api",          workerSize: "Small",  workers: 1, status: "Started", runtime: "4.4.0"  },
    { api: "s-stripe-hn-api",       workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
    { api: "s-merret-hn-api",       workerSize: "Small",  workers: 1, status: "Started", runtime: "4.3.0"  },
  ],
  schedulers: [
    { no: 1, scheduler: "HN-003-ORDERS-ORACLE-SYNC",         api: "s-oracle-hn-api",     description: "Polls Oracle ERP for new order confirmations and pushes to fulfilment", scheduleTime: "Every 5 mins",  frequency: "Polling",  expectedBehaviour: "Order confirmations processed within 5 minutes of Oracle update", status: "Enabled"  },
    { no: 2, scheduler: "HN-015-MERRET-STOCK-SYNC",          api: "s-merret-hn-api",     description: "Syncs stock availability from Merret WMS to platform inventory layer",  scheduleTime: "Every 20 mins", frequency: "Polling",  expectedBehaviour: "Stock positions accurate to within 20 minutes",               status: "Enabled"  },
    { no: 3, scheduler: "HN-028-DHL-SHIPMENT-TRACKER",       api: "s-dhl-hn-api",        description: "Polls DHL for shipment status updates and pushes to order management",  scheduleTime: "Every 15 mins", frequency: "Polling",  expectedBehaviour: "DHL tracking events visible on customer account within 15 mins", status: "Enabled" },
    { no: 4, scheduler: "HN-041-ORACLE-PRODUCT-REFRESH",     api: "p-product-hn-api",    description: "Nightly Oracle product master data refresh into platform",             scheduleTime: "01:30 AM",      frequency: "Daily",    expectedBehaviour: "Full product catalogue refreshed by 03:00 AM",               status: "Enabled"  },
    { no: 5, scheduler: "HN-052-SALESFORCE-LOYALTY-SYNC",    api: "s-salesforce-hn-api", description: "Syncs loyalty point balances from Salesforce to Oracle customer master", scheduleTime: "Every 2 hours", frequency: "Polling",  expectedBehaviour: "Loyalty balances accurate within 2 hours of redemption",      status: "Enabled"  },
    { no: 6, scheduler: "HN-STRIPE-SETTLEMENT-RECON",        api: "s-stripe-hn-api",     description: "Daily Stripe settlement reconciliation against Oracle finance ledger",  scheduleTime: "07:00 AM",      frequency: "Daily",    expectedBehaviour: "Settlement file matched and variance report generated by 08:00", status: "Enabled" },
    { no: 7, scheduler: "HN-RECOVERABLE-ORDERS-RETRY",       api: "s-oracle-hn-api",     description: "Retries Oracle-failed orders from holding queue",                     scheduleTime: "Every 10 mins", frequency: "Polling",  expectedBehaviour: "Recoverable failures retried automatically, up to 3 attempts", status: "Enabled"  },
  ],
  alerts: [
    {
      api:    "s-dhl-hn-api",
      alerts: "~22 alerts",
      reason: "DHL integration timeout errors (HTTP 504) during Tuesday and Wednesday afternoon. DHL carrier API experiencing elevated latency (p95 > 8s vs 2s SLA). 19 shipment tracking updates delayed by up to 2 hours. DHL technical team investigating capacity issue on their gateway.",
    },
    {
      api:    "s-merret-hn-api",
      alerts: "~7 alerts",
      reason: "Merret WMS stock sync returning stale availability for fragrance concession stock. Merret API version mismatch identified (platform using v2.1, WMS upgraded to v2.3). Connector version upgrade scheduled for next maintenance window.",
    },
    {
      api:    "p-orders-hn-api",
      alerts: "~4 alerts",
      reason: "4 orders rejected by Oracle ERP due to invalid department code mapping for new homeware category. Mapping table update deployed on Thursday — affected orders manually reprocessed.",
    },
  ],
  connectorVersions: [
    { api: "p-orders-hn-api",      sftp: "3.1.4", ftp: "1.5.0", anypointMq: "1.1.0", http: "3.1.3", salesforce: "-",       cloudhub: "1.7.3" },
    { api: "p-fulfillment-hn-api", sftp: "3.1.7", ftp: "1.5.1", anypointMq: "1.1.0", http: "3.1.3", salesforce: "-",       cloudhub: "1.7.3" },
    { api: "p-returns-hn-api",     sftp: "3.1.4", ftp: "1.5.0", anypointMq: "1.1.0", http: "3.1.3", salesforce: "-",       cloudhub: "1.7.3" },
    { api: "s-oracle-hn-api",      sftp: "3.1.7", ftp: "1.5.1", anypointMq: "1.3.4", http: "3.1.7", salesforce: "-",       cloudhub: "1.7.3" },
    { api: "s-salesforce-hn-api",  sftp: "3.1.4", ftp: "-",     anypointMq: "1.1.0", http: "3.1.3", salesforce: "10.10.4", cloudhub: "1.7.3" },
    { api: "s-dhl-hn-api",         sftp: "3.1.4", ftp: "1.5.0", anypointMq: "-",     http: "3.1.3", salesforce: "-",       cloudhub: "1.7.3" },
    { api: "s-stripe-hn-api",      sftp: "-",     ftp: "-",     anypointMq: "-",     http: "3.1.7", salesforce: "-",       cloudhub: "1.7.3" },
    { api: "s-merret-hn-api",      sftp: "3.1.4", ftp: "1.5.0", anypointMq: "1.1.0", http: "3.1.3", salesforce: "-",       cloudhub: "1.6.9" },
  ],
  weeklyHighlights: {
    period: "18/05/2026 to 22/05/2026",
    highlights: [
      "All 10 CloudHub APIs remained in Started state throughout the week.",
      "Oracle order sync achieving average 2.1-minute end-to-end processing time, well within 5-minute SLA.",
      "Stripe settlement reconciliation completed successfully every morning with zero variances.",
      "HN-041 Oracle product refresh completed in under 80 minutes nightly, ahead of 90-minute target.",
      "Loyalty sync processed 3,412 point balance updates without errors.",
    ].join("\n"),
    lowlights: [
      "DHL gateway elevated latency on Tuesday and Wednesday caused 22 timeout alerts and delayed tracking updates for 19 shipments.",
      "Merret WMS API version mismatch causing stale fragrance stock data — upgrade pending maintenance window.",
      "4 orders rejected by Oracle due to missing homeware department code mapping — resolved Thursday but required manual reprocessing.",
    ].join("\n"),
    escalations: [
      "DHL carrier API capacity issue escalated to DHL technical account manager — SLA breach notice served for Tuesday window.",
      "Merret connector upgrade requires joint sign-off from Harvey Nichols IT and Merret vendor — approval being sought.",
    ].join("\n"),
    reprocessed: "4 Oracle department code rejections manually corrected and reprocessed Thursday afternoon. 19 delayed DHL tracking events auto-recovered once DHL gateway restored — no customer-facing action required.",
  },
  preliminaryCheck: [
    {
      no: 1, category: "CloudHub",
      task: "Is CloudHub up and running?",
      mon: "Yes", tue: "Yes", wed: "Yes", thu: "Yes", fri: "Yes",
      comments: "CloudHub platform healthy all week. No regional incidents reported.",
    },
    {
      no: 2, category: "CloudHub",
      task: "Are all integrations deployed and running?",
      mon: "Yes", tue: "Yes", wed: "Yes", thu: "Yes", fri: "Yes",
      comments: "10/10 APIs in Started state throughout. No unexpected restarts.",
    },
    {
      no: 3, category: "CloudHub",
      task: "Are alerts getting raised in CloudHub and emails being sent properly?",
      mon: "Yes", tue: "Yes", wed: "Yes", thu: "Yes", fri: "Yes",
      comments: "Alert email delivery confirmed. DHL alerts auto-escalated to P2 queue on Tuesday.",
    },
    {
      no: 4, category: "CloudHub",
      task: "In CloudHub, is the Memory Utilisation less than 80%?",
      mon: "Yes", tue: "Yes", wed: "Yes", thu: "Yes", fri: "Yes",
      comments: "Peak 69% on s-oracle-hn-api during Wednesday batch run.",
    },
    {
      no: 5, category: "CloudHub",
      task: "In CloudHub, CPU utilisation is less than 80%?",
      mon: "Yes", tue: "No",  wed: "No",  thu: "Yes", fri: "Yes",
      comments: "Tuesday 87% and Wednesday 83% on s-dhl-hn-api due to DHL retry storm. Worker scaled temporarily — resolved by Thursday.",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. WREN KITCHENS
// ─────────────────────────────────────────────────────────────────────────────
const wrenKitchensData: ProjectHealthData = {
  apis: [
    { api: "p-orders-wk-api",         workerSize: "Small",  workers: 2, status: "Started", runtime: "4.6.21" },
    { api: "p-product-wk-api",        workerSize: "Medium", workers: 2, status: "Started", runtime: "4.6.21" },
    { api: "p-configurator-wk-api",   workerSize: "Medium", workers: 2, status: "Started", runtime: "4.5.9"  },
    { api: "p-fulfillment-wk-api",    workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
    { api: "s-infor-wk-api",          workerSize: "Medium", workers: 2, status: "Started", runtime: "4.6.21" },
    { api: "s-hubspot-wk-api",        workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
    { api: "s-dpd-wk-api",            workerSize: "Small",  workers: 1, status: "Started", runtime: "4.5.9"  },
    { api: "s-scheduler-wk-api",      workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
  ],
  schedulers: [
    { no: 1, scheduler: "WK-004-ORDERS-INFOR-SYNC",           api: "s-infor-wk-api",     description: "Syncs confirmed design orders from platform to Infor ERP for manufacturing scheduling", scheduleTime: "Every 10 mins", frequency: "Polling",  expectedBehaviour: "Design orders visible in Infor within 10 minutes of customer sign-off", status: "Enabled" },
    { no: 2, scheduler: "WK-012-CONFIGURATOR-PRODUCT-SYNC",   api: "p-configurator-wk-api", description: "Syncs kitchen configurator product and pricing data from Infor to the design tool",  scheduleTime: "Every 1 hour",  frequency: "Hourly",   expectedBehaviour: "Product pricing and availability refreshed hourly in configurator",     status: "Enabled" },
    { no: 3, scheduler: "WK-025-DPD-DELIVERY-TRACKER",        api: "s-dpd-wk-api",        description: "Polls DPD for delivery status of kitchen component shipments",                       scheduleTime: "Every 30 mins", frequency: "Polling",  expectedBehaviour: "Delivery status visible on customer account within 30 minutes",         status: "Enabled" },
    { no: 4, scheduler: "WK-033-HUBSPOT-LEAD-SYNC",           api: "s-hubspot-wk-api",    description: "Syncs new showroom and online leads from HubSpot CRM to Infor customer master",     scheduleTime: "Every 15 mins", frequency: "Polling",  expectedBehaviour: "New CRM leads available in Infor for design consultant assignment",     status: "Enabled" },
    { no: 5, scheduler: "WK-047-INFOR-PRODUCT-REFRESH",       api: "p-product-wk-api",    description: "Nightly product master refresh from Infor into platform product catalogue",         scheduleTime: "02:00 AM",      frequency: "Daily",    expectedBehaviour: "Full catalogue including discontinued lines updated by 03:30 AM",      status: "Enabled" },
    { no: 6, scheduler: "WK-RECOVERABLE-ORDERS-RETRY",        api: "s-scheduler-wk-api",  description: "Retries failed order sync events from Infor dead-letter queue",                    scheduleTime: "Every 10 mins", frequency: "Polling",  expectedBehaviour: "Recoverable failures automatically retried up to 3 times",             status: "Enabled" },
  ],
  alerts: [
    {
      api:    "p-configurator-wk-api",
      alerts: "~18 alerts",
      reason: "Kitchen configurator product sync failing for 'island unit' category after Monday Infor ERP product schema update. New field 'dimensionProfile' not mapped in Mule transform — configurator displaying stale pricing for affected units. Transform fix deployed to staging, awaiting UAT sign-off.",
    },
    {
      api:    "s-infor-wk-api",
      alerts: "~6 alerts",
      reason: "Infor ERP manufacturing schedule API returning 422 validation error for orders with non-standard worktop cut specifications. Infor confirmed schema validation tightened in latest patch. Mapping logic under review.",
    },
    {
      api:    "s-dpd-wk-api",
      alerts: "~3 alerts",
      reason: "DPD delivery tracker returning duplicate tracking events for 3 multi-parcel kitchen orders. Deduplication logic added to staging build — production deployment planned Thursday.",
    },
  ],
  connectorVersions: [
    { api: "p-orders-wk-api",       sftp: "3.1.4", ftp: "1.5.0", anypointMq: "1.1.0", http: "3.1.3", salesforce: "-", cloudhub: "1.7.3" },
    { api: "p-configurator-wk-api", sftp: "-",     ftp: "-",     anypointMq: "1.1.0", http: "3.1.7", salesforce: "-", cloudhub: "1.7.3" },
    { api: "p-fulfillment-wk-api",  sftp: "3.1.7", ftp: "1.5.1", anypointMq: "1.1.0", http: "3.1.3", salesforce: "-", cloudhub: "1.7.3" },
    { api: "s-infor-wk-api",        sftp: "3.1.7", ftp: "1.5.1", anypointMq: "1.3.4", http: "3.1.7", salesforce: "-", cloudhub: "1.7.3" },
    { api: "s-hubspot-wk-api",      sftp: "-",     ftp: "-",     anypointMq: "-",     http: "3.1.7", salesforce: "-", cloudhub: "1.7.3" },
    { api: "s-dpd-wk-api",          sftp: "3.1.4", ftp: "1.5.0", anypointMq: "-",     http: "3.1.7", salesforce: "-", cloudhub: "1.7.3" },
  ],
  weeklyHighlights: {
    period: "18/05/2026 to 22/05/2026",
    highlights: [
      "All 8 CloudHub APIs maintained Started status with no unplanned outages.",
      "WK-033 HubSpot lead sync delivered 247 new showroom leads to Infor with 100% success rate.",
      "DPD delivery tracker processed 1,104 shipment status updates across the week.",
      "WK-047 nightly product refresh completed within SLA window all 5 nights.",
      "Configurator staging fix for island unit pricing validated and ready for UAT on Friday.",
    ].join("\n"),
    lowlights: [
      "Configurator product sync failures for island unit category following Monday Infor schema update — 18 alerts raised.",
      "Infor 422 validation errors for non-standard worktop orders blocking manufacturing schedule creation for 6 orders.",
      "DPD duplicate tracking events affecting 3 multi-parcel orders — deduplication fix in staging.",
    ].join("\n"),
    escalations: [
      "Infor product schema change not communicated ahead of patch deployment — formal change notification process to be reviewed with Wren IT and Infor account team.",
      "Configurator stale pricing for island units: customer-facing risk identified — showroom teams advised to verify pricing manually until fix deployed.",
    ].join("\n"),
    reprocessed: "6 Infor manufacturing schedule failures manually resubmitted after support team applied worktop spec mapping workaround. 18 configurator sync failures pending UAT sign-off on fix before bulk reprocess.",
  },
  preliminaryCheck: [
    {
      no: 1, category: "CloudHub",
      task: "Is CloudHub up and running?",
      mon: "Yes", tue: "Yes", wed: "Yes", thu: "Yes", fri: "Yes",
      comments: "All CloudHub environments healthy. No platform incidents this week.",
    },
    {
      no: 2, category: "CloudHub",
      task: "Are all integrations deployed and running?",
      mon: "Yes", tue: "Yes", wed: "Yes", thu: "Yes", fri: "Yes",
      comments: "8/8 APIs in Started state. p-configurator-wk-api alerting but running — not stopped.",
    },
    {
      no: 3, category: "CloudHub",
      task: "Are alerts getting raised in CloudHub and emails being sent properly?",
      mon: "Yes", tue: "Yes", wed: "Yes", thu: "Yes", fri: "Yes",
      comments: "Alert emails delivered correctly. Monday configurator alerts triggered P2 notification workflow.",
    },
    {
      no: 4, category: "CloudHub",
      task: "In CloudHub, is the Memory Utilisation less than 80%?",
      mon: "Yes", tue: "Yes", wed: "Yes", thu: "Yes", fri: "Yes",
      comments: "Peak 72% on p-configurator-wk-api during Monday retry spike. Stabilised by afternoon.",
    },
    {
      no: 5, category: "CloudHub",
      task: "In CloudHub, CPU utilisation is less than 80%?",
      mon: "No",  tue: "Yes", wed: "Yes", thu: "Yes", fri: "Yes",
      comments: "Monday 88% on p-configurator-wk-api during Infor schema error retry storm. Worker count increased to 3 temporarily — normalised by Tuesday morning.",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. BARBOUR SUPPORT
// ─────────────────────────────────────────────────────────────────────────────
const barbourData: ProjectHealthData = {
  apis: [
    { api: "p-orders-ba-api",       workerSize: "Small",  workers: 2, status: "Started", runtime: "4.6.21" },
    { api: "p-inventory-ba-api",    workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
    { api: "p-fulfillment-ba-api",  workerSize: "Small",  workers: 1, status: "Started", runtime: "4.5.9"  },
    { api: "p-returns-ba-api",      workerSize: "Small",  workers: 1, status: "Started", runtime: "4.5.9"  },
    { api: "p-product-ba-api",      workerSize: "Medium", workers: 2, status: "Started", runtime: "4.6.21" },
    { api: "s-jde-ba-api",          workerSize: "Medium", workers: 2, status: "Started", runtime: "4.6.21" },
    { api: "s-salesforce-ba-api",   workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
    { api: "s-fedex-ba-api",        workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
    { api: "s-b2b-ba-api",          workerSize: "Small",  workers: 1, status: "Started", runtime: "4.3.0"  },
  ],
  schedulers: [
    { no: 1, scheduler: "BA-002-ORDERS-JDE-SYNC",           api: "s-jde-ba-api",       description: "Syncs confirmed D2C and wholesale orders from platform to JDE ERP",            scheduleTime: "Every 5 mins",  frequency: "Polling",  expectedBehaviour: "Order confirmed in JDE within 5 minutes of placement",                   status: "Enabled"  },
    { no: 2, scheduler: "BA-014-JDE-STOCK-REFRESH",         api: "s-jde-ba-api",       description: "Refreshes stock availability from JDE to platform inventory layer",           scheduleTime: "Every 20 mins", frequency: "Polling",  expectedBehaviour: "Platform stock levels aligned with JDE within 20 minutes",               status: "Enabled"  },
    { no: 3, scheduler: "BA-027-FEDEX-TRACKING-POLL",       api: "s-fedex-ba-api",     description: "Polls FedEx for international shipment tracking updates",                    scheduleTime: "Every 15 mins", frequency: "Polling",  expectedBehaviour: "International tracking milestones updated within 15 minutes",            status: "Enabled"  },
    { no: 4, scheduler: "BA-038-B2B-ORDERS-IMPORT",         api: "s-b2b-ba-api",       description: "Imports wholesale orders from B2B portal into JDE order management",        scheduleTime: "Every 30 mins", frequency: "Polling",  expectedBehaviour: "B2B portal orders visible in JDE within 30 minutes of submission",       status: "Enabled"  },
    { no: 5, scheduler: "BA-049-JDE-PRODUCT-REFRESH",       api: "p-product-ba-api",   description: "Nightly JDE product master refresh including seasonal collection updates",  scheduleTime: "02:30 AM",      frequency: "Daily",    expectedBehaviour: "Full product range including new season styles refreshed by 04:00 AM",   status: "Enabled"  },
    { no: 6, scheduler: "BA-SALESFORCE-ACCOUNT-SYNC",       api: "s-salesforce-ba-api",description: "Syncs wholesale account data between Salesforce and JDE customer master",    scheduleTime: "Every 2 hours", frequency: "Polling",  expectedBehaviour: "Wholesale account updates reflected in both systems within 2 hours",     status: "Disabled" },
  ],
  alerts: [
    {
      api:    "s-b2b-ba-api",
      alerts: "~26 alerts",
      reason: "B2B wholesale portal authentication failures caused by expired OAuth2 client credentials. All B2B portal order imports blocked from Monday 09:00 to Wednesday 14:30. New client credentials issued by Barbour IT and deployed Wednesday afternoon. 43 queued wholesale orders processed post-recovery.",
    },
    {
      api:    "s-jde-ba-api",
      alerts: "~8 alerts",
      reason: "JDE ERP connection pool exhaustion during B2B order catch-up processing Wednesday afternoon. JDE DBA increased connection pool size from 20 to 35 — no further occurrences after 15:00.",
    },
    {
      api:    "p-returns-ba-api",
      alerts: "~3 alerts",
      reason: "Returns API rejecting repair service orders that use 'REPAIR' return reason code — not present in current JDE return reason lookup table. Lookup table update scheduled for Friday maintenance window.",
    },
  ],
  connectorVersions: [
    { api: "p-orders-ba-api",      sftp: "3.1.4", ftp: "1.5.0", anypointMq: "1.1.0", http: "3.1.3", salesforce: "-",       cloudhub: "1.7.3" },
    { api: "p-fulfillment-ba-api", sftp: "3.1.7", ftp: "1.5.1", anypointMq: "1.1.0", http: "3.1.3", salesforce: "-",       cloudhub: "1.7.3" },
    { api: "p-returns-ba-api",     sftp: "3.1.4", ftp: "1.5.0", anypointMq: "1.1.0", http: "3.1.3", salesforce: "-",       cloudhub: "1.7.3" },
    { api: "s-jde-ba-api",         sftp: "3.1.7", ftp: "1.5.1", anypointMq: "1.3.4", http: "3.1.7", salesforce: "-",       cloudhub: "1.7.3" },
    { api: "s-salesforce-ba-api",  sftp: "3.1.4", ftp: "-",     anypointMq: "1.1.0", http: "3.1.3", salesforce: "10.10.4", cloudhub: "1.7.3" },
    { api: "s-fedex-ba-api",       sftp: "-",     ftp: "-",     anypointMq: "-",     http: "3.1.7", salesforce: "-",       cloudhub: "1.7.3" },
    { api: "s-b2b-ba-api",         sftp: "3.1.4", ftp: "1.5.0", anypointMq: "-",     http: "3.1.3", salesforce: "-",       cloudhub: "1.6.9" },
  ],
  weeklyHighlights: {
    period: "19/05/2026 to 23/05/2026",
    highlights: [
      "B2B portal credentials renewed and all 43 queued wholesale orders successfully processed by Wednesday 17:00.",
      "FedEx international tracking maintained 100% polling uptime across the week.",
      "JDE product refresh completed within SLA all 5 nights including new AW26 collection lines.",
      "All 9 CloudHub APIs running in Started state by end of week.",
      "JDE connection pool increase resolved Wednesday catch-up performance issues.",
    ].join("\n"),
    lowlights: [
      "B2B portal OAuth2 credential expiry caused 55-hour wholesale order import outage Monday to Wednesday — 26 alerts raised.",
      "JDE connection pool exhaustion during Wednesday recovery run caused 8 further alerts and temporary order processing delays.",
      "Returns API blocking repair service orders due to missing REPAIR reason code — 3 orders on hold pending Friday fix.",
      "BA-SALESFORCE-ACCOUNT-SYNC disabled following Tuesday connectivity issue — not yet re-enabled.",
    ].join("\n"),
    escalations: [
      "B2B portal OAuth2 credential expiry not flagged ahead of Monday renewal deadline — credential rotation process to be added to support runbook.",
      "JDE connection pool sizing review requested with Barbour IT — current allocation insufficient for catch-up processing scenarios.",
    ].join("\n"),
    reprocessed: "43 wholesale B2B orders queued during outage processed and confirmed in JDE by Wednesday 17:00. 3 repair return orders manually processed via JDE back-office pending lookup table fix.",
  },
  preliminaryCheck: [
    {
      no: 1, category: "CloudHub",
      task: "Is CloudHub up and running?",
      mon: "Yes", tue: "Yes", wed: "Yes", thu: "Yes", fri: "Yes",
      comments: "CloudHub platform available all week. B2B outage was upstream portal credential issue, not CloudHub.",
    },
    {
      no: 2, category: "CloudHub",
      task: "Are all integrations deployed and running?",
      mon: "Yes", tue: "Yes", wed: "Yes", thu: "Yes", fri: "Yes",
      comments: "9/9 APIs in Started state. s-b2b-ba-api running but returning 401s Mon–Wed due to upstream credential issue. BA-SALESFORCE-ACCOUNT-SYNC disabled (known).",
    },
    {
      no: 3, category: "CloudHub",
      task: "Are alerts getting raised in CloudHub and emails being sent properly?",
      mon: "Yes", tue: "Yes", wed: "Yes", thu: "Yes", fri: "Yes",
      comments: "All alerts notified correctly. B2B alerts triggered automated P1 escalation on Monday morning.",
    },
    {
      no: 4, category: "CloudHub",
      task: "In CloudHub, is the Memory Utilisation less than 80%?",
      mon: "Yes", tue: "Yes", wed: "Yes", thu: "Yes", fri: "Yes",
      comments: "Peak 75% on s-jde-ba-api during Wednesday catch-up processing. Returned to 55% by Thursday.",
    },
    {
      no: 5, category: "CloudHub",
      task: "In CloudHub, CPU utilisation is less than 80%?",
      mon: "Yes", tue: "Yes", wed: "No",  thu: "Yes", fri: "Yes",
      comments: "Wednesday peak 91% on s-jde-ba-api during bulk B2B order catch-up. Extra worker spun up at 14:00 — CPU normalised by 16:00.",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. FOOTASYLUM SUPPORT TEAM
// ─────────────────────────────────────────────────────────────────────────────
const footAsylumData: ProjectHealthData = {
  apis: [
    { api: "p-orders-fa-api",          workerSize: "Small",  workers: 2, status: "Started", runtime: "4.6.21" },
    { api: "p-inventory-fa-api",       workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
    { api: "p-fulfillment-fa-api",     workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
    { api: "p-returns-fa-api",         workerSize: "Small",  workers: 1, status: "Started", runtime: "4.5.9"  },
    { api: "p-product-fa-api",         workerSize: "Medium", workers: 2, status: "Started", runtime: "4.6.21" },
    { api: "s-brightpearl-fa-api",     workerSize: "Medium", workers: 2, status: "Started", runtime: "4.6.21" },
    { api: "s-salesforce-fa-api",      workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
    { api: "s-evri-fa-api",            workerSize: "Small",  workers: 1, status: "Started", runtime: "4.4.0"  },
    { api: "s-afterpay-fa-api",        workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
    { api: "e-afterpay-fa-events",     workerSize: "Small",  workers: 1, status: "Started", runtime: "4.6.21" },
  ],
  schedulers: [
    { no: 1, scheduler: "FA-001-ORDERS-BRIGHTPEARL-SYNC",   api: "s-brightpearl-fa-api", description: "Syncs new online orders to Brightpearl for inventory allocation and fulfilment",   scheduleTime: "Every 5 mins",  frequency: "Polling",  expectedBehaviour: "Orders allocated in Brightpearl within 5 minutes of placement",          status: "Enabled"  },
    { no: 2, scheduler: "FA-013-BRIGHTPEARL-STOCK-REFRESH", api: "s-brightpearl-fa-api", description: "Refreshes live stock levels from Brightpearl to platform availability layer",      scheduleTime: "Every 10 mins", frequency: "Polling",  expectedBehaviour: "Real-time stock positions reflected across all channels",                status: "Enabled"  },
    { no: 3, scheduler: "FA-024-EVRI-SHIPMENT-TRACKER",     api: "s-evri-fa-api",        description: "Polls Evri for parcel tracking events and updates customer order status",         scheduleTime: "Every 20 mins", frequency: "Polling",  expectedBehaviour: "Tracking milestones updated on customer account within 20 minutes",      status: "Enabled"  },
    { no: 4, scheduler: "FA-036-AFTERPAY-CALLBACK-HANDLER", api: "s-afterpay-fa-api",    description: "Processes Afterpay BNPL payment confirmation callbacks to release fulfilment",    scheduleTime: "Event-driven",  frequency: "Webhook",  expectedBehaviour: "Fulfilment released within 60 seconds of Afterpay payment confirmation", status: "Enabled"  },
    { no: 5, scheduler: "FA-048-BRIGHTPEARL-PRODUCT-SYNC",  api: "p-product-fa-api",     description: "Nightly product and pricing sync from Brightpearl to platform catalogue",        scheduleTime: "01:00 AM",      frequency: "Daily",    expectedBehaviour: "Full product catalogue refreshed by 02:30 AM",                          status: "Enabled"  },
    { no: 6, scheduler: "FA-RECOVERABLE-ORDERS-RETRY",      api: "s-brightpearl-fa-api", description: "Retries failed Brightpearl order sync from dead-letter queue",                   scheduleTime: "Every 10 mins", frequency: "Polling",  expectedBehaviour: "Recoverable failures retried automatically, up to 3 attempts",          status: "Enabled"  },
  ],
  alerts: [
    {
      api:    "s-afterpay-fa-api",
      alerts: "~38 alerts",
      reason: "Afterpay BNPL payment confirmation callbacks failing with HTTP 400 — 'merchant_reference already processed' error. Root cause: Afterpay sending duplicate webhook events on their side during Tuesday infrastructure migration. 38 callback events rejected, causing fulfilment hold for affected orders. Afterpay confirmed bug in their event deduplication logic — patch applied Tuesday 19:00. Idempotency handling improved in Mule to prevent future recurrence.",
    },
    {
      api:    "s-evri-fa-api",
      alerts: "~11 alerts",
      reason: "Evri tracking API returning 429 rate-limit errors during Thursday afternoon peak (17:00–19:00). Polling interval temporarily increased from 20 to 40 minutes. Rate limit quota increased by Evri on Friday morning — polling interval restored.",
    },
    {
      api:    "p-orders-fa-api",
      alerts: "~5 alerts",
      reason: "5 orders with combined Afterpay + discount voucher stuck in pending state after Afterpay callback rejection. Brightpearl allocation not triggered. Orders manually released by support team after Afterpay confirmed payment settled.",
    },
  ],
  connectorVersions: [
    { api: "p-orders-fa-api",       sftp: "3.1.4", ftp: "1.5.0", anypointMq: "1.1.0", http: "3.1.3", salesforce: "-",       cloudhub: "1.7.3" },
    { api: "p-fulfillment-fa-api",  sftp: "3.1.7", ftp: "1.5.1", anypointMq: "1.1.0", http: "3.1.3", salesforce: "-",       cloudhub: "1.7.3" },
    { api: "p-returns-fa-api",      sftp: "3.1.4", ftp: "1.5.0", anypointMq: "1.1.0", http: "3.1.3", salesforce: "-",       cloudhub: "1.7.3" },
    { api: "s-brightpearl-fa-api",  sftp: "3.1.7", ftp: "1.5.1", anypointMq: "1.3.4", http: "3.1.7", salesforce: "-",       cloudhub: "1.7.3" },
    { api: "s-salesforce-fa-api",   sftp: "3.1.4", ftp: "-",     anypointMq: "1.1.0", http: "3.1.3", salesforce: "10.10.4", cloudhub: "1.7.3" },
    { api: "s-evri-fa-api",         sftp: "3.1.4", ftp: "1.5.0", anypointMq: "-",     http: "3.1.3", salesforce: "-",       cloudhub: "1.6.9" },
    { api: "s-afterpay-fa-api",     sftp: "-",     ftp: "-",     anypointMq: "-",     http: "3.1.7", salesforce: "-",       cloudhub: "1.7.3" },
    { api: "e-afterpay-fa-events",  sftp: "-",     ftp: "-",     anypointMq: "1.3.4", http: "3.1.7", salesforce: "-",       cloudhub: "1.7.3" },
  ],
  weeklyHighlights: {
    period: "19/05/2026 to 23/05/2026",
    highlights: [
      "Afterpay duplicate callback issue resolved by Tuesday 19:00 following Afterpay patch and Mule idempotency improvements.",
      "All 10 CloudHub APIs maintained Started status throughout the week.",
      "Brightpearl stock refresh achieving average 7-minute lag — well within 10-minute SLA.",
      "FA-048 nightly product sync delivered 8,200 product records within 75 minutes all 5 nights.",
      "Evri rate limit quota increased Friday — tracker polling restored to standard 20-minute interval.",
    ].join("\n"),
    lowlights: [
      "Afterpay BNPL duplicate callback failures caused 38 alerts on Tuesday — fulfilment held for affected orders during outage window.",
      "5 Afterpay + voucher combination orders stuck in pending state requiring manual release.",
      "Evri rate-limit 429 errors Thursday 17:00–19:00 degraded tracking update frequency for 2 hours.",
    ].join("\n"),
    escalations: [
      "Afterpay duplicate webhook issue escalated to Afterpay technical account manager Tuesday afternoon — P1 raised. Resolved same evening.",
      "Evri rate limit quota review requested — current tier insufficient for evening peak periods. Quota upgrade approved Friday.",
    ].join("\n"),
    reprocessed: "38 Afterpay callback rejections resolved post-patch — fulfilment auto-released for 33 orders. 5 Afterpay + voucher orders manually released by support team on Wednesday morning after Afterpay payment settlement confirmed.",
  },
  preliminaryCheck: [
    {
      no: 1, category: "CloudHub",
      task: "Is CloudHub up and running?",
      mon: "Yes", tue: "Yes", wed: "Yes", thu: "Yes", fri: "Yes",
      comments: "CloudHub platform fully available all week.",
    },
    {
      no: 2, category: "CloudHub",
      task: "Are all integrations deployed and running?",
      mon: "Yes", tue: "Yes", wed: "Yes", thu: "Yes", fri: "Yes",
      comments: "10/10 APIs in Started state. s-afterpay-fa-api alerting Tuesday but remained running.",
    },
    {
      no: 3, category: "CloudHub",
      task: "Are alerts getting raised in CloudHub and emails being sent properly?",
      mon: "Yes", tue: "Yes", wed: "Yes", thu: "Yes", fri: "Yes",
      comments: "Alert emails delivered correctly all week. Afterpay P1 alert triggered automated escalation to on-call engineer Tuesday 09:32.",
    },
    {
      no: 4, category: "CloudHub",
      task: "In CloudHub, is the Memory Utilisation less than 80%?",
      mon: "Yes", tue: "Yes", wed: "Yes", thu: "Yes", fri: "Yes",
      comments: "Peak 70% on s-brightpearl-fa-api during Wednesday morning order backlog processing.",
    },
    {
      no: 5, category: "CloudHub",
      task: "In CloudHub, CPU utilisation is less than 80%?",
      mon: "Yes", tue: "No",  wed: "Yes", thu: "Yes", fri: "Yes",
      comments: "Tuesday peak 86% on s-afterpay-fa-api during Afterpay retry storm (09:15–11:00). Auto-scaling added second worker — CPU fell to 52% by 11:15.",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Master record and default export
// ─────────────────────────────────────────────────────────────────────────────
export const PROJECT_HEALTH_DATA: Record<string, ProjectHealthData> = {
  "Mulberry Support Team": mulberryData,
  "Clarks Support Team":   clarksData,
  "Harvey Nichols":        harveyNicholsData,
  "Wren Kitchens":         wrenKitchensData,
  "Barbour Support":       barbourData,
  "FootAsylum Support Team": footAsylumData,
};

export const DEFAULT_PROJECT_HEALTH: ProjectHealthData = mulberryData;
