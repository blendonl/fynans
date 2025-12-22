import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
export type StoreItemCategoryModel = runtime.Types.Result.DefaultSelection<Prisma.$StoreItemCategoryPayload>;
export type AggregateStoreItemCategory = {
    _count: StoreItemCategoryCountAggregateOutputType | null;
    _min: StoreItemCategoryMinAggregateOutputType | null;
    _max: StoreItemCategoryMaxAggregateOutputType | null;
};
export type StoreItemCategoryMinAggregateOutputType = {
    id: string | null;
    parentId: string | null;
    name: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type StoreItemCategoryMaxAggregateOutputType = {
    id: string | null;
    parentId: string | null;
    name: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type StoreItemCategoryCountAggregateOutputType = {
    id: number;
    parentId: number;
    name: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type StoreItemCategoryMinAggregateInputType = {
    id?: true;
    parentId?: true;
    name?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type StoreItemCategoryMaxAggregateInputType = {
    id?: true;
    parentId?: true;
    name?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type StoreItemCategoryCountAggregateInputType = {
    id?: true;
    parentId?: true;
    name?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type StoreItemCategoryAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.StoreItemCategoryWhereInput;
    orderBy?: Prisma.StoreItemCategoryOrderByWithRelationInput | Prisma.StoreItemCategoryOrderByWithRelationInput[];
    cursor?: Prisma.StoreItemCategoryWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | StoreItemCategoryCountAggregateInputType;
    _min?: StoreItemCategoryMinAggregateInputType;
    _max?: StoreItemCategoryMaxAggregateInputType;
};
export type GetStoreItemCategoryAggregateType<T extends StoreItemCategoryAggregateArgs> = {
    [P in keyof T & keyof AggregateStoreItemCategory]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateStoreItemCategory[P]> : Prisma.GetScalarType<T[P], AggregateStoreItemCategory[P]>;
};
export type StoreItemCategoryGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.StoreItemCategoryWhereInput;
    orderBy?: Prisma.StoreItemCategoryOrderByWithAggregationInput | Prisma.StoreItemCategoryOrderByWithAggregationInput[];
    by: Prisma.StoreItemCategoryScalarFieldEnum[] | Prisma.StoreItemCategoryScalarFieldEnum;
    having?: Prisma.StoreItemCategoryScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: StoreItemCategoryCountAggregateInputType | true;
    _min?: StoreItemCategoryMinAggregateInputType;
    _max?: StoreItemCategoryMaxAggregateInputType;
};
export type StoreItemCategoryGroupByOutputType = {
    id: string;
    parentId: string | null;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    _count: StoreItemCategoryCountAggregateOutputType | null;
    _min: StoreItemCategoryMinAggregateOutputType | null;
    _max: StoreItemCategoryMaxAggregateOutputType | null;
};
type GetStoreItemCategoryGroupByPayload<T extends StoreItemCategoryGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<StoreItemCategoryGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof StoreItemCategoryGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], StoreItemCategoryGroupByOutputType[P]> : Prisma.GetScalarType<T[P], StoreItemCategoryGroupByOutputType[P]>;
}>>;
export type StoreItemCategoryWhereInput = {
    AND?: Prisma.StoreItemCategoryWhereInput | Prisma.StoreItemCategoryWhereInput[];
    OR?: Prisma.StoreItemCategoryWhereInput[];
    NOT?: Prisma.StoreItemCategoryWhereInput | Prisma.StoreItemCategoryWhereInput[];
    id?: Prisma.StringFilter<"StoreItemCategory"> | string;
    parentId?: Prisma.StringNullableFilter<"StoreItemCategory"> | string | null;
    name?: Prisma.StringFilter<"StoreItemCategory"> | string;
    createdAt?: Prisma.DateTimeFilter<"StoreItemCategory"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"StoreItemCategory"> | Date | string;
    parent?: Prisma.XOR<Prisma.StoreItemCategoryNullableScalarRelationFilter, Prisma.StoreItemCategoryWhereInput> | null;
    children?: Prisma.StoreItemCategoryListRelationFilter;
    items?: Prisma.StoreItemListRelationFilter;
};
export type StoreItemCategoryOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    parentId?: Prisma.SortOrderInput | Prisma.SortOrder;
    name?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    parent?: Prisma.StoreItemCategoryOrderByWithRelationInput;
    children?: Prisma.StoreItemCategoryOrderByRelationAggregateInput;
    items?: Prisma.StoreItemOrderByRelationAggregateInput;
};
export type StoreItemCategoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.StoreItemCategoryWhereInput | Prisma.StoreItemCategoryWhereInput[];
    OR?: Prisma.StoreItemCategoryWhereInput[];
    NOT?: Prisma.StoreItemCategoryWhereInput | Prisma.StoreItemCategoryWhereInput[];
    parentId?: Prisma.StringNullableFilter<"StoreItemCategory"> | string | null;
    name?: Prisma.StringFilter<"StoreItemCategory"> | string;
    createdAt?: Prisma.DateTimeFilter<"StoreItemCategory"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"StoreItemCategory"> | Date | string;
    parent?: Prisma.XOR<Prisma.StoreItemCategoryNullableScalarRelationFilter, Prisma.StoreItemCategoryWhereInput> | null;
    children?: Prisma.StoreItemCategoryListRelationFilter;
    items?: Prisma.StoreItemListRelationFilter;
}, "id">;
export type StoreItemCategoryOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    parentId?: Prisma.SortOrderInput | Prisma.SortOrder;
    name?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.StoreItemCategoryCountOrderByAggregateInput;
    _max?: Prisma.StoreItemCategoryMaxOrderByAggregateInput;
    _min?: Prisma.StoreItemCategoryMinOrderByAggregateInput;
};
export type StoreItemCategoryScalarWhereWithAggregatesInput = {
    AND?: Prisma.StoreItemCategoryScalarWhereWithAggregatesInput | Prisma.StoreItemCategoryScalarWhereWithAggregatesInput[];
    OR?: Prisma.StoreItemCategoryScalarWhereWithAggregatesInput[];
    NOT?: Prisma.StoreItemCategoryScalarWhereWithAggregatesInput | Prisma.StoreItemCategoryScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"StoreItemCategory"> | string;
    parentId?: Prisma.StringNullableWithAggregatesFilter<"StoreItemCategory"> | string | null;
    name?: Prisma.StringWithAggregatesFilter<"StoreItemCategory"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"StoreItemCategory"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"StoreItemCategory"> | Date | string;
};
export type StoreItemCategoryCreateInput = {
    id?: string;
    name: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    parent?: Prisma.StoreItemCategoryCreateNestedOneWithoutChildrenInput;
    children?: Prisma.StoreItemCategoryCreateNestedManyWithoutParentInput;
    items?: Prisma.StoreItemCreateNestedManyWithoutCategoryInput;
};
export type StoreItemCategoryUncheckedCreateInput = {
    id?: string;
    parentId?: string | null;
    name: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    children?: Prisma.StoreItemCategoryUncheckedCreateNestedManyWithoutParentInput;
    items?: Prisma.StoreItemUncheckedCreateNestedManyWithoutCategoryInput;
};
export type StoreItemCategoryUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    parent?: Prisma.StoreItemCategoryUpdateOneWithoutChildrenNestedInput;
    children?: Prisma.StoreItemCategoryUpdateManyWithoutParentNestedInput;
    items?: Prisma.StoreItemUpdateManyWithoutCategoryNestedInput;
};
export type StoreItemCategoryUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    parentId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    children?: Prisma.StoreItemCategoryUncheckedUpdateManyWithoutParentNestedInput;
    items?: Prisma.StoreItemUncheckedUpdateManyWithoutCategoryNestedInput;
};
export type StoreItemCategoryCreateManyInput = {
    id?: string;
    parentId?: string | null;
    name: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type StoreItemCategoryUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type StoreItemCategoryUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    parentId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type StoreItemCategoryScalarRelationFilter = {
    is?: Prisma.StoreItemCategoryWhereInput;
    isNot?: Prisma.StoreItemCategoryWhereInput;
};
export type StoreItemCategoryNullableScalarRelationFilter = {
    is?: Prisma.StoreItemCategoryWhereInput | null;
    isNot?: Prisma.StoreItemCategoryWhereInput | null;
};
export type StoreItemCategoryListRelationFilter = {
    every?: Prisma.StoreItemCategoryWhereInput;
    some?: Prisma.StoreItemCategoryWhereInput;
    none?: Prisma.StoreItemCategoryWhereInput;
};
export type StoreItemCategoryOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type StoreItemCategoryCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    parentId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type StoreItemCategoryMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    parentId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type StoreItemCategoryMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    parentId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type StoreItemCategoryCreateNestedOneWithoutItemsInput = {
    create?: Prisma.XOR<Prisma.StoreItemCategoryCreateWithoutItemsInput, Prisma.StoreItemCategoryUncheckedCreateWithoutItemsInput>;
    connectOrCreate?: Prisma.StoreItemCategoryCreateOrConnectWithoutItemsInput;
    connect?: Prisma.StoreItemCategoryWhereUniqueInput;
};
export type StoreItemCategoryUpdateOneRequiredWithoutItemsNestedInput = {
    create?: Prisma.XOR<Prisma.StoreItemCategoryCreateWithoutItemsInput, Prisma.StoreItemCategoryUncheckedCreateWithoutItemsInput>;
    connectOrCreate?: Prisma.StoreItemCategoryCreateOrConnectWithoutItemsInput;
    upsert?: Prisma.StoreItemCategoryUpsertWithoutItemsInput;
    connect?: Prisma.StoreItemCategoryWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.StoreItemCategoryUpdateToOneWithWhereWithoutItemsInput, Prisma.StoreItemCategoryUpdateWithoutItemsInput>, Prisma.StoreItemCategoryUncheckedUpdateWithoutItemsInput>;
};
export type StoreItemCategoryCreateNestedOneWithoutChildrenInput = {
    create?: Prisma.XOR<Prisma.StoreItemCategoryCreateWithoutChildrenInput, Prisma.StoreItemCategoryUncheckedCreateWithoutChildrenInput>;
    connectOrCreate?: Prisma.StoreItemCategoryCreateOrConnectWithoutChildrenInput;
    connect?: Prisma.StoreItemCategoryWhereUniqueInput;
};
export type StoreItemCategoryCreateNestedManyWithoutParentInput = {
    create?: Prisma.XOR<Prisma.StoreItemCategoryCreateWithoutParentInput, Prisma.StoreItemCategoryUncheckedCreateWithoutParentInput> | Prisma.StoreItemCategoryCreateWithoutParentInput[] | Prisma.StoreItemCategoryUncheckedCreateWithoutParentInput[];
    connectOrCreate?: Prisma.StoreItemCategoryCreateOrConnectWithoutParentInput | Prisma.StoreItemCategoryCreateOrConnectWithoutParentInput[];
    createMany?: Prisma.StoreItemCategoryCreateManyParentInputEnvelope;
    connect?: Prisma.StoreItemCategoryWhereUniqueInput | Prisma.StoreItemCategoryWhereUniqueInput[];
};
export type StoreItemCategoryUncheckedCreateNestedManyWithoutParentInput = {
    create?: Prisma.XOR<Prisma.StoreItemCategoryCreateWithoutParentInput, Prisma.StoreItemCategoryUncheckedCreateWithoutParentInput> | Prisma.StoreItemCategoryCreateWithoutParentInput[] | Prisma.StoreItemCategoryUncheckedCreateWithoutParentInput[];
    connectOrCreate?: Prisma.StoreItemCategoryCreateOrConnectWithoutParentInput | Prisma.StoreItemCategoryCreateOrConnectWithoutParentInput[];
    createMany?: Prisma.StoreItemCategoryCreateManyParentInputEnvelope;
    connect?: Prisma.StoreItemCategoryWhereUniqueInput | Prisma.StoreItemCategoryWhereUniqueInput[];
};
export type StoreItemCategoryUpdateOneWithoutChildrenNestedInput = {
    create?: Prisma.XOR<Prisma.StoreItemCategoryCreateWithoutChildrenInput, Prisma.StoreItemCategoryUncheckedCreateWithoutChildrenInput>;
    connectOrCreate?: Prisma.StoreItemCategoryCreateOrConnectWithoutChildrenInput;
    upsert?: Prisma.StoreItemCategoryUpsertWithoutChildrenInput;
    disconnect?: Prisma.StoreItemCategoryWhereInput | boolean;
    delete?: Prisma.StoreItemCategoryWhereInput | boolean;
    connect?: Prisma.StoreItemCategoryWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.StoreItemCategoryUpdateToOneWithWhereWithoutChildrenInput, Prisma.StoreItemCategoryUpdateWithoutChildrenInput>, Prisma.StoreItemCategoryUncheckedUpdateWithoutChildrenInput>;
};
export type StoreItemCategoryUpdateManyWithoutParentNestedInput = {
    create?: Prisma.XOR<Prisma.StoreItemCategoryCreateWithoutParentInput, Prisma.StoreItemCategoryUncheckedCreateWithoutParentInput> | Prisma.StoreItemCategoryCreateWithoutParentInput[] | Prisma.StoreItemCategoryUncheckedCreateWithoutParentInput[];
    connectOrCreate?: Prisma.StoreItemCategoryCreateOrConnectWithoutParentInput | Prisma.StoreItemCategoryCreateOrConnectWithoutParentInput[];
    upsert?: Prisma.StoreItemCategoryUpsertWithWhereUniqueWithoutParentInput | Prisma.StoreItemCategoryUpsertWithWhereUniqueWithoutParentInput[];
    createMany?: Prisma.StoreItemCategoryCreateManyParentInputEnvelope;
    set?: Prisma.StoreItemCategoryWhereUniqueInput | Prisma.StoreItemCategoryWhereUniqueInput[];
    disconnect?: Prisma.StoreItemCategoryWhereUniqueInput | Prisma.StoreItemCategoryWhereUniqueInput[];
    delete?: Prisma.StoreItemCategoryWhereUniqueInput | Prisma.StoreItemCategoryWhereUniqueInput[];
    connect?: Prisma.StoreItemCategoryWhereUniqueInput | Prisma.StoreItemCategoryWhereUniqueInput[];
    update?: Prisma.StoreItemCategoryUpdateWithWhereUniqueWithoutParentInput | Prisma.StoreItemCategoryUpdateWithWhereUniqueWithoutParentInput[];
    updateMany?: Prisma.StoreItemCategoryUpdateManyWithWhereWithoutParentInput | Prisma.StoreItemCategoryUpdateManyWithWhereWithoutParentInput[];
    deleteMany?: Prisma.StoreItemCategoryScalarWhereInput | Prisma.StoreItemCategoryScalarWhereInput[];
};
export type StoreItemCategoryUncheckedUpdateManyWithoutParentNestedInput = {
    create?: Prisma.XOR<Prisma.StoreItemCategoryCreateWithoutParentInput, Prisma.StoreItemCategoryUncheckedCreateWithoutParentInput> | Prisma.StoreItemCategoryCreateWithoutParentInput[] | Prisma.StoreItemCategoryUncheckedCreateWithoutParentInput[];
    connectOrCreate?: Prisma.StoreItemCategoryCreateOrConnectWithoutParentInput | Prisma.StoreItemCategoryCreateOrConnectWithoutParentInput[];
    upsert?: Prisma.StoreItemCategoryUpsertWithWhereUniqueWithoutParentInput | Prisma.StoreItemCategoryUpsertWithWhereUniqueWithoutParentInput[];
    createMany?: Prisma.StoreItemCategoryCreateManyParentInputEnvelope;
    set?: Prisma.StoreItemCategoryWhereUniqueInput | Prisma.StoreItemCategoryWhereUniqueInput[];
    disconnect?: Prisma.StoreItemCategoryWhereUniqueInput | Prisma.StoreItemCategoryWhereUniqueInput[];
    delete?: Prisma.StoreItemCategoryWhereUniqueInput | Prisma.StoreItemCategoryWhereUniqueInput[];
    connect?: Prisma.StoreItemCategoryWhereUniqueInput | Prisma.StoreItemCategoryWhereUniqueInput[];
    update?: Prisma.StoreItemCategoryUpdateWithWhereUniqueWithoutParentInput | Prisma.StoreItemCategoryUpdateWithWhereUniqueWithoutParentInput[];
    updateMany?: Prisma.StoreItemCategoryUpdateManyWithWhereWithoutParentInput | Prisma.StoreItemCategoryUpdateManyWithWhereWithoutParentInput[];
    deleteMany?: Prisma.StoreItemCategoryScalarWhereInput | Prisma.StoreItemCategoryScalarWhereInput[];
};
export type StoreItemCategoryCreateWithoutItemsInput = {
    id?: string;
    name: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    parent?: Prisma.StoreItemCategoryCreateNestedOneWithoutChildrenInput;
    children?: Prisma.StoreItemCategoryCreateNestedManyWithoutParentInput;
};
export type StoreItemCategoryUncheckedCreateWithoutItemsInput = {
    id?: string;
    parentId?: string | null;
    name: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    children?: Prisma.StoreItemCategoryUncheckedCreateNestedManyWithoutParentInput;
};
export type StoreItemCategoryCreateOrConnectWithoutItemsInput = {
    where: Prisma.StoreItemCategoryWhereUniqueInput;
    create: Prisma.XOR<Prisma.StoreItemCategoryCreateWithoutItemsInput, Prisma.StoreItemCategoryUncheckedCreateWithoutItemsInput>;
};
export type StoreItemCategoryUpsertWithoutItemsInput = {
    update: Prisma.XOR<Prisma.StoreItemCategoryUpdateWithoutItemsInput, Prisma.StoreItemCategoryUncheckedUpdateWithoutItemsInput>;
    create: Prisma.XOR<Prisma.StoreItemCategoryCreateWithoutItemsInput, Prisma.StoreItemCategoryUncheckedCreateWithoutItemsInput>;
    where?: Prisma.StoreItemCategoryWhereInput;
};
export type StoreItemCategoryUpdateToOneWithWhereWithoutItemsInput = {
    where?: Prisma.StoreItemCategoryWhereInput;
    data: Prisma.XOR<Prisma.StoreItemCategoryUpdateWithoutItemsInput, Prisma.StoreItemCategoryUncheckedUpdateWithoutItemsInput>;
};
export type StoreItemCategoryUpdateWithoutItemsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    parent?: Prisma.StoreItemCategoryUpdateOneWithoutChildrenNestedInput;
    children?: Prisma.StoreItemCategoryUpdateManyWithoutParentNestedInput;
};
export type StoreItemCategoryUncheckedUpdateWithoutItemsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    parentId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    children?: Prisma.StoreItemCategoryUncheckedUpdateManyWithoutParentNestedInput;
};
export type StoreItemCategoryCreateWithoutChildrenInput = {
    id?: string;
    name: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    parent?: Prisma.StoreItemCategoryCreateNestedOneWithoutChildrenInput;
    items?: Prisma.StoreItemCreateNestedManyWithoutCategoryInput;
};
export type StoreItemCategoryUncheckedCreateWithoutChildrenInput = {
    id?: string;
    parentId?: string | null;
    name: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    items?: Prisma.StoreItemUncheckedCreateNestedManyWithoutCategoryInput;
};
export type StoreItemCategoryCreateOrConnectWithoutChildrenInput = {
    where: Prisma.StoreItemCategoryWhereUniqueInput;
    create: Prisma.XOR<Prisma.StoreItemCategoryCreateWithoutChildrenInput, Prisma.StoreItemCategoryUncheckedCreateWithoutChildrenInput>;
};
export type StoreItemCategoryCreateWithoutParentInput = {
    id?: string;
    name: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    children?: Prisma.StoreItemCategoryCreateNestedManyWithoutParentInput;
    items?: Prisma.StoreItemCreateNestedManyWithoutCategoryInput;
};
export type StoreItemCategoryUncheckedCreateWithoutParentInput = {
    id?: string;
    name: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    children?: Prisma.StoreItemCategoryUncheckedCreateNestedManyWithoutParentInput;
    items?: Prisma.StoreItemUncheckedCreateNestedManyWithoutCategoryInput;
};
export type StoreItemCategoryCreateOrConnectWithoutParentInput = {
    where: Prisma.StoreItemCategoryWhereUniqueInput;
    create: Prisma.XOR<Prisma.StoreItemCategoryCreateWithoutParentInput, Prisma.StoreItemCategoryUncheckedCreateWithoutParentInput>;
};
export type StoreItemCategoryCreateManyParentInputEnvelope = {
    data: Prisma.StoreItemCategoryCreateManyParentInput | Prisma.StoreItemCategoryCreateManyParentInput[];
    skipDuplicates?: boolean;
};
export type StoreItemCategoryUpsertWithoutChildrenInput = {
    update: Prisma.XOR<Prisma.StoreItemCategoryUpdateWithoutChildrenInput, Prisma.StoreItemCategoryUncheckedUpdateWithoutChildrenInput>;
    create: Prisma.XOR<Prisma.StoreItemCategoryCreateWithoutChildrenInput, Prisma.StoreItemCategoryUncheckedCreateWithoutChildrenInput>;
    where?: Prisma.StoreItemCategoryWhereInput;
};
export type StoreItemCategoryUpdateToOneWithWhereWithoutChildrenInput = {
    where?: Prisma.StoreItemCategoryWhereInput;
    data: Prisma.XOR<Prisma.StoreItemCategoryUpdateWithoutChildrenInput, Prisma.StoreItemCategoryUncheckedUpdateWithoutChildrenInput>;
};
export type StoreItemCategoryUpdateWithoutChildrenInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    parent?: Prisma.StoreItemCategoryUpdateOneWithoutChildrenNestedInput;
    items?: Prisma.StoreItemUpdateManyWithoutCategoryNestedInput;
};
export type StoreItemCategoryUncheckedUpdateWithoutChildrenInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    parentId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    items?: Prisma.StoreItemUncheckedUpdateManyWithoutCategoryNestedInput;
};
export type StoreItemCategoryUpsertWithWhereUniqueWithoutParentInput = {
    where: Prisma.StoreItemCategoryWhereUniqueInput;
    update: Prisma.XOR<Prisma.StoreItemCategoryUpdateWithoutParentInput, Prisma.StoreItemCategoryUncheckedUpdateWithoutParentInput>;
    create: Prisma.XOR<Prisma.StoreItemCategoryCreateWithoutParentInput, Prisma.StoreItemCategoryUncheckedCreateWithoutParentInput>;
};
export type StoreItemCategoryUpdateWithWhereUniqueWithoutParentInput = {
    where: Prisma.StoreItemCategoryWhereUniqueInput;
    data: Prisma.XOR<Prisma.StoreItemCategoryUpdateWithoutParentInput, Prisma.StoreItemCategoryUncheckedUpdateWithoutParentInput>;
};
export type StoreItemCategoryUpdateManyWithWhereWithoutParentInput = {
    where: Prisma.StoreItemCategoryScalarWhereInput;
    data: Prisma.XOR<Prisma.StoreItemCategoryUpdateManyMutationInput, Prisma.StoreItemCategoryUncheckedUpdateManyWithoutParentInput>;
};
export type StoreItemCategoryScalarWhereInput = {
    AND?: Prisma.StoreItemCategoryScalarWhereInput | Prisma.StoreItemCategoryScalarWhereInput[];
    OR?: Prisma.StoreItemCategoryScalarWhereInput[];
    NOT?: Prisma.StoreItemCategoryScalarWhereInput | Prisma.StoreItemCategoryScalarWhereInput[];
    id?: Prisma.StringFilter<"StoreItemCategory"> | string;
    parentId?: Prisma.StringNullableFilter<"StoreItemCategory"> | string | null;
    name?: Prisma.StringFilter<"StoreItemCategory"> | string;
    createdAt?: Prisma.DateTimeFilter<"StoreItemCategory"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"StoreItemCategory"> | Date | string;
};
export type StoreItemCategoryCreateManyParentInput = {
    id?: string;
    name: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type StoreItemCategoryUpdateWithoutParentInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    children?: Prisma.StoreItemCategoryUpdateManyWithoutParentNestedInput;
    items?: Prisma.StoreItemUpdateManyWithoutCategoryNestedInput;
};
export type StoreItemCategoryUncheckedUpdateWithoutParentInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    children?: Prisma.StoreItemCategoryUncheckedUpdateManyWithoutParentNestedInput;
    items?: Prisma.StoreItemUncheckedUpdateManyWithoutCategoryNestedInput;
};
export type StoreItemCategoryUncheckedUpdateManyWithoutParentInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type StoreItemCategoryCountOutputType = {
    children: number;
    items: number;
};
export type StoreItemCategoryCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    children?: boolean | StoreItemCategoryCountOutputTypeCountChildrenArgs;
    items?: boolean | StoreItemCategoryCountOutputTypeCountItemsArgs;
};
export type StoreItemCategoryCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StoreItemCategoryCountOutputTypeSelect<ExtArgs> | null;
};
export type StoreItemCategoryCountOutputTypeCountChildrenArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.StoreItemCategoryWhereInput;
};
export type StoreItemCategoryCountOutputTypeCountItemsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.StoreItemWhereInput;
};
export type StoreItemCategorySelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    parentId?: boolean;
    name?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    parent?: boolean | Prisma.StoreItemCategory$parentArgs<ExtArgs>;
    children?: boolean | Prisma.StoreItemCategory$childrenArgs<ExtArgs>;
    items?: boolean | Prisma.StoreItemCategory$itemsArgs<ExtArgs>;
    _count?: boolean | Prisma.StoreItemCategoryCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["storeItemCategory"]>;
