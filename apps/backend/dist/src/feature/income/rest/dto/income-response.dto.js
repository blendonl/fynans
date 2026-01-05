"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomeResponseDto = void 0;
const rest_1 = require("../../../transaction/rest");
const income_category_response_dto_1 = require("../../../income-category/rest/dto/income-category-response.dto");
class IncomeResponseDto {
    id;
    transactionId;
    storeId;
    categoryId;
    transaction;
    category;
    createdAt;
    updatedAt;
    static fromEntity(income) {
        const dto = new IncomeResponseDto();
        dto.id = income.id;
        dto.transactionId = income.transactionId;
        dto.storeId = income.storeId;
        dto.categoryId = income.categoryId;
        dto.transaction = income.transaction ? rest_1.TransactionResponseDto.fromEntity(income.transaction) : undefined;
        dto.category = income.category ? income_category_response_dto_1.IncomeCategoryResponseDto.fromEntity(income.category) : undefined;
        dto.createdAt = income.createdAt;
        dto.updatedAt = income.updatedAt;
        return dto;
    }
    static fromEntities(incomes) {
        return incomes.map((income) => this.fromEntity(income));
    }
}
exports.IncomeResponseDto = IncomeResponseDto;
//# sourceMappingURL=income-response.dto.js.map