/**
 * zohoReportPdf.ts
 * Generates a professional PDF report from mock Zoho Desk ticket data.
 * No real Zoho API needed — uses the same mock data shown in the dashboard.
 */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  dept: string;
  assignee: string;
  age: string;
}

// ── Colours — matching ABL company template ───────────────────────────────────
// Source: Mulberry-Governance-Report-(February 2026).pptx theme colours
const C = {
  dark:       [ 25,  23,  35] as [number,number,number],  // #191723 — ABL dark bg
  navy:       [  0,  32,  96] as [number,number,number],  // #002060 — ABL navy accent
  light:      [243, 242, 255] as [number,number,number],  // #F3F2FF — ABL light bg
  lightAlt:   [234, 233, 251] as [number,number,number],  // #EAE9FB — table alt row
  lavender:   [198, 193, 247] as [number,number,number],  // #C6C1F7 — periwinkle
  teal:       [ 82, 183, 136] as [number,number,number],  // #52B788 — healthy/resolved
  amber:      [240, 165,   0] as [number,number,number],  // #F0A500 — warning
  red:        [224,  92,  92] as [number,number,number],  // #E05C5C — critical
  muted:      [143, 137, 153] as [number,number,number],  // #8F8F9A
  white:      [255, 255, 255] as [number,number,number],
  offwhite:   [248, 246, 255] as [number,number,number],
  border:     [208, 204, 235] as [number,number,number],
  // Keep purple for badge/pill elements
  purple:     [124, 110, 245] as [number,number,number],
  purpleLight:[237, 232, 255] as [number,number,number],
};

// ── Priority / Status colour helpers ─────────────────────────────────────────
function priorityColor(p: string): [number,number,number] {
  if (p === "Urgent") return C.red;
  if (p === "High")   return C.amber;
  if (p === "Medium") return C.purple;
  return C.teal;
}
function statusColor(s: string): [number,number,number] {
  if (s === "Open")    return C.red;
  if (s === "On Hold") return C.amber;
  return C.teal;
}

// ── Main export ───────────────────────────────────────────────────────────────
export function generateZohoReport(tickets: Ticket[]): void {
  const doc   = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const PW    = doc.internal.pageSize.getWidth();   // 210
  const PH    = doc.internal.pageSize.getHeight();  // 297
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  // ── Stats ────────────────────────────────────────────────────────────────
  const total    = tickets.length;
  const open     = tickets.filter(t => t.status === "Open").length;
  const onHold   = tickets.filter(t => t.status === "On Hold").length;
  const resolved = tickets.filter(t => t.status === "Resolved").length;
  const urgent   = tickets.filter(t => t.priority === "Urgent").length;
  const high     = tickets.filter(t => t.priority === "High").length;

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 1
  // ══════════════════════════════════════════════════════════════════════════

  // ── Header banner (ABL dark theme — matches PPTX cover) ─────────────────
  doc.setFillColor(...C.dark);
  doc.rect(0, 0, PW, 42, "F");

  // ABL navy accent stripe (matches PPTX section marker colour)
  doc.setFillColor(...C.navy);
  doc.rect(0, 0, 5, 42, "F");

  // Company name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...C.white);
  doc.text("AbsoluteLabs", 14, 16);

  // Sub-label
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.lavender);
  doc.text("ABSOLUTE RETAIL CONSULTING LTD  ·  SYNAPSE PLATFORM", 14, 22);

  // Report title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...C.white);
  doc.text("Zoho Desk Support Report", 14, 33);

  // Date (right-aligned)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text(today, PW - 14, 16, { align: "right" });
  doc.text("Generated automatically by Synapse", PW - 14, 22, { align: "right" });

  // DEMO badge
  doc.setFillColor(...C.amber);
  doc.roundedRect(PW - 30, 28, 18, 7, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...C.dark);
  doc.text("DEMO DATA", PW - 21, 33, { align: "center" });

  let y = 52;

  // ── Section: Executive Summary ────────────────────────────────────────────
  // Small navy square marker (matches PPTX slide layout)
  doc.setFillColor(...C.navy);
  doc.rect(14, y - 5, 3, 10, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.navy);
  doc.text("EXECUTIVE SUMMARY", 20, y);

  doc.setDrawColor(...C.navy);
  doc.setLineWidth(0.3);
  doc.line(20, y + 2, 100, y + 2);
  y += 8;

  const summaryText =
    `Platform support activity for the last 7 days shows ${total} tickets across 4 departments. ` +
    `${urgent} urgent and ${high} high-priority items require immediate attention. ` +
    `${resolved} tickets have been resolved within SLA. ` +
    `Overall governance health is rated AMBER — proactive action recommended on open Order API and MuleSoft issues. ` +
    `This report was auto-generated by the AbsoluteLabs Synapse AI platform.`;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.muted);
  const summaryLines = doc.splitTextToSize(summaryText, PW - 28);
  doc.text(summaryLines, 14, y);
  y += summaryLines.length * 5 + 6;

  // RAG status box
  doc.setFillColor(255, 247, 230);
  doc.roundedRect(14, y, PW - 28, 10, 2, 2, "F");
  doc.setDrawColor(...C.amber);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, y, PW - 28, 10, 2, 2, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...C.amber);
  doc.text("⚠  RAG STATUS: AMBER  —  1 urgent issue unresolved · 2 tickets past SLA deadline", 20, y + 6.5);
  y += 16;

  // ── Section: Key Metrics ──────────────────────────────────────────────────
  doc.setFillColor(...C.navy);
  doc.rect(14, y - 5, 3, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.navy);
  doc.text("KEY METRICS", 20, y);
  doc.setDrawColor(...C.navy);
  doc.setLineWidth(0.3);
  doc.line(20, y + 2, 70, y + 2);
  y += 8;

  // 5 stat boxes in a row
  const statW   = (PW - 28 - 16) / 5;
  const statH   = 22;
  const stats = [
    { label: "Total Tickets", value: String(total),    color: C.purple },
    { label: "Open",          value: String(open),     color: C.red    },
    { label: "On Hold",       value: String(onHold),   color: C.amber  },
    { label: "Resolved",      value: String(resolved), color: C.teal   },
    { label: "Urgent",        value: String(urgent),   color: C.red    },
  ];

  stats.forEach((s, i) => {
    const x = 14 + i * (statW + 4);
    doc.setFillColor(s.color[0], s.color[1], s.color[2]);
    // thin top bar
    doc.rect(x, y, statW, 2, "F");
    // box
    doc.setFillColor(...C.offwhite);
    doc.rect(x, y + 2, statW, statH - 2, "F");
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.2);
    doc.rect(x, y + 2, statW, statH - 2, "S");
    // value
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(s.color[0], s.color[1], s.color[2]);
    doc.text(s.value, x + statW / 2, y + 14, { align: "center" });
    // label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    doc.text(s.label, x + statW / 2, y + 20, { align: "center" });
  });
  y += statH + 8;

  // ── Section: Priority Breakdown ───────────────────────────────────────────
  const priorities = ["Urgent","High","Medium","Low"];
  const pCounts = priorities.map(p => tickets.filter(t => t.priority === p).length);

  doc.setFillColor(...C.navy);
  doc.rect(14, y - 5, 3, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.navy);
  doc.text("PRIORITY BREAKDOWN", 20, y);
  doc.setDrawColor(...C.navy);
  doc.setLineWidth(0.3);
  doc.line(20, y + 2, 88, y + 2);
  y += 8;

  priorities.forEach((p, i) => {
    const cnt = pCounts[i];
    const pct = total > 0 ? cnt / total : 0;
    const col = priorityColor(p);
    const barW = (PW - 28 - 55) * pct;

    // Label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C.dark);
    doc.text(p, 14, y + 3.5);

    // Count badge
    doc.setFillColor(col[0], col[1], col[2]);
    doc.roundedRect(38, y - 0.5, 10, 5.5, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...C.white);
    doc.text(String(cnt), 43, y + 3.5, { align: "center" });

    // Bar track
    doc.setFillColor(...C.border);
    doc.roundedRect(52, y + 1, PW - 28 - 55, 3, 1, 1, "F");

    // Bar fill
    if (barW > 0) {
      doc.setFillColor(col[0], col[1], col[2]);
      doc.roundedRect(52, y + 1, barW, 3, 1, 1, "F");
    }

    // Pct
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    doc.text(`${Math.round(pct * 100)}%`, PW - 14, y + 3.5, { align: "right" });

    y += 9;
  });
  y += 4;

  // ── Section: Ticket Table ─────────────────────────────────────────────────
  doc.setFillColor(...C.navy);
  doc.rect(14, y - 5, 3, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.navy);
  doc.text("RECENT TICKETS", 20, y);
  doc.setDrawColor(...C.navy);
  doc.setLineWidth(0.3);
  doc.line(20, y + 2, 80, y + 2);
  y += 6;

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [["Ticket ID", "Subject", "Status", "Priority", "Department", "Assignee", "Age"]],
    body: tickets.map(t => [t.id, t.subject, t.status, t.priority, t.dept, t.assignee, t.age]),
    headStyles: {
      fillColor: C.navy,
      textColor: C.white,
      fontStyle: "bold",
      fontSize: 7.5,
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 7,
      cellPadding: 2.5,
      textColor: C.dark,
    },
    columnStyles: {
      0: { cellWidth: 18, fontStyle: "bold" },
      1: { cellWidth: 60 },
      2: { cellWidth: 16, halign: "center" },
      3: { cellWidth: 16, halign: "center" },
      4: { cellWidth: 32 },
      5: { cellWidth: 22 },
      6: { cellWidth: 14, halign: "center" },
    },
    alternateRowStyles: { fillColor: C.lightAlt },
    didParseCell: (data) => {
      // Colour-code Status column
      if (data.column.index === 2 && data.section === "body") {
        const val = String(data.cell.raw);
        const col = statusColor(val);
        data.cell.styles.textColor   = col;
        data.cell.styles.fontStyle   = "bold";
      }
      // Colour-code Priority column
      if (data.column.index === 3 && data.section === "body") {
        const val = String(data.cell.raw);
        const col = priorityColor(val);
        data.cell.styles.textColor   = col;
        data.cell.styles.fontStyle   = "bold";
      }
    },
    tableLineColor: C.border,
    tableLineWidth: 0.2,
  });

  // ── Page 2: AI Summary & Recommendations ─────────────────────────────────
  doc.addPage();

  // Page 2 header strip (ABL dark + navy stripe)
  doc.setFillColor(...C.dark);
  doc.rect(0, 0, PW, 20, "F");
  doc.setFillColor(...C.navy);
  doc.rect(0, 0, 5, 20, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.white);
  doc.text("AbsoluteLabs Synapse  ·  Zoho Desk Report  ·  AI Analysis", 14, 13);

  y = 30;

  // AI Generated Summary
  doc.setFillColor(...C.navy);
  doc.rect(14, y - 5, 3, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.navy);
  doc.text("AI-GENERATED ANALYSIS", 20, y);
  doc.setDrawColor(...C.navy);
  doc.setLineWidth(0.3);
  doc.line(20, y + 2, 95, y + 2);
  y += 8;

  // AI badge (using ABL light lavender)
  doc.setFillColor(...C.lightAlt);
  doc.roundedRect(20, y, 32, 6, 1.5, 1.5, "F");
  doc.setDrawColor(...C.navy);
  doc.setLineWidth(0.2);
  doc.roundedRect(20, y, 32, 6, 1.5, 1.5, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...C.navy);
  doc.text("✦  CLAUDE AI  ·  POWERED", 36, y + 4, { align: "center" });
  y += 10;

  const aiSections = [
    {
      title: "What the Data Shows",
      body:
        "Support volume over the last 7 days reflects elevated pressure on Platform Engineering and Integration Operations. " +
        "The Order API 504 Gateway Timeout (ZD-4821) is the highest-priority open item and is currently causing cascading " +
        "downstream effects on checkout flows. The MuleSoft Payment Gateway circuit breaker trip (ZD-4819) is linked to " +
        "the same root cause and should be resolved concurrently. Governance documentation gaps (ZD-4815) risk delaying " +
        "the Q2 compliance review.",
    },
    {
      title: "Business Impact",
      body:
        "2 Urgent/High tickets directly affect customer-facing checkout and payment flows. If unresolved within 4 hours, " +
        "estimated SLA breach risk rises to 87%. CRM sync latency (ZD-4817) is on hold but poses a risk to sales pipeline " +
        "visibility. Inventory SKU discrepancy (ZD-4813) may affect stock accuracy in downstream reporting systems.",
    },
    {
      title: "Recommended Actions",
      body:
        "1. IMMEDIATE: Escalate ZD-4821 (Order API) to on-call Platform Engineering — initiate rollback of MuleSoft retry policy.\n" +
        "2. SAME DAY: Resolve ZD-4819 (Payment Gateway) in parallel — circuit breaker reset required.\n" +
        "3. TODAY: Assign ZD-4817 (CRM Sync) to integration lead and schedule scaling review.\n" +
        "4. THIS WEEK: Complete governance documentation (ZD-4815) before Q2 compliance deadline.\n" +
        "5. MONITOR: ZD-4796 (HubSpot sync) low priority but flag for next sprint review.",
    },
    {
      title: "Governance Recommendation",
      body:
        "Schedule an emergency platform review checkpoint within 24 hours focused on Order API and Payment Gateway. " +
        "Auto-generate updated Change Request and Runbook documents via Synapse once the fix is validated in staging. " +
        "Notify governance lead and delivery manager via Slack digest. Publish updated platform health status to the " +
        "leadership dashboard before end of business today.",
    },
  ];

  aiSections.forEach(section => {
    // Section title (ABL navy)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...C.navy);
    doc.text(section.title.toUpperCase(), 20, y);
    y += 5;

    // Section body
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.dark);
    const lines = doc.splitTextToSize(section.body, PW - 34);
    doc.text(lines, 20, y);
    y += lines.length * 4.8 + 6;
  });

  // ── Dept summary table ─────────────────────────────────────────────────────
  doc.setFillColor(...C.navy);
  doc.rect(14, y - 5, 3, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.navy);
  doc.text("TICKETS BY DEPARTMENT", 20, y);
  doc.setDrawColor(...C.navy);
  doc.setLineWidth(0.3);
  doc.line(20, y + 2, 96, y + 2);
  y += 6;

  const depts = [...new Set(tickets.map(t => t.dept))];
  const deptRows = depts.map(d => {
    const dTickets = tickets.filter(t => t.dept === d);
    const urgentCount = dTickets.filter(t => t.priority === "Urgent" || t.priority === "High").length;
    return [d, String(dTickets.length), String(urgentCount), String(dTickets.filter(t => t.status === "Resolved").length)];
  });

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [["Department", "Total", "Urgent/High", "Resolved"]],
    body: deptRows,
    headStyles: {
      fillColor: C.navy,
      textColor: C.white,
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: 3,
    },
    bodyStyles: { fontSize: 8, cellPadding: 2.5, textColor: C.dark },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 25, halign: "center" },
      2: { cellWidth: 30, halign: "center" },
      3: { cellWidth: 25, halign: "center" },
    },
    alternateRowStyles: { fillColor: C.lightAlt },
    tableLineColor: C.border,
    tableLineWidth: 0.2,
  });

  // ── Footer on all pages ───────────────────────────────────────────────────
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(...C.dark);
    doc.rect(0, PH - 12, PW, 12, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    doc.text(
      "© 2026 Absolute Retail Consulting LTD. All Rights Reserved.  ·  Auto-generated by Synapse AI Platform.",
      14,
      PH - 5,
    );
    doc.text(`Page ${p} of ${totalPages}`, PW - 14, PH - 5, { align: "right" });
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const filename = `zoho-desk-report-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
