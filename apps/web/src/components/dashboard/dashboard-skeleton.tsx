export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header: greeting + bell */}
      <div className="flex items-start justify-between">
        <div>
          <div className="h-3 w-24 rounded-full skeleton-shimmer" />
          <div className="h-8 w-36 rounded-2xl skeleton-shimmer mt-2" />
        </div>
        <div className="h-9 w-9 rounded-xl skeleton-shimmer" />
      </div>

      {/* Date filter */}
      <div className="h-10 w-full max-w-xs rounded-xl skeleton-shimmer" />

      {/* Balance hero */}
      <div className="h-56 rounded-2xl skeleton-shimmer" />

      {/* 2-column charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-72 rounded-2xl skeleton-shimmer" />
        <div className="h-72 rounded-2xl skeleton-shimmer" />
      </div>

      {/* 12-col grid: breakdown + recent */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 h-80 rounded-2xl skeleton-shimmer" />
        <div className="lg:col-span-7 h-80 rounded-2xl skeleton-shimmer" />
      </div>

      {/* Top expenses */}
      <div className="h-64 rounded-2xl skeleton-shimmer" />

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        <div className="h-24 rounded-2xl skeleton-shimmer" />
        <div className="h-24 rounded-2xl skeleton-shimmer" />
        <div className="h-24 rounded-2xl skeleton-shimmer" />
      </div>
    </div>
  );
}
