"use client";

import { useState } from "react";
import { CreditCard, Loader2, Tags } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { GlassCard } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import type { PaymentMethodType } from "@/hooks/use-payment-methods";
import { PaymentMethodDialog } from "@/components/profile/payment-method-dialog";
import { useOnboarding } from "./use-onboarding";

interface PromptProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action: React.ReactNode;
}

function Prompt({ icon: Icon, title, description, action }: PromptProps) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text">{title}</p>
          <p className="text-xs text-text-secondary mt-1">{description}</p>
        </div>
        <div className="shrink-0">{action}</div>
      </div>
    </GlassCard>
  );
}

export function SetupPrompts() {
  const { status, isSeeding, seedFailed, seedCatalog } = useOnboarding();
  const { paymentMethods, isLoading: paymentMethodsLoading, createPaymentMethod } =
    usePaymentMethods();
  const [dialogOpen, setDialogOpen] = useState(false);

  const needsPaymentMethod = !paymentMethodsLoading && paymentMethods.length === 0;
  const needsCategories = status ? !status.hasExpenseCategories : false;

  if (!needsPaymentMethod && !needsCategories) {
    return null;
  }

  const handleCreatePaymentMethod = (data: {
    name: string;
    type: PaymentMethodType;
    color: string;
    initialBalance: number;
  }) => {
    createPaymentMethod.mutate(data, { onSuccess: () => setDialogOpen(false) });
  };

  return (
    <div className="space-y-3 dash-animate-in">
      {needsCategories && (
        <Prompt
          icon={Tags}
          title="You have no expense categories yet"
          description={
            seedFailed
              ? "Setting up your starter categories failed. Try again, or type a new category name straight into the Category box below."
              : "Setting up a starter set of categories so you can file this expense."
          }
          action={
            isSeeding ? (
              <Loader2 className="h-4 w-4 animate-spin text-text-secondary" />
            ) : (
              <Button size="sm" variant="outline" onClick={() => seedCatalog()}>
                {seedFailed ? "Retry" : "Set up"}
              </Button>
            )
          }
        />
      )}

      {needsPaymentMethod && (
        <Prompt
          icon={CreditCard}
          title="Add a payment method first"
          description="Every transaction is settled against one. Cash is a fine place to start."
          action={
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              Add
            </Button>
          }
        />
      )}

      <PaymentMethodDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreatePaymentMethod}
        isLoading={createPaymentMethod.isPending}
      />
    </div>
  );
}
