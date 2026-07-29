import { useEffect, useRef, useCallback } from 'react';
import { useDashboard } from '../stores/dashboard';

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const {
    setMachines,
    updateMachine,
    addAlert,
    setKpis,
    setInsights,
    updateTelemetry,
    setConnected,
    setLastUpdate,
  } = useDashboard();

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const url = `${protocol}//${host}/ws`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setLastUpdate(Date.now());

        switch (msg.type) {
          case 'init':
            setMachines(msg.machines);
            setKpis(msg.kpis);
            setInsights(msg.insights);
            if (msg.telemetry) {
              Object.entries(msg.telemetry).forEach(([id, data]) => {
                updateTelemetry(id, data as any);
              });
            }
            break;
          case 'telemetry':
            updateTelemetry(msg.machineId, msg.data);
            break;
          case 'machine_update':
            updateMachine(msg.machine);
            break;
          case 'alert':
            addAlert(msg.alert);
            break;
          case 'kpis':
            setKpis(msg.kpis);
            break;
        }
      } catch (e) {
        console.error('WS parse error', e);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => ws.close();
  }, []);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return wsRef;
}
