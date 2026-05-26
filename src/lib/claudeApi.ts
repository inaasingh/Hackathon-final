// All AI calls go to the local Express backend at port 3001
const BACKEND = "http://localhost:3001";

// ── Fallback responses (used when backend is offline) ─────────────
const FALLBACK_IMPACT = `WHAT CHANGED
MuleSoft retry policy on Order API was updated — p95 latency now exceeding 1.8s SLA threshold.

BUSINESS IMPACT
Downstream services including Inventory Sync and Pricing Engine are experiencing cascading delays. Customer-facing checkout flows may see increased timeout errors during peak hours.

IMPACTED DOCUMENTS
- LLD (Order API): Update timeout and retry configuration diagrams
- Runbook: Add SLA breach escalation steps for on-call engineers

RECOMMENDED ACTION
• Roll back MuleSoft retry count to previous value (2 retries) immediately
• Notify governance lead and schedule emergency change window
• Regenerate LLD for Order API and re-run integration test suite

RISK LEVEL: CRITICAL`;

const FALLBACK_GOV = `EXECUTIVE SUMMARY
The Retail Integration Platform recorded 47 change events this week. Critical alerts on Order API and MuleSoft Runtime require immediate governance attention. Overall platform health stands at 94.3%, marginally below the 95% SLA target.

RAG STATUS: AMBER
Reason: One critical SLA breach on Order API unresolved; two warning-level issues pending owner assignment.

KEY HIGHLIGHTS
• MuleSoft Runtime maintained 99.99% uptime despite configuration changes
• Azure DevOps successfully delivered Release-147 with zero rollbacks
• Governance documentation auto-generated for 128 artefacts this week

RISKS AND ISSUES
- Order API SLA breach (Owner: Platform Team | Mitigation: Rollback retry policy, monitor 24h)
- CRM Sync latency degradation (Owner: Integration Lead | Mitigation: Scale horizontally)

NEXT WEEK PRIORITIES
1. Resolve Order API SLA breach and validate fix in production
2. Complete overdue governance document reviews
3. Onboard Salesforce connector health monitoring to the dashboard

LEADERSHIP RECOMMENDATION
The platform is stable but requires focused attention on Order API reliability before the Q2 client review.`;

const FALLBACK_WEEKLY = `DELIVERY STATUS SUMMARY — AMBER
Platform health at 94.3%. One SLA breach on Order API under active investigation.

COMPLETED WORK
✓ Release-147 deployed to production (Retail Order API)
✓ MuleSoft Runtime configuration updated and validated
✓ 128 governance documents auto-generated via AI pipeline
✓ Inventory Sync migration completed with 99.98% uptime

IN PROGRESS
→ Order API SLA breach root cause analysis
→ CRM Sync latency optimisation (scaling review)

BLOCKERS AND RISKS
⚠ Order API p95 latency 1.8s vs 800ms SLA target — needs rollback decision by EOD
⚠ Salesforce Connector error rate at 3.8% — may impact CRM data sync reliability

METRICS SUMMARY
- Changes this week: 47 (+12%)
- Documents generated: 128 (+24%)
- Governance health: 94.3% (+1.2%)
- Critical alerts: 2`;

const FALLBACK_ZOHO = `ZOHO DESK — SUPPORT REPORT
(Backend offline — showing sample data)

EXECUTIVE SUMMARY
Support operations are stable this period with a healthy resolution rate across all teams. Two departments are showing elevated open ticket volumes that warrant attention before end of week.

RAG STATUS: AMBER

KEY METRICS
- Total tickets: 87
- Open: 24
- Pending / On Hold: 11
- Resolved / Closed: 52
- Critical / Urgent: 8
- Resolution rate: 60%

TOP ISSUES THIS PERIOD
• Login and access issues remain the highest-volume category across teams
• VPN connectivity requests spiked this week — likely related to the network change window
• Integration sync failures reported by 3 teams — may be related to the MuleSoft config change

RECOMMENDATIONS
• Assign dedicated triage resource to Barbour Support and Wren Kitchens — both showing 10+ open tickets
• Create a self-service KB article for VPN setup to reduce repeat tickets
• Escalate integration sync failures to platform team for root cause review`;

// ── Core backend call ─────────────────────────────────────────────
async function callBackend(endpoint: string, body: object): Promise<string> {
  try {
    const res = await fetch(`${BACKEND}${endpoint}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.text ?? data.report ?? "";
  } catch (e) {
    console.warn(`[Backend ${endpoint}] unavailable:`, e);
    return "";
  }
}

// ── Public exports ────────────────────────────────────────────────

export async function generateImpactAnalysis(event: any): Promise<string> {
  const result = await callBackend("/analyze", { type: "impact", event });
  return result || FALLBACK_IMPACT;
}

export async function generateGovernanceReport(events: any[]): Promise<string> {
  const result = await callBackend("/analyze", { type: "governance", events });
  return result || FALLBACK_GOV;
}

export async function generateWeeklyReport(events: any[]): Promise<string> {
  const result = await callBackend("/analyze", { type: "weekly", events });
  return result || FALLBACK_WEEKLY;
}

export async function generateZohoReport(): Promise<{ report: string; stats: any; usedMock: boolean }> {
  try {
    const res = await fetch(`${BACKEND}/zoho/report`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      report: data.report || FALLBACK_ZOHO,
      stats: data.stats ?? null,
      usedMock: data.usedMock ?? true,
    };
  } catch {
    return { report: FALLBACK_ZOHO, stats: null, usedMock: true };
  }
}
