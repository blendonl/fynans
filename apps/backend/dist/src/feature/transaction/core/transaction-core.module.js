"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionCoreModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../common/prisma/prisma.module");
const family_core_module_1 = require("../../family/core/family-core.module");
const transaction_service_1 = require("./application/services/transaction.service");
const create_transaction_use_case_1 = require("./application/use-cases/create-transaction.use-case");
const get_transaction_by_id_use_case_1 = require("./application/use-cases/get-transaction-by-id.use-case");
const list_transactions_use_case_1 = require("./application/use-cases/list-transactions.use-case");
const update_transaction_use_case_1 = require("./application/use-cases/update-transaction.use-case");
const delete_transaction_use_case_1 = require("./application/use-cases/delete-transaction.use-case");
const get_transaction_statistics_use_case_1 = require("./application/use-cases/get-transaction-statistics.use-case");
const prisma_transaction_repository_1 = require("./infrastructure/repositories/prisma-transaction.repository");
let TransactionCoreModule = class TransactionCoreModule {
};
exports.TransactionCoreModule = TransactionCoreModule;
exports.TransactionCoreModule = TransactionCoreModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            family_core_module_1.FamilyCoreModule,
        ],
        providers: [
            {
                provide: 'TransactionRepository',
                useClass: prisma_transaction_repository_1.PrismaTransactionRepository,
            },
            create_transaction_use_case_1.CreateTransactionUseCase,
            get_transaction_by_id_use_case_1.GetTransactionByIdUseCase,
            list_transactions_use_case_1.ListTransactionsUseCase,
            update_transaction_use_case_1.UpdateTransactionUseCase,
            delete_transaction_use_case_1.DeleteTransactionUseCase,
            get_transaction_statistics_use_case_1.GetTransactionStatisticsUseCase,
            transaction_service_1.TransactionService,
        ],
        exports: [transaction_service_1.TransactionService],
    })
], TransactionCoreModule);
//# sourceMappingURL=transaction-core.module.js.map