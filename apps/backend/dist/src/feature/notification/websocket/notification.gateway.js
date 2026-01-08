"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../../auth/core/application/services/auth.service");
let NotificationGateway = class NotificationGateway {
    authService;
    server;
    userSockets = new Map();
    constructor(authService) {
        this.authService = authService;
    }
    async handleConnection(client) {
        const token = this.extractToken(client);
        if (!token) {
            client.disconnect();
            return;
        }
        try {
            const user = await this.authService.validateSession(token);
            client.data.userId = user.id;
        }
        catch {
            client.disconnect();
            return;
        }
        const userId = client.data.userId;
        if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, new Set());
        }
        this.userSockets.get(userId).add(client.id);
        client.join(`user:${userId}`);
        console.log(`Client connected: ${client.id} (User: ${userId})`);
    }
    async handleDisconnect(client) {
        const userId = client.data.userId;
        if (userId && this.userSockets.has(userId)) {
            this.userSockets.get(userId).delete(client.id);
            if (this.userSockets.get(userId).size === 0) {
                this.userSockets.delete(userId);
            }
        }
        console.log(`Client disconnected: ${client.id}`);
    }
    async handleSubscribeFamily(client, data) {
        client.join(`family:${data.familyId}`);
    }
    async handleUnsubscribeFamily(client, data) {
        client.leave(`family:${data.familyId}`);
    }
    emitToUser(userId, event, data) {
        this.server.to(`user:${userId}`).emit(event, data);
    }
    emitToFamily(familyId, event, data) {
        this.server.to(`family:${familyId}`).emit(event, data);
    }
    broadcastNotification(notification) {
        this.emitToUser(notification.userId, 'notification:new', notification);
    }
    extractToken(client) {
        const auth = client.handshake.auth?.token || client.handshake.headers?.authorization;
        if (!auth)
            return undefined;
        const parts = auth.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            return parts[1];
        }
        return auth;
    }
};
exports.NotificationGateway = NotificationGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationGateway.prototype, "server", void 0);
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], NotificationGateway.prototype, "handleConnection", null);
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], NotificationGateway.prototype, "handleDisconnect", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe:family'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], NotificationGateway.prototype, "handleSubscribeFamily", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('unsubscribe:family'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], NotificationGateway.prototype, "handleUnsubscribeFamily", null);
exports.NotificationGateway = NotificationGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        namespace: '/notifications',
    }),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], NotificationGateway);
//# sourceMappingURL=notification.gateway.js.map