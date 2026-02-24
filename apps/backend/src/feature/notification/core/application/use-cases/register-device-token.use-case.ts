import { Injectable, Inject } from '@nestjs/common';
import { IDeviceTokenRepository } from '../../domain/repositories/device-token.repository.interface';
import { DeviceToken } from '../../domain/entities/device-token.entity';
import { v4 as uuid } from 'uuid';

export interface RegisterDeviceTokenDto {
  userId: string;
  expoPushToken: string;
  platform?: string;
  deviceId?: string;
  deviceName?: string;
}

@Injectable()
export class RegisterDeviceTokenUseCase {
  constructor(
    @Inject('DeviceTokenRepository')
    private readonly deviceTokenRepository: IDeviceTokenRepository,
  ) {}

  async execute(dto: RegisterDeviceTokenDto): Promise<DeviceToken> {
    const existing = await this.deviceTokenRepository.findByToken(
      dto.expoPushToken,
    );

    if (existing) {
      await this.deviceTokenRepository.updateLastUsed(existing.id);
      return existing;
    }

    return await this.deviceTokenRepository.create({
      id: uuid(),
      userId: dto.userId,
      expoPushToken: dto.expoPushToken,
      platform: dto.platform,
      deviceId: dto.deviceId,
      deviceName: dto.deviceName,
      isActive: true,
      lastUsed: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
