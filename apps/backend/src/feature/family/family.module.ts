import { Module } from '@nestjs/common';
import { FamilyCoreModule } from './core/family-core.module';
import { FamilyController } from './rest/controllers/family.controller';

@Module({
  imports: [FamilyCoreModule],
  controllers: [FamilyController],
  exports: [FamilyCoreModule],
})
export class FamilyModule {}
