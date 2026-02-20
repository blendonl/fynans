import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';

export interface PaymentMethod {
  id: string;
  name: string;
  color: string;
  initialBalance: number;
  currentBalance: number;
}

export function usePaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get('/payment-methods');
      setPaymentMethods(Array.isArray(data) ? data : data.data || []);
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
