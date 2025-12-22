"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineExtension = exports.NullsOrder = exports.QueryMode = exports.SortOrder = exports.TransactionScalarFieldEnum = exports.StoreItemCategoryScalarFieldEnum = exports.StoreItemDiscountScalarFieldEnum = exports.StoreItemScalarFieldEnum = exports.StoreScalarFieldEnum = exports.UserScalarFieldEnum = exports.IncomeCategoryScalarFieldEnum = exports.IncomeScalarFieldEnum = exports.ExpenseCategoryScalarFieldEnum = exports.ExpenseScalarFieldEnum = exports.ExpenseItemScalarFieldEnum = exports.VerificationScalarFieldEnum = exports.SessionScalarFieldEnum = exports.AccountScalarFieldEnum = exports.TransactionIsolationLevel = exports.ModelName = exports.AnyNull = exports.JsonNull = exports.DbNull = exports.NullTypes = exports.prismaVersion = exports.getExtensionContext = exports.Decimal = exports.Sql = exports.raw = exports.join = exports.empty = exports.sql = exports.PrismaClientValidationError = exports.PrismaClientInitializationError = exports.PrismaClientRustPanicError = exports.PrismaClientUnknownRequestError = exports.PrismaClientKnownRequestError = void 0;
const runtime = __importStar(require("@prisma/client/runtime/client"));
exports.PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
exports.PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
exports.PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
exports.PrismaClientInitializationError = runtime.PrismaClientInitializationError;
exports.PrismaClientValidationError = runtime.PrismaClientValidationError;
exports.sql = runtime.sqltag;
exports.empty = runtime.empty;
exports.join = runtime.join;
exports.raw = runtime.raw;
exports.Sql = runtime.Sql;
exports.Decimal = runtime.Decimal;
exports.getExtensionContext = runtime.Extensions.getExtensionContext;
exports.prismaVersion = {
    client: "7.1.0",
    engine: "ab635e6b9d606fa5c8fb8b1a7f909c3c3c1c98ba"
};
exports.NullTypes = {
    DbNull: runtime.NullTypes.DbNull,
    JsonNull: runtime.NullTypes.JsonNull,
    AnyNull: runtime.NullTypes.AnyNull,
};
exports.DbNull = runtime.DbNull;
exports.JsonNull = runtime.JsonNull;
exports.AnyNull = runtime.AnyNull;
exports.ModelName = {
    Account: 'Account',
    Session: 'Session',
    Verification: 'Verification',
    ExpenseItem: 'ExpenseItem',
    Expense: 'Expense',
    ExpenseCategory: 'ExpenseCategory',
    Income: 'Income',
    IncomeCategory: 'IncomeCategory',
    User: 'User',
    Store: 'Store',
    StoreItem: 'StoreItem',
    StoreItemDiscount: 'StoreItemDiscount',
    StoreItemCategory: 'StoreItemCategory',
    Transaction: 'Transaction'
};
exports.TransactionIsolationLevel = runtime.makeStrictEnum({
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
});
exports.AccountScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    accountId: 'accountId',
    providerId: 'providerId',
    accessToken: 'accessToken',
    refreshToken: 'refreshToken',
    idToken: 'idToken',
    expiresAt: 'expiresAt',
    password: 'password',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.SessionScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    expiresAt: 'expiresAt',
    token: 'token',
    ipAddress: 'ipAddress',
    userAgent: 'userAgent',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.VerificationScalarFieldEnum = {
    id: 'id',
    identifier: 'identifier',
    value: 'value',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt'
};
exports.ExpenseItemScalarFieldEnum = {
    id: 'id',
    itemId: 'itemId',
    expenseId: 'expenseId',
    price: 'price',
    discount: 'discount',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.ExpenseScalarFieldEnum = {
    id: 'id',
    transactionId: 'transactionId',
    storeId: 'storeId',
    categoryId: 'categoryId',
    description: 'description',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.ExpenseCategoryScalarFieldEnum = {
    id: 'id',
    parentId: 'parentId',
    name: 'name',
    isConnectedToStore: 'isConnectedToStore',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.IncomeScalarFieldEnum = {
    id: 'id',
    transactionId: 'transactionId',
    storeId: 'storeId',
    categoryId: 'categoryId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.IncomeCategoryScalarFieldEnum = {
    id: 'id',
    parentId: 'parentId',
    name: 'name',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.UserScalarFieldEnum = {
    id: 'id',
    email: 'email',
    name: 'name',
    firstName: 'firstName',
    lastName: 'lastName',
    balance: 'balance',
    emailVerified: 'emailVerified',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.StoreScalarFieldEnum = {
    id: 'id',
    name: 'name',
    location: 'location',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.StoreItemScalarFieldEnum = {
    id: 'id',
    storeId: 'storeId',
    categoryId: 'categoryId',
    name: 'name',
    price: 'price',
    isDiscounted: 'isDiscounted',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.StoreItemDiscountScalarFieldEnum = {
    id: 'id',
    storeItemId: 'storeItemId',
    discount: 'discount',
    startedAt: 'startedAt',
    endedAt: 'endedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.StoreItemCategoryScalarFieldEnum = {
    id: 'id',
    parentId: 'parentId',
    name: 'name',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.TransactionScalarFieldEnum = {
    id: 'id',
    userId: 'userId',
    type: 'type',
    value: 'value',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
};
exports.SortOrder = {
    asc: 'asc',
    desc: 'desc'
};
exports.QueryMode = {
    default: 'default',
    insensitive: 'insensitive'
};
exports.NullsOrder = {
    first: 'first',
    last: 'last'
};
exports.defineExtension = runtime.Extensions.defineExtension;
//# sourceMappingURL=prismaNamespace.js.map