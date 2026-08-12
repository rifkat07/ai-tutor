export class ChatWebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private onTokenCallback: (token: string) => void;
  private onEndCallback: () => void;

  constructor(
    sessionId: string,
    onToken: (token: string) => void,
    onEnd: () => void
  ) {
    const wsBase = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
    this.url = `${wsBase}/api/v1/chat/ws/${sessionId}`;
    this.onTokenCallback = onToken;
    this.onEndCallback = onEnd;
  }

  public connect(): void {
    this.ws = new WebSocket(this.url);

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'token') {
          this.onTokenCallback(data.content);
        } else if (data.type === 'end') {
          this.onEndCallback();
        }
      } catch (err) {
        console.error('WebSocket Error:', err);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket Connection Closed');
    };
  }

  public sendMessage(payload: object): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
    }
  }
}