"use client";

import { useState, useMemo } from "react";
import { useTransactions } from "@/hooks/use-transactions";
import { useFamilies } from "@/hooks/use-families";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionList } from "@/components/transactions/transaction-list";

export default function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState("all");
  const { families } = useFamilies();

  const { data: transactions = [], isLoading } = useTransactions(
    {
      type: typeFilter as "all" | "expense" | "income",
      scope: scopeFilter as "all" | "personal" | "family",
      familyId: null,
      categories: [],
      minAmount: "",
      maxAmount: "",
      dateFrom: null,
      dateTo: null,
    },
    families
  );

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (scopeFilter === "personal" && t.scope !== "PERSONAL") return false;
      if (scopeFilter === "family" && t.scope !== "FAMILY") return false;
      return true;
    });
  }, [transactions, typeFilter, scopeFilter]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Transactions</h1>
      </div>

      <TransactionFilters
        typeFilter={typeFilter}
        scopeFilter={scopeFilter}
        onTypeChange={setTypeFilter}
        onScopeChange={setScopeFilter}
      />

      <TransactionList transactions={filtered} isLoading={isLoading} />
    </div>
  );
}
