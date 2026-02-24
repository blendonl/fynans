import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  expenseControllerFindAll,
  expenseControllerFindOne,
  expenseControllerApprove,
  expenseControllerReject,
  expenseControllerResubmit,
  expenseControllerUpdatePending,
  expenseControllerRemove,
} from "@/api/generated/endpoints/expense/expense";
import type { ExpenseControllerFindAllParams } from "@/api/generated/model/expenseControllerFindAllParams";
import type { RejectExpenseRequestDto } from "@/api/generated/model/rejectExpenseRequestDto";
import type { ResubmitExpenseRequestDto } from "@/api/generated/model/resubmitExpenseRequestDto";
import type { UpdatePendingExpenseRequestDto } from "@/api/generated/model/updatePendingExpenseRequestDto";
import type { Family } from "@/types";
import { mapExpenseToTransaction, sortTransactionsByDate } from "@/lib/transaction-mappers";
import { queryKeys, DEFAULT_PAGE_SIZE } from "@/lib/query-keys";

type TransactionStatus = "CONFIRMED" | "PENDING" | "REJECTED";

// ── Query key factory ────────────────────────────────────────────────

export const pendingKeys = queryKeys.pending;

export function usePendingTransactionCount() {
  return useQuery({
    queryKey: pendingKeys.count(),
    queryFn: async () => {
      const params: ExpenseControllerFindAllParams = { status: "PENDING", page: 1, limit: 1 };
      const res = await expenseControllerFindAll(params);
      return res.data.total;
    },
    staleTime: 30_000,
  });
}

export function usePendingExpenses(status: TransactionStatus = "PENDING", _families: Family[] = []) {
  return useInfiniteQuery({
    queryKey: pendingKeys.list(status),
    queryFn: async ({ pageParam = 1 }) => {
      const params: ExpenseControllerFindAllParams = {
        status: status as ExpenseControllerFindAllParams["status"],
        page: pageParam,
        limit: DEFAULT_PAGE_SIZE,
      };
      const res = await expenseControllerFindAll(params);
      const { data: expenses, total } = res.data;

      const transactions = expenses.map((expense) => {
        const tx = mapExpenseToTransaction(expense);
        return {
          ...tx,
          status: expense.status,
          rejectionReason: expense.rejectionReason,
        };
      });

      return {
        transactions: sortTransactionsByDate(transactions),
        total,
        hasMore: pageParam * DEFAULT_PAGE_SIZE < total,
      };
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      return lastPage.hasMore ? (lastPageParam as number) + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

export function usePendingExpense(id: string) {
  return useQuery({
    queryKey: pendingKeys.detail(id),
    queryFn: async () => {
      const res = await expenseControllerFindOne(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useApprovePendingExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseControllerApprove(id),
    onSuccess: () => {
      toast.success("Expense approved");
      queryClient.invalidateQueries({ queryKey: pendingKeys.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({ queryKey: ["transactions-infinite"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-transaction-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-expense-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-recent"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to approve expense");
    },
  });
}

export function useRejectPendingExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rejectionReason }: { id: string; rejectionReason: string }) => {
      const dto: RejectExpenseRequestDto = { rejectionReason };
      return expenseControllerReject(id, dto);
    },
    onSuccess: () => {
      toast.success("Expense rejected");
      queryClient.invalidateQueries({ queryKey: pendingKeys.all });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to reject expense");
    },
  });
}

export function useResubmitExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: Record<string, unknown> }) =>
      expenseControllerResubmit(id, (data ?? {}) as ResubmitExpenseRequestDto),
    onSuccess: () => {
      toast.success("Expense re-submitted for review");
      queryClient.invalidateQueries({ queryKey: pendingKeys.all });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to re-submit expense");
    },
  });
}

export function useUpdatePendingExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      expenseControllerUpdatePending(id, data as UpdatePendingExpenseRequestDto),
    onSuccess: () => {
      toast.success("Pending expense updated");
      queryClient.invalidateQueries({ queryKey: pendingKeys.all });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update expense");
    },
  });
}

export function useDeletePendingExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseControllerRemove(id),
    onSuccess: () => {
      toast.success("Expense deleted");
      queryClient.invalidateQueries({ queryKey: pendingKeys.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({ queryKey: ["transactions-infinite"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete expense");
    },
  });
}
