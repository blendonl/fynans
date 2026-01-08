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
exports.PrismaFamilyRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../common/prisma/prisma.service");
const family_mapper_1 = require("../mappers/family.mapper");
const family_member_mapper_1 = require("../mappers/family-member.mapper");
const user_mapper_1 = require("../../../../user/core/infrastructure/mappers/user.mapper");
const prismaNamespace_1 = require("../../../../../../prisma/generated/prisma/internal/prismaNamespace");
let PrismaFamilyRepository = class PrismaFamilyRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const family = await this.prisma.family.create({
            data: {
                name: data.name,
                balance: new prismaNamespace_1.Decimal(data.balance || 0),
            },
        });
        return family_mapper_1.FamilyMapper.toDomain(family);
    }
    async findById(id) {
        const family = await this.prisma.family.findUnique({
            where: { id },
        });
        return family ? family_mapper_1.FamilyMapper.toDomain(family) : null;
    }
    async findByIdWithMembers(id) {
        const familyWithMembers = await this.prisma.family.findUnique({
            where: { id },
            include: {
                members: {
                    include: {
                        user: true,
                    },
                    orderBy: { joinedAt: 'asc' },
                },
            },
        });
        if (!familyWithMembers) {
            return null;
        }
        const family = family_mapper_1.FamilyMapper.toDomain(familyWithMembers);
        const membersWithUsers = familyWithMembers.members.map((m) => ({
            member: family_member_mapper_1.FamilyMemberMapper.toDomain(m),
            user: user_mapper_1.UserMapper.toDomain(m.user),
        }));
        return {
            family,
            membersWithUsers,
        };
    }
    async findByUserId(userId) {
        const families = await this.prisma.family.findMany({
            where: {
                members: {
                    some: { userId },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return families.map(family_mapper_1.FamilyMapper.toDomain);
    }
    async update(id, data) {
        const updateData = {};
        if (data.name !== undefined) {
            updateData.name = data.name;
        }
        if (data.balance !== undefined) {
            updateData.balance = new prismaNamespace_1.Decimal(data.balance);
        }
        const family = await this.prisma.family.update({
            where: { id },
            data: updateData,
        });
        return family_mapper_1.FamilyMapper.toDomain(family);
    }
    async delete(id) {
        await this.prisma.family.delete({
            where: { id },
        });
    }
    async addMember(member) {
        const created = await this.prisma.familyMember.create({
            data: {
                familyId: member.familyId,
                userId: member.userId,
                role: member.role,
                balance: new prismaNamespace_1.Decimal(member.balance || 0),
            },
        });
        return family_member_mapper_1.FamilyMemberMapper.toDomain(created);
    }
    async removeMember(familyId, userId) {
        await this.prisma.familyMember.delete({
            where: {
                familyId_userId: { familyId, userId },
            },
        });
    }
    async findMember(familyId, userId) {
        const member = await this.prisma.familyMember.findUnique({
            where: {
                familyId_userId: { familyId, userId },
            },
        });
        return member ? family_member_mapper_1.FamilyMemberMapper.toDomain(member) : null;
    }
    async findMembers(familyId) {
        const members = await this.prisma.familyMember.findMany({
            where: { familyId },
            orderBy: { joinedAt: 'asc' },
        });
        return members.map((m) => family_member_mapper_1.FamilyMemberMapper.toDomain(m));
    }
    async updateMemberRole(familyId, userId, role) {
        const member = await this.prisma.familyMember.update({
            where: {
                familyId_userId: { familyId, userId },
            },
            data: {
                role: role,
            },
        });
        return family_member_mapper_1.FamilyMemberMapper.toDomain(member);
    }
    async updateMemberBalance(familyId, userId, balance) {
        await this.prisma.familyMember.update({
            where: {
                familyId_userId: { familyId, userId },
            },
            data: {
                balance: new prismaNamespace_1.Decimal(balance),
            },
        });
    }
    async updateFamilyBalance(familyId, balance) {
        await this.prisma.family.update({
            where: { id: familyId },
            data: {
                balance: new prismaNamespace_1.Decimal(balance),
            },
        });
    }
    async calculateFamilyBalance(familyId) {
        const incomeSum = await this.prisma.transaction.aggregate({
            where: { familyId, scope: 'FAMILY', type: 'INCOME' },
            _sum: { value: true },
        });
        const expenseSum = await this.prisma.transaction.aggregate({
            where: { familyId, scope: 'FAMILY', type: 'EXPENSE' },
            _sum: { value: true },
        });
        return ((incomeSum._sum.value?.toNumber() || 0) -
            (expenseSum._sum.value?.toNumber() || 0));
    }
};
exports.PrismaFamilyRepository = PrismaFamilyRepository;
exports.PrismaFamilyRepository = PrismaFamilyRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaFamilyRepository);
//# sourceMappingURL=prisma-family.repository.js.map