"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreItemResponseDto = void 0;
class StoreItemResponseDto {
    id;
    storeId;
    name;
    price;
    isDiscounted;
    categoryId;
    createdAt;
    updatedAt;
    static fromEntity(storeItem) {
        const dto = new StoreItemResponseDto();
        dto.id = storeItem.id;
        dto.storeId = storeItem.storeId;
        dto.name = storeItem.name;
        dto.price = storeItem.price.toNumber();
        dto.isDiscounted = storeItem.isDiscounted;
        dto.createdAt = storeItem.createdAt;
        dto.updatedAt = storeItem.updatedAt;
        dto.categoryId = storeItem.categoryId;
        return dto;
    }
    static fromEntities(storeItems) {
        return storeItems.map((storeItem) => this.fromEntity(storeItem));
    }
}
exports.StoreItemResponseDto = StoreItemResponseDto;
//# sourceMappingURL=store-item-response.dto.js.map