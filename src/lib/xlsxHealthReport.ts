/**
 * xlsxHealthReport.ts
 * Generates a multi-sheet XLSX health check report matching the company template:
 * Sheet 1: Preliminary Check  |  Sheet 2: API Info  |  Sheet 3: Scheduler Status
 * Sheet 4: Major Alerts       |  Sheet 5: Connector Version  |  Sheet 6: Highlights
 */
import * as XLSX from "xlsx";
import {
  PRELIMINARY_CHECK, MULESOFT_APIS, MULESOFT_SCHEDULERS,
  MULESOFT_ALERTS, CONNECTOR_VERSIONS, WEEKLY_HIGHLIGHTS,
} from "@/data/mockIntegrationData";
import { PROJECT_HEALTH_DATA, DEFAULT_PROJECT_HEALTH } from "@/data/projectHealthData";

// ── Colour helpers (XLSX ARGB format: FF + hex) ───────────────────────────────
const DARK_BG   = "FF191723";  // ABL dark
const NAVY      = "FF002060";  // ABL navy accent
const LIGHT_BG  = "FFF3F2FF";  // ABL light lavender
const GREEN     = "FF00B050";  // Yes / Started
const RED_BG    = "FFFF4444";  // No / Failed
const GREY_BG   = "FFD9D9D9";  // N/A
const AMBER_BG  = "FFFFF0CC";  // Warning
const WHITE     = "FFFFFFFF";
const BLACK     = "FF000000";
const NAVY_FG   = "FF002060";
const LIGHT_FG  = "FFF3F2FF";
const MUTED     = "FF8F8F9A";

function headerStyle(bgColor = DARK_BG, fgColor = LIGHT_FG, bold = true) {
  return {
    fill:      { fgColor: { rgb: bgColor }, patternType: "solid" },
    font:      { bold, color: { rgb: fgColor }, sz: 11, name: "Calibri" },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: {
      top:    { style: "medium", color: { rgb: BLACK } },
      bottom: { style: "medium", color: { rgb: BLACK } },
      left:   { style: "thin",   color: { rgb: BLACK } },
      right:  { style: "thin",   color: { rgb: BLACK } },
    },
  };
}

function cellStyle(bgColor = WHITE, fgColor = BLACK, bold = false, align = "left") {
  return {
    fill:      { fgColor: { rgb: bgColor }, patternType: "solid" },
    font:      { bold, color: { rgb: fgColor }, sz: 10, name: "Calibri" },
    alignment: { horizontal: align, vertical: "center", wrapText: true },
    border: {
      top:    { style: "thin", color: { rgb: "FFD0D0D0" } },
      bottom: { style: "thin", color: { rgb: "FFD0D0D0" } },
      left:   { style: "thin", color: { rgb: "FFD0D0D0" } },
      right:  { style: "thin", color: { rgb: "FFD0D0D0" } },
    },
  };
}

function statusStyle(val: string) {
  if (val === "Yes" || val === "Started" || val === "Enabled")
    return { ...cellStyle(GREEN, WHITE, true, "center") };
  if (val === "No"  || val === "Stopped" || val === "Error")
    return { ...cellStyle(RED_BG, WHITE, true, "center") };
  if (val === "N/A" || val === "Disabled")
    return { ...cellStyle(GREY_BG, BLACK, false, "center") };
  return cellStyle(WHITE, BLACK, false, "center");
}

function addCells(ws: XLSX.WorkSheet, rows: any[][], startRow: number) {
  rows.forEach((row, ri) => {
    row.forEach((cell, ci) => {
      const addr = XLSX.utils.encode_cell({ r: startRow + ri, c: ci });
      if (!ws[addr]) ws[addr] = {};
      if (cell && typeof cell === "object" && "v" in cell) {
        ws[addr] = cell;
      } else {
        ws[addr] = { v: cell ?? "", t: "s" };
      }
    });
  });
}

function makeCell(v: any, s: any, t = "s"): XLSX.CellObject {
  return { v, t, s } as any;
}

