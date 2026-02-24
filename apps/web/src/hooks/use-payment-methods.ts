import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  paymentMethodControllerFindAll,
  paymentMethodControllerCreate,
  paymentMethodControllerUpdate,
  paymentMethodControllerRemove,
  getPaymentMethodControllerFindAllQueryKey,
} from "@/api/generated/endpoints/payment-method/payment-method";
import type {
  CreatePaymentMethodRequestDto,
  UpdatePaymentMethodRequestDto,
} from "@/api/generated/model";

export type { PaymentMethodResponseDto as PaymentMethod } from "@/api/generated/model";
export type { PaymentMethodResponseDtoType as PaymentMethodType } from "@/api/generated/model";

export function usePaymentMethods() {
  const queryClient = useQueryClient();

  const paymentMethodsQuery = useQuery({
    queryKey: getPaymentMethodControllerFindAllQueryKey(),
    queryFn: async () => {
      const res = await paymentMethodControllerFindAll();
      return res.data;
    },
  });

  const createPaymentMethod = useMutation({
    mutationFn: async (input: CreatePaymentMethodRequestDto) => {
      const res = await paymentMethodControllerCreate(input);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getPaymentMethodControllerFindAllQueryKey() });
      toast.success("Payment method created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create payment method");
    },
  });

  const updatePaymentMethod = useMutation({
    mutationFn: async ({ id, ...input }: UpdatePaymentMethodRequestDto & { id: string }) => {
      const res = await paymentMethodControllerUpdate(id, input);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getPaymentMethodControllerFindAllQueryKey() });
      toast.success("Payment method updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update payment method");
    },
  });

  const deletePaymentMethod = useMutation({
    mutationFn: async (id: string) => {
      await paymentMethodControllerRemove(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getPaymentMethodControllerFindAllQueryKey() });
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
