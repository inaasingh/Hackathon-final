/**
 * projectTickets.ts
 * Per-project ticket datasets — each project shows its own realistic tickets.
 * Descriptions contain keywords that drive deriveInvestigationGuide() in IntegrationHub.
 */

const now = Date.now();
const h = (n: number) => new Date(now - n * 3_600_000).toISOString();
const d = (n: number) => new Date(now - n * 86_400_000).toISOString();

function mkAI(
  urgency: number, cat: string, sub: string, priority: string,
  pattern: string, draft: string, risk: string | null, eta: number,
) {
  return {
    urgencyScore: urgency, category: cat, subCategory: sub,
    suggestedPriority: priority, pattern, draftResponse: draft,
    riskFlag: risk, estimatedResolutionHours: eta,
    processedAt: new Date().toISOString(),
  };
}

function tk(
  id: string, subject: string, description: string,
  status: string, priority: string, dept: string,
  fn: string, ln: string, email: string,
  channel: string, createdH: number, ai: any,
): any {
  return {
    id, subject, description, status, priority,
    department: { name: dept },
    contact: { firstName: fn, lastName: ln, email },
    channel, classification: "Technical",
    createdTime: h(createdH), modifiedTime: h(createdH - 1),
    aiAnalysis: ai,
  };
}

// ── MULBERRY SUPPORT TEAM ─────────────────────────────────────────────────────
const MULBERRY: any[] = [
  // ── Live tickets from Zoho Desk (Mulberry Support) ──────────────────────────
  tk("441397", "prod-s-sfsc-order-mb-api : INFO: TECHERROR : Custom Application Notification",
    "OMS to SFSC Order Sync failed for order TSB185361-rcvd. Business exception in MB20.21 — First Name: data value too large (max length=20). Salesforce composite API rejected the payload at Sales_Header creation step.",
    "Open", "High", "Platform Engineering", "Vaibhavi", "Sharma", "v.sharma@mulberry.com", "Email", 2,
    mkAI(94, "Integration", "OMS-SFSC Sync", "High",
      "Recurring First Name field length violation — OMS not truncating before sending to SFSC composite API.",
      "Hi Vaibhavi, there is a business exception in MB20.21 - OMS to SFSC Order Sync for order TSB185361-rcvd due to First Name: data value too large (max length=20). Our team is applying a field-length truncation fix to the OMS payload transformer. Update in 1 hour.",
      "Active order sync failure — orders not reaching Salesforce for fulfilment processing.", 2)),

  tk("441392", "prod-p-receipt-mb-api : INFO: TECHERROR : Custom Application Notification",
    "Receipt generation failed for order TSB185344-rcvd. compositeResponse returned null on order confirmation step. MuleSoft CloudHub log shows httpStatusCode 201 but body empty — receipt PDF not generated and customer email not dispatched.",
    "Open", "High", "Integration Ops", "Vaibhavi", "Sharma", "v.sharma@mulberry.com", "Email", 3,
    mkAI(88, "Integration", "Receipt Generation", "High",
      "Null compositeResponse on receipt API — same pattern seen on prod-p-receipt-mb-api last month.",
      "Hi team, the receipt generation failure on prod-p-receipt-mb-api for TSB185344-rcvd is under investigation. The compositeResponse null issue suggests a downstream Salesforce timeout. We are adding a retry handler to the CloudHub flow.",
      "Customer receipt emails not sending — customer experience impacted for affected orders.", 3)),

  tk("441379", "prod-s-partner-mb-api : INFO: TECHERROR : Custom Application Notification",
    "Partner API sync error for order TSB185298-rcvd. httpStatusCode 201 returned by Salesforce but response body is empty — referenceId for Sales_Line_c not present. Integration cannot confirm partner order record creation.",
    "Open", "Medium", "Integration Ops", "Vaibhavi", "Sharma", "v.sharma@mulberry.com", "Email", 14,
    mkAI(82, "Integration", "Partner API Sync", "Medium",
      "Empty 201 response body on Sales_Line_c creation — Salesforce may be returning partial composite response.",
      "The prod-s-partner-mb-api TECHERROR on TSB185298-rcvd is being investigated. The 201 with empty body indicates a Salesforce composite API partial success. We are adding response validation and retry logic to the partner sync flow.",
      null, 4)),

  tk("441376", "prod-s-oms-mb-api : INFO: TECHERROR : Custom Application Notification",
    "OMS dispatch delayed for order TSB185276-rcvd. Sales_Header LinkedHashMap not resolved — java.util.LinkedHashMap cast exception in the OMS to SFSC transformer. Order stuck in MuleSoft retry queue. P2 due to dispatch SLA impact.",
    "Open", "High", "Platform Engineering", "Vaibhavi", "Sharma", "v.sharma@mulberry.com", "Email", 24,
    mkAI(91, "Integration", "OMS Dispatch", "High",
      "LinkedHashMap cast exception in OMS transformer — likely a schema change in the OMS order payload.",
      "Hi Vaibhavi, the prod-s-oms-mb-api TECHERROR on TSB185276-rcvd is a P2. The LinkedHashMap cast exception in the OMS transformer is being investigated. We are applying a null-safe cast fix and will replay the affected order once deployed.",
      "Dispatch SLA actively breaching — order stuck in retry queue, fulfilment blocked.", 2)),

  tk("441368", "prod-s-sfsc-order-mb-api : INFO: TECHERROR : Custom Application Notification",
    "MB20.21 — OMS to SFSC Order Sync exception for TSB185361-rcvd. First Name: data value too large (max length=20). Salesforce returned httpStatusCode 400 on Sales_Header_c creation. Closed by Shwetha Boga after applying field-length validation patch.",
    "Closed", "Medium", "Platform Engineering", "Shwetha", "Boga", "s.boga@absolutelabs.com", "Email", 17,
    mkAI(99, "Integration", "OMS-SFSC Sync", "Medium",
      "Resolved: First Name truncation fix deployed to prod-s-sfsc-order-mb-api transformer. Verified in CloudHub.",
      "Hi Vaibhavi, the MB20.21 OMS to SFSC Order Sync exception for TSB185361-rcvd has been resolved. We deployed a field-length truncation fix (max 20 chars) to the OMS payload transformer. The order has been replayed successfully. Closing ticket.",
      null, 0)),

  tk("441362", "prod-p-receipt-mb-api : INFO: TECHERROR : Custom Application Notification",
    "Receipt API UTF-8 encoding mismatch on order TSB185240-rcvd. Response payload using application/java charset rather than UTF-8. MuleSoft HTTP response builder not setting explicit charset — caused malformed receipt content. Closed by Shwetha Boga.",
    "Closed", "Low", "Integration Ops", "Shwetha", "Boga", "s.boga@absolutelabs.com", "Email", 23,
    mkAI(97, "Integration", "Receipt Encoding", "Low",
      "Resolved: Explicit charset=UTF-8 added to all HTTP response builders in prod-p-receipt-mb-api.",
      "The UTF-8 encoding mismatch on the receipt API for TSB185240-rcvd has been fixed. We set explicit charset=UTF-8 on all HTTP response builders in the CloudHub flow. Receipt generation tested and confirmed working. Closing ticket.",
      null, 0)),

  tk("441360", "prod-s-sfsc-order-mb-api : INFO: TECHERROR : Custom Application Notification",
    "Duplicate order sync attempt detected for TSB185228-rcvd. Sales_Tender_c record already exists in Salesforce — idempotency check not preventing re-submission on retry. CloudHub replay triggered duplicate SFSC call. Closed by Shwetha Boga.",
    "Closed", "Low", "Integration Ops", "Shwetha", "Boga", "s.boga@absolutelabs.com", "Email", 17,
    mkAI(96, "Integration", "Duplicate Prevention", "Low",
      "Resolved: Added Salesforce upsert (externalId check) to prevent duplicate Sales_Tender_c creation on retry.",
      "The duplicate sync issue for TSB185228-rcvd is resolved. We replaced the insert operation with an upsert using the order reference as externalId — this prevents duplicate Sales_Tender_c records on CloudHub replay. Closing ticket.",
      null, 0)),

  tk("441358", "prod-s-sfsc-order-mb-api : INFO: TECHERROR : Custom Application Notification",
    "Salesforce composite API returned 201 but missing referenceId for Sales_Line_c on order TSB185219-rcvd. MuleSoft integration could not confirm line item creation. Partial order sync — Sales_Header created but Sales_Line_c unconfirmed. Closed by Shwetha Boga.",
    "Closed", "Low", "Integration Ops", "Shwetha", "Boga", "s.boga@absolutelabs.com", "Email", 17,
    mkAI(95, "Integration", "Composite API", "Low",
      "Resolved: Added referenceId null-check and individual line item verification step to composite API handler.",
      "The missing referenceId on Sales_Line_c for TSB185219-rcvd is resolved. We added a null-check on the composite API response and introduced a verification step to confirm each line item individually before marking the sync complete. Closing ticket.",
      null, 0)),

  tk("ZD-4821", "Order API — 504 Gateway Timeout on checkout flow",
    "Customers experiencing 504 timeouts on checkout confirmation step. Issue started at 14:00 UTC following deploy of Release-149. Approximately 23% of checkout attempts are failing. Revenue impact is active.",
    "Open", "Urgent", "Platform Engineering", "Sarah", "Mitchell", "s.mitchell@mulberry.com", "Email", 2,
    mkAI(94, "Performance", "API Timeout", "Urgent",
      "Third 504 on checkout this month — Release-149 deploy likely introduced regression.",
      "Thank you for raising this urgent issue. Our engineering team is investigating the checkout 504 timeout immediately and has initiated a rollback assessment. We will update you within 30 minutes.",
      "Active revenue loss — ~23% of checkout sessions failing. Escalate to Platform Engineering lead.", 2)),

  tk("ZD-4819", "MuleSoft Payment Gateway circuit breaker tripped — Adyen",
    "Circuit breaker on the Adyen payment gateway flow has tripped in CloudHub. Payment confirmation is blocked. No payments processed in last 45 minutes. Adyen status page shows no declared outage.",
    "Open", "High", "Integration Ops", "James", "Thornton", "j.thornton@mulberry.com", "Phone", 3,
    mkAI(88, "Integration", "Circuit Breaker", "High",
      "Second circuit breaker trip on Adyen this week — error threshold may need review.",
      "We have identified the circuit breaker trip on the Adyen payment flow and are investigating the root cause. The team is checking whether the issue is upstream with Adyen or within the MuleSoft connector. Update in 1 hour.",
      "Payment processing fully blocked — every order attempt failing at payment step.", 3)),

  tk("ZD-4817", "Salesforce CRM sync latency exceeding 1.2s SLA",
    "Salesforce CRM sync via s-salesforce-mb-api showing p95 latency of 1.2s against 800ms SLA. Customer profile updates delayed, affecting personalisation engine. Datadog WARN alert active.",
    "On Hold", "High", "CRM Operations", "Emma", "Davies", "e.davies@mulberry.com", "Email", 14,
    mkAI(72, "Performance", "CRM Latency", "High",
      "Salesforce latency elevated for 3 consecutive days — connector pool saturation suspected.",
      "Thank you for flagging this. The CRM sync latency issue is being monitored and the team is reviewing Salesforce connector configuration. We will provide an update by end of business today.",
      null, 4)),

  tk("ZD-4813", "Inventory sync missing 3 luxury bag SKUs post-migration",
    "Following Prima ERP migration last weekend, 3 SKUs (Bayswater Bag, Mini Seaton, Iris Bag) are not appearing in inventory sync feed. Stock shows correctly in Prima but not propagating to Manhattan WMS or website.",
    "Open", "High", "Platform Engineering", "Sarah", "Mitchell", "s.mitchell@mulberry.com", "Email", 26,
    mkAI(76, "Data Sync", "Inventory Gap", "High",
      "Post-migration SKU sync gap — likely field mapping change in Prima ERP schema.",
      "We are investigating the inventory sync discrepancy for the 3 affected SKUs following the Prima migration. The team is comparing source and destination record counts to identify the mapping failure. Update within 2 hours.",
      "3 hero SKUs showing as out of stock online — potential lost sales on flagship products.", 4)),

  tk("ZD-4810", "MB-066 Recoverable order retry queue backing up — 47 orders",
    "The MB-RECOVERABLE-ORDERS-RETRY scheduler shows 47 orders stuck in dead-letter queue. Queue depth growing since 08:00. Scheduler is running in CloudHub but no orders are being replayed successfully.",
    "Open", "Medium", "Integration Ops", "James", "Thornton", "j.thornton@mulberry.com", "Email", 6,
    mkAI(58, "Integration", "Scheduler Failure", "Medium",
      "Retry queue depth has grown 3× since last week — possible dead-letter payload schema change.",
      "The order retry queue backup has been escalated to our integration team who are reviewing the scheduler logs in CloudHub. We will investigate the dead-letter queue payload and provide an update within 4 hours.",
      null, 6)),

  tk("ZD-4806", "Zigzag returns not processing — 12 authorisations stuck",
    "12 return authorisations from Zigzag not processed into OMS. MB-061-ZIGZAG-RETURNS-SCHEDULER shows Enabled in CloudHub but no records picked up since 07:00. Customers awaiting refund confirmation.",
    "In Progress", "Medium", "Returns & Fulfilment", "Claire", "Watkins", "c.watkins@mulberry.com", "Email", 8,
    mkAI(56, "Integration", "Returns Scheduler", "Medium",
      "Zigzag scheduler anomaly — similar issue occurred 2 weeks ago after a CloudHub deployment.",
      "We have identified 12 return authorisations not processed by the Zigzag integration and are investigating the scheduler behaviour in CloudHub. Our team will trigger a manual replay if the root cause cannot be resolved within 2 hours.",
      null, 4)),
];

