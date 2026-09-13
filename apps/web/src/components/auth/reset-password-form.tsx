"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/lib/env";

const MINIMUM_PASSWORD_LENGTH = 8;

const GENERIC_FAILURE =
  "We could not reach the server. Check your connection and try again.";

const EXPIRED_LINK_MESSAGE =
  "This reset link is no longer valid. It may have expired or already been used.";

function RequestANewLink() {
  return (
    <Link
      href="/forgot-password"
      className="text-primary font-semibold hover:underline underline-offset-4 transition-colors"
    >
      Request a new link
    </Link>
  );
}

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const linkError = searchParams.get("error");

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!token || linkError) {
    return (
      <AuthCard title="Link no longer valid" description={EXPIRED_LINK_MESSAGE}>
        <p className="dash-animate-in dash-delay-3 text-sm text-text-secondary/80 text-center">
          <RequestANewLink />
        </p>
      </AuthCard>
    );
  }

  if (done) {
    return (
      <AuthCard
        title="Password changed"
        description="You can sign in with your new password now."
      >
        <div className="dash-animate-in dash-delay-3 space-y-4">
          <p className="text-sm text-text-secondary text-center">
            Any other devices that were signed in have been signed out.
          </p>
          <Button asChild className="w-full h-12 text-[15px] font-medium">
            <Link href="/login">Go to sign in</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password.length < MINIMUM_PASSWORD_LENGTH) {
      setError(
        `Password must be at least ${MINIMUM_PASSWORD_LENGTH} characters long.`,
      );
      return;
    }

    if (password !== confirmation) {
      setError("The two passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token, newPassword: password }),
      });

      if (response.ok) {
        setDone(true);
        return;
      }

      if (response.status === 429) {
        setError("Too many attempts. Wait a minute before trying again.");
        return;
      }

      const body = (await response.json().catch(() => null)) as {
        message?: string | string[];
      } | null;
      const message = Array.isArray(body?.message)
        ? body.message[0]
        : body?.message;

      setError(message ?? EXPIRED_LINK_MESSAGE);
    } catch {
      setError(GENERIC_FAILURE);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Choose a new password"
      description={`Pick something at least ${MINIMUM_PASSWORD_LENGTH} characters long that you do not use anywhere else.`}
    >
      <form
        onSubmit={handleSubmit}
        className="dash-animate-in dash-delay-3 space-y-5"
      >
        <div>
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={MINIMUM_PASSWORD_LENGTH}
            className="h-12"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="confirmation">Confirm new password</Label>
          <Input
            id="confirmation"
            name="confirmation"
            type="password"
            autoComplete="new-password"
            required
            minLength={MINIMUM_PASSWORD_LENGTH}
            className="h-12"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-error">
            {error}{" "}
            {error === EXPIRED_LINK_MESSAGE && <RequestANewLink />}
          </p>
        )}

        <Button
          type="submit"
          className="w-full h-12 text-[15px] font-medium"
          loading={loading}
        >
          Set new password
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
