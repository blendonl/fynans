import { useQuery } from "@tanstack/react-query";
import { familyControllerFindAll } from "@/api/generated/endpoints/family/family";
import { queryKeys } from "@/lib/query-keys";

export function useFamilyList() {
  const query = useQuery({
    queryKey: queryKeys.families.all,
    queryFn: async () => {
      const res = await familyControllerFindAll();
      return res.data;
    },
  });

  return {
    families: query.data || [],
    isLoading: query.isLoading,
  };
}