// ── WREN KITCHENS ─────────────────────────────────────────────────────────────
const WREN: any[] = [
  tk("WK-3041", "Kitchen configurator 500 errors after deploy v4.2.1",
    "3D kitchen configurator throwing HTTP 500 errors after deployment of version 4.2.1. Customers cannot design or add kitchens to basket. Affects ~40% of web sessions. Revenue impact active — configurator is primary sales channel.",
    "Open", "Urgent", "Digital Platform", "Mark", "Henderson", "m.henderson@wrenkitchens.com", "Phone", 1,
    mkAI(96, "Performance", "Deploy Regression", "Urgent",
      "Post-deploy 500 error pattern — v4.2.1 likely broke the basket integration endpoint.",
      "Thank you for the urgent escalation. We have identified 500 errors on the configurator following the v4.2.1 deployment and are assessing an immediate rollback. Our engineers are in the deployment logs now. Update in 20 minutes.",
      "Configurator is primary revenue channel — every minute down = direct sales loss. Rollback decision needed urgently.", 1)),

  tk("WK-3039", "Infor M3 product sync not updating web catalogue — 124 SKUs",
    "Infor M3 product master sync has not updated website catalogue for 6 hours. 124 SKUs including new Madison and Infinity door ranges not visible online. Inventory scheduler last ran 08:00 — expected every 30 minutes.",
    "Open", "High", "Integration Ops", "Rachel", "Briggs", "r.briggs@wrenkitchens.com", "Email", 7,
    mkAI(82, "Data Sync", "Product Catalogue", "High",
      "Infor M3 sync stall recurring — last similar incident was after an M3 patch update.",
      "We are investigating the Infor M3 product sync delay. The team is checking the scheduler status in CloudHub and comparing record counts between M3 and the website catalogue. Update within 2 hours.",
      "124 SKUs invisible online including new season launches — impacts promotional campaign.", 4)),

  tk("WK-3037", "SAP pricing showing 24h delay on promotional sale items",
    "SAP price feed not propagating promotional pricing to website within expected 30-minute window. Sale items showing full RRP instead of sale price. Customer orders placed at wrong price need review. Cache may not have been invalidated after pricing engine update.",
    "Open", "High", "Pricing & Promotions", "David", "Okafor", "d.okafor@wrenkitchens.com", "Email", 9,
    mkAI(78, "Data Sync", "Price Feed Delay", "High",
      "Pricing propagation delay is recurring during sale periods — cache invalidation process needs review.",
      "We have confirmed the promotional pricing is not propagating to the website and are investigating the SAP price feed scheduler and cache invalidation. Impacted orders will be reviewed for pricing corrections.",
      "Customers purchasing at incorrect RRP — refund or goodwill adjustment may be required for affected orders.", 4)),

  tk("WK-3035", "Customer lead not flowing from web form to CRM",
    "Web enquiry form submissions not appearing in CRM. Integration between website lead capture and Salesforce not delivering leads since 09:30. Approximately 35 leads may have been lost. Sales advisors cannot follow up with potential customers.",
    "Open", "High", "Sales Operations", "Lisa", "Crawford", "l.crawford@wrenkitchens.com", "Email", 5,
    mkAI(80, "Integration", "CRM Lead Sync", "High",
      "Lead capture integration failure — form webhook endpoint may have changed in the latest deploy.",
      "We have identified the web-to-CRM lead integration failure and are investigating the connection between the website form and Salesforce. We are also reviewing whether any leads from today can be recovered. Update within 2 hours.",
      "35 potential customer leads may be permanently lost — direct sales pipeline impact.", 3)),

  tk("WK-3032", "DPD delivery scheduling API timeout on large kitchen orders",
    "DPD delivery scheduling integration timing out for kitchen orders exceeding 15 line items. CloudHub returning 504 errors when booking multi-van deliveries. Single-item orders unaffected. Delivery team cannot confirm multi-van delivery dates.",
    "In Progress", "Medium", "Logistics", "Tom", "Ashworth", "t.ashworth@wrenkitchens.com", "Email", 18,
    mkAI(62, "Performance", "Delivery API Timeout", "Medium",
      "DPD API timeouts on large orders — payload size or DPD rate limiting may be the cause.",
      "The DPD delivery scheduling timeout issue for large orders has been escalated to our integration team. We are investigating the CloudHub timeout configuration and will liaise with DPD on any API-side constraints.",
      null, 6)),

  tk("WK-3029", "Installer capacity not syncing with booking system",
    "Installer availability feed from booking system not reflecting confirmed bookings. Installer calendars in CRM show slots as available after bookings are confirmed. Risk of double-booking installation appointments for customers.",
    "Open", "Low", "Installation Services", "Angela", "Moore", "a.moore@wrenkitchens.com", "Email", 28,
    mkAI(36, "Data Sync", "Booking Sync", "Low",
      "Installer booking sync inconsistency — possibly related to the new booking portal migration.",
      "Thank you for raising this issue. The installer availability sync discrepancy has been logged and our team will investigate the booking system integration. We will provide an update within 24 hours.",
      null, 8)),
];

