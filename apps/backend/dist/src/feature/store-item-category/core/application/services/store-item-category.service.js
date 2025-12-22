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
exports.StoreItemCategoryService = void 0;
const common_1 = require("@nestjs/common");
const create_store_item_category_use_case_1 = require("../use-cases/create-store-item-category.use-case");
const get_store_item_category_by_id_use_case_1 = require("../use-cases/get-store-item-category-by-id.use-case");
const list_store_item_categories_use_case_1 = require("../use-cases/list-store-item-categories.use-case");
const get_item_category_tree_use_case_1 = require("../use-cases/get-item-category-tree.use-case");
const update_store_item_category_use_case_1 = require("../use-cases/update-store-item-category.use-case");
const delete_store_item_category_use_case_1 = require("../use-cases/delete-store-item-category.use-case");
let StoreItemCategoryService = class StoreItemCategoryService {
    createStoreItemCategoryUseCase;
    getStoreItemCategoryByIdUseCase;
    listStoreItemCategoriesUseCase;
    getItemCategoryTreeUseCase;
    updateStoreItemCategoryUseCase;
    deleteStoreItemCategoryUseCase;
    constructor(createStoreItemCategoryUseCase, getStoreItemCategoryByIdUseCase, listStoreItemCategoriesUseCase, getItemCategoryTreeUseCase, updateStoreItemCategoryUseCase, deleteStoreItemCategoryUseCase) {
        this.createStoreItemCategoryUseCase = createStoreItemCategoryUseCase;
        this.getStoreItemCategoryByIdUseCase = getStoreItemCategoryByIdUseCase;
        this.listStoreItemCategoriesUseCase = listStoreItemCategoriesUseCase;
        this.getItemCategoryTreeUseCase = getItemCategoryTreeUseCase;
        this.updateStoreItemCategoryUseCase = updateStoreItemCategoryUseCase;
        this.deleteStoreItemCategoryUseCase = deleteStoreItemCategoryUseCase;
    }
    async create(dto) {
        return this.createStoreItemCategoryUseCase.execute(dto);
    }
    async findById(id) {
        return this.getStoreItemCategoryByIdUseCase.execute(id);
    }
    async findAll(parentId, pagination) {
        return this.listStoreItemCategoriesUseCase.execute(parentId, pagination);
    }
    async getTree() {
        return this.getItemCategoryTreeUseCase.execute();
    }
    async update(id, dto) {
        return this.updateStoreItemCategoryUseCase.execute(id, dto);
    }
    async delete(id) {
        return this.deleteStoreItemCategoryUseCase.execute(id);
    }
};
exports.StoreItemCategoryService = StoreItemCategoryService;
exports.StoreItemCategoryService = StoreItemCategoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [create_store_item_category_use_case_1.CreateStoreItemCategoryUseCase,
        get_store_item_category_by_id_use_case_1.GetStoreItemCategoryByIdUseCase,
        list_store_item_categories_use_case_1.ListStoreItemCategoriesUseCase,
        get_item_category_tree_use_case_1.GetItemCategoryTreeUseCase,
        update_store_item_category_use_case_1.UpdateStoreItemCategoryUseCase,
        delete_store_item_category_use_case_1.DeleteStoreItemCategoryUseCase])
], StoreItemCategoryService);
//# sourceMappingURL=store-item-category.service.js.map