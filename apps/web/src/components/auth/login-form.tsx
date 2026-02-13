"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { FynansLogo } from "@/components/icons/fynans-logo";

export function LoginForm() {
  return (
    <Card className="border-none shadow-2xl">
      <CardHeader className="text-center">
        <FynansLogo className="mx-auto mb-4 h-12 w-12" />
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <GoogleSignInButton />
      </CardContent>
    </Card>
  );
}
