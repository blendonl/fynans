"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomeCategoryCoreModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../common/prisma/prisma.module");
const prisma_income_category_repository_1 = require("./infrastructure/repositories/prisma-income-category.repository");
const create_income_category_use_case_1 = require("./application/use-cases/create-income-category.use-case");
const get_income_category_by_id_use_case_1 = require("./application/use-cases/get-income-category-by-id.use-case");
const list_income_categories_use_case_1 = require("./application/use-cases/list-income-categories.use-case");
const get_income_category_tree_use_case_1 = require("./application/use-cases/get-income-category-tree.use-case");
const update_income_category_use_case_1 = require("./application/use-cases/update-income-category.use-case");
const delete_income_category_use_case_1 = require("./application/use-cases/delete-income-category.use-case");
const income_category_service_1 = require("./application/services/income-category.service");
let IncomeCategoryCoreModule = class IncomeCategoryCoreModule {
};
exports.IncomeCategoryCoreModule = IncomeCategoryCoreModule;
exports.IncomeCategoryCoreModule = IncomeCategoryCoreModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        providers: [
            {
                provide: 'IncomeCategoryRepository',
                useClass: prisma_income_category_repository_1.PrismaIncomeCategoryRepository,
            },
            create_income_category_use_case_1.CreateIncomeCategoryUseCase,
            get_income_category_by_id_use_case_1.GetIncomeCategoryByIdUseCase,
            list_income_categories_use_case_1.ListIncomeCategoriesUseCase,
            get_income_category_tree_use_case_1.GetIncomeCategoryTreeUseCase,
            update_income_category_use_case_1.UpdateIncomeCategoryUseCase,
            delete_income_category_use_case_1.DeleteIncomeCategoryUseCase,
            income_category_service_1.IncomeCategoryService,
        ],
        exports: [income_category_service_1.IncomeCategoryService, 'IncomeCategoryRepository'],
    })
], IncomeCategoryCoreModule);
//# sourceMappingURL=income-category-core.module.js.map