import { io, Socket } from "socket.io-client";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

class WebSocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(`${BASE_URL}/notifications`, {
      auth: { token: `Bearer ${token}` },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on("connect", () => {
      console.log("WebSocket connected");
    });

    this.socket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (data: unknown) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (data: unknown) => void) {
    this.socket?.off(event, callback);
  }

  emit(event: string, data: unknown) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  subscribeToFamily(familyId: string) {
    this.emit("subscribe:family", { familyId });
  }

  unsubscribeFromFamily(familyId: string) {
    this.emit("unsubscribe:family", { familyId });
  }
}

export const websocketService = new WebSocketService();