// ══════════════════════════════════════════════════════════════════════════════
// SHEET 1 — Preliminary Check
// ══════════════════════════════════════════════════════════════════════════════
function buildPreliminaryCheck(data: typeof PRELIMINARY_CHECK): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  const today = new Date().toLocaleDateString("en-GB");

  // Title block
  addCells(ws, [
    [makeCell("AbsoluteLabs Platform Intelligence", headerStyle(DARK_BG, LIGHT_FG, true))],
    [makeCell("SUPPORT — Health Check Report",      headerStyle(NAVY, WHITE, true))],
    [makeCell("Report date:", cellStyle(LIGHT_BG, NAVY_FG, true)), makeCell(today, cellStyle(LIGHT_BG, BLACK))],
    [makeCell("Prepared by:", cellStyle(LIGHT_BG, NAVY_FG, true)), makeCell("Ab Labs Support Team", cellStyle(LIGHT_BG, BLACK))],
    [],
    [],
  ], 0);

  // PROD section header
  addCells(ws, [
    [makeCell("PROD", headerStyle(NAVY, WHITE, true)), "", "", "", "", "", "", "", ""],
  ], 6);

  // Column headers
  addCells(ws, [
    ["S.No.", "Category", "Task", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Comments"]
      .map(h => makeCell(h, headerStyle(DARK_BG, LIGHT_FG))),
  ], 7);

  // Data rows
  data.forEach((row, i) => {
    const days = [row.mon, row.tue, row.wed, row.thu, row.fri];
    addCells(ws, [[
      makeCell(row.no,       cellStyle(LIGHT_BG, NAVY_FG, true, "center")),
      makeCell(row.category, cellStyle(LIGHT_BG, NAVY_FG, true, "center")),
      makeCell(row.task,     cellStyle(WHITE, BLACK)),
      ...days.map(d => makeCell(d, statusStyle(d))),
      makeCell(row.comments, cellStyle("FFFFF8E8", BLACK)),
    ]], 8 + i);
  });

  ws["!cols"] = [
    { wch: 7 }, { wch: 14 }, { wch: 52 },
    { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 10 },
    { wch: 48 },
  ];
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
    { s: { r: 6, c: 0 }, e: { r: 6, c: 8 } },
  ];
  ws["!ref"] = XLSX.utils.encode_range({ r: 0, c: 0 }, { r: 8 + data.length, c: 8 });
  ws["!rows"] = [{ hpt: 28 }, { hpt: 24 }, { hpt: 20 }, { hpt: 20 }];
  return ws;
}

// ══════════════════════════════════════════════════════════════════════════════
// SHEET 2 — API Info
// ══════════════════════════════════════════════════════════════════════════════
function buildApiInfo(data: typeof MULESOFT_APIS): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  const headers = ["API Name", "Worker Size", "No. of Workers", "Status", "Runtime Version"];

  addCells(ws, [
    [makeCell("CloudHub — API Info", headerStyle(DARK_BG, LIGHT_FG, true))],
    headers.map(h => makeCell(h, headerStyle(NAVY, WHITE))),
  ], 0);

  data.forEach((api, i) => {
    const alt = i % 2 === 0;
    const bg  = alt ? WHITE : "FFF3F2FF";
    addCells(ws, [[
      makeCell(api.api,            cellStyle(bg, NAVY_FG, true)),
      makeCell(api.workerSize,     cellStyle(bg, BLACK, false, "center")),
      makeCell(api.workers,        { ...cellStyle(bg, BLACK, false, "center"), t: "n" }),
      makeCell(api.status,         statusStyle(api.status)),
      makeCell(api.runtime,        cellStyle(bg, BLACK, false, "center")),
    ]], 2 + i);
  });

  ws["!cols"] = [{ wch: 36 }, { wch: 14 }, { wch: 16 }, { wch: 12 }, { wch: 18 }];
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];
  ws["!ref"] = XLSX.utils.encode_range({ r: 0, c: 0 }, { r: 2 + data.length, c: 4 });
  return ws;
}

