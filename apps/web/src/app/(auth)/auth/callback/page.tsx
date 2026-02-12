"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setToken } from "@/lib/auth";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(false);

  useEffect(() => {
    const tokenFromParams = searchParams.get("token");
    if (tokenFromParams) {
      setToken(tokenFromParams);
      router.replace("/");
      return;
    }

    fetch(`${API_URL}/api/auth/get-session`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.session?.token) {
          setToken(data.session.token);
          router.replace("/");
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true));
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