// ── FENWICK SUPPORT TEAM ──────────────────────────────────────────────────────
const FENWICK: any[] = [
  tk("FW-2188", "POS transaction sync failing at Bond Street flagship — 47 transactions",
    "Point-of-sale transactions at Bond Street are failing to sync to central OMS. 47 transactions from this morning not reflected in central inventory. Store team escalated — EOD reconciliation will be impacted.",
    "Open", "High", "Store Operations", "Victoria", "Spencer", "v.spencer@fenwick.co.uk", "Phone", 3,
    mkAI(82, "Integration", "POS Sync", "High",
      "Bond Street POS sync failure — similar issue occurred during last quarter-end period.",
      "We have identified the POS sync failure at Bond Street and are investigating the integration between the tills and the central OMS. A manual reconciliation process has been initiated as a temporary measure.",
      "47 unrecorded transactions will cause EOD stock discrepancy — inventory accuracy at risk.", 3)),

  tk("FW-2185", "SFTP product feed from buying system delayed 6 hours — SS26 arrivals",
    "SFTP product catalogue feed from buying system not picked up by integration for 6 hours. New season SS26 arrivals not appearing on website. Expected feed time 06:00 — SFTP shows files landed but MuleSoft CloudHub scheduler has not processed them.",
    "Open", "Medium", "Buying & Merchandising", "Charlotte", "Reed", "c.reed@fenwick.co.uk", "Email", 7,
    mkAI(64, "Data Sync", "SFTP Feed Delay", "Medium",
      "SFTP scheduler not picking up files — possible CloudHub SFTP connector credential issue.",
      "The delay in the SFTP product feed processing has been escalated to our integration team. We are checking the CloudHub SFTP scheduler logs and confirming the files are correctly formatted. Update within 3 hours.",
      null, 4)),

  tk("FW-2183", "Stock replenishment not triggering for 12 low-stock luxury lines",
    "Automated stock replenishment requests not being generated for 12 luxury SKUs below reorder threshold. Replenishment scheduler appears to be running in CloudHub but no purchase orders raised in JDA Blue Yonder today. Inventory team cannot initiate replenishment manually.",
    "Open", "High", "Stock Management", "Henry", "Blackwood", "h.blackwood@fenwick.co.uk", "Email", 22,
    mkAI(74, "Data Sync", "Replenishment Scheduler", "High",
      "Replenishment scheduler running but producing no output — transform logic may have a threshold comparison bug.",
      "We are investigating the stock replenishment scheduler failure for the 12 affected luxury SKUs. The team is reviewing the CloudHub scheduler logs and the threshold comparison logic in the integration.",
      "12 luxury lines risk stockouts if replenishment not triggered within 24 hours.", 4)),

  tk("FW-2181", "New buyer Emily Foster not provisioned access after 3 days",
    "New buyer Emily Foster who joined Monday has not been granted access to the buying and merchandising system. IT raised a Jira provisioning ticket 3 days ago but the automated onboarding flow has not completed. She cannot perform her role.",
    "Open", "Medium", "HR & IT Access", "Patricia", "Lawson", "p.lawson@fenwick.co.uk", "Email", 72,
    mkAI(54, "Access Management", "Onboarding Provisioning", "Medium",
      "Third new joiner provisioning failure this month — automated onboarding flow has a recurring issue.",
      "We are investigating why Emily Foster has not been provisioned access. The team is checking the automated onboarding flow in CloudHub and the Azure AD account setup. We will resolve or manually provision access today.",
      null, 4)),

  tk("FW-2179", "Loyalty points not awarded for click-and-collect — 230 orders",
    "Customers completing click-and-collect orders not receiving loyalty points for last 4 days. Approximately 230 orders affected. Loyalty integration between OMS and Fenwick Rewards platform appears to be failing silently.",
    "Open", "High", "Customer Experience", "Victoria", "Spencer", "v.spencer@fenwick.co.uk", "Email", 96,
    mkAI(70, "Integration", "Loyalty Points", "High",
      "Loyalty integration silent failure — 230 affected orders suggests a systematic issue, not one-off.",
      "We have identified that loyalty points have not been awarded for click-and-collect orders and are investigating the integration between the OMS and the Fenwick Rewards platform. Affected orders will be retrospectively credited.",
      "Customer trust and loyalty programme engagement impacted — manual credits needed for 230 customers.", 6)),
];

