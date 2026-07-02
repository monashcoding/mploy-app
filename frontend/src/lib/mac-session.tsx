"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  PropsWithChildren,
} from "react";

const AUTH_URL =
  process.env.NEXT_PUBLIC_AUTH_URL || "https://auth.monashcoding.com";

export type MacSessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export type MacSession = {
  user: MacSessionUser;
};

export type MacSessionStatus = "loading" | "authenticated" | "unauthenticated";

// Discriminated union so `status === "authenticated"` narrows `data` to
// non-null at call sites (mirrors next-auth's `useSession`).
type MacSessionContextValue =
  | { data: MacSession; status: "authenticated" }
  | { data: null; status: "loading" | "unauthenticated" };

const MacSessionContext = createContext<MacSessionContextValue>({
  data: null,
  status: "loading",
});

/**
 * Client-side session provider backed by the central auth service. Replaces
 * next-auth's `SessionProvider`. On mount it calls `GET /api/auth/get-session`
 * with the shared `.monashcoding.com` cookie and exposes a next-auth-like
 * `{ data, status }` shape.
 */
export function MacSessionProvider({ children }: PropsWithChildren) {
  const [value, setValue] = useState<MacSessionContextValue>({
    data: null,
    status: "loading",
  });

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const res = await fetch(`${AUTH_URL}/api/auth/get-session`, {
          credentials: "include",
          cache: "no-store",
        });

        if (!active) return;

        if (!res.ok) {
          setValue({ data: null, status: "unauthenticated" });
          return;
        }

        const json = await res.json();
        const user = json?.user;

        if (user?.id) {
          setValue({ data: { user }, status: "authenticated" });
        } else {
          setValue({ data: null, status: "unauthenticated" });
        }
      } catch {
        if (active) setValue({ data: null, status: "unauthenticated" });
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <MacSessionContext.Provider value={value}>
      {children}
    </MacSessionContext.Provider>
  );
}

/** next-auth-compatible hook returning `{ data, status }`. */
export function useMacSession(): MacSessionContextValue {
  return useContext(MacSessionContext);
}

/**
 * Redirect the browser to the central social sign-in flow.
 * `callbackURL` should be an absolute URL back to mploy.
 */
export async function startSocialSignIn(
  provider: "google" | "microsoft",
  callbackURL: string,
): Promise<void> {
  const res = await fetch(`${AUTH_URL}/api/auth/sign-in/social`, {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ provider, callbackURL }),
  });

  const json = await res.json();
  if (json?.url) {
    window.location.href = json.url;
  } else {
    throw new Error("Failed to start sign-in");
  }
}

/** Sign out via the central service, then navigate to `callbackURL`. */
export async function signOutCentral(callbackURL = "/"): Promise<void> {
  try {
    await fetch(`${AUTH_URL}/api/auth/sign-out`, {
      method: "POST",
      credentials: "include",
    });
  } finally {
    window.location.href = callbackURL;
  }
}
