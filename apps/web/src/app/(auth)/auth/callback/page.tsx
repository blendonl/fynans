"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";

export default function AuthCallbackPage() {
  const { completeOAuthSignIn } = useAuth();
  const [error, setError] = useState(false);

  useEffect(() => {
    completeOAuthSignIn().catch(() => setError(true));
  }, [completeOAuthSignIn]);

  if (error) {
    return (
      <div className="text-center space-y-4">
        <p className="text-error">Authentication failed. No session was created.</p>
        <Link href="/login" className="text-primary hover:underline font-medium">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-text-secondary">Signing you in...</p>
    </div>
  );
}
