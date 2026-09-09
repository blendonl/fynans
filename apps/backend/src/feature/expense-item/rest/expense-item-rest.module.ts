import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../../../common/authorization/authorization.module';
import { ExpenseItemCoreModule } from '../core/expense-item-core.module';
import { ExpenseItemController } from './controllers/expense-item.controller';

@Module({
  imports: [ExpenseItemCoreModule, AuthorizationModule],
  controllers: [ExpenseItemController],
})
export class ExpenseItemRestModule {}
