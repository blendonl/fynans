"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreItemCategoryMapper = void 0;
const store_item_category_entity_1 = require("../../domain/entities/store-item-category.entity");
class StoreItemCategoryMapper {
    static toDomain(prismaCategory) {
        return new store_item_category_entity_1.StoreItemCategory({
            id: prismaCategory.id,
            parentId: prismaCategory.parentId,
            name: prismaCategory.name,
            createdAt: prismaCategory.createdAt,
            updatedAt: prismaCategory.updatedAt,
        });
    }
    static toPersistence(category) {
        return {
            id: category.id,
            parentId: category.parentId,
            name: category.name,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
        };
    }
}
exports.StoreItemCategoryMapper = StoreItemCategoryMapper;
//# sourceMappingURL=store-item-category.mapper.js.map