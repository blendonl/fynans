"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/lib/env";

const GENERIC_FAILURE =
  "We could not reach the server. Check your connection and try again.";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [acknowledgement, setAcknowledgement] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      if (response.status === 429) {
        setError(
          "Too many reset requests. Wait a minute before trying again.",
        );
        return;
      }

      if (!response.ok) {
        setError(GENERIC_FAILURE);
        return;
      }

      const body = (await response.json()) as { message?: string };
      setAcknowledgement(
        body.message ??
          "If an account exists for that address, a password reset link is on its way.",
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
        <div className="dash-animate-in dash-delay-3 space-y-4">
          <p className="text-sm text-text-secondary text-center">
            The link expires in one hour and can only be used once. If it does
            not arrive, check your spam folder.
          </p>
          <Button
            type="button"
            variant="outline"
            className="w-full h-12"
            onClick={() => setAcknowledgement(null)}
          >
            Use a different address
          </Button>
          <p className="text-sm text-text-secondary/80 text-center">
            <Link
              href="/login"
              className="text-primary font-semibold hover:underline underline-offset-4 transition-colors"
            >
              Back to sign in
            </Link>
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot your password?"
      description="Enter the email address on your account and we will send you a reset link."
    >
      <form
        onSubmit={handleSubmit}
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
          Send reset link
        </Button>

        <p className="text-sm text-text-secondary/80 text-center">
          Remembered it?{" "}
          <Link
            href="/login"
            className="text-primary font-semibold hover:underline underline-offset-4 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
