/**
 * Demo user records — maps email addresses to the projects they are
 * allowed to access in the dashboard.
 *
 * Rules:
 *  - `projects: []`  → AbsoluteLabs admin / senior management → sees ALL projects
 *  - `projects: […]` → client staff → sees ONLY those projects
 */

export interface UserRecord {
  email: string;
  /** Plain-text demo password (no real backend) */
  password: string;
  displayName: string;
  initials: string;
  role: string;
  /**
   * Allowed project names (must match the PROJECTS list in index.tsx).
   * Empty array = unrestricted (admin).
   */
  projects: string[];
}

export const USER_RECORDS: UserRecord[] = [
  // ── Mulberry ──────────────────────────────────────────────────────
  {
    email: "v.sharma@mulberry.com",
    password: "mulberry123",
    displayName: "Virat Sharma",
    initials: "VS",
    role: "Integration Engineer",
    projects: ["Mulberry Support Team"],
  },
  {
    email: "s.mitchell@mulberry.com",
    password: "mulberry123",
    displayName: "Sarah Mitchell",
    initials: "SM",
    role: "Support Manager",
    projects: ["Mulberry Support Team"],
  },

  // ── Wolverine ─────────────────────────────────────────────────────
  {
    email: "b.kowalski@wolverineworldwide.com",
    password: "wolverine123",
    displayName: "Brad Kowalski",
    initials: "BK",
    role: "Integration Engineer",
    projects: ["Wolverine-Support Team"],
  },
  {
    email: "d.walsh@wolverineworldwide.com",
    password: "wolverine123",
    displayName: "Donna Walsh",
    initials: "DW",
    role: "Support Manager",
    projects: ["Wolverine-Support Team"],
  },

  // ── Clarks ────────────────────────────────────────────────────────
  {
    email: "user@clarks.com",
    password: "clarks123",
    displayName: "Clarks User",
    initials: "CU",
    role: "Integration Engineer",
    projects: ["Clarks Support Team"],
  },

  // ── Harvey Nichols ────────────────────────────────────────────────
  {
    email: "user@harveynichols.com",
    password: "harvey123",
    displayName: "Harvey User",
    initials: "HU",
    role: "Integration Engineer",
    projects: ["Harvey Nichols"],
  },

  // ── Wren Kitchens ─────────────────────────────────────────────────
  {
    email: "user@wrenkitchens.com",
    password: "wren123",
    displayName: "Wren User",
    initials: "WU",
    role: "Integration Engineer",
    projects: ["Wren Kitchens"],
  },

  // ── Barbour ───────────────────────────────────────────────────────
  {
    email: "user@barbour.com",
    password: "barbour123",
    displayName: "Barbour User",
    initials: "BU",
    role: "Integration Engineer",
    projects: ["Barbour Support"],
  },

  // ── FootAsylum ────────────────────────────────────────────────────
  {
    email: "user@footasylum.com",
    password: "footasylum123",
    displayName: "FootAsylum User",
    initials: "FU",
    role: "Integration Engineer",
    projects: ["FootAsylum Support Team"],
  },

  // ── AbsoluteLabs admin / management (all projects) ────────────────
  {
    email: "admin@absolutelabs.co",
    password: "admin123",
    displayName: "AL Admin",
    initials: "AA",
    role: "Platform Administrator",
    projects: [], // empty = all projects
  },
  {
    email: "manager@absolutelabs.co",
    password: "manager123",
    displayName: "Senior Manager",
    initials: "SM",
    role: "Senior Management",
    projects: [], // empty = all projects
  },
];

/** Look up a user record by email (case-insensitive). */
export function findUser(email: string): UserRecord | undefined {
  return USER_RECORDS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase().trim(),
  );
}

/** Verify email + password, returns the record on success or undefined. */
export function authenticateUser(
  email: string,
  password: string,
): UserRecord | undefined {
  const user = findUser(email);
  if (!user) return undefined;
  return user.password === password ? user : undefined;
}
