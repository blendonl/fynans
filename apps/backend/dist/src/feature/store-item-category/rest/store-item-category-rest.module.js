"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreItemCategoryRestModule = void 0;
const common_1 = require("@nestjs/common");
const store_item_category_core_module_1 = require("../core/store-item-category-core.module");
const store_item_category_controller_1 = require("./controllers/store-item-category.controller");
let StoreItemCategoryRestModule = class StoreItemCategoryRestModule {
};
exports.StoreItemCategoryRestModule = StoreItemCategoryRestModule;
exports.StoreItemCategoryRestModule = StoreItemCategoryRestModule = __decorate([
    (0, common_1.Module)({
        imports: [store_item_category_core_module_1.StoreItemCategoryCoreModule],
        controllers: [store_item_category_controller_1.StoreItemCategoryController],
    })
], StoreItemCategoryRestModule);
//# sourceMappingURL=store-item-category-rest.module.js.map