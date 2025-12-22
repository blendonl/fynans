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
exports.PrismaIncomeRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../common/prisma/prisma.service");
const income_mapper_1 = require("../mappers/income.mapper");
let PrismaIncomeRepository = class PrismaIncomeRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const income = await this.prisma.income.create({
            data: {
                id: data.transactionId,
                transactionId: data.transactionId,
                storeId: data.storeId,
                categoryId: data.categoryId,
            },
            include: {
                transaction: true,
                category: true,
            },
        });
        return income_mapper_1.IncomeMapper.toDomain(income);
    }
    async findById(id) {
        const income = await this.prisma.income.findUnique({
            where: { id },
            include: {
                transaction: true,
                category: true,
            },
        });
        return income ? income_mapper_1.IncomeMapper.toDomain(income) : null;
    }
    async findByTransactionId(transactionId) {
        const income = await this.prisma.income.findUnique({
            where: { transactionId },
            include: {
                transaction: true,
                category: true,
            },
        });
        return income ? income_mapper_1.IncomeMapper.toDomain(income) : null;
    }
    async findByStoreId(storeId, pagination) {
        const [incomes, total] = await Promise.all([
            this.prisma.income.findMany({
                where: { storeId },
                include: {
                    transaction: true,
                    category: true,
                },
                orderBy: { createdAt: 'desc' },
                skip: pagination?.skip,
                take: pagination?.take,
            }),
            this.prisma.income.count({ where: { storeId } }),
        ]);
        return {
            data: incomes.map(income_mapper_1.IncomeMapper.toDomain),
            total,
        };
    }
    async findAll(pagination) {
        const [incomes, total] = await Promise.all([
            this.prisma.income.findMany({
                include: {
                    transaction: true,
                    category: true,
                },
                orderBy: { createdAt: 'desc' },
                skip: pagination?.skip,
                take: pagination?.take,
            }),
            this.prisma.income.count(),
        ]);
        return {
            data: incomes.map(income_mapper_1.IncomeMapper.toDomain),
            total,
        };
    }
    async update(id, data) {
        const updateData = {};
        if (data.categoryId !== undefined) {
            updateData.categoryId = data.categoryId;
        }
        const income = await this.prisma.income.update({
            where: { id },
            data: updateData,
            include: {
                transaction: true,
                category: true,
            },
        });
        return income_mapper_1.IncomeMapper.toDomain(income);
    }
    async delete(id) {
        await this.prisma.income.delete({
            where: { id },
        });
    }
};
exports.PrismaIncomeRepository = PrismaIncomeRepository;
exports.PrismaIncomeRepository = PrismaIncomeRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaIncomeRepository);
//# sourceMappingURL=prisma-income.repository.js.map