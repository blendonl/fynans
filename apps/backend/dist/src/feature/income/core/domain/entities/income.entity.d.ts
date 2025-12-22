export interface IncomeProps {
    id: string;
    transactionId: string;
    storeId: string;
    categoryId: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Income {
    private readonly props;
    constructor(props: IncomeProps);
    private validate;
    get id(): string;
    get transactionId(): string;
    get storeId(): string;
    get categoryId(): string;
    get createdAt(): Date;
    get updatedAt(): Date;
    toJSON(): {
        id: string;
        transactionId: string;
        storeId: string;
        categoryId: string;
        createdAt: Date;
        updatedAt: Date;
    };
}