export type StoreItemCategorySelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    parentId?: boolean;
    name?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    parent?: boolean | Prisma.StoreItemCategory$parentArgs<ExtArgs>;
}, ExtArgs["result"]["storeItemCategory"]>;
export type StoreItemCategorySelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    parentId?: boolean;
    name?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    parent?: boolean | Prisma.StoreItemCategory$parentArgs<ExtArgs>;
}, ExtArgs["result"]["storeItemCategory"]>;
export type StoreItemCategorySelectScalar = {
    id?: boolean;
    parentId?: boolean;
    name?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type StoreItemCategoryOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "parentId" | "name" | "createdAt" | "updatedAt", ExtArgs["result"]["storeItemCategory"]>;
export type StoreItemCategoryInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    parent?: boolean | Prisma.StoreItemCategory$parentArgs<ExtArgs>;
    children?: boolean | Prisma.StoreItemCategory$childrenArgs<ExtArgs>;
    items?: boolean | Prisma.StoreItemCategory$itemsArgs<ExtArgs>;
    _count?: boolean | Prisma.StoreItemCategoryCountOutputTypeDefaultArgs<ExtArgs>;
};
export type StoreItemCategoryIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    parent?: boolean | Prisma.StoreItemCategory$parentArgs<ExtArgs>;
};
export type StoreItemCategoryIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    parent?: boolean | Prisma.StoreItemCategory$parentArgs<ExtArgs>;
};
export type $StoreItemCategoryPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "StoreItemCategory";
    objects: {
        parent: Prisma.$StoreItemCategoryPayload<ExtArgs> | null;
        children: Prisma.$StoreItemCategoryPayload<ExtArgs>[];
        items: Prisma.$StoreItemPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        parentId: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["storeItemCategory"]>;
    composites: {};
};
export type StoreItemCategoryGetPayload<S extends boolean | null | undefined | StoreItemCategoryDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$StoreItemCategoryPayload, S>;
export type StoreItemCategoryCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<StoreItemCategoryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: StoreItemCategoryCountAggregateInputType | true;
};
export interface StoreItemCategoryDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['StoreItemCategory'];
        meta: {
            name: 'StoreItemCategory';
        };
    };
    findUnique<T extends StoreItemCategoryFindUniqueArgs>(args: Prisma.SelectSubset<T, StoreItemCategoryFindUniqueArgs<ExtArgs>>): Prisma.Prisma__StoreItemCategoryClient<runtime.Types.Result.GetResult<Prisma.$StoreItemCategoryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends StoreItemCategoryFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, StoreItemCategoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__StoreItemCategoryClient<runtime.Types.Result.GetResult<Prisma.$StoreItemCategoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends StoreItemCategoryFindFirstArgs>(args?: Prisma.SelectSubset<T, StoreItemCategoryFindFirstArgs<ExtArgs>>): Prisma.Prisma__StoreItemCategoryClient<runtime.Types.Result.GetResult<Prisma.$StoreItemCategoryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends StoreItemCategoryFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, StoreItemCategoryFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__StoreItemCategoryClient<runtime.Types.Result.GetResult<Prisma.$StoreItemCategoryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends StoreItemCategoryFindManyArgs>(args?: Prisma.SelectSubset<T, StoreItemCategoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$StoreItemCategoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends StoreItemCategoryCreateArgs>(args: Prisma.SelectSubset<T, StoreItemCategoryCreateArgs<ExtArgs>>): Prisma.Prisma__StoreItemCategoryClient<runtime.Types.Result.GetResult<Prisma.$StoreItemCategoryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends StoreItemCategoryCreateManyArgs>(args?: Prisma.SelectSubset<T, StoreItemCategoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends StoreItemCategoryCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, StoreItemCategoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$StoreItemCategoryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends StoreItemCategoryDeleteArgs>(args: Prisma.SelectSubset<T, StoreItemCategoryDeleteArgs<ExtArgs>>): Prisma.Prisma__StoreItemCategoryClient<runtime.Types.Result.GetResult<Prisma.$StoreItemCategoryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends StoreItemCategoryUpdateArgs>(args: Prisma.SelectSubset<T, StoreItemCategoryUpdateArgs<ExtArgs>>): Prisma.Prisma__StoreItemCategoryClient<runtime.Types.Result.GetResult<Prisma.$StoreItemCategoryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends StoreItemCategoryDeleteManyArgs>(args?: Prisma.SelectSubset<T, StoreItemCategoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends StoreItemCategoryUpdateManyArgs>(args: Prisma.SelectSubset<T, StoreItemCategoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends StoreItemCategoryUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, StoreItemCategoryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$StoreItemCategoryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends StoreItemCategoryUpsertArgs>(args: Prisma.SelectSubset<T, StoreItemCategoryUpsertArgs<ExtArgs>>): Prisma.Prisma__StoreItemCategoryClient<runtime.Types.Result.GetResult<Prisma.$StoreItemCategoryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends StoreItemCategoryCountArgs>(args?: Prisma.Subset<T, StoreItemCategoryCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], StoreItemCategoryCountAggregateOutputType> : number>;
    aggregate<T extends StoreItemCategoryAggregateArgs>(args: Prisma.Subset<T, StoreItemCategoryAggregateArgs>): Prisma.PrismaPromise<GetStoreItemCategoryAggregateType<T>>;
    groupBy<T extends StoreItemCategoryGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: StoreItemCategoryGroupByArgs['orderBy'];
    } : {
        orderBy?: StoreItemCategoryGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, StoreItemCategoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStoreItemCategoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: StoreItemCategoryFieldRefs;
}
export interface Prisma__StoreItemCategoryClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    parent<T extends Prisma.StoreItemCategory$parentArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.StoreItemCategory$parentArgs<ExtArgs>>): Prisma.Prisma__StoreItemCategoryClient<runtime.Types.Result.GetResult<Prisma.$StoreItemCategoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    children<T extends Prisma.StoreItemCategory$childrenArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.StoreItemCategory$childrenArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$StoreItemCategoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    items<T extends Prisma.StoreItemCategory$itemsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.StoreItemCategory$itemsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$StoreItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface StoreItemCategoryFieldRefs {
    readonly id: Prisma.FieldRef<"StoreItemCategory", 'String'>;
    readonly parentId: Prisma.FieldRef<"StoreItemCategory", 'String'>;
    readonly name: Prisma.FieldRef<"StoreItemCategory", 'String'>;
    readonly createdAt: Prisma.FieldRef<"StoreItemCategory", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"StoreItemCategory", 'DateTime'>;
}
export type StoreItemCategoryFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StoreItemCategorySelect<ExtArgs> | null;
    omit?: Prisma.StoreItemCategoryOmit<ExtArgs> | null;
    include?: Prisma.StoreItemCategoryInclude<ExtArgs> | null;
    where: Prisma.StoreItemCategoryWhereUniqueInput;
};
export type StoreItemCategoryFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StoreItemCategorySelect<ExtArgs> | null;
    omit?: Prisma.StoreItemCategoryOmit<ExtArgs> | null;
    include?: Prisma.StoreItemCategoryInclude<ExtArgs> | null;
    where: Prisma.StoreItemCategoryWhereUniqueInput;
};
export type StoreItemCategoryFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StoreItemCategorySelect<ExtArgs> | null;
    omit?: Prisma.StoreItemCategoryOmit<ExtArgs> | null;
    include?: Prisma.StoreItemCategoryInclude<ExtArgs> | null;
    where?: Prisma.StoreItemCategoryWhereInput;
    orderBy?: Prisma.StoreItemCategoryOrderByWithRelationInput | Prisma.StoreItemCategoryOrderByWithRelationInput[];
    cursor?: Prisma.StoreItemCategoryWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.StoreItemCategoryScalarFieldEnum | Prisma.StoreItemCategoryScalarFieldEnum[];
};
export type StoreItemCategoryFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StoreItemCategorySelect<ExtArgs> | null;
    omit?: Prisma.StoreItemCategoryOmit<ExtArgs> | null;
    include?: Prisma.StoreItemCategoryInclude<ExtArgs> | null;
    where?: Prisma.StoreItemCategoryWhereInput;
    orderBy?: Prisma.StoreItemCategoryOrderByWithRelationInput | Prisma.StoreItemCategoryOrderByWithRelationInput[];
    cursor?: Prisma.StoreItemCategoryWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.StoreItemCategoryScalarFieldEnum | Prisma.StoreItemCategoryScalarFieldEnum[];
};
export type StoreItemCategoryFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StoreItemCategorySelect<ExtArgs> | null;
    omit?: Prisma.StoreItemCategoryOmit<ExtArgs> | null;
    include?: Prisma.StoreItemCategoryInclude<ExtArgs> | null;
    where?: Prisma.StoreItemCategoryWhereInput;
    orderBy?: Prisma.StoreItemCategoryOrderByWithRelationInput | Prisma.StoreItemCategoryOrderByWithRelationInput[];
    cursor?: Prisma.StoreItemCategoryWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.StoreItemCategoryScalarFieldEnum | Prisma.StoreItemCategoryScalarFieldEnum[];
};
export type StoreItemCategoryCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StoreItemCategorySelect<ExtArgs> | null;
    omit?: Prisma.StoreItemCategoryOmit<ExtArgs> | null;
    include?: Prisma.StoreItemCategoryInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.StoreItemCategoryCreateInput, Prisma.StoreItemCategoryUncheckedCreateInput>;
};
export type StoreItemCategoryCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.StoreItemCategoryCreateManyInput | Prisma.StoreItemCategoryCreateManyInput[];
    skipDuplicates?: boolean;
};
export type StoreItemCategoryCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StoreItemCategorySelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.StoreItemCategoryOmit<ExtArgs> | null;
    data: Prisma.StoreItemCategoryCreateManyInput | Prisma.StoreItemCategoryCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.StoreItemCategoryIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type StoreItemCategoryUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StoreItemCategorySelect<ExtArgs> | null;
    omit?: Prisma.StoreItemCategoryOmit<ExtArgs> | null;
    include?: Prisma.StoreItemCategoryInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.StoreItemCategoryUpdateInput, Prisma.StoreItemCategoryUncheckedUpdateInput>;
    where: Prisma.StoreItemCategoryWhereUniqueInput;
};
export type StoreItemCategoryUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.StoreItemCategoryUpdateManyMutationInput, Prisma.StoreItemCategoryUncheckedUpdateManyInput>;
    where?: Prisma.StoreItemCategoryWhereInput;
    limit?: number;
};
export type StoreItemCategoryUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StoreItemCategorySelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.StoreItemCategoryOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.StoreItemCategoryUpdateManyMutationInput, Prisma.StoreItemCategoryUncheckedUpdateManyInput>;
    where?: Prisma.StoreItemCategoryWhereInput;
    limit?: number;
    include?: Prisma.StoreItemCategoryIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type StoreItemCategoryUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StoreItemCategorySelect<ExtArgs> | null;
    omit?: Prisma.StoreItemCategoryOmit<ExtArgs> | null;
    include?: Prisma.StoreItemCategoryInclude<ExtArgs> | null;
    where: Prisma.StoreItemCategoryWhereUniqueInput;
    create: Prisma.XOR<Prisma.StoreItemCategoryCreateInput, Prisma.StoreItemCategoryUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.StoreItemCategoryUpdateInput, Prisma.StoreItemCategoryUncheckedUpdateInput>;
};
export type StoreItemCategoryDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StoreItemCategorySelect<ExtArgs> | null;
    omit?: Prisma.StoreItemCategoryOmit<ExtArgs> | null;
    include?: Prisma.StoreItemCategoryInclude<ExtArgs> | null;
    where: Prisma.StoreItemCategoryWhereUniqueInput;
};
export type StoreItemCategoryDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.StoreItemCategoryWhereInput;
    limit?: number;
};
export type StoreItemCategory$parentArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StoreItemCategorySelect<ExtArgs> | null;
    omit?: Prisma.StoreItemCategoryOmit<ExtArgs> | null;
    include?: Prisma.StoreItemCategoryInclude<ExtArgs> | null;
    where?: Prisma.StoreItemCategoryWhereInput;
};
export type StoreItemCategory$childrenArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StoreItemCategorySelect<ExtArgs> | null;
    omit?: Prisma.StoreItemCategoryOmit<ExtArgs> | null;
    include?: Prisma.StoreItemCategoryInclude<ExtArgs> | null;
    where?: Prisma.StoreItemCategoryWhereInput;
    orderBy?: Prisma.StoreItemCategoryOrderByWithRelationInput | Prisma.StoreItemCategoryOrderByWithRelationInput[];
    cursor?: Prisma.StoreItemCategoryWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.StoreItemCategoryScalarFieldEnum | Prisma.StoreItemCategoryScalarFieldEnum[];
};
export type StoreItemCategory$itemsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type StoreItemCategoryDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.StoreItemCategorySelect<ExtArgs> | null;
    omit?: Prisma.StoreItemCategoryOmit<ExtArgs> | null;
    include?: Prisma.StoreItemCategoryInclude<ExtArgs> | null;
};
export {};
