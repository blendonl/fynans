import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Category } from "@mmoneymanager/shared";

export function useCategories() {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ["expense-categories"],
    queryFn: async () => {
      const response = (await apiClient.get("/expense-categories")) as { data: Category[] };
      return (response.data || []).map((cat) => ({
        ...cat,
        isConnectedToStore: Boolean(cat.isConnectedToStore),
      }));
    },
  });

  const itemCategoriesQuery = useQuery({
    queryKey: ["expense-item-categories"],
    queryFn: async () => {
      const response = (await apiClient.get("/expense-item-categories")) as { data: Category[] };
      return (response.data || []).map((cat) => ({
        ...cat,
        isConnectedToStore: Boolean(cat.isConnectedToStore),
      }));
    },
  });

  const createCategory = useMutation({
    mutationFn: async ({ name, isConnectedToStore }: { name: string; isConnectedToStore: boolean }) => {
      const response = (await apiClient.post("/expense-categories", {
        name,
        isConnectedToStore,
      })) as Category;
      return {
        id: response.id,
        name: response.name,
        isConnectedToStore: Boolean(response.isConnectedToStore),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
    },
  });

  return {
    categories: categoriesQuery.data || [],
    itemCategories: itemCategoriesQuery.data || [],
    isLoading: categoriesQuery.isLoading,
    createCategory,
  };
}
