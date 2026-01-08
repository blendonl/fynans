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
exports.PrismaFamilyInvitationRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../common/prisma/prisma.service");
const family_invitation_mapper_1 = require("../mappers/family-invitation.mapper");
let PrismaFamilyInvitationRepository = class PrismaFamilyInvitationRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const invitation = await this.prisma.familyInvitation.create({
            data: {
                familyId: data.familyId,
                inviterId: data.inviterId,
                inviteeEmail: data.inviteeEmail,
                inviteeId: data.inviteeId ?? null,
                status: data.status || 'PENDING',
                expiresAt: data.expiresAt,
            },
        });
        return family_invitation_mapper_1.FamilyInvitationMapper.toDomain(invitation);
    }
    async findById(id) {
        const invitation = await this.prisma.familyInvitation.findUnique({
            where: { id },
        });
        return invitation ? family_invitation_mapper_1.FamilyInvitationMapper.toDomain(invitation) : null;
    }
    async findByFamilyId(familyId) {
        const invitations = await this.prisma.familyInvitation.findMany({
            where: { familyId },
            orderBy: { createdAt: 'desc' },
        });
        return invitations.map((inv) => family_invitation_mapper_1.FamilyInvitationMapper.toDomain(inv));
    }
    async findByInviteeEmail(email) {
        const invitations = await this.prisma.familyInvitation.findMany({
            where: {
                inviteeEmail: email,
                status: 'PENDING',
                expiresAt: {
                    gt: new Date(),
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return invitations.map((inv) => family_invitation_mapper_1.FamilyInvitationMapper.toDomain(inv));
    }
    async findByInviteeId(userId) {
        const invitations = await this.prisma.familyInvitation.findMany({
            where: { inviteeId: userId },
            orderBy: { createdAt: 'desc' },
        });
        return invitations.map((inv) => family_invitation_mapper_1.FamilyInvitationMapper.toDomain(inv));
    }
    async findPendingByEmailAndFamily(email, familyId) {
        const invitation = await this.prisma.familyInvitation.findFirst({
            where: {
                inviteeEmail: email,
                familyId: familyId,
                status: 'PENDING',
                expiresAt: { gt: new Date() },
            },
        });
        return invitation ? family_invitation_mapper_1.FamilyInvitationMapper.toDomain(invitation) : null;
    }
    async update(id, data) {
        const updateData = {};
        if (data.status !== undefined) {
            updateData.status = data.status;
        }
        if (data.inviteeId !== undefined) {
            updateData.inviteeId = data.inviteeId;
        }
        const invitation = await this.prisma.familyInvitation.update({
            where: { id },
            data: updateData,
        });
        return family_invitation_mapper_1.FamilyInvitationMapper.toDomain(invitation);
    }
    async delete(id) {
        await this.prisma.familyInvitation.delete({
            where: { id },
        });
    }
};
exports.PrismaFamilyInvitationRepository = PrismaFamilyInvitationRepository;
exports.PrismaFamilyInvitationRepository = PrismaFamilyInvitationRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaFamilyInvitationRepository);
//# sourceMappingURL=prisma-family-invitation.repository.js.map