"use client";

import { useState, useMemo } from "react";
import { X, Plus, Tag } from "lucide-react";
import type { Category } from "@mmoneymanager/shared";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CategorySelectorProps {
  categories: Category[];
  selectedCategory: Category | null;
  onSelect: (category: Category) => void;
  onClear: () => void;
  onCreateNew: (name: string) => void;
  isLoading: boolean;
}

export function CategorySelector({
  categories,
  selectedCategory,
  onSelect,
  onClear,
  onCreateNew,
  isLoading,
}: CategorySelectorProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [categories, search]);

  const hasExactMatch = filtered.some(
    (c) => c.name.toLowerCase() === search.toLowerCase()
  );

  if (selectedCategory && !isOpen) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-text">Category</label>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="gap-1 py-1.5 px-3">
            <Tag className="h-3 w-3" />
            {selectedCategory.name}
            <button onClick={onClear} className="ml-1 hover:opacity-70">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-text">Category</label>
      <Input
        placeholder="Type or select a category"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && (search.trim() || categories.length > 0) && (
        <div className="border border-border rounded-lg bg-dropdown-bg shadow-md max-h-48 overflow-y-auto">
          {isLoading ? (
            <div className="p-3 text-sm text-text-secondary">Loading...</div>
          ) : (
            <>
              {filtered.map((cat) => (
                <button
                  key={cat.id}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-dropdown-hover transition-colors"
                  onClick={() => {
                    onSelect(cat);
                    setSearch("");
                    setIsOpen(false);
                  }}
                >
                  {cat.name}
                  {cat.isConnectedToStore && (
                    <span className="ml-2 text-xs text-text-secondary">(store)</span>
                  )}
                </button>
              ))}
              {search.trim() && !hasExactMatch && (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-primary"
                  onClick={() => {
                    onCreateNew(search.trim());
                    setSearch("");
                    setIsOpen(false);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create &quot;{search.trim()}&quot;
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
