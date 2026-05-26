const KEY = "al_authed";

type VoidFn = () => void;
let _onLogout: VoidFn | null = null;

export const auth = {
  isLoggedIn: () => sessionStorage.getItem(KEY) === "1",
  login:      () => sessionStorage.setItem(KEY, "1"),
  logout: () => {
    sessionStorage.removeItem(KEY);
    _onLogout?.();
  },
  /** Called by Root in main.jsx so sign-out re-renders without a page reload */
  setLogoutHandler: (fn: VoidFn) => { _onLogout = fn; },
};
