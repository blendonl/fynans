"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function AuthCallback() {
  const searchParams = useSearchParams();
  const { handleOAuthCallback } = useAuth();
  const [error, setError] = useState(false);

  useEffect(() => {
    const tokenFromParams = searchParams.get("token");
    if (tokenFromParams) {
      handleOAuthCallback(tokenFromParams);
      return;
    }

    fetch(`${API_URL}/api/auth/get-session`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.session?.token) {
          handleOAuthCallback(data.session.token);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true));
  }, [searchParams, handleOAuthCallback]);

  if (error) {
    return (
      <div className="text-center space-y-4">
        <p className="text-error">Authentication failed. No token received.</p>
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

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center">
          <p className="text-text-secondary">Loading...</p>
        </div>
      }
    >
      <AuthCallback />
    </Suspense>
  );
}
