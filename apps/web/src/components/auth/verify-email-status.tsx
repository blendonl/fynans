"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/lib/env";

const FAILURE_DESCRIPTIONS: Record<string, string> = {
  token_expired:
    "That verification link has expired. Send yourself a fresh one below.",
  invalid_token:
    "That verification link is not valid. Send yourself a fresh one below.",
  user_not_found:
    "We could not find an account for that link. Send yourself a fresh one below.",
};

const GENERIC_FAILURE =
  "We could not reach the server. Check your connection and try again.";

const DEFAULT_FAILURE_DESCRIPTION =
  "We could not verify your email address with that link. Send yourself a fresh one below.";

export function VerifyEmailStatus() {
  const searchParams = useSearchParams();
  const failure = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [acknowledgement, setAcknowledgement] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!failure) {
    return (
      <AuthCard
        title="Email verified"
        description="Thanks — your email address is confirmed."
      >
        <div className="dash-animate-in dash-delay-3">
          <Button asChild className="w-full h-12 text-[15px] font-medium">
            <Link href="/">Continue to Fynans</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  const handleResend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/send-verification-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email }),
        },
      );

      if (response.status === 429) {
        setError("Too many requests. Wait a minute before trying again.");
        return;
      }

      if (!response.ok) {
        setError(GENERIC_FAILURE);
        return;
      }

      const body = (await response.json()) as { message?: string };
      setAcknowledgement(
        body.message ??
          "If that address needs verifying, a new verification link is on its way.",
      );
    } catch {
      setError(GENERIC_FAILURE);
    } finally {
      setLoading(false);
    }
  };

  if (acknowledgement) {
    return (
      <AuthCard title="Check your email" description={acknowledgement}>
        <p className="dash-animate-in dash-delay-3 text-sm text-text-secondary/80 text-center">
          <Link
            href="/login"
            className="text-primary font-semibold hover:underline underline-offset-4 transition-colors"
          >
            Back to sign in
          </Link>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Verification failed"
      description={FAILURE_DESCRIPTIONS[failure] ?? DEFAULT_FAILURE_DESCRIPTION}
    >
      <form
        onSubmit={handleResend}
        className="dash-animate-in dash-delay-3 space-y-5"
      >
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="h-12"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="w-full h-12 text-[15px] font-medium"
          loading={loading}
        >
          Send a new verification link
        </Button>

        <p className="text-sm text-text-secondary/80 text-center">
          <Link
            href="/login"
            className="text-primary font-semibold hover:underline underline-offset-4 transition-colors"
          >
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
