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
          createdAt: tx?.createdAt as string | undefined,
          description: tx?.description as string | undefined,
          user: tx?.user as { id: string; firstName: string; lastName: string },
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
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="h-48 rounded-xl bg-surface-variant animate-pulse" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-text-secondary">Transaction not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <TransactionDetail
        transaction={transaction}
        onDelete={() => deleteMutation.mutate()}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
