"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncomeCategoryResponseDto = void 0;
class IncomeCategoryResponseDto {
    id;
    parentId;
    name;
    createdAt;
    updatedAt;
    static fromEntity(category) {
        const dto = new IncomeCategoryResponseDto();
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
exports.IncomeCategoryResponseDto = IncomeCategoryResponseDto;
//# sourceMappingURL=income-category-response.dto.js.map