"use client";

import { useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { useAccountDeletion } from "@/hooks/use-account-deletion";
import { useTransactionExport } from "@/hooks/use-transaction-export";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function YourDataSection() {
  const { profile } = useProfile();
  const { download } = useTransactionExport();
  const { deleteAccount } = useAccountDeletion();

  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [hasExported, setHasExported] = useState(false);

  const email = profile?.email ?? "";
  const emailMatches =
    email !== "" && confirmEmail.trim().toLowerCase() === email.toLowerCase();

  const closeDialog = (open: boolean) => {
    setIsConfirming(open);

    if (!open) {
      setConfirmEmail("");
      setCurrentPassword("");
    }
  };

  const exportTransactions = () => {
    download.mutate(undefined, { onSuccess: () => setHasExported(true) });
  };

  const handleDelete = () => {
    const password = currentPassword.trim();

    deleteAccount.mutate({
      confirmEmail: confirmEmail.trim(),
      ...(password === "" ? {} : { currentPassword: password }),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-text">
              Download your transactions
            </p>
            <p className="text-sm text-text-secondary">
              A CSV of every transaction you can see, with its category, store
              and payment method. Take this before you delete anything.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={exportTransactions}
            disabled={download.isPending}
          >
            <Download className="mr-2 h-4 w-4" />
            {download.isPending ? "Preparing..." : "Download CSV"}
          </Button>
        </div>

        <div className="space-y-3 border-t border-border pt-6">
          <div>
            <p className="text-sm font-medium text-error">Delete your account</p>
            <p className="text-sm text-text-secondary">
              This removes your account, your transactions, your receipts and
              their images, your payment methods and your categories. It cannot
              be undone and there is no recovery window. Families you share stay
              with their remaining members.
            </p>
          </div>
          <Button variant="destructive" onClick={() => setIsConfirming(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete account
          </Button>
        </div>
      </CardContent>

      <AlertDialog open={isConfirming} onOpenChange={closeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account permanently</AlertDialogTitle>
            <AlertDialogDescription>
              Everything is erased immediately, including the receipt images in
              storage. Nobody, including us, can bring it back.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-surface-variant p-4">
              <p className="text-sm font-medium text-text">
                Take your data with you first
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                {hasExported
                  ? "You have downloaded your transactions in this session."
                  : "You have not downloaded your transactions yet."}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={exportTransactions}
                disabled={download.isPending}
              >
                <Download className="mr-2 h-4 w-4" />
                {download.isPending ? "Preparing..." : "Download CSV"}
              </Button>
            </div>

            <div>
              <Label htmlFor="confirm-email">
                Type {email || "your email address"} to confirm
              </Label>
              <Input
                id="confirm-email"
                type="email"
                autoComplete="off"
                value={confirmEmail}
                onChange={(event) => setConfirmEmail(event.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="delete-password">Your password</Label>
              <Input
                id="delete-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
              <p className="mt-1 pl-1 text-xs text-text-secondary">
                Leave this blank if you sign in with Google or Apple.
              </p>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAccount.isPending}>
              Keep my account
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!emailMatches || deleteAccount.isPending}
            >
              {deleteAccount.isPending
                ? "Deleting..."
                : "Delete everything permanently"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
