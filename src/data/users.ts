/**
 * Project-access registry.
 *
 * Two levels of matching:
 *  1. Exact email match  → specific user record (specific password required)
 *  2. Domain match       → any email from that domain gets the company's projects
 *                          (password just needs to be non-empty, for demo purposes)
 *
 * Empty `projects` array = unrestricted admin (all projects visible).
 */

import type { StoredUser } from "@/lib/auth";

export type { StoredUser };

export interface UserRecord {
  email: string;
  password: string;
  displayName: string;
  initials: string;
  role: string;
  projects: string[]; // allowed project names; [] = all
}

// ── Specific named accounts ────────────────────────────────────────────────────
export const USER_RECORDS: UserRecord[] = [
  // Mulberry
  { email: "v.sharma@mulberry.com",           password: "mulberry123",  displayName: "Virat Sharma",   initials: "VS", role: "Integration Engineer", projects: ["Mulberry Support Team"] },
  { email: "s.mitchell@mulberry.com",         password: "mulberry123",  displayName: "Sarah Mitchell", initials: "SM", role: "Support Manager",       projects: ["Mulberry Support Team"] },
  // Wolverine
  { email: "b.kowalski@wolverineworldwide.com", password: "wolverine123", displayName: "Brad Kowalski", initials: "BK", role: "Integration Engineer", projects: ["Wolverine-Support Team"] },
  { email: "d.walsh@wolverineworldwide.com",  password: "wolverine123", displayName: "Donna Walsh",    initials: "DW", role: "Support Manager",       projects: ["Wolverine-Support Team"] },
  // Others
  { email: "user@clarks.com",                 password: "clarks123",    displayName: "Clarks User",    initials: "CU", role: "Integration Engineer", projects: ["Clarks Support Team"] },
  { email: "user@harveynichols.com",          password: "harvey123",    displayName: "Harvey User",    initials: "HU", role: "Integration Engineer", projects: ["Harvey Nichols"] },
  { email: "user@wrenkitchens.com",           password: "wren123",      displayName: "Wren User",      initials: "WU", role: "Integration Engineer", projects: ["Wren Kitchens"] },
  { email: "user@barbour.com",                password: "barbour123",   displayName: "Barbour User",   initials: "BU", role: "Integration Engineer", projects: ["Barbour Support"] },
  { email: "user@footasylum.com",             password: "footasylum123",displayName: "FootAsylum User",initials: "FU", role: "Integration Engineer", projects: ["FootAsylum Support Team"] },
  // AbsoluteLabs admin (all projects)
  { email: "admin@absolutelabs.co",           password: "admin123",     displayName: "AL Admin",       initials: "AA", role: "Platform Administrator", projects: [] },
  { email: "manager@absolutelabs.co",         password: "manager123",   displayName: "Senior Manager", initials: "SM", role: "Senior Management",     projects: [] },
  { email: "ina.singh@absolutelabs.co",       password: "ina123",       displayName: "Ina Singh",      initials: "IS", role: "Platform Administrator", projects: [] },
];

// ── Domain → project mapping (any email @domain gets these projects) ───────────
// This means any real company email works without being in the list above.
// Password just needs to be non-empty (demo mode).
const DOMAIN_PROJECTS: Record<string, { projects: string[]; role: string }> = {
  "mulberry.com":            { projects: ["Mulberry Support Team"],    role: "Support Engineer" },
  "wolverineworldwide.com":  { projects: ["Wolverine-Support Team"],   role: "Support Engineer" },
  "clarks.com":              { projects: ["Clarks Support Team"],      role: "Support Engineer" },
  "harveynichols.com":       { projects: ["Harvey Nichols"],           role: "Support Engineer" },
  "wrenkitchens.com":        { projects: ["Wren Kitchens"],            role: "Support Engineer" },
  "barbour.com":             { projects: ["Barbour Support"],          role: "Support Engineer" },
  "footasylum.com":          { projects: ["FootAsylum Support Team"],  role: "Support Engineer" },
  "fenwick.co.uk":           { projects: ["Fenwick Support Team"],     role: "Support Engineer" },
  "fitflop.com":             { projects: ["FitFlop Support Team"],     role: "Support Engineer" },
  "lornajaneathletic.com":   { projects: ["LornaJane Support"],        role: "Support Engineer" },
  "whitestuff.com":          { projects: ["WhiteStuff Support Team"],  role: "Support Engineer" },
  "absolutelabs.co":         { projects: [],                           role: "Platform Administrator" },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Generate initials from a display name or email prefix. */
function initials(name: string): string {
  const parts = name.trim().split(/[\s.]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/** Convert an email username to a display name ("v.sharma" → "V Sharma"). */
function nameFromEmail(email: string): string {
  const local = email.split("@")[0];
  return local
    .split(/[._-]+/)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

/**
 * Validate credentials and return a StoredUser on success, or undefined.
 *
 * Lookup order:
 *  1. Exact email + exact password (specific named accounts above)
 *  2. Email domain match  → any non-empty password accepted (demo)
 *  3. No match            → undefined (login rejected)
 */
export function authenticateUser(email: string, password: string): StoredUser | undefined {
  const emailLc = email.toLowerCase().trim();
  const domain  = emailLc.split("@")[1] ?? "";

  // 1. Exact account match
  const exact = USER_RECORDS.find(u => u.email.toLowerCase() === emailLc);
  if (exact) {
    if (exact.password !== password) return undefined; // wrong password
    return {
      email:       exact.email,
      displayName: exact.displayName,
      initials:    exact.initials,
      role:        exact.role,
      projects:    exact.projects,
    };
  }

  // 2. Domain-based match — any email from a known company domain
  const domainCfg = DOMAIN_PROJECTS[domain];
  if (domainCfg && password.length > 0) {
    const displayName = nameFromEmail(emailLc);
    return {
      email:       emailLc,
      displayName,
      initials:    initials(displayName),
      role:        domainCfg.role,
      projects:    domainCfg.projects,
    };
  }

  return undefined;
}
