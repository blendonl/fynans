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
exports.CreateExpenseItemUseCase = void 0;
const common_1 = require("@nestjs/common");
const store_item_service_1 = require("../../../../store/core/application/services/store-item.service");
const create_store_item_dto_1 = require("../../../../store/core/application/dto/create-store-item.dto");
const prismaNamespace_1 = require("../../../../../../prisma/generated/prisma/internal/prismaNamespace");
let CreateExpenseItemUseCase = class CreateExpenseItemUseCase {
    expenseItemRepository;
    storeItemCategoryRepository;
    storeItemService;
    constructor(expenseItemRepository, storeItemCategoryRepository, storeItemService) {
        this.expenseItemRepository = expenseItemRepository;
        this.storeItemCategoryRepository = storeItemCategoryRepository;
        this.storeItemService = storeItemService;
    }
    async execute(dto, storeId) {
        await this.validate(dto);
        let itemId;
        if (dto.itemId) {
            const existingItem = await this.storeItemService.findById(dto.itemId);
            itemId = existingItem.id;
        }
        else {
            const storeItem = await this.storeItemService.createOrFind(new create_store_item_dto_1.CreateStoreItemDto(storeId, dto.itemName, dto.itemPrice));
            itemId = storeItem.id;
        }
        const expenseItem = await this.expenseItemRepository.create({
            expenseId: dto.expenseId,
            itemId,
            categoryId: dto.categoryId,
            price: new prismaNamespace_1.Decimal(dto.itemPrice),
            discount: new prismaNamespace_1.Decimal(dto.discount ?? 0),
        });
        return expenseItem;
    }
    async validate(dto) {
        if (!dto.expenseId || dto.expenseId.trim() === '') {
            throw new common_1.BadRequestException('Expense ID is required');
        }
        if (!dto.categoryId || dto.categoryId.trim() === '') {
            throw new common_1.BadRequestException('Category ID is required');
        }
        if (!dto.itemName || dto.itemName.trim() === '') {
            throw new common_1.BadRequestException('Item name is required');
        }
        if (dto.itemPrice < 0) {
            throw new common_1.BadRequestException('Item price must be non-negative');
        }
        if (dto.discount !== undefined && dto.discount < 0) {
            throw new common_1.BadRequestException('Discount must be non-negative');
        }
        if (dto.discount !== undefined && dto.discount > dto.itemPrice) {
            throw new common_1.BadRequestException('Discount cannot exceed price');
        }
        const category = await this.storeItemCategoryRepository.findById(dto.categoryId);
        if (!category) {
            throw new common_1.NotFoundException('Store item category not found');
        }
    }
};
exports.CreateExpenseItemUseCase = CreateExpenseItemUseCase;
exports.CreateExpenseItemUseCase = CreateExpenseItemUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('ExpenseItemRepository')),
    __param(1, (0, common_1.Inject)('StoreItemCategoryRepository')),
    __metadata("design:paramtypes", [Object, Object, store_item_service_1.StoreItemService])
], CreateExpenseItemUseCase);
//# sourceMappingURL=create-expense-item.use-case.js.map