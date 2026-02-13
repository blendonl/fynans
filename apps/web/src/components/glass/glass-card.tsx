import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "strong" | "subtle";
}

export function GlassCard({ className, variant = "default", children, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl backdrop-blur-lg overflow-hidden",
        "border border-glass-border-outer",
        "shadow-[0_1px_3px_var(--glass-shadow),0_4px_16px_var(--glass-shadow-strong)]",
        variant === "default" && "bg-glass-bg",
        variant === "strong" && "bg-glass-bg-strong",
        variant === "subtle" && "bg-glass-bg/30",
        className
      )}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}
