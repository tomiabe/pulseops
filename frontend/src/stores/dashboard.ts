import { create } from 'zustand';
import type { DashboardState, Machine, Alert, Insight, KPI, MachineTelemetry } from '../types';

interface DashboardActions {
  setMachines: (machines: Machine[]) => void;
  updateMachine: (machine: Machine) => void;
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  setInsights: (insights: Insight[]) => void;
  setKpis: (kpis: KPI[]) => void;
  updateTelemetry: (machineId: string, data: Partial<MachineTelemetry>) => void;
  setConnected: (connected: boolean) => void;
  setLastUpdate: (ts: number) => void;
}

const initialState: DashboardState = {
  machines: [],
  alerts: [],
  insights: [],
  kpis: [],
  telemetry: {},
  connected: false,
  lastUpdate: null,
};

export const useDashboard = create<DashboardState & DashboardActions>((set) => ({
  ...initialState,
  setMachines: (machines) => set({ machines }),
  updateMachine: (machine) =>
    set((state) => ({
      machines: state.machines.map((m) => (m.id === machine.id ? machine : m)),
    })),
  setAlerts: (alerts) => set({ alerts }),
  addAlert: (alert) =>
    set((state) => ({ alerts: [alert, ...state.alerts].slice(0, 50) })),
  setInsights: (insights) => set({ insights }),
  setKpis: (kpis) => set({ kpis }),
  updateTelemetry: (machineId, data) =>
    set((state) => {
      const existing = state.telemetry[machineId]
      const merged: Record<string, unknown> = { machineId }
      const keys = ['temperature', 'pressure', 'vibration', 'efficiency', 'rpm'] as const
      for (const key of keys) {
        const newPoints = (data as Record<string, unknown>)[key] as { t: number; v: number }[] | undefined
        if (newPoints) {
          const existingPoints = existing?.[key] ?? []
          merged[key] = [...existingPoints, ...newPoints].slice(-120)
        }
      }
      return {
        telemetry: {
          ...state.telemetry,
          [machineId]: { ...existing, ...merged } as MachineTelemetry,
        },
      }
    }),
  setConnected: (connected) => set({ connected }),
  setLastUpdate: (ts) => set({ lastUpdate: ts }),
}));
