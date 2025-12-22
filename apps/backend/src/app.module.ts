import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthCoreModule } from './feature/auth/core/auth-core.module';
import { AuthRestModule } from './feature/auth/rest/auth-rest.module';
import { UserRestModule } from './feature/user/rest/user-rest.module';
import { TransactionRestModule } from './feature/transaction/rest/transaction-rest.module';
import { ExpenseCategoryRestModule } from './feature/expense-category/rest/expense-category-rest.module';
import { StoreItemCategoryRestModule } from './feature/store-item-category/rest/store-item-category-rest.module';
import { ExpenseItemRestModule } from './feature/expense-item/rest/expense-item-rest.module';
import { ExpenseRestModule } from './feature/expense/rest/expense-rest.module';
import { StoreRestModule } from './feature/store/rest/store-rest.module';
import { IncomeCategoryRestModule } from './feature/income-category/rest/income-category-rest.module';
import { IncomeRestModule } from './feature/income/rest/income-rest.module';
import { AuthGuard } from './feature/auth/rest/guards/auth.guard';

@Module({
  imports: [
    PrismaModule,
    AuthCoreModule,
    AuthRestModule,
    UserRestModule,
    TransactionRestModule,
    ExpenseCategoryRestModule,
    StoreItemCategoryRestModule,
    ExpenseItemRestModule,
    ExpenseRestModule,
    StoreRestModule,
    IncomeCategoryRestModule,
    IncomeRestModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
