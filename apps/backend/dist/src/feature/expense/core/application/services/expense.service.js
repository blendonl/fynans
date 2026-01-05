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
exports.ExpenseService = void 0;
const common_1 = require("@nestjs/common");
const create_expense_use_case_1 = require("../use-cases/create-expense.use-case");
const get_expense_by_id_use_case_1 = require("../use-cases/get-expense-by-id.use-case");
const list_expenses_use_case_1 = require("../use-cases/list-expenses.use-case");
const update_expense_use_case_1 = require("../use-cases/update-expense.use-case");
const delete_expense_use_case_1 = require("../use-cases/delete-expense.use-case");
const get_expense_statistics_use_case_1 = require("../use-cases/get-expense-statistics.use-case");
const add_item_to_expense_use_case_1 = require("../use-cases/add-item-to-expense.use-case");
let ExpenseService = class ExpenseService {
    createExpenseUseCase;
    getExpenseByIdUseCase;
    listExpensesUseCase;
    updateExpenseUseCase;
    deleteExpenseUseCase;
    getExpenseStatisticsUseCase;
    addItemToExpenseUseCase;
    constructor(createExpenseUseCase, getExpenseByIdUseCase, listExpensesUseCase, updateExpenseUseCase, deleteExpenseUseCase, getExpenseStatisticsUseCase, addItemToExpenseUseCase) {
        this.createExpenseUseCase = createExpenseUseCase;
        this.getExpenseByIdUseCase = getExpenseByIdUseCase;
        this.listExpensesUseCase = listExpensesUseCase;
        this.updateExpenseUseCase = updateExpenseUseCase;
        this.deleteExpenseUseCase = deleteExpenseUseCase;
        this.getExpenseStatisticsUseCase = getExpenseStatisticsUseCase;
        this.addItemToExpenseUseCase = addItemToExpenseUseCase;
    }
    async create(dto) {
        return this.createExpenseUseCase.execute(dto);
    }
    async findById(id, userId) {
        return this.getExpenseByIdUseCase.execute(id, userId);
    }
    async findAll(userId, filters, pagination) {
        return this.listExpensesUseCase.execute(userId, filters, pagination);
    }
    async update(id, userId, dto) {
        return this.updateExpenseUseCase.execute(id, userId, dto);
    }
    async delete(id, userId) {
        return this.deleteExpenseUseCase.execute(id, userId);
    }
    async getStatistics(userId, filters) {
        return this.getExpenseStatisticsUseCase.execute(userId, filters);
    }
    async addItem(expenseId, itemDto, storeId) {
        return this.addItemToExpenseUseCase.execute(expenseId, itemDto, storeId);
    }
};
exports.ExpenseService = ExpenseService;
exports.ExpenseService = ExpenseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [create_expense_use_case_1.CreateExpenseUseCase,
        get_expense_by_id_use_case_1.GetExpenseByIdUseCase,
        list_expenses_use_case_1.ListExpensesUseCase,
        update_expense_use_case_1.UpdateExpenseUseCase,
        delete_expense_use_case_1.DeleteExpenseUseCase,
        get_expense_statistics_use_case_1.GetExpenseStatisticsUseCase,
        add_item_to_expense_use_case_1.AddItemToExpenseUseCase])
], ExpenseService);
//# sourceMappingURL=expense.service.js.map