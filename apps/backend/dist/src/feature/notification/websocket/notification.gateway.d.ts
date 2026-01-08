import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../../auth/core/application/services/auth.service';
export declare class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly authService;
    server: Server;
    private userSockets;
    constructor(authService: AuthService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    handleSubscribeFamily(client: Socket, data: {
        familyId: string;
    }): Promise<void>;
    handleUnsubscribeFamily(client: Socket, data: {
        familyId: string;
    }): Promise<void>;
    emitToUser(userId: string, event: string, data: any): void;
    emitToFamily(familyId: string, event: string, data: any): void;
    broadcastNotification(notification: any): void;
    private extractToken;
}