// ── HARVEY NICHOLS ────────────────────────────────────────────────────────────
const HARVEY_NICHOLS: any[] = [
  tk("HN-1892", "Shopify order webhook failing to reach OMS — 31 orders unprocessed",
    "Shopify order confirmation webhooks not reaching OMS since 11:30. 31 online orders placed today have not been fulfilled. Shopify events log shows webhooks fired but MuleSoft listener flow not receiving them. Revenue and fulfilment both impacted. Deploy was made to the webhook listener flow this morning.",
    "Open", "Urgent", "eCommerce Platform", "Alexandra", "Hughes", "a.hughes@harveynichols.com", "Phone", 2,
    mkAI(92, "Integration", "Webhook Failure", "Urgent",
      "Post-deploy webhook failure — morning deployment to listener flow likely broke the endpoint.",
      "We have identified that Shopify webhooks are not reaching the OMS and have 31 unfulfilled orders. The team is investigating the MuleSoft listener flow immediately. We will contact you within 30 minutes with an update.",
      "31 orders unprocessed — fulfilment SLA actively breaching. Rollback of this morning's deploy may be required.", 2)),

  tk("HN-1890", "StyleAI personalisation API rate-limited — recommendations blank",
    "StyleAI personalisation engine returning rate limit errors (429). Product recommendations blank on homepage and PDP pages. Integration polling frequency may have increased after recent A/B test deployment. Cache showing stale data.",
    "Open", "High", "Digital Experience", "Daniel", "Forsyth", "d.forsyth@harveynichols.com", "Email", 5,
    mkAI(76, "Performance", "API Rate Limiting", "High",
      "StyleAI rate limit hit after A/B test deploy increased polling frequency — cache not compensating.",
      "The StyleAI personalisation rate-limiting issue has been escalated to our platform team. We are reviewing the polling frequency configuration and cache TTL settings. Recommendations will be restored once the rate limit window resets.",
      null, 4)),

  tk("HN-1888", "Burberry concessions SFTP feed rejected — 47 SS26 SKUs missing",
    "Burberry concessions SFTP product feed being rejected by MuleSoft SFTP processor. 47 new SS26 Burberry SKUs not visible on website. CloudHub error: 'Invalid product category mapping'. Burberry changed their feed format in SS26 without notifying the integration team.",
    "In Progress", "High", "Concessions", "Sophie", "Marchetti", "s.marchetti@harveynichols.com", "Email", 9,
    mkAI(68, "Data Sync", "SFTP Feed Rejection", "High",
      "Concessions feed format change without notification — a recurring pattern with partner feeds.",
      "We are investigating the Burberry SFTP feed rejection and have contacted Burberry to confirm the SS26 format changes. Our team is updating the MuleSoft transformation to accommodate the new category mapping. Update within 4 hours.",
      null, 6)),

  tk("HN-1885", "Product availability showing incorrect stock at Knightsbridge",
    "Online product availability showing incorrect stock counts for Knightsbridge store. Customers adding out-of-stock items to cart. Inventory sync showing DC stock rather than store stock. 5 failed click-and-collect attempts reported by store team today.",
    "Open", "Medium", "Stock Operations", "Alexandra", "Hughes", "a.hughes@harveynichols.com", "Email", 16,
    mkAI(64, "Data Sync", "Inventory Mapping", "Medium",
      "Store vs DC stock source confusion — integration may be querying the wrong location ID for Knightsbridge.",
      "The stock availability discrepancy for Knightsbridge has been raised with our inventory integration team. We are checking the location mapping in the CloudHub inventory sync and will apply a correction for the affected location.",
      null, 6)),
];

// ── CLARKS SUPPORT TEAM ───────────────────────────────────────────────────────
const CLARKS: any[] = [
  tk("CL-5512", "EMEA order routing misconfigured post-SAP S/4HANA upgrade — 67 orders",
    "Following SAP S/4HANA upgrade deployed overnight, EMEA orders being routed to US DC instead of Radstock distribution centre. 67 orders placed this morning have incorrect routing. Integration needs order routing table refresh from SAP master data.",
    "Open", "Urgent", "Platform Engineering", "Michael", "Chen", "m.chen@clarks.com", "Email", 2,
    mkAI(91, "Integration", "Order Routing", "Urgent",
      "Post-SAP-upgrade routing failure — routing table in integration layer not updated after database migration.",
      "We have identified the EMEA order routing issue following the SAP upgrade and are urgently refreshing the routing table from SAP master data. 67 affected orders are being re-routed to Radstock manually in parallel.",
      "67 orders mis-routed — fulfilment from wrong DC causing delivery SLA breach and international shipping costs.", 2)),

  tk("CL-5510", "SFCC checkout 500 errors for registered customers after deploy",
    "Salesforce Commerce Cloud checkout throwing HTTP 500 errors for registered customers after latest deployment. Guest checkout unaffected. 500 error appears related to loyalty account balance lookup introduced in the deploy. Error log shows null pointer on account balance API call.",
    "Open", "High", "eCommerce", "Rebecca", "Palmer", "r.palmer@clarks.com", "Phone", 4,
    mkAI(84, "Performance", "Deploy Regression", "High",
      "Post-deploy checkout regression — null pointer in loyalty balance API call is new code from this release.",
      "We have identified a 500 error on checkout for registered customers following today's deployment. The team is investigating the loyalty account balance API call and a fix or rollback decision will be made within 1 hour.",
      "Registered customers — ~60% of checkout volume — blocked. Revenue impact growing.", 2)),

  tk("CL-5508", "Wholesale buyer portal login failing for US Nordstrom and Macy's accounts",
    "US wholesale buyer accounts unable to log in to B2B portal. Access appears revoked following identity management migration. 15 major wholesale accounts including Nordstrom and Macys have escalated. Trading relationship at risk. Need to provision access urgently.",
    "Open", "High", "Wholesale Operations", "Amanda", "Brooks", "a.brooks@clarks.com", "Phone", 6,
    mkAI(86, "Access Management", "Portal Access", "High",
      "Identity migration caused wholesale portal access revocation — accounts not re-provisioned post-migration.",
      "We are urgently investigating the wholesale portal access failures for US accounts. The identity management migration is being reviewed and we are working to restore access for all affected accounts as a priority.",
      "Nordstrom and Macy's accounts cannot place orders — major wholesale revenue at risk.", 3)),

  tk("CL-5505", "Blue Yonder WMS not reflecting weekend stocktake — 3,400 unit discrepancy",
    "Weekend stocktake data from 240 stores not reflected in Blue Yonder WMS. Stocktake sync scheduler ran but record counts show 3,400 unit discrepancy across network. Online availability showing incorrect stock for 18 high-demand SKUs.",
    "In Progress", "Medium", "Inventory Operations", "Michael", "Chen", "m.chen@clarks.com", "Email", 48,
    mkAI(62, "Data Sync", "Stocktake Sync", "Medium",
      "Stocktake sync discrepancy — schema change in stocktake export format may have caused partial load.",
      "The Blue Yonder WMS stocktake sync discrepancy has been escalated to our inventory integration team. We are comparing record counts between the stocktake system and WMS to identify which store data is missing.",
      null, 8)),
];

