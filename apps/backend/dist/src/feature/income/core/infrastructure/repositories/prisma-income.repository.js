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
const prismaNamespace_1 = require("../../../../../../prisma/generated/prisma/internal/prismaNamespace");
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
                transaction: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
                category: true,
            },
        });
        return income_mapper_1.IncomeMapper.toDomain(income);
    }
    async findById(id) {
        const income = await this.prisma.income.findUnique({
            where: { id },
            include: {
                transaction: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
                category: true,
            },
        });
        return income ? income_mapper_1.IncomeMapper.toDomain(income) : null;
    }
    async findByTransactionId(transactionId) {
        const income = await this.prisma.income.findUnique({
            where: { transactionId },
            include: {
                transaction: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
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
                    transaction: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                        },
                    },
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
    async findAll(filters, pagination) {
        const where = this.buildWhereClause(filters);
        const [incomes, total] = await Promise.all([
            this.prisma.income.findMany({
                where,
                include: {
                    transaction: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                        },
                    },
                    category: true,
                },
                orderBy: { createdAt: 'desc' },
                skip: pagination?.skip,
                take: pagination?.take,
            }),
            this.prisma.income.count({ where }),
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
                transaction: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
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
    buildWhereClause(filters) {
        if (!filters)
            return {};
        const where = {};
        if (filters.categoryId) {
            where.categoryId = filters.categoryId;
        }
        if (filters.storeId) {
            where.storeId = filters.storeId;
        }
        if (filters.userId ||
            filters.familyId ||
            filters.scope ||
            filters.valueMin !== undefined ||
            filters.valueMax !== undefined) {
            where.transaction = {};
            if (filters.userId) {
                where.transaction.userId = filters.userId;
            }
            if (filters.familyId) {
                where.transaction.familyId = filters.familyId;
            }
            if (filters.scope) {
                where.transaction.scope = filters.scope;
            }
            if (filters.valueMin !== undefined || filters.valueMax !== undefined) {
                where.transaction.value = {};
                if (filters.valueMin !== undefined) {
                    where.transaction.value.gte = new prismaNamespace_1.Decimal(filters.valueMin);
                }
                if (filters.valueMax !== undefined) {
                    where.transaction.value.lte = new prismaNamespace_1.Decimal(filters.valueMax);
                }
            }
        }
        if (filters.dateFrom || filters.dateTo) {
            where.createdAt = {};
            if (filters.dateFrom) {
                where.createdAt.gte = filters.dateFrom;
            }
            if (filters.dateTo) {
                where.createdAt.lte = filters.dateTo;
            }
        }
        return where;
    }
};
exports.PrismaIncomeRepository = PrismaIncomeRepository;
exports.PrismaIncomeRepository = PrismaIncomeRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaIncomeRepository);
//# sourceMappingURL=prisma-income.repository.js.map