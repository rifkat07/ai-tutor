export class ChatWebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private onTokenCallback: (token: string) => void;
  private onEndCallback: () => void;
  private onErrorCallback?: (err: any) => void;

  private isManuallyClosed: boolean = false;
  private reconnectAttempts: number = 0;
  private reconnectTimer: any = null;
  private heartbeatTimer: any = null;
  private messageQueue: string[] = [];

  constructor(
    sessionId: string,
    onToken: (token: string) => void,
    onEnd: () => void,
    onError?: (err: any) => void
  ) {
    const wsBase = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
    this.url = `${wsBase}/api/v1/chat/ws/${sessionId}`;
    this.onTokenCallback = onToken;
    this.onEndCallback = onEnd;
    this.onErrorCallback = onError;
  }

  public connect(): void {
    this.isManuallyClosed = false;

    // Если соединение уже открыто — ничего не делаем
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.cleanup();

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.flushQueue();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'token') {
            this.onTokenCallback(data.content);
          } else if (data.type === 'end') {
            this.onEndCallback();
          } else if (data.type === 'pong') {
            // Пульс подтвержден
          }
        } catch (err) {
          console.error('WebSocket parse error:', err);
        }
      };

      this.ws.onerror = (err) => {
        if (this.onErrorCallback) this.onErrorCallback(err);
      };

      this.ws.onclose = (event) => {
        this.stopHeartbeat();
        if (!this.isManuallyClosed) {
          this.scheduleReconnect();
        }
      };
    } catch (err) {
      this.scheduleReconnect();
    }
  }

  // 1. ПУЛЬС-МОНИТОРИНГ (КАЖДЫЕ 15 СЕКУНД)
  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify({ type: 'ping' }));
        } catch (e) {
          console.warn('Ping failed:', e);
        }
      }
    }, 15000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // 2. ЭКСПОНЕНЦИАЛЬНЫЙ АВТО-РЕКОННЕКТ
  private scheduleReconnect(): void {
    if (this.isManuallyClosed || this.reconnectTimer) return;

    const delay = Math.min(5000, 500 * Math.pow(1.4, this.reconnectAttempts));
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  // 3. ОТПРАВКА С ОЧЕРЕДЬЮ (ЕСЛИ СЕТЬ ВРЕМЕННО РАЗОРВАНА)
  public sendMessage(payload: object): void {
    const msgStr = JSON.stringify(payload);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(msgStr);
    } else {
      this.messageQueue.push(msgStr);
      this.connect();
    }
  }

  private flushQueue(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift();
      if (msg) {
        try {
          this.ws.send(msg);
        } catch (e) {
          console.error('Error flushing message queue:', e);
        }
      }
    }
  }

  public disconnect(): void {
    this.isManuallyClosed = true;
    this.cleanup();
  }

  private cleanup(): void {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      try {
        this.ws.onopen = null;
        this.ws.onmessage = null;
        this.ws.onerror = null;
        this.ws.onclose = null;
        this.ws.close();
      } catch (e) {
        // ignore
      }
      this.ws = null;
    }
  }
}