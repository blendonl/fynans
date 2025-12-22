"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomeCoreModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../common/prisma/prisma.module");
const income_category_core_module_1 = require("../../income-category/core/income-category-core.module");
const prisma_income_repository_1 = require("./infrastructure/repositories/prisma-income.repository");
const create_income_use_case_1 = require("./application/use-cases/create-income.use-case");
const get_income_by_id_use_case_1 = require("./application/use-cases/get-income-by-id.use-case");
const get_income_by_transaction_id_use_case_1 = require("./application/use-cases/get-income-by-transaction-id.use-case");
const list_incomes_use_case_1 = require("./application/use-cases/list-incomes.use-case");
const update_income_use_case_1 = require("./application/use-cases/update-income.use-case");
const delete_income_use_case_1 = require("./application/use-cases/delete-income.use-case");
const income_service_1 = require("./application/services/income.service");
let IncomeCoreModule = class IncomeCoreModule {
};
exports.IncomeCoreModule = IncomeCoreModule;
exports.IncomeCoreModule = IncomeCoreModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, income_category_core_module_1.IncomeCategoryCoreModule],
        providers: [
            {
                provide: 'IncomeRepository',
                useClass: prisma_income_repository_1.PrismaIncomeRepository,
            },
            create_income_use_case_1.CreateIncomeUseCase,
            get_income_by_id_use_case_1.GetIncomeByIdUseCase,
            get_income_by_transaction_id_use_case_1.GetIncomeByTransactionIdUseCase,
            list_incomes_use_case_1.ListIncomesUseCase,
            update_income_use_case_1.UpdateIncomeUseCase,
            delete_income_use_case_1.DeleteIncomeUseCase,
            income_service_1.IncomeService,
        ],
        exports: [income_service_1.IncomeService, 'IncomeRepository'],
    })
], IncomeCoreModule);
//# sourceMappingURL=income-core.module.js.map