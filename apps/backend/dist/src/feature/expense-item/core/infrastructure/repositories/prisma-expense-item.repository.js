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
exports.PrismaExpenseItemRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../common/prisma/prisma.service");
const expense_item_mapper_1 = require("../mappers/expense-item.mapper");
const prismaNamespace_1 = require("../../../../../../prisma/generated/prisma/internal/prismaNamespace");
let PrismaExpenseItemRepository = class PrismaExpenseItemRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const item = await this.prisma.expenseItem.create({
            data: {
                itemId: data.itemId,
                expenseId: data.expenseId,
                price: new prismaNamespace_1.Decimal(data.price?.toString() || '0'),
                discount: new prismaNamespace_1.Decimal(data.discount?.toString() || '0'),
            },
            include: {
                item: { include: { category: true } },
                expense: true,
            },
        });
        return expense_item_mapper_1.ExpenseItemMapper.toDomain(item);
    }
    async findById(id) {
        const item = await this.prisma.expenseItem.findUnique({
            where: { id },
            include: {
                item: { include: { category: true } },
                expense: true,
            },
        });
        return item ? expense_item_mapper_1.ExpenseItemMapper.toDomain(item) : null;
    }
    async findByExpenseId(expenseId) {
        const items = await this.prisma.expenseItem.findMany({
            where: { expenseId },
            include: {
                item: { include: { category: true } },
                expense: true,
            },
            orderBy: { createdAt: 'asc' },
        });
        return items.map(expense_item_mapper_1.ExpenseItemMapper.toDomain);
    }
    async findAll(pagination) {
        const [items, total] = await Promise.all([
            this.prisma.expenseItem.findMany({
                include: {
                    item: { include: { category: true } },
                    expense: true,
                },
                orderBy: { createdAt: 'desc' },
                skip: pagination?.skip,
                take: pagination?.take,
            }),
            this.prisma.expenseItem.count(),
        ]);
        return {
            data: items.map(expense_item_mapper_1.ExpenseItemMapper.toDomain),
            total,
        };
    }
    async update(id, data) {
        const updateData = {};
        if (data.categoryId !== undefined) {
            updateData.categoryId = data.categoryId;
        }
        if (data.price !== undefined) {
            updateData.price = new prismaNamespace_1.Decimal(data.price.toString());
        }
        if (data.discount !== undefined) {
            updateData.discount = new prismaNamespace_1.Decimal(data.discount.toString());
        }
        const item = await this.prisma.expenseItem.update({
            where: { id },
            data: updateData,
            include: {
                item: { include: { category: true } },
                expense: true,
            },
        });
        return expense_item_mapper_1.ExpenseItemMapper.toDomain(item);
    }
    async delete(id) {
        await this.prisma.expenseItem.delete({
            where: { id },
        });
    }
    async deleteByExpenseId(expenseId) {
        await this.prisma.expenseItem.deleteMany({
            where: { expenseId },
        });
    }
    async calculateExpenseTotal(expenseId) {
        const items = await this.prisma.expenseItem.findMany({
            where: { expenseId },
            select: {
                price: true,
                discount: true,
            },
        });
        const total = items.reduce((sum, item) => {
            const finalPrice = item.price.minus(item.discount);
            return sum + finalPrice.toNumber();
        }, 0);
        return total;
    }
};
exports.PrismaExpenseItemRepository = PrismaExpenseItemRepository;
exports.PrismaExpenseItemRepository = PrismaExpenseItemRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaExpenseItemRepository);
//# sourceMappingURL=prisma-expense-item.repository.js.map