// ── BARBOUR SUPPORT ───────────────────────────────────────────────────────────
const BARBOUR: any[] = [
  tk("BA-0892", "Magento checkout 500 errors after payment processor deploy — 15% failure rate",
    "Following deployment of payment processor integration on Friday, approximately 15% of Magento checkout attempts returning 500 error at payment step. Adyen payment confirmation failing. Weekend trading impacted — revenue loss estimated at 15% of expected weekend turnover.",
    "Open", "Urgent", "eCommerce", "Charlotte", "Neville", "c.neville@barbour.com", "Phone", 3,
    mkAI(90, "Performance", "Deploy Regression", "Urgent",
      "Post-deploy payment failure — Friday release likely introduced a regression in Adyen payment confirmation.",
      "We have identified the checkout 500 error following Friday's deployment and are assessing a rollback of the payment processor integration. The Adyen team has been notified. We will update you within 30 minutes.",
      "15% checkout failure rate over the weekend — significant revenue lost. Rollback is being assessed urgently.", 2)),

  tk("BA-0889", "Akeneo PIM to Magento sync failed — 89 new AW26 styles not live",
    "Akeneo PIM to Magento product sync failed for 89 new AW26 styles. Products fully set up in Akeneo but not on website. CloudHub sync scheduler ran at 02:00 but no new products created. Error: 'missing mandatory attribute: material_composition'.",
    "Open", "High", "Digital Operations", "Charlotte", "Neville", "c.neville@barbour.com", "Email", 30,
    mkAI(76, "Data Sync", "PIM Sync Failure", "High",
      "Mandatory attribute missing in PIM sync — AW26 briefing likely introduced new required fields not mapped.",
      "We are investigating the Akeneo to Magento sync failure for the 89 AW26 styles. The team is reviewing the error log for the material_composition attribute mapping and will apply a fix to the CloudHub transformation. Update within 3 hours.",
      "AW26 launch styles not visible online — new season trading blocked for flagship range.", 4)),

  tk("BA-0887", "John Lewis wholesale SFTP upload failing — certificate auth error",
    "Automated SFTP upload of Barbour product feed to John Lewis portal failing with authentication error. John Lewis have flagged they have not received the weekly feed update. Certificate renewal may have changed the SFTP key — integration credentials may need updating.",
    "Open", "High", "Wholesale Operations", "Elizabeth", "Foster", "e.foster@barbour.com", "Email", 24,
    mkAI(72, "Integration", "SFTP Authentication", "High",
      "SFTP certificate authentication failure — certificate renewal cycle is a recurring cause of this issue.",
      "We are investigating the John Lewis SFTP authentication error. The team will check the CloudHub SFTP connector certificate configuration and liaise with John Lewis to confirm their expected key fingerprint. Update within 4 hours.",
      "John Lewis feed failure risks partner relationship — John Lewis account is a major wholesale revenue line.", 4)),

  tk("BA-0885", "SAP inbound shipment from Portugal not received — 2,400 units",
    "Inbound shipment of 2,400 units from Portuguese manufacturing partner not received into SAP or Landmark WMS. Supplier confirmed ASN was sent but has not been processed by the integration. Stock physically in warehouse but not bookable for orders.",
    "Open", "High", "Supply Chain", "Robert", "Dunbar", "r.dunbar@barbour.com", "Email", 18,
    mkAI(80, "Data Sync", "ASN Processing", "High",
      "ASN processing failure — possibly related to the SAP goods receipt flow following the recent SAP patch.",
      "The ASN processing failure for the Portuguese shipment has been escalated. Our team is checking the SAP goods receipt integration and the Landmark WMS inbound processing queue. We will advise on the manual receipt process in parallel.",
      "2,400 units physically received but not available for fulfilment — stock availability and sales impacted.", 4)),
];

// ── FOOTASYLUM SUPPORT TEAM ───────────────────────────────────────────────────
const FOOTASYLUM: any[] = [
  tk("FA-7721", "ASOS marketplace orders not routing to OMS — 28 orders stuck",
    "ASOS marketplace orders not routing through to OMS. 28 orders from last 3 hours sitting in marketplace queue unprocessed. MuleSoft ASOS listener flow appears running but no orders being received. CloudHub logs show no incoming events from ASOS endpoint.",
    "Open", "Urgent", "Marketplace Operations", "Jordan", "Phillips", "j.phillips@footasylum.com", "Phone", 3,
    mkAI(88, "Integration", "Marketplace Listener", "Urgent",
      "ASOS listener flow receiving no events — ASOS may have changed their webhook endpoint or auth token.",
      "We have identified 28 unprocessed ASOS orders and are investigating the MuleSoft listener flow immediately. We have also contacted our ASOS account manager to check for any API configuration changes on their side.",
      "28 ASOS marketplace orders unprocessed — fulfilment SLA breaching, customer experience at risk.", 2)),

  tk("FA-7719", "Nike product feed dropping 43 Air Max SKUs from sync",
    "Nike product feed sync consistently dropping 43 SKUs from the latest Air Max range. Products exist in Nike B2B portal but not being created on FootAsylum website. Scheduler has run 4 times today with same missing SKUs. SKU mapping failure suspected in CloudHub transformation.",
    "Open", "High", "Buying Operations", "Keisha", "Thompson", "k.thompson@footasylum.com", "Email", 8,
    mkAI(74, "Data Sync", "Product Feed Mapping", "High",
      "Consistent 43 SKU drop pattern across 4 scheduler runs — deterministic mapping failure, not intermittent.",
      "We are investigating the Nike feed SKU drop and have identified a consistent set of 43 missing SKUs. The team is reviewing the CloudHub transformation logic for the Air Max category mapping. We will apply a fix in the next scheduled run.",
      "43 Air Max SKUs absent from site — potential lost sales on high-demand product range.", 4)),

  tk("FA-7717", "Returns portal not updating Manhattan WMS stock — 156 units unaccounted",
    "Customer returns processed through returns portal not updating stock levels in Manhattan WMS. Returns physically received but inventory not restocked digitally. 156 units unaccounted for across 3 days. Warehouse cannot identify which items are available for resale.",
    "Open", "High", "Returns & Warehousing", "Marcus", "Brown", "m.brown@footasylum.com", "Email", 72,
    mkAI(70, "Data Sync", "Returns Inventory", "High",
      "Returns-to-WMS sync failure — 156 units suggests the issue started at the same time as the portal upgrade.",
      "The returns portal to WMS sync failure has been escalated to our integration team. We are investigating the CloudHub returns processing flow and will trigger a manual inventory reconciliation for the 156 unaccounted units.",
      "156 units physically in warehouse but invisible to the replenishment and fulfilment systems.", 6)),

  tk("FA-7714", "Adidas feed authentication token expired — 18 hours without update",
    "Adidas product feed integration returning authentication failures. OAuth token used by Adidas API connector has expired. Adidas products not updated on website for 18 hours. Token renewal process needs to be triggered in CloudHub connector configuration.",
    "Open", "Medium", "Buying Operations", "Keisha", "Thompson", "k.thompson@footasylum.com", "Email", 20,
    mkAI(54, "Access Management", "OAuth Token Expiry", "Medium",
      "Adidas OAuth token expiry — token rotation is not automated, recurring manual renewal issue.",
      "We have identified the expired Adidas API OAuth token and are renewing it in the CloudHub connector configuration. The token rotation process will be automated to prevent recurrence. Products will be updated within 2 hours of resolution.",
      null, 3)),
];

// ── FITFLOP SUPPORT TEAM ──────────────────────────────────────────────────────
const FITFLOP: any[] = [
  tk("FF-4412", "NetSuite inventory not syncing to SFCC — 3 products oversold",
    "NetSuite inventory levels not syncing to Salesforce Commerce Cloud. Stock levels on website 6 hours out of date. 3 products already oversold today with 12 orders placed for out-of-stock items. Scheduler appears to be running but no inventory updates being published.",
    "Open", "Urgent", "eCommerce Operations", "Hannah", "Clark", "h.clark@fitflop.com", "Phone", 2,
    mkAI(90, "Data Sync", "Inventory Sync", "Urgent",
      "NetSuite to SFCC inventory sync stall — 3 oversold products confirm a systematic sync failure.",
      "We have identified the NetSuite to SFCC inventory sync failure and the 3 oversold products. The team is investigating the CloudHub inventory scheduler immediately. Impacted customers will be contacted regarding their orders.",
      "Active overselling — 12 orders placed for out-of-stock items requiring refund or delay communication.", 2)),

  tk("FF-4410", "DHL delivery estimation returning 504 on checkout",
    "DHL delivery date estimation failing on checkout with 504 timeout errors. Customers cannot see estimated delivery dates and abandoning at checkout. DHL API response time showing 8s average — significantly above the 2s integration timeout threshold.",
    "Open", "High", "Digital Platform", "Oliver", "Wright", "o.wright@fitflop.com", "Email", 5,
    mkAI(76, "Performance", "Delivery API Timeout", "High",
      "DHL API response degradation causing checkout abandonment — DHL may have a service issue.",
      "The DHL delivery estimation timeout issue has been escalated to our platform team. We are investigating whether this is a DHL-side degradation or a configuration change on our timeout thresholds. We will check the DHL status page immediately.",
      null, 4)),

  tk("FF-4408", "FitFlop Rewards points not awarded — 400 orders in 24 hours",
    "Loyalty points integration between SFCC and FitFlop Rewards platform not awarding points for any orders placed in the last 24 hours. Approximately 400 orders affected. Scheduler shows as running in CloudHub but no loyalty points events are being published. Customers complaining.",
    "Open", "High", "Customer Loyalty", "Sarah", "Bennett", "s.bennett@fitflop.com", "Email", 26,
    mkAI(72, "Integration", "Loyalty Integration", "High",
      "Loyalty points integration silent failure — scheduler running but producing no events is a connector issue.",
      "We have identified the loyalty points failure affecting 400 orders and are investigating the SFCC to Rewards platform integration. All affected orders will be retrospectively credited once the issue is resolved.",
      "400 customers have not received loyalty points — reputation and retention risk if not resolved and communicated.", 4)),
];

