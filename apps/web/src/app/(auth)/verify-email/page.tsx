import { Suspense } from "react";
import type { Metadata } from "next";
import { VerifyEmailStatus } from "@/components/auth/verify-email-status";

export const metadata: Metadata = {
  title: "Verify your email",
  robots: { index: false, follow: false },
};

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailStatus />
    </Suspense>
  );
}
