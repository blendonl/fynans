export function DashboardSkeleton() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <div className="h-3 w-24 rounded-full skeleton-shimmer" />
        <div className="h-8 w-36 rounded-2xl skeleton-shimmer mt-2" />
      </div>

      <div className="h-56 rounded-2xl skeleton-shimmer" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 h-80 rounded-2xl skeleton-shimmer" />
        <div className="lg:col-span-7 h-80 rounded-2xl skeleton-shimmer" />
      </div>

      <div className="h-64 rounded-2xl skeleton-shimmer" />

      <div className="grid grid-cols-3 gap-3">
        <div className="h-24 rounded-2xl skeleton-shimmer" />
        <div className="h-24 rounded-2xl skeleton-shimmer" />
        <div className="h-24 rounded-2xl skeleton-shimmer" />
      </div>
    </div>
  );
}
