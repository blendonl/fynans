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
exports.UpdateExpenseItemUseCase = void 0;
const common_1 = require("@nestjs/common");
const prismaNamespace_1 = require("../../../../../../prisma/generated/prisma/internal/prismaNamespace");
let UpdateExpenseItemUseCase = class UpdateExpenseItemUseCase {
    expenseItemRepository;
    storeItemCategoryRepository;
    constructor(expenseItemRepository, storeItemCategoryRepository) {
        this.expenseItemRepository = expenseItemRepository;
        this.storeItemCategoryRepository = storeItemCategoryRepository;
    }
    async execute(id, dto) {
        const item = await this.expenseItemRepository.findById(id);
        if (!item) {
            throw new common_1.NotFoundException('Expense item not found');
        }
        await this.validate(dto);
        const updated = await this.expenseItemRepository.update(id, {
            categoryId: dto.categoryId,
            price: dto.price !== undefined ? new prismaNamespace_1.Decimal(dto.price) : undefined,
            discount: dto.discount !== undefined ? new prismaNamespace_1.Decimal(dto.discount) : undefined,
        });
        return updated;
    }
    async validate(dto) {
        if (dto.price !== undefined && dto.price < 0) {
            throw new common_1.BadRequestException('Price must be non-negative');
        }
        if (dto.discount !== undefined && dto.discount < 0) {
            throw new common_1.BadRequestException('Discount must be non-negative');
        }
        if (dto.categoryId) {
            const category = await this.storeItemCategoryRepository.findById(dto.categoryId);
            if (!category) {
                throw new common_1.NotFoundException('Store item category not found');
            }
        }
    }
};
exports.UpdateExpenseItemUseCase = UpdateExpenseItemUseCase;
exports.UpdateExpenseItemUseCase = UpdateExpenseItemUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('ExpenseItemRepository')),
    __param(1, (0, common_1.Inject)('StoreItemCategoryRepository')),
    __metadata("design:paramtypes", [Object, Object])
], UpdateExpenseItemUseCase);
//# sourceMappingURL=update-expense-item.use-case.js.map