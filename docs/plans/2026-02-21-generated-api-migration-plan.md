# Generated API Types & Hooks Migration — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminate all manually created API types that have generated equivalents and migrate both apps from manual `apiClient` calls to Orval-generated hooks/functions.

**Architecture:** Backend-first fix (add Swagger decorators to PaymentMethodController), regenerate OpenAPI spec and Orval output, then migrate web and mobile in parallel. Both apps use Orval with `customInstance` that returns `{ data, status, headers }` wrapper objects.

**Tech Stack:** NestJS + Swagger (backend), Orval + React Query (web), Orval + fetch functions (mobile), TypeScript throughout.

**Key insight:** `customInstance` returns `{ data: T, status: number, headers: Headers }`. The legacy `apiClient` returns raw `T`. All migration sites must account for the `.data` unwrapping pattern.

**Note:** `/receipts/upload` does NOT exist as a backend endpoint — the mobile app's `useImageUpload.ts` calls a non-existent route. The actual upload happens through `POST /receipts/process`. This hook needs to be corrected, not just migrated.

---

## Task 1: Add Swagger Decorators to PaymentMethod DTOs

**Files:**
- Modify: `apps/backend/src/feature/payment-method/rest/dto/payment-method-response.dto.ts`
- Modify: `apps/backend/src/feature/payment-method/rest/dto/create-payment-method-request.dto.ts`
- Modify: `apps/backend/src/feature/payment-method/rest/dto/update-payment-method-request.dto.ts`

**Reference pattern:** `apps/backend/src/feature/expense/rest/dto/expense-response.dto.ts` — follow its `@ApiProperty()` decoration style.

**Step 1: Add `@ApiProperty()` to `PaymentMethodResponseDto`**

Add `import { ApiProperty } from '@nestjs/swagger';` and decorate every field:

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethodType } from '../../core/domain/value-objects/payment-method-type.enum';

export class PaymentMethodResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: PaymentMethodType })
  type: PaymentMethodType;

  @ApiProperty()
  color: string;

  @ApiProperty()
  initialBalance: number;

  @ApiProperty()
  currentBalance: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // Keep existing static fromEntity/fromEntities methods unchanged
}
```

**Step 2: Add `@ApiProperty()` to `CreatePaymentMethodRequestDto`**

Add `import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';` alongside existing class-validator imports:

```typescript
@ApiProperty()
@IsString() @IsNotEmpty()
name!: string;

@ApiProperty({ enum: PaymentMethodType })
@IsEnum(PaymentMethodType)
type!: PaymentMethodType;

@ApiPropertyOptional({ pattern: '^#[0-9A-Fa-f]{6}$' })
@IsString() @IsOptional() @Matches(/^#[0-9A-Fa-f]{6}$/)
color?: string;

@ApiPropertyOptional()
@IsNumber() @IsOptional()
initialBalance?: number;
```

**Step 3: Add `@ApiProperty()` to `UpdatePaymentMethodRequestDto`**

Same pattern but all fields are optional — use `@ApiPropertyOptional()` for all:

```typescript
@ApiPropertyOptional()
@IsString() @IsOptional() @MinLength(1)
name?: string;

@ApiPropertyOptional({ enum: PaymentMethodType })
@IsEnum(PaymentMethodType) @IsOptional()
type?: PaymentMethodType;

@ApiPropertyOptional({ pattern: '^#[0-9A-Fa-f]{6}$' })
@IsString() @IsOptional() @Matches(/^#[0-9A-Fa-f]{6}$/)
color?: string;

@ApiPropertyOptional()
@IsNumber() @IsOptional()
initialBalance?: number;
```

**Step 4: Commit**

```bash
git add apps/backend/src/feature/payment-method/rest/dto/
git commit -m "feat(backend): add Swagger ApiProperty decorators to payment-method DTOs"
```

---

## Task 2: Add Swagger Decorators to PaymentMethod Controller

**Files:**
- Modify: `apps/backend/src/feature/payment-method/rest/controllers/payment-method.controller.ts`

**Reference pattern:** `apps/backend/src/feature/expense/rest/controllers/expense.controller.ts` — follow its `@ApiTags`, `@ApiBearerAuth`, `@ApiOperation`, `@ApiResponse` style.

