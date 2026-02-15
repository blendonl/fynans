"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";

export interface ComboboxOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string | null;
  displayValue?: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  onSearchChange?: (search: string) => void;
  onCreateNew?: (name: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  placeholder?: string;
  isLoading?: boolean;
  showAllOnFocus?: boolean;
  className?: string;
}

export function Combobox({
  options,
  value,
  displayValue,
  onChange,
  onClear,
  onSearchChange,
  onCreateNew,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  placeholder = "Search...",
  isLoading = false,
  showAllOnFocus = false,
  className,
}: ComboboxProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const lower = search.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(lower) ||
        o.sublabel?.toLowerCase().includes(lower)
    );
  }, [options, search]);

  const hasExactMatch = filtered.some(
    (o) => o.label.toLowerCase() === search.toLowerCase()
  );

  const showCreateNew = onCreateNew && search.trim() && !hasExactMatch;
  const totalItems = filtered.length + (showCreateNew ? 1 : 0);
  const shouldShowDropdown = open && (!!search.trim() || showAllOnFocus) && (isLoading || totalItems > 0);

  useEffect(() => {
    if (!shouldShowDropdown || !hasMore || !onLoadMore || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoadingMore) {
          onLoadMore();
        }
      },
      { root: contentRef.current, rootMargin: "50px" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [shouldShowDropdown, hasMore, onLoadMore, isLoadingMore]);

  const handleSelect = useCallback(
    (optionValue: string) => {
      onChange(optionValue);
      setSearch("");
      setOpen(false);
      setHighlightedIndex(-1);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    onClear?.();
    setSearch("");
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  }, [onClear]);

  const handleSearchChange = useCallback(
    (val: string) => {
      setSearch(val);
      setHighlightedIndex(-1);
      onSearchChange?.(val);
      if (!open) setOpen(true);
    },
    [onSearchChange, open]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!shouldShowDropdown) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % totalItems);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + totalItems) % totalItems);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
          handleSelect(filtered[highlightedIndex].value);
        } else if (highlightedIndex === filtered.length && showCreateNew) {
          onCreateNew!(search.trim());
          setOpen(false);
          setHighlightedIndex(-1);
        }
      } else if (e.key === "Escape") {
        setOpen(false);
        setHighlightedIndex(-1);
      }
    },
    [shouldShowDropdown, totalItems, highlightedIndex, filtered, handleSelect, showCreateNew, onCreateNew, search]
  );

  const inputValue = open ? search : value ? (displayValue || "") : search;

  return (
    <Popover open={shouldShowDropdown} onOpenChange={(o) => { if (!o) setOpen(false); }}>
      <PopoverAnchor asChild>
        <div className={cn("relative", className)}>
          <input
            ref={inputRef}
            className="flex h-10 w-full rounded-2xl border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-disabled focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors pr-8"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => {
              setOpen(true);
              if (value) setSearch("");
            }}
            onKeyDown={handleKeyDown}
          />
          {value && !open && (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text transition-colors"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </PopoverAnchor>
      <PopoverContent
        ref={contentRef}
        className="p-0 w-[var(--radix-popover-trigger-width)] rounded-xl border border-border bg-dropdown-bg shadow-md max-h-48 overflow-y-auto"
        sideOffset={4}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {isLoading ? (
          <div className="flex items-center gap-2 p-3 text-sm text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        ) : (
          <>
            {filtered.map((option, i) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "w-full text-left px-3 py-2 text-sm transition-colors",
                  highlightedIndex === i
                    ? "bg-dropdown-hover text-text"
                    : "hover:bg-dropdown-hover text-text"
                )}
                onMouseEnter={() => setHighlightedIndex(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
                {option.sublabel && (
                  <span className="ml-2 text-xs text-text-secondary">{option.sublabel}</span>
                )}
              </button>
            ))}
            {showCreateNew && (
              <button
                type="button"
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm text-primary transition-colors",
                  highlightedIndex === filtered.length
                    ? "bg-dropdown-hover"
                    : "hover:bg-dropdown-hover"
                )}
                onMouseEnter={() => setHighlightedIndex(filtered.length)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onCreateNew!(search.trim());
                  setOpen(false);
                  setHighlightedIndex(-1);
                }}
              >
                <Plus className="h-4 w-4" />
                Create &quot;{search.trim()}&quot;
              </button>
            )}
            {hasMore && <div ref={sentinelRef} className="h-1" />}
            {isLoadingMore && (
              <div className="flex items-center justify-center p-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-text-secondary" />
              </div>
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
