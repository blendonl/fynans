import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { basketControllerListBaskets } from "@/api/generated/endpoints/basket/basket";

export function useBaskets() {
  const basketsQuery = useQuery({
    queryKey: ["baskets"],
    queryFn: async () => {
      const res = await basketControllerListBaskets();
      return res.data;
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
