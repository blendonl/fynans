import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
export type NotificationPreferenceModel = runtime.Types.Result.DefaultSelection<Prisma.$NotificationPreferencePayload>;
export type AggregateNotificationPreference = {
    _count: NotificationPreferenceCountAggregateOutputType | null;
    _min: NotificationPreferenceMinAggregateOutputType | null;
    _max: NotificationPreferenceMaxAggregateOutputType | null;
};
export type NotificationPreferenceMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    enablePushNotifications: boolean | null;
    enableInAppNotifications: boolean | null;
    enableToastNotifications: boolean | null;
    quietHoursEnabled: boolean | null;
    quietHoursStart: Date | null;
    quietHoursEnd: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type NotificationPreferenceMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    enablePushNotifications: boolean | null;
    enableInAppNotifications: boolean | null;
    enableToastNotifications: boolean | null;
    quietHoursEnabled: boolean | null;
    quietHoursStart: Date | null;
    quietHoursEnd: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type NotificationPreferenceCountAggregateOutputType = {
    id: number;
    userId: number;
    enablePushNotifications: number;
    enableInAppNotifications: number;
    enableToastNotifications: number;
    quietHoursEnabled: number;
    quietHoursStart: number;
    quietHoursEnd: number;
    typePreferences: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type NotificationPreferenceMinAggregateInputType = {
    id?: true;
    userId?: true;
    enablePushNotifications?: true;
    enableInAppNotifications?: true;
    enableToastNotifications?: true;
    quietHoursEnabled?: true;
    quietHoursStart?: true;
    quietHoursEnd?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type NotificationPreferenceMaxAggregateInputType = {
    id?: true;
    userId?: true;
    enablePushNotifications?: true;
    enableInAppNotifications?: true;
    enableToastNotifications?: true;
    quietHoursEnabled?: true;
    quietHoursStart?: true;
    quietHoursEnd?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type NotificationPreferenceCountAggregateInputType = {
    id?: true;
    userId?: true;
    enablePushNotifications?: true;
    enableInAppNotifications?: true;
    enableToastNotifications?: true;
    quietHoursEnabled?: true;
    quietHoursStart?: true;
    quietHoursEnd?: true;
    typePreferences?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type NotificationPreferenceAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.NotificationPreferenceWhereInput;
    orderBy?: Prisma.NotificationPreferenceOrderByWithRelationInput | Prisma.NotificationPreferenceOrderByWithRelationInput[];
    cursor?: Prisma.NotificationPreferenceWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | NotificationPreferenceCountAggregateInputType;
    _min?: NotificationPreferenceMinAggregateInputType;
    _max?: NotificationPreferenceMaxAggregateInputType;
};
export type GetNotificationPreferenceAggregateType<T extends NotificationPreferenceAggregateArgs> = {
    [P in keyof T & keyof AggregateNotificationPreference]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateNotificationPreference[P]> : Prisma.GetScalarType<T[P], AggregateNotificationPreference[P]>;
};
export type NotificationPreferenceGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.NotificationPreferenceWhereInput;
    orderBy?: Prisma.NotificationPreferenceOrderByWithAggregationInput | Prisma.NotificationPreferenceOrderByWithAggregationInput[];
    by: Prisma.NotificationPreferenceScalarFieldEnum[] | Prisma.NotificationPreferenceScalarFieldEnum;
    having?: Prisma.NotificationPreferenceScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: NotificationPreferenceCountAggregateInputType | true;
    _min?: NotificationPreferenceMinAggregateInputType;
    _max?: NotificationPreferenceMaxAggregateInputType;
};
export type NotificationPreferenceGroupByOutputType = {
    id: string;
    userId: string;
    enablePushNotifications: boolean;
    enableInAppNotifications: boolean;
    enableToastNotifications: boolean;
    quietHoursEnabled: boolean;
    quietHoursStart: Date | null;
    quietHoursEnd: Date | null;
    typePreferences: runtime.JsonValue;
    createdAt: Date;
    updatedAt: Date;
    _count: NotificationPreferenceCountAggregateOutputType | null;
    _min: NotificationPreferenceMinAggregateOutputType | null;
    _max: NotificationPreferenceMaxAggregateOutputType | null;
};
type GetNotificationPreferenceGroupByPayload<T extends NotificationPreferenceGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<NotificationPreferenceGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof NotificationPreferenceGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], NotificationPreferenceGroupByOutputType[P]> : Prisma.GetScalarType<T[P], NotificationPreferenceGroupByOutputType[P]>;
}>>;
export type NotificationPreferenceWhereInput = {
    AND?: Prisma.NotificationPreferenceWhereInput | Prisma.NotificationPreferenceWhereInput[];
    OR?: Prisma.NotificationPreferenceWhereInput[];
    NOT?: Prisma.NotificationPreferenceWhereInput | Prisma.NotificationPreferenceWhereInput[];
    id?: Prisma.StringFilter<"NotificationPreference"> | string;
    userId?: Prisma.StringFilter<"NotificationPreference"> | string;
    enablePushNotifications?: Prisma.BoolFilter<"NotificationPreference"> | boolean;
    enableInAppNotifications?: Prisma.BoolFilter<"NotificationPreference"> | boolean;
    enableToastNotifications?: Prisma.BoolFilter<"NotificationPreference"> | boolean;
    quietHoursEnabled?: Prisma.BoolFilter<"NotificationPreference"> | boolean;
    quietHoursStart?: Prisma.DateTimeNullableFilter<"NotificationPreference"> | Date | string | null;
    quietHoursEnd?: Prisma.DateTimeNullableFilter<"NotificationPreference"> | Date | string | null;
    typePreferences?: Prisma.JsonFilter<"NotificationPreference">;
    createdAt?: Prisma.DateTimeFilter<"NotificationPreference"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"NotificationPreference"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
};
export type NotificationPreferenceOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    enablePushNotifications?: Prisma.SortOrder;
    enableInAppNotifications?: Prisma.SortOrder;
    enableToastNotifications?: Prisma.SortOrder;
    quietHoursEnabled?: Prisma.SortOrder;
    quietHoursStart?: Prisma.SortOrderInput | Prisma.SortOrder;
    quietHoursEnd?: Prisma.SortOrderInput | Prisma.SortOrder;
    typePreferences?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    user?: Prisma.UserOrderByWithRelationInput;
};
export type NotificationPreferenceWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    userId?: string;
    AND?: Prisma.NotificationPreferenceWhereInput | Prisma.NotificationPreferenceWhereInput[];
    OR?: Prisma.NotificationPreferenceWhereInput[];
    NOT?: Prisma.NotificationPreferenceWhereInput | Prisma.NotificationPreferenceWhereInput[];
    enablePushNotifications?: Prisma.BoolFilter<"NotificationPreference"> | boolean;
    enableInAppNotifications?: Prisma.BoolFilter<"NotificationPreference"> | boolean;
    enableToastNotifications?: Prisma.BoolFilter<"NotificationPreference"> | boolean;
    quietHoursEnabled?: Prisma.BoolFilter<"NotificationPreference"> | boolean;
    quietHoursStart?: Prisma.DateTimeNullableFilter<"NotificationPreference"> | Date | string | null;
    quietHoursEnd?: Prisma.DateTimeNullableFilter<"NotificationPreference"> | Date | string | null;
    typePreferences?: Prisma.JsonFilter<"NotificationPreference">;
    createdAt?: Prisma.DateTimeFilter<"NotificationPreference"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"NotificationPreference"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
}, "id" | "userId">;
export type NotificationPreferenceOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    enablePushNotifications?: Prisma.SortOrder;
    enableInAppNotifications?: Prisma.SortOrder;
    enableToastNotifications?: Prisma.SortOrder;
    quietHoursEnabled?: Prisma.SortOrder;
    quietHoursStart?: Prisma.SortOrderInput | Prisma.SortOrder;
    quietHoursEnd?: Prisma.SortOrderInput | Prisma.SortOrder;
    typePreferences?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.NotificationPreferenceCountOrderByAggregateInput;
    _max?: Prisma.NotificationPreferenceMaxOrderByAggregateInput;
    _min?: Prisma.NotificationPreferenceMinOrderByAggregateInput;
};
export type NotificationPreferenceScalarWhereWithAggregatesInput = {
    AND?: Prisma.NotificationPreferenceScalarWhereWithAggregatesInput | Prisma.NotificationPreferenceScalarWhereWithAggregatesInput[];
    OR?: Prisma.NotificationPreferenceScalarWhereWithAggregatesInput[];
    NOT?: Prisma.NotificationPreferenceScalarWhereWithAggregatesInput | Prisma.NotificationPreferenceScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"NotificationPreference"> | string;
    userId?: Prisma.StringWithAggregatesFilter<"NotificationPreference"> | string;
    enablePushNotifications?: Prisma.BoolWithAggregatesFilter<"NotificationPreference"> | boolean;
    enableInAppNotifications?: Prisma.BoolWithAggregatesFilter<"NotificationPreference"> | boolean;
    enableToastNotifications?: Prisma.BoolWithAggregatesFilter<"NotificationPreference"> | boolean;
    quietHoursEnabled?: Prisma.BoolWithAggregatesFilter<"NotificationPreference"> | boolean;
    quietHoursStart?: Prisma.DateTimeNullableWithAggregatesFilter<"NotificationPreference"> | Date | string | null;
    quietHoursEnd?: Prisma.DateTimeNullableWithAggregatesFilter<"NotificationPreference"> | Date | string | null;
    typePreferences?: Prisma.JsonWithAggregatesFilter<"NotificationPreference">;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"NotificationPreference"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"NotificationPreference"> | Date | string;
};
export type NotificationPreferenceCreateInput = {
    id?: string;
    enablePushNotifications?: boolean;
    enableInAppNotifications?: boolean;
    enableToastNotifications?: boolean;
    quietHoursEnabled?: boolean;
    quietHoursStart?: Date | string | null;
    quietHoursEnd?: Date | string | null;
    typePreferences?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutNotificationPreferenceInput;
};
export type NotificationPreferenceUncheckedCreateInput = {
    id?: string;
    userId: string;
    enablePushNotifications?: boolean;
    enableInAppNotifications?: boolean;
    enableToastNotifications?: boolean;
    quietHoursEnabled?: boolean;
    quietHoursStart?: Date | string | null;
    quietHoursEnd?: Date | string | null;
    typePreferences?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type NotificationPreferenceUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    enablePushNotifications?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    enableInAppNotifications?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    enableToastNotifications?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    quietHoursEnabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    quietHoursStart?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    quietHoursEnd?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    typePreferences?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutNotificationPreferenceNestedInput;
};
export type NotificationPreferenceUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    enablePushNotifications?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    enableInAppNotifications?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    enableToastNotifications?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    quietHoursEnabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    quietHoursStart?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    quietHoursEnd?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    typePreferences?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type NotificationPreferenceCreateManyInput = {
    id?: string;
    userId: string;
    enablePushNotifications?: boolean;
    enableInAppNotifications?: boolean;
    enableToastNotifications?: boolean;
    quietHoursEnabled?: boolean;
    quietHoursStart?: Date | string | null;
    quietHoursEnd?: Date | string | null;
    typePreferences?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type NotificationPreferenceUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    enablePushNotifications?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    enableInAppNotifications?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    enableToastNotifications?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    quietHoursEnabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    quietHoursStart?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    quietHoursEnd?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    typePreferences?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type NotificationPreferenceUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    enablePushNotifications?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    enableInAppNotifications?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    enableToastNotifications?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    quietHoursEnabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    quietHoursStart?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    quietHoursEnd?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    typePreferences?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type NotificationPreferenceCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    enablePushNotifications?: Prisma.SortOrder;
    enableInAppNotifications?: Prisma.SortOrder;
    enableToastNotifications?: Prisma.SortOrder;
    quietHoursEnabled?: Prisma.SortOrder;
    quietHoursStart?: Prisma.SortOrder;
    quietHoursEnd?: Prisma.SortOrder;
    typePreferences?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type NotificationPreferenceMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    enablePushNotifications?: Prisma.SortOrder;
    enableInAppNotifications?: Prisma.SortOrder;
    enableToastNotifications?: Prisma.SortOrder;
    quietHoursEnabled?: Prisma.SortOrder;
    quietHoursStart?: Prisma.SortOrder;
    quietHoursEnd?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type NotificationPreferenceMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    enablePushNotifications?: Prisma.SortOrder;
    enableInAppNotifications?: Prisma.SortOrder;
    enableToastNotifications?: Prisma.SortOrder;
    quietHoursEnabled?: Prisma.SortOrder;
    quietHoursStart?: Prisma.SortOrder;
    quietHoursEnd?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type NotificationPreferenceNullableScalarRelationFilter = {
    is?: Prisma.NotificationPreferenceWhereInput | null;
    isNot?: Prisma.NotificationPreferenceWhereInput | null;
};
export type NotificationPreferenceCreateNestedOneWithoutUserInput = {
    create?: Prisma.XOR<Prisma.NotificationPreferenceCreateWithoutUserInput, Prisma.NotificationPreferenceUncheckedCreateWithoutUserInput>;
    connectOrCreate?: Prisma.NotificationPreferenceCreateOrConnectWithoutUserInput;
    connect?: Prisma.NotificationPreferenceWhereUniqueInput;
};
export type NotificationPreferenceUncheckedCreateNestedOneWithoutUserInput = {
    create?: Prisma.XOR<Prisma.NotificationPreferenceCreateWithoutUserInput, Prisma.NotificationPreferenceUncheckedCreateWithoutUserInput>;
    connectOrCreate?: Prisma.NotificationPreferenceCreateOrConnectWithoutUserInput;
    connect?: Prisma.NotificationPreferenceWhereUniqueInput;
};
export type NotificationPreferenceUpdateOneWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.NotificationPreferenceCreateWithoutUserInput, Prisma.NotificationPreferenceUncheckedCreateWithoutUserInput>;
    connectOrCreate?: Prisma.NotificationPreferenceCreateOrConnectWithoutUserInput;
    upsert?: Prisma.NotificationPreferenceUpsertWithoutUserInput;
    disconnect?: Prisma.NotificationPreferenceWhereInput | boolean;
    delete?: Prisma.NotificationPreferenceWhereInput | boolean;
    connect?: Prisma.NotificationPreferenceWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.NotificationPreferenceUpdateToOneWithWhereWithoutUserInput, Prisma.NotificationPreferenceUpdateWithoutUserInput>, Prisma.NotificationPreferenceUncheckedUpdateWithoutUserInput>;
};
export type NotificationPreferenceUncheckedUpdateOneWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.NotificationPreferenceCreateWithoutUserInput, Prisma.NotificationPreferenceUncheckedCreateWithoutUserInput>;
    connectOrCreate?: Prisma.NotificationPreferenceCreateOrConnectWithoutUserInput;
    upsert?: Prisma.NotificationPreferenceUpsertWithoutUserInput;
    disconnect?: Prisma.NotificationPreferenceWhereInput | boolean;
    delete?: Prisma.NotificationPreferenceWhereInput | boolean;
    connect?: Prisma.NotificationPreferenceWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.NotificationPreferenceUpdateToOneWithWhereWithoutUserInput, Prisma.NotificationPreferenceUpdateWithoutUserInput>, Prisma.NotificationPreferenceUncheckedUpdateWithoutUserInput>;
};
export type NotificationPreferenceCreateWithoutUserInput = {
    id?: string;
    enablePushNotifications?: boolean;
    enableInAppNotifications?: boolean;
    enableToastNotifications?: boolean;
    quietHoursEnabled?: boolean;
    quietHoursStart?: Date | string | null;
    quietHoursEnd?: Date | string | null;
    typePreferences?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type NotificationPreferenceUncheckedCreateWithoutUserInput = {
    id?: string;
    enablePushNotifications?: boolean;
    enableInAppNotifications?: boolean;
    enableToastNotifications?: boolean;
    quietHoursEnabled?: boolean;
    quietHoursStart?: Date | string | null;
    quietHoursEnd?: Date | string | null;
    typePreferences?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type NotificationPreferenceCreateOrConnectWithoutUserInput = {
    where: Prisma.NotificationPreferenceWhereUniqueInput;
    create: Prisma.XOR<Prisma.NotificationPreferenceCreateWithoutUserInput, Prisma.NotificationPreferenceUncheckedCreateWithoutUserInput>;
};
export type NotificationPreferenceUpsertWithoutUserInput = {
    update: Prisma.XOR<Prisma.NotificationPreferenceUpdateWithoutUserInput, Prisma.NotificationPreferenceUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.NotificationPreferenceCreateWithoutUserInput, Prisma.NotificationPreferenceUncheckedCreateWithoutUserInput>;
    where?: Prisma.NotificationPreferenceWhereInput;
};
export type NotificationPreferenceUpdateToOneWithWhereWithoutUserInput = {
    where?: Prisma.NotificationPreferenceWhereInput;
    data: Prisma.XOR<Prisma.NotificationPreferenceUpdateWithoutUserInput, Prisma.NotificationPreferenceUncheckedUpdateWithoutUserInput>;
};
export type NotificationPreferenceUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    enablePushNotifications?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    enableInAppNotifications?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    enableToastNotifications?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    quietHoursEnabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    quietHoursStart?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    quietHoursEnd?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    typePreferences?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type NotificationPreferenceUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    enablePushNotifications?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    enableInAppNotifications?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    enableToastNotifications?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    quietHoursEnabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    quietHoursStart?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    quietHoursEnd?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    typePreferences?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type NotificationPreferenceSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    enablePushNotifications?: boolean;
    enableInAppNotifications?: boolean;
    enableToastNotifications?: boolean;
    quietHoursEnabled?: boolean;
    quietHoursStart?: boolean;
    quietHoursEnd?: boolean;
    typePreferences?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["notificationPreference"]>;
export type NotificationPreferenceSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    enablePushNotifications?: boolean;
    enableInAppNotifications?: boolean;
    enableToastNotifications?: boolean;
    quietHoursEnabled?: boolean;
    quietHoursStart?: boolean;
    quietHoursEnd?: boolean;
    typePreferences?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["notificationPreference"]>;
export type NotificationPreferenceSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    enablePushNotifications?: boolean;
    enableInAppNotifications?: boolean;
    enableToastNotifications?: boolean;
    quietHoursEnabled?: boolean;
    quietHoursStart?: boolean;
    quietHoursEnd?: boolean;
    typePreferences?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["notificationPreference"]>;
export type NotificationPreferenceSelectScalar = {
    id?: boolean;
    userId?: boolean;
    enablePushNotifications?: boolean;
    enableInAppNotifications?: boolean;
    enableToastNotifications?: boolean;
    quietHoursEnabled?: boolean;
    quietHoursStart?: boolean;
    quietHoursEnd?: boolean;
    typePreferences?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type NotificationPreferenceOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "userId" | "enablePushNotifications" | "enableInAppNotifications" | "enableToastNotifications" | "quietHoursEnabled" | "quietHoursStart" | "quietHoursEnd" | "typePreferences" | "createdAt" | "updatedAt", ExtArgs["result"]["notificationPreference"]>;
export type NotificationPreferenceInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type NotificationPreferenceIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type NotificationPreferenceIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $NotificationPreferencePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "NotificationPreference";
    objects: {
        user: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        userId: string;
        enablePushNotifications: boolean;
        enableInAppNotifications: boolean;
        enableToastNotifications: boolean;
        quietHoursEnabled: boolean;
        quietHoursStart: Date | null;
        quietHoursEnd: Date | null;
        typePreferences: runtime.JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["notificationPreference"]>;
    composites: {};
};
export type NotificationPreferenceGetPayload<S extends boolean | null | undefined | NotificationPreferenceDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$NotificationPreferencePayload, S>;
export type NotificationPreferenceCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<NotificationPreferenceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: NotificationPreferenceCountAggregateInputType | true;
};
export interface NotificationPreferenceDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['NotificationPreference'];
        meta: {
            name: 'NotificationPreference';
        };
    };
    findUnique<T extends NotificationPreferenceFindUniqueArgs>(args: Prisma.SelectSubset<T, NotificationPreferenceFindUniqueArgs<ExtArgs>>): Prisma.Prisma__NotificationPreferenceClient<runtime.Types.Result.GetResult<Prisma.$NotificationPreferencePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends NotificationPreferenceFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, NotificationPreferenceFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__NotificationPreferenceClient<runtime.Types.Result.GetResult<Prisma.$NotificationPreferencePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends NotificationPreferenceFindFirstArgs>(args?: Prisma.SelectSubset<T, NotificationPreferenceFindFirstArgs<ExtArgs>>): Prisma.Prisma__NotificationPreferenceClient<runtime.Types.Result.GetResult<Prisma.$NotificationPreferencePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends NotificationPreferenceFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, NotificationPreferenceFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__NotificationPreferenceClient<runtime.Types.Result.GetResult<Prisma.$NotificationPreferencePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends NotificationPreferenceFindManyArgs>(args?: Prisma.SelectSubset<T, NotificationPreferenceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$NotificationPreferencePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends NotificationPreferenceCreateArgs>(args: Prisma.SelectSubset<T, NotificationPreferenceCreateArgs<ExtArgs>>): Prisma.Prisma__NotificationPreferenceClient<runtime.Types.Result.GetResult<Prisma.$NotificationPreferencePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends NotificationPreferenceCreateManyArgs>(args?: Prisma.SelectSubset<T, NotificationPreferenceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends NotificationPreferenceCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, NotificationPreferenceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$NotificationPreferencePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends NotificationPreferenceDeleteArgs>(args: Prisma.SelectSubset<T, NotificationPreferenceDeleteArgs<ExtArgs>>): Prisma.Prisma__NotificationPreferenceClient<runtime.Types.Result.GetResult<Prisma.$NotificationPreferencePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends NotificationPreferenceUpdateArgs>(args: Prisma.SelectSubset<T, NotificationPreferenceUpdateArgs<ExtArgs>>): Prisma.Prisma__NotificationPreferenceClient<runtime.Types.Result.GetResult<Prisma.$NotificationPreferencePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends NotificationPreferenceDeleteManyArgs>(args?: Prisma.SelectSubset<T, NotificationPreferenceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends NotificationPreferenceUpdateManyArgs>(args: Prisma.SelectSubset<T, NotificationPreferenceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends NotificationPreferenceUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, NotificationPreferenceUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$NotificationPreferencePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends NotificationPreferenceUpsertArgs>(args: Prisma.SelectSubset<T, NotificationPreferenceUpsertArgs<ExtArgs>>): Prisma.Prisma__NotificationPreferenceClient<runtime.Types.Result.GetResult<Prisma.$NotificationPreferencePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends NotificationPreferenceCountArgs>(args?: Prisma.Subset<T, NotificationPreferenceCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], NotificationPreferenceCountAggregateOutputType> : number>;
    aggregate<T extends NotificationPreferenceAggregateArgs>(args: Prisma.Subset<T, NotificationPreferenceAggregateArgs>): Prisma.PrismaPromise<GetNotificationPreferenceAggregateType<T>>;
    groupBy<T extends NotificationPreferenceGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: NotificationPreferenceGroupByArgs['orderBy'];
    } : {
        orderBy?: NotificationPreferenceGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, NotificationPreferenceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetNotificationPreferenceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: NotificationPreferenceFieldRefs;
}
export interface Prisma__NotificationPreferenceClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface NotificationPreferenceFieldRefs {
    readonly id: Prisma.FieldRef<"NotificationPreference", 'String'>;
    readonly userId: Prisma.FieldRef<"NotificationPreference", 'String'>;
    readonly enablePushNotifications: Prisma.FieldRef<"NotificationPreference", 'Boolean'>;
    readonly enableInAppNotifications: Prisma.FieldRef<"NotificationPreference", 'Boolean'>;
    readonly enableToastNotifications: Prisma.FieldRef<"NotificationPreference", 'Boolean'>;
    readonly quietHoursEnabled: Prisma.FieldRef<"NotificationPreference", 'Boolean'>;
    readonly quietHoursStart: Prisma.FieldRef<"NotificationPreference", 'DateTime'>;
    readonly quietHoursEnd: Prisma.FieldRef<"NotificationPreference", 'DateTime'>;
    readonly typePreferences: Prisma.FieldRef<"NotificationPreference", 'Json'>;
    readonly createdAt: Prisma.FieldRef<"NotificationPreference", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"NotificationPreference", 'DateTime'>;
}
export type NotificationPreferenceFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.NotificationPreferenceSelect<ExtArgs> | null;
    omit?: Prisma.NotificationPreferenceOmit<ExtArgs> | null;
    include?: Prisma.NotificationPreferenceInclude<ExtArgs> | null;
    where: Prisma.NotificationPreferenceWhereUniqueInput;
};
export type NotificationPreferenceFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.NotificationPreferenceSelect<ExtArgs> | null;
    omit?: Prisma.NotificationPreferenceOmit<ExtArgs> | null;
    include?: Prisma.NotificationPreferenceInclude<ExtArgs> | null;
    where: Prisma.NotificationPreferenceWhereUniqueInput;
};
export type NotificationPreferenceFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.NotificationPreferenceSelect<ExtArgs> | null;
    omit?: Prisma.NotificationPreferenceOmit<ExtArgs> | null;
    include?: Prisma.NotificationPreferenceInclude<ExtArgs> | null;
    where?: Prisma.NotificationPreferenceWhereInput;
    orderBy?: Prisma.NotificationPreferenceOrderByWithRelationInput | Prisma.NotificationPreferenceOrderByWithRelationInput[];
    cursor?: Prisma.NotificationPreferenceWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.NotificationPreferenceScalarFieldEnum | Prisma.NotificationPreferenceScalarFieldEnum[];
};
export type NotificationPreferenceFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.NotificationPreferenceSelect<ExtArgs> | null;
    omit?: Prisma.NotificationPreferenceOmit<ExtArgs> | null;
    include?: Prisma.NotificationPreferenceInclude<ExtArgs> | null;
    where?: Prisma.NotificationPreferenceWhereInput;
    orderBy?: Prisma.NotificationPreferenceOrderByWithRelationInput | Prisma.NotificationPreferenceOrderByWithRelationInput[];
    cursor?: Prisma.NotificationPreferenceWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.NotificationPreferenceScalarFieldEnum | Prisma.NotificationPreferenceScalarFieldEnum[];
};
export type NotificationPreferenceFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.NotificationPreferenceSelect<ExtArgs> | null;
    omit?: Prisma.NotificationPreferenceOmit<ExtArgs> | null;
    include?: Prisma.NotificationPreferenceInclude<ExtArgs> | null;
    where?: Prisma.NotificationPreferenceWhereInput;
    orderBy?: Prisma.NotificationPreferenceOrderByWithRelationInput | Prisma.NotificationPreferenceOrderByWithRelationInput[];
    cursor?: Prisma.NotificationPreferenceWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.NotificationPreferenceScalarFieldEnum | Prisma.NotificationPreferenceScalarFieldEnum[];
};
export type NotificationPreferenceCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.NotificationPreferenceSelect<ExtArgs> | null;
    omit?: Prisma.NotificationPreferenceOmit<ExtArgs> | null;
    include?: Prisma.NotificationPreferenceInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.NotificationPreferenceCreateInput, Prisma.NotificationPreferenceUncheckedCreateInput>;
};
export type NotificationPreferenceCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.NotificationPreferenceCreateManyInput | Prisma.NotificationPreferenceCreateManyInput[];
    skipDuplicates?: boolean;
};
export type NotificationPreferenceCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.NotificationPreferenceSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.NotificationPreferenceOmit<ExtArgs> | null;
    data: Prisma.NotificationPreferenceCreateManyInput | Prisma.NotificationPreferenceCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.NotificationPreferenceIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type NotificationPreferenceUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.NotificationPreferenceSelect<ExtArgs> | null;
    omit?: Prisma.NotificationPreferenceOmit<ExtArgs> | null;
    include?: Prisma.NotificationPreferenceInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.NotificationPreferenceUpdateInput, Prisma.NotificationPreferenceUncheckedUpdateInput>;
    where: Prisma.NotificationPreferenceWhereUniqueInput;
};
export type NotificationPreferenceUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.NotificationPreferenceUpdateManyMutationInput, Prisma.NotificationPreferenceUncheckedUpdateManyInput>;
    where?: Prisma.NotificationPreferenceWhereInput;
    limit?: number;
};
export type NotificationPreferenceUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.NotificationPreferenceSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.NotificationPreferenceOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.NotificationPreferenceUpdateManyMutationInput, Prisma.NotificationPreferenceUncheckedUpdateManyInput>;
    where?: Prisma.NotificationPreferenceWhereInput;
    limit?: number;
    include?: Prisma.NotificationPreferenceIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type NotificationPreferenceUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.NotificationPreferenceSelect<ExtArgs> | null;
    omit?: Prisma.NotificationPreferenceOmit<ExtArgs> | null;
    include?: Prisma.NotificationPreferenceInclude<ExtArgs> | null;
    where: Prisma.NotificationPreferenceWhereUniqueInput;
    create: Prisma.XOR<Prisma.NotificationPreferenceCreateInput, Prisma.NotificationPreferenceUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.NotificationPreferenceUpdateInput, Prisma.NotificationPreferenceUncheckedUpdateInput>;
};
export type NotificationPreferenceDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.NotificationPreferenceSelect<ExtArgs> | null;
    omit?: Prisma.NotificationPreferenceOmit<ExtArgs> | null;
    include?: Prisma.NotificationPreferenceInclude<ExtArgs> | null;
    where: Prisma.NotificationPreferenceWhereUniqueInput;
};
export type NotificationPreferenceDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.NotificationPreferenceWhereInput;
    limit?: number;
};
export type NotificationPreferenceDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.NotificationPreferenceSelect<ExtArgs> | null;
    omit?: Prisma.NotificationPreferenceOmit<ExtArgs> | null;
    include?: Prisma.NotificationPreferenceInclude<ExtArgs> | null;
};
export {};
