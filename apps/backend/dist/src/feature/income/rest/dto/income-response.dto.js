"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomeResponseDto = void 0;
class IncomeResponseDto {
    id;
    transactionId;
    storeId;
    categoryId;
    createdAt;
    updatedAt;
    static fromEntity(income) {
        const dto = new IncomeResponseDto();
        dto.id = income.id;
        dto.transactionId = income.transactionId;
        dto.storeId = income.storeId;
        dto.categoryId = income.categoryId;
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