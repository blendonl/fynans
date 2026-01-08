"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMapper = void 0;
const user_entity_1 = require("../../domain/entities/user.entity");
class UserMapper {
    static toDomain(prismaUser) {
        let { firstName, lastName } = prismaUser;
        const name = prismaUser.name?.trim();
        if (!firstName?.trim() && !lastName?.trim() && name) {
            const nameParts = name.split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
        }
        return new user_entity_1.User({
            id: prismaUser.id,
            email: prismaUser.email,
            firstName,
            lastName,
            balance: Number(prismaUser.balance),
            emailVerified: prismaUser.emailVerified,
            createdAt: prismaUser.createdAt,
            updatedAt: prismaUser.updatedAt,
        });
    }
}
exports.UserMapper = UserMapper;
//# sourceMappingURL=user.mapper.js.map