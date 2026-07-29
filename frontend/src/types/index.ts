export interface TelemetryPoint {
  t: number;
  v: number;
}

export interface MachineTelemetry {
  machineId: string;
  temperature: TelemetryPoint[];
  pressure: TelemetryPoint[];
  vibration: TelemetryPoint[];
  efficiency: TelemetryPoint[];
  rpm: TelemetryPoint[];
}

export interface Machine {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  temperature: number;
  pressure: number;
  vibration: number;
  efficiency: number;
  uptime: number;
  utilization: number;
  location: string;
}

export interface Alert {
  id: string;
  machineId: string;
  machineName: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: number;
  acknowledged: boolean;
}

export interface KPI {
  label: string;
  value: string;
  change: number;
  unit?: string;
}

export interface Insight {
  id: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  description: string;
  timestamp: number;
}

export interface DashboardState {
  machines: Machine[];
  alerts: Alert[];
  insights: Insight[];
  kpis: KPI[];
  telemetry: Record<string, MachineTelemetry>;
  connected: boolean;
  lastUpdate: number | null;
}
