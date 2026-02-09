"use client";

import { useState } from "react";
import { X, Plus, MapPin } from "lucide-react";
import type { Store } from "@mmoneymanager/shared";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface StoreSelectorProps {
  stores: Store[];
  selectedStore: Store | null;
  onSelect: (store: Store) => void;
  onClear: () => void;
  onSearch: (query: string) => void;
  onCreateNew: (name: string) => void;
  isLoading: boolean;
}

export function StoreSelector({
  stores,
  selectedStore,
  onSelect,
  onClear,
  onSearch,
  onCreateNew,
  isLoading,
}: StoreSelectorProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  if (selectedStore) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-text">Store</label>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1 py-1.5 px-3">
            <MapPin className="h-3 w-3" />
            {selectedStore.name}
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
      <label className="text-sm font-medium text-text">Store</label>
      <Input
        placeholder="Search for a store"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          onSearch(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && search.trim() && (
        <div className="border border-border rounded-lg bg-dropdown-bg shadow-md max-h-48 overflow-y-auto">
          {isLoading ? (
            <div className="p-3 text-sm text-text-secondary">Loading...</div>
          ) : (
            <>
              {stores.map((store) => (
                <button
                  key={store.id}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-dropdown-hover transition-colors"
                  onClick={() => {
                    onSelect(store);
                    setSearch("");
                    setIsOpen(false);
                  }}
                >
                  <p>{store.name}</p>
                  <p className="text-xs text-text-secondary">{store.location}</p>
                </button>
              ))}
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
                Add new store
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