// ── WHITESTUFF SUPPORT TEAM ───────────────────────────────────────────────────
const WHITESTUFF: any[] = [
  tk("WS-3301", "Magento order sync to Dynamics NAV failing post-upgrade — 94 orders",
    "Following Magento 2.4.7 upgrade over the weekend, online orders not syncing to Microsoft Dynamics NAV ERP. 94 orders from today not visible in NAV. Order processing and despatch blocked for all web orders. NAV team cannot see any orders to process.",
    "Open", "High", "Platform Team", "Lucy", "Harrison", "l.harrison@whitestuff.com", "Phone", 3,
    mkAI(84, "Integration", "ERP Sync", "High",
      "Post-Magento-upgrade NAV sync failure — API contract or authentication likely changed in 2.4.7.",
      "We have identified that 94 orders are not syncing to NAV following the Magento upgrade. The team is investigating the integration endpoint changes in Magento 2.4.7. A temporary manual order import process has been initiated.",
      "All web order fulfilment blocked — 94 orders and growing. Manual processing required as interim.", 3)),

  tk("WS-3299", "Royal Mail Click and Drop API 401 — 210 orders awaiting labels",
    "Royal Mail Click and Drop API returning 401 authentication errors. Shipping labels cannot be generated for Bicester DC. 210 orders queued waiting for label generation. API credential renewal was due last week and was missed in the rotation schedule.",
    "Open", "High", "Operations", "Ben", "Crawford", "b.crawford@whitestuff.com", "Email", 6,
    mkAI(82, "Access Management", "API Auth", "High",
      "Expired API credential — Royal Mail credential rotation is not automated, recurring issue every 90 days.",
      "We are renewing the Royal Mail Click and Drop API credentials as an urgent action. The team will update the CloudHub connector configuration and process the 210 queued orders immediately upon restoration.",
      "210 orders blocked for despatch — next-day delivery SLA will breach if not resolved within 2 hours.", 3)),

  tk("WS-3296", "Salesforce product data 12 hours behind NAV master",
    "Salesforce product data is 12 hours behind NAV product master. New arrivals added to NAV this morning not visible in Salesforce for customer service team. Nightly sync not running at expected 02:00 schedule. Customer service cannot check stock for incoming product enquiries.",
    "Open", "Medium", "CRM Team", "Lucy", "Harrison", "l.harrison@whitestuff.com", "Email", 14,
    mkAI(56, "Data Sync", "CRM Product Sync", "Medium",
      "Nightly sync not running at scheduled time — CloudHub scheduler may have been disabled post-upgrade.",
      "We are investigating the Salesforce product sync delay and will check the CloudHub scheduler status. The nightly sync job will be manually triggered to bring Salesforce data up to date.",
      null, 4)),
];

// ── WHITE CUBE SUPPORT ────────────────────────────────────────────────────────
const WHITE_CUBE: any[] = [
  tk("WC-1102", "Shopify artwork sale not reaching Veevart CRM — 8 sales unrecorded",
    "Online artwork purchases through Shopify not being recorded in Veevart CRM system. Sales team not receiving notifications and no buyer records being created. 8 artwork sales from last week remain unrecorded. Collector relations team has escalated urgently.",
    "Open", "High", "Digital Operations", "Isabelle", "Fontaine", "i.fontaine@whitecube.com", "Email", 8,
    mkAI(80, "Integration", "CRM Sync", "High",
      "Shopify to Veevart CRM webhook failure — 8 unrecorded sales suggests an issue since last Tuesday.",
      "We have identified the Shopify to Veevart CRM integration failure and are investigating the webhook configuration. The 8 unrecorded artwork sales will be manually entered into the CRM while the issue is resolved.",
      "8 high-value artwork sales untracked in CRM — collector relationship management and reporting impacted.", 4)),

  tk("WC-1100", "Tracey Emin exhibition ticketing not syncing visitor data to Salesforce",
    "Visitor registration data from online ticketing system not syncing to Salesforce for the current Tracey Emin exhibition. Walk-in registrations at Mason Yard also not flowing. CRM data incomplete for exhibition attendance tracking and donor pipeline.",
    "Open", "Medium", "Events & Exhibitions", "Thomas", "Laurent", "t.laurent@whitecube.com", "Email", 32,
    mkAI(56, "Data Sync", "Ticketing Sync", "Medium",
      "Exhibition ticketing CRM sync failure — scheduler may not have been re-enabled after the gallery closure period.",
      "The ticketing to Salesforce sync for the Tracey Emin exhibition has been escalated to our integration team. We are checking the CloudHub scheduler and the Salesforce data mapping for the exhibition attendance records.",
      null, 6)),

  tk("WC-1098", "New gallery assistant Amara Osei not provisioned system access",
    "New gallery assistant Amara Osei who joined Bermondsey gallery this week has not been provisioned access to inventory management and CRM systems. The automated onboarding flow was triggered but access not granted after 2 days. She cannot perform her assigned duties.",
    "Open", "Medium", "Operations", "Isabelle", "Fontaine", "i.fontaine@whitecube.com", "Email", 48,
    mkAI(48, "Access Management", "Onboarding", "Medium",
      "Automated onboarding provisioning not completing — third similar case this quarter.",
      "We are investigating the provisioning failure for Amara Osei. The team will check the onboarding automation flow in CloudHub and the Azure AD group assignment. Access will be manually provisioned today if the automation cannot be resolved.",
      null, 4)),
];

// ── WOLVERINE SUPPORT TEAM ────────────────────────────────────────────────────
const WOLVERINE: any[] = [
  tk("WW-6621", "JOOR wholesale portal orders not importing to SAP — 34 Merrell orders",
    "Wholesale orders placed through JOOR for Merrell brand not importing into SAP. 34 B2B orders from key accounts stuck in JOOR integration queue. CloudHub JOOR connector returning field mapping error on brand_division attribute introduced in Q1 SAP configuration update.",
    "Open", "High", "Wholesale Technology", "Brian", "Kowalski", "b.kowalski@wolverineworldwide.com", "Email", 10,
    mkAI(78, "Integration", "Wholesale Portal", "High",
      "JOOR field mapping failure — SAP Q1 config introduced brand_division field not reflected in Mule transform.",
      "We are investigating the JOOR to SAP import failure for the 34 Merrell orders. The team is reviewing the brand_division field mapping in the CloudHub transformation and will apply a hotfix. Affected orders will be manually imported in parallel.",
      "34 key account wholesale orders stuck — Merrell buyer relationships at risk if not resolved today.", 4)),

  tk("WW-6619", "Saucony AW26 range missing from SAP — 47 SKUs not created",
    "Saucony AW26 range (47 SKUs) not loaded into SAP from the PLM system. PLM to SAP sync ran at 03:00 but new styles were not created. Product teams cannot process pre-season orders. Integration log shows parent product not found error for the new AW26 category.",
    "Open", "Medium", "Product Operations", "Diana", "Walsh", "d.walsh@wolverineworldwide.com", "Email", 22,
    mkAI(62, "Data Sync", "PLM-SAP Sync", "Medium",
      "PLM to SAP parent product missing — AW26 category hierarchy may not have been set up in SAP before styles were exported from PLM.",
      "We are investigating the SAP product creation failure for the Saucony AW26 range. The team is checking the parent product configuration in SAP and will liaise with the product team to ensure the category hierarchy is correctly set up.",
      null, 8)),

  tk("WW-6617", "Salesforce B2B portal provisioning not completing for 3 new retailer accounts",
    "Three new retailer accounts activated in Salesforce this week do not have B2B wholesale portal access. Automated provisioning flow not executed for new account records created since Monday. Retailers cannot place orders online.",
    "Open", "Medium", "Sales Operations", "Brian", "Kowalski", "b.kowalski@wolverineworldwide.com", "Email", 56,
    mkAI(56, "Access Management", "Portal Provisioning", "Medium",
      "Portal provisioning not triggering for new Salesforce accounts — trigger logic may have a date filter bug.",
      "We are investigating the portal access provisioning failure for the 3 new retailer accounts. The team will check the Salesforce-triggered CloudHub provisioning flow and manually provision access today.",
      null, 4)),
];

