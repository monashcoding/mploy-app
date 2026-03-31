"use client";

import { Alert, Button, Card, PasswordInput, TextInput } from "@mantine/core";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/my-applications";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setIsLoading(false);
      return;
    }

    if (res?.url) {
      window.location.href = res.url;
    } else {
      window.location.href = callbackUrl;
    }
  };

  return (
    <div className="max-w-md mx-auto pt-10">
      <Card withBorder radius="lg" p="xl">
        <h1 className="text-2xl font-semibold mb-2">Sign in</h1>
        <p className="text-sm opacity-80 mb-6">
          Don’t have an account?{" "}
          <Link className="underline" href="/sign-up">
            Sign up
          </Link>
        </p>

        {error && (
          <Alert color="red" mb="md">
            {error}
          </Alert>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <TextInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            required
          />
          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            required
          />
          <Button type="submit" loading={isLoading} bg="accent" c="black">
            Sign in
          </Button>
          <Button
            variant="default"
            onClick={() => signIn("google", { callbackUrl })}
          >
            Continue with Google
          </Button>
        </form>
      </Card>
    </div>
  );
}