**Step 1: Add class-level decorators and imports**

Add to the imports:
```typescript
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
```

Add before `@Controller('payment-methods')`:
```typescript
@ApiTags('PaymentMethod')
@ApiBearerAuth('bearer')
@Controller('payment-methods')
```

**Step 2: Decorate each handler**

For `create` (POST /):
```typescript
@Post()
@HttpCode(HttpStatus.CREATED)
@ApiOperation({ summary: 'Create a new payment method' })
@ApiResponse({ status: 201, type: PaymentMethodResponseDto })
```

For `findAll` (GET /):
```typescript
@Get()
@ApiOperation({ summary: 'Get all payment methods for the current user' })
@ApiResponse({ status: 200, type: [PaymentMethodResponseDto] })
```

For `getBalanceSummary` (GET /balance-summary):
```typescript
@Get('balance-summary')
@ApiOperation({ summary: 'Get balance summary for all payment methods' })
@ApiResponse({ status: 200 })
```

For `findOne` (GET /:id):
```typescript
@Get(':id')
@ApiOperation({ summary: 'Get a payment method by ID' })
@ApiResponse({ status: 200, type: PaymentMethodResponseDto })
```

For `update` (PUT /:id):
```typescript
@Put(':id')
@ApiOperation({ summary: 'Update a payment method' })
@ApiResponse({ status: 200, type: PaymentMethodResponseDto })
```

For `remove` (DELETE /:id):
```typescript
@Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT)
@ApiOperation({ summary: 'Delete a payment method' })
@ApiResponse({ status: 204 })
```

**Step 3: Commit**

```bash
git add apps/backend/src/feature/payment-method/rest/controllers/payment-method.controller.ts
git commit -m "feat(backend): add Swagger decorators to PaymentMethodController"
```

---

## Task 3: Regenerate OpenAPI Spec and Orval Output

**Files:**
- Regenerated: `apps/backend/openapi.json`
- Regenerated: `apps/web/src/api/generated/**`
- Regenerated: `apps/mobile/src/api/generated/**`

**Step 1: Regenerate backend OpenAPI spec**

```bash
cd apps/backend && yarn swagger:generate
```

Expected: `openapi.json` updated with `/payment-methods` paths and `PaymentMethodResponseDto`, `CreatePaymentMethodRequestDto`, `UpdatePaymentMethodRequestDto` schemas.

**Step 2: Verify payment-methods in spec**

```bash
grep -c "payment-method" apps/backend/openapi.json
```

Expected: Multiple matches (paths + schemas).

**Step 3: Regenerate web app types**

```bash
cd apps/web && yarn api:generate
```

Expected: New files under `src/api/generated/endpoints/payment-method/` and new types in `src/api/generated/model/`.

**Step 4: Regenerate mobile app types**

```bash
cd apps/mobile && yarn api:generate
```

Expected: Same — new payment-method endpoint file and model types.

**Step 5: Verify generated output**

```bash
grep "PaymentMethod" apps/web/src/api/generated/model/index.ts
grep "PaymentMethod" apps/mobile/src/api/generated/model/index.ts
```

Expected: `PaymentMethodResponseDto`, `CreatePaymentMethodRequestDto`, `UpdatePaymentMethodRequestDto` all exported.

**Step 6: Commit**

```bash
git add apps/backend/openapi.json apps/web/src/api/generated/ apps/mobile/src/api/generated/
git commit -m "chore: regenerate OpenAPI spec and Orval output with payment-method types"
```

---

## Task 4: Web — Migrate `use-payment-methods.ts` to Generated Hooks

**Files:**
- Modify: `apps/web/src/hooks/use-payment-methods.ts`
- Modify: `apps/web/src/types/index.ts` (add PaymentMethod re-exports)

**Step 1: Add PaymentMethod re-exports to types/index.ts**

Add to the existing re-export block:
```typescript
export type { PaymentMethodResponseDto as PaymentMethod } from '@/api/generated/model';
export type { CreatePaymentMethodRequestDto as CreatePaymentMethodInput } from '@/api/generated/model';
export type { UpdatePaymentMethodRequestDto as UpdatePaymentMethodInput } from '@/api/generated/model';
```

