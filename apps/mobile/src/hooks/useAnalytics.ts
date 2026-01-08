import { useMemo } from 'react';
import { TopPurchaseItem } from '../components/analytics';
import { SearchFilter } from '../components/analytics/SearchBar';

interface Transaction {
    transaction: {
        id: string;
        value: number;
        createdAt?: string;
        user: {
            id: string;
            firstName: string;
            lastName: string;
        };
    };
    type: 'expense' | 'income';
    scope: 'PERSONAL' | 'FAMILY';
    familyId?: string | null;
    category: {
        id: string;
        name: string;
    };
    items?: Array<{
        name: string;
        price: number;
        discount?: number;
        quantity: number;
    }>;
}

interface AnalyticsData {
    totalExpenses: number;
    totalIncome: number;
    net: number;
    expenseCount: number;
    incomeCount: number;
    avgExpense: number;
    avgIncome: number;
    topPurchases: TopPurchaseItem[];
    spendingHealthPercentage: number;
    previousPeriodExpenses: number;
    previousPeriodIncome: number;
    expenseTrend: number;
    incomeTrend: number;
}

export function useAnalytics(
    transactions: Transaction[],
    filteredTransactions: Transaction[],
    searchFilter?: SearchFilter | null
): AnalyticsData {
    return useMemo(() => {
        // Apply search filter to transactions
        let searchFilteredTransactions = filteredTransactions;

        if (searchFilter) {
            searchFilteredTransactions = filteredTransactions.filter((t) => {
                switch (searchFilter.type) {
                    case 'expenseCategory':
                        return t.category.id === searchFilter.id;
                    case 'itemCategory':
                        return false;
                    case 'itemName':
                        return t.items?.some((item) => item.name === searchFilter.name);
                    case 'family':
                        return searchFilter.id === 'PERSONAL'
                            ? t.scope === 'PERSONAL'
                            : t.familyId === searchFilter.id;
                    case 'member':
                        return t.transaction.user.id === searchFilter.id;
                    default:
                        return true;
                }
            });
        }

        // Calculate current period stats
        const totalExpenses = searchFilteredTransactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.transaction.value, 0);

        const totalIncome = searchFilteredTransactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.transaction.value, 0);

        const expenseCount = searchFilteredTransactions.filter((t) => t.type === 'expense').length;
        const incomeCount = searchFilteredTransactions.filter((t) => t.type === 'income').length;

        const avgExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0;
        const avgIncome = incomeCount > 0 ? totalIncome / incomeCount : 0;

        // Calculate previous period for trends
        const now = new Date();

        // Find the earliest transaction date in filtered set
        const sortedTransactions = [...filteredTransactions].sort((a, b) => {
            const dateA = a.transaction.createdAt ? new Date(a.transaction.createdAt).getTime() : 0;
            const dateB = b.transaction.createdAt ? new Date(b.transaction.createdAt).getTime() : 0;
            return dateA - dateB;
        });

        const periodStart = sortedTransactions.length > 0 && sortedTransactions[0]?.transaction.createdAt
            ? new Date(sortedTransactions[0].transaction.createdAt)
            : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const periodDuration = now.getTime() - periodStart.getTime();
        const previousPeriodStart = new Date(periodStart.getTime() - periodDuration);
        const previousPeriodEnd = periodStart;

        // Get previous period transactions with same filters
        let previousPeriodTransactions = transactions.filter((t) => {
            if (!t.transaction.createdAt) return false;
            const date = new Date(t.transaction.createdAt);
            return date >= previousPeriodStart && date < previousPeriodEnd;
        });

        // Apply search filter to previous period
        if (searchFilter) {
            previousPeriodTransactions = previousPeriodTransactions.filter((t) => {
                switch (searchFilter.type) {
                    case 'expenseCategory':
                        return t.category.id === searchFilter.id;
                    case 'itemCategory':
                        return false;
                    case 'itemName':
                        return t.items?.some((item) => item.name === searchFilter.name);
                    case 'family':
                        return searchFilter.id === 'PERSONAL'
                            ? t.scope === 'PERSONAL'
                            : t.familyId === searchFilter.id;
                    case 'member':
                        return t.transaction.user.id === searchFilter.id;
                    default:
                        return true;
                }
            });
        }

        const previousPeriodExpenses = previousPeriodTransactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.transaction.value, 0);

        const previousPeriodIncome = previousPeriodTransactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.transaction.value, 0);

        // Calculate trends
        const expenseTrend = previousPeriodExpenses > 0
            ? ((totalExpenses - previousPeriodExpenses) / previousPeriodExpenses) * 100
            : 0;

        const incomeTrend = previousPeriodIncome > 0
            ? ((totalIncome - previousPeriodIncome) / previousPeriodIncome) * 100
            : 0;

        // Calculate spending health (percentage of income spent)
        const spendingHealthPercentage = totalIncome > 0
            ? (totalExpenses / totalIncome) * 100
            : totalExpenses > 0
                ? 100
                : 0;

        // Calculate top purchases from expense items
        const itemMap = new Map<string, {
            name: string;
            category: string;
            frequency: number;
            totalSpent: number;
        }>();

        searchFilteredTransactions
            .filter((t) => t.type === 'expense' && t.items && t.items.length > 0)
            .forEach((t) => {
                t.items?.forEach((item) => {
                    // When filtering by item name, only include that specific item
                    if (searchFilter?.type === 'itemName' && item.name !== searchFilter.name) {
                        return;
                    }

                    const itemTotal = (item.price - (item.discount || 0)) * item.quantity;
                    const existing = itemMap.get(item.name);

                    if (existing) {
                        existing.frequency += item.quantity;
                        existing.totalSpent += itemTotal;
                    } else {
                        itemMap.set(item.name, {
                            name: item.name,
                            category: t.category.name,
                            frequency: item.quantity,
                            totalSpent: itemTotal,
                        });
                    }
                });
            });

        const topPurchases = Array.from(itemMap.values())
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 10);

        return {
            totalExpenses,
            totalIncome,
            net: totalIncome - totalExpenses,
            expenseCount,
            incomeCount,
            avgExpense,
            avgIncome,
            topPurchases,
            spendingHealthPercentage,
            previousPeriodExpenses,
            previousPeriodIncome,
            expenseTrend,
            incomeTrend,
        };
    }, [filteredTransactions, transactions, searchFilter]);
}
