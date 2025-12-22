"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreItemMapper = void 0;
const store_item_entity_1 = require("../../domain/entities/store-item.entity");
class StoreItemMapper {
    static toDomain(prismaStoreItem) {
        return new store_item_entity_1.StoreItem({
            id: prismaStoreItem.id,
            storeId: prismaStoreItem.storeId,
            name: prismaStoreItem.name,
            price: prismaStoreItem.price,
            isDiscounted: prismaStoreItem.isDiscounted,
            categoryId: prismaStoreItem.categoryId,
            createdAt: prismaStoreItem.createdAt,
            updatedAt: prismaStoreItem.updatedAt,
        });
    }
    static toPersistence(storeItem) {
        return {
            id: storeItem.id,
            storeId: storeItem.storeId,
            name: storeItem.name,
            price: storeItem.price,
            isDiscounted: storeItem.isDiscounted,
            createdAt: storeItem.createdAt,
            updatedAt: storeItem.updatedAt,
        };
    }
}
exports.StoreItemMapper = StoreItemMapper;
//# sourceMappingURL=store-item.mapper.js.map