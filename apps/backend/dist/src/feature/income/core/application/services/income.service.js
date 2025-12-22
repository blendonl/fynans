"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomeService = void 0;
const common_1 = require("@nestjs/common");
const create_income_use_case_1 = require("../use-cases/create-income.use-case");
const get_income_by_id_use_case_1 = require("../use-cases/get-income-by-id.use-case");
const get_income_by_transaction_id_use_case_1 = require("../use-cases/get-income-by-transaction-id.use-case");
const list_incomes_use_case_1 = require("../use-cases/list-incomes.use-case");
const update_income_use_case_1 = require("../use-cases/update-income.use-case");
const delete_income_use_case_1 = require("../use-cases/delete-income.use-case");
let IncomeService = class IncomeService {
    createIncomeUseCase;
    getIncomeByIdUseCase;
    getIncomeByTransactionIdUseCase;
    listIncomesUseCase;
    updateIncomeUseCase;
    deleteIncomeUseCase;
    constructor(createIncomeUseCase, getIncomeByIdUseCase, getIncomeByTransactionIdUseCase, listIncomesUseCase, updateIncomeUseCase, deleteIncomeUseCase) {
        this.createIncomeUseCase = createIncomeUseCase;
        this.getIncomeByIdUseCase = getIncomeByIdUseCase;
        this.getIncomeByTransactionIdUseCase = getIncomeByTransactionIdUseCase;
        this.listIncomesUseCase = listIncomesUseCase;
        this.updateIncomeUseCase = updateIncomeUseCase;
        this.deleteIncomeUseCase = deleteIncomeUseCase;
    }
    async create(dto) {
        return this.createIncomeUseCase.execute(dto);
    }
    async findById(id) {
        return this.getIncomeByIdUseCase.execute(id);
    }
    async findByTransactionId(transactionId) {
        return this.getIncomeByTransactionIdUseCase.execute(transactionId);
    }
    async findAll(storeId, pagination) {
        return this.listIncomesUseCase.execute(storeId, pagination);
    }
    async update(id, dto) {
        return this.updateIncomeUseCase.execute(id, dto);
    }
    async delete(id) {
        return this.deleteIncomeUseCase.execute(id);
    }
};
exports.IncomeService = IncomeService;
exports.IncomeService = IncomeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [create_income_use_case_1.CreateIncomeUseCase,
        get_income_by_id_use_case_1.GetIncomeByIdUseCase,
        get_income_by_transaction_id_use_case_1.GetIncomeByTransactionIdUseCase,
        list_incomes_use_case_1.ListIncomesUseCase,
        update_income_use_case_1.UpdateIncomeUseCase,
        delete_income_use_case_1.DeleteIncomeUseCase])
], IncomeService);
//# sourceMappingURL=income.service.js.map