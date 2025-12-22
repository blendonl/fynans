"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreItemCategoryCoreModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../common/prisma/prisma.module");
const prisma_store_item_category_repository_1 = require("./infrastructure/repositories/prisma-store-item-category.repository");
const create_store_item_category_use_case_1 = require("./application/use-cases/create-store-item-category.use-case");
const get_store_item_category_by_id_use_case_1 = require("./application/use-cases/get-store-item-category-by-id.use-case");
const list_store_item_categories_use_case_1 = require("./application/use-cases/list-store-item-categories.use-case");
const get_item_category_tree_use_case_1 = require("./application/use-cases/get-item-category-tree.use-case");
const update_store_item_category_use_case_1 = require("./application/use-cases/update-store-item-category.use-case");
const delete_store_item_category_use_case_1 = require("./application/use-cases/delete-store-item-category.use-case");
const store_item_category_service_1 = require("./application/services/store-item-category.service");
let StoreItemCategoryCoreModule = class StoreItemCategoryCoreModule {
};
exports.StoreItemCategoryCoreModule = StoreItemCategoryCoreModule;
exports.StoreItemCategoryCoreModule = StoreItemCategoryCoreModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        providers: [
            {
                provide: 'StoreItemCategoryRepository',
                useClass: prisma_store_item_category_repository_1.PrismaStoreItemCategoryRepository,
            },
            create_store_item_category_use_case_1.CreateStoreItemCategoryUseCase,
            get_store_item_category_by_id_use_case_1.GetStoreItemCategoryByIdUseCase,
            list_store_item_categories_use_case_1.ListStoreItemCategoriesUseCase,
            get_item_category_tree_use_case_1.GetItemCategoryTreeUseCase,
            update_store_item_category_use_case_1.UpdateStoreItemCategoryUseCase,
            delete_store_item_category_use_case_1.DeleteStoreItemCategoryUseCase,
            store_item_category_service_1.StoreItemCategoryService,
        ],
        exports: [store_item_category_service_1.StoreItemCategoryService, 'StoreItemCategoryRepository'],
    })
], StoreItemCategoryCoreModule);
//# sourceMappingURL=store-item-category-core.module.js.map