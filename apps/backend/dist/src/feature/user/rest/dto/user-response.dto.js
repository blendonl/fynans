"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSearchResponseDto = exports.UserResponseDto = void 0;
class UserResponseDto {
    id;
    email;
    firstName;
    lastName;
    balance;
    emailVerified;
    createdAt;
    updatedAt;
    static fromEntity(user) {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            balance: user.balance.toString(),
            emailVerified: user.emailVerified,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        };
    }
}
exports.UserResponseDto = UserResponseDto;
class UserSearchResponseDto {
    id;
    email;
    firstName;
    lastName;
    static fromEntity(user) {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
        };
    }
}
exports.UserSearchResponseDto = UserSearchResponseDto;
//# sourceMappingURL=user-response.dto.js.map