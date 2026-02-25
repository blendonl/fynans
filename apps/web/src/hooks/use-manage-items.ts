import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { itemControllerFindAll, itemControllerCreate } from "@/api/generated/endpoints/items/items";
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

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, categoryId }: { name: string; categoryId: string }) => {
      const res = await itemControllerCreate({ name, categoryId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items.all });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create item");
    },
  });
}
