"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Wallet, Banknote, CreditCard } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import type { PaymentMethod, PaymentMethodType } from "@/hooks/use-payment-methods";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { PaymentMethodDialog } from "./payment-method-dialog";

export function PaymentMethodsSection() {
  const {
    paymentMethods,
    isLoading,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
  } = usePaymentMethods();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [deletingMethod, setDeletingMethod] = useState<PaymentMethod | null>(null);

  const totalBalance = paymentMethods.reduce((sum, pm) => sum + pm.currentBalance, 0);

  const handleCreate = () => {
    setEditingMethod(null);
    setDialogOpen(true);
  };

  const handleEdit = (pm: PaymentMethod) => {
    setEditingMethod(pm);
    setDialogOpen(true);
  };

  const handleSubmit = (data: { name: string; type: PaymentMethodType; color: string; initialBalance: number }) => {
    if (editingMethod) {
      updatePaymentMethod.mutate(
        { id: editingMethod.id, ...data },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createPaymentMethod.mutate(data, {
        onSuccess: () => setDialogOpen(false),
      });
    }
  };

  const handleDelete = () => {
    if (!deletingMethod) return;
    deletePaymentMethod.mutate(deletingMethod.id, {
      onSuccess: () => setDeletingMethod(null),
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <CardTitle>Payment Methods</CardTitle>
            {paymentMethods.length > 0 && (
              <span
                className={cn(
                  "font-mono text-xl font-bold tabular-nums",
                  totalBalance >= 0 ? "text-income" : "text-expense"
                )}
              >
                {formatCurrency(totalBalance)}
              </span>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={handleCreate}>
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="px-6 py-8 text-center text-sm text-text-secondary">Loading...</div>
          ) : paymentMethods.length === 0 ? (
            <div className="px-6 py-8 flex flex-col items-center gap-2">
              <Wallet className="h-8 w-8 text-text-disabled" />
              <p className="text-sm font-medium text-text-secondary">No payment methods yet</p>
              <Button variant="ghost" size="sm" onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-1" />
                Add your first payment method
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {paymentMethods.map((pm, index) => (
                <div
                  key={pm.id}
                  className={cn(
                    "flex items-center gap-3 px-6 py-3 hover:bg-surface-variant transition-colors dash-animate-in",
                    index <= 6 && `dash-delay-${index + 1}`
                  )}
                >
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: pm.color }}
                  />
                  <span className="flex-1 text-sm font-medium text-text truncate">
                    {pm.name}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-text-secondary">
                    {pm.type === "CASH" ? (
                      <Banknote className="h-3.5 w-3.5" />
                    ) : (
                      <CreditCard className="h-3.5 w-3.5" />
                    )}
                    {pm.type === "CASH" ? "Cash" : "Debit Card"}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-sm tabular-nums",
                      pm.currentBalance >= 0 ? "text-income" : "text-expense"
                    )}
                  >
                    {formatCurrency(pm.currentBalance)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(pm)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-error hover:text-error"
                    onClick={() => setDeletingMethod(pm)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <PaymentMethodDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        isLoading={createPaymentMethod.isPending || updatePaymentMethod.isPending}
        paymentMethod={editingMethod}
      />

      <AlertDialog open={!!deletingMethod} onOpenChange={(open) => !open && setDeletingMethod(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deletingMethod?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the payment method and unlink it from transactions. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-error text-white hover:bg-error/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
