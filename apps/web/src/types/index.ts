/**
 * Re-export generated API types with shorter names for UI convenience.
 * Also re-export local UI-only types.
 */

// Generated API types with convenient aliases
export type { ExpenseCategoryResponseDto as Category } from '@/api/generated/model';
export type { IncomeCategoryResponseDto as IncomeCategory } from '@/api/generated/model';
export type { StoreResponseDto as Store } from '@/api/generated/model';
export type { FamilyResponseDto as Family } from '@/api/generated/model';
export type { FamilyWithMembersResponseDto as FamilyWithMembers } from '@/api/generated/model';
export type { FamilyInvitationResponseDto as FamilyInvitation } from '@/api/generated/model';
export type { FamilyMemberResponseDtoRole as FamilyMemberRole } from '@/api/generated/model';
export type { BasketResponseDto as Basket } from '@/api/generated/model';
export type { BasketItemResponseDto as BasketItem } from '@/api/generated/model';
export type BasketScope = 'PERSONAL' | 'FAMILY';
export type { ItemWithStoresResponseDto as ItemWithPrices } from '@/api/generated/model';
export type { NotificationResponseDto as Notification } from '@/api/generated/model';
export type { MeResponseDto as User } from '@/api/generated/model';

// API response types
export type { ExpenseResponseDto as ExpenseResponse } from '@/api/generated/model';
export type { IncomeResponseDto as IncomeResponse } from '@/api/generated/model';
export type { TransactionResponseDto as TransactionResponse } from '@/api/generated/model';
export type { TransactionStatisticsResponseDto as TransactionStatisticsResponse } from '@/api/generated/model';
export type { ExpenseStatisticsResponseDto as ExpenseStatisticsResponse } from '@/api/generated/model';
export type { ExpenseTrendPointResponseDto as ExpenseTrendResponse } from '@/api/generated/model';
export type { ExpenseItemResponseDto as ExpenseItemResponse } from '@/api/generated/model';
export type { ExpenseCategoryResponseDto as ExpenseCategoryResponse } from '@/api/generated/model';
export type { IncomeCategoryResponseDto as IncomeCategoryResponse } from '@/api/generated/model';
export type { StoreResponseDto as StoreResponse } from '@/api/generated/model';

// Paginated response (generic-like, using intersection with actual DTOs)
export type {
  PaginatedExpenseResponseDto,
  PaginatedIncomeResponseDto,
  PaginatedTransactionResponseDto,
} from '@/api/generated/model';

// Payment method types
export type { PaymentMethodResponseDto as PaymentMethod } from '@/api/generated/model';
export type { PaymentMethodResponseDtoType as PaymentMethodType } from '@/api/generated/model';
export type { CreatePaymentMethodRequestDto as CreatePaymentMethodInput } from '@/api/generated/model';
export type { UpdatePaymentMethodRequestDto as UpdatePaymentMethodInput } from '@/api/generated/model';

// Local UI-only types
export type { Transaction, TransactionItem, TransactionFilters, TransactionType, TransactionScope } from './transaction';
export type { CurrentItem, ExpenseItem } from './expense';
export type { CategoryData } from './dashboard';
