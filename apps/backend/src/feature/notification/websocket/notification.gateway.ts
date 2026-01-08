import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../../auth/core/application/services/auth.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/notifications',
})
@Injectable()
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, Set<string>> = new Map();

  constructor(private readonly authService: AuthService) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    const token = this.extractToken(client);

    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const user = await this.authService.validateSession(token);
      client.data.userId = user.id;
    } catch {
      client.disconnect();
      return;
    }

    const userId = client.data.userId;

    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(client.id);

    // Join user-specific room
    client.join(`user:${userId}`);

    console.log(`Client connected: ${client.id} (User: ${userId})`);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId;

    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId)!.delete(client.id);
      if (this.userSockets.get(userId)!.size === 0) {
        this.userSockets.delete(userId);
      }
    }

    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe:family')
  async handleSubscribeFamily(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { familyId: string },
  ) {
    client.join(`family:${data.familyId}`);
  }

  @SubscribeMessage('unsubscribe:family')
  async handleUnsubscribeFamily(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { familyId: string },
  ) {
    client.leave(`family:${data.familyId}`);
  }

  // Emit notification to specific user
  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  // Emit notification to family members
  emitToFamily(familyId: string, event: string, data: any) {
    this.server.to(`family:${familyId}`).emit(event, data);
  }

  // Broadcast notification
  broadcastNotification(notification: any) {
    this.emitToUser(notification.userId, 'notification:new', notification);
  }

  private extractToken(client: Socket): string | undefined {
    const auth =
      client.handshake.auth?.token || client.handshake.headers?.authorization;

    if (!auth) return undefined;

    const parts = auth.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      return parts[1];
    }

    return auth;
  }
}
