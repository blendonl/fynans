"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

export function RegisterForm() {
  return (
    <Card className="border-none shadow-2xl">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-gradient-to-br from-[var(--gradient-primary-start)] to-[var(--gradient-primary-end)] flex items-center justify-center">
          <span className="text-white font-bold text-lg">M</span>
        </div>
        <CardTitle className="text-2xl">Create account</CardTitle>
        <CardDescription>Get started with Fynans</CardDescription>
      </CardHeader>
      <CardContent>
        <GoogleSignInButton />
      </CardContent>
    </Card>
  );
}
