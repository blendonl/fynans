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
exports.StoreItemCategoryController = void 0;
const common_1 = require("@nestjs/common");
const store_item_category_service_1 = require("../../core/application/services/store-item-category.service");
const create_store_item_category_request_dto_1 = require("../dto/create-store-item-category-request.dto");
const update_store_item_category_request_dto_1 = require("../dto/update-store-item-category-request.dto");
const store_item_category_response_dto_1 = require("../dto/store-item-category-response.dto");
const create_store_item_category_dto_1 = require("../../core/application/dto/create-store-item-category.dto");
const update_store_item_category_dto_1 = require("../../core/application/dto/update-store-item-category.dto");
const pagination_dto_1 = require("../../../transaction/core/application/dto/pagination.dto");
let StoreItemCategoryController = class StoreItemCategoryController {
    storeItemCategoryService;
    constructor(storeItemCategoryService) {
        this.storeItemCategoryService = storeItemCategoryService;
    }
    async create(createDto) {
        const coreDto = new create_store_item_category_dto_1.CreateStoreItemCategoryDto(createDto.name, createDto.parentId);
        const category = await this.storeItemCategoryService.create(coreDto);
        return store_item_category_response_dto_1.StoreItemCategoryResponseDto.fromEntity(category);
    }
    async findAll(parentId, page, limit) {
        const pagination = new pagination_dto_1.Pagination(page, limit);
        const result = await this.storeItemCategoryService.findAll(parentId, pagination);
        return {
            data: store_item_category_response_dto_1.StoreItemCategoryResponseDto.fromEntities(result.data),
            total: result.total,
            page: pagination.page,
            limit: pagination.limit,
        };
    }
    async getTree() {
        const tree = await this.storeItemCategoryService.getTree();
        const transformTree = (node) => ({
            category: store_item_category_response_dto_1.StoreItemCategoryResponseDto.fromEntity(node.category),
            children: node.children.map(transformTree),
        });
        return tree.map(transformTree);
    }
    async findOne(id) {
        const category = await this.storeItemCategoryService.findById(id);
        return store_item_category_response_dto_1.StoreItemCategoryResponseDto.fromEntity(category);
    }
    async update(id, updateDto) {
        const coreDto = new update_store_item_category_dto_1.UpdateStoreItemCategoryDto({
            name: updateDto.name,
            parentId: updateDto.parentId,
        });
        const category = await this.storeItemCategoryService.update(id, coreDto);
        return store_item_category_response_dto_1.StoreItemCategoryResponseDto.fromEntity(category);
    }
    async remove(id) {
        await this.storeItemCategoryService.delete(id);
    }
};
exports.StoreItemCategoryController = StoreItemCategoryController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_store_item_category_request_dto_1.CreateStoreItemCategoryRequestDto]),
    __metadata("design:returntype", Promise)
], StoreItemCategoryController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('parentId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], StoreItemCategoryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('tree'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StoreItemCategoryController.prototype, "getTree", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StoreItemCategoryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_store_item_category_request_dto_1.UpdateStoreItemCategoryRequestDto]),
    __metadata("design:returntype", Promise)
], StoreItemCategoryController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StoreItemCategoryController.prototype, "remove", null);
exports.StoreItemCategoryController = StoreItemCategoryController = __decorate([
    (0, common_1.Controller)('expense-item-categories'),
    __metadata("design:paramtypes", [store_item_category_service_1.StoreItemCategoryService])
], StoreItemCategoryController);
//# sourceMappingURL=store-item-category.controller.js.map