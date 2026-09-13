import { Module } from '@nestjs/common';
import { IncomeCoreModule } from '../core/income-core.module';
import { AuthorizationModule } from '~common/authorization';
import { IncomeController } from './controllers/income.controller';

@Module({
  imports: [IncomeCoreModule, AuthorizationModule],
  controllers: [IncomeController],
})
export class IncomeRestModule {}
