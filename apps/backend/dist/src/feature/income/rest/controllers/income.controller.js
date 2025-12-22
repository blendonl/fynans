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
exports.IncomeController = void 0;
const common_1 = require("@nestjs/common");
const income_service_1 = require("../../core/application/services/income.service");
const create_income_request_dto_1 = require("../dto/create-income-request.dto");
const update_income_request_dto_1 = require("../dto/update-income-request.dto");
const income_response_dto_1 = require("../dto/income-response.dto");
const create_income_dto_1 = require("../../core/application/dto/create-income.dto");
const update_income_dto_1 = require("../../core/application/dto/update-income.dto");
const pagination_dto_1 = require("../../../transaction/core/application/dto/pagination.dto");
let IncomeController = class IncomeController {
    incomeService;
    constructor(incomeService) {
        this.incomeService = incomeService;
    }
    async create(createDto) {
        const coreDto = new create_income_dto_1.CreateIncomeDto(createDto.transactionId, createDto.storeId, createDto.categoryId);
        const income = await this.incomeService.create(coreDto);
        return income_response_dto_1.IncomeResponseDto.fromEntity(income);
    }
    async findAll(storeId, page, limit) {
        const pagination = new pagination_dto_1.Pagination(page, limit);
        const result = await this.incomeService.findAll(storeId, pagination);
        return {
            data: income_response_dto_1.IncomeResponseDto.fromEntities(result.data),
            total: result.total,
            page: pagination.page,
            limit: pagination.limit,
        };
    }
    async findByTransactionId(transactionId) {
        const income = await this.incomeService.findByTransactionId(transactionId);
        return income_response_dto_1.IncomeResponseDto.fromEntity(income);
    }
    async findOne(id) {
        const income = await this.incomeService.findById(id);
        return income_response_dto_1.IncomeResponseDto.fromEntity(income);
    }
    async update(id, updateDto) {
        const coreDto = new update_income_dto_1.UpdateIncomeDto({
            categoryId: updateDto.categoryId,
        });
        const income = await this.incomeService.update(id, coreDto);
        return income_response_dto_1.IncomeResponseDto.fromEntity(income);
    }
    async remove(id) {
        await this.incomeService.delete(id);
    }
};
exports.IncomeController = IncomeController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_income_request_dto_1.CreateIncomeRequestDto]),
    __metadata("design:returntype", Promise)
], IncomeController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('storeId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], IncomeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('transaction/:transactionId'),
    __param(0, (0, common_1.Param)('transactionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IncomeController.prototype, "findByTransactionId", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IncomeController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_income_request_dto_1.UpdateIncomeRequestDto]),
    __metadata("design:returntype", Promise)
], IncomeController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IncomeController.prototype, "remove", null);
exports.IncomeController = IncomeController = __decorate([
    (0, common_1.Controller)('incomes'),
    __metadata("design:paramtypes", [income_service_1.IncomeService])
], IncomeController);
//# sourceMappingURL=income.controller.js.map