**Step 2: Rewrite `use-payment-methods.ts`**

Replace the 4 manual type definitions (`PaymentMethodType`, `PaymentMethod`, `CreatePaymentMethodInput`, `UpdatePaymentMethodInput`) and all `apiClient` calls with generated hook imports. The hook should:
- Import generated mutation/query hooks from `@/api/generated/endpoints/payment-method/payment-method`
- Remove the `apiClient` import
- Delete all 4 manual type definitions
- Replace `apiClient.get('/payment-methods')` with the generated query hook
- Replace `apiClient.post/put/delete` with generated mutation hooks
- Unwrap `.data` from responses where needed

**Step 3: Verify no compile errors**

```bash
cd apps/web && npx tsc --noEmit
```

**Step 4: Commit**

```bash
git add apps/web/src/hooks/use-payment-methods.ts apps/web/src/types/index.ts
git commit -m "refactor(web): migrate use-payment-methods to generated hooks"
```

---

## Task 5: Web — Migrate `use-transactions.ts` to Generated Functions

**Files:**
- Modify: `apps/web/src/hooks/use-transactions.ts`

This hook uses `useInfiniteQuery` that calls both `/expenses` and `/incomes` simultaneously. It cannot use the generated React Query hooks directly (those are single-resource). Instead, use the raw generated fetcher functions (`expenseControllerFindAll`, `incomeControllerFindAll`) inside the existing `useInfiniteQuery`.

**Step 1: Replace apiClient calls with generated fetchers**

Replace:
```typescript
import { apiClient } from "@/lib/api-client";
```
With imports of the raw generated functions:
```typescript
import { expenseControllerFindAll } from "@/api/generated/endpoints/expense/expense";
import { incomeControllerFindAll } from "@/api/generated/endpoints/income/income";
```

Replace each `apiClient.get<PaginatedResponse<ExpenseResponse>>("/expenses", params)` with `expenseControllerFindAll(params)` and unwrap `.data` from the response.

Same for income calls.

**Step 2: Remove `PaginatedResponse` import and use generated paginated types**

The generated `expenseControllerFindAll` returns a typed response that includes the paginated shape. Use its return type directly instead of `PaginatedResponse<ExpenseResponse>`.

**Step 3: Verify compile and commit**

```bash
cd apps/web && npx tsc --noEmit
git add apps/web/src/hooks/use-transactions.ts
git commit -m "refactor(web): migrate use-transactions to generated fetchers"
```

---

## Task 6: Web — Migrate `use-categories.ts` to Generated Hooks

**Files:**
- Modify: `apps/web/src/hooks/use-categories.ts`

**Step 1: Replace all 5 apiClient calls**

Replace `apiClient` import with:
```typescript
import { expenseCategoryControllerFindAll, expenseCategoryControllerCreate } from "@/api/generated/endpoints/expense-category/expense-category";
import { storeItemCategoryControllerFindAll } from "@/api/generated/endpoints/store-item-category/store-item-category";
import { incomeCategoryControllerFindAll } from "@/api/generated/endpoints/income-category/income-category";
```

Replace each call, unwrapping `.data` from responses. The generated functions return typed paginated/list responses.

**Step 2: Verify compile and commit**

```bash
cd apps/web && npx tsc --noEmit
git add apps/web/src/hooks/use-categories.ts
git commit -m "refactor(web): migrate use-categories to generated fetchers"
```

---

## Task 7: Web — Migrate `use-stores.ts` to Generated Hooks

**Files:**
- Modify: `apps/web/src/hooks/use-stores.ts`

**Step 1: Replace 2 apiClient calls**

Replace `apiClient` import with:
```typescript
import { storeControllerFindAll, storeControllerCreate } from "@/api/generated/endpoints/store/store";
```

Replace `apiClient.get("/stores", ...)` → `storeControllerFindAll(params)`, unwrap `.data`.
Replace `apiClient.post("/stores", ...)` → `storeControllerCreate(body)`, unwrap `.data`.

**Step 2: Verify compile and commit**

```bash
cd apps/web && npx tsc --noEmit
git add apps/web/src/hooks/use-stores.ts
git commit -m "refactor(web): migrate use-stores to generated fetchers"
```

