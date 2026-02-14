"use client";

import { use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { TransactionDetail } from "@/components/transactions/transaction-detail";
import type { Transaction } from "@fynans/shared";

export default function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const type = searchParams.get("type") || "expense";
  const endpoint = type === "income" ? "/incomes" : "/expenses";

  const { data: transaction, isLoading } = useQuery({
    queryKey: ["transaction", id, type],
    queryFn: async () => {
      const data = (await apiClient.get(`${endpoint}/${id}`)) as Record<string, unknown>;
      const tx = data.transaction as Record<string, unknown> | undefined;
      return {
        id: data.id as string,
        type: type as "expense" | "income",
        category: data.category as { id: string; name: string },
        store: data.store as Transaction["store"],
        scope: (tx?.scope as "PERSONAL" | "FAMILY") || "PERSONAL",
        familyId: tx?.familyId as string | undefined,
        transaction: {
          id: (tx?.id as string) || "",
          value: (tx?.value as number) || 0,
          recordedAt: tx?.recordedAt as string | undefined,
          description: tx?.description as string | undefined,
          user: tx?.user as { id: string; firstName: string; lastName: string; image?: string | null },
        },
        items: data.items as Transaction["items"],
        receiptImages: (data.receiptImages as string[]) || [],
      } satisfies Transaction;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiClient.delete(`${endpoint}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      router.push("/transactions");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 rounded-md bg-surface-variant skeleton-shimmer" />
        <div className="h-56 rounded-2xl bg-surface-variant/30 skeleton-shimmer" />
        <div className="h-40 rounded-2xl bg-surface-variant/30 skeleton-shimmer" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Transaction not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 dash-animate-in">
      <Button variant="ghost" onClick={() => router.back()} className="text-text-secondary">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Transactions
      </Button>
      <TransactionDetail
        transaction={transaction}
        onDelete={() => deleteMutation.mutate()}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
