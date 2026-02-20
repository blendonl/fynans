"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { PaymentMethod, PaymentMethodType } from "@/hooks/use-payment-methods";

const COLOR_PRESETS = [
  "#22C55E", // green
  "#3B82F6", // blue
  "#F97316", // orange
  "#A855F7", // purple
  "#EF4444", // red
  "#06B6D4", // cyan
];

const PAYMENT_METHOD_TYPE_LABELS: Record<PaymentMethodType, string> = {
  CASH: "Cash",
  DEBIT_CARD: "Debit Card",
};

interface PaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; type: PaymentMethodType; color: string; initialBalance: number }) => void;
  isLoading: boolean;
  paymentMethod?: PaymentMethod | null;
}

export function PaymentMethodDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  paymentMethod,
}: PaymentMethodDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<PaymentMethodType>("CASH");
  const [initialBalance, setInitialBalance] = useState("");
  const [color, setColor] = useState(COLOR_PRESETS[0]);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (open) {
      if (paymentMethod) {
        setName(paymentMethod.name);
        setType(paymentMethod.type);
        setInitialBalance(String(paymentMethod.initialBalance));
        setColor(paymentMethod.color);
      } else {
        setName("");
        setType("CASH");
        setInitialBalance("");
        setColor(COLOR_PRESETS[0]);
      }
      setNameError("");
    }
  }, [open, paymentMethod]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError("Name is required");
      return;
    }
    onSubmit({
      name: name.trim(),
      type,
      color,
      initialBalance: initialBalance ? parseFloat(initialBalance) : 0,
    });
  };

  const isEditing = !!paymentMethod;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Payment Method" : "Add Payment Method"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of your payment method."
              : "Add a new payment method to track your finances."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="pm-name">Name</Label>
            <Input
              id="pm-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError("");
              }}
              placeholder="e.g., Cash, Visa, Savings"
            />
            {nameError && (
              <p className="text-sm text-error mt-1 pl-1">{nameError}</p>
            )}
          </div>
          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as PaymentMethodType)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PAYMENT_METHOD_TYPE_LABELS) as PaymentMethodType[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {PAYMENT_METHOD_TYPE_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="pm-balance">Initial Balance</Label>
            <Input
              id="pm-balance"
              type="number"
              step="0.01"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label>Color</Label>
            <div className="flex gap-3 mt-1">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setColor(preset)}
                  className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center transition-all",
                    color === preset && "ring-2 ring-primary ring-offset-2 ring-offset-surface"
                  )}
                  style={{ backgroundColor: preset }}
                >
                  {color === preset && <Check className="h-3.5 w-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isLoading}>
              {isEditing ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
