import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { nestedStoreItemControllerFindAll } from "@/api/generated/endpoints/store-item/store-item";

export function useStoreItemPrices(storeId: string | null) {
  const query = useQuery({
    queryKey: ["store-item-prices", storeId],
    queryFn: async () => {
      const response = await nestedStoreItemControllerFindAll(storeId!, {});
      return response.data.data;
    },
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
  });

  const priceMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of query.data ?? []) {
      map.set(item.name.toLowerCase().trim(), item.price);
    }
    return map;
  }, [query.data]);

  return {
    priceMap,
    isLoading: query.isLoading,
    storeItems: query.data ?? [],
  };
}
