"use client";

import { Alert, Button, Card, PasswordInput, TextInput } from "@mantine/core";
import Link from "next/link";
import { useState } from "react";
import { registerUser } from "./actions";
import { signIn } from "next-auth/react";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await registerUser({ name, email, password });
      await signIn("credentials", {
        email,
        password,
        callbackUrl: "/my-applications",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-10">
      <Card withBorder radius="lg" p="xl">
        <h1 className="text-2xl font-semibold mb-2">Create account</h1>
        <p className="text-sm opacity-80 mb-6">
          Already have an account?{" "}
          <Link className="underline" href="/sign-in">
            Sign in
          </Link>
        </p>

        {error && (
          <Alert color="red" mb="md">
            {error}
          </Alert>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <TextInput
            label="Name"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder="Optional"
          />
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
            description="At least 8 characters"
          />
          <Button type="submit" loading={isLoading} bg="accent" c="black">
            Sign up
          </Button>
          <Button
            variant="default"
            onClick={() => signIn("google", { callbackUrl: "/my-applications" })}
          >
            Continue with Google
          </Button>
        </form>
      </Card>
    </div>
  );
}

