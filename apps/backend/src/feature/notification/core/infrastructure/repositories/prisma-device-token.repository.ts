import { Injectable } from '@nestjs/common';
import { DomainNotFoundException } from '~common/exceptions/domain.exceptions';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import { IDeviceTokenRepository } from '../../domain/repositories/device-token.repository.interface';
import { DeviceToken } from '../../domain/entities/device-token.entity';
import { DeviceTokenMapper } from '../mappers/device-token.mapper';

@Injectable()
export class PrismaDeviceTokenRepository implements IDeviceTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partial<DeviceToken>): Promise<DeviceToken> {
    const token = await this.prisma.deviceToken.create({
      data: {
        id: data.id!,
        userId: data.userId!,
        expoPushToken: data.expoPushToken!,
        platform: data.platform,
        deviceId: data.deviceId,
        deviceName: data.deviceName,
        isActive: data.isActive ?? true,
        lastUsed: data.lastUsed ?? new Date(),
      },
    });

    return DeviceTokenMapper.toDomain(token);
  }

  async findByToken(expoPushToken: string): Promise<DeviceToken | null> {
    const token = await this.prisma.deviceToken.findUnique({
      where: { expoPushToken },
    });

    if (!token) {
      return null;
    }

    return DeviceTokenMapper.toDomain(token);
  }

  async findActiveByUserId(userId: string): Promise<DeviceToken[]> {
    const tokens = await this.prisma.deviceToken.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    return tokens.map(DeviceTokenMapper.toDomain);
  }

  async deactivate(id: string): Promise<void> {
    await this.prisma.deviceToken.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });
  }

  async delete(expoPushToken: string, userId: string): Promise<void> {
    const token = await this.prisma.deviceToken.findUnique({
      where: { expoPushToken },
      select: { userId: true },
    });

    if (!token || token.userId !== userId) {
      throw new DomainNotFoundException('Device token not found');
    }

    await this.prisma.deviceToken.delete({
      where: { expoPushToken },
    });
  }

  async updateLastUsed(id: string): Promise<void> {
    await this.prisma.deviceToken.update({
      where: { id },
      data: {
        lastUsed: new Date(),
        updatedAt: new Date(),
      },
    });
  }
}
