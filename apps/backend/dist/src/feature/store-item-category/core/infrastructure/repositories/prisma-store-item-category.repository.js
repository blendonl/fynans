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
exports.PrismaStoreItemCategoryRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../common/prisma/prisma.service");
const store_item_category_mapper_1 = require("../mappers/store-item-category.mapper");
let PrismaStoreItemCategoryRepository = class PrismaStoreItemCategoryRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const category = await this.prisma.storeItemCategory.create({
            data: {
                name: data.name,
                parentId: data.parentId ?? null,
            },
        });
        return store_item_category_mapper_1.StoreItemCategoryMapper.toDomain(category);
    }
    async findById(id) {
        const category = await this.prisma.storeItemCategory.findUnique({
            where: { id },
        });
        return category ? store_item_category_mapper_1.StoreItemCategoryMapper.toDomain(category) : null;
    }
    async findAll(pagination) {
        const [categories, total] = await Promise.all([
            this.prisma.storeItemCategory.findMany({
                orderBy: { name: 'asc' },
                skip: pagination?.skip,
                take: pagination?.take,
            }),
            this.prisma.storeItemCategory.count(),
        ]);
        return {
            data: categories.map(store_item_category_mapper_1.StoreItemCategoryMapper.toDomain),
            total,
        };
    }
    async findByParentId(parentId, pagination) {
        const [categories, total] = await Promise.all([
            this.prisma.storeItemCategory.findMany({
                where: { parentId },
                orderBy: { name: 'asc' },
                skip: pagination?.skip,
                take: pagination?.take,
            }),
            this.prisma.storeItemCategory.count({ where: { parentId } }),
        ]);
        return {
            data: categories.map(store_item_category_mapper_1.StoreItemCategoryMapper.toDomain),
            total,
        };
    }
    async findChildren(parentId) {
        const categories = await this.prisma.storeItemCategory.findMany({
            where: { parentId },
            orderBy: { name: 'asc' },
        });
        return categories.map(store_item_category_mapper_1.StoreItemCategoryMapper.toDomain);
    }
    async update(id, data) {
        const updateData = {};
        if (data.name !== undefined) {
            updateData.name = data.name;
        }
        if (data.parentId !== undefined) {
            updateData.parentId = data.parentId;
        }
        const category = await this.prisma.storeItemCategory.update({
            where: { id },
            data: updateData,
        });
        return store_item_category_mapper_1.StoreItemCategoryMapper.toDomain(category);
    }
    async delete(id) {
        await this.prisma.storeItemCategory.delete({
            where: { id },
        });
    }
};
exports.PrismaStoreItemCategoryRepository = PrismaStoreItemCategoryRepository;
exports.PrismaStoreItemCategoryRepository = PrismaStoreItemCategoryRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaStoreItemCategoryRepository);
//# sourceMappingURL=prisma-store-item-category.repository.js.map