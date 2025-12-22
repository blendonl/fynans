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
exports.IncomeCategoryService = void 0;
const common_1 = require("@nestjs/common");
const create_income_category_use_case_1 = require("../use-cases/create-income-category.use-case");
const get_income_category_by_id_use_case_1 = require("../use-cases/get-income-category-by-id.use-case");
const list_income_categories_use_case_1 = require("../use-cases/list-income-categories.use-case");
const get_income_category_tree_use_case_1 = require("../use-cases/get-income-category-tree.use-case");
const update_income_category_use_case_1 = require("../use-cases/update-income-category.use-case");
const delete_income_category_use_case_1 = require("../use-cases/delete-income-category.use-case");
let IncomeCategoryService = class IncomeCategoryService {
    createIncomeCategoryUseCase;
    getIncomeCategoryByIdUseCase;
    listIncomeCategoriesUseCase;
    getIncomeCategoryTreeUseCase;
    updateIncomeCategoryUseCase;
    deleteIncomeCategoryUseCase;
    constructor(createIncomeCategoryUseCase, getIncomeCategoryByIdUseCase, listIncomeCategoriesUseCase, getIncomeCategoryTreeUseCase, updateIncomeCategoryUseCase, deleteIncomeCategoryUseCase) {
        this.createIncomeCategoryUseCase = createIncomeCategoryUseCase;
        this.getIncomeCategoryByIdUseCase = getIncomeCategoryByIdUseCase;
        this.listIncomeCategoriesUseCase = listIncomeCategoriesUseCase;
        this.getIncomeCategoryTreeUseCase = getIncomeCategoryTreeUseCase;
        this.updateIncomeCategoryUseCase = updateIncomeCategoryUseCase;
        this.deleteIncomeCategoryUseCase = deleteIncomeCategoryUseCase;
    }
    async create(dto) {
        return this.createIncomeCategoryUseCase.execute(dto);
    }
    async findById(id) {
        return this.getIncomeCategoryByIdUseCase.execute(id);
    }
    async findAll(parentId, pagination) {
        return this.listIncomeCategoriesUseCase.execute(parentId, pagination);
    }
    async getTree() {
        return this.getIncomeCategoryTreeUseCase.execute();
    }
    async update(id, dto) {
        return this.updateIncomeCategoryUseCase.execute(id, dto);
    }
    async delete(id) {
        return this.deleteIncomeCategoryUseCase.execute(id);
    }
};
exports.IncomeCategoryService = IncomeCategoryService;
exports.IncomeCategoryService = IncomeCategoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [create_income_category_use_case_1.CreateIncomeCategoryUseCase,
        get_income_category_by_id_use_case_1.GetIncomeCategoryByIdUseCase,
        list_income_categories_use_case_1.ListIncomeCategoriesUseCase,
        get_income_category_tree_use_case_1.GetIncomeCategoryTreeUseCase,
        update_income_category_use_case_1.UpdateIncomeCategoryUseCase,
        delete_income_category_use_case_1.DeleteIncomeCategoryUseCase])
], IncomeCategoryService);
//# sourceMappingURL=income-category.service.js.map