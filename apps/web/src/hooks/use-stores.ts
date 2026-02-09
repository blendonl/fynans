import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Store } from "@mmoneymanager/shared";

export function useStores(search: string) {
  const queryClient = useQueryClient();

  const storesQuery = useQuery({
    queryKey: ["stores", search],
    queryFn: async () => {
      if (!search) return [];
      const response = (await apiClient.get("/stores", { search })) as { data: Store[] };
      return response.data || [];
    },
    enabled: search.length > 0,
  });

  const createStore = useMutation({
    mutationFn: async ({ name, location }: { name: string; location: string }) => {
      const response = (await apiClient.post("/stores", { name, location })) as Store;
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });

  return {
    stores: storesQuery.data || [],
    isLoading: storesQuery.isLoading,
    createStore,
  };
}
