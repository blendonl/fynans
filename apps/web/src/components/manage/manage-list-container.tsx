"use client";

import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/glass/glass-card";
import { ManageListSkeleton } from "./manage-list-skeleton";
import { ManageEmptyState } from "./manage-empty-state";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

interface ManageListContainerProps {
  entity: string;
  search: string;
  onSearchChange: (search: string) => void;
  isLoading: boolean;
  isEmpty: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  children: ReactNode;
}

export function ManageListContainer({
  entity,
  search,
  onSearchChange,
  isLoading,
  isEmpty,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  children,
}: ManageListContainerProps) {
  const loadMoreRef = useIntersectionObserver(
    () => fetchNextPage(),
    { enabled: hasNextPage && !isFetchingNextPage }
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
        <Input
          placeholder={`Search ${entity}...`}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <ManageListSkeleton />
      ) : isEmpty ? (
        <ManageEmptyState entity={entity} />
      ) : (
        <>
          <GlassCard>
            <div className="divide-y divide-glass-border-outer">
              {children}
            </div>
          </GlassCard>
          <div ref={loadMoreRef} className="h-1" />
          {isFetchingNextPage && (
            <div className="flex justify-center py-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