---

## Task 8: Web — Migrate `use-families.ts` to Generated Hooks

**Files:**
- Modify: `apps/web/src/hooks/use-families.ts`

This file has 12 apiClient calls — the largest single file.

**Step 1: Replace all 12 apiClient calls**

Import all needed functions from `@/api/generated/endpoints/family/family`:
```typescript
import {
  familyControllerFindAll,
  familyControllerFindOne,
  familyControllerCreate,
  familyControllerGetPendingInvitations,
  familyControllerGetFamilyPendingInvitations,
  familyControllerInviteMember,
  familyControllerRemoveMember,
  familyControllerLeaveFamily,
  familyControllerAcceptInvitation,
  familyControllerDeclineInvitation,
  familyControllerCancelInvitation,
} from "@/api/generated/endpoints/family/family";
```

Replace each call, unwrapping `.data` where the response payload is consumed.

**Step 2: Verify compile and commit**

```bash
cd apps/web && npx tsc --noEmit
git add apps/web/src/hooks/use-families.ts
git commit -m "refactor(web): migrate use-families to generated fetchers"
```

---

## Task 9: Web — Migrate `use-dashboard-data.ts` to Generated Functions

**Files:**
- Modify: `apps/web/src/hooks/use-dashboard-data.ts`

This file has 7 apiClient calls spanning expenses, incomes, and transactions.

**Step 1: Replace all 7 apiClient calls**

```typescript
import { expenseControllerFindAll, expenseControllerGetStatistics, expenseControllerGetTrends } from "@/api/generated/endpoints/expense/expense";
import { incomeControllerFindAll } from "@/api/generated/endpoints/income/income";
import { transactionControllerGetStatistics } from "@/api/generated/endpoints/transaction/transaction";
```

Replace each call, unwrapping `.data`.

**Step 2: Verify compile and commit**

```bash
cd apps/web && npx tsc --noEmit
git add apps/web/src/hooks/use-dashboard-data.ts
git commit -m "refactor(web): migrate use-dashboard-data to generated fetchers"
```

---

## Task 10: Web — Migrate `use-basket-mutations.ts` and `use-baskets.ts`

**Files:**
- Modify: `apps/web/src/hooks/use-basket-mutations.ts` (4 apiClient calls)
- Modify: `apps/web/src/hooks/use-baskets.ts` (1 apiClient call)

**Step 1: Replace basket calls**

```typescript
import {
  basketControllerAddItem,
  basketControllerUpdateItem,
  basketControllerRemoveItem,
  basketControllerCheckout,
  basketControllerListBaskets,
} from "@/api/generated/endpoints/basket/basket";
```

Replace each call, unwrapping `.data`.

**Step 2: Verify compile and commit**

```bash
cd apps/web && npx tsc --noEmit
git add apps/web/src/hooks/use-basket-mutations.ts apps/web/src/hooks/use-baskets.ts
git commit -m "refactor(web): migrate basket hooks to generated fetchers"
```

---

## Task 11: Web — Migrate `use-notifications.ts` and `use-push-subscription.ts`

**Files:**
- Modify: `apps/web/src/hooks/use-notifications.ts` (5 apiClient calls)
- Modify: `apps/web/src/hooks/use-push-subscription.ts` (1 apiClient call)

**Step 1: Replace notification calls**

```typescript
import {
  notificationControllerGetNotifications,
  notificationControllerGetUnreadCount,
  notificationControllerMarkAsRead,
  notificationControllerMarkAllAsRead,
  notificationControllerDeleteNotification,
} from "@/api/generated/endpoints/notification/notification";
import {
  notificationPreferenceControllerRegisterWebPush,
} from "@/api/generated/endpoints/notification-preference/notification-preference";
```

**Step 2: Verify compile and commit**

```bash
cd apps/web && npx tsc --noEmit
git add apps/web/src/hooks/use-notifications.ts apps/web/src/hooks/use-push-subscription.ts
git commit -m "refactor(web): migrate notification hooks to generated fetchers"
```

---

## Task 12: Web — Migrate `auth-provider.tsx`

**Files:**
- Modify: `apps/web/src/providers/auth-provider.tsx`

