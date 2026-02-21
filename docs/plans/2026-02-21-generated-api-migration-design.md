# Generated API Types & Hooks Migration

**Date:** 2026-02-21
**Approach:** Parallel (fix backend spec + migrate both apps simultaneously)

## Problem

Both `apps/web` and `apps/mobile` have a mix of generated (Orval) and manually created API types. The web app generates endpoint hooks but never uses them, relying on a manual `apiClient` instead. The mobile app has partially adopted generated hooks but still has a legacy `apiClient` and many manual types. The `PaymentMethod` endpoint is missing from the OpenAPI spec entirely, forcing both apps to maintain manual types.

## Decisions

1. **Add PaymentMethod to OpenAPI spec** as part of this migration
2. **Migrate to generated hooks** in both apps (replace manual `apiClient` calls)
3. **Keep `Transaction` as a manual view model** but type its mapper inputs using generated DTOs

## Architecture

### Backend (OpenAPI Spec Fix)

Add Swagger decorators to `PaymentMethodController`:
- `@ApiTags('payment-methods')`, `@ApiResponse()`, `@ApiBody()`
- Ensure `CreatePaymentMethodDto`, `UpdatePaymentMethodDto`, `PaymentMethodResponseDto` have `@ApiProperty()` decorators
- Regenerate `openapi.json`, then run `yarn api:generate` in both apps

### Web App (`apps/web`)

#### Manual Types to Replace

| Manual Type | File | Replace With |
|---|---|---|
| `ItemResult` | `hooks/use-items.ts` | `ItemResponseDto` |
| `StoreItemResult` | `hooks/use-store-items.ts` | `StoreItemResponseDto` |
| `StoreItemPrice` | `hooks/use-store-item-prices.ts` | `StoreItemResponseDto` |
| `SuggestCategoryResponse` | `hooks/use-debounced-ai-suggestion.ts` | `SuggestCategoryResponseDto` |
| `AiSuggestResponse` | `components/basket/basket-checkout-dialog.tsx` | `SuggestCategoryResponseDto` |
| `TransactionType` | `types/transaction.ts` | `TransactionResponseDtoType` |
| `TransactionScope` | `types/transaction.ts` | `TransactionResponseDtoScope` |
| `PaymentMethod*` (4 types) | `hooks/use-payment-methods.ts` | Generated payment-method types |
| `ProcessedReceiptResponse` | `hooks/use-receipt-scan.ts` | `ProcessedReceiptResponseDto` |
| `PaginatedResponse<T>` | `lib/pagination.ts` | Per-resource paginated types |

#### Manual Types to Keep

| Type | File | Reason |
|---|---|---|
| `Transaction`, `TransactionItem`, `TransactionFilters` | `types/transaction.ts` | UI view model (update mappers to take generated DTOs) |
| `ExpenseItem`, `CurrentItem` | `types/expense.ts` | Form state (string-typed inputs) |
| `CheckoutLineItem` | `components/basket/basket-checkout-dialog.tsx` | UI state |
| `MonthGroup`, `ServerFilters`, `InfiniteTransactionPage` | `hooks/use-transactions.ts` | UI/hook internals |
| `JobStreamEvent` | `hooks/use-receipt-scan.ts` | SSE streaming (no OpenAPI representation) |

#### Hook Migration

- Replace all 21 `apiClient.get/post/put/patch/delete()` sites with Orval-generated React Query hooks
- Delete `src/lib/api-client.ts`
- Align `custom-instance.ts` return shape if needed
- Update `src/types/index.ts` re-exports for new payment-method types

### Mobile App (`apps/mobile`)

#### Manual Types to Replace

| Manual Type | File | Replace With |
|---|---|---|
| `User` | `features/auth/types.ts` | `MeResponseDto` (delete entire file) |
| `Category` | `features/expenses/types.ts` | `ExpenseCategoryResponseDto` |
| `Store` | `features/expenses/types.ts` | `StoreResponseDto` |
| `ExpenseItem` | `features/expenses/types.ts` | `ExpenseItemResponseDto` / `CreateExpenseItemRequestDto` |
| `PaymentMethod` | `hooks/usePaymentMethods.ts` | Generated payment-method types |
| `ProcessedReceiptData` | `hooks/useReceiptScanning.ts` | `ProcessedReceiptResponseDto` + sub-types |
| `Notification` | `context/NotificationContext.tsx` | `NotificationResponseDto` |
| `Transaction` (local) | `hooks/useAnalytics.ts` | Import from `features/transactions/types.ts` |
| `FamilyMemberData` (x2) | `TransactionsListScreen.tsx`, `AnalyticsScreen.tsx` | Derive from `FamilyMemberResponseDto` |
| `TransactionType` | `features/transactions/types.ts` | `TransactionResponseDtoType` |

#### Manual Types to Keep

| Type | File | Reason |
|---|---|---|
| `Transaction`, `TransactionItem`, `TransactionFilters` | `features/transactions/types.ts` | UI view model |
| `CurrentItem` | `features/expenses/types.ts` | Form state |
| `SocialAuthData` | `context/AuthContext.tsx` | No backend equivalent |
| `AuthContextType` | `context/AuthContext.tsx` | Context shape |
| `AnalyticsData`, `UploadProgress` | various | Computed/UI state |

#### Additional Fixes

- Replace `any[]` in `ExpensesScreen.tsx` and `IncomesScreen.tsx` with generated DTOs
- Migrate `usePaymentMethods.ts` and `PaymentMethodsScreen.tsx` to generated hooks
- Migrate `useReceiptScanning.ts` and `useImageUpload.ts` to generated hooks
- Delete `src/api/client.ts` (legacy apiClient)
- Delete `features/auth/types.ts` (dead code)
- Clean `features/expenses/types.ts` to only keep `CurrentItem`

### Cleanup

- Delete `apps/web/src/lib/api-client.ts`
- Delete `apps/mobile/src/api/client.ts`
- Delete `apps/mobile/src/features/auth/types.ts`
- Remove dead exports from `apps/mobile/src/features/index.ts`
- Verify both apps build (`yarn build`)
- Run existing tests

## Validation

- `yarn build` passes in both apps
- No `apiClient` imports remain in either app
- All manual types in the "to replace" tables are deleted
- Generated endpoint hooks are the sole HTTP call mechanism
- `PaymentMethod*` types appear in both apps' generated model
