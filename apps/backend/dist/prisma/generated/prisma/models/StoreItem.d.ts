import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
export type StoreItemModel = runtime.Types.Result.DefaultSelection<Prisma.$StoreItemPayload>;
export type AggregateStoreItem = {
    _count: StoreItemCountAggregateOutputType | null;
    _avg: StoreItemAvgAggregateOutputType | null;
    _sum: StoreItemSumAggregateOutputType | null;
    _min: StoreItemMinAggregateOutputType | null;
    _max: StoreItemMaxAggregateOutputType | null;
};
export type StoreItemAvgAggregateOutputType = {
    price: runtime.Decimal | null;
};
export type StoreItemSumAggregateOutputType = {
    price: runtime.Decimal | null;
};
export type StoreItemMinAggregateOutputType = {
    id: string | null;
    storeId: string | null;
    categoryId: string | null;
    name: string | null;
    price: runtime.Decimal | null;
    isDiscounted: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type StoreItemMaxAggregateOutputType = {
    id: string | null;
    storeId: string | null;
    categoryId: string | null;
    name: string | null;
    price: runtime.Decimal | null;
    isDiscounted: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type StoreItemCountAggregateOutputType = {
    id: number;
    storeId: number;
    categoryId: number;
    name: number;
    price: number;
    isDiscounted: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type StoreItemAvgAggregateInputType = {
    price?: true;
};
export type StoreItemSumAggregateInputType = {
    price?: true;
};
export type StoreItemMinAggregateInputType = {
    id?: true;
    storeId?: true;
    categoryId?: true;
    name?: true;
    price?: true;
    isDiscounted?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type StoreItemMaxAggregateInputType = {
    id?: true;
    storeId?: true;
    categoryId?: true;
    name?: true;
    price?: true;
    isDiscounted?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type StoreItemCountAggregateInputType = {
    id?: true;
    storeId?: true;
    categoryId?: true;
    name?: true;
    price?: true;
    isDiscounted?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type StoreItemAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.StoreItemWhereInput;
    orderBy?: Prisma.StoreItemOrderByWithRelationInput | Prisma.StoreItemOrderByWithRelationInput[];
    cursor?: Prisma.StoreItemWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | StoreItemCountAggregateInputType;
    _avg?: StoreItemAvgAggregateInputType;
    _sum?: StoreItemSumAggregateInputType;
    _min?: StoreItemMinAggregateInputType;
    _max?: StoreItemMaxAggregateInputType;
};
export type GetStoreItemAggregateType<T extends StoreItemAggregateArgs> = {
    [P in keyof T & keyof AggregateStoreItem]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateStoreItem[P]> : Prisma.GetScalarType<T[P], AggregateStoreItem[P]>;
};
export type StoreItemGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.StoreItemWhereInput;
    orderBy?: Prisma.StoreItemOrderByWithAggregationInput | Prisma.StoreItemOrderByWithAggregationInput[];
    by: Prisma.StoreItemScalarFieldEnum[] | Prisma.StoreItemScalarFieldEnum;
    having?: Prisma.StoreItemScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: StoreItemCountAggregateInputType | true;
    _avg?: StoreItemAvgAggregateInputType;
    _sum?: StoreItemSumAggregateInputType;
    _min?: StoreItemMinAggregateInputType;
    _max?: StoreItemMaxAggregateInputType;
};
export type StoreItemGroupByOutputType = {
    id: string;
    storeId: string;
    categoryId: string;
    name: string;
    price: runtime.Decimal;
    isDiscounted: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count: StoreItemCountAggregateOutputType | null;
    _avg: StoreItemAvgAggregateOutputType | null;
    _sum: StoreItemSumAggregateOutputType | null;
    _min: StoreItemMinAggregateOutputType | null;
    _max: StoreItemMaxAggregateOutputType | null;
};
type GetStoreItemGroupByPayload<T extends StoreItemGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<StoreItemGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof StoreItemGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], StoreItemGroupByOutputType[P]> : Prisma.GetScalarType<T[P], StoreItemGroupByOutputType[P]>;
}>>;
export type StoreItemWhereInput = {
    AND?: Prisma.StoreItemWhereInput | Prisma.StoreItemWhereInput[];
    OR?: Prisma.StoreItemWhereInput[];
    NOT?: Prisma.StoreItemWhereInput | Prisma.StoreItemWhereInput[];
    id?: Prisma.StringFilter<"StoreItem"> | string;
    storeId?: Prisma.StringFilter<"StoreItem"> | string;
    categoryId?: Prisma.StringFilter<"StoreItem"> | string;
    name?: Prisma.StringFilter<"StoreItem"> | string;
    price?: Prisma.DecimalFilter<"StoreItem"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isDiscounted?: Prisma.BoolFilter<"StoreItem"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"StoreItem"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"StoreItem"> | Date | string;
    store?: Prisma.XOR<Prisma.StoreScalarRelationFilter, Prisma.StoreWhereInput>;
    discounts?: Prisma.StoreItemDiscountListRelationFilter;
    expenses?: Prisma.ExpenseItemListRelationFilter;
    category?: Prisma.XOR<Prisma.StoreItemCategoryScalarRelationFilter, Prisma.StoreItemCategoryWhereInput>;
};
export type StoreItemOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    storeId?: Prisma.SortOrder;
    categoryId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    price?: Prisma.SortOrder;
    isDiscounted?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    store?: Prisma.StoreOrderByWithRelationInput;
    discounts?: Prisma.StoreItemDiscountOrderByRelationAggregateInput;
    expenses?: Prisma.ExpenseItemOrderByRelationAggregateInput;
    category?: Prisma.StoreItemCategoryOrderByWithRelationInput;
};
export type StoreItemWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.StoreItemWhereInput | Prisma.StoreItemWhereInput[];
    OR?: Prisma.StoreItemWhereInput[];
    NOT?: Prisma.StoreItemWhereInput | Prisma.StoreItemWhereInput[];
    storeId?: Prisma.StringFilter<"StoreItem"> | string;
    categoryId?: Prisma.StringFilter<"StoreItem"> | string;
    name?: Prisma.StringFilter<"StoreItem"> | string;
    price?: Prisma.DecimalFilter<"StoreItem"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isDiscounted?: Prisma.BoolFilter<"StoreItem"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"StoreItem"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"StoreItem"> | Date | string;
    store?: Prisma.XOR<Prisma.StoreScalarRelationFilter, Prisma.StoreWhereInput>;
    discounts?: Prisma.StoreItemDiscountListRelationFilter;
    expenses?: Prisma.ExpenseItemListRelationFilter;
    category?: Prisma.XOR<Prisma.StoreItemCategoryScalarRelationFilter, Prisma.StoreItemCategoryWhereInput>;
}, "id">;
export type StoreItemOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    storeId?: Prisma.SortOrder;
    categoryId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    price?: Prisma.SortOrder;
    isDiscounted?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.StoreItemCountOrderByAggregateInput;
    _avg?: Prisma.StoreItemAvgOrderByAggregateInput;
    _max?: Prisma.StoreItemMaxOrderByAggregateInput;
    _min?: Prisma.StoreItemMinOrderByAggregateInput;
    _sum?: Prisma.StoreItemSumOrderByAggregateInput;
};
export type StoreItemScalarWhereWithAggregatesInput = {
    AND?: Prisma.StoreItemScalarWhereWithAggregatesInput | Prisma.StoreItemScalarWhereWithAggregatesInput[];
    OR?: Prisma.StoreItemScalarWhereWithAggregatesInput[];
    NOT?: Prisma.StoreItemScalarWhereWithAggregatesInput | Prisma.StoreItemScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"StoreItem"> | string;
    storeId?: Prisma.StringWithAggregatesFilter<"StoreItem"> | string;
    categoryId?: Prisma.StringWithAggregatesFilter<"StoreItem"> | string;
    name?: Prisma.StringWithAggregatesFilter<"StoreItem"> | string;
    price?: Prisma.DecimalWithAggregatesFilter<"StoreItem"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isDiscounted?: Prisma.BoolWithAggregatesFilter<"StoreItem"> | boolean;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"StoreItem"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"StoreItem"> | Date | string;
};
export type StoreItemCreateInput = {
    id?: string;
    name: string;
    price: runtime.Decimal | runtime.DecimalJsLike | number | string;
    isDiscounted: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    store: Prisma.StoreCreateNestedOneWithoutItemsInput;
    discounts?: Prisma.StoreItemDiscountCreateNestedManyWithoutStoreItemInput;
    expenses?: Prisma.ExpenseItemCreateNestedManyWithoutItemInput;
    category: Prisma.StoreItemCategoryCreateNestedOneWithoutItemsInput;
};
export type StoreItemUncheckedCreateInput = {
    id?: string;
    storeId: string;
    categoryId: string;
    name: string;
    price: runtime.Decimal | runtime.DecimalJsLike | number | string;
    isDiscounted: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    discounts?: Prisma.StoreItemDiscountUncheckedCreateNestedManyWithoutStoreItemInput;
    expenses?: Prisma.ExpenseItemUncheckedCreateNestedManyWithoutItemInput;
};
export type StoreItemUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    price?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isDiscounted?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    store?: Prisma.StoreUpdateOneRequiredWithoutItemsNestedInput;
    discounts?: Prisma.StoreItemDiscountUpdateManyWithoutStoreItemNestedInput;
    expenses?: Prisma.ExpenseItemUpdateManyWithoutItemNestedInput;
    category?: Prisma.StoreItemCategoryUpdateOneRequiredWithoutItemsNestedInput;
};
export type StoreItemUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    storeId?: Prisma.StringFieldUpdateOperationsInput | string;
    categoryId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    price?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isDiscounted?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    discounts?: Prisma.StoreItemDiscountUncheckedUpdateManyWithoutStoreItemNestedInput;
    expenses?: Prisma.ExpenseItemUncheckedUpdateManyWithoutItemNestedInput;
};
export type StoreItemCreateManyInput = {
    id?: string;
    storeId: string;
    categoryId: string;
    name: string;
    price: runtime.Decimal | runtime.DecimalJsLike | number | string;
    isDiscounted: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type StoreItemUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    price?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isDiscounted?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type StoreItemUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    storeId?: Prisma.StringFieldUpdateOperationsInput | string;
    categoryId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    price?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isDiscounted?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type StoreItemScalarRelationFilter = {
    is?: Prisma.StoreItemWhereInput;
    isNot?: Prisma.StoreItemWhereInput;
};
export type StoreItemListRelationFilter = {
    every?: Prisma.StoreItemWhereInput;
    some?: Prisma.StoreItemWhereInput;
    none?: Prisma.StoreItemWhereInput;
};
export type StoreItemOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type StoreItemCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    storeId?: Prisma.SortOrder;
    categoryId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    price?: Prisma.SortOrder;
    isDiscounted?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type StoreItemAvgOrderByAggregateInput = {
    price?: Prisma.SortOrder;
};
export type StoreItemMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    storeId?: Prisma.SortOrder;
    categoryId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    price?: Prisma.SortOrder;
    isDiscounted?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type StoreItemMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    storeId?: Prisma.SortOrder;
    categoryId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    price?: Prisma.SortOrder;
    isDiscounted?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type StoreItemSumOrderByAggregateInput = {
    price?: Prisma.SortOrder;
};
export type StoreItemCreateNestedOneWithoutExpensesInput = {
    create?: Prisma.XOR<Prisma.StoreItemCreateWithoutExpensesInput, Prisma.StoreItemUncheckedCreateWithoutExpensesInput>;
    connectOrCreate?: Prisma.StoreItemCreateOrConnectWithoutExpensesInput;
    connect?: Prisma.StoreItemWhereUniqueInput;
};
export type StoreItemUpdateOneRequiredWithoutExpensesNestedInput = {
    create?: Prisma.XOR<Prisma.StoreItemCreateWithoutExpensesInput, Prisma.StoreItemUncheckedCreateWithoutExpensesInput>;
    connectOrCreate?: Prisma.StoreItemCreateOrConnectWithoutExpensesInput;
    upsert?: Prisma.StoreItemUpsertWithoutExpensesInput;
    connect?: Prisma.StoreItemWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.StoreItemUpdateToOneWithWhereWithoutExpensesInput, Prisma.StoreItemUpdateWithoutExpensesInput>, Prisma.StoreItemUncheckedUpdateWithoutExpensesInput>;
};
export type StoreItemCreateNestedManyWithoutStoreInput = {
    create?: Prisma.XOR<Prisma.StoreItemCreateWithoutStoreInput, Prisma.StoreItemUncheckedCreateWithoutStoreInput> | Prisma.StoreItemCreateWithoutStoreInput[] | Prisma.StoreItemUncheckedCreateWithoutStoreInput[];
    connectOrCreate?: Prisma.StoreItemCreateOrConnectWithoutStoreInput | Prisma.StoreItemCreateOrConnectWithoutStoreInput[];
    createMany?: Prisma.StoreItemCreateManyStoreInputEnvelope;
    connect?: Prisma.StoreItemWhereUniqueInput | Prisma.StoreItemWhereUniqueInput[];
};
export type StoreItemUncheckedCreateNestedManyWithoutStoreInput = {
    create?: Prisma.XOR<Prisma.StoreItemCreateWithoutStoreInput, Prisma.StoreItemUncheckedCreateWithoutStoreInput> | Prisma.StoreItemCreateWithoutStoreInput[] | Prisma.StoreItemUncheckedCreateWithoutStoreInput[];
    connectOrCreate?: Prisma.StoreItemCreateOrConnectWithoutStoreInput | Prisma.StoreItemCreateOrConnectWithoutStoreInput[];
    createMany?: Prisma.StoreItemCreateManyStoreInputEnvelope;
    connect?: Prisma.StoreItemWhereUniqueInput | Prisma.StoreItemWhereUniqueInput[];
};
export type StoreItemUpdateManyWithoutStoreNestedInput = {
    create?: Prisma.XOR<Prisma.StoreItemCreateWithoutStoreInput, Prisma.StoreItemUncheckedCreateWithoutStoreInput> | Prisma.StoreItemCreateWithoutStoreInput[] | Prisma.StoreItemUncheckedCreateWithoutStoreInput[];
    connectOrCreate?: Prisma.StoreItemCreateOrConnectWithoutStoreInput | Prisma.StoreItemCreateOrConnectWithoutStoreInput[];
    upsert?: Prisma.StoreItemUpsertWithWhereUniqueWithoutStoreInput | Prisma.StoreItemUpsertWithWhereUniqueWithoutStoreInput[];
    createMany?: Prisma.StoreItemCreateManyStoreInputEnvelope;
    set?: Prisma.StoreItemWhereUniqueInput | Prisma.StoreItemWhereUniqueInput[];
    disconnect?: Prisma.StoreItemWhereUniqueInput | Prisma.StoreItemWhereUniqueInput[];
    delete?: Prisma.StoreItemWhereUniqueInput | Prisma.StoreItemWhereUniqueInput[];
    connect?: Prisma.StoreItemWhereUniqueInput | Prisma.StoreItemWhereUniqueInput[];
    update?: Prisma.StoreItemUpdateWithWhereUniqueWithoutStoreInput | Prisma.StoreItemUpdateWithWhereUniqueWithoutStoreInput[];
    updateMany?: Prisma.StoreItemUpdateManyWithWhereWithoutStoreInput | Prisma.StoreItemUpdateManyWithWhereWithoutStoreInput[];
    deleteMany?: Prisma.StoreItemScalarWhereInput | Prisma.StoreItemScalarWhereInput[];
};
export type StoreItemUncheckedUpdateManyWithoutStoreNestedInput = {
    create?: Prisma.XOR<Prisma.StoreItemCreateWithoutStoreInput, Prisma.StoreItemUncheckedCreateWithoutStoreInput> | Prisma.StoreItemCreateWithoutStoreInput[] | Prisma.StoreItemUncheckedCreateWithoutStoreInput[];
    connectOrCreate?: Prisma.StoreItemCreateOrConnectWithoutStoreInput | Prisma.StoreItemCreateOrConnectWithoutStoreInput[];
    upsert?: Prisma.StoreItemUpsertWithWhereUniqueWithoutStoreInput | Prisma.StoreItemUpsertWithWhereUniqueWithoutStoreInput[];
    createMany?: Prisma.StoreItemCreateManyStoreInputEnvelope;
    set?: Prisma.StoreItemWhereUniqueInput | Prisma.StoreItemWhereUniqueInput[];
    disconnect?: Prisma.StoreItemWhereUniqueInput | Prisma.StoreItemWhereUniqueInput[];
    delete?: Prisma.StoreItemWhereUniqueInput | Prisma.StoreItemWhereUniqueInput[];
    connect?: Prisma.StoreItemWhereUniqueInput | Prisma.StoreItemWhereUniqueInput[];
    update?: Prisma.StoreItemUpdateWithWhereUniqueWithoutStoreInput | Prisma.StoreItemUpdateWithWhereUniqueWithoutStoreInput[];
    updateMany?: Prisma.StoreItemUpdateManyWithWhereWithoutStoreInput | Prisma.StoreItemUpdateManyWithWhereWithoutStoreInput[];
    deleteMany?: Prisma.StoreItemScalarWhereInput | Prisma.StoreItemScalarWhereInput[];
};
export type StoreItemCreateNestedOneWithoutDiscountsInput = {
    create?: Prisma.XOR<Prisma.StoreItemCreateWithoutDiscountsInput, Prisma.StoreItemUncheckedCreateWithoutDiscountsInput>;
    connectOrCreate?: Prisma.StoreItemCreateOrConnectWithoutDiscountsInput;
    connect?: Prisma.StoreItemWhereUniqueInput;
};
export type StoreItemUpdateOneRequiredWithoutDiscountsNestedInput = {
    create?: Prisma.XOR<Prisma.StoreItemCreateWithoutDiscountsInput, Prisma.StoreItemUncheckedCreateWithoutDiscountsInput>;
    connectOrCreate?: Prisma.StoreItemCreateOrConnectWithoutDiscountsInput;
    upsert?: Prisma.StoreItemUpsertWithoutDiscountsInput;
    connect?: Prisma.StoreItemWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.StoreItemUpdateToOneWithWhereWithoutDiscountsInput, Prisma.StoreItemUpdateWithoutDiscountsInput>, Prisma.StoreItemUncheckedUpdateWithoutDiscountsInput>;
};
export type StoreItemCreateNestedManyWithoutCategoryInput = {
    create?: Prisma.XOR<Prisma.StoreItemCreateWithoutCategoryInput, Prisma.StoreItemUncheckedCreateWithoutCategoryInput> | Prisma.StoreItemCreateWithoutCategoryInput[] | Prisma.StoreItemUncheckedCreateWithoutCategoryInput[];
    connectOrCreate?: Prisma.StoreItemCreateOrConnectWithoutCategoryInput | Prisma.StoreItemCreateOrConnectWithoutCategoryInput[];
    createMany?: Prisma.StoreItemCreateManyCategoryInputEnvelope;
    connect?: Prisma.StoreItemWhereUniqueInput | Prisma.StoreItemWhereUniqueInput[];
};
export type StoreItemUncheckedCreateNestedManyWithoutCategoryInput = {
    create?: Prisma.XOR<Prisma.StoreItemCreateWithoutCategoryInput, Prisma.StoreItemUncheckedCreateWithoutCategoryInput> | Prisma.StoreItemCreateWithoutCategoryInput[] | Prisma.StoreItemUncheckedCreateWithoutCategoryInput[];
    connectOrCreate?: Prisma.StoreItemCreateOrConnectWithoutCategoryInput | Prisma.StoreItemCreateOrConnectWithoutCategoryInput[];
    createMany?: Prisma.StoreItemCreateManyCategoryInputEnvelope;
    connect?: Prisma.StoreItemWhereUniqueInput | Prisma.StoreItemWhereUniqueInput[];
};
export type StoreItemUpdateManyWithoutCategoryNestedInput = {
    create?: Prisma.XOR<Prisma.StoreItemCreateWithoutCategoryInput, Prisma.StoreItemUncheckedCreateWithoutCategoryInput> | Prisma.StoreItemCreateWithoutCategoryInput[] | Prisma.StoreItemUncheckedCreateWithoutCategoryInput[];
    connectOrCreate?: Prisma.StoreItemCreateOrConnectWithoutCategoryInput | Prisma.StoreItemCreateOrConnectWithoutCategoryInput[];
    upsert?: Prisma.StoreItemUpsertWithWhereUniqueWithoutCategoryInput | Prisma.StoreItemUpsertWithWhereUniqueWithoutCategoryInput[];
    createMany?: Prisma.StoreItemCreateManyCategoryInputEnvelope;
    set?: Prisma.StoreItemWhereUniqueInput | Prisma.StoreItemWhereUniqueInput[];
    disconnect?: Prisma.StoreItemWhereUniqueInput | Prisma.StoreItemWhereUniqueInput[];
    delete?: Prisma.StoreItemWhereUniqueInput | Prisma.StoreItemWhereUniqueInput[];
    connect?: Prisma.StoreItemWhereUniqueInput | Prisma.StoreItemWhereUniqueInput[];
    update?: Prisma.StoreItemUpdateWithWhereUniqueWithoutCategoryInput | Prisma.StoreItemUpdateWithWhereUniqueWithoutCategoryInput[];
    updateMany?: Prisma.StoreItemUpdateManyWithWhereWithoutCategoryInput | Prisma.StoreItemUpdateManyWithWhereWithoutCategoryInput[];
    deleteMany?: Prisma.StoreItemScalarWhereInput | Prisma.StoreItemScalarWhereInput[];
};
export type StoreItemUncheckedUpdateManyWithoutCategoryNestedInput = {
    create?: Prisma.XOR<Prisma.StoreItemCreateWithoutCategoryInput, Prisma.StoreItemUncheckedCreateWithoutCategoryInput> | Prisma.StoreItemCreateWithoutCategoryInput[] | Prisma.StoreItemUncheckedCreateWithoutCategoryInput[];
    connectOrCreate?: Prisma.StoreItemCreateOrConnectWithoutCategoryInput | Prisma.StoreItemCreateOrConnectWithoutCategoryInput[];
    upsert?: Prisma.StoreItemUpsertWithWhereUniqueWithoutCategoryInput | Prisma.StoreItemUpsertWithWhereUniqueWithoutCategoryInput[];
    createMany?: Prisma.StoreItemCreateManyCategoryInputEnvelope;
    set?: Prisma.StoreItemWhereUniqueInput | Prisma.StoreItemWhereUniqueInput[];
    disconnect?: Prisma.StoreItemWhereUniqueInput | Prisma.StoreItemWhereUniqueInput[];
    delete?: Prisma.StoreItemWhereUniqueInput | Prisma.StoreItemWhereUniqueInput[];
    connect?: Prisma.StoreItemWhereUniqueInput | Prisma.StoreItemWhereUniqueInput[];
    update?: Prisma.StoreItemUpdateWithWhereUniqueWithoutCategoryInput | Prisma.StoreItemUpdateWithWhereUniqueWithoutCategoryInput[];
    updateMany?: Prisma.StoreItemUpdateManyWithWhereWithoutCategoryInput | Prisma.StoreItemUpdateManyWithWhereWithoutCategoryInput[];
    deleteMany?: Prisma.StoreItemScalarWhereInput | Prisma.StoreItemScalarWhereInput[];
};
export type StoreItemCreateWithoutExpensesInput = {
    id?: string;
    name: string;
    price: runtime.Decimal | runtime.DecimalJsLike | number | string;
    isDiscounted: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    store: Prisma.StoreCreateNestedOneWithoutItemsInput;
    discounts?: Prisma.StoreItemDiscountCreateNestedManyWithoutStoreItemInput;
    category: Prisma.StoreItemCategoryCreateNestedOneWithoutItemsInput;
};
export type StoreItemUncheckedCreateWithoutExpensesInput = {
    id?: string;
    storeId: string;
    categoryId: string;
    name: string;
    price: runtime.Decimal | runtime.DecimalJsLike | number | string;
    isDiscounted: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    discounts?: Prisma.StoreItemDiscountUncheckedCreateNestedManyWithoutStoreItemInput;
};
export type StoreItemCreateOrConnectWithoutExpensesInput = {
    where: Prisma.StoreItemWhereUniqueInput;
    create: Prisma.XOR<Prisma.StoreItemCreateWithoutExpensesInput, Prisma.StoreItemUncheckedCreateWithoutExpensesInput>;
};
export type StoreItemUpsertWithoutExpensesInput = {
    update: Prisma.XOR<Prisma.StoreItemUpdateWithoutExpensesInput, Prisma.StoreItemUncheckedUpdateWithoutExpensesInput>;
    create: Prisma.XOR<Prisma.StoreItemCreateWithoutExpensesInput, Prisma.StoreItemUncheckedCreateWithoutExpensesInput>;
    where?: Prisma.StoreItemWhereInput;
};
export type StoreItemUpdateToOneWithWhereWithoutExpensesInput = {
    where?: Prisma.StoreItemWhereInput;
    data: Prisma.XOR<Prisma.StoreItemUpdateWithoutExpensesInput, Prisma.StoreItemUncheckedUpdateWithoutExpensesInput>;
};
export type StoreItemUpdateWithoutExpensesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    price?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isDiscounted?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    store?: Prisma.StoreUpdateOneRequiredWithoutItemsNestedInput;
    discounts?: Prisma.StoreItemDiscountUpdateManyWithoutStoreItemNestedInput;
    category?: Prisma.StoreItemCategoryUpdateOneRequiredWithoutItemsNestedInput;
};
export type StoreItemUncheckedUpdateWithoutExpensesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    storeId?: Prisma.StringFieldUpdateOperationsInput | string;
    categoryId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    price?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isDiscounted?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    discounts?: Prisma.StoreItemDiscountUncheckedUpdateManyWithoutStoreItemNestedInput;
};
export type StoreItemCreateWithoutStoreInput = {
    id?: string;
    name: string;
    price: runtime.Decimal | runtime.DecimalJsLike | number | string;
    isDiscounted: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    discounts?: Prisma.StoreItemDiscountCreateNestedManyWithoutStoreItemInput;
    expenses?: Prisma.ExpenseItemCreateNestedManyWithoutItemInput;
    category: Prisma.StoreItemCategoryCreateNestedOneWithoutItemsInput;
};
export type StoreItemUncheckedCreateWithoutStoreInput = {
    id?: string;
    categoryId: string;
    name: string;
    price: runtime.Decimal | runtime.DecimalJsLike | number | string;
    isDiscounted: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    discounts?: Prisma.StoreItemDiscountUncheckedCreateNestedManyWithoutStoreItemInput;
    expenses?: Prisma.ExpenseItemUncheckedCreateNestedManyWithoutItemInput;
};
export type StoreItemCreateOrConnectWithoutStoreInput = {
    where: Prisma.StoreItemWhereUniqueInput;
    create: Prisma.XOR<Prisma.StoreItemCreateWithoutStoreInput, Prisma.StoreItemUncheckedCreateWithoutStoreInput>;
};
export type StoreItemCreateManyStoreInputEnvelope = {
    data: Prisma.StoreItemCreateManyStoreInput | Prisma.StoreItemCreateManyStoreInput[];
    skipDuplicates?: boolean;
};
export type StoreItemUpsertWithWhereUniqueWithoutStoreInput = {
    where: Prisma.StoreItemWhereUniqueInput;
    update: Prisma.XOR<Prisma.StoreItemUpdateWithoutStoreInput, Prisma.StoreItemUncheckedUpdateWithoutStoreInput>;
    create: Prisma.XOR<Prisma.StoreItemCreateWithoutStoreInput, Prisma.StoreItemUncheckedCreateWithoutStoreInput>;
};
export type StoreItemUpdateWithWhereUniqueWithoutStoreInput = {
    where: Prisma.StoreItemWhereUniqueInput;
    data: Prisma.XOR<Prisma.StoreItemUpdateWithoutStoreInput, Prisma.StoreItemUncheckedUpdateWithoutStoreInput>;
};
export type StoreItemUpdateManyWithWhereWithoutStoreInput = {
    where: Prisma.StoreItemScalarWhereInput;
    data: Prisma.XOR<Prisma.StoreItemUpdateManyMutationInput, Prisma.StoreItemUncheckedUpdateManyWithoutStoreInput>;
};
export type StoreItemScalarWhereInput = {
    AND?: Prisma.StoreItemScalarWhereInput | Prisma.StoreItemScalarWhereInput[];
    OR?: Prisma.StoreItemScalarWhereInput[];
    NOT?: Prisma.StoreItemScalarWhereInput | Prisma.StoreItemScalarWhereInput[];
    id?: Prisma.StringFilter<"StoreItem"> | string;
    storeId?: Prisma.StringFilter<"StoreItem"> | string;
    categoryId?: Prisma.StringFilter<"StoreItem"> | string;
    name?: Prisma.StringFilter<"StoreItem"> | string;
    price?: Prisma.DecimalFilter<"StoreItem"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isDiscounted?: Prisma.BoolFilter<"StoreItem"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"StoreItem"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"StoreItem"> | Date | string;
};
export type StoreItemCreateWithoutDiscountsInput = {
    id?: string;
    name: string;
    price: runtime.Decimal | runtime.DecimalJsLike | number | string;
    isDiscounted: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    store: Prisma.StoreCreateNestedOneWithoutItemsInput;
    expenses?: Prisma.ExpenseItemCreateNestedManyWithoutItemInput;
    category: Prisma.StoreItemCategoryCreateNestedOneWithoutItemsInput;
};
export type StoreItemUncheckedCreateWithoutDiscountsInput = {
    id?: string;
    storeId: string;
    categoryId: string;
    name: string;
    price: runtime.Decimal | runtime.DecimalJsLike | number | string;
    isDiscounted: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    expenses?: Prisma.ExpenseItemUncheckedCreateNestedManyWithoutItemInput;
};
export type StoreItemCreateOrConnectWithoutDiscountsInput = {
    where: Prisma.StoreItemWhereUniqueInput;
    create: Prisma.XOR<Prisma.StoreItemCreateWithoutDiscountsInput, Prisma.StoreItemUncheckedCreateWithoutDiscountsInput>;
};
export type StoreItemUpsertWithoutDiscountsInput = {
    update: Prisma.XOR<Prisma.StoreItemUpdateWithoutDiscountsInput, Prisma.StoreItemUncheckedUpdateWithoutDiscountsInput>;
    create: Prisma.XOR<Prisma.StoreItemCreateWithoutDiscountsInput, Prisma.StoreItemUncheckedCreateWithoutDiscountsInput>;
    where?: Prisma.StoreItemWhereInput;
};
export type StoreItemUpdateToOneWithWhereWithoutDiscountsInput = {
    where?: Prisma.StoreItemWhereInput;
    data: Prisma.XOR<Prisma.StoreItemUpdateWithoutDiscountsInput, Prisma.StoreItemUncheckedUpdateWithoutDiscountsInput>;
};
export type StoreItemUpdateWithoutDiscountsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    price?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isDiscounted?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    store?: Prisma.StoreUpdateOneRequiredWithoutItemsNestedInput;
    expenses?: Prisma.ExpenseItemUpdateManyWithoutItemNestedInput;
    category?: Prisma.StoreItemCategoryUpdateOneRequiredWithoutItemsNestedInput;
};
export type StoreItemUncheckedUpdateWithoutDiscountsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    storeId?: Prisma.StringFieldUpdateOperationsInput | string;
    categoryId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    price?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isDiscounted?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    expenses?: Prisma.ExpenseItemUncheckedUpdateManyWithoutItemNestedInput;
};
export type StoreItemCreateWithoutCategoryInput = {
    id?: string;
    name: string;
    price: runtime.Decimal | runtime.DecimalJsLike | number | string;
    isDiscounted: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    store: Prisma.StoreCreateNestedOneWithoutItemsInput;
    discounts?: Prisma.StoreItemDiscountCreateNestedManyWithoutStoreItemInput;
    expenses?: Prisma.ExpenseItemCreateNestedManyWithoutItemInput;
};
export type StoreItemUncheckedCreateWithoutCategoryInput = {
    id?: string;
    storeId: string;
    name: string;
    price: runtime.Decimal | runtime.DecimalJsLike | number | string;
    isDiscounted: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    discounts?: Prisma.StoreItemDiscountUncheckedCreateNestedManyWithoutStoreItemInput;
    expenses?: Prisma.ExpenseItemUncheckedCreateNestedManyWithoutItemInput;
};
export type StoreItemCreateOrConnectWithoutCategoryInput = {
    where: Prisma.StoreItemWhereUniqueInput;
    create: Prisma.XOR<Prisma.StoreItemCreateWithoutCategoryInput, Prisma.StoreItemUncheckedCreateWithoutCategoryInput>;
};
export type StoreItemCreateManyCategoryInputEnvelope = {
    data: Prisma.StoreItemCreateManyCategoryInput | Prisma.StoreItemCreateManyCategoryInput[];
    skipDuplicates?: boolean;
};
export type StoreItemUpsertWithWhereUniqueWithoutCategoryInput = {
    where: Prisma.StoreItemWhereUniqueInput;
    update: Prisma.XOR<Prisma.StoreItemUpdateWithoutCategoryInput, Prisma.StoreItemUncheckedUpdateWithoutCategoryInput>;
    create: Prisma.XOR<Prisma.StoreItemCreateWithoutCategoryInput, Prisma.StoreItemUncheckedCreateWithoutCategoryInput>;
};
export type StoreItemUpdateWithWhereUniqueWithoutCategoryInput = {
    where: Prisma.StoreItemWhereUniqueInput;
    data: Prisma.XOR<Prisma.StoreItemUpdateWithoutCategoryInput, Prisma.StoreItemUncheckedUpdateWithoutCategoryInput>;
};
export type StoreItemUpdateManyWithWhereWithoutCategoryInput = {
    where: Prisma.StoreItemScalarWhereInput;
    data: Prisma.XOR<Prisma.StoreItemUpdateManyMutationInput, Prisma.StoreItemUncheckedUpdateManyWithoutCategoryInput>;
};
export type StoreItemCreateManyStoreInput = {
    id?: string;
    categoryId: string;
    name: string;
    price: runtime.Decimal | runtime.DecimalJsLike | number | string;
    isDiscounted: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type StoreItemUpdateWithoutStoreInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    price?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isDiscounted?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    discounts?: Prisma.StoreItemDiscountUpdateManyWithoutStoreItemNestedInput;
    expenses?: Prisma.ExpenseItemUpdateManyWithoutItemNestedInput;
    category?: Prisma.StoreItemCategoryUpdateOneRequiredWithoutItemsNestedInput;
};
export type StoreItemUncheckedUpdateWithoutStoreInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    categoryId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    price?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isDiscounted?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    discounts?: Prisma.StoreItemDiscountUncheckedUpdateManyWithoutStoreItemNestedInput;
    expenses?: Prisma.ExpenseItemUncheckedUpdateManyWithoutItemNestedInput;
};
export type StoreItemUncheckedUpdateManyWithoutStoreInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    categoryId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    price?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isDiscounted?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type StoreItemCreateManyCategoryInput = {
    id?: string;
    storeId: string;
    name: string;
    price: runtime.Decimal | runtime.DecimalJsLike | number | string;
    isDiscounted: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type StoreItemUpdateWithoutCategoryInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    price?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isDiscounted?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    store?: Prisma.StoreUpdateOneRequiredWithoutItemsNestedInput;
    discounts?: Prisma.StoreItemDiscountUpdateManyWithoutStoreItemNestedInput;
    expenses?: Prisma.ExpenseItemUpdateManyWithoutItemNestedInput;
};
export type StoreItemUncheckedUpdateWithoutCategoryInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    storeId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    price?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isDiscounted?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    discounts?: Prisma.StoreItemDiscountUncheckedUpdateManyWithoutStoreItemNestedInput;
    expenses?: Prisma.ExpenseItemUncheckedUpdateManyWithoutItemNestedInput;
};
export type StoreItemUncheckedUpdateManyWithoutCategoryInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    storeId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    price?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    isDiscounted?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type StoreItemCountOutputType = {
    discounts: number;
    expenses: number;
};
export type StoreItemCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    discounts?: boolean | StoreItemCountOutputTypeCountDiscountsArgs;
    expenses?: boolean | StoreItemCountOutputTypeCountExpensesArgs;
};
export type StoreItemCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StoreItemCountOutputTypeSelect<ExtArgs> | null;
};
export type StoreItemCountOutputTypeCountDiscountsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.StoreItemDiscountWhereInput;
};
export type StoreItemCountOutputTypeCountExpensesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ExpenseItemWhereInput;
};
export type StoreItemSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    storeId?: boolean;
    categoryId?: boolean;
    name?: boolean;
    price?: boolean;
    isDiscounted?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    store?: boolean | Prisma.StoreDefaultArgs<ExtArgs>;
    discounts?: boolean | Prisma.StoreItem$discountsArgs<ExtArgs>;
    expenses?: boolean | Prisma.StoreItem$expensesArgs<ExtArgs>;
    category?: boolean | Prisma.StoreItemCategoryDefaultArgs<ExtArgs>;
    _count?: boolean | Prisma.StoreItemCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["storeItem"]>;
