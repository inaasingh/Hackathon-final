import React, { useState } from "react";
import ReactDOM from "react-dom/client";

import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";

import { routeTree } from "./routeTree.gen";
import { auth } from "./lib/auth";
import { PremiumLogin } from "./components/PremiumLogin";

import "./styles.css";

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  context: { queryClient },
});

/**
 * Root renders BEFORE the router.
 * If not logged in → show PremiumLogin (plain React, zero router overhead).
 * If logged in     → start RouterProvider with the full dashboard.
 *
 * This means the login page is completely outside TanStack Router,
 * outside __root.tsx, outside shellComponent / HeadContent / Scripts —
 * all of which add overhead and potential conflict on a plain Vite SPA.
 */
function Root() {
  const [loggedIn, setLoggedIn] = useState(() => auth.isLoggedIn());

  /* Register the sign-out callback so Sidebar can trigger re-render */
  auth.setLogoutHandler(() => setLoggedIn(false));

  if (!loggedIn) {
    return (
      <PremiumLogin
        onLogin={(user) => {
          if (user) {
            /* Known user — store their profile + project restrictions */
            auth.loginAs(user);
          } else {
            /* Social / SSO fallback — all-project admin access */
            auth.loginAs({
              email:       "admin@absolutelabs.co",
              displayName: "AL Admin",
              initials:    "AA",
              role:        "Platform Administrator",
              projects:    [],
            });
          }
          setLoggedIn(true);
        }}
      />
    );
  }

  return <RouterProvider router={router} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
