"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Income = void 0;
class Income {
    props;
    constructor(props) {
        this.validate(props);
        this.props = props;
    }
    validate(props) {
        if (!props.id || props.id.trim() === '') {
            throw new Error('Income ID is required');
        }
        if (!props.transactionId || props.transactionId.trim() === '') {
            throw new Error('Transaction ID is required');
        }
        if (!props.storeId || props.storeId.trim() === '') {
            throw new Error('Store ID is required');
        }
        if (!props.categoryId || props.categoryId.trim() === '') {
            throw new Error('Category ID is required');
        }
        if (!props.createdAt) {
            throw new Error('Created date is required');
        }
        if (!props.updatedAt) {
            throw new Error('Updated date is required');
        }
    }
    get id() {
        return this.props.id;
    }
    get transactionId() {
        return this.props.transactionId;
    }
    get storeId() {
        return this.props.storeId;
    }
    get categoryId() {
        return this.props.categoryId;
    }
    get createdAt() {
        return this.props.createdAt;
    }
    get updatedAt() {
        return this.props.updatedAt;
    }
    toJSON() {
        return {
            id: this.props.id,
            transactionId: this.props.transactionId,
            storeId: this.props.storeId,
            categoryId: this.props.categoryId,
            createdAt: this.props.createdAt,
            updatedAt: this.props.updatedAt,
        };
    }
}
exports.Income = Income;
//# sourceMappingURL=income.entity.js.map