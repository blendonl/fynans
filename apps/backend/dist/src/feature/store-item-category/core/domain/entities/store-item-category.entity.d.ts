export interface StoreItemCategoryProps {
    id: string;
    parentId: string | null;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class StoreItemCategory {
    private readonly props;
    constructor(props: StoreItemCategoryProps);
    private validate;
    get id(): string;
    get parentId(): string | null;
    get name(): string;
    get createdAt(): Date;
    get updatedAt(): Date;
    isRoot(): boolean;
    isChildOf(parentId: string): boolean;
    toJSON(): {
        id: string;
        parentId: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    };
}
