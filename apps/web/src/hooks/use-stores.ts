import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { storeControllerFindAll, storeControllerCreate } from "@/api/generated/endpoints/store/store";
import { usePaginatedQuery } from "@/hooks/use-paginated-query";
import { queryKeys, DEFAULT_PAGE_SIZE } from "@/lib/query-keys";

/** Paginated store list only (for manage pages) */
export function useStoresList(search: string) {
  const { data, ...rest } = usePaginatedQuery({
    queryKey: queryKeys.stores.list(search),
    queryFn: async ({ page, limit }) => {
      const response = await storeControllerFindAll({ search, page, limit });
      return response.data;
    },
    pageSize: DEFAULT_PAGE_SIZE,
  });

  return { stores: data, ...rest };
}

/** Store creation mutation */
export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, location }: { name: string; location: string }) => {
      const res = await storeControllerCreate({ name, location });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stores.all });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create store");
    },
  });
}

/** Backward-compatible composite hook (list + create) */
export function useStores(search: string) {
  const { stores, ...listRest } = useStoresList(search);
  const createStore = useCreateStore();

  return { stores, ...listRest, createStore };
}
