import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export type PaymentMethodType = "CASH" | "DEBIT_CARD";

export interface PaymentMethod {
  id: string;
  userId: string;
  name: string;
  type: PaymentMethodType;
  color: string;
  initialBalance: number;
  currentBalance: number;
  createdAt: string;
  updatedAt: string;
}

interface CreatePaymentMethodInput {
  name: string;
  type: PaymentMethodType;
  color?: string;
  initialBalance?: number;
}

interface UpdatePaymentMethodInput {
  name?: string;
  type?: PaymentMethodType;
  color?: string;
  initialBalance?: number;
}

export function usePaymentMethods() {
  const queryClient = useQueryClient();

  const paymentMethodsQuery = useQuery({
    queryKey: ["payment-methods"],
    queryFn: async () => {
      return apiClient.get<PaymentMethod[]>("/payment-methods");
    },
  });

  const createPaymentMethod = useMutation({
    mutationFn: async (input: CreatePaymentMethodInput) => {
      return apiClient.post<PaymentMethod>("/payment-methods", input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      toast.success("Payment method created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create payment method");
    },
  });

  const updatePaymentMethod = useMutation({
    mutationFn: async ({ id, ...input }: UpdatePaymentMethodInput & { id: string }) => {
      return apiClient.put<PaymentMethod>(`/payment-methods/${id}`, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      toast.success("Payment method updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update payment method");
    },
  });

  const deletePaymentMethod = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/payment-methods/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      toast.success("Payment method deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete payment method");
    },
  });

  return {
    paymentMethods: paymentMethodsQuery.data || [],
    isLoading: paymentMethodsQuery.isLoading,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
  };
}
