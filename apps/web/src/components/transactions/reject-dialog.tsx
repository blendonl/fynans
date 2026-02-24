"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface RejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}

export function RejectDialog({ open, onOpenChange, onConfirm, isLoading }: RejectDialogProps) {
  const [reason, setReason] = useState("");

  const canSubmit = reason.trim().length >= 5;

  const handleConfirm = () => {
    if (canSubmit) {
      onConfirm(reason.trim());
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject this expense?</AlertDialogTitle>
          <AlertDialogDescription>
            Provide a reason so the creator knows what to fix.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <textarea
          className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none min-h-[100px]"
          placeholder="Reason for rejection (min 5 characters)..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!canSubmit || isLoading}
            loading={isLoading}
          >
            Reject
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
