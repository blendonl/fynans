import { Module } from '@nestjs/common';
import { ExpenseCoreModule } from '../core/expense-core.module';
import { AuthorizationModule } from '~common/authorization';
import { ExpenseController } from './controllers/expense.controller';
import { ExpenseResponseMapper } from './mappers/expense-response.mapper';

@Module({
  imports: [ExpenseCoreModule, AuthorizationModule],
  controllers: [ExpenseController],
  providers: [ExpenseResponseMapper],
})
export class ExpenseRestModule {}
