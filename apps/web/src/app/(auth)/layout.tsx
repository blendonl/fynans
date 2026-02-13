export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)]" />

      {/* Radial vignette for depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.15) 100%)",
        }}
      />

      {/* Animated gradient orbs */}
      <div className="auth-orb auth-orb-gold" />
      <div className="auth-orb auth-orb-teal" />

      {/* Decorative bar chart motifs (brand element) */}
      <svg
        className="absolute bottom-[12%] left-[6%] w-16 h-20 text-white/[0.06] auth-bars"
        viewBox="0 0 64 80"
      >
        <rect x="0" y="44" width="14" height="36" rx="3" fill="currentColor" />
        <rect
          x="20"
          y="22"
          width="14"
          height="58"
          rx="3"
          fill="currentColor"
        />
        <rect x="40" y="0" width="14" height="80" rx="3" fill="currentColor" />
      </svg>
      <svg
        className="absolute top-[15%] right-[8%] w-12 h-16 text-white/[0.04] rotate-12 auth-bars"
        style={{ animationDirection: "reverse", animationDuration: "35s" }}
        viewBox="0 0 48 64"
      >
        <rect x="0" y="32" width="10" height="32" rx="2" fill="currentColor" />
        <rect
          x="14"
          y="16"
          width="10"
          height="48"
          rx="2"
          fill="currentColor"
        />
        <rect x="28" y="0" width="10" height="64" rx="2" fill="currentColor" />
      </svg>

      {/* Content */}
      <div className="w-full max-w-md relative z-10">{children}</div>
    </div>
  );
}
