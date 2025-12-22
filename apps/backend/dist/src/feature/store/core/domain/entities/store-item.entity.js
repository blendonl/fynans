"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreItem = void 0;
class StoreItem {
    props;
    constructor(props) {
        this.validate(props);
        this.props = props;
    }
    validate(props) {
        if (!props.id || props.id.trim() === '') {
            throw new Error('Store item ID is required');
        }
        if (!props.storeId || props.storeId.trim() === '') {
            throw new Error('Store ID is required');
        }
        if (!props.name || props.name.trim() === '') {
            throw new Error('Store item name is required');
        }
        if (!props.price || props.price.toNumber() < 0) {
            throw new Error('Store item price must be non-negative');
        }
        if (!props.createdAt) {
            throw new Error('Created date is required');
        }
        if (!props.updatedAt) {
            throw new Error('Updated date is required');
        }
    }
    get categoryId() {
        return this.props.categoryId;
    }
    get id() {
        return this.props.id;
    }
    get storeId() {
        return this.props.storeId;
    }
    get name() {
        return this.props.name;
    }
    get price() {
        return this.props.price;
    }
    get isDiscounted() {
        return this.props.isDiscounted;
    }
    get createdAt() {
        return this.props.createdAt;
    }
    get updatedAt() {
        return this.props.updatedAt;
    }
    getCurrentPrice() {
        return this.props.price;
    }
    toJSON() {
        return {
            id: this.props.id,
            storeId: this.props.storeId,
            name: this.props.name,
            price: this.props.price.toNumber(),
            isDiscounted: this.props.isDiscounted,
            createdAt: this.props.createdAt,
            updatedAt: this.props.updatedAt,
        };
    }
}
exports.StoreItem = StoreItem;
//# sourceMappingURL=store-item.entity.js.map