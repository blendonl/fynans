"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateExpenseUseCase = void 0;
const common_1 = require("@nestjs/common");
const transaction_service_1 = require("../../../../transaction/core/application/services/transaction.service");
const store_service_1 = require("../../../../store/core/application/services/store.service");
const expense_item_service_1 = require("../../../../expense-item/core/application/services/expense-item.service");
const create_notification_use_case_1 = require("../../../../notification/core/application/use-cases/create-notification.use-case");
const user_service_1 = require("../../../../user/core/application/services/user.service");
const create_transaction_dto_1 = require("../../../../transaction/core/application/dto/create-transaction.dto");
const create_store_dto_1 = require("../../../../store/core/application/dto/create-store.dto");
const create_expense_item_dto_1 = require("../../../../expense-item/core/application/dto/create-expense-item.dto");
const transaction_type_vo_1 = require("../../../../transaction/core/domain/value-objects/transaction-type.vo");
const notification_type_vo_1 = require("../../../../notification/core/domain/value-objects/notification-type.vo");
const uuid_1 = require("uuid");
let CreateExpenseUseCase = class CreateExpenseUseCase {
    expenseRepository;
    expenseCategoryRepository;
    familyRepository;
    transactionService;
    storeService;
    expenseItemService;
    createNotificationUseCase;
    userService;
    constructor(expenseRepository, expenseCategoryRepository, familyRepository, transactionService, storeService, expenseItemService, createNotificationUseCase, userService) {
        this.expenseRepository = expenseRepository;
        this.expenseCategoryRepository = expenseCategoryRepository;
        this.familyRepository = familyRepository;
        this.transactionService = transactionService;
        this.storeService = storeService;
        this.expenseItemService = expenseItemService;
        this.createNotificationUseCase = createNotificationUseCase;
        this.userService = userService;
    }
    async execute(dto) {
        await this.validate(dto);
        const category = await this.expenseCategoryRepository.findById(dto.categoryId);
        if (!category) {
            throw new common_1.NotFoundException('Expense category not found');
        }
        let store = null;
        console.log('Category isConnectedToStore:', category);
        if (category.isConnectedToStore) {
            if (!dto.storeName || !dto.storeLocation) {
                throw new common_1.BadRequestException('Store information is required for this category');
            }
            store = await this.storeService.createOrFind(new create_store_dto_1.CreateStoreDto(dto.storeName, dto.storeLocation));
        }
        const totalValue = dto.items.reduce((sum, item) => {
            const itemPrice = item.itemPrice;
            const discount = item.discount ?? 0;
            return sum + (itemPrice * (item.quantity ?? 1) - discount);
        }, 0);
        const transaction = await this.transactionService.create(new create_transaction_dto_1.CreateTransactionDto(dto.userId, transaction_type_vo_1.TransactionType.EXPENSE, totalValue, dto.recordedAt, dto.familyId));
        const expenseId = (0, uuid_1.v4)();
        const expense = await this.expenseRepository.create({
            id: expenseId,
            transactionId: transaction.id,
            storeId: store?.id,
            categoryId: dto.categoryId,
        });
        if (store) {
            await Promise.all(dto.items.map((item) => this.expenseItemService.create(new create_expense_item_dto_1.CreateExpenseItemDto({
                expenseId: expense.id,
                categoryId: item.categoryId,
                itemName: item.itemName,
                itemPrice: item.itemPrice,
                discount: item.discount,
                quantity: item.quantity,
            }), store.id)));
        }
        if (dto.familyId) {
            const family = await this.familyRepository.findById(dto.familyId);
            const expenseUser = await this.userService.findById(dto.userId);
            const allMembers = await this.familyRepository.findMembers(dto.familyId);
            for (const familyMember of allMembers) {
                if (familyMember.userId === dto.userId)
                    continue;
                await this.createNotificationUseCase.execute({
                    userId: familyMember.userId,
                    type: notification_type_vo_1.NotificationType.FAMILY_EXPENSE_CREATED,
                    data: {
                        expenseId: expense.id,
                        familyId: dto.familyId,
                        familyName: family?.name,
                        userName: expenseUser?.fullName,
                        amount: totalValue.toFixed(2),
                    },
                    deliveryMethods: [notification_type_vo_1.DeliveryMethod.IN_APP, notification_type_vo_1.DeliveryMethod.PUSH],
                    priority: notification_type_vo_1.NotificationPriority.LOW,
                    familyId: dto.familyId,
                });
            }
        }
        return this.expenseRepository.findById(expense.id);
    }
    async validate(dto) {
        if (!dto.userId || dto.userId.trim() === '') {
            throw new common_1.BadRequestException('User ID is required');
        }
        if (!dto.categoryId || dto.categoryId.trim() === '') {
            throw new common_1.BadRequestException('Category ID is required');
        }
        const category = await this.expenseCategoryRepository.findById(dto.categoryId);
        if (category?.isConnectedToStore) {
            if (!dto.storeName || dto.storeName.trim() === '') {
                throw new common_1.BadRequestException('Store name is required for this category');
            }
            if (!dto.storeLocation || dto.storeLocation.trim() === '') {
                throw new common_1.BadRequestException('Store location is required for this category');
            }
        }
        if (!dto.items || dto.items.length === 0) {
            throw new common_1.BadRequestException('At least one item is required');
        }
        for (const item of dto.items) {
            if (item.itemPrice < 0) {
                throw new common_1.BadRequestException('Item price must be non-negative');
            }
            if (item.discount !== undefined && item.discount < 0) {
                throw new common_1.BadRequestException('Item discount must be non-negative');
            }
            if (item.discount !== undefined && item.discount > item.itemPrice) {
                throw new common_1.BadRequestException('Item discount cannot exceed price');
            }
        }
    }
};
exports.CreateExpenseUseCase = CreateExpenseUseCase;
exports.CreateExpenseUseCase = CreateExpenseUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('ExpenseRepository')),
    __param(1, (0, common_1.Inject)('ExpenseCategoryRepository')),
    __param(2, (0, common_1.Inject)('FamilyRepository')),
    __metadata("design:paramtypes", [Object, Object, Object, transaction_service_1.TransactionService,
        store_service_1.StoreService,
        expense_item_service_1.ExpenseItemService,
        create_notification_use_case_1.CreateNotificationUseCase,
        user_service_1.UserService])
], CreateExpenseUseCase);
//# sourceMappingURL=create-expense.use-case.js.map