**Important:** The `/api/auth/get-session` endpoint is a better-auth route NOT in the OpenAPI spec. Use `authControllerMe` (`/auth/me`) as the replacement for fetching the current user session, OR keep a single raw fetch for this one endpoint using `customInstance` directly.

**Step 1: Replace auth calls**

```typescript
import { authControllerLogin, authControllerRegister, authControllerLogout, authControllerMe } from "@/api/generated/endpoints/auth/auth";
```

Replace:
- `apiClient.post("/auth/login", ...)` → `authControllerLogin(credentials)`, unwrap `.data`
- `apiClient.post("/auth/register", ...)` → `authControllerRegister(data)`, unwrap `.data`
- `apiClient.post("/auth/logout", ...)` → `authControllerLogout()`
- `apiClient.get("/api/auth/get-session")` → `authControllerMe()`, unwrap `.data` — this returns `MeResponseDto` instead of `{ user: User }`, so adjust the session check accordingly

**Step 2: Verify compile and commit**

```bash
cd apps/web && npx tsc --noEmit
git add apps/web/src/providers/auth-provider.tsx
git commit -m "refactor(web): migrate auth-provider to generated fetchers"
```

---

## Task 13: Web — Migrate Remaining Hooks

**Files:**
- Modify: `apps/web/src/hooks/use-expense-submission.ts` (1 call)
- Modify: `apps/web/src/hooks/use-items.ts` (1 call)
- Modify: `apps/web/src/hooks/use-items-with-prices.ts` (1 call)
- Modify: `apps/web/src/hooks/use-store-items.ts` (1 call)
- Modify: `apps/web/src/hooks/use-store-item-prices.ts` (1 call)
- Modify: `apps/web/src/hooks/use-receipt-scan.ts` (1 apiClient call — the SSE fetch stays as raw fetch)
- Modify: `apps/web/src/hooks/use-debounced-ai-suggestion.ts` (1 call — imperative, use raw function)
- Modify: `apps/web/src/components/add-transaction/income-form.tsx` (1 call)
- Modify: `apps/web/src/components/basket/basket-checkout-dialog.tsx` (2 calls — imperative with AbortController)
- Modify: `apps/web/src/app/(app)/transactions/[id]/page.tsx` (2 calls — dynamic expense/income)

**Step 1: Migrate each file**

For each file:
- Replace `import { apiClient } from "@/lib/api-client"` with the relevant generated function import
- Replace each `apiClient.method(url, ...)` with the generated function
- Unwrap `.data` from responses
- For imperative calls (ai-suggestion, basket-checkout), use the raw generated function with `{ signal }` option
- For `use-receipt-scan.ts`, only migrate the `apiClient.post("/receipts/process", formData)` call to `receiptControllerProcessReceipt`; keep the raw `fetch` for SSE streaming

**Step 2: Delete manual type definitions replaced by generated types**

In each file, remove the inline manual types:
- `use-items.ts`: delete `ItemResult` interface
- `use-store-items.ts`: delete `StoreItemResult` interface
- `use-store-item-prices.ts`: delete `StoreItemPrice` interface
- `use-debounced-ai-suggestion.ts`: delete `SuggestCategoryResponse` interface, replace `AiSuggestion` with `SuggestCategoryResponseDto` fields
- `basket-checkout-dialog.tsx`: delete `AiSuggestResponse` interface
- `use-receipt-scan.ts`: delete `ProcessedReceiptResponse` and `JobSubmitResponse`, keep `JobStreamEvent` (SSE)

**Step 3: Verify compile and commit**

```bash
cd apps/web && npx tsc --noEmit
git add apps/web/src/hooks/ apps/web/src/components/ apps/web/src/app/
git commit -m "refactor(web): migrate remaining hooks to generated fetchers and remove manual types"
```

---

## Task 14: Web — Clean Up Manual Types and Delete apiClient

**Files:**
- Modify: `apps/web/src/types/transaction.ts` — remove `TransactionType` and `TransactionScope`, keep `Transaction`, `TransactionItem`, `TransactionFilters`
- Modify: `apps/web/src/types/index.ts` — add re-exports for `TransactionResponseDtoType`, `TransactionResponseDtoScope` if they're used
- Delete: `apps/web/src/lib/pagination.ts` — no longer needed once all hooks use generated paginated types
- Delete: `apps/web/src/lib/api-client.ts` — no remaining consumers