// ── FURNITURE VILLAGE ─────────────────────────────────────────────────────────
const FURNITURE_VILLAGE: any[] = [
  tk("FV-2241", "V12 Finance credit check API timeout — online checkout blocked",
    "V12 Finance credit application API timing out on checkout. Customers selecting finance payment cannot proceed. Integration returning 504 errors from the V12 endpoint. Finance available in-store but online checkout is blocked for all finance customers.",
    "Open", "Urgent", "eCommerce", "Phillip", "Montgomery", "p.montgomery@furniturevillage.co.uk", "Phone", 2,
    mkAI(88, "Performance", "Payment API Timeout", "Urgent",
      "V12 Finance API timeout — V12 may have a service degradation or our timeout threshold is too low.",
      "We have identified the V12 Finance API timeout issue and are urgently investigating. We are contacting V12 directly to check for a service degradation. An alternative payment path will be assessed while the API is unavailable.",
      "All online finance orders blocked — finance accounts for approximately 40% of online revenue.", 2)),

  tk("FV-2239", "Magento order not triggering delivery scheduling — 18 orders without dates",
    "Online orders confirmed in Magento but automated delivery scheduling request not reaching warehouse system. 18 orders today have not had delivery dates assigned. Customers calling service centre expecting delivery confirmation they have not received.",
    "Open", "High", "Operations", "Karen", "Simmons", "k.simmons@furniturevillage.co.uk", "Email", 7,
    mkAI(76, "Integration", "Order to WMS", "High",
      "Delivery scheduling trigger not firing from Magento — possible CloudHub flow listener connection dropped.",
      "We have identified 18 orders without delivery scheduling and are investigating the Magento to warehouse integration. The team is checking the CloudHub order fulfilment flow. Affected customers will be contacted manually today.",
      null, 4)),

  tk("FV-2236", "Salesforce duplicate leads from web form submissions",
    "Web enquiry form submissions creating duplicate lead records in Salesforce. Deduplication logic in MuleSoft form integration not matching existing contacts correctly. Sales advisors calling same customer multiple times. Customer experience impacted.",
    "Open", "Medium", "Sales Operations", "Phillip", "Montgomery", "p.montgomery@furniturevillage.co.uk", "Email", 30,
    mkAI(52, "Data Sync", "Lead Deduplication", "Medium",
      "Deduplication matching failure — form integration may be using email only, missing phone number match.",
      "The Salesforce lead deduplication issue has been escalated to our CRM integration team. We are reviewing the matching criteria in the CloudHub form-to-Salesforce flow and will update the logic to prevent duplicate creation.",
      null, 8)),
];

// ── HOSPITALITY (shared base — Harbour Hotels / Millennium / Village / Yotel) ─
const HOSPITALITY_TICKETS = (clientName: string, domain: string): any[] => [
  tk(`HT-${Math.floor(Math.random() * 9000 + 1000)}`,
    "Opera PMS to SiteMinder channel sync not updating availability",
    "Room availability updates made in Opera PMS not being reflected on OTAs via SiteMinder. Booking.com and Expedia showing incorrect availability — 3 room types appear fully booked but have available inventory. Risk of lost bookings and overbooking simultaneously.",
    "Open", "Urgent", "Revenue Management", "Sophie", "Winters", `s.winters@${domain}`, "Phone", 2,
    mkAI(88, "Data Sync", "Channel Sync", "Urgent",
      "Opera to SiteMinder sync stall — similar issue occurred during a previous PMS update.",
      "We have identified the Opera to SiteMinder channel sync failure and are urgently investigating. The revenue management team has been alerted. Manual availability updates will be applied to OTAs as an interim measure.",
      "Incorrect availability on OTAs — simultaneous risk of lost bookings and overbooking.", 2)),

  tk(`HT-${Math.floor(Math.random() * 9000 + 1000)}`,
    "Booking.com API 401 errors — reservation feed stopped for 4 hours",
    "Booking.com API integration returning 401 authentication errors. No new reservations received from Booking.com in the last 4 hours. API credentials appear to have expired. Booking.com admin console shows connection as inactive.",
    "Open", "High", "Online Distribution", "Marcus", "Reid", `m.reid@${domain}`, "Email", 4,
    mkAI(82, "Access Management", "API Authentication", "High",
      "Booking.com API credential expiry — credentials are not auto-renewed, manual process has failed.",
      "We are renewing the Booking.com API credentials as an urgent priority. The team will update the CloudHub connector and restore the reservation feed. Reservations received during the outage will be manually imported.",
      "4 hours of Booking.com reservations not received — potential lost bookings during peak window.", 3)),

  tk(`HT-${Math.floor(Math.random() * 9000 + 1000)}`,
    "Group booking enquiries not routing to reservations team in Salesforce",
    "Group booking enquiry forms submitted through website not routing to reservations team in Salesforce. Form-to-CRM integration has not delivered any group enquiries since yesterday morning. 6 potential group bookings may have been missed.",
    "Open", "Medium", "Group Sales", "Sophie", "Winters", `s.winters@${domain}`, "Email", 28,
    mkAI(62, "Integration", "CRM Form Integration", "Medium",
      "Group enquiry routing failure — webhook endpoint may have changed after the website update.",
      "We are investigating the group booking enquiry routing failure. The team will check the web form to Salesforce integration and attempt to recover any enquiries submitted since yesterday.",
      null, 4)),
];

// ── BEDROCK ────────────────────────────────────────────────────────────────────
const BEDROCK: any[] = [
  tk("BD-0441", "API gateway rate limiting affecting all downstream microservices",
    "API gateway rate limiting is being triggered across all downstream services following a traffic spike. Multiple microservices returning 429 errors. The rate limiting configuration was not updated after the latest infrastructure scaling exercise.",
    "Open", "High", "Platform Engineering", "Nathan", "Cole", "n.cole@bedrock.com", "Email", 3,
    mkAI(80, "Performance", "Rate Limiting", "High",
      "Rate limit threshold unchanged after infrastructure scaling — a known configuration debt item.",
      "We have identified the API gateway rate limiting issue and are reviewing the threshold configuration. The team will update the rate limits to reflect the increased traffic capacity.",
      null, 3)),

  tk("BD-0439", "Kafka consumer lag exceeding 50,000 messages on order events topic",
    "Kafka consumer lag on the order-events topic has exceeded 50,000 messages. Consumer group is not processing messages at the expected rate. Downstream order fulfilment and inventory services are receiving delayed data.",
    "Open", "High", "Data Platform", "Nathan", "Cole", "n.cole@bedrock.com", "Email", 6,
    mkAI(76, "Performance", "Message Queue Lag", "High",
      "Kafka consumer lag escalating — consumer group may have lost a partition or been rebalanced incorrectly.",
      "The Kafka consumer lag has been escalated to our data platform team. We are investigating the consumer group health and will review partition assignment and consumer throughput configuration.",
      null, 4)),
];

