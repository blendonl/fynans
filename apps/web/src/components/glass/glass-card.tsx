import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "strong";
}

export function GlassCard({ className, variant = "default", children, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-glass-border backdrop-blur-xl shadow-lg",
        variant === "default" ? "bg-glass-bg" : "bg-glass-bg-strong",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