**Step 1: Update transaction types**

In `types/transaction.ts`:
- Remove `export type TransactionType = "expense" | "income";`
- Remove `export type TransactionScope = "PERSONAL" | "FAMILY";`
- Update any imports of these to use the generated equivalents from `@/api/generated/model`

**Step 2: Delete `api-client.ts` and `pagination.ts`**

```bash
rm apps/web/src/lib/api-client.ts
rm apps/web/src/lib/pagination.ts
```

**Step 3: Verify no remaining references**

```bash
grep -r "apiClient\|api-client\|pagination" apps/web/src/ --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v generated
```

Expected: Zero matches (except possibly comments).

**Step 4: Build check**

```bash
cd apps/web && npx tsc --noEmit
```

**Step 5: Commit**

```bash
git add -A apps/web/src/
git commit -m "refactor(web): delete manual apiClient, pagination helper, and redundant type aliases"
```

---

## Task 15: Mobile — Delete Dead Code in `features/auth/types.ts`

**Files:**
- Delete: `apps/mobile/src/features/auth/types.ts`
- Modify: `apps/mobile/src/features/index.ts` — remove `auth/types` re-exports

**Step 1: Delete the file**

```bash
rm apps/mobile/src/features/auth/types.ts
```

**Step 2: Remove re-exports from features/index.ts**

Remove lines that re-export `User`, `AuthContextType`, `SocialAuthData` from `./auth/types`.

**Step 3: Verify no imports reference the deleted file**

```bash
grep -r "features/auth/types\|from.*auth/types" apps/mobile/src/ --include="*.ts" --include="*.tsx"
```

Expected: Zero matches.

**Step 4: Commit**

```bash
git add apps/mobile/src/features/
git commit -m "refactor(mobile): delete dead auth/types.ts"
```

---

## Task 16: Mobile — Clean Up `features/expenses/types.ts`

**Files:**
- Modify: `apps/mobile/src/features/expenses/types.ts`
- Modify: `apps/mobile/src/features/index.ts`
- Modify: `apps/mobile/src/screens/add-expense/hooks/useExpenseItems.ts` — update imports

**Step 1: Remove `Category`, `Store`, `ExpenseItem` from expenses/types.ts**

Keep only `CurrentItem` (form state type with string fields — no generated equivalent).

**Step 2: Update imports in consuming files**

- `useExpenseItems.ts` may import `ExpenseItem` — replace with `ExpenseItemResponseDto` or `CreateExpenseItemRequestDto` from generated model
- Update `features/index.ts` to stop re-exporting removed types

**Step 3: Verify compile and commit**

```bash
cd apps/mobile && npx tsc --noEmit
git add apps/mobile/src/features/ apps/mobile/src/screens/add-expense/
git commit -m "refactor(mobile): clean expenses/types.ts, keep only CurrentItem"
```

---

## Task 17: Mobile — Replace Manual Types in Hooks

**Files:**
- Modify: `apps/mobile/src/hooks/useAnalytics.ts` — remove local `Transaction` re-declaration, import from `features/transactions/types`
- Modify: `apps/mobile/src/context/NotificationContext.tsx` — replace `Notification` with `NotificationResponseDto`
- Modify: `apps/mobile/src/screens/transactions/TransactionsListScreen.tsx` — replace `FamilyMemberData` with generated type
- Modify: `apps/mobile/src/screens/analytics/AnalyticsScreen.tsx` — replace `FamilyMemberData` with generated type
- Modify: `apps/mobile/src/features/transactions/types.ts` — remove `TransactionType`, keep `Transaction`, `TransactionItem`, `TransactionFilters`

**Step 1: Fix useAnalytics.ts**

Replace the locally declared `Transaction` interface (lines 5-29) with:
```typescript
import { Transaction } from '../features/transactions/types';
```

**Step 2: Fix NotificationContext.tsx**

Replace the local `Notification` interface with:
```typescript
import { NotificationResponseDto } from '../api/generated/model';
```

