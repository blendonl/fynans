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
exports.PrismaExpenseRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../common/prisma/prisma.service");
const expense_mapper_1 = require("../mappers/expense.mapper");
const prismaNamespace_1 = require("../../../../../../prisma/generated/prisma/internal/prismaNamespace");
let PrismaExpenseRepository = class PrismaExpenseRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const expense = await this.prisma.expense.create({
            data: {
                id: data.id,
                transactionId: data.transactionId,
                storeId: data.storeId,
                categoryId: data.categoryId,
            },
            include: {
                transaction: {
                    include: {
                        user: true,
                    },
                },
                category: true,
                store: true,
                items: {
                    include: {
                        item: {
                            include: {
                                item: {
                                    include: {
                                        category: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        return expense_mapper_1.ExpenseMapper.toDomain(expense);
    }
    async findById(id) {
        const expense = await this.prisma.expense.findUnique({
            where: { id },
            include: {
                transaction: {
                    include: {
                        user: true,
                    },
                },
                category: true,
                store: true,
                items: {
                    include: {
                        item: {
                            include: {
                                item: {
                                    include: {
                                        category: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        return expense ? expense_mapper_1.ExpenseMapper.toDomain(expense) : null;
    }
    async findByTransactionId(transactionId) {
        const expense = await this.prisma.expense.findUnique({
            where: { transactionId },
            include: {
                transaction: {
                    include: {
                        user: true,
                    },
                },
                category: true,
                store: true,
                items: {
                    include: {
                        item: {
                            include: {
                                item: {
                                    include: {
                                        category: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        return expense ? expense_mapper_1.ExpenseMapper.toDomain(expense) : null;
    }
    async findAll(filters, pagination) {
        const where = this.buildWhereClause(filters);
        const [expenses, total] = await Promise.all([
            this.prisma.expense.findMany({
                where,
                include: {
                    category: true,
                    store: true,
                    transaction: {
                        include: {
                            user: true,
                        },
                    },
                    items: {
                        include: {
                            item: {
                                include: {
                                    item: {
                                        include: {
                                            category: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: pagination?.skip,
                take: pagination?.take,
            }),
            this.prisma.expense.count({ where }),
        ]);
        return {
            data: expenses.map(expense_mapper_1.ExpenseMapper.toDomain),
            total,
        };
    }
    async update(id, data) {
        const updateData = {};
        if (data.categoryId !== undefined) {
            updateData.categoryId = data.categoryId;
        }
        if (data.storeId !== undefined) {
            updateData.storeId = data.storeId;
        }
        const expense = await this.prisma.expense.update({
            where: { id },
            data: updateData,
            include: {
                transaction: {
                    include: {
                        user: true,
                    },
                },
                category: true,
                store: true,
                items: {
                    include: {
                        item: {
                            include: {
                                item: {
                                    include: {
                                        category: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        return expense_mapper_1.ExpenseMapper.toDomain(expense);
    }
    async delete(id) {
        await this.prisma.expense.delete({
            where: { id },
        });
    }
    async verifyOwnership(expenseId, userId) {
        const expense = await this.prisma.expense.findUnique({
            where: { id: expenseId },
            include: { transaction: { select: { userId: true } } },
        });
        return expense?.transaction.userId === userId;
    }
    async getStatistics(userId, filters) {
        const where = this.buildWhereClause(filters);
        const [totalResult, count] = await Promise.all([
            this.prisma.expense.aggregate({
                where,
            }),
            this.prisma.expense.count({ where }),
        ]);
        const allExpenses = await this.prisma.expense.findMany({
            where,
            include: {
                transaction: {
                    select: {
                        value: true,
                    },
                },
            },
        });
        const totalExpenses = allExpenses.reduce((sum, expense) => sum + expense.transaction.value.toNumber(), 0);
        const averageExpense = count > 0 ? totalExpenses / count : 0;
        const categoryMap = new Map();
        allExpenses.forEach((expense) => {
            const current = categoryMap.get(expense.categoryId) || 0;
            categoryMap.set(expense.categoryId, current + expense.transaction.value.toNumber());
        });
        const storeMap = new Map();
        allExpenses.forEach((expense) => {
            const current = storeMap.get(expense.storeId) || 0;
            storeMap.set(expense.storeId, current + expense.transaction.value.toNumber());
        });
        return {
            totalExpenses,
            expenseCount: count,
            averageExpense,
            expensesByCategory: Array.from(categoryMap.entries()).map(([categoryId, total]) => ({ categoryId, total })),
            expensesByStore: Array.from(storeMap.entries()).map(([storeId, total]) => ({ storeId, total })),
        };
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
exports.PrismaExpenseRepository = PrismaExpenseRepository;
exports.PrismaExpenseRepository = PrismaExpenseRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaExpenseRepository);
//# sourceMappingURL=prisma-expense.repository.js.map