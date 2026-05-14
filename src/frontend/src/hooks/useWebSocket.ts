import { useEffect, useRef, useState } from 'react';

export type ConnectionState = 'connecting' | 'connected' | 'disconnected';

const WS_URL = `ws://${window.location.hostname}:3000`;
const RECONNECT_BASE = 1000;
const RECONNECT_MAX = 10000;

export function useWebSocket(sessionToken?: string | null) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [lastMessage, setLastMessage] = useState<Record<string, unknown> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const sessionTokenRef = useRef(sessionToken);
  sessionTokenRef.current = sessionToken;

  const connectRef = useRef<() => void>();

  useEffect(() => {
    connectRef.current = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
        return;
      }

      setConnectionState('connecting');
      const token = sessionTokenRef.current;
      const wsUrl = token ? `${WS_URL}?session=${encodeURIComponent(token)}` : WS_URL;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setConnectionState('connected');
        retriesRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as Record<string, unknown>;
          setLastMessage(data);
        } catch {
          // ignore non-JSON messages
        }
      };

      ws.onclose = () => {
        setConnectionState('disconnected');
        wsRef.current = null;
        scheduleReconnect();
      };

      ws.onerror = () => {
        ws.close();
      };

      wsRef.current = ws;
    };
  });

  function scheduleReconnect() {
    const delay = Math.min(RECONNECT_BASE * Math.pow(2, retriesRef.current), RECONNECT_MAX);
    retriesRef.current += 1;
    timerRef.current = setTimeout(() => connectRef.current?.(), delay);
  }

  useEffect(() => {
    connectRef.current?.();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      wsRef.current?.close();
    };
  }, [sessionToken]);

  return { connectionState, lastMessage };
}
