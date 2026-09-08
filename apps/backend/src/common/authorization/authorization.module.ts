import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FAMILY_MEMBERSHIP_REPOSITORY } from './domain/repositories/family-membership.repository.interface';
import { RESOURCE_OWNER_REPOSITORY } from './domain/repositories/resource-owner.repository.interface';
import { PrismaFamilyMembershipRepository } from './infrastructure/repositories/prisma-family-membership.repository';
import { PrismaResourceOwnerRepository } from './infrastructure/repositories/prisma-resource-owner.repository';
import { ResolveOwnerScopeUseCase } from './application/use-cases/resolve-owner-scope.use-case';
import { VerifyResourceAccessUseCase } from './application/use-cases/verify-resource-access.use-case';
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
    ResolveOwnerScopeUseCase,
    ResourceOwnershipGuard,
  ],
  exports: [
    FAMILY_MEMBERSHIP_REPOSITORY,
    VerifyResourceAccessUseCase,
    ResolveOwnerScopeUseCase,
    ResourceOwnershipGuard,
  ],
})
export class AuthorizationModule {}