export type StoreItemSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    storeId?: boolean;
    categoryId?: boolean;
    name?: boolean;
    price?: boolean;
    isDiscounted?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    store?: boolean | Prisma.StoreDefaultArgs<ExtArgs>;
    category?: boolean | Prisma.StoreItemCategoryDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["storeItem"]>;
export type StoreItemSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    storeId?: boolean;
    categoryId?: boolean;
    name?: boolean;
    price?: boolean;
    isDiscounted?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    store?: boolean | Prisma.StoreDefaultArgs<ExtArgs>;
    category?: boolean | Prisma.StoreItemCategoryDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["storeItem"]>;
export type StoreItemSelectScalar = {
    id?: boolean;
    storeId?: boolean;
    categoryId?: boolean;
    name?: boolean;
    price?: boolean;
    isDiscounted?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type StoreItemOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "storeId" | "categoryId" | "name" | "price" | "isDiscounted" | "createdAt" | "updatedAt", ExtArgs["result"]["storeItem"]>;
export type StoreItemInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    store?: boolean | Prisma.StoreDefaultArgs<ExtArgs>;
    discounts?: boolean | Prisma.StoreItem$discountsArgs<ExtArgs>;
    expenses?: boolean | Prisma.StoreItem$expensesArgs<ExtArgs>;
    category?: boolean | Prisma.StoreItemCategoryDefaultArgs<ExtArgs>;
    _count?: boolean | Prisma.StoreItemCountOutputTypeDefaultArgs<ExtArgs>;
};
export type StoreItemIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    store?: boolean | Prisma.StoreDefaultArgs<ExtArgs>;
    category?: boolean | Prisma.StoreItemCategoryDefaultArgs<ExtArgs>;
};
export type StoreItemIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    store?: boolean | Prisma.StoreDefaultArgs<ExtArgs>;
    category?: boolean | Prisma.StoreItemCategoryDefaultArgs<ExtArgs>;
};
export type $StoreItemPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "StoreItem";
    objects: {
        store: Prisma.$StorePayload<ExtArgs>;
        discounts: Prisma.$StoreItemDiscountPayload<ExtArgs>[];
        expenses: Prisma.$ExpenseItemPayload<ExtArgs>[];
        category: Prisma.$StoreItemCategoryPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        storeId: string;
        categoryId: string;
        name: string;
        price: runtime.Decimal;
        isDiscounted: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["storeItem"]>;
    composites: {};
};
export type StoreItemGetPayload<S extends boolean | null | undefined | StoreItemDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$StoreItemPayload, S>;
export type StoreItemCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<StoreItemFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: StoreItemCountAggregateInputType | true;
};
export interface StoreItemDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['StoreItem'];
        meta: {
            name: 'StoreItem';
        };
    };
    findUnique<T extends StoreItemFindUniqueArgs>(args: Prisma.SelectSubset<T, StoreItemFindUniqueArgs<ExtArgs>>): Prisma.Prisma__StoreItemClient<runtime.Types.Result.GetResult<Prisma.$StoreItemPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends StoreItemFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, StoreItemFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__StoreItemClient<runtime.Types.Result.GetResult<Prisma.$StoreItemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends StoreItemFindFirstArgs>(args?: Prisma.SelectSubset<T, StoreItemFindFirstArgs<ExtArgs>>): Prisma.Prisma__StoreItemClient<runtime.Types.Result.GetResult<Prisma.$StoreItemPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends StoreItemFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, StoreItemFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__StoreItemClient<runtime.Types.Result.GetResult<Prisma.$StoreItemPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends StoreItemFindManyArgs>(args?: Prisma.SelectSubset<T, StoreItemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$StoreItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends StoreItemCreateArgs>(args: Prisma.SelectSubset<T, StoreItemCreateArgs<ExtArgs>>): Prisma.Prisma__StoreItemClient<runtime.Types.Result.GetResult<Prisma.$StoreItemPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends StoreItemCreateManyArgs>(args?: Prisma.SelectSubset<T, StoreItemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends StoreItemCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, StoreItemCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$StoreItemPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends StoreItemDeleteArgs>(args: Prisma.SelectSubset<T, StoreItemDeleteArgs<ExtArgs>>): Prisma.Prisma__StoreItemClient<runtime.Types.Result.GetResult<Prisma.$StoreItemPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends StoreItemUpdateArgs>(args: Prisma.SelectSubset<T, StoreItemUpdateArgs<ExtArgs>>): Prisma.Prisma__StoreItemClient<runtime.Types.Result.GetResult<Prisma.$StoreItemPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends StoreItemDeleteManyArgs>(args?: Prisma.SelectSubset<T, StoreItemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends StoreItemUpdateManyArgs>(args: Prisma.SelectSubset<T, StoreItemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends StoreItemUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, StoreItemUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$StoreItemPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends StoreItemUpsertArgs>(args: Prisma.SelectSubset<T, StoreItemUpsertArgs<ExtArgs>>): Prisma.Prisma__StoreItemClient<runtime.Types.Result.GetResult<Prisma.$StoreItemPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends StoreItemCountArgs>(args?: Prisma.Subset<T, StoreItemCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], StoreItemCountAggregateOutputType> : number>;
    aggregate<T extends StoreItemAggregateArgs>(args: Prisma.Subset<T, StoreItemAggregateArgs>): Prisma.PrismaPromise<GetStoreItemAggregateType<T>>;
    groupBy<T extends StoreItemGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: StoreItemGroupByArgs['orderBy'];
    } : {
        orderBy?: StoreItemGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, StoreItemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStoreItemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: StoreItemFieldRefs;
}
export interface Prisma__StoreItemClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    store<T extends Prisma.StoreDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.StoreDefaultArgs<ExtArgs>>): Prisma.Prisma__StoreClient<runtime.Types.Result.GetResult<Prisma.$StorePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    discounts<T extends Prisma.StoreItem$discountsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.StoreItem$discountsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$StoreItemDiscountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    expenses<T extends Prisma.StoreItem$expensesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.StoreItem$expensesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ExpenseItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    category<T extends Prisma.StoreItemCategoryDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.StoreItemCategoryDefaultArgs<ExtArgs>>): Prisma.Prisma__StoreItemCategoryClient<runtime.Types.Result.GetResult<Prisma.$StoreItemCategoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface StoreItemFieldRefs {
    readonly id: Prisma.FieldRef<"StoreItem", 'String'>;
    readonly storeId: Prisma.FieldRef<"StoreItem", 'String'>;
    readonly categoryId: Prisma.FieldRef<"StoreItem", 'String'>;
    readonly name: Prisma.FieldRef<"StoreItem", 'String'>;
    readonly price: Prisma.FieldRef<"StoreItem", 'Decimal'>;
    readonly isDiscounted: Prisma.FieldRef<"StoreItem", 'Boolean'>;
    readonly createdAt: Prisma.FieldRef<"StoreItem", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"StoreItem", 'DateTime'>;
}
export type StoreItemFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StoreItemSelect<ExtArgs> | null;
    omit?: Prisma.StoreItemOmit<ExtArgs> | null;
    include?: Prisma.StoreItemInclude<ExtArgs> | null;
    where: Prisma.StoreItemWhereUniqueInput;
};
export type StoreItemFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StoreItemSelect<ExtArgs> | null;
    omit?: Prisma.StoreItemOmit<ExtArgs> | null;
    include?: Prisma.StoreItemInclude<ExtArgs> | null;
    where: Prisma.StoreItemWhereUniqueInput;
};
export type StoreItemFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StoreItemSelect<ExtArgs> | null;
    omit?: Prisma.StoreItemOmit<ExtArgs> | null;
    include?: Prisma.StoreItemInclude<ExtArgs> | null;
    where?: Prisma.StoreItemWhereInput;
    orderBy?: Prisma.StoreItemOrderByWithRelationInput | Prisma.StoreItemOrderByWithRelationInput[];
    cursor?: Prisma.StoreItemWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.StoreItemScalarFieldEnum | Prisma.StoreItemScalarFieldEnum[];
};
export type StoreItemFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StoreItemSelect<ExtArgs> | null;
    omit?: Prisma.StoreItemOmit<ExtArgs> | null;
    include?: Prisma.StoreItemInclude<ExtArgs> | null;
    where?: Prisma.StoreItemWhereInput;
    orderBy?: Prisma.StoreItemOrderByWithRelationInput | Prisma.StoreItemOrderByWithRelationInput[];
    cursor?: Prisma.StoreItemWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.StoreItemScalarFieldEnum | Prisma.StoreItemScalarFieldEnum[];
};
export type StoreItemFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StoreItemSelect<ExtArgs> | null;
    omit?: Prisma.StoreItemOmit<ExtArgs> | null;
    include?: Prisma.StoreItemInclude<ExtArgs> | null;
    where?: Prisma.StoreItemWhereInput;
    orderBy?: Prisma.StoreItemOrderByWithRelationInput | Prisma.StoreItemOrderByWithRelationInput[];
    cursor?: Prisma.StoreItemWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.StoreItemScalarFieldEnum | Prisma.StoreItemScalarFieldEnum[];
};
export type StoreItemCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StoreItemSelect<ExtArgs> | null;
    omit?: Prisma.StoreItemOmit<ExtArgs> | null;
    include?: Prisma.StoreItemInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.StoreItemCreateInput, Prisma.StoreItemUncheckedCreateInput>;
};
export type StoreItemCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.StoreItemCreateManyInput | Prisma.StoreItemCreateManyInput[];
    skipDuplicates?: boolean;
};
export type StoreItemCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StoreItemSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.StoreItemOmit<ExtArgs> | null;
    data: Prisma.StoreItemCreateManyInput | Prisma.StoreItemCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.StoreItemIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type StoreItemUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StoreItemSelect<ExtArgs> | null;
    omit?: Prisma.StoreItemOmit<ExtArgs> | null;
    include?: Prisma.StoreItemInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.StoreItemUpdateInput, Prisma.StoreItemUncheckedUpdateInput>;
    where: Prisma.StoreItemWhereUniqueInput;
};
export type StoreItemUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.StoreItemUpdateManyMutationInput, Prisma.StoreItemUncheckedUpdateManyInput>;
    where?: Prisma.StoreItemWhereInput;
    limit?: number;
};
export type StoreItemUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StoreItemSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.StoreItemOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.StoreItemUpdateManyMutationInput, Prisma.StoreItemUncheckedUpdateManyInput>;
    where?: Prisma.StoreItemWhereInput;
    limit?: number;
    include?: Prisma.StoreItemIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type StoreItemUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StoreItemSelect<ExtArgs> | null;
    omit?: Prisma.StoreItemOmit<ExtArgs> | null;
    include?: Prisma.StoreItemInclude<ExtArgs> | null;
    where: Prisma.StoreItemWhereUniqueInput;
    create: Prisma.XOR<Prisma.StoreItemCreateInput, Prisma.StoreItemUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.StoreItemUpdateInput, Prisma.StoreItemUncheckedUpdateInput>;
};
export type StoreItemDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StoreItemSelect<ExtArgs> | null;
    omit?: Prisma.StoreItemOmit<ExtArgs> | null;
    include?: Prisma.StoreItemInclude<ExtArgs> | null;
    where: Prisma.StoreItemWhereUniqueInput;
};
export type StoreItemDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.StoreItemWhereInput;
    limit?: number;
};
export type StoreItem$discountsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StoreItemDiscountSelect<ExtArgs> | null;
    omit?: Prisma.StoreItemDiscountOmit<ExtArgs> | null;
    include?: Prisma.StoreItemDiscountInclude<ExtArgs> | null;
    where?: Prisma.StoreItemDiscountWhereInput;
    orderBy?: Prisma.StoreItemDiscountOrderByWithRelationInput | Prisma.StoreItemDiscountOrderByWithRelationInput[];
    cursor?: Prisma.StoreItemDiscountWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.StoreItemDiscountScalarFieldEnum | Prisma.StoreItemDiscountScalarFieldEnum[];
};
export type StoreItem$expensesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExpenseItemSelect<ExtArgs> | null;
    omit?: Prisma.ExpenseItemOmit<ExtArgs> | null;
    include?: Prisma.ExpenseItemInclude<ExtArgs> | null;
    where?: Prisma.ExpenseItemWhereInput;
    orderBy?: Prisma.ExpenseItemOrderByWithRelationInput | Prisma.ExpenseItemOrderByWithRelationInput[];
    cursor?: Prisma.ExpenseItemWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ExpenseItemScalarFieldEnum | Prisma.ExpenseItemScalarFieldEnum[];
};
export type StoreItemDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StoreItemSelect<ExtArgs> | null;
    omit?: Prisma.StoreItemOmit<ExtArgs> | null;
    include?: Prisma.StoreItemInclude<ExtArgs> | null;
};
export {};
