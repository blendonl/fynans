"use client";

import type { Family } from "@fynans/shared";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Users } from "lucide-react";

interface ScopeSelectorProps {
  scope: "PERSONAL" | "FAMILY";
  onScopeChange: (scope: "PERSONAL" | "FAMILY") => void;
  familyId: string;
  onFamilyChange: (familyId: string) => void;
  families: Family[];
}

export function ScopeSelector({ scope, onScopeChange, familyId, onFamilyChange, families }: ScopeSelectorProps) {
  return (
    <div className="flex gap-2">
      <div className="flex rounded-2xl bg-surface-variant p-1 gap-1">
        <button
          type="button"
          onClick={() => onScopeChange("PERSONAL")}
          className={cn(
            "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer",
            scope === "PERSONAL"
              ? "bg-surface text-text shadow-sm"
              : "text-text-secondary hover:text-text"
          )}
        >
          <User className="h-3.5 w-3.5" />
          Personal
        </button>
        <button
          type="button"
          onClick={() => onScopeChange("FAMILY")}
          className={cn(
            "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer",
            scope === "FAMILY"
              ? "bg-surface text-text shadow-sm"
              : "text-text-secondary hover:text-text"
          )}
        >
          <Users className="h-3.5 w-3.5" />
          Family
        </button>
      </div>

      {scope === "FAMILY" && (
        <Select value={familyId} onValueChange={onFamilyChange}>
          <SelectTrigger className="flex-1 min-w-0">
            <SelectValue placeholder="Select family" />
          </SelectTrigger>
          <SelectContent>
            {families.map((f) => (
              <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
