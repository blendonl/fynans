import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Transaction, TransactionFilters } from '../features/transactions/types';

const SEARCH_DEBOUNCE_MS = 300;

export const useFilters = () => {
  const [filters, setFilters] = useState<TransactionFilters>({
    type: 'all',
    scope: 'all',
    familyId: null,
    categories: [],
    minAmount: '',
    maxAmount: '',
    dateFrom: null,
    dateTo: null,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  const applyFilters = (newFilters: TransactionFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      scope: 'all',
      familyId: null,
      categories: [],
      minAmount: '',
      maxAmount: '',
      dateFrom: null,
      dateTo: null,
    });
  };

  const hasActiveFilters = useMemo(() => {
    return (
      filters.type !== 'all' ||
      filters.scope !== 'all' ||
      filters.categories.length > 0 ||
      filters.minAmount !== '' ||
      filters.maxAmount !== '' ||
      filters.dateFrom !== null ||
      filters.dateTo !== null ||
      debouncedSearchQuery !== ''
    );
  }, [filters, debouncedSearchQuery]);

  const filterTransactions = useCallback((transactions: Transaction[]) => {
    return transactions.filter((transaction) => {
      if (filters.type !== 'all' && transaction.type !== filters.type) {
        return false;
      }

      if (filters.categories.length > 0) {
        if (!filters.categories.includes(transaction.category.id)) {
          return false;
        }
      }

      if (filters.minAmount) {
        const minAmount = parseFloat(filters.minAmount);
        if (transaction.transaction.value < minAmount) {
          return false;
        }
      }

      if (filters.maxAmount) {
        const maxAmount = parseFloat(filters.maxAmount);
        if (transaction.transaction.value > maxAmount) {
          return false;
        }
      }

      if (filters.dateFrom && transaction.transaction.createdAt) {
        const transactionDate = new Date(transaction.transaction.createdAt);
        if (transactionDate < filters.dateFrom) {
          return false;
        }
      }

      if (filters.dateTo && transaction.transaction.createdAt) {
        const transactionDate = new Date(transaction.transaction.createdAt);
        if (transactionDate > filters.dateTo) {
          return false;
        }
      }

      if (debouncedSearchQuery) {
        const query = debouncedSearchQuery.toLowerCase();
        const categoryMatch = transaction.category.name.toLowerCase().includes(query);
        const storeMatch = transaction.store?.name.toLowerCase().includes(query);
        const itemsMatch = transaction.items?.some((item) =>
          item.name.toLowerCase().includes(query)
        );
        const memberName = `${transaction.transaction.user?.firstName || ''} ${transaction.transaction.user?.lastName || ''}`.toLowerCase().trim();
        const memberMatch = memberName.includes(query);
        const familyMatch = transaction.family?.name?.toLowerCase().includes(query) || false;

        if (!categoryMatch && !storeMatch && !itemsMatch && !memberMatch && !familyMatch) {
          return false;
        }
      }

      return true;
    });
  }, [filters, debouncedSearchQuery]);

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.type !== 'all') count++;
    if (filters.scope !== 'all') count++;
    if (filters.categories.length > 0) count += filters.categories.length;
    if (filters.minAmount || filters.maxAmount) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    return count;
  };

  return {
    filters,
    searchQuery,
    setSearchQuery,
    applyFilters,
    clearFilters,
    hasActiveFilters,
    filterTransactions,
    getActiveFilterCount,
  };
};
