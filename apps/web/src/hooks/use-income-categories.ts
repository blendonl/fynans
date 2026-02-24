import { useQuery } from "@tanstack/react-query";
import { incomeCategoryControllerFindAll } from "@/api/generated/endpoints/income-category/income-category";
import { queryKeys } from "@/lib/query-keys";

export function useIncomeCategories() {
  const query = useQuery({
    queryKey: queryKeys.categories.income(),
    queryFn: async () => {
      const response = await incomeCategoryControllerFindAll({
        limit: 50,
      } as Parameters<typeof incomeCategoryControllerFindAll>[0]);
      const paginated = response.data;
      return (paginated.data || []).map((cat) => ({
        ...cat,
        isConnectedToStore: Boolean((cat as unknown as { isConnectedToStore?: unknown }).isConnectedToStore),
      }));
    },
  });

  return {
    incomeCategories: query.data || [],
    isLoading: query.isLoading,
  };
}
