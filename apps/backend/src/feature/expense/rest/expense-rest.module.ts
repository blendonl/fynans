import { Module } from '@nestjs/common';
import { ExpenseCoreModule } from '../core/expense-core.module';
import { AuthorizationModule } from '~common/authorization';
import { ExpenseController } from './controllers/expense.controller';

@Module({
  imports: [ExpenseCoreModule, AuthorizationModule],
  controllers: [ExpenseController],
})
export class ExpenseRestModule {}
