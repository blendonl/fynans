"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomeFilters = void 0;
class IncomeFilters {
    userId;
    categoryId;
    storeId;
    familyId;
    scope;
    dateFrom;
    dateTo;
    valueMin;
    valueMax;
    constructor(data) {
        this.userId = data.userId;
        this.categoryId = data.categoryId;
        this.storeId = data.storeId;
        this.familyId = data.familyId;
        this.scope = data.scope;
        this.dateFrom = data.dateFrom;
        this.dateTo = data.dateTo;
        this.valueMin = data.valueMin;
        this.valueMax = data.valueMax;
    }
}
exports.IncomeFilters = IncomeFilters;
//# sourceMappingURL=income-filters.dto.js.map