'use client';

import { useState, useEffect, useRef } from 'react';

export function useWebSocket(url: string) {
  const [data, setData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let ws: WebSocket;
    let timer: NodeJS.Timeout;

    const connect = () => {
      try {
        ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          setError(null);
        };

        ws.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            setData(parsed);
          } catch (e) {
            console.error('Failed to parse WebSocket message:', e);
          }
        };

        ws.onerror = (err) => {
          setError('WebSocket Connection Error');
          setIsConnected(false);
        };

        ws.onclose = () => {
          setIsConnected(false);
          // Auto-reconnect after 3 seconds
          timer = setTimeout(connect, 3000);
        };
      } catch (err: any) {
        setError(err.message || 'Failed to establish WebSocket connection');
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      if (timer) clearTimeout(timer);
      if (wsRef.current) wsRef.current.close();
    };
  }, [url]);

  return { data, isConnected, error };
}
