import { Injectable, Inject } from '@nestjs/common';
import { IWebPushSubscriptionRepository } from '../../domain/repositories/web-push-subscription.repository.interface';
import { WebPushSubscription } from '../../domain/entities/web-push-subscription.entity';
import { v4 as uuid } from 'uuid';

export interface RegisterWebPushSubscriptionDto {
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
}

@Injectable()
export class RegisterWebPushSubscriptionUseCase {
  constructor(
    @Inject('WebPushSubscriptionRepository')
    private readonly subscriptionRepository: IWebPushSubscriptionRepository,
  ) {}

  async execute(
    dto: RegisterWebPushSubscriptionDto,
  ): Promise<WebPushSubscription> {
    const existing = await this.subscriptionRepository.findByEndpoint(
      dto.endpoint,
    );

    if (existing) {
      await this.subscriptionRepository.updateLastUsed(existing.id);
      return existing;
    }

    return await this.subscriptionRepository.create({
      id: uuid(),
      userId: dto.userId,
      endpoint: dto.endpoint,
      p256dh: dto.p256dh,
      auth: dto.auth,
      userAgent: dto.userAgent,
      isActive: true,
      lastUsed: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
