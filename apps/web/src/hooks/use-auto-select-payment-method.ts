import { useState, useEffect } from "react";
import type { PaymentMethod } from "@/hooks/use-payment-methods";

export function useAutoSelectPaymentMethod(paymentMethods: PaymentMethod[]) {
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedPaymentMethodId && paymentMethods.length > 0) {
      setSelectedPaymentMethodId(paymentMethods[0].id);
    }
  }, [paymentMethods, selectedPaymentMethodId]);

  return [selectedPaymentMethodId, setSelectedPaymentMethodId] as const;
}
