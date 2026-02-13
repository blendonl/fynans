"use client";

import Link from "next/link";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { FynansLogo } from "@/components/icons/fynans-logo";

export function RegisterForm() {
  return (
    <div className="auth-card-in">
      <div className="rounded-2xl bg-surface/90 backdrop-blur-2xl shadow-2xl border border-glass-border relative overflow-hidden">
        {/* Gold accent line at top */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        {/* Subtle glass highlight */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />

        <div className="relative px-8 pt-12 pb-10">
          {/* Logo with breathing glow */}
          <div className="dash-animate-in flex justify-center mb-8">
            <FynansLogo className="h-14 w-14 auth-logo-pulse" />
          </div>

          {/* Typography */}
          <div className="text-center mb-10">
            <h1 className="dash-animate-in dash-delay-1 text-3xl font-bold tracking-tight text-text">
              Create account
            </h1>
            <p className="dash-animate-in dash-delay-2 text-text-secondary mt-2 text-sm">
              Get started with Fynans
            </p>
          </div>

          {/* Auth action */}
          <div className="dash-animate-in dash-delay-3">
            <GoogleSignInButton />
          </div>

          {/* Switch to login */}
          <div className="dash-animate-in dash-delay-4 mt-8 text-center">
            <p className="text-sm text-text-secondary/80">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary font-semibold hover:underline underline-offset-4 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
