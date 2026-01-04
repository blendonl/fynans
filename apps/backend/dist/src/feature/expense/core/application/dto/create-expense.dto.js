"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateExpenseDto = void 0;
class CreateExpenseDto {
    userId;
    categoryId;
    storeName;
    storeLocation;
    items;
    familyId;
    scope;
    recordedAt;
    constructor(data) {
        this.userId = data.userId;
        this.categoryId = data.categoryId;
        this.storeName = data.storeName;
        this.storeLocation = data.storeLocation;
        this.items = data.items;
        this.familyId = data.familyId;
        this.recordedAt = data.recordedAt;
    }
}
exports.CreateExpenseDto = CreateExpenseDto;
//# sourceMappingURL=create-expense.dto.js.map