import { Prisma } from 'prisma/generated/prisma/client';
import { DeviceToken } from '../../domain/entities/device-token.entity';

type PrismaDeviceToken = Prisma.DeviceTokenGetPayload<object>;

export class DeviceTokenMapper {
  static toDomain(prismaToken: PrismaDeviceToken): DeviceToken {
    return new DeviceToken({
      id: prismaToken.id,
      userId: prismaToken.userId,
      expoPushToken: prismaToken.expoPushToken,
      platform: prismaToken.platform || undefined,
      deviceId: prismaToken.deviceId || undefined,
      deviceName: prismaToken.deviceName || undefined,
      isActive: prismaToken.isActive,
      lastUsed: prismaToken.lastUsed,
      createdAt: prismaToken.createdAt,
      updatedAt: prismaToken.updatedAt,
    });
  }
}
