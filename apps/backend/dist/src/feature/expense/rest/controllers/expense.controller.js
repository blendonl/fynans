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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseController = void 0;
const common_1 = require("@nestjs/common");
const expense_service_1 = require("../../core/application/services/expense.service");
const create_expense_request_dto_1 = require("../dto/create-expense-request.dto");
const update_expense_request_dto_1 = require("../dto/update-expense-request.dto");
const query_expense_dto_1 = require("../dto/query-expense.dto");
const expense_response_dto_1 = require("../dto/expense-response.dto");
const create_expense_dto_1 = require("../../core/application/dto/create-expense.dto");
const update_expense_dto_1 = require("../../core/application/dto/update-expense.dto");
const expense_filters_dto_1 = require("../../core/application/dto/expense-filters.dto");
const create_expense_item_dto_1 = require("../../../expense-item/core/application/dto/create-expense-item.dto");
const pagination_dto_1 = require("../../../transaction/core/application/dto/pagination.dto");
const current_user_decorator_1 = require("../../../auth/rest/decorators/current-user.decorator");
const user_entity_1 = require("../../../user/core/domain/entities/user.entity");
let ExpenseController = class ExpenseController {
    expenseService;
    constructor(expenseService) {
        this.expenseService = expenseService;
    }
    async create(createDto, user) {
        const coreDto = new create_expense_dto_1.CreateExpenseDto({
            userId: user.id,
            categoryId: createDto.categoryId,
            storeName: createDto.storeName,
            storeLocation: createDto.storeLocation,
            familyId: createDto.familyId,
            items: createDto.items.map((item) => new create_expense_item_dto_1.CreateExpenseItemDto({
                expenseId: '',
                categoryId: item.categoryId,
                itemName: item.itemName,
                itemPrice: item.itemPrice,
                discount: item.discount,
                quantity: item.quantity,
            })),
            recordedAt: createDto.recordedAt
                ? new Date(createDto.recordedAt)
                : undefined,
        });
        const expense = await this.expenseService.create(coreDto);
        return expense_response_dto_1.ExpenseResponseDto.fromEntity(expense);
    }
    async findAll(query, user) {
        const filters = new expense_filters_dto_1.ExpenseFilters({
            categoryId: query.categoryId,
            userId: query.familyId ? undefined : user.id,
            familyId: query.familyId,
            scope: query.scope,
            storeId: query.storeId,
            dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
            dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
            valueMin: query.valueMin,
            valueMax: query.valueMax,
        });
        const pagination = new pagination_dto_1.Pagination(query.page, query.limit);
        const result = await this.expenseService.findAll(user.id, filters, pagination);
        return {
            data: expense_response_dto_1.ExpenseResponseDto.fromEntities(result.data),
            total: result.total,
            page: pagination.page,
            limit: pagination.limit,
        };
    }
    async getStatistics(query, user) {
        const filters = new expense_filters_dto_1.ExpenseFilters({
            userId: query.familyId ? undefined : user.id,
            familyId: query.familyId,
            scope: query.scope,
            categoryId: query.categoryId,
            storeId: query.storeId,
            dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
            dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
            valueMin: query.valueMin,
            valueMax: query.valueMax,
        });
        const stats = await this.expenseService.getStatistics(user.id, filters);
        return {
            totalExpenses: stats.totalExpenses,
            expenseCount: stats.expenseCount,
            averageExpense: stats.averageExpense,
            expensesByCategory: stats.expensesByCategory,
            expensesByStore: stats.expensesByStore,
        };
    }
    async findOne(id, user) {
        const expense = await this.expenseService.findById(id, user.id);
        return expense_response_dto_1.ExpenseResponseDto.fromEntity(expense);
    }
    async update(id, updateDto, user) {
        const coreDto = new update_expense_dto_1.UpdateExpenseDto({
            categoryId: updateDto.categoryId,
            storeId: updateDto.storeId,
        });
        const expense = await this.expenseService.update(id, user.id, coreDto);
        return expense_response_dto_1.ExpenseResponseDto.fromEntity(expense);
    }
    async remove(id, user) {
        await this.expenseService.delete(id, user.id);
    }
};
exports.ExpenseController = ExpenseController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_expense_request_dto_1.CreateExpenseRequestDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_expense_dto_1.QueryExpenseDto, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('statistics'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_expense_dto_1.QueryExpenseDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_expense_request_dto_1.UpdateExpenseRequestDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ExpenseController.prototype, "remove", null);
exports.ExpenseController = ExpenseController = __decorate([
    (0, common_1.Controller)('expenses'),
    __metadata("design:paramtypes", [expense_service_1.ExpenseService])
], ExpenseController);
//# sourceMappingURL=expense.controller.js.map