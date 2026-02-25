import { nestedStoreItemControllerFindAll } from "@/api/generated/endpoints/store-item/store-item";
import { usePaginatedQuery } from "@/hooks/use-paginated-query";
import { queryKeys, DEFAULT_PAGE_SIZE } from "@/lib/query-keys";

export function useStoreItems(storeId: string | undefined, search: string) {
  const { data, ...rest } = usePaginatedQuery({
    queryKey: queryKeys.storeItems.list(storeId, search),
    queryFn: async ({ page, limit }) => {
      const response = await nestedStoreItemControllerFindAll(storeId!, {
        search,
        page,
        limit,
      });
      return response.data;
    },
    pageSize: DEFAULT_PAGE_SIZE,
    enabled: !!storeId,
  });

  return { items: data, ...rest };
}