Update all usages of `Notification` to `NotificationResponseDto`. The generated type is a superset — no fields are lost, and additional fields become available.

**Step 3: Fix FamilyMemberData in both screens**

In both `TransactionsListScreen.tsx` and `AnalyticsScreen.tsx`, replace the local `FamilyMemberData` with a type derived from the generated model:
```typescript
import { FamilyMemberResponseDto } from '../../api/generated/model';
// Use FamilyMemberResponseDto directly, or create a minimal pick type if needed
```

**Step 4: Clean transaction types**

In `features/transactions/types.ts`, remove `export type TransactionType = "expense" | "income";` — replace usages with `TransactionResponseDtoType` from generated model.

**Step 5: Verify compile and commit**

```bash
cd apps/mobile && npx tsc --noEmit
git add apps/mobile/src/
git commit -m "refactor(mobile): replace manual types with generated equivalents"
```

---

## Task 18: Mobile — Migrate `usePaymentMethods.ts` to Generated Functions

**Files:**
- Modify: `apps/mobile/src/hooks/usePaymentMethods.ts`

**Step 1: Replace apiClient with generated function**

Replace:
```typescript
import { apiClient } from '../api/client';
```
With:
```typescript
import { paymentMethodControllerFindAll } from '../api/generated/endpoints/payment-method/payment-method';
import { PaymentMethodResponseDto } from '../api/generated/model';
```

Replace `apiClient.get('/payment-methods')` with `paymentMethodControllerFindAll()` and unwrap `.data`.

Replace the local `PaymentMethod` interface with `PaymentMethodResponseDto`.

**Step 2: Verify compile and commit**

```bash
cd apps/mobile && npx tsc --noEmit
git add apps/mobile/src/hooks/usePaymentMethods.ts
git commit -m "refactor(mobile): migrate usePaymentMethods to generated function"
```

---

## Task 19: Mobile — Migrate `PaymentMethodsScreen.tsx` to Generated Functions

**Files:**
- Modify: `apps/mobile/src/screens/payment-methods/PaymentMethodsScreen.tsx`

**Step 1: Replace apiClient with generated functions**

Replace:
```typescript
import { apiClient } from '../../api/client';
```
With:
```typescript
import {
  paymentMethodControllerCreate,
  paymentMethodControllerUpdate,
  paymentMethodControllerRemove,
} from '../../api/generated/endpoints/payment-method/payment-method';
```

Replace:
- `apiClient.post('/payment-methods', payload)` → `paymentMethodControllerCreate(payload)`, unwrap `.data`
- `apiClient.put('/payment-methods/${id}', payload)` → `paymentMethodControllerUpdate(id, payload)`, unwrap `.data`
- `apiClient.delete('/payment-methods/${id}')` → `paymentMethodControllerRemove(id)`

**Step 2: Verify compile and commit**

```bash
cd apps/mobile && npx tsc --noEmit
git add apps/mobile/src/screens/payment-methods/PaymentMethodsScreen.tsx
git commit -m "refactor(mobile): migrate PaymentMethodsScreen to generated functions"
```

---

## Task 20: Mobile — Migrate `useReceiptScanning.ts` to Generated Function

**Files:**
- Modify: `apps/mobile/src/hooks/useReceiptScanning.ts`

**Step 1: Replace direct customInstance call with generated function**

Replace:
```typescript
import { customInstance } from "../api/custom-instance";
```
With:
```typescript
import { receiptControllerProcessReceipt } from '../api/generated/endpoints/receipt/receipt';
```

Replace the manual `customInstance("/receipts/process", ...)` call with `receiptControllerProcessReceipt({ file: blob })` and unwrap `.data`.

Remove the manual `ProcessedReceiptData` interface and use `ProcessedReceiptResponseDto` from generated model.

**Step 2: Verify compile and commit**

```bash
cd apps/mobile && npx tsc --noEmit
git add apps/mobile/src/hooks/useReceiptScanning.ts
git commit -m "refactor(mobile): migrate useReceiptScanning to generated function"
```

---

## Task 21: Mobile — Fix `useImageUpload.ts`

**Files:**
- Modify: `apps/mobile/src/hooks/useImageUpload.ts`

