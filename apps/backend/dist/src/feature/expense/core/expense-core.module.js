"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseCoreModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../common/prisma/prisma.module");
const transaction_core_module_1 = require("../../transaction/core/transaction-core.module");
const store_core_module_1 = require("../../store/core/store-core.module");
const expense_category_core_module_1 = require("../../expense-category/core/expense-category-core.module");
const expense_item_core_module_1 = require("../../expense-item/core/expense-item-core.module");
const family_core_module_1 = require("../../family/core/family-core.module");
const notification_core_module_1 = require("../../notification/core/notification-core.module");
const user_core_module_1 = require("../../user/core/user-core.module");
const prisma_expense_repository_1 = require("./infrastructure/repositories/prisma-expense.repository");
const create_expense_use_case_1 = require("./application/use-cases/create-expense.use-case");
const get_expense_by_id_use_case_1 = require("./application/use-cases/get-expense-by-id.use-case");
const list_expenses_use_case_1 = require("./application/use-cases/list-expenses.use-case");
const update_expense_use_case_1 = require("./application/use-cases/update-expense.use-case");
const delete_expense_use_case_1 = require("./application/use-cases/delete-expense.use-case");
const get_expense_statistics_use_case_1 = require("./application/use-cases/get-expense-statistics.use-case");
const add_item_to_expense_use_case_1 = require("./application/use-cases/add-item-to-expense.use-case");
const expense_service_1 = require("./application/services/expense.service");
let ExpenseCoreModule = class ExpenseCoreModule {
};
exports.ExpenseCoreModule = ExpenseCoreModule;
exports.ExpenseCoreModule = ExpenseCoreModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            transaction_core_module_1.TransactionCoreModule,
            store_core_module_1.StoreCoreModule,
            expense_category_core_module_1.ExpenseCategoryCoreModule,
            expense_item_core_module_1.ExpenseItemCoreModule,
            family_core_module_1.FamilyCoreModule,
            (0, common_1.forwardRef)(() => notification_core_module_1.NotificationCoreModule),
            user_core_module_1.UserCoreModule,
        ],
        providers: [
            {
                provide: 'ExpenseRepository',
                useClass: prisma_expense_repository_1.PrismaExpenseRepository,
            },
            create_expense_use_case_1.CreateExpenseUseCase,
            get_expense_by_id_use_case_1.GetExpenseByIdUseCase,
            list_expenses_use_case_1.ListExpensesUseCase,
            update_expense_use_case_1.UpdateExpenseUseCase,
            delete_expense_use_case_1.DeleteExpenseUseCase,
            get_expense_statistics_use_case_1.GetExpenseStatisticsUseCase,
            add_item_to_expense_use_case_1.AddItemToExpenseUseCase,
            expense_service_1.ExpenseService,
        ],
        exports: [expense_service_1.ExpenseService],
    })
], ExpenseCoreModule);
//# sourceMappingURL=expense-core.module.js.map