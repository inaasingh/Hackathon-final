const AUTH_KEY = "al_authed";
const USER_KEY = "al_user";

export interface StoredUser {
  email: string;
  displayName: string;
  initials: string;
  role: string;
  /**
   * Allowed project names. Empty array = admin / unrestricted (all projects).
   */
  projects: string[];
}

type VoidFn = () => void;
let _onLogout: VoidFn | null = null;

export const auth = {
  isLoggedIn: () => sessionStorage.getItem(AUTH_KEY) === "1",

  /**
   * Full login — stores the user profile alongside the auth flag.
   * Called after a successful credential check.
   */
  loginAs: (user: StoredUser) => {
    sessionStorage.setItem(AUTH_KEY, "1");
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /**
   * Legacy shim — login without a user record (grants all-project access).
   */
  login: () => sessionStorage.setItem(AUTH_KEY, "1"),

  logout: () => {
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(USER_KEY);
    _onLogout?.();
  },

  /** Returns the stored user profile, or null if not available. */
  getUser: (): StoredUser | null => {
    const raw = sessionStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredUser;
    } catch {
      return null;
    }
  },

  /** Called by Root in main.jsx so sign-out re-renders without a page reload */
  setLogoutHandler: (fn: VoidFn) => {
    _onLogout = fn;
  },
};
