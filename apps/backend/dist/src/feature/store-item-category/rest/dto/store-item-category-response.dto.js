"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreItemCategoryResponseDto = void 0;
class StoreItemCategoryResponseDto {
    id;
    parentId;
    name;
    createdAt;
    updatedAt;
    static fromEntity(category) {
        const dto = new StoreItemCategoryResponseDto();
        dto.id = category.id;
        dto.parentId = category.parentId;
        dto.name = category.name;
        dto.createdAt = category.createdAt;
        dto.updatedAt = category.updatedAt;
        return dto;
    }
    static fromEntities(categories) {
        return categories.map((category) => this.fromEntity(category));
    }
}
exports.StoreItemCategoryResponseDto = StoreItemCategoryResponseDto;
//# sourceMappingURL=store-item-category-response.dto.js.map