"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./common/prisma/prisma.module");
const auth_core_module_1 = require("./feature/auth/core/auth-core.module");
const auth_rest_module_1 = require("./feature/auth/rest/auth-rest.module");
const user_rest_module_1 = require("./feature/user/rest/user-rest.module");
const transaction_rest_module_1 = require("./feature/transaction/rest/transaction-rest.module");
const expense_category_rest_module_1 = require("./feature/expense-category/rest/expense-category-rest.module");
const store_item_category_rest_module_1 = require("./feature/store-item-category/rest/store-item-category-rest.module");
const expense_item_rest_module_1 = require("./feature/expense-item/rest/expense-item-rest.module");
const expense_rest_module_1 = require("./feature/expense/rest/expense-rest.module");
const store_rest_module_1 = require("./feature/store/rest/store-rest.module");
const income_category_rest_module_1 = require("./feature/income-category/rest/income-category-rest.module");
const income_rest_module_1 = require("./feature/income/rest/income-rest.module");
const auth_guard_1 = require("./feature/auth/rest/guards/auth.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            auth_core_module_1.AuthCoreModule,
            auth_rest_module_1.AuthRestModule,
            user_rest_module_1.UserRestModule,
            transaction_rest_module_1.TransactionRestModule,
            expense_category_rest_module_1.ExpenseCategoryRestModule,
            store_item_category_rest_module_1.StoreItemCategoryRestModule,
            expense_item_rest_module_1.ExpenseItemRestModule,
            expense_rest_module_1.ExpenseRestModule,
            store_rest_module_1.StoreRestModule,
            income_category_rest_module_1.IncomeCategoryRestModule,
            income_rest_module_1.IncomeRestModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: auth_guard_1.AuthGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map