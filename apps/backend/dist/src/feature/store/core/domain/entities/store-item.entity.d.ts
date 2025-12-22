import { Decimal } from 'prisma/generated/prisma/internal/prismaNamespace';
export interface StoreItemProps {
    id: string;
    storeId: string;
    name: string;
    price: Decimal;
    isDiscounted: boolean;
    categoryId: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class StoreItem {
    private readonly props;
    constructor(props: StoreItemProps);
    private validate;
    get categoryId(): string;
    get id(): string;
    get storeId(): string;
    get name(): string;
    get price(): Decimal;
    get isDiscounted(): boolean;
    get createdAt(): Date;
    get updatedAt(): Date;
    getCurrentPrice(): Decimal;
    toJSON(): {
        id: string;
        storeId: string;
        name: string;
        price: number;
        isDiscounted: boolean;
        createdAt: Date;
        updatedAt: Date;
    };
}
