"use client";

import { useEffect, useState } from "react";

export function useRequireAuth() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setLoggedIn(!!d.user))
      .catch(() => setLoggedIn(false));
  }, []);

  function requireAuth(action: () => void) {
    if (loggedIn === false) {
      window.location.href = "/cuenta?redirect=/checkout";
      return;
    }
    action();
  }

  return { loggedIn, requireAuth };
}
