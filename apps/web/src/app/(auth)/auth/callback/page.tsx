"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { setToken } from "@/lib/auth";
import Link from "next/link";

function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(false);

  useEffect(() => {
    const token =
      searchParams.get("token") ||
      Cookies.get("better-auth.session_token");
    if (token) {
      setToken(token);
      router.replace("/");
    } else {
      setError(true);
    }
  }, [searchParams, router]);

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
