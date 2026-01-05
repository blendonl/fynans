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
exports.PrismaTransactionRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../common/prisma/prisma.service");
const transaction_statistics_dto_1 = require("../../application/dto/transaction-statistics.dto");
const transaction_mapper_1 = require("../mappers/transaction.mapper");
const client_1 = require("../../../../../../prisma/generated/prisma/client");
const prismaNamespace_1 = require("../../../../../../prisma/generated/prisma/internal/prismaNamespace");
let PrismaTransactionRepository = class PrismaTransactionRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const transaction = await this.prisma.transaction.create({
            data: {
                userId: data.userId,
                familyId: data.familyId,
                type: data.type,
                scope: data.familyId
                    ? client_1.TransactionScope.FAMILY
                    : client_1.TransactionScope.PERSONAL,
                recordedAt: data.recordedAt || new Date(),
                value: new prismaNamespace_1.Decimal(data.value?.toString() || '0'),
            },
            include: {
                user: true,
                expense: true,
                income: true,
            },
        });
        return transaction_mapper_1.TransactionMapper.toDomain(transaction);
    }
    async findById(id) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id },
            include: {
                user: true,
                expense: true,
                income: true,
            },
        });
        return transaction ? transaction_mapper_1.TransactionMapper.toDomain(transaction) : null;
    }
    async findByUserId(userId, filters, pagination) {
        const where = {
            userId,
            ...this.buildWhereClause(filters),
        };
        const [transactions, total] = await Promise.all([
            this.prisma.transaction.findMany({
                where,
                include: {
                    user: true,
                    expense: true,
                    income: true,
                },
                orderBy: { createdAt: 'desc' },
                skip: pagination?.skip,
                take: pagination?.take,
            }),
            this.prisma.transaction.count({ where }),
        ]);
        return {
            data: transactions.map(transaction_mapper_1.TransactionMapper.toDomain),
            total,
        };
    }
    async findAll(filters, pagination) {
        const where = this.buildWhereClause(filters);
        const [transactions, total] = await Promise.all([
            this.prisma.transaction.findMany({
                where,
                include: {
                    user: true,
                    expense: true,
                    income: true,
                },
                orderBy: { createdAt: 'desc' },
                skip: pagination?.skip,
                take: pagination?.take,
            }),
            this.prisma.transaction.count({ where }),
        ]);
        return {
            data: transactions.map(transaction_mapper_1.TransactionMapper.toDomain),
            total,
        };
    }
    async update(id, data) {
        const updateData = {};
        if (data.type !== undefined) {
            updateData.type = data.type;
        }
        if (data.value !== undefined) {
            updateData.value = new prismaNamespace_1.Decimal(data.value.toString());
        }
        const transaction = await this.prisma.transaction.update({
            where: { id },
            data: updateData,
            include: {
                user: true,
                expense: true,
                income: true,
            },
        });
        return transaction_mapper_1.TransactionMapper.toDomain(transaction);
    }
    async delete(id) {
        await this.prisma.transaction.delete({
            where: { id },
        });
    }
    async getStatistics(userId, filters) {
        const where = {
            ...(userId && { userId }),
            ...this.buildWhereClause(filters),
        };
        const [incomeResult, expenseResult, count] = await Promise.all([
            this.prisma.transaction.aggregate({
                where: {
                    ...where,
                    type: client_1.TransactionType.INCOME,
                },
                _sum: {
                    value: true,
                },
            }),
            this.prisma.transaction.aggregate({
                where: {
                    ...where,
                    type: client_1.TransactionType.EXPENSE,
                },
                _sum: {
                    value: true,
                },
            }),
            this.prisma.transaction.count({ where }),
        ]);
        const totalIncome = incomeResult._sum.value?.toNumber() || 0;
        const totalExpense = expenseResult._sum.value?.toNumber() || 0;
        const balance = totalIncome - totalExpense;
        return new transaction_statistics_dto_1.TransactionStatistics(totalIncome, totalExpense, balance, count);
    }
    buildWhereClause(filters) {
        if (!filters)
            return {};
        const where = {};
        if (filters.userId) {
            where.userId = filters.userId;
        }
        if (filters.familyId) {
            where.familyId = filters.familyId;
        }
        if (filters.scope) {
            where.scope = filters.scope;
        }
        if (filters.type) {
            where.type = filters.type;
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
        if (filters.valueMin !== undefined || filters.valueMax !== undefined) {
            where.value = {};
            if (filters.valueMin !== undefined) {
                where.value.gte = new prismaNamespace_1.Decimal(filters.valueMin);
            }
            if (filters.valueMax !== undefined) {
                where.value.lte = new prismaNamespace_1.Decimal(filters.valueMax);
            }
        }
        return where;
    }
};
exports.PrismaTransactionRepository = PrismaTransactionRepository;
exports.PrismaTransactionRepository = PrismaTransactionRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaTransactionRepository);
//# sourceMappingURL=prisma-transaction.repository.js.map