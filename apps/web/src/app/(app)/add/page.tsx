"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useFamilies } from "@/hooks/use-families";
import { TransactionTypeTabs } from "@/components/add-transaction/transaction-type-tabs";
import { ScopeSelector } from "@/components/add-transaction/scope-selector";
import { ExpenseForm } from "@/components/add-transaction/expense-form";
import { IncomeForm } from "@/components/add-transaction/income-form";
import { PageHeader } from "@/components/ui/page-header";

export default function AddTransactionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"expense" | "income">("expense");
  const [scope, setScope] = useState<"PERSONAL" | "FAMILY">("PERSONAL");
  const [familyId, setFamilyId] = useState("");
  const { families } = useFamilies();

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["transactions-infinite"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-transaction-stats"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-expense-stats"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-recent"] });
    router.push("/transactions");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        label="New entry"
        title="Add Transaction"
        description="Record an expense or income to keep your finances up to date."
        className="dash-animate-in"
      >
        <TransactionTypeTabs value={tab} onChange={setTab} />
        <ScopeSelector
          scope={scope}
          onScopeChange={setScope}
          familyId={familyId}
          onFamilyChange={setFamilyId}
          families={families}
        />
      </PageHeader>

      <div className="rounded-3xl bg-surface border border-border-light p-5 sm:p-6 lg:p-8 shadow-sm dash-animate-in dash-delay-2">
        {tab === "expense" ? (
          <ExpenseForm onSuccess={onSuccess} scope={scope} familyId={familyId} />
        ) : (
          <IncomeForm onSuccess={onSuccess} scope={scope} familyId={familyId} />
        )}
      </div>
    </div>
  );
}
