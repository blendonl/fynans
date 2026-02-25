import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storeItemCategoryControllerFindAll, storeItemCategoryControllerCreate } from "@/api/generated/endpoints/store-item-category/store-item-category";
import { queryKeys } from "@/lib/query-keys";

export function useItemCategories() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.categories.item(),
    queryFn: async () => {
      const response = await storeItemCategoryControllerFindAll({
        limit: 50,
      } as Parameters<typeof storeItemCategoryControllerFindAll>[0]);
      const paginated = response.data;
      return (paginated.data || []).map((cat) => ({
        ...cat,
        isConnectedToStore: Boolean((cat as unknown as { isConnectedToStore?: unknown }).isConnectedToStore),
      }));
    },
  });

  const createItemCategory = useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const response = await storeItemCategoryControllerCreate({ name });
      const cat = response.data;
      return { id: cat.id, name: cat.name };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.itemAll });
    },
  });

  return {
    itemCategories: query.data || [],
    isLoading: query.isLoading,
    createItemCategory,
  };
}
