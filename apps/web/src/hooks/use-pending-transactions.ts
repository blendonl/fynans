import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { customInstance } from "@/api/custom-instance";
import type { ExpenseResponse, Family } from "@/types";
import { mapExpenseToTransaction, sortTransactionsByDate } from "@/lib/transaction-mappers";

type TransactionStatus = "CONFIRMED" | "PENDING" | "REJECTED";

/**
 * Runtime expense responses include status/rejectionReason fields
 * added by the pending transactions feature, not yet in the OpenAPI spec.
 */
interface ExpenseWithStatus extends ExpenseResponse {
  status?: TransactionStatus;
  rejectionReason?: string;
}

interface PaginatedResponse {
  data: ExpenseWithStatus[];
  total: number;
  page: number;
  limit: number;
}

const PAGE_SIZE = 20;

// ── API helpers ──────────────────────────────────────────────────────

async function fetchExpenses(params: Record<string, string | number>) {
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") query.set(k, String(v));
  }
  const url = `/expenses?${query.toString()}`;
  const res = await customInstance<{ data: PaginatedResponse; status: number; headers: Headers }>(url, { method: "GET" });
  return res.data;
}

async function approveExpense(id: string) {
  return customInstance(`/expenses/${id}/approve`, { method: "POST" });
}

async function rejectExpense(id: string, rejectionReason: string) {
  return customInstance(`/expenses/${id}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rejectionReason }),
  });
}

async function resubmitExpense(id: string, data?: Record<string, unknown>) {
  return customInstance(`/expenses/${id}/resubmit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data ?? {}),
  });
}

async function updatePendingExpense(id: string, data: Record<string, unknown>) {
  return customInstance(`/expenses/${id}/pending`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

async function deleteExpense(id: string) {
  return customInstance(`/expenses/${id}`, { method: "DELETE" });
}

// ── Query key factory ────────────────────────────────────────────────

export const pendingKeys = {
  all: ["pending-transactions"] as const,
  count: () => [...pendingKeys.all, "count"] as const,
  list: (status: TransactionStatus) => [...pendingKeys.all, "list", status] as const,
  detail: (id: string) => [...pendingKeys.all, "detail", id] as const,
};

// ── Hooks ────────────────────────────────────────────────────────────

export function usePendingTransactionCount() {
  return useQuery({
    queryKey: pendingKeys.count(),
    queryFn: async () => {
      const res = await fetchExpenses({ status: "PENDING", page: 1, limit: 1 });
      return res.total;
    },
    staleTime: 30_000,
  });
}

export function usePendingExpenses(status: TransactionStatus = "PENDING", families: Family[] = []) {
  return useInfiniteQuery({
    queryKey: pendingKeys.list(status),
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetchExpenses({ status, page: pageParam, limit: PAGE_SIZE });

      const transactions = res.data.map((expense) => {
        const tx = mapExpenseToTransaction(expense);
        return {
          ...tx,
          status: expense.status,
          rejectionReason: expense.rejectionReason,
        };
      });

      return {
        transactions: sortTransactionsByDate(transactions),
        total: res.total,
        hasMore: pageParam * PAGE_SIZE < res.total,
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
      const res = await customInstance<{ data: ExpenseWithStatus; status: number; headers: Headers }>(`/expenses/${id}`, { method: "GET" });
      return res.data;
    },
    enabled: !!id,
  });
}

export function useApprovePendingExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveExpense(id),
    onSuccess: () => {
      toast.success("Expense approved");
      queryClient.invalidateQueries({ queryKey: pendingKeys.all });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
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
    mutationFn: ({ id, rejectionReason }: { id: string; rejectionReason: string }) =>
      rejectExpense(id, rejectionReason),
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
      resubmitExpense(id, data),
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
      updatePendingExpense(id, data),
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
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      toast.success("Expense deleted");
      queryClient.invalidateQueries({ queryKey: pendingKeys.all });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactions-infinite"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete expense");
    },
  });
}
