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
exports.IncomeCategoryController = void 0;
const common_1 = require("@nestjs/common");
const income_category_service_1 = require("../../core/application/services/income-category.service");
const create_income_category_request_dto_1 = require("../dto/create-income-category-request.dto");
const update_income_category_request_dto_1 = require("../dto/update-income-category-request.dto");
const income_category_response_dto_1 = require("../dto/income-category-response.dto");
const create_income_category_dto_1 = require("../../core/application/dto/create-income-category.dto");
const update_income_category_dto_1 = require("../../core/application/dto/update-income-category.dto");
const pagination_dto_1 = require("../../../transaction/core/application/dto/pagination.dto");
let IncomeCategoryController = class IncomeCategoryController {
    incomeCategoryService;
    constructor(incomeCategoryService) {
        this.incomeCategoryService = incomeCategoryService;
    }
    async create(createDto) {
        const coreDto = new create_income_category_dto_1.CreateIncomeCategoryDto(createDto.name, createDto.parentId);
        const category = await this.incomeCategoryService.create(coreDto);
        return income_category_response_dto_1.IncomeCategoryResponseDto.fromEntity(category);
    }
    async findAll(parentId, page, limit) {
        const pagination = new pagination_dto_1.Pagination(page, limit);
        const result = await this.incomeCategoryService.findAll(parentId, pagination);
        return {
            data: income_category_response_dto_1.IncomeCategoryResponseDto.fromEntities(result.data),
            total: result.total,
            page: pagination.page,
            limit: pagination.limit,
        };
    }
    async getTree() {
        const tree = await this.incomeCategoryService.getTree();
        const transformTree = (node) => ({
            category: income_category_response_dto_1.IncomeCategoryResponseDto.fromEntity(node.category),
            children: node.children.map(transformTree),
        });
        return tree.map(transformTree);
    }
    async findOne(id) {
        const category = await this.incomeCategoryService.findById(id);
        return income_category_response_dto_1.IncomeCategoryResponseDto.fromEntity(category);
    }
    async update(id, updateDto) {
        const coreDto = new update_income_category_dto_1.UpdateIncomeCategoryDto({
            name: updateDto.name,
            parentId: updateDto.parentId,
        });
        const category = await this.incomeCategoryService.update(id, coreDto);
        return income_category_response_dto_1.IncomeCategoryResponseDto.fromEntity(category);
    }
    async remove(id) {
        await this.incomeCategoryService.delete(id);
    }
};
exports.IncomeCategoryController = IncomeCategoryController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_income_category_request_dto_1.CreateIncomeCategoryRequestDto]),
    __metadata("design:returntype", Promise)
], IncomeCategoryController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('parentId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], IncomeCategoryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('tree'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IncomeCategoryController.prototype, "getTree", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IncomeCategoryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_income_category_request_dto_1.UpdateIncomeCategoryRequestDto]),
    __metadata("design:returntype", Promise)
], IncomeCategoryController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IncomeCategoryController.prototype, "remove", null);
exports.IncomeCategoryController = IncomeCategoryController = __decorate([
    (0, common_1.Controller)('income-categories'),
    __metadata("design:paramtypes", [income_category_service_1.IncomeCategoryService])
], IncomeCategoryController);
//# sourceMappingURL=income-category.controller.js.map