"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomeMapper = void 0;
const income_entity_1 = require("../../domain/entities/income.entity");
const transaction_mapper_1 = require("../../../../transaction/core/infrastructure/mappers/transaction.mapper");
const income_category_mapper_1 = require("../../../../income-category/core/infrastructure/mappers/income-category.mapper");
class IncomeMapper {
    static toDomain(prismaIncome) {
        return new income_entity_1.Income({
            id: prismaIncome.id,
            transactionId: prismaIncome.transactionId,
            storeId: prismaIncome.storeId,
            categoryId: prismaIncome.categoryId,
            transaction: prismaIncome.transaction
                ? transaction_mapper_1.TransactionMapper.toDomain(prismaIncome.transaction)
                : undefined,
            category: prismaIncome.category
                ? income_category_mapper_1.IncomeCategoryMapper.toDomain(prismaIncome.category)
                : undefined,
            createdAt: prismaIncome.createdAt,
            updatedAt: prismaIncome.updatedAt,
        });
    }
    static toPersistence(income) {
        return {
            id: income.id,
            transactionId: income.transactionId,
            storeId: income.storeId,
            categoryId: income.categoryId,
            createdAt: income.createdAt,
            updatedAt: income.updatedAt,
        };
    }
}
exports.IncomeMapper = IncomeMapper;
//# sourceMappingURL=income.mapper.js.map