**Important:** The mobile app calls `POST /receipts/upload` but this endpoint does NOT exist in the backend. The actual endpoint is `POST /receipts/process`. This hook needs to be corrected to call the right endpoint.

**Step 1: Replace direct customInstance call**

Replace:
```typescript
import { customInstance } from '../api/custom-instance';
```
With:
```typescript
import { receiptControllerProcessReceipt } from '../api/generated/endpoints/receipt/receipt';
```

Replace the `customInstance('/receipts/upload', ...)` call with `receiptControllerProcessReceipt({ file })`. Adjust the response shape handling — the generated function returns typed `ProcessReceiptResponseDto` (which has `jobId` and `status`), not `{ data: { url } }`.

**Note:** Investigate how this hook currently works if the backend endpoint doesn't exist — it may be returning errors silently, or there may be a proxy/middleware mapping. Read the hook carefully before modifying.

**Step 2: Verify compile and commit**

```bash
cd apps/mobile && npx tsc --noEmit
git add apps/mobile/src/hooks/useImageUpload.ts
git commit -m "fix(mobile): correct useImageUpload to use receipts/process endpoint"
```

---

## Task 22: Mobile — Fix `any[]` State in List Screens

**Files:**
- Modify: `apps/mobile/src/screens/ExpensesScreen.tsx` — replace `any[]` with `ExpenseResponseDto[]`
- Modify: `apps/mobile/src/screens/IncomesScreen.tsx` — replace `any[]` with `IncomeResponseDto[]`

**Step 1: Add proper types**

```typescript
import { ExpenseResponseDto } from '../api/generated/model';
// Replace: useState<any[]>([])
// With:    useState<ExpenseResponseDto[]>([])
```

Same pattern for incomes with `IncomeResponseDto`.

**Step 2: Verify compile and commit**

```bash
cd apps/mobile && npx tsc --noEmit
git add apps/mobile/src/screens/ExpensesScreen.tsx apps/mobile/src/screens/IncomesScreen.tsx
git commit -m "refactor(mobile): replace any[] with generated DTO types in list screens"
```

---

## Task 23: Mobile — Delete Legacy apiClient

**Files:**
- Delete: `apps/mobile/src/api/client.ts`

**Step 1: Verify no remaining consumers**

```bash
grep -r "api/client\|apiClient" apps/mobile/src/ --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v generated
```

Expected: Zero matches.

**Step 2: Delete the file**

```bash
rm apps/mobile/src/api/client.ts
```

**Step 3: Build check**

```bash
cd apps/mobile && npx tsc --noEmit
```

**Step 4: Commit**

```bash
git add apps/mobile/src/api/client.ts
git commit -m "refactor(mobile): delete legacy apiClient"
```

---

## Task 24: Final Verification

**Files:** None — verification only.

**Step 1: Full build — web**

```bash
cd apps/web && yarn build
```

Expected: Build succeeds.

**Step 2: Full build — mobile**

```bash
cd apps/mobile && npx tsc --noEmit
```

Expected: No type errors.

**Step 3: Run web tests**

```bash
cd apps/web && yarn test
```

Note: If any tests mock `apiClient`, they will need updating to mock the generated functions instead. Expected pre-existing failures only (expense.mapper.spec.ts, llm-receipt.parser.spec.ts per MEMORY.md).

**Step 4: Run backend tests (sanity check for OpenAPI changes)**

```bash
cd apps/backend && yarn test
```

**Step 5: Verify zero manual apiClient usage**

```bash
grep -r "from.*api-client\|from.*api/client\|apiClient" apps/web/src/ apps/mobile/src/ --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v generated
```

Expected: Zero matches.

**Step 6: Verify zero duplicate types**

Spot-check that these manual types no longer exist:
```bash
grep -r "interface ItemResult\|interface StoreItemResult\|interface StoreItemPrice\|interface AiSuggestResponse\|interface SuggestCategoryResponse" apps/web/src/ --include="*.ts" --include="*.tsx"
grep -r "interface PaymentMethod \|interface ProcessedReceiptData\|interface Notification " apps/mobile/src/ --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v generated
```

Expected: Zero matches.

**Step 7: Final commit if any stragglers**

```bash
git status
# If clean, you're done. If not, add remaining files and commit.
```
