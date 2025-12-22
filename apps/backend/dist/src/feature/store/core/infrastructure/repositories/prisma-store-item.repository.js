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
exports.PrismaStoreItemRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../common/prisma/prisma.service");
const store_item_mapper_1 = require("../mappers/store-item.mapper");
const prismaNamespace_1 = require("../../../../../../prisma/generated/prisma/internal/prismaNamespace");
let PrismaStoreItemRepository = class PrismaStoreItemRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const item = await this.prisma.storeItem.create({
            data: {
                storeId: data.storeId,
                name: data.name,
                price: new prismaNamespace_1.Decimal(data.price?.toString() || '0'),
                categoryId: data.categoryId,
                isDiscounted: data.isDiscounted ?? false,
            },
        });
        return store_item_mapper_1.StoreItemMapper.toDomain(item);
    }
    async findById(id) {
        const item = await this.prisma.storeItem.findUnique({
            where: { id },
        });
        return item ? store_item_mapper_1.StoreItemMapper.toDomain(item) : null;
    }
    async findByStoreAndName(storeId, name) {
        const item = await this.prisma.storeItem.findFirst({
            where: {
                storeId,
                name,
            },
            orderBy: { createdAt: 'desc' },
        });
        return item ? store_item_mapper_1.StoreItemMapper.toDomain(item) : null;
    }
    async findByStoreId(storeId, pagination) {
        const [items, total] = await Promise.all([
            this.prisma.storeItem.findMany({
                where: { storeId },
                orderBy: { name: 'asc' },
                skip: pagination?.skip,
                take: pagination?.take,
            }),
            this.prisma.storeItem.count({ where: { storeId } }),
        ]);
        return {
            data: items.map(store_item_mapper_1.StoreItemMapper.toDomain),
            total,
        };
    }
    async findAll(pagination) {
        const [items, total] = await Promise.all([
            this.prisma.storeItem.findMany({
                orderBy: { name: 'asc' },
                skip: pagination?.skip,
                take: pagination?.take,
            }),
            this.prisma.storeItem.count(),
        ]);
        return {
            data: items.map(store_item_mapper_1.StoreItemMapper.toDomain),
            total,
        };
    }
    async update(id, data) {
        const updateData = {};
        if (data.name !== undefined) {
            updateData.name = data.name;
        }
        if (data.price !== undefined) {
            updateData.price = new prismaNamespace_1.Decimal(data.price.toString());
        }
        if (data.isDiscounted !== undefined) {
            updateData.isDiscounted = data.isDiscounted;
        }
        const item = await this.prisma.storeItem.update({
            where: { id },
            data: updateData,
        });
        return store_item_mapper_1.StoreItemMapper.toDomain(item);
    }
    async delete(id) {
        await this.prisma.storeItem.delete({
            where: { id },
        });
    }
};
exports.PrismaStoreItemRepository = PrismaStoreItemRepository;
exports.PrismaStoreItemRepository = PrismaStoreItemRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaStoreItemRepository);
//# sourceMappingURL=prisma-store-item.repository.js.map