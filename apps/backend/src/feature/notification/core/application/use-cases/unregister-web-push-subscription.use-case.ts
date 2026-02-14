import { Injectable, Inject } from '@nestjs/common';
import { IWebPushSubscriptionRepository } from '../../domain/repositories/web-push-subscription.repository.interface';

@Injectable()
export class UnregisterWebPushSubscriptionUseCase {
  constructor(
    @Inject('WebPushSubscriptionRepository')
    private readonly subscriptionRepository: IWebPushSubscriptionRepository,
  ) {}

  async execute(endpoint: string, userId: string): Promise<void> {
    await this.subscriptionRepository.delete(endpoint, userId);
  }
}