// ── FASTMARKETS ───────────────────────────────────────────────────────────────
const FASTMARKETS: any[] = [
  tk("FM-1881", "LME price feed latency exceeding 2s SLA — commodity data delayed",
    "London Metal Exchange price feed latency has exceeded the 2-second SLA. Commodity price data is being delayed for premium subscribers. The feed processing scheduler is running but data transformation is taking longer than expected following a schema change in the LME feed.",
    "Open", "Urgent", "Data Operations", "Richard", "Hartley", "r.hartley@fastmarkets.com", "Phone", 1,
    mkAI(91, "Performance", "Data Feed Latency", "Urgent",
      "LME feed schema change causing transformation slowdown — new fields are not being efficiently parsed.",
      "We have identified the LME price feed latency issue and are investigating the CloudHub data transformation performance. A hotfix to optimise the new field processing will be deployed as an emergency change.",
      "Real-time commodity pricing SLA breach — premium subscribers receiving stale data, regulatory risk.", 1)),

  tk("FM-1879", "Market data API authentication failing for 12 premium subscriber accounts",
    "12 premium subscriber accounts unable to authenticate with the market data API. Authentication service returning 401 errors for these accounts. Account tokens appear to have been invalidated following the security patch deployed yesterday.",
    "Open", "High", "Subscriber Services", "Claire", "Foster", "c.foster@fastmarkets.com", "Email", 8,
    mkAI(78, "Access Management", "Subscriber Authentication", "High",
      "Security patch invalidated premium subscriber tokens — token migration was not completed before patch.",
      "We are investigating the authentication failure for the 12 premium subscriber accounts. The team will check the impact of yesterday's security patch on active tokens and will issue replacement tokens to affected subscribers.",
      null, 3)),
];

// ── LLOYDS CLINICAL ───────────────────────────────────────────────────────────
const LLOYDS_CLINICAL: any[] = [
  tk("LC-0992", "Patient data sync between clinical system and patient portal delayed 4 hours",
    "Patient data sync between the clinical records system and the patient portal is running 4 hours behind. Patients cannot see their latest test results and appointment information. The sync scheduler appears to be running but record counts show a significant backlog.",
    "Open", "High", "Clinical Systems", "Dr. James", "Morrison", "j.morrison@lloydsclinical.com", "Email", 5,
    mkAI(82, "Data Sync", "Patient Data Sync", "High",
      "Patient portal sync delay recurring — scheduler throughput may be insufficient for current patient volume.",
      "We have identified the patient data sync delay and are urgently investigating the scheduler throughput. Patient safety has been assessed and clinical operations are not impacted by the delay.",
      "4-hour patient data delay — patients cannot see recent test results. Regulatory notification may be required.", 3)),

  tk("LC-0990", "New clinician Dr. Patel not provisioned access to clinical systems",
    "New clinician Dr. Ananya Patel who joined last week has not been provisioned access to the clinical records system, prescribing platform, and lab results portal. HR submitted an onboarding request but the automated provisioning flow has not completed.",
    "Open", "High", "IT Access Management", "Laura", "Chen", "l.chen@lloydsclinical.com", "Email", 120,
    mkAI(76, "Access Management", "Clinician Provisioning", "High",
      "Clinical onboarding provisioning failure — a new joiner without system access is a patient safety concern.",
      "We are treating the provisioning failure for Dr. Patel as a high-priority issue. The automated onboarding flow will be investigated and manual access will be granted immediately for the critical clinical systems.",
      "Clinician without system access for 5 days — patient safety and regulatory compliance risk.", 4)),
];

// ── MANAGED SERVICES SUPPORT (generic fallback) ───────────────────────────────
const MANAGED_SERVICES: any[] = [
  tk("MS-5501", "Integration flow timeout on nightly batch processing",
    "Nightly batch processing integration flow timing out before completion. CloudHub scheduler running but the batch job is not completing within the allocated window. Data sync between source and destination systems is incomplete.",
    "Open", "High", "Managed Services", "Support", "Engineer", "support@synapse.com", "Email", 8,
    mkAI(74, "Integration", "Batch Timeout", "High",
      "Nightly batch timeout recurring — data volume growth may have exceeded the current CloudHub worker capacity.",
      "We have identified the nightly batch timeout issue and are reviewing the CloudHub worker configuration and batch processing throughput. We will provide an update within 4 hours.",
      null, 4)),

  tk("MS-5499", "API connectivity lost between integration platform and ERP",
    "API connectivity between the MuleSoft integration platform and the ERP system has been lost. CloudHub logs show connection refused errors since 06:00. ERP team confirmed no maintenance window was scheduled.",
    "Open", "Urgent", "Managed Services", "Support", "Engineer", "support@synapse.com", "Email", 4,
    mkAI(86, "Integration", "ERP Connectivity", "Urgent",
      "ERP connectivity loss without maintenance window — possible network or credentials issue.",
      "We have identified the connectivity loss between MuleSoft and the ERP and are investigating the network path and API credentials. The ERP team has been engaged to check their endpoint status.",
      "All ERP-dependent integration flows blocked — data sync halted across all connected systems.", 2)),

  tk("MS-5496", "New team member not provisioned integration platform access",
    "A new team member who joined this week has not been provisioned access to the integration platform, CloudHub, and monitoring tools. The automated onboarding provisioning has not completed after 3 days.",
    "Open", "Medium", "Managed Services", "Support", "Engineer", "support@synapse.com", "Email", 72,
    mkAI(52, "Access Management", "Onboarding", "Medium",
      "Provisioning automation not completing — recurring issue affecting new joiners to the integration team.",
      "We are investigating the onboarding provisioning failure for the new team member. Access will be manually provisioned to critical tools today while the automation is investigated.",
      null, 4)),
];

// ── SENIOR MANAGEMENT / SUPPORT DESK MANAGER (exec overview) ─────────────────
const EXEC_OVERVIEW: any[] = [
  tk("EX-0101", "Cross-client SLA report not generated for Q2 governance review",
    "The automated Q2 SLA governance report has not been generated for the executive team review scheduled tomorrow. The report generation scheduler ran but produced an empty output. Data from 12 client integrations was expected.",
    "Open", "High", "Governance", "Director", "Operations", "ops.director@synapse.com", "Email", 6,
    mkAI(72, "Integration", "Report Generation", "High",
      "Governance report generation failure — scheduler may have a data source connectivity issue.",
      "We have identified the Q2 SLA report generation failure and are investigating the data source connections for all 12 client integrations. A manual report will be prepared as a contingency for tomorrow's review.",
      "Executive governance review scheduled for tomorrow — report failure will delay board-level reporting.", 4)),
];

// ── EXPORT MAP ────────────────────────────────────────────────────────────────
export const PROJECT_TICKETS: Record<string, any[]> = {
  "Mulberry Support Team":      MULBERRY,
  "Wren Kitchens":              WREN,
  "Fenwick Support Team":       FENWICK,
  "Harvey Nichols":             HARVEY_NICHOLS,
  "Clarks Support Team":        CLARKS,
  "Barbour Support":            BARBOUR,
  "FootAsylum Support Team":    FOOTASYLUM,
  "FitFlop Support Team":       FITFLOP,
  "WhiteStuff Support Team":    WHITESTUFF,
  "White Cube Support":         WHITE_CUBE,
  "Wolverine-Support Team":     WOLVERINE,
  "Furniture Village":          FURNITURE_VILLAGE,
  "Harbour Hotels":             HOSPITALITY_TICKETS("Harbour Hotels",    "harbourhotels.co.uk"),
  "Millennium Hotels":          HOSPITALITY_TICKETS("Millennium Hotels", "millenniumhotels.com"),
  "Village Hotels":             HOSPITALITY_TICKETS("Village Hotels",    "villagehotels.co.uk"),
  "Yotel Support team":         HOSPITALITY_TICKETS("Yotel",            "yotel.com"),
  "Bedrock":                    BEDROCK,
  "FastMarkets":                FASTMARKETS,
  "Lloyds Clinical":            LLOYDS_CLINICAL,
  "Managed Services Support":   MANAGED_SERVICES,
  "Senior Management":          EXEC_OVERVIEW,
  "Support Desk Manager":       EXEC_OVERVIEW,
  "Technical Team Lead":        MANAGED_SERVICES,
  "Support Engineer":           MANAGED_SERVICES,
  "Support Engineers1":         MANAGED_SERVICES,
  "Jewells Support":            MANAGED_SERVICES,
  "LornaJane Support":          MANAGED_SERVICES,
};
