import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
export type ExpenseItemModel = runtime.Types.Result.DefaultSelection<Prisma.$ExpenseItemPayload>;
export type AggregateExpenseItem = {
    _count: ExpenseItemCountAggregateOutputType | null;
    _avg: ExpenseItemAvgAggregateOutputType | null;
    _sum: ExpenseItemSumAggregateOutputType | null;
    _min: ExpenseItemMinAggregateOutputType | null;
    _max: ExpenseItemMaxAggregateOutputType | null;
};
export type ExpenseItemAvgAggregateOutputType = {
    price: runtime.Decimal | null;
    discount: runtime.Decimal | null;
};
export type ExpenseItemSumAggregateOutputType = {
    price: runtime.Decimal | null;
    discount: runtime.Decimal | null;
};
export type ExpenseItemMinAggregateOutputType = {
    id: string | null;
    itemId: string | null;
    expenseId: string | null;
    price: runtime.Decimal | null;
    discount: runtime.Decimal | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ExpenseItemMaxAggregateOutputType = {
    id: string | null;
    itemId: string | null;
    expenseId: string | null;
    price: runtime.Decimal | null;
    discount: runtime.Decimal | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ExpenseItemCountAggregateOutputType = {
    id: number;
    itemId: number;
    expenseId: number;
    price: number;
    discount: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type ExpenseItemAvgAggregateInputType = {
    price?: true;
    discount?: true;
};
export type ExpenseItemSumAggregateInputType = {
    price?: true;
    discount?: true;
};
export type ExpenseItemMinAggregateInputType = {
    id?: true;
    itemId?: true;
    expenseId?: true;
    price?: true;
    discount?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ExpenseItemMaxAggregateInputType = {
    id?: true;
    itemId?: true;
    expenseId?: true;
    price?: true;
    discount?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ExpenseItemCountAggregateInputType = {
    id?: true;
    itemId?: true;
    expenseId?: true;
    price?: true;
    discount?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type ExpenseItemAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ExpenseItemWhereInput;
    orderBy?: Prisma.ExpenseItemOrderByWithRelationInput | Prisma.ExpenseItemOrderByWithRelationInput[];
    cursor?: Prisma.ExpenseItemWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ExpenseItemCountAggregateInputType;
    _avg?: ExpenseItemAvgAggregateInputType;
    _sum?: ExpenseItemSumAggregateInputType;
    _min?: ExpenseItemMinAggregateInputType;
    _max?: ExpenseItemMaxAggregateInputType;
};
export type GetExpenseItemAggregateType<T extends ExpenseItemAggregateArgs> = {
    [P in keyof T & keyof AggregateExpenseItem]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateExpenseItem[P]> : Prisma.GetScalarType<T[P], AggregateExpenseItem[P]>;
};
export type ExpenseItemGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ExpenseItemWhereInput;
    orderBy?: Prisma.ExpenseItemOrderByWithAggregationInput | Prisma.ExpenseItemOrderByWithAggregationInput[];
    by: Prisma.ExpenseItemScalarFieldEnum[] | Prisma.ExpenseItemScalarFieldEnum;
    having?: Prisma.ExpenseItemScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ExpenseItemCountAggregateInputType | true;
    _avg?: ExpenseItemAvgAggregateInputType;
    _sum?: ExpenseItemSumAggregateInputType;
    _min?: ExpenseItemMinAggregateInputType;
    _max?: ExpenseItemMaxAggregateInputType;
};
export type ExpenseItemGroupByOutputType = {
    id: string;
    itemId: string;
    expenseId: string;
    price: runtime.Decimal;
    discount: runtime.Decimal;
    createdAt: Date;
    updatedAt: Date;
    _count: ExpenseItemCountAggregateOutputType | null;
    _avg: ExpenseItemAvgAggregateOutputType | null;
    _sum: ExpenseItemSumAggregateOutputType | null;
    _min: ExpenseItemMinAggregateOutputType | null;
    _max: ExpenseItemMaxAggregateOutputType | null;
};
type GetExpenseItemGroupByPayload<T extends ExpenseItemGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ExpenseItemGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ExpenseItemGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ExpenseItemGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ExpenseItemGroupByOutputType[P]>;
}>>;
export type ExpenseItemWhereInput = {
    AND?: Prisma.ExpenseItemWhereInput | Prisma.ExpenseItemWhereInput[];
    OR?: Prisma.ExpenseItemWhereInput[];
    NOT?: Prisma.ExpenseItemWhereInput | Prisma.ExpenseItemWhereInput[];
    id?: Prisma.StringFilter<"ExpenseItem"> | string;
    itemId?: Prisma.StringFilter<"ExpenseItem"> | string;
    expenseId?: Prisma.StringFilter<"ExpenseItem"> | string;
    price?: Prisma.DecimalFilter<"ExpenseItem"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    discount?: Prisma.DecimalFilter<"ExpenseItem"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    createdAt?: Prisma.DateTimeFilter<"ExpenseItem"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ExpenseItem"> | Date | string;
    item?: Prisma.XOR<Prisma.StoreItemScalarRelationFilter, Prisma.StoreItemWhereInput>;
    expense?: Prisma.XOR<Prisma.ExpenseScalarRelationFilter, Prisma.ExpenseWhereInput>;
};
export type ExpenseItemOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    itemId?: Prisma.SortOrder;
    expenseId?: Prisma.SortOrder;
    price?: Prisma.SortOrder;
    discount?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    item?: Prisma.StoreItemOrderByWithRelationInput;
    expense?: Prisma.ExpenseOrderByWithRelationInput;
};
export type ExpenseItemWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.ExpenseItemWhereInput | Prisma.ExpenseItemWhereInput[];
    OR?: Prisma.ExpenseItemWhereInput[];
    NOT?: Prisma.ExpenseItemWhereInput | Prisma.ExpenseItemWhereInput[];
    itemId?: Prisma.StringFilter<"ExpenseItem"> | string;
    expenseId?: Prisma.StringFilter<"ExpenseItem"> | string;
    price?: Prisma.DecimalFilter<"ExpenseItem"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    discount?: Prisma.DecimalFilter<"ExpenseItem"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    createdAt?: Prisma.DateTimeFilter<"ExpenseItem"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ExpenseItem"> | Date | string;
    item?: Prisma.XOR<Prisma.StoreItemScalarRelationFilter, Prisma.StoreItemWhereInput>;
    expense?: Prisma.XOR<Prisma.ExpenseScalarRelationFilter, Prisma.ExpenseWhereInput>;
}, "id">;
export type ExpenseItemOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    itemId?: Prisma.SortOrder;
    expenseId?: Prisma.SortOrder;
    price?: Prisma.SortOrder;
    discount?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.ExpenseItemCountOrderByAggregateInput;
    _avg?: Prisma.ExpenseItemAvgOrderByAggregateInput;
    _max?: Prisma.ExpenseItemMaxOrderByAggregateInput;
    _min?: Prisma.ExpenseItemMinOrderByAggregateInput;
    _sum?: Prisma.ExpenseItemSumOrderByAggregateInput;
};
export type ExpenseItemScalarWhereWithAggregatesInput = {
    AND?: Prisma.ExpenseItemScalarWhereWithAggregatesInput | Prisma.ExpenseItemScalarWhereWithAggregatesInput[];
    OR?: Prisma.ExpenseItemScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ExpenseItemScalarWhereWithAggregatesInput | Prisma.ExpenseItemScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"ExpenseItem"> | string;
    itemId?: Prisma.StringWithAggregatesFilter<"ExpenseItem"> | string;
    expenseId?: Prisma.StringWithAggregatesFilter<"ExpenseItem"> | string;
    price?: Prisma.DecimalWithAggregatesFilter<"ExpenseItem"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    discount?: Prisma.DecimalWithAggregatesFilter<"ExpenseItem"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"ExpenseItem"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"ExpenseItem"> | Date | string;
};
export type ExpenseItemCreateInput = {
    id?: string;
    price: runtime.Decimal | runtime.DecimalJsLike | number | string;
    discount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    item: Prisma.StoreItemCreateNestedOneWithoutExpensesInput;
    expense: Prisma.ExpenseCreateNestedOneWithoutItemsInput;
};
export type ExpenseItemUncheckedCreateInput = {
    id?: string;
    itemId: string;
    expenseId: string;
    price: runtime.Decimal | runtime.DecimalJsLike | number | string;
    discount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ExpenseItemUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    price?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    discount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    item?: Prisma.StoreItemUpdateOneRequiredWithoutExpensesNestedInput;
    expense?: Prisma.ExpenseUpdateOneRequiredWithoutItemsNestedInput;
};
export type ExpenseItemUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    itemId?: Prisma.StringFieldUpdateOperationsInput | string;
    expenseId?: Prisma.StringFieldUpdateOperationsInput | string;
    price?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    discount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ExpenseItemCreateManyInput = {
    id?: string;
    itemId: string;
    expenseId: string;
    price: runtime.Decimal | runtime.DecimalJsLike | number | string;
    discount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ExpenseItemUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    price?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    discount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ExpenseItemUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    itemId?: Prisma.StringFieldUpdateOperationsInput | string;
    expenseId?: Prisma.StringFieldUpdateOperationsInput | string;
    price?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    discount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ExpenseItemCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    itemId?: Prisma.SortOrder;
    expenseId?: Prisma.SortOrder;
    price?: Prisma.SortOrder;
    discount?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ExpenseItemAvgOrderByAggregateInput = {
    price?: Prisma.SortOrder;
    discount?: Prisma.SortOrder;
};
export type ExpenseItemMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    itemId?: Prisma.SortOrder;
    expenseId?: Prisma.SortOrder;
    price?: Prisma.SortOrder;
    discount?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ExpenseItemMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    itemId?: Prisma.SortOrder;
    expenseId?: Prisma.SortOrder;
    price?: Prisma.SortOrder;
    discount?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ExpenseItemSumOrderByAggregateInput = {
    price?: Prisma.SortOrder;
    discount?: Prisma.SortOrder;
};
export type ExpenseItemListRelationFilter = {
    every?: Prisma.ExpenseItemWhereInput;
    some?: Prisma.ExpenseItemWhereInput;
    none?: Prisma.ExpenseItemWhereInput;
};
export type ExpenseItemOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type DecimalFieldUpdateOperationsInput = {
    set?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    increment?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    decrement?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    multiply?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    divide?: runtime.Decimal | runtime.DecimalJsLike | number | string;
};
export type ExpenseItemCreateNestedManyWithoutExpenseInput = {
    create?: Prisma.XOR<Prisma.ExpenseItemCreateWithoutExpenseInput, Prisma.ExpenseItemUncheckedCreateWithoutExpenseInput> | Prisma.ExpenseItemCreateWithoutExpenseInput[] | Prisma.ExpenseItemUncheckedCreateWithoutExpenseInput[];
    connectOrCreate?: Prisma.ExpenseItemCreateOrConnectWithoutExpenseInput | Prisma.ExpenseItemCreateOrConnectWithoutExpenseInput[];
    createMany?: Prisma.ExpenseItemCreateManyExpenseInputEnvelope;
    connect?: Prisma.ExpenseItemWhereUniqueInput | Prisma.ExpenseItemWhereUniqueInput[];
};
export type ExpenseItemUncheckedCreateNestedManyWithoutExpenseInput = {
    create?: Prisma.XOR<Prisma.ExpenseItemCreateWithoutExpenseInput, Prisma.ExpenseItemUncheckedCreateWithoutExpenseInput> | Prisma.ExpenseItemCreateWithoutExpenseInput[] | Prisma.ExpenseItemUncheckedCreateWithoutExpenseInput[];
    connectOrCreate?: Prisma.ExpenseItemCreateOrConnectWithoutExpenseInput | Prisma.ExpenseItemCreateOrConnectWithoutExpenseInput[];
    createMany?: Prisma.ExpenseItemCreateManyExpenseInputEnvelope;
    connect?: Prisma.ExpenseItemWhereUniqueInput | Prisma.ExpenseItemWhereUniqueInput[];
};
export type ExpenseItemUpdateManyWithoutExpenseNestedInput = {
    create?: Prisma.XOR<Prisma.ExpenseItemCreateWithoutExpenseInput, Prisma.ExpenseItemUncheckedCreateWithoutExpenseInput> | Prisma.ExpenseItemCreateWithoutExpenseInput[] | Prisma.ExpenseItemUncheckedCreateWithoutExpenseInput[];
    connectOrCreate?: Prisma.ExpenseItemCreateOrConnectWithoutExpenseInput | Prisma.ExpenseItemCreateOrConnectWithoutExpenseInput[];
    upsert?: Prisma.ExpenseItemUpsertWithWhereUniqueWithoutExpenseInput | Prisma.ExpenseItemUpsertWithWhereUniqueWithoutExpenseInput[];
    createMany?: Prisma.ExpenseItemCreateManyExpenseInputEnvelope;
    set?: Prisma.ExpenseItemWhereUniqueInput | Prisma.ExpenseItemWhereUniqueInput[];
    disconnect?: Prisma.ExpenseItemWhereUniqueInput | Prisma.ExpenseItemWhereUniqueInput[];
    delete?: Prisma.ExpenseItemWhereUniqueInput | Prisma.ExpenseItemWhereUniqueInput[];
    connect?: Prisma.ExpenseItemWhereUniqueInput | Prisma.ExpenseItemWhereUniqueInput[];
    update?: Prisma.ExpenseItemUpdateWithWhereUniqueWithoutExpenseInput | Prisma.ExpenseItemUpdateWithWhereUniqueWithoutExpenseInput[];
    updateMany?: Prisma.ExpenseItemUpdateManyWithWhereWithoutExpenseInput | Prisma.ExpenseItemUpdateManyWithWhereWithoutExpenseInput[];
    deleteMany?: Prisma.ExpenseItemScalarWhereInput | Prisma.ExpenseItemScalarWhereInput[];
};
export type ExpenseItemUncheckedUpdateManyWithoutExpenseNestedInput = {
    create?: Prisma.XOR<Prisma.ExpenseItemCreateWithoutExpenseInput, Prisma.ExpenseItemUncheckedCreateWithoutExpenseInput> | Prisma.ExpenseItemCreateWithoutExpenseInput[] | Prisma.ExpenseItemUncheckedCreateWithoutExpenseInput[];
    connectOrCreate?: Prisma.ExpenseItemCreateOrConnectWithoutExpenseInput | Prisma.ExpenseItemCreateOrConnectWithoutExpenseInput[];
    upsert?: Prisma.ExpenseItemUpsertWithWhereUniqueWithoutExpenseInput | Prisma.ExpenseItemUpsertWithWhereUniqueWithoutExpenseInput[];
    createMany?: Prisma.ExpenseItemCreateManyExpenseInputEnvelope;
    set?: Prisma.ExpenseItemWhereUniqueInput | Prisma.ExpenseItemWhereUniqueInput[];
    disconnect?: Prisma.ExpenseItemWhereUniqueInput | Prisma.ExpenseItemWhereUniqueInput[];
    delete?: Prisma.ExpenseItemWhereUniqueInput | Prisma.ExpenseItemWhereUniqueInput[];
    connect?: Prisma.ExpenseItemWhereUniqueInput | Prisma.ExpenseItemWhereUniqueInput[];
    update?: Prisma.ExpenseItemUpdateWithWhereUniqueWithoutExpenseInput | Prisma.ExpenseItemUpdateWithWhereUniqueWithoutExpenseInput[];
    updateMany?: Prisma.ExpenseItemUpdateManyWithWhereWithoutExpenseInput | Prisma.ExpenseItemUpdateManyWithWhereWithoutExpenseInput[];
    deleteMany?: Prisma.ExpenseItemScalarWhereInput | Prisma.ExpenseItemScalarWhereInput[];
};
export type ExpenseItemCreateNestedManyWithoutItemInput = {
    create?: Prisma.XOR<Prisma.ExpenseItemCreateWithoutItemInput, Prisma.ExpenseItemUncheckedCreateWithoutItemInput> | Prisma.ExpenseItemCreateWithoutItemInput[] | Prisma.ExpenseItemUncheckedCreateWithoutItemInput[];
    connectOrCreate?: Prisma.ExpenseItemCreateOrConnectWithoutItemInput | Prisma.ExpenseItemCreateOrConnectWithoutItemInput[];
    createMany?: Prisma.ExpenseItemCreateManyItemInputEnvelope;
    connect?: Prisma.ExpenseItemWhereUniqueInput | Prisma.ExpenseItemWhereUniqueInput[];
};
export type ExpenseItemUncheckedCreateNestedManyWithoutItemInput = {
    create?: Prisma.XOR<Prisma.ExpenseItemCreateWithoutItemInput, Prisma.ExpenseItemUncheckedCreateWithoutItemInput> | Prisma.ExpenseItemCreateWithoutItemInput[] | Prisma.ExpenseItemUncheckedCreateWithoutItemInput[];
    connectOrCreate?: Prisma.ExpenseItemCreateOrConnectWithoutItemInput | Prisma.ExpenseItemCreateOrConnectWithoutItemInput[];
    createMany?: Prisma.ExpenseItemCreateManyItemInputEnvelope;
    connect?: Prisma.ExpenseItemWhereUniqueInput | Prisma.ExpenseItemWhereUniqueInput[];
};
export type ExpenseItemUpdateManyWithoutItemNestedInput = {
    create?: Prisma.XOR<Prisma.ExpenseItemCreateWithoutItemInput, Prisma.ExpenseItemUncheckedCreateWithoutItemInput> | Prisma.ExpenseItemCreateWithoutItemInput[] | Prisma.ExpenseItemUncheckedCreateWithoutItemInput[];
    connectOrCreate?: Prisma.ExpenseItemCreateOrConnectWithoutItemInput | Prisma.ExpenseItemCreateOrConnectWithoutItemInput[];
    upsert?: Prisma.ExpenseItemUpsertWithWhereUniqueWithoutItemInput | Prisma.ExpenseItemUpsertWithWhereUniqueWithoutItemInput[];
    createMany?: Prisma.ExpenseItemCreateManyItemInputEnvelope;
    set?: Prisma.ExpenseItemWhereUniqueInput | Prisma.ExpenseItemWhereUniqueInput[];
    disconnect?: Prisma.ExpenseItemWhereUniqueInput | Prisma.ExpenseItemWhereUniqueInput[];
    delete?: Prisma.ExpenseItemWhereUniqueInput | Prisma.ExpenseItemWhereUniqueInput[];
    connect?: Prisma.ExpenseItemWhereUniqueInput | Prisma.ExpenseItemWhereUniqueInput[];
    update?: Prisma.ExpenseItemUpdateWithWhereUniqueWithoutItemInput | Prisma.ExpenseItemUpdateWithWhereUniqueWithoutItemInput[];
    updateMany?: Prisma.ExpenseItemUpdateManyWithWhereWithoutItemInput | Prisma.ExpenseItemUpdateManyWithWhereWithoutItemInput[];
    deleteMany?: Prisma.ExpenseItemScalarWhereInput | Prisma.ExpenseItemScalarWhereInput[];
};
export type ExpenseItemUncheckedUpdateManyWithoutItemNestedInput = {
    create?: Prisma.XOR<Prisma.ExpenseItemCreateWithoutItemInput, Prisma.ExpenseItemUncheckedCreateWithoutItemInput> | Prisma.ExpenseItemCreateWithoutItemInput[] | Prisma.ExpenseItemUncheckedCreateWithoutItemInput[];
    connectOrCreate?: Prisma.ExpenseItemCreateOrConnectWithoutItemInput | Prisma.ExpenseItemCreateOrConnectWithoutItemInput[];
    upsert?: Prisma.ExpenseItemUpsertWithWhereUniqueWithoutItemInput | Prisma.ExpenseItemUpsertWithWhereUniqueWithoutItemInput[];
    createMany?: Prisma.ExpenseItemCreateManyItemInputEnvelope;
    set?: Prisma.ExpenseItemWhereUniqueInput | Prisma.ExpenseItemWhereUniqueInput[];
    disconnect?: Prisma.ExpenseItemWhereUniqueInput | Prisma.ExpenseItemWhereUniqueInput[];
    delete?: Prisma.ExpenseItemWhereUniqueInput | Prisma.ExpenseItemWhereUniqueInput[];
    connect?: Prisma.ExpenseItemWhereUniqueInput | Prisma.ExpenseItemWhereUniqueInput[];
    update?: Prisma.ExpenseItemUpdateWithWhereUniqueWithoutItemInput | Prisma.ExpenseItemUpdateWithWhereUniqueWithoutItemInput[];
    updateMany?: Prisma.ExpenseItemUpdateManyWithWhereWithoutItemInput | Prisma.ExpenseItemUpdateManyWithWhereWithoutItemInput[];
    deleteMany?: Prisma.ExpenseItemScalarWhereInput | Prisma.ExpenseItemScalarWhereInput[];
};
export type ExpenseItemCreateWithoutExpenseInput = {
    id?: string;
    price: runtime.Decimal | runtime.DecimalJsLike | number | string;
    discount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    item: Prisma.StoreItemCreateNestedOneWithoutExpensesInput;
};
export type ExpenseItemUncheckedCreateWithoutExpenseInput = {
    id?: string;
    itemId: string;
    price: runtime.Decimal | runtime.DecimalJsLike | number | string;
    discount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ExpenseItemCreateOrConnectWithoutExpenseInput = {
    where: Prisma.ExpenseItemWhereUniqueInput;
    create: Prisma.XOR<Prisma.ExpenseItemCreateWithoutExpenseInput, Prisma.ExpenseItemUncheckedCreateWithoutExpenseInput>;
};
export type ExpenseItemCreateManyExpenseInputEnvelope = {
    data: Prisma.ExpenseItemCreateManyExpenseInput | Prisma.ExpenseItemCreateManyExpenseInput[];
    skipDuplicates?: boolean;
};
export type ExpenseItemUpsertWithWhereUniqueWithoutExpenseInput = {
    where: Prisma.ExpenseItemWhereUniqueInput;
    update: Prisma.XOR<Prisma.ExpenseItemUpdateWithoutExpenseInput, Prisma.ExpenseItemUncheckedUpdateWithoutExpenseInput>;
    create: Prisma.XOR<Prisma.ExpenseItemCreateWithoutExpenseInput, Prisma.ExpenseItemUncheckedCreateWithoutExpenseInput>;
};
export type ExpenseItemUpdateWithWhereUniqueWithoutExpenseInput = {
    where: Prisma.ExpenseItemWhereUniqueInput;
    data: Prisma.XOR<Prisma.ExpenseItemUpdateWithoutExpenseInput, Prisma.ExpenseItemUncheckedUpdateWithoutExpenseInput>;
};
export type ExpenseItemUpdateManyWithWhereWithoutExpenseInput = {
    where: Prisma.ExpenseItemScalarWhereInput;
    data: Prisma.XOR<Prisma.ExpenseItemUpdateManyMutationInput, Prisma.ExpenseItemUncheckedUpdateManyWithoutExpenseInput>;
};
export type ExpenseItemScalarWhereInput = {
    AND?: Prisma.ExpenseItemScalarWhereInput | Prisma.ExpenseItemScalarWhereInput[];
    OR?: Prisma.ExpenseItemScalarWhereInput[];
    NOT?: Prisma.ExpenseItemScalarWhereInput | Prisma.ExpenseItemScalarWhereInput[];
    id?: Prisma.StringFilter<"ExpenseItem"> | string;
    itemId?: Prisma.StringFilter<"ExpenseItem"> | string;
    expenseId?: Prisma.StringFilter<"ExpenseItem"> | string;
    price?: Prisma.DecimalFilter<"ExpenseItem"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    discount?: Prisma.DecimalFilter<"ExpenseItem"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    createdAt?: Prisma.DateTimeFilter<"ExpenseItem"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ExpenseItem"> | Date | string;
};
export type ExpenseItemCreateWithoutItemInput = {
    id?: string;
    price: runtime.Decimal | runtime.DecimalJsLike | number | string;
    discount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    expense: Prisma.ExpenseCreateNestedOneWithoutItemsInput;
};
export type ExpenseItemUncheckedCreateWithoutItemInput = {
    id?: string;
    expenseId: string;
    price: runtime.Decimal | runtime.DecimalJsLike | number | string;
    discount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ExpenseItemCreateOrConnectWithoutItemInput = {
    where: Prisma.ExpenseItemWhereUniqueInput;
    create: Prisma.XOR<Prisma.ExpenseItemCreateWithoutItemInput, Prisma.ExpenseItemUncheckedCreateWithoutItemInput>;
};
export type ExpenseItemCreateManyItemInputEnvelope = {
    data: Prisma.ExpenseItemCreateManyItemInput | Prisma.ExpenseItemCreateManyItemInput[];
    skipDuplicates?: boolean;
};
export type ExpenseItemUpsertWithWhereUniqueWithoutItemInput = {
    where: Prisma.ExpenseItemWhereUniqueInput;
    update: Prisma.XOR<Prisma.ExpenseItemUpdateWithoutItemInput, Prisma.ExpenseItemUncheckedUpdateWithoutItemInput>;
    create: Prisma.XOR<Prisma.ExpenseItemCreateWithoutItemInput, Prisma.ExpenseItemUncheckedCreateWithoutItemInput>;
};
export type ExpenseItemUpdateWithWhereUniqueWithoutItemInput = {
    where: Prisma.ExpenseItemWhereUniqueInput;
    data: Prisma.XOR<Prisma.ExpenseItemUpdateWithoutItemInput, Prisma.ExpenseItemUncheckedUpdateWithoutItemInput>;
};
export type ExpenseItemUpdateManyWithWhereWithoutItemInput = {
    where: Prisma.ExpenseItemScalarWhereInput;
    data: Prisma.XOR<Prisma.ExpenseItemUpdateManyMutationInput, Prisma.ExpenseItemUncheckedUpdateManyWithoutItemInput>;
};
export type ExpenseItemCreateManyExpenseInput = {
    id?: string;
    itemId: string;
    price: runtime.Decimal | runtime.DecimalJsLike | number | string;
    discount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ExpenseItemUpdateWithoutExpenseInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    price?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    discount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    item?: Prisma.StoreItemUpdateOneRequiredWithoutExpensesNestedInput;
};
export type ExpenseItemUncheckedUpdateWithoutExpenseInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    itemId?: Prisma.StringFieldUpdateOperationsInput | string;
    price?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    discount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ExpenseItemUncheckedUpdateManyWithoutExpenseInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    itemId?: Prisma.StringFieldUpdateOperationsInput | string;
    price?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    discount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ExpenseItemCreateManyItemInput = {
    id?: string;
    expenseId: string;
    price: runtime.Decimal | runtime.DecimalJsLike | number | string;
    discount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ExpenseItemUpdateWithoutItemInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    price?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    discount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    expense?: Prisma.ExpenseUpdateOneRequiredWithoutItemsNestedInput;
};
export type ExpenseItemUncheckedUpdateWithoutItemInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    expenseId?: Prisma.StringFieldUpdateOperationsInput | string;
    price?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    discount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ExpenseItemUncheckedUpdateManyWithoutItemInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    expenseId?: Prisma.StringFieldUpdateOperationsInput | string;
    price?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    discount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ExpenseItemSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    itemId?: boolean;
    expenseId?: boolean;
    price?: boolean;
    discount?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    item?: boolean | Prisma.StoreItemDefaultArgs<ExtArgs>;
    expense?: boolean | Prisma.ExpenseDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["expenseItem"]>;
export type ExpenseItemSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    itemId?: boolean;
    expenseId?: boolean;
    price?: boolean;
    discount?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    item?: boolean | Prisma.StoreItemDefaultArgs<ExtArgs>;
    expense?: boolean | Prisma.ExpenseDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["expenseItem"]>;
export type ExpenseItemSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    itemId?: boolean;
    expenseId?: boolean;
    price?: boolean;
    discount?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    item?: boolean | Prisma.StoreItemDefaultArgs<ExtArgs>;
    expense?: boolean | Prisma.ExpenseDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["expenseItem"]>;
export type ExpenseItemSelectScalar = {
    id?: boolean;
    itemId?: boolean;
    expenseId?: boolean;
    price?: boolean;
    discount?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type ExpenseItemOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "itemId" | "expenseId" | "price" | "discount" | "createdAt" | "updatedAt", ExtArgs["result"]["expenseItem"]>;
export type ExpenseItemInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    item?: boolean | Prisma.StoreItemDefaultArgs<ExtArgs>;
    expense?: boolean | Prisma.ExpenseDefaultArgs<ExtArgs>;
};
export type ExpenseItemIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    item?: boolean | Prisma.StoreItemDefaultArgs<ExtArgs>;
    expense?: boolean | Prisma.ExpenseDefaultArgs<ExtArgs>;
};
export type ExpenseItemIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    item?: boolean | Prisma.StoreItemDefaultArgs<ExtArgs>;
    expense?: boolean | Prisma.ExpenseDefaultArgs<ExtArgs>;
};
export type $ExpenseItemPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ExpenseItem";
    objects: {
        item: Prisma.$StoreItemPayload<ExtArgs>;
        expense: Prisma.$ExpensePayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        itemId: string;
        expenseId: string;
        price: runtime.Decimal;
        discount: runtime.Decimal;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["expenseItem"]>;
    composites: {};
};
export type ExpenseItemGetPayload<S extends boolean | null | undefined | ExpenseItemDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ExpenseItemPayload, S>;
export type ExpenseItemCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ExpenseItemFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ExpenseItemCountAggregateInputType | true;
};
export interface ExpenseItemDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ExpenseItem'];
        meta: {
            name: 'ExpenseItem';
        };
    };
    findUnique<T extends ExpenseItemFindUniqueArgs>(args: Prisma.SelectSubset<T, ExpenseItemFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ExpenseItemClient<runtime.Types.Result.GetResult<Prisma.$ExpenseItemPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ExpenseItemFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ExpenseItemFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ExpenseItemClient<runtime.Types.Result.GetResult<Prisma.$ExpenseItemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ExpenseItemFindFirstArgs>(args?: Prisma.SelectSubset<T, ExpenseItemFindFirstArgs<ExtArgs>>): Prisma.Prisma__ExpenseItemClient<runtime.Types.Result.GetResult<Prisma.$ExpenseItemPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ExpenseItemFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ExpenseItemFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ExpenseItemClient<runtime.Types.Result.GetResult<Prisma.$ExpenseItemPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ExpenseItemFindManyArgs>(args?: Prisma.SelectSubset<T, ExpenseItemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ExpenseItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ExpenseItemCreateArgs>(args: Prisma.SelectSubset<T, ExpenseItemCreateArgs<ExtArgs>>): Prisma.Prisma__ExpenseItemClient<runtime.Types.Result.GetResult<Prisma.$ExpenseItemPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ExpenseItemCreateManyArgs>(args?: Prisma.SelectSubset<T, ExpenseItemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ExpenseItemCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ExpenseItemCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ExpenseItemPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ExpenseItemDeleteArgs>(args: Prisma.SelectSubset<T, ExpenseItemDeleteArgs<ExtArgs>>): Prisma.Prisma__ExpenseItemClient<runtime.Types.Result.GetResult<Prisma.$ExpenseItemPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ExpenseItemUpdateArgs>(args: Prisma.SelectSubset<T, ExpenseItemUpdateArgs<ExtArgs>>): Prisma.Prisma__ExpenseItemClient<runtime.Types.Result.GetResult<Prisma.$ExpenseItemPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ExpenseItemDeleteManyArgs>(args?: Prisma.SelectSubset<T, ExpenseItemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ExpenseItemUpdateManyArgs>(args: Prisma.SelectSubset<T, ExpenseItemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ExpenseItemUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ExpenseItemUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ExpenseItemPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ExpenseItemUpsertArgs>(args: Prisma.SelectSubset<T, ExpenseItemUpsertArgs<ExtArgs>>): Prisma.Prisma__ExpenseItemClient<runtime.Types.Result.GetResult<Prisma.$ExpenseItemPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ExpenseItemCountArgs>(args?: Prisma.Subset<T, ExpenseItemCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ExpenseItemCountAggregateOutputType> : number>;
    aggregate<T extends ExpenseItemAggregateArgs>(args: Prisma.Subset<T, ExpenseItemAggregateArgs>): Prisma.PrismaPromise<GetExpenseItemAggregateType<T>>;
    groupBy<T extends ExpenseItemGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ExpenseItemGroupByArgs['orderBy'];
    } : {
        orderBy?: ExpenseItemGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ExpenseItemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetExpenseItemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ExpenseItemFieldRefs;
}
export interface Prisma__ExpenseItemClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    item<T extends Prisma.StoreItemDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.StoreItemDefaultArgs<ExtArgs>>): Prisma.Prisma__StoreItemClient<runtime.Types.Result.GetResult<Prisma.$StoreItemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    expense<T extends Prisma.ExpenseDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ExpenseDefaultArgs<ExtArgs>>): Prisma.Prisma__ExpenseClient<runtime.Types.Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ExpenseItemFieldRefs {
    readonly id: Prisma.FieldRef<"ExpenseItem", 'String'>;
    readonly itemId: Prisma.FieldRef<"ExpenseItem", 'String'>;
    readonly expenseId: Prisma.FieldRef<"ExpenseItem", 'String'>;
    readonly price: Prisma.FieldRef<"ExpenseItem", 'Decimal'>;
    readonly discount: Prisma.FieldRef<"ExpenseItem", 'Decimal'>;
    readonly createdAt: Prisma.FieldRef<"ExpenseItem", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"ExpenseItem", 'DateTime'>;
}
export type ExpenseItemFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExpenseItemSelect<ExtArgs> | null;
    omit?: Prisma.ExpenseItemOmit<ExtArgs> | null;
    include?: Prisma.ExpenseItemInclude<ExtArgs> | null;
    where: Prisma.ExpenseItemWhereUniqueInput;
};
export type ExpenseItemFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExpenseItemSelect<ExtArgs> | null;
    omit?: Prisma.ExpenseItemOmit<ExtArgs> | null;
    include?: Prisma.ExpenseItemInclude<ExtArgs> | null;
    where: Prisma.ExpenseItemWhereUniqueInput;
};
export type ExpenseItemFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ExpenseItemFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ExpenseItemFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ExpenseItemCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExpenseItemSelect<ExtArgs> | null;
    omit?: Prisma.ExpenseItemOmit<ExtArgs> | null;
    include?: Prisma.ExpenseItemInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ExpenseItemCreateInput, Prisma.ExpenseItemUncheckedCreateInput>;
};
export type ExpenseItemCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ExpenseItemCreateManyInput | Prisma.ExpenseItemCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ExpenseItemCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExpenseItemSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ExpenseItemOmit<ExtArgs> | null;
    data: Prisma.ExpenseItemCreateManyInput | Prisma.ExpenseItemCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ExpenseItemIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ExpenseItemUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExpenseItemSelect<ExtArgs> | null;
    omit?: Prisma.ExpenseItemOmit<ExtArgs> | null;
    include?: Prisma.ExpenseItemInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ExpenseItemUpdateInput, Prisma.ExpenseItemUncheckedUpdateInput>;
    where: Prisma.ExpenseItemWhereUniqueInput;
};
export type ExpenseItemUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ExpenseItemUpdateManyMutationInput, Prisma.ExpenseItemUncheckedUpdateManyInput>;
    where?: Prisma.ExpenseItemWhereInput;
    limit?: number;
};
export type ExpenseItemUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExpenseItemSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ExpenseItemOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ExpenseItemUpdateManyMutationInput, Prisma.ExpenseItemUncheckedUpdateManyInput>;
    where?: Prisma.ExpenseItemWhereInput;
    limit?: number;
    include?: Prisma.ExpenseItemIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ExpenseItemUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExpenseItemSelect<ExtArgs> | null;
    omit?: Prisma.ExpenseItemOmit<ExtArgs> | null;
    include?: Prisma.ExpenseItemInclude<ExtArgs> | null;
    where: Prisma.ExpenseItemWhereUniqueInput;
    create: Prisma.XOR<Prisma.ExpenseItemCreateInput, Prisma.ExpenseItemUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ExpenseItemUpdateInput, Prisma.ExpenseItemUncheckedUpdateInput>;
};
export type ExpenseItemDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExpenseItemSelect<ExtArgs> | null;
    omit?: Prisma.ExpenseItemOmit<ExtArgs> | null;
    include?: Prisma.ExpenseItemInclude<ExtArgs> | null;
    where: Prisma.ExpenseItemWhereUniqueInput;
};
export type ExpenseItemDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ExpenseItemWhereInput;
    limit?: number;
};
export type ExpenseItemDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExpenseItemSelect<ExtArgs> | null;
    omit?: Prisma.ExpenseItemOmit<ExtArgs> | null;
    include?: Prisma.ExpenseItemInclude<ExtArgs> | null;
};
export {};
