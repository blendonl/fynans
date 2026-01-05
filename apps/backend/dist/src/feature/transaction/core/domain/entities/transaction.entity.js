"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = exports.TransactionScope = void 0;
const transaction_type_vo_1 = require("../value-objects/transaction-type.vo");
var TransactionScope;
(function (TransactionScope) {
    TransactionScope["PERSONAL"] = "PERSONAL";
    TransactionScope["FAMILY"] = "FAMILY";
})(TransactionScope || (exports.TransactionScope = TransactionScope = {}));
class Transaction {
    props;
    constructor(props) {
        this.validate(props);
        this.props = props;
    }
    validate(props) {
        if (!props.id || props.id.trim() === '') {
            throw new Error('Transaction ID is required');
        }
        if (!props.userId || props.userId.trim() === '') {
            throw new Error('User ID is required');
        }
        if (!props.type) {
            throw new Error('Transaction type is required');
        }
        if (!props.value || props.value.toNumber() <= 0) {
            throw new Error('Transaction value must be positive');
        }
    }
    get id() {
        return this.props.id;
    }
    get userId() {
        return this.props.userId;
    }
    get familyId() {
        return this.props.familyId;
    }
    get scope() {
        return this.props.scope;
    }
    get type() {
        return this.props.type;
    }
    get value() {
        return this.props.value;
    }
    get recordedAt() {
        return this.props.recordedAt;
    }
    get createdAt() {
        return this.props.createdAt;
    }
    get updatedAt() {
        return this.props.updatedAt;
    }
    get user() {
        return this.props.user;
    }
    isExpense() {
        return this.props.type === transaction_type_vo_1.TransactionType.EXPENSE;
    }
    isIncome() {
        return this.props.type === transaction_type_vo_1.TransactionType.INCOME;
    }
    isPersonal() {
        return this.props.scope === TransactionScope.PERSONAL;
    }
    isFamily() {
        return this.props.scope === TransactionScope.FAMILY;
    }
    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            familyId: this.familyId,
            scope: this.scope,
            type: this.type,
            value: this.value.toNumber(),
            recordedAt: this.recordedAt,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            user: this.user,
        };
    }
}
exports.Transaction = Transaction;
//# sourceMappingURL=transaction.entity.js.map