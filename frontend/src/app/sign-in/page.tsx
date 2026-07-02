"use client";

import { Alert, Button, Card } from "@mantine/core";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { startSocialSignIn } from "@/lib/mac-session";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackPath = searchParams.get("callbackUrl") || "/";

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"google" | "microsoft" | null>(null);

  const signIn = async (provider: "google" | "microsoft") => {
    setError(null);
    setLoading(provider);
    try {
      // Absolute URL back to mploy so central can redirect here after auth.
      const callbackURL = new URL(
        callbackPath,
        window.location.origin,
      ).toString();
      await startSocialSignIn(provider, callbackURL);
    } catch {
      setError("Could not start sign-in. Please try again.");
      setLoading(null);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-10">
      <Card withBorder radius="lg" p="xl">
        <h1 className="text-2xl font-semibold mb-2">Sign in</h1>
        <p className="text-sm opacity-80 mb-6">
          Continue with your Monash Coding account.
        </p>

        {error && (
          <Alert color="red" mb="md">
            {error}
          </Alert>
        )}

        <div className="flex flex-col gap-3">
          <Button
            variant="default"
            loading={loading === "google"}
            disabled={loading !== null}
            onClick={() => signIn("google")}
            leftSection={
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
            }
          >
            Sign in with Google
          </Button>
          <Button
            variant="default"
            loading={loading === "microsoft"}
            disabled={loading !== null}
            onClick={() => signIn("microsoft")}
            leftSection={
              <svg width="18" height="18" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
            }
          >
            Sign in with Microsoft
          </Button>
          <p className="text-xs leading-5 opacity-70">
            We handle account and usage data as described in our{" "}
            <Link className="underline" href="/privacy">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </Card>
    </div>
  );
}
