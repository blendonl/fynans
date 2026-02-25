import { useQuery } from "@tanstack/react-query";
import { paymentMethodControllerGetBalance } from "@/api/generated/endpoints/payment-method/payment-method";
import { queryKeys } from "@/lib/query-keys";

export function useBalance() {
  return useQuery({
    queryKey: queryKeys.balance.all,
    queryFn: async () => {
      const res = await paymentMethodControllerGetBalance();
      return res.data;
    },
    staleTime: 60_000,
  });
}
