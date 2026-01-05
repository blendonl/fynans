"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionResponseDto = void 0;
class TransactionResponseDto {
    id;
    userId;
    type;
    value;
    recordedAt;
    createdAt;
    updatedAt;
    user;
    constructor(transaction) {
        this.id = transaction.id;
        this.userId = transaction.userId;
        this.type = transaction.type;
        this.value = transaction.value.toNumber();
        this.recordedAt = transaction.recordedAt;
        this.createdAt = transaction.createdAt;
        this.updatedAt = transaction.updatedAt;
        this.user = transaction.user;
    }
    static fromEntity(transaction) {
        return new TransactionResponseDto(transaction);
    }
    static fromEntities(transactions) {
        return transactions.map((t) => new TransactionResponseDto(t));
    }
}
exports.TransactionResponseDto = TransactionResponseDto;
//# sourceMappingURL=transaction-response.dto.js.map