"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, CreditCard, Loader2, Receipt, Tags } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { GlassCard } from "@/components/glass/glass-card";
import { Button } from "@/components/ui/button";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import type { PaymentMethodType } from "@/hooks/use-payment-methods";
import { PaymentMethodDialog } from "@/components/profile/payment-method-dialog";
import { useStickyDefault } from "@/hooks/use-sticky-default";
import { cn } from "@/lib/utils";
import { useOnboarding } from "./use-onboarding";

const LS_DISMISSED_KEY = "fynans:onboardingDismissed";
const DISMISSED = "yes";
const NOT_DISMISSED = "no";

interface StepProps {
  icon: LucideIcon;
  title: string;
  description: string;
  done: boolean;
  busy?: boolean;
  action?: React.ReactNode;
}

function Step({ icon: Icon, title, description, done, busy, action }: StepProps) {
  return (
    <li className="flex items-start gap-3 py-3">
      <span
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          done ? "bg-income/15 text-income" : "bg-surface-variant text-text-secondary"
        )}
      >
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : done ? (
          <Check className="h-4 w-4" />
        ) : (
          <Icon className="h-3.5 w-3.5" />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-medium",
            done ? "text-text-secondary line-through" : "text-text"
          )}
        >
          {title}
        </p>
        <p className="text-xs text-text-disabled mt-0.5">{description}</p>
      </div>

      {!done && action && <div className="shrink-0">{action}</div>}
    </li>
  );
}

export function OnboardingChecklist() {
  const { status, hasTransactions, isLoading, isSeeding, seedFailed, seedCatalog } =
    useOnboarding();
  const { paymentMethods, createPaymentMethod } = usePaymentMethods();
  const [dismissed, setDismissed] = useStickyDefault<typeof DISMISSED | typeof NOT_DISMISSED>(
    LS_DISMISSED_KEY,
    NOT_DISMISSED
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const hasCategories = status?.hasExpenseCategories ?? false;
  const hasPaymentMethod = paymentMethods.length > 0;
  const complete = hasCategories && hasPaymentMethod && hasTransactions;

  if (isLoading || complete || dismissed === DISMISSED) {
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
    <>
      <GlassCard className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold text-text-secondary tracking-[0.2em] uppercase">
              Getting started
            </p>
            <h2 className="text-lg font-bold text-text mt-1">
              Three steps to your first receipt
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setDismissed(DISMISSED)}>
            Dismiss
          </Button>
        </div>

        <ul className="mt-4 divide-y divide-border-light">
          <Step
            icon={Tags}
            title="Your spending categories are ready"
            description={
              seedFailed
                ? "We could not create them automatically. Try again, or add your own under Manage."
                : "A starter set of expense, income and item categories, all yours to rename."
            }
            done={hasCategories}
            busy={isSeeding}
            action={
              seedFailed ? (
                <Button size="sm" variant="outline" onClick={() => seedCatalog()}>
                  Retry
                </Button>
              ) : undefined
            }
          />

          <Step
            icon={CreditCard}
            title="Add a payment method"
            description="Cash or a debit card, with the balance you have on it today."
            done={hasPaymentMethod}
            action={
              <Button size="sm" onClick={() => setDialogOpen(true)}>
                Add
              </Button>
            }
          />

          <Step
            icon={Receipt}
            title="Record your first expense"
            description="Scan a receipt, or type an amount and pick a category."
            done={hasTransactions}
            action={
              <Button size="sm" asChild>
                <Link href="/add">Add</Link>
              </Button>
            }
          />
        </ul>
      </GlassCard>

      <PaymentMethodDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreatePaymentMethod}
        isLoading={createPaymentMethod.isPending}
      />
    </>
  );
}
