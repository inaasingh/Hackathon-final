export const mockEvents = [
  {
    sev: "critical",
    source: "MuleSoft",
    id: "MULE-2391",
    svc: "Order API",
    summary: "SLA breach detected — p95 latency 1.8s",
    conf: 96,
    ts: "12s",
    docs: ["LLD", "Runbook"],
  },

  {
    sev: "warning",
    source: "Jira",
    id: "JIRA-8821",
    svc: "Pricing Engine",
    summary: "Retry logic updated for downstream timeouts",
    conf: 88,
    ts: "1m",
    docs: ["TDD"],
  },

  {
    sev: "success",
    source: "Azure",
    id: "ADO-4501",
    svc: "Inventory Sync",
    summary: "Deployment completed successfully",
    conf: 99,
    ts: "3m",
    docs: ["Release"],
  },

  {
    sev: "info",
    source: "Zoho",
    id: "ZOHO-672",
    svc: "Contract Vault",
    summary: "Governance risk score recalculated",
    conf: 91,
    ts: "8m",
    docs: ["GovDeck"],
  },
];