// ══════════════════════════════════════════════════════════════════════════════
// SHEET 3 — Scheduler Status
// ══════════════════════════════════════════════════════════════════════════════
function buildSchedulerStatus(data: typeof MULESOFT_SCHEDULERS): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  const headers = ["S.No", "Scheduler (API)", "API", "Description", "Schedule Time", "Frequency", "Expected Behaviour", "Status"];

  addCells(ws, [
    [makeCell("CloudHub — Scheduler Status", headerStyle(DARK_BG, LIGHT_FG, true))],
    headers.map(h => makeCell(h, headerStyle(NAVY, WHITE))),
  ], 0);

  data.forEach((s, i) => {
    const alt = i % 2 === 0;
    const bg  = alt ? WHITE : "FFF3F2FF";
    addCells(ws, [[
      makeCell(s.no,                { ...cellStyle(bg, BLACK, false, "center"), t: "n" }),
      makeCell(s.scheduler,         cellStyle(bg, NAVY_FG, true)),
      makeCell(s.api,               cellStyle(bg, BLACK)),
      makeCell(s.description,       cellStyle(bg, BLACK)),
      makeCell(s.scheduleTime,      cellStyle(bg, BLACK, false, "center")),
      makeCell(s.frequency,         cellStyle(bg, BLACK, false, "center")),
      makeCell(s.expectedBehaviour, cellStyle(bg, BLACK)),
      makeCell(s.status,            statusStyle(s.status)),
    ]], 2 + i);
  });

  ws["!cols"] = [{ wch: 6 }, { wch: 40 }, { wch: 28 }, { wch: 50 }, { wch: 16 }, { wch: 12 }, { wch: 45 }, { wch: 12 }];
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }];
  ws["!ref"] = XLSX.utils.encode_range({ r: 0, c: 0 }, { r: 2 + data.length, c: 7 });
  return ws;
}

// ══════════════════════════════════════════════════════════════════════════════
// SHEET 4 — Major Alerts
// ══════════════════════════════════════════════════════════════════════════════
function buildMajorAlerts(data: typeof MULESOFT_ALERTS): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  const headers = ["API Name", "Approximate Alerts", "Reason / Description"];

  addCells(ws, [
    [makeCell("Major Alerts — This Week", headerStyle(DARK_BG, LIGHT_FG, true))],
    headers.map(h => makeCell(h, headerStyle(NAVY, WHITE))),
  ], 0);

  data.forEach((a, i) => {
    addCells(ws, [[
      makeCell(a.api,     cellStyle("FFFFF0CC", NAVY_FG, true)),
      makeCell(a.alerts,  { ...cellStyle("FFFFCCCC", RED_BG, true, "center"), font: { bold: true, color: { rgb: "FFCC0000" }, sz: 10 } }),
      makeCell(a.reason,  cellStyle(WHITE, BLACK)),
    ]], 2 + i);
  });

  ws["!cols"] = [{ wch: 32 }, { wch: 20 }, { wch: 85 }];
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];
  ws["!ref"] = XLSX.utils.encode_range({ r: 0, c: 0 }, { r: 2 + data.length, c: 2 });
  ws["!rows"] = Array(2 + data.length).fill({ hpt: 55 });
  return ws;
}

// ══════════════════════════════════════════════════════════════════════════════
// SHEET 5 — Connector Version
// ══════════════════════════════════════════════════════════════════════════════
function buildConnectorVersion(data: typeof CONNECTOR_VERSIONS): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  const headers = ["API Name", "SFTP Connector", "FTP Connector", "AnyPoint MQ", "HTTP Connector", "Salesforce Connector", "CloudHub Connector"];

  addCells(ws, [
    [makeCell("Connector Version Matrix", headerStyle(DARK_BG, LIGHT_FG, true))],
    headers.map(h => makeCell(h, headerStyle(NAVY, WHITE))),
  ], 0);

  data.forEach((c, i) => {
    const alt = i % 2 === 0;
    const bg  = alt ? WHITE : "FFF3F2FF";
    addCells(ws, [[
      makeCell(c.api,          cellStyle(bg, NAVY_FG, true)),
      makeCell(c.sftp,         cellStyle(bg, BLACK, false, "center")),
      makeCell(c.ftp,          cellStyle(bg, BLACK, false, "center")),
      makeCell(c.anypointMq,   cellStyle(bg, BLACK, false, "center")),
      makeCell(c.http,         cellStyle(bg, BLACK, false, "center")),
      makeCell(c.salesforce,   cellStyle(bg, BLACK, false, "center")),
      makeCell(c.cloudhub,     cellStyle(bg, BLACK, false, "center")),
    ]], 2 + i);
  });

  ws["!cols"] = [{ wch: 36 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 16 }, { wch: 22 }, { wch: 20 }];
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];
  ws["!ref"] = XLSX.utils.encode_range({ r: 0, c: 0 }, { r: 2 + data.length, c: 6 });
  return ws;
}

// ══════════════════════════════════════════════════════════════════════════════
// SHEET 6 — Highlights
// ══════════════════════════════════════════════════════════════════════════════
function buildHighlights(data: typeof WEEKLY_HIGHLIGHTS): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  const { period, highlights, lowlights, escalations, reprocessed } = data;

  addCells(ws, [
    [makeCell(`Weekly Summary — ${period}`, headerStyle(DARK_BG, LIGHT_FG, true))],
    [],
  ], 0);

  const sections = [
    { label: "Highlights",  value: highlights,   bg: "FFE8F5E9", labelBg: "FF002060", labelFg: WHITE },
    { label: "Lowlights",   value: lowlights,    bg: "FFFFF3E0", labelBg: "FF002060", labelFg: WHITE },
    { label: "Escalations", value: escalations,  bg: "FFFFEBEE", labelBg: "FF002060", labelFg: WHITE },
    { label: "Reprocessed", value: reprocessed,  bg: "FFF3E5F5", labelBg: "FF002060", labelFg: WHITE },
  ];

  let row = 2;
  sections.forEach(s => {
    addCells(ws, [
      [makeCell(s.label, headerStyle(s.labelBg, s.labelFg, true)), makeCell("", cellStyle(s.bg))],
      [makeCell("",      cellStyle(s.bg)), makeCell(s.value, { ...cellStyle(s.bg, BLACK), alignment: { wrapText: true, vertical: "top" } })],
      [],
    ], row);
    row += 3;
  });

  ws["!cols"] = [{ wch: 18 }, { wch: 100 }];
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
    ...([2, 5, 8, 11].map(r => ({ s: { r: r + 1, c: 1 }, e: { r: r + 1, c: 1 } }))),
  ];
  ws["!rows"] = [{ hpt: 28 }, {}, ...sections.flatMap(() => [{}, { hpt: 80 }, {}])];
  ws["!ref"] = XLSX.utils.encode_range({ r: 0, c: 0 }, { r: row, c: 1 });
  return ws;
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════════════════════════════════════════════
export function generateHealthCheckXLSX(projectName?: string): void {
  // Use project-specific data if available, otherwise fall back to default
  const proj = projectName
    ? (PROJECT_HEALTH_DATA[projectName] ?? DEFAULT_PROJECT_HEALTH)
    : DEFAULT_PROJECT_HEALTH;

  const apis        = proj.apis        ?? MULESOFT_APIS;
  const schedulers  = proj.schedulers  ?? MULESOFT_SCHEDULERS;
  const alerts      = proj.alerts      ?? MULESOFT_ALERTS;
  const connectors  = proj.connectorVersions ?? CONNECTOR_VERSIONS;
  const highlights  = proj.weeklyHighlights  ?? WEEKLY_HIGHLIGHTS;
  const preliminary = proj.preliminaryCheck  ?? PRELIMINARY_CHECK;

  const wb = XLSX.utils.book_new();
  wb.Props = {
    Title:   `Weekly Health Check — ${projectName ?? "Platform"}`,
    Author:  "AbsoluteLabs Synapse",
    Company: "Absolute Retail Consulting LTD",
  };

  XLSX.utils.book_append_sheet(wb, buildPreliminaryCheck(preliminary), "Preliminary Check");
  XLSX.utils.book_append_sheet(wb, buildApiInfo(apis),                 "API Info");
  XLSX.utils.book_append_sheet(wb, buildSchedulerStatus(schedulers),   "Scheduler Status");
  XLSX.utils.book_append_sheet(wb, buildMajorAlerts(alerts),           "Major Alerts");
  XLSX.utils.book_append_sheet(wb, buildConnectorVersion(connectors),  "Connector Version");
  XLSX.utils.book_append_sheet(wb, buildHighlights(highlights),        "Highlights");

  const safe = (projectName ?? "Platform").replace(/[^a-zA-Z0-9]/g, "-");
  const period = highlights.period?.replace(/\//g, "-") ?? "report";
  XLSX.writeFile(wb, `Health-Check-${safe}-${period}.xlsx`, { bookType: "xlsx", type: "binary" });
}
