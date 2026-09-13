"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  onboardingControllerStatus,
  onboardingControllerBootstrap,
  getOnboardingControllerStatusQueryKey,
} from "@/api/generated/endpoints/onboarding/onboarding";
import { expenseControllerFindAll } from "@/api/generated/endpoints/expense/expense";
import { incomeControllerFindAll } from "@/api/generated/endpoints/income/income";
import type { OnboardingStatusResponseDto } from "@/api/generated/model";
import { queryKeys } from "@/lib/query-keys";

const FIRST_ROW_ONLY = { page: 1, limit: 1 } as unknown as Record<string, string>;
const HAS_ANY_TRANSACTION_KEY = ["onboarding", "has-any-transaction"] as const;

export function useOnboarding() {
  const queryClient = useQueryClient();
  const statusKey = getOnboardingControllerStatusQueryKey();

  const statusQuery = useQuery({
    queryKey: statusKey,
    queryFn: async () => {
      const response = await onboardingControllerStatus();
      return response.data;
    },
    staleTime: 60_000,
  });

  const transactionsQuery = useQuery({
    queryKey: HAS_ANY_TRANSACTION_KEY,
    queryFn: async () => {
      const [expenses, incomes] = await Promise.all([
        expenseControllerFindAll(FIRST_ROW_ONLY).then((r) => r.data),
        incomeControllerFindAll(FIRST_ROW_ONLY).then((r) => r.data),
      ]);

      return (expenses.total ?? 0) + (incomes.total ?? 0) > 0;
    },
    staleTime: 60_000,
  });

  const bootstrap = useMutation({
    mutationFn: async () => {
      const response = await onboardingControllerBootstrap();
      return response.data;
    },
    onSuccess: (status: OnboardingStatusResponseDto) => {
      queryClient.setQueryData(statusKey, status);
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.expenseAll });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.incomeAll });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.itemAll });
    },
  });

  const status = statusQuery.data;
  const catalogIsMissing = status ? !status.hasExpenseCategories : false;

  const bootstrapMutate = bootstrap.mutate;
  const bootstrapIsIdle = bootstrap.isIdle;

  useEffect(() => {
    if (catalogIsMissing && bootstrapIsIdle) {
      bootstrapMutate();
    }
  }, [catalogIsMissing, bootstrapIsIdle, bootstrapMutate]);

  return {
    status,
    hasTransactions: transactionsQuery.data ?? true,
    isLoading: statusQuery.isLoading || transactionsQuery.isLoading,
    isSeeding: bootstrap.isPending,
    seedFailed: bootstrap.isError,
    seedCatalog: bootstrap.mutate,
  };
}
