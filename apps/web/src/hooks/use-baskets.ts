import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Basket } from "@/types";

export function useBaskets() {
  const basketsQuery = useQuery({
    queryKey: ["baskets"],
    queryFn: async () => {
      return apiClient.get<Basket[]>("/baskets");
    },
    staleTime: 30 * 1000,
  });

  const baskets = basketsQuery.data ?? [];

  const personal = useMemo(
    () => baskets.find((b) => b.scope === "PERSONAL") ?? null,
    [baskets],
  );

  const families = useMemo(
    () => baskets.filter((b) => b.scope === "FAMILY"),
    [baskets],
  );

  return {
    baskets,
    personal,
    families,
    isLoading: basketsQuery.isLoading,
    isError: basketsQuery.isError,
  };
}
