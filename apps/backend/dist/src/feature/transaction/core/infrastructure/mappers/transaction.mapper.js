"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionMapper = void 0;
const transaction_entity_1 = require("../../domain/entities/transaction.entity");
class TransactionMapper {
    static toDomain(prismaTransaction) {
        const user = {
            id: prismaTransaction.user.id,
            firstName: prismaTransaction.user.firstName.length > 0
                ? prismaTransaction.user.firstName
                : prismaTransaction.user.name.split(' ')[0],
            lastName: prismaTransaction.user.lastName.length > 0
                ? prismaTransaction.user.lastName
                : prismaTransaction.user.name.split(' ')[0],
        };
        return new transaction_entity_1.Transaction({
            id: prismaTransaction.id,
            userId: prismaTransaction.userId,
            type: prismaTransaction.type,
            value: prismaTransaction.value,
            familyId: prismaTransaction.familyId ?? undefined,
            scope: prismaTransaction.scope,
            recordedAt: prismaTransaction.recordedAt,
            createdAt: prismaTransaction.createdAt,
            updatedAt: prismaTransaction.updatedAt,
            user,
        });
    }
    static toPersistence(transaction) {
        return {
            id: transaction.id,
            userId: transaction.userId,
            type: transaction.type,
            value: transaction.value,
            familyId: transaction.familyId ?? null,
            scope: transaction.scope,
            recordedAt: transaction.recordedAt,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt,
        };
    }
}
exports.TransactionMapper = TransactionMapper;
//# sourceMappingURL=transaction.mapper.js.map