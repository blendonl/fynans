/**
 * Centralized query key factory for React Query.
 * Ensures consistent cache keys across hooks and invalidation.
 */

export const DEFAULT_PAGE_SIZE = 20;

export const queryKeys = {
  transactions: {
    all: ["transactions"] as const,
    infinite: (filters: Record<string, unknown>) =>
      ["transactions-infinite", filters] as const,
    list: (filters?: Record<string, unknown>) =>
      ["transactions", filters] as const,
  },

  dashboard: {
    comparison: (dateFrom: string, dateTo: string) =>
      ["dashboard-comparison", dateFrom, dateTo] as const,
    expenseStats: (dateFrom: string, dateTo: string) =>
      ["dashboard-expense-stats", dateFrom, dateTo] as const,
    trends: (dateFrom: string, dateTo: string, granularity: string) =>
      ["dashboard-expense-trends", dateFrom, dateTo, granularity] as const,
    recent: (dateFrom: string, dateTo: string) =>
      ["dashboard-recent", dateFrom, dateTo] as const,
  },

  notifications: {
    all: ["notifications"] as const,
    list: (filter: string) => ["notifications", filter] as const,
    unreadCount: () => ["notifications", "unread-count"] as const,
  },

  pending: {
    all: ["pending-transactions"] as const,
    count: () => ["pending-transactions", "count"] as const,
    list: (status: string) => ["pending-transactions", "list", status] as const,
    detail: (id: string) => ["pending-transactions", "detail", id] as const,
  },

  categories: {
    expense: (search?: string) => ["expense-categories", search] as const,
    item: (search?: string) => ["expense-item-categories", search] as const,
    income: (search?: string) => ["income-categories", search] as const,
  },

  stores: {
    all: ["stores"] as const,
    list: (search: string) => ["stores", search] as const,
  },

  items: {
    all: ["items"] as const,
    list: (search: string) => ["items", search] as const,
    withPrices: (search: string) => ["items-with-prices", search] as const,
    byCategory: (categoryId: string) =>
      ["items", "category", categoryId] as const,
  },

  storeItems: {
    all: ["store-items"] as const,
    list: (storeId: string | undefined, search: string) =>
      ["store-items", storeId, search] as const,
    forStore: (storeId: string) => ["store-items", "store", storeId] as const,
    forItem: (itemId: string) => ["store-items", "item", itemId] as const,
  },

  families: {
    all: ["families"] as const,
    detail: (id: string) => ["family", id] as const,
    invitationsPending: () => ["family-invitations-pending"] as const,
    sentInvitations: (familyId: string) =>
      ["family-sent-invitations", familyId] as const,
  },

  baskets: {
    all: ["baskets"] as const,
  },

  paymentMethods: {
    all: ["payment-methods"] as const,
  },

  balance: {
    all: ["balance"] as const,
  },
};
