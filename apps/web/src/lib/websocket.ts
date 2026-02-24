import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "@/lib/env";

export interface WebSocketEventMap {
  notification: { id: string; type: string; title: string; body: string };
  "basket:updated": { basketId: string };
  "expense:approved": { expenseId: string };
  "expense:rejected": { expenseId: string };
  [event: string]: unknown;
}

class WebSocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(`${API_BASE_URL}/notifications`, {
      auth: { token: `Bearer ${token}` },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    if (process.env.NODE_ENV === "development") {
      this.socket.on("connect", () => {
        console.log("WebSocket connected");
      });

      this.socket.on("disconnect", (reason) => {
        console.log("WebSocket disconnected:", reason);
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on<K extends keyof WebSocketEventMap>(event: K & string, callback: (data: WebSocketEventMap[K]) => void): void;
  on(event: string, callback: (data: unknown) => void): void;
  on(event: string, callback: (data: unknown) => void) {
    this.socket?.on(event, callback);
  }

  off<K extends keyof WebSocketEventMap>(event: K & string, callback?: (data: WebSocketEventMap[K]) => void): void;
  off(event: string, callback?: (data: unknown) => void): void;
  off(event: string, callback?: (data: unknown) => void) {
    this.socket?.off(event, callback);
  }

  emit<K extends keyof WebSocketEventMap>(event: K & string, data: WebSocketEventMap[K]): void;
  emit(event: string, data: unknown): void;
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
