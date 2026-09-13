import { FynansLogo } from "@/components/icons/fynans-logo";

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="auth-card-in">
      <div className="rounded-2xl bg-surface/90 backdrop-blur-2xl shadow-2xl border border-glass-border relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />

        <div className="relative px-8 pt-12 pb-10">
          <div className="dash-animate-in flex justify-center mb-8">
            <FynansLogo className="h-14 w-14 auth-logo-pulse" />
          </div>

          <div className="text-center mb-10">
            <h1 className="dash-animate-in dash-delay-1 text-3xl font-bold tracking-tight text-text">
              {title}
            </h1>
            <p className="dash-animate-in dash-delay-2 text-text-secondary mt-2 text-sm">
              {description}
            </p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
