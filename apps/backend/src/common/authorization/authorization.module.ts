import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FAMILY_MEMBERSHIP_REPOSITORY } from './domain/repositories/family-membership.repository.interface';
import { RESOURCE_OWNER_REPOSITORY } from './domain/repositories/resource-owner.repository.interface';
import { PrismaFamilyMembershipRepository } from './infrastructure/repositories/prisma-family-membership.repository';
import { PrismaResourceOwnerRepository } from './infrastructure/repositories/prisma-resource-owner.repository';
import { ResolveOwnerScopeUseCase } from './application/use-cases/resolve-owner-scope.use-case';
import { VerifyFamilyAccessUseCase } from './application/use-cases/verify-family-access.use-case';
import { VerifyResourceAccessUseCase } from './application/use-cases/verify-resource-access.use-case';
import { FamilyScopeGuard } from './rest/guards/family-scope.guard';
import { ResourceOwnershipGuard } from './rest/guards/resource-ownership.guard';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: RESOURCE_OWNER_REPOSITORY,
      useClass: PrismaResourceOwnerRepository,
    },
    {
      provide: FAMILY_MEMBERSHIP_REPOSITORY,
      useClass: PrismaFamilyMembershipRepository,
    },
    VerifyResourceAccessUseCase,
    VerifyFamilyAccessUseCase,
    ResolveOwnerScopeUseCase,
    FamilyScopeGuard,
    ResourceOwnershipGuard,
  ],
  exports: [
    FAMILY_MEMBERSHIP_REPOSITORY,
    VerifyResourceAccessUseCase,
    VerifyFamilyAccessUseCase,
    ResolveOwnerScopeUseCase,
    FamilyScopeGuard,
    ResourceOwnershipGuard,
  ],
})
export class AuthorizationModule {}
