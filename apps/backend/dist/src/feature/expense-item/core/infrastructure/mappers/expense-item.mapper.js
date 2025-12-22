"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseItemMapper = void 0;
const expense_item_entity_1 = require("../../domain/entities/expense-item.entity");
class ExpenseItemMapper {
    static toDomain(prismaExpenseItem) {
        return new expense_item_entity_1.ExpenseItem({
            id: prismaExpenseItem.id,
            itemId: prismaExpenseItem.itemId,
            expenseId: prismaExpenseItem.expenseId,
            categoryId: prismaExpenseItem.item.categoryId,
            price: prismaExpenseItem.price,
            discount: prismaExpenseItem.discount,
            createdAt: prismaExpenseItem.createdAt,
            updatedAt: prismaExpenseItem.updatedAt,
        });
    }
    static toPersistence(expenseItem) {
        return {
            id: expenseItem.id,
            itemId: expenseItem.itemId,
            expenseId: expenseItem.expenseId,
            categoryId: expenseItem.categoryId,
            price: expenseItem.price,
            discount: expenseItem.discount,
            createdAt: expenseItem.createdAt,
            updatedAt: expenseItem.updatedAt,
        };
    }
}
exports.ExpenseItemMapper = ExpenseItemMapper;
//# sourceMappingURL=expense-item.mapper.js.map