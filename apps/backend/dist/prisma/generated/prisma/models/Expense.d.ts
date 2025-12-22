import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
export type ExpenseModel = runtime.Types.Result.DefaultSelection<Prisma.$ExpensePayload>;
export type AggregateExpense = {
    _count: ExpenseCountAggregateOutputType | null;
    _min: ExpenseMinAggregateOutputType | null;
    _max: ExpenseMaxAggregateOutputType | null;
};
export type ExpenseMinAggregateOutputType = {
    id: string | null;
    transactionId: string | null;
    storeId: string | null;
    categoryId: string | null;
    description: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ExpenseMaxAggregateOutputType = {
    id: string | null;
    transactionId: string | null;
    storeId: string | null;
    categoryId: string | null;
    description: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ExpenseCountAggregateOutputType = {
    id: number;
    transactionId: number;
    storeId: number;
    categoryId: number;
    description: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type ExpenseMinAggregateInputType = {
    id?: true;
    transactionId?: true;
    storeId?: true;
    categoryId?: true;
    description?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ExpenseMaxAggregateInputType = {
    id?: true;
    transactionId?: true;
    storeId?: true;
    categoryId?: true;
    description?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ExpenseCountAggregateInputType = {
    id?: true;
    transactionId?: true;
    storeId?: true;
    categoryId?: true;
    description?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type ExpenseAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ExpenseWhereInput;
    orderBy?: Prisma.ExpenseOrderByWithRelationInput | Prisma.ExpenseOrderByWithRelationInput[];
    cursor?: Prisma.ExpenseWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ExpenseCountAggregateInputType;
    _min?: ExpenseMinAggregateInputType;
    _max?: ExpenseMaxAggregateInputType;
};
export type GetExpenseAggregateType<T extends ExpenseAggregateArgs> = {
    [P in keyof T & keyof AggregateExpense]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateExpense[P]> : Prisma.GetScalarType<T[P], AggregateExpense[P]>;
};
export type ExpenseGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ExpenseWhereInput;
    orderBy?: Prisma.ExpenseOrderByWithAggregationInput | Prisma.ExpenseOrderByWithAggregationInput[];
    by: Prisma.ExpenseScalarFieldEnum[] | Prisma.ExpenseScalarFieldEnum;
    having?: Prisma.ExpenseScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ExpenseCountAggregateInputType | true;
    _min?: ExpenseMinAggregateInputType;
    _max?: ExpenseMaxAggregateInputType;
};
export type ExpenseGroupByOutputType = {
    id: string;
    transactionId: string;
    storeId: string;
    categoryId: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: ExpenseCountAggregateOutputType | null;
    _min: ExpenseMinAggregateOutputType | null;
    _max: ExpenseMaxAggregateOutputType | null;
};
type GetExpenseGroupByPayload<T extends ExpenseGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ExpenseGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ExpenseGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ExpenseGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ExpenseGroupByOutputType[P]>;
}>>;
export type ExpenseWhereInput = {
    AND?: Prisma.ExpenseWhereInput | Prisma.ExpenseWhereInput[];
    OR?: Prisma.ExpenseWhereInput[];
    NOT?: Prisma.ExpenseWhereInput | Prisma.ExpenseWhereInput[];
    id?: Prisma.StringFilter<"Expense"> | string;
    transactionId?: Prisma.StringFilter<"Expense"> | string;
    storeId?: Prisma.StringFilter<"Expense"> | string;
    categoryId?: Prisma.StringFilter<"Expense"> | string;
    description?: Prisma.StringNullableFilter<"Expense"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Expense"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Expense"> | Date | string;
    category?: Prisma.XOR<Prisma.ExpenseCategoryScalarRelationFilter, Prisma.ExpenseCategoryWhereInput>;
    transaction?: Prisma.XOR<Prisma.TransactionScalarRelationFilter, Prisma.TransactionWhereInput>;
    store?: Prisma.XOR<Prisma.StoreScalarRelationFilter, Prisma.StoreWhereInput>;
    items?: Prisma.ExpenseItemListRelationFilter;
};
export type ExpenseOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    transactionId?: Prisma.SortOrder;
    storeId?: Prisma.SortOrder;
    categoryId?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    category?: Prisma.ExpenseCategoryOrderByWithRelationInput;
    transaction?: Prisma.TransactionOrderByWithRelationInput;
    store?: Prisma.StoreOrderByWithRelationInput;
    items?: Prisma.ExpenseItemOrderByRelationAggregateInput;
};
export type ExpenseWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    transactionId?: string;
    AND?: Prisma.ExpenseWhereInput | Prisma.ExpenseWhereInput[];
    OR?: Prisma.ExpenseWhereInput[];
    NOT?: Prisma.ExpenseWhereInput | Prisma.ExpenseWhereInput[];
    storeId?: Prisma.StringFilter<"Expense"> | string;
    categoryId?: Prisma.StringFilter<"Expense"> | string;
    description?: Prisma.StringNullableFilter<"Expense"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Expense"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Expense"> | Date | string;
    category?: Prisma.XOR<Prisma.ExpenseCategoryScalarRelationFilter, Prisma.ExpenseCategoryWhereInput>;
    transaction?: Prisma.XOR<Prisma.TransactionScalarRelationFilter, Prisma.TransactionWhereInput>;
    store?: Prisma.XOR<Prisma.StoreScalarRelationFilter, Prisma.StoreWhereInput>;
    items?: Prisma.ExpenseItemListRelationFilter;
}, "id" | "transactionId">;
export type ExpenseOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    transactionId?: Prisma.SortOrder;
    storeId?: Prisma.SortOrder;
    categoryId?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.ExpenseCountOrderByAggregateInput;
    _max?: Prisma.ExpenseMaxOrderByAggregateInput;
    _min?: Prisma.ExpenseMinOrderByAggregateInput;
};
export type ExpenseScalarWhereWithAggregatesInput = {
    AND?: Prisma.ExpenseScalarWhereWithAggregatesInput | Prisma.ExpenseScalarWhereWithAggregatesInput[];
    OR?: Prisma.ExpenseScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ExpenseScalarWhereWithAggregatesInput | Prisma.ExpenseScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Expense"> | string;
    transactionId?: Prisma.StringWithAggregatesFilter<"Expense"> | string;
    storeId?: Prisma.StringWithAggregatesFilter<"Expense"> | string;
    categoryId?: Prisma.StringWithAggregatesFilter<"Expense"> | string;
    description?: Prisma.StringNullableWithAggregatesFilter<"Expense"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Expense"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Expense"> | Date | string;
};
export type ExpenseCreateInput = {
    id: string;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    category: Prisma.ExpenseCategoryCreateNestedOneWithoutExpensesInput;
    transaction: Prisma.TransactionCreateNestedOneWithoutExpenseInput;
    store: Prisma.StoreCreateNestedOneWithoutExpensesInput;
    items?: Prisma.ExpenseItemCreateNestedManyWithoutExpenseInput;
};
export type ExpenseUncheckedCreateInput = {
    id: string;
    transactionId: string;
    storeId: string;
    categoryId: string;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    items?: Prisma.ExpenseItemUncheckedCreateNestedManyWithoutExpenseInput;
};
export type ExpenseUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    category?: Prisma.ExpenseCategoryUpdateOneRequiredWithoutExpensesNestedInput;
    transaction?: Prisma.TransactionUpdateOneRequiredWithoutExpenseNestedInput;
    store?: Prisma.StoreUpdateOneRequiredWithoutExpensesNestedInput;
    items?: Prisma.ExpenseItemUpdateManyWithoutExpenseNestedInput;
};
export type ExpenseUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    transactionId?: Prisma.StringFieldUpdateOperationsInput | string;
    storeId?: Prisma.StringFieldUpdateOperationsInput | string;
    categoryId?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    items?: Prisma.ExpenseItemUncheckedUpdateManyWithoutExpenseNestedInput;
};
export type ExpenseCreateManyInput = {
    id: string;
    transactionId: string;
    storeId: string;
    categoryId: string;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ExpenseUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ExpenseUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    transactionId?: Prisma.StringFieldUpdateOperationsInput | string;
    storeId?: Prisma.StringFieldUpdateOperationsInput | string;
    categoryId?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ExpenseScalarRelationFilter = {
    is?: Prisma.ExpenseWhereInput;
    isNot?: Prisma.ExpenseWhereInput;
};
export type ExpenseCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    transactionId?: Prisma.SortOrder;
    storeId?: Prisma.SortOrder;
    categoryId?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ExpenseMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    transactionId?: Prisma.SortOrder;
    storeId?: Prisma.SortOrder;
    categoryId?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ExpenseMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    transactionId?: Prisma.SortOrder;
    storeId?: Prisma.SortOrder;
    categoryId?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ExpenseListRelationFilter = {
    every?: Prisma.ExpenseWhereInput;
    some?: Prisma.ExpenseWhereInput;
    none?: Prisma.ExpenseWhereInput;
};
export type ExpenseOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ExpenseNullableScalarRelationFilter = {
    is?: Prisma.ExpenseWhereInput | null;
    isNot?: Prisma.ExpenseWhereInput | null;
};
export type ExpenseCreateNestedOneWithoutItemsInput = {
    create?: Prisma.XOR<Prisma.ExpenseCreateWithoutItemsInput, Prisma.ExpenseUncheckedCreateWithoutItemsInput>;
    connectOrCreate?: Prisma.ExpenseCreateOrConnectWithoutItemsInput;
    connect?: Prisma.ExpenseWhereUniqueInput;
};
export type ExpenseUpdateOneRequiredWithoutItemsNestedInput = {
    create?: Prisma.XOR<Prisma.ExpenseCreateWithoutItemsInput, Prisma.ExpenseUncheckedCreateWithoutItemsInput>;
    connectOrCreate?: Prisma.ExpenseCreateOrConnectWithoutItemsInput;
    upsert?: Prisma.ExpenseUpsertWithoutItemsInput;
    connect?: Prisma.ExpenseWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ExpenseUpdateToOneWithWhereWithoutItemsInput, Prisma.ExpenseUpdateWithoutItemsInput>, Prisma.ExpenseUncheckedUpdateWithoutItemsInput>;
};
export type ExpenseCreateNestedManyWithoutCategoryInput = {
    create?: Prisma.XOR<Prisma.ExpenseCreateWithoutCategoryInput, Prisma.ExpenseUncheckedCreateWithoutCategoryInput> | Prisma.ExpenseCreateWithoutCategoryInput[] | Prisma.ExpenseUncheckedCreateWithoutCategoryInput[];
    connectOrCreate?: Prisma.ExpenseCreateOrConnectWithoutCategoryInput | Prisma.ExpenseCreateOrConnectWithoutCategoryInput[];
    createMany?: Prisma.ExpenseCreateManyCategoryInputEnvelope;
    connect?: Prisma.ExpenseWhereUniqueInput | Prisma.ExpenseWhereUniqueInput[];
};
export type ExpenseUncheckedCreateNestedManyWithoutCategoryInput = {
    create?: Prisma.XOR<Prisma.ExpenseCreateWithoutCategoryInput, Prisma.ExpenseUncheckedCreateWithoutCategoryInput> | Prisma.ExpenseCreateWithoutCategoryInput[] | Prisma.ExpenseUncheckedCreateWithoutCategoryInput[];
    connectOrCreate?: Prisma.ExpenseCreateOrConnectWithoutCategoryInput | Prisma.ExpenseCreateOrConnectWithoutCategoryInput[];
    createMany?: Prisma.ExpenseCreateManyCategoryInputEnvelope;
    connect?: Prisma.ExpenseWhereUniqueInput | Prisma.ExpenseWhereUniqueInput[];
};
export type ExpenseUpdateManyWithoutCategoryNestedInput = {
    create?: Prisma.XOR<Prisma.ExpenseCreateWithoutCategoryInput, Prisma.ExpenseUncheckedCreateWithoutCategoryInput> | Prisma.ExpenseCreateWithoutCategoryInput[] | Prisma.ExpenseUncheckedCreateWithoutCategoryInput[];
    connectOrCreate?: Prisma.ExpenseCreateOrConnectWithoutCategoryInput | Prisma.ExpenseCreateOrConnectWithoutCategoryInput[];
    upsert?: Prisma.ExpenseUpsertWithWhereUniqueWithoutCategoryInput | Prisma.ExpenseUpsertWithWhereUniqueWithoutCategoryInput[];
    createMany?: Prisma.ExpenseCreateManyCategoryInputEnvelope;
    set?: Prisma.ExpenseWhereUniqueInput | Prisma.ExpenseWhereUniqueInput[];
    disconnect?: Prisma.ExpenseWhereUniqueInput | Prisma.ExpenseWhereUniqueInput[];
    delete?: Prisma.ExpenseWhereUniqueInput | Prisma.ExpenseWhereUniqueInput[];
    connect?: Prisma.ExpenseWhereUniqueInput | Prisma.ExpenseWhereUniqueInput[];
    update?: Prisma.ExpenseUpdateWithWhereUniqueWithoutCategoryInput | Prisma.ExpenseUpdateWithWhereUniqueWithoutCategoryInput[];
    updateMany?: Prisma.ExpenseUpdateManyWithWhereWithoutCategoryInput | Prisma.ExpenseUpdateManyWithWhereWithoutCategoryInput[];
    deleteMany?: Prisma.ExpenseScalarWhereInput | Prisma.ExpenseScalarWhereInput[];
};
export type ExpenseUncheckedUpdateManyWithoutCategoryNestedInput = {
    create?: Prisma.XOR<Prisma.ExpenseCreateWithoutCategoryInput, Prisma.ExpenseUncheckedCreateWithoutCategoryInput> | Prisma.ExpenseCreateWithoutCategoryInput[] | Prisma.ExpenseUncheckedCreateWithoutCategoryInput[];
    connectOrCreate?: Prisma.ExpenseCreateOrConnectWithoutCategoryInput | Prisma.ExpenseCreateOrConnectWithoutCategoryInput[];
    upsert?: Prisma.ExpenseUpsertWithWhereUniqueWithoutCategoryInput | Prisma.ExpenseUpsertWithWhereUniqueWithoutCategoryInput[];
    createMany?: Prisma.ExpenseCreateManyCategoryInputEnvelope;
    set?: Prisma.ExpenseWhereUniqueInput | Prisma.ExpenseWhereUniqueInput[];
    disconnect?: Prisma.ExpenseWhereUniqueInput | Prisma.ExpenseWhereUniqueInput[];
    delete?: Prisma.ExpenseWhereUniqueInput | Prisma.ExpenseWhereUniqueInput[];
    connect?: Prisma.ExpenseWhereUniqueInput | Prisma.ExpenseWhereUniqueInput[];
    update?: Prisma.ExpenseUpdateWithWhereUniqueWithoutCategoryInput | Prisma.ExpenseUpdateWithWhereUniqueWithoutCategoryInput[];
    updateMany?: Prisma.ExpenseUpdateManyWithWhereWithoutCategoryInput | Prisma.ExpenseUpdateManyWithWhereWithoutCategoryInput[];
    deleteMany?: Prisma.ExpenseScalarWhereInput | Prisma.ExpenseScalarWhereInput[];
};
export type ExpenseCreateNestedManyWithoutStoreInput = {
    create?: Prisma.XOR<Prisma.ExpenseCreateWithoutStoreInput, Prisma.ExpenseUncheckedCreateWithoutStoreInput> | Prisma.ExpenseCreateWithoutStoreInput[] | Prisma.ExpenseUncheckedCreateWithoutStoreInput[];
    connectOrCreate?: Prisma.ExpenseCreateOrConnectWithoutStoreInput | Prisma.ExpenseCreateOrConnectWithoutStoreInput[];
    createMany?: Prisma.ExpenseCreateManyStoreInputEnvelope;
    connect?: Prisma.ExpenseWhereUniqueInput | Prisma.ExpenseWhereUniqueInput[];
};
export type ExpenseUncheckedCreateNestedManyWithoutStoreInput = {
    create?: Prisma.XOR<Prisma.ExpenseCreateWithoutStoreInput, Prisma.ExpenseUncheckedCreateWithoutStoreInput> | Prisma.ExpenseCreateWithoutStoreInput[] | Prisma.ExpenseUncheckedCreateWithoutStoreInput[];
    connectOrCreate?: Prisma.ExpenseCreateOrConnectWithoutStoreInput | Prisma.ExpenseCreateOrConnectWithoutStoreInput[];
    createMany?: Prisma.ExpenseCreateManyStoreInputEnvelope;
    connect?: Prisma.ExpenseWhereUniqueInput | Prisma.ExpenseWhereUniqueInput[];
};
export type ExpenseUpdateManyWithoutStoreNestedInput = {
    create?: Prisma.XOR<Prisma.ExpenseCreateWithoutStoreInput, Prisma.ExpenseUncheckedCreateWithoutStoreInput> | Prisma.ExpenseCreateWithoutStoreInput[] | Prisma.ExpenseUncheckedCreateWithoutStoreInput[];
    connectOrCreate?: Prisma.ExpenseCreateOrConnectWithoutStoreInput | Prisma.ExpenseCreateOrConnectWithoutStoreInput[];
    upsert?: Prisma.ExpenseUpsertWithWhereUniqueWithoutStoreInput | Prisma.ExpenseUpsertWithWhereUniqueWithoutStoreInput[];
    createMany?: Prisma.ExpenseCreateManyStoreInputEnvelope;
    set?: Prisma.ExpenseWhereUniqueInput | Prisma.ExpenseWhereUniqueInput[];
    disconnect?: Prisma.ExpenseWhereUniqueInput | Prisma.ExpenseWhereUniqueInput[];
    delete?: Prisma.ExpenseWhereUniqueInput | Prisma.ExpenseWhereUniqueInput[];
    connect?: Prisma.ExpenseWhereUniqueInput | Prisma.ExpenseWhereUniqueInput[];
    update?: Prisma.ExpenseUpdateWithWhereUniqueWithoutStoreInput | Prisma.ExpenseUpdateWithWhereUniqueWithoutStoreInput[];
    updateMany?: Prisma.ExpenseUpdateManyWithWhereWithoutStoreInput | Prisma.ExpenseUpdateManyWithWhereWithoutStoreInput[];
    deleteMany?: Prisma.ExpenseScalarWhereInput | Prisma.ExpenseScalarWhereInput[];
};
export type ExpenseUncheckedUpdateManyWithoutStoreNestedInput = {
    create?: Prisma.XOR<Prisma.ExpenseCreateWithoutStoreInput, Prisma.ExpenseUncheckedCreateWithoutStoreInput> | Prisma.ExpenseCreateWithoutStoreInput[] | Prisma.ExpenseUncheckedCreateWithoutStoreInput[];
    connectOrCreate?: Prisma.ExpenseCreateOrConnectWithoutStoreInput | Prisma.ExpenseCreateOrConnectWithoutStoreInput[];
    upsert?: Prisma.ExpenseUpsertWithWhereUniqueWithoutStoreInput | Prisma.ExpenseUpsertWithWhereUniqueWithoutStoreInput[];
    createMany?: Prisma.ExpenseCreateManyStoreInputEnvelope;
    set?: Prisma.ExpenseWhereUniqueInput | Prisma.ExpenseWhereUniqueInput[];
    disconnect?: Prisma.ExpenseWhereUniqueInput | Prisma.ExpenseWhereUniqueInput[];
    delete?: Prisma.ExpenseWhereUniqueInput | Prisma.ExpenseWhereUniqueInput[];
    connect?: Prisma.ExpenseWhereUniqueInput | Prisma.ExpenseWhereUniqueInput[];
    update?: Prisma.ExpenseUpdateWithWhereUniqueWithoutStoreInput | Prisma.ExpenseUpdateWithWhereUniqueWithoutStoreInput[];
    updateMany?: Prisma.ExpenseUpdateManyWithWhereWithoutStoreInput | Prisma.ExpenseUpdateManyWithWhereWithoutStoreInput[];
    deleteMany?: Prisma.ExpenseScalarWhereInput | Prisma.ExpenseScalarWhereInput[];
};
export type ExpenseCreateNestedOneWithoutTransactionInput = {
    create?: Prisma.XOR<Prisma.ExpenseCreateWithoutTransactionInput, Prisma.ExpenseUncheckedCreateWithoutTransactionInput>;
    connectOrCreate?: Prisma.ExpenseCreateOrConnectWithoutTransactionInput;
    connect?: Prisma.ExpenseWhereUniqueInput;
};
export type ExpenseUncheckedCreateNestedOneWithoutTransactionInput = {
    create?: Prisma.XOR<Prisma.ExpenseCreateWithoutTransactionInput, Prisma.ExpenseUncheckedCreateWithoutTransactionInput>;
    connectOrCreate?: Prisma.ExpenseCreateOrConnectWithoutTransactionInput;
    connect?: Prisma.ExpenseWhereUniqueInput;
};
export type ExpenseUpdateOneWithoutTransactionNestedInput = {
    create?: Prisma.XOR<Prisma.ExpenseCreateWithoutTransactionInput, Prisma.ExpenseUncheckedCreateWithoutTransactionInput>;
    connectOrCreate?: Prisma.ExpenseCreateOrConnectWithoutTransactionInput;
    upsert?: Prisma.ExpenseUpsertWithoutTransactionInput;
    disconnect?: Prisma.ExpenseWhereInput | boolean;
    delete?: Prisma.ExpenseWhereInput | boolean;
    connect?: Prisma.ExpenseWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ExpenseUpdateToOneWithWhereWithoutTransactionInput, Prisma.ExpenseUpdateWithoutTransactionInput>, Prisma.ExpenseUncheckedUpdateWithoutTransactionInput>;
};
export type ExpenseUncheckedUpdateOneWithoutTransactionNestedInput = {
    create?: Prisma.XOR<Prisma.ExpenseCreateWithoutTransactionInput, Prisma.ExpenseUncheckedCreateWithoutTransactionInput>;
    connectOrCreate?: Prisma.ExpenseCreateOrConnectWithoutTransactionInput;
    upsert?: Prisma.ExpenseUpsertWithoutTransactionInput;
    disconnect?: Prisma.ExpenseWhereInput | boolean;
    delete?: Prisma.ExpenseWhereInput | boolean;
    connect?: Prisma.ExpenseWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ExpenseUpdateToOneWithWhereWithoutTransactionInput, Prisma.ExpenseUpdateWithoutTransactionInput>, Prisma.ExpenseUncheckedUpdateWithoutTransactionInput>;
};
export type ExpenseCreateWithoutItemsInput = {
    id: string;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    category: Prisma.ExpenseCategoryCreateNestedOneWithoutExpensesInput;
    transaction: Prisma.TransactionCreateNestedOneWithoutExpenseInput;
    store: Prisma.StoreCreateNestedOneWithoutExpensesInput;
};
export type ExpenseUncheckedCreateWithoutItemsInput = {
    id: string;
    transactionId: string;
    storeId: string;
    categoryId: string;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ExpenseCreateOrConnectWithoutItemsInput = {
    where: Prisma.ExpenseWhereUniqueInput;
    create: Prisma.XOR<Prisma.ExpenseCreateWithoutItemsInput, Prisma.ExpenseUncheckedCreateWithoutItemsInput>;
};
export type ExpenseUpsertWithoutItemsInput = {
    update: Prisma.XOR<Prisma.ExpenseUpdateWithoutItemsInput, Prisma.ExpenseUncheckedUpdateWithoutItemsInput>;
    create: Prisma.XOR<Prisma.ExpenseCreateWithoutItemsInput, Prisma.ExpenseUncheckedCreateWithoutItemsInput>;
    where?: Prisma.ExpenseWhereInput;
};
export type ExpenseUpdateToOneWithWhereWithoutItemsInput = {
    where?: Prisma.ExpenseWhereInput;
    data: Prisma.XOR<Prisma.ExpenseUpdateWithoutItemsInput, Prisma.ExpenseUncheckedUpdateWithoutItemsInput>;
};
export type ExpenseUpdateWithoutItemsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    category?: Prisma.ExpenseCategoryUpdateOneRequiredWithoutExpensesNestedInput;
    transaction?: Prisma.TransactionUpdateOneRequiredWithoutExpenseNestedInput;
    store?: Prisma.StoreUpdateOneRequiredWithoutExpensesNestedInput;
};
export type ExpenseUncheckedUpdateWithoutItemsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    transactionId?: Prisma.StringFieldUpdateOperationsInput | string;
    storeId?: Prisma.StringFieldUpdateOperationsInput | string;
    categoryId?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ExpenseCreateWithoutCategoryInput = {
    id: string;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    transaction: Prisma.TransactionCreateNestedOneWithoutExpenseInput;
    store: Prisma.StoreCreateNestedOneWithoutExpensesInput;
    items?: Prisma.ExpenseItemCreateNestedManyWithoutExpenseInput;
};
export type ExpenseUncheckedCreateWithoutCategoryInput = {
    id: string;
    transactionId: string;
    storeId: string;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    items?: Prisma.ExpenseItemUncheckedCreateNestedManyWithoutExpenseInput;
};
export type ExpenseCreateOrConnectWithoutCategoryInput = {
    where: Prisma.ExpenseWhereUniqueInput;
    create: Prisma.XOR<Prisma.ExpenseCreateWithoutCategoryInput, Prisma.ExpenseUncheckedCreateWithoutCategoryInput>;
};
export type ExpenseCreateManyCategoryInputEnvelope = {
    data: Prisma.ExpenseCreateManyCategoryInput | Prisma.ExpenseCreateManyCategoryInput[];
    skipDuplicates?: boolean;
};
export type ExpenseUpsertWithWhereUniqueWithoutCategoryInput = {
    where: Prisma.ExpenseWhereUniqueInput;
    update: Prisma.XOR<Prisma.ExpenseUpdateWithoutCategoryInput, Prisma.ExpenseUncheckedUpdateWithoutCategoryInput>;
    create: Prisma.XOR<Prisma.ExpenseCreateWithoutCategoryInput, Prisma.ExpenseUncheckedCreateWithoutCategoryInput>;
};
export type ExpenseUpdateWithWhereUniqueWithoutCategoryInput = {
    where: Prisma.ExpenseWhereUniqueInput;
    data: Prisma.XOR<Prisma.ExpenseUpdateWithoutCategoryInput, Prisma.ExpenseUncheckedUpdateWithoutCategoryInput>;
};
export type ExpenseUpdateManyWithWhereWithoutCategoryInput = {
    where: Prisma.ExpenseScalarWhereInput;
    data: Prisma.XOR<Prisma.ExpenseUpdateManyMutationInput, Prisma.ExpenseUncheckedUpdateManyWithoutCategoryInput>;
};
export type ExpenseScalarWhereInput = {
    AND?: Prisma.ExpenseScalarWhereInput | Prisma.ExpenseScalarWhereInput[];
    OR?: Prisma.ExpenseScalarWhereInput[];
    NOT?: Prisma.ExpenseScalarWhereInput | Prisma.ExpenseScalarWhereInput[];
    id?: Prisma.StringFilter<"Expense"> | string;
    transactionId?: Prisma.StringFilter<"Expense"> | string;
    storeId?: Prisma.StringFilter<"Expense"> | string;
    categoryId?: Prisma.StringFilter<"Expense"> | string;
    description?: Prisma.StringNullableFilter<"Expense"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Expense"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Expense"> | Date | string;
};
export type ExpenseCreateWithoutStoreInput = {
    id: string;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    category: Prisma.ExpenseCategoryCreateNestedOneWithoutExpensesInput;
    transaction: Prisma.TransactionCreateNestedOneWithoutExpenseInput;
    items?: Prisma.ExpenseItemCreateNestedManyWithoutExpenseInput;
};
export type ExpenseUncheckedCreateWithoutStoreInput = {
    id: string;
    transactionId: string;
    categoryId: string;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    items?: Prisma.ExpenseItemUncheckedCreateNestedManyWithoutExpenseInput;
};
export type ExpenseCreateOrConnectWithoutStoreInput = {
    where: Prisma.ExpenseWhereUniqueInput;
    create: Prisma.XOR<Prisma.ExpenseCreateWithoutStoreInput, Prisma.ExpenseUncheckedCreateWithoutStoreInput>;
};
export type ExpenseCreateManyStoreInputEnvelope = {
    data: Prisma.ExpenseCreateManyStoreInput | Prisma.ExpenseCreateManyStoreInput[];
    skipDuplicates?: boolean;
};
export type ExpenseUpsertWithWhereUniqueWithoutStoreInput = {
    where: Prisma.ExpenseWhereUniqueInput;
    update: Prisma.XOR<Prisma.ExpenseUpdateWithoutStoreInput, Prisma.ExpenseUncheckedUpdateWithoutStoreInput>;
    create: Prisma.XOR<Prisma.ExpenseCreateWithoutStoreInput, Prisma.ExpenseUncheckedCreateWithoutStoreInput>;
};
export type ExpenseUpdateWithWhereUniqueWithoutStoreInput = {
    where: Prisma.ExpenseWhereUniqueInput;
    data: Prisma.XOR<Prisma.ExpenseUpdateWithoutStoreInput, Prisma.ExpenseUncheckedUpdateWithoutStoreInput>;
};
export type ExpenseUpdateManyWithWhereWithoutStoreInput = {
    where: Prisma.ExpenseScalarWhereInput;
    data: Prisma.XOR<Prisma.ExpenseUpdateManyMutationInput, Prisma.ExpenseUncheckedUpdateManyWithoutStoreInput>;
};
export type ExpenseCreateWithoutTransactionInput = {
    id: string;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    category: Prisma.ExpenseCategoryCreateNestedOneWithoutExpensesInput;
    store: Prisma.StoreCreateNestedOneWithoutExpensesInput;
    items?: Prisma.ExpenseItemCreateNestedManyWithoutExpenseInput;
};
export type ExpenseUncheckedCreateWithoutTransactionInput = {
    id: string;
    storeId: string;
    categoryId: string;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    items?: Prisma.ExpenseItemUncheckedCreateNestedManyWithoutExpenseInput;
};
export type ExpenseCreateOrConnectWithoutTransactionInput = {
    where: Prisma.ExpenseWhereUniqueInput;
    create: Prisma.XOR<Prisma.ExpenseCreateWithoutTransactionInput, Prisma.ExpenseUncheckedCreateWithoutTransactionInput>;
};
export type ExpenseUpsertWithoutTransactionInput = {
    update: Prisma.XOR<Prisma.ExpenseUpdateWithoutTransactionInput, Prisma.ExpenseUncheckedUpdateWithoutTransactionInput>;
    create: Prisma.XOR<Prisma.ExpenseCreateWithoutTransactionInput, Prisma.ExpenseUncheckedCreateWithoutTransactionInput>;
    where?: Prisma.ExpenseWhereInput;
};
export type ExpenseUpdateToOneWithWhereWithoutTransactionInput = {
    where?: Prisma.ExpenseWhereInput;
    data: Prisma.XOR<Prisma.ExpenseUpdateWithoutTransactionInput, Prisma.ExpenseUncheckedUpdateWithoutTransactionInput>;
};
export type ExpenseUpdateWithoutTransactionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    category?: Prisma.ExpenseCategoryUpdateOneRequiredWithoutExpensesNestedInput;
    store?: Prisma.StoreUpdateOneRequiredWithoutExpensesNestedInput;
    items?: Prisma.ExpenseItemUpdateManyWithoutExpenseNestedInput;
};
export type ExpenseUncheckedUpdateWithoutTransactionInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    storeId?: Prisma.StringFieldUpdateOperationsInput | string;
    categoryId?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    items?: Prisma.ExpenseItemUncheckedUpdateManyWithoutExpenseNestedInput;
};
export type ExpenseCreateManyCategoryInput = {
    id: string;
    transactionId: string;
    storeId: string;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ExpenseUpdateWithoutCategoryInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    transaction?: Prisma.TransactionUpdateOneRequiredWithoutExpenseNestedInput;
    store?: Prisma.StoreUpdateOneRequiredWithoutExpensesNestedInput;
    items?: Prisma.ExpenseItemUpdateManyWithoutExpenseNestedInput;
};
export type ExpenseUncheckedUpdateWithoutCategoryInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    transactionId?: Prisma.StringFieldUpdateOperationsInput | string;
    storeId?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    items?: Prisma.ExpenseItemUncheckedUpdateManyWithoutExpenseNestedInput;
};
export type ExpenseUncheckedUpdateManyWithoutCategoryInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    transactionId?: Prisma.StringFieldUpdateOperationsInput | string;
    storeId?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ExpenseCreateManyStoreInput = {
    id: string;
    transactionId: string;
    categoryId: string;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ExpenseUpdateWithoutStoreInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    category?: Prisma.ExpenseCategoryUpdateOneRequiredWithoutExpensesNestedInput;
    transaction?: Prisma.TransactionUpdateOneRequiredWithoutExpenseNestedInput;
    items?: Prisma.ExpenseItemUpdateManyWithoutExpenseNestedInput;
};
export type ExpenseUncheckedUpdateWithoutStoreInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    transactionId?: Prisma.StringFieldUpdateOperationsInput | string;
    categoryId?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    items?: Prisma.ExpenseItemUncheckedUpdateManyWithoutExpenseNestedInput;
};
export type ExpenseUncheckedUpdateManyWithoutStoreInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    transactionId?: Prisma.StringFieldUpdateOperationsInput | string;
    categoryId?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ExpenseCountOutputType = {
    items: number;
};
export type ExpenseCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    items?: boolean | ExpenseCountOutputTypeCountItemsArgs;
};
export type ExpenseCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExpenseCountOutputTypeSelect<ExtArgs> | null;
};
export type ExpenseCountOutputTypeCountItemsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ExpenseItemWhereInput;
};
export type ExpenseSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    transactionId?: boolean;
    storeId?: boolean;
    categoryId?: boolean;
    description?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    category?: boolean | Prisma.ExpenseCategoryDefaultArgs<ExtArgs>;
    transaction?: boolean | Prisma.TransactionDefaultArgs<ExtArgs>;
    store?: boolean | Prisma.StoreDefaultArgs<ExtArgs>;
    items?: boolean | Prisma.Expense$itemsArgs<ExtArgs>;
    _count?: boolean | Prisma.ExpenseCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["expense"]>;
export type ExpenseSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    transactionId?: boolean;
    storeId?: boolean;
    categoryId?: boolean;
    description?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    category?: boolean | Prisma.ExpenseCategoryDefaultArgs<ExtArgs>;
    transaction?: boolean | Prisma.TransactionDefaultArgs<ExtArgs>;
    store?: boolean | Prisma.StoreDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["expense"]>;
export type ExpenseSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    transactionId?: boolean;
    storeId?: boolean;
    categoryId?: boolean;
    description?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    category?: boolean | Prisma.ExpenseCategoryDefaultArgs<ExtArgs>;
    transaction?: boolean | Prisma.TransactionDefaultArgs<ExtArgs>;
    store?: boolean | Prisma.StoreDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["expense"]>;
export type ExpenseSelectScalar = {
    id?: boolean;
    transactionId?: boolean;
    storeId?: boolean;
    categoryId?: boolean;
    description?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type ExpenseOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "transactionId" | "storeId" | "categoryId" | "description" | "createdAt" | "updatedAt", ExtArgs["result"]["expense"]>;
export type ExpenseInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    category?: boolean | Prisma.ExpenseCategoryDefaultArgs<ExtArgs>;
    transaction?: boolean | Prisma.TransactionDefaultArgs<ExtArgs>;
    store?: boolean | Prisma.StoreDefaultArgs<ExtArgs>;
    items?: boolean | Prisma.Expense$itemsArgs<ExtArgs>;
    _count?: boolean | Prisma.ExpenseCountOutputTypeDefaultArgs<ExtArgs>;
};
export type ExpenseIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    category?: boolean | Prisma.ExpenseCategoryDefaultArgs<ExtArgs>;
    transaction?: boolean | Prisma.TransactionDefaultArgs<ExtArgs>;
    store?: boolean | Prisma.StoreDefaultArgs<ExtArgs>;
};
export type ExpenseIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    category?: boolean | Prisma.ExpenseCategoryDefaultArgs<ExtArgs>;
    transaction?: boolean | Prisma.TransactionDefaultArgs<ExtArgs>;
    store?: boolean | Prisma.StoreDefaultArgs<ExtArgs>;
};
export type $ExpensePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Expense";
    objects: {
        category: Prisma.$ExpenseCategoryPayload<ExtArgs>;
        transaction: Prisma.$TransactionPayload<ExtArgs>;
        store: Prisma.$StorePayload<ExtArgs>;
        items: Prisma.$ExpenseItemPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        transactionId: string;
        storeId: string;
        categoryId: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["expense"]>;
    composites: {};
};
export type ExpenseGetPayload<S extends boolean | null | undefined | ExpenseDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ExpensePayload, S>;
export type ExpenseCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ExpenseFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ExpenseCountAggregateInputType | true;
};
export interface ExpenseDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Expense'];
        meta: {
            name: 'Expense';
        };
    };
    findUnique<T extends ExpenseFindUniqueArgs>(args: Prisma.SelectSubset<T, ExpenseFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ExpenseClient<runtime.Types.Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ExpenseFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ExpenseFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ExpenseClient<runtime.Types.Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ExpenseFindFirstArgs>(args?: Prisma.SelectSubset<T, ExpenseFindFirstArgs<ExtArgs>>): Prisma.Prisma__ExpenseClient<runtime.Types.Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ExpenseFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ExpenseFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ExpenseClient<runtime.Types.Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ExpenseFindManyArgs>(args?: Prisma.SelectSubset<T, ExpenseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ExpenseCreateArgs>(args: Prisma.SelectSubset<T, ExpenseCreateArgs<ExtArgs>>): Prisma.Prisma__ExpenseClient<runtime.Types.Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ExpenseCreateManyArgs>(args?: Prisma.SelectSubset<T, ExpenseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ExpenseCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ExpenseCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ExpenseDeleteArgs>(args: Prisma.SelectSubset<T, ExpenseDeleteArgs<ExtArgs>>): Prisma.Prisma__ExpenseClient<runtime.Types.Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ExpenseUpdateArgs>(args: Prisma.SelectSubset<T, ExpenseUpdateArgs<ExtArgs>>): Prisma.Prisma__ExpenseClient<runtime.Types.Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ExpenseDeleteManyArgs>(args?: Prisma.SelectSubset<T, ExpenseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ExpenseUpdateManyArgs>(args: Prisma.SelectSubset<T, ExpenseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ExpenseUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ExpenseUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ExpenseUpsertArgs>(args: Prisma.SelectSubset<T, ExpenseUpsertArgs<ExtArgs>>): Prisma.Prisma__ExpenseClient<runtime.Types.Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ExpenseCountArgs>(args?: Prisma.Subset<T, ExpenseCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ExpenseCountAggregateOutputType> : number>;
    aggregate<T extends ExpenseAggregateArgs>(args: Prisma.Subset<T, ExpenseAggregateArgs>): Prisma.PrismaPromise<GetExpenseAggregateType<T>>;
    groupBy<T extends ExpenseGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ExpenseGroupByArgs['orderBy'];
    } : {
        orderBy?: ExpenseGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ExpenseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetExpenseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ExpenseFieldRefs;
}
export interface Prisma__ExpenseClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    category<T extends Prisma.ExpenseCategoryDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ExpenseCategoryDefaultArgs<ExtArgs>>): Prisma.Prisma__ExpenseCategoryClient<runtime.Types.Result.GetResult<Prisma.$ExpenseCategoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    transaction<T extends Prisma.TransactionDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TransactionDefaultArgs<ExtArgs>>): Prisma.Prisma__TransactionClient<runtime.Types.Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    store<T extends Prisma.StoreDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.StoreDefaultArgs<ExtArgs>>): Prisma.Prisma__StoreClient<runtime.Types.Result.GetResult<Prisma.$StorePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    items<T extends Prisma.Expense$itemsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Expense$itemsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ExpenseItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ExpenseFieldRefs {
    readonly id: Prisma.FieldRef<"Expense", 'String'>;
    readonly transactionId: Prisma.FieldRef<"Expense", 'String'>;
    readonly storeId: Prisma.FieldRef<"Expense", 'String'>;
    readonly categoryId: Prisma.FieldRef<"Expense", 'String'>;
    readonly description: Prisma.FieldRef<"Expense", 'String'>;
    readonly createdAt: Prisma.FieldRef<"Expense", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Expense", 'DateTime'>;
}
export type ExpenseFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExpenseSelect<ExtArgs> | null;
    omit?: Prisma.ExpenseOmit<ExtArgs> | null;
    include?: Prisma.ExpenseInclude<ExtArgs> | null;
    where: Prisma.ExpenseWhereUniqueInput;
};
export type ExpenseFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExpenseSelect<ExtArgs> | null;
    omit?: Prisma.ExpenseOmit<ExtArgs> | null;
    include?: Prisma.ExpenseInclude<ExtArgs> | null;
    where: Prisma.ExpenseWhereUniqueInput;
};
export type ExpenseFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExpenseSelect<ExtArgs> | null;
    omit?: Prisma.ExpenseOmit<ExtArgs> | null;
    include?: Prisma.ExpenseInclude<ExtArgs> | null;
    where?: Prisma.ExpenseWhereInput;
    orderBy?: Prisma.ExpenseOrderByWithRelationInput | Prisma.ExpenseOrderByWithRelationInput[];
    cursor?: Prisma.ExpenseWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ExpenseScalarFieldEnum | Prisma.ExpenseScalarFieldEnum[];
};
export type ExpenseFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExpenseSelect<ExtArgs> | null;
    omit?: Prisma.ExpenseOmit<ExtArgs> | null;
    include?: Prisma.ExpenseInclude<ExtArgs> | null;
    where?: Prisma.ExpenseWhereInput;
    orderBy?: Prisma.ExpenseOrderByWithRelationInput | Prisma.ExpenseOrderByWithRelationInput[];
    cursor?: Prisma.ExpenseWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ExpenseScalarFieldEnum | Prisma.ExpenseScalarFieldEnum[];
};
export type ExpenseFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExpenseSelect<ExtArgs> | null;
    omit?: Prisma.ExpenseOmit<ExtArgs> | null;
    include?: Prisma.ExpenseInclude<ExtArgs> | null;
    where?: Prisma.ExpenseWhereInput;
    orderBy?: Prisma.ExpenseOrderByWithRelationInput | Prisma.ExpenseOrderByWithRelationInput[];
    cursor?: Prisma.ExpenseWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ExpenseScalarFieldEnum | Prisma.ExpenseScalarFieldEnum[];
};
export type ExpenseCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExpenseSelect<ExtArgs> | null;
    omit?: Prisma.ExpenseOmit<ExtArgs> | null;
    include?: Prisma.ExpenseInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ExpenseCreateInput, Prisma.ExpenseUncheckedCreateInput>;
};
export type ExpenseCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ExpenseCreateManyInput | Prisma.ExpenseCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ExpenseCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExpenseSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ExpenseOmit<ExtArgs> | null;
    data: Prisma.ExpenseCreateManyInput | Prisma.ExpenseCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ExpenseIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ExpenseUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExpenseSelect<ExtArgs> | null;
    omit?: Prisma.ExpenseOmit<ExtArgs> | null;
    include?: Prisma.ExpenseInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ExpenseUpdateInput, Prisma.ExpenseUncheckedUpdateInput>;
    where: Prisma.ExpenseWhereUniqueInput;
};
export type ExpenseUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ExpenseUpdateManyMutationInput, Prisma.ExpenseUncheckedUpdateManyInput>;
    where?: Prisma.ExpenseWhereInput;
    limit?: number;
};
export type ExpenseUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExpenseSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ExpenseOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ExpenseUpdateManyMutationInput, Prisma.ExpenseUncheckedUpdateManyInput>;
    where?: Prisma.ExpenseWhereInput;
    limit?: number;
    include?: Prisma.ExpenseIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ExpenseUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExpenseSelect<ExtArgs> | null;
    omit?: Prisma.ExpenseOmit<ExtArgs> | null;
    include?: Prisma.ExpenseInclude<ExtArgs> | null;
    where: Prisma.ExpenseWhereUniqueInput;
    create: Prisma.XOR<Prisma.ExpenseCreateInput, Prisma.ExpenseUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ExpenseUpdateInput, Prisma.ExpenseUncheckedUpdateInput>;
};
export type ExpenseDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExpenseSelect<ExtArgs> | null;
    omit?: Prisma.ExpenseOmit<ExtArgs> | null;
    include?: Prisma.ExpenseInclude<ExtArgs> | null;
    where: Prisma.ExpenseWhereUniqueInput;
};
export type ExpenseDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ExpenseWhereInput;
    limit?: number;
};
export type Expense$itemsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ExpenseDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ExpenseSelect<ExtArgs> | null;
    omit?: Prisma.ExpenseOmit<ExtArgs> | null;
    include?: Prisma.ExpenseInclude<ExtArgs> | null;
};
export {};
