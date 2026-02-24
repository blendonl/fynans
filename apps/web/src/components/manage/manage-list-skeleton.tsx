import { GlassCard } from "@/components/glass/glass-card";

export function ManageListSkeleton() {
  return (
    <GlassCard>
      <div className="divide-y divide-glass-border-outer">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded-md bg-surface-variant skeleton-shimmer" />
              <div className="h-3 w-20 rounded-md bg-surface-variant/60 skeleton-shimmer" />
            </div>
            <div className="h-4 w-4 rounded bg-surface-variant/40 skeleton-shimmer" />
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
