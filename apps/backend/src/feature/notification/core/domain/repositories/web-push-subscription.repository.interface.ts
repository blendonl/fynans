import { WebPushSubscription } from '../entities/web-push-subscription.entity';

export interface IWebPushSubscriptionRepository {
  create(data: Partial<WebPushSubscription>): Promise<WebPushSubscription>;
  findByEndpoint(endpoint: string): Promise<WebPushSubscription | null>;
  findActiveByUserId(userId: string): Promise<WebPushSubscription[]>;
  deactivate(id: string): Promise<void>;
  delete(endpoint: string, userId: string): Promise<void>;
  updateLastUsed(id: string): Promise<void>;
}
