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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateStoreItemCategoryUseCase = void 0;
const common_1 = require("@nestjs/common");
let UpdateStoreItemCategoryUseCase = class UpdateStoreItemCategoryUseCase {
    storeItemCategoryRepository;
    constructor(storeItemCategoryRepository) {
        this.storeItemCategoryRepository = storeItemCategoryRepository;
    }
    async execute(id, dto) {
        const category = await this.storeItemCategoryRepository.findById(id);
        if (!category) {
            throw new common_1.NotFoundException('Store item category not found');
        }
        await this.validate(id, dto);
        const updated = await this.storeItemCategoryRepository.update(id, {
            name: dto.name,
            parentId: dto.parentId,
        });
        return updated;
    }
    async validate(id, dto) {
        if (dto.parentId !== undefined) {
            if (dto.parentId === id) {
                throw new common_1.BadRequestException('Category cannot be its own parent');
            }
            if (dto.parentId !== null) {
                const parent = await this.storeItemCategoryRepository.findById(dto.parentId);
                if (!parent) {
                    throw new common_1.BadRequestException('Parent category not found');
                }
                await this.checkCircularReference(id, dto.parentId);
            }
        }
    }
    async checkCircularReference(categoryId, newParentId) {
        let currentId = newParentId;
        while (currentId !== null) {
            if (currentId === categoryId) {
                throw new common_1.BadRequestException('Circular reference detected');
            }
            const current = await this.storeItemCategoryRepository.findById(currentId);
            if (!current) {
                break;
            }
            currentId = current.parentId;
        }
    }
};
exports.UpdateStoreItemCategoryUseCase = UpdateStoreItemCategoryUseCase;
exports.UpdateStoreItemCategoryUseCase = UpdateStoreItemCategoryUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('StoreItemCategoryRepository')),
    __metadata("design:paramtypes", [Object])
], UpdateStoreItemCategoryUseCase);
//# sourceMappingURL=update-store-item-category.use-case.js.map