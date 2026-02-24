import { itemControllerFindWithStores } from "@/api/generated/endpoints/items/items";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { usePaginatedQuery } from "@/hooks/use-paginated-query";
import { queryKeys, DEFAULT_PAGE_SIZE } from "@/lib/query-keys";

export function useItemsWithPrices(search: string) {
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, ...rest } = usePaginatedQuery({
    queryKey: queryKeys.items.withPrices(debouncedSearch),
    queryFn: async ({ page, limit }) => {
      const response = await itemControllerFindWithStores({
        search: debouncedSearch || "",
        page,
        limit,
      });
      return response.data;
    },
    pageSize: DEFAULT_PAGE_SIZE,
    staleTime: 60_000,
  });

  return { items: data, ...rest };
}
