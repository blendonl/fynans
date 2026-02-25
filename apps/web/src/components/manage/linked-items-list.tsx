"use client";

import { useState } from "react";
import { GlassCard } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, ArrowRight } from "lucide-react";

interface LinkedItemsListProps {
  items: Array<{ id: string; name: string }>;
  isLoading: boolean;
  currentCategoryId: string;
  allCategories: Array<{ id: string; name: string }>;
  onReassign: (itemId: string, newCategoryId: string) => void;
  isReassigning: boolean;
}

export function LinkedItemsList({
  items,
  isLoading,
  currentCategoryId,
  allCategories,
  onReassign,
  isReassigning,
}: LinkedItemsListProps) {
  const [selectedTargets, setSelectedTargets] = useState<
    Record<string, string>
  >({});

  const otherCategories = allCategories.filter(
    (c) => c.id !== currentCategoryId
  );

  return (
    <GlassCard>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-4 w-4 text-text-secondary" />
          <h3 className="text-sm font-semibold text-text">
            Items in this Category
          </h3>
          {!isLoading && <Badge variant="secondary">{items.length}</Badge>}
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-12 rounded-xl bg-surface-variant skeleton-shimmer"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-text-secondary">
            No items in this category.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
              >
                <p className="text-sm font-medium text-text min-w-0 truncate">
                  {item.name}
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  {otherCategories.length > 0 && (
                    <>
                      <Select
                        value={selectedTargets[item.id] ?? ""}
                        onValueChange={(value) =>
                          setSelectedTargets((prev) => ({
                            ...prev,
                            [item.id]: value,
                          }))
                        }
                      >
                        <SelectTrigger className="w-[160px] h-8 text-xs">
                          <SelectValue placeholder="Move to..." />
                        </SelectTrigger>
                        <SelectContent>
                          {otherCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        disabled={
                          !selectedTargets[item.id] || isReassigning
                        }
                        onClick={() =>
                          onReassign(item.id, selectedTargets[item.id])
                        }
                      >
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
