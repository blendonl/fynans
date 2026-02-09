"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TransactionFiltersProps {
  typeFilter: string;
  scopeFilter: string;
  onTypeChange: (value: string) => void;
  onScopeChange: (value: string) => void;
}

export function TransactionFilters({
  typeFilter,
  scopeFilter,
  onTypeChange,
  onScopeChange,
}: TransactionFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Tabs value={typeFilter} onValueChange={onTypeChange}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="expense">Expenses</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
        </TabsList>
      </Tabs>

      <Tabs value={scopeFilter} onValueChange={onScopeChange}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="family">Family</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
