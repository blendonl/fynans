import { useState, useEffect, useCallback } from 'react';
import { paymentMethodControllerFindAll } from '../api/generated/endpoints/payment-method/payment-method';
import type { PaymentMethodResponseDto } from '../api/generated/model';

export function usePaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await paymentMethodControllerFindAll();
      setPaymentMethods(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load payment methods:', err);
      setError(err.message || 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  return { paymentMethods, loading, error, refresh: fetchPaymentMethods };
}
