"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useFamilies } from "@/hooks/use-families";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { useStickyDefault } from "@/hooks/use-sticky-default";
import { PageHeader } from "@/components/ui/page-header";
import { TransactionTypeTabs } from "@/components/add-transaction/transaction-type-tabs";
import { ScanHero } from "@/components/add-transaction/scan-hero";
import { ScanQueuePanel } from "@/components/add-transaction/scan-queue-panel";
import { ManualEntrySection } from "@/components/add-transaction/manual-entry-section";
import { IncomeForm } from "@/components/add-transaction/income-form";
import { ScopeSelector } from "@/components/add-transaction/scope-selector";
import { PaymentMethodSelector } from "@/components/add-transaction/payment-method-selector";

const LS_SCOPE_KEY = "fynans:lastScope";
const LS_PAYMENT_KEY = "fynans:lastPaymentMethod";
const LS_TAB_KEY = "fynans:lastTransactionTab";

export default function AddTransactionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { families } = useFamilies();
  const { paymentMethods, isLoading: paymentMethodsLoading } = usePaymentMethods();

  const [tab, setTab] = useStickyDefault<"expense" | "income">(LS_TAB_KEY, "expense");
  const [manualExpanded, setManualExpanded] = useState(false);

  const [scope, setScope] = useStickyDefault<"PERSONAL" | "FAMILY">(LS_SCOPE_KEY, "PERSONAL");
  const [familyId, setFamilyId] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useStickyDefault<string>(LS_PAYMENT_KEY, "");

  useEffect(() => {
    if (paymentMethods.length > 0 && !paymentMethodId) {
      setPaymentMethodId(paymentMethods[0].id);
    }
    if (paymentMethodId && paymentMethods.length > 0 && !paymentMethods.find((m) => m.id === paymentMethodId)) {
      setPaymentMethodId(paymentMethods[0].id);
    }
  }, [paymentMethods, paymentMethodId, setPaymentMethodId]);

  useEffect(() => {
    if (families.length > 0 && !familyId) {
      setFamilyId(families[0].id);
    }
  }, [families, familyId]);

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["transactions-infinite"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-transaction-stats"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-expense-stats"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-recent"] });
    router.push("/transactions");
  };

  const onSaveForReview = () => {
    queryClient.invalidateQueries({ queryKey: ["pending-transactions"] });
    router.push("/transactions?tab=pending");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        label="New entry"
        title="Add Transaction"
        className="dash-animate-in"
      />

      <TransactionTypeTabs value={tab} onChange={setTab} />

      <div className="flex flex-row items-start justify-between gap-3 dash-animate-in">
        <ScopeSelector
          scope={scope}
          onScopeChange={setScope}
          familyId={familyId}
          onFamilyChange={setFamilyId}
          families={families}
        />
        <PaymentMethodSelector
          paymentMethods={paymentMethods}
          selectedId={paymentMethodId}
          onSelect={(id) => setPaymentMethodId(id ?? "")}
          isLoading={paymentMethodsLoading}
          hideLabel
        />
      </div>

      {tab === "expense" && (
        <div className="space-y-6 dash-animate-in">
          <ScanHero
            paymentMethods={paymentMethods}
            paymentMethodsLoading={paymentMethodsLoading}
            scope={scope}
            familyId={familyId}
            paymentMethodId={paymentMethodId}
          />

          <ScanQueuePanel />

          <ManualEntrySection
            expanded={manualExpanded}
            onToggle={() => setManualExpanded((v) => !v)}
            onSuccess={onSuccess}
            onSaveForReview={onSaveForReview}
            scope={scope}
            familyId={familyId}
            externalPaymentMethodId={paymentMethodId || undefined}
          />
        </div>
      )}

      {tab === "income" && (
        <div className="dash-animate-in">
          <IncomeForm
            onSuccess={onSuccess}
            onSaveForReview={onSaveForReview}
            scope={scope}
            familyId={familyId}
            externalPaymentMethodId={paymentMethodId || undefined}
          />
        </div>
      )}
    </div>
  );
}
