import { cookies } from "next/headers";
import { createRemoteJWKSet, jwtVerify } from "jose";
import logger from "@/lib/logger";

const AUTH_URL = process.env.AUTH_URL || "https://auth.monashcoding.com";
const ISSUER = "https://auth.monashcoding.com";
const AUDIENCE = process.env.JWT_AUDIENCE || "mac-suite";

// Cached remote JWKS (EdDSA/Ed25519 keys). jose caches the fetched keys and
// only refreshes when it encounters an unknown `kid`, so this is safe to keep
// at module scope.
const jwks = createRemoteJWKSet(new URL(`${AUTH_URL}/api/auth/jwks`));

type MacClaims = {
  macUserId?: string;
  email?: string;
  roles?: string[];
};

/**
 * Resolve the current user's opaque `macUserId` (a String) from the shared
 * `.monashcoding.com` session cookie, or `null` if unauthenticated.
 *
 * Flow: forward the session cookie to the central auth service to mint a
 * short-lived EdDSA JWT, then verify it locally against the central JWKS
 * (validating alg/iss/aud). This makes the Next.js server layer the JWT-verifying
 * resource server. The returned id is opaque and must never be parsed as an
 * ObjectId.
 */
export async function getMacUserId(): Promise<string | null> {
  const cookieHeader = (await cookies()).toString();
  if (!cookieHeader) return null;

  let token: string | undefined;
  try {
    const res = await fetch(`${AUTH_URL}/api/auth/token`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (!res.ok) return null;
    token = (await res.json())?.token;
  } catch (error) {
    logger.warn({ error }, "Failed to fetch central auth token");
    return null;
  }

  if (!token) return null;

  try {
    const { payload } = await jwtVerify<MacClaims>(token, jwks, {
      algorithms: ["EdDSA"],
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    return payload.macUserId ?? null;
  } catch (error) {
    logger.warn({ error }, "Failed to verify central auth JWT");
    return null;
  }
}

/**
 * Like {@link getMacUserId} but throws when there is no authenticated user.
 * Mirrors the old `requireUserId(session)` contract.
 */
export async function requireMacUserId(): Promise<string> {
  const id = await getMacUserId();
  if (!id) throw new Error("Not authenticated");
  return id;
}
