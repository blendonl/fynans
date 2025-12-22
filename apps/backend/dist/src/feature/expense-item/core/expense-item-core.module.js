"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseItemCoreModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../common/prisma/prisma.module");
const store_core_module_1 = require("../../store/core/store-core.module");
const store_item_category_core_module_1 = require("../../store-item-category/core/store-item-category-core.module");
const prisma_expense_item_repository_1 = require("./infrastructure/repositories/prisma-expense-item.repository");
const create_expense_item_use_case_1 = require("./application/use-cases/create-expense-item.use-case");
const get_expense_item_by_id_use_case_1 = require("./application/use-cases/get-expense-item-by-id.use-case");
const list_expense_items_use_case_1 = require("./application/use-cases/list-expense-items.use-case");
const update_expense_item_use_case_1 = require("./application/use-cases/update-expense-item.use-case");
const delete_expense_item_use_case_1 = require("./application/use-cases/delete-expense-item.use-case");
const calculate_expense_total_use_case_1 = require("./application/use-cases/calculate-expense-total.use-case");
const expense_item_service_1 = require("./application/services/expense-item.service");
let ExpenseItemCoreModule = class ExpenseItemCoreModule {
};
exports.ExpenseItemCoreModule = ExpenseItemCoreModule;
exports.ExpenseItemCoreModule = ExpenseItemCoreModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, store_core_module_1.StoreCoreModule, store_item_category_core_module_1.StoreItemCategoryCoreModule],
        providers: [
            {
                provide: 'ExpenseItemRepository',
                useClass: prisma_expense_item_repository_1.PrismaExpenseItemRepository,
            },
            create_expense_item_use_case_1.CreateExpenseItemUseCase,
            get_expense_item_by_id_use_case_1.GetExpenseItemByIdUseCase,
            list_expense_items_use_case_1.ListExpenseItemsUseCase,
            update_expense_item_use_case_1.UpdateExpenseItemUseCase,
            delete_expense_item_use_case_1.DeleteExpenseItemUseCase,
            calculate_expense_total_use_case_1.CalculateExpenseTotalUseCase,
            expense_item_service_1.ExpenseItemService,
        ],
        exports: [expense_item_service_1.ExpenseItemService, 'ExpenseItemRepository'],
    })
], ExpenseItemCoreModule);
//# sourceMappingURL=expense-item-core.module.js.map