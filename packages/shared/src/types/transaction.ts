export interface Transaction {
  id: string;
  type: "expense" | "income";
  scope: "PERSONAL" | "FAMILY";
  familyId?: string | null;
  family?: {
    id: string;
    name: string;
  };
  category: {
    id: string;
    name: string;
  };
  store?: {
    id: string;
    name: string;
    location?: string;
  };
  transaction: {
    id: string;
    value: number;
    recordedAt?: string;
    description?: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
  items?: TransactionItem[];
  receiptImages?: string[];
}

export interface TransactionItem {
  name: string;
  price: number;
  discount?: number;
  quantity: number;
}

export interface TransactionFilters {
  type: "all" | "expense" | "income";
  scope: "all" | "personal" | "family";
  familyId: string | null;
  categories: string[];
  minAmount: string;
  maxAmount: string;
  dateFrom: Date | null;
  dateTo: Date | null;
}

export type TransactionType = "expense" | "income";

export type TransactionScope = "PERSONAL" | "FAMILY";
