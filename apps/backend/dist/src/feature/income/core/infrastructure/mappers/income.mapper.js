"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomeMapper = void 0;
const income_entity_1 = require("../../domain/entities/income.entity");
class IncomeMapper {
    static toDomain(prismaIncome) {
        return new income_entity_1.Income({
            id: prismaIncome.id,
            transactionId: prismaIncome.transactionId,
            storeId: prismaIncome.storeId,
            categoryId: prismaIncome.categoryId,
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