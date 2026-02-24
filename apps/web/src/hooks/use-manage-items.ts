import { itemControllerFindAll } from "@/api/generated/endpoints/items/items";
import { usePaginatedQuery } from "@/hooks/use-paginated-query";
import { queryKeys, DEFAULT_PAGE_SIZE } from "@/lib/query-keys";

export function useManageItems(search: string) {
  const { data, ...rest } = usePaginatedQuery({
    queryKey: queryKeys.items.list(search),
    queryFn: async ({ page, limit }) => {
      const response = await itemControllerFindAll({
        search,
        page,
        limit,
      } as Parameters<typeof itemControllerFindAll>[0]);
      return response.data;
    },
    pageSize: DEFAULT_PAGE_SIZE,
  });

  return { items: data, ...rest };
}
