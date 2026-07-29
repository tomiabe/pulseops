import { useParams, useNavigate } from 'react-router-dom';
import { useDashboard } from '../stores/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { formatTimestamp } from '../lib/utils';
import { ArrowLeft, Thermometer, Gauge, Vibrate, Activity, Clock, Cpu, AlertTriangle } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';

const metricConfig = {
  temperature: { label: 'Temperature', unit: '°C', color: '#ef4444', icon: Thermometer },
  pressure: { label: 'Pressure', unit: ' bar', color: '#6366f1', icon: Gauge },
  vibration: { label: 'Vibration', unit: ' mm/s', color: '#f59e0b', icon: Vibrate },
  efficiency: { label: 'Efficiency', unit: '%', color: '#22c55e', icon: Activity },
};

function Sparkline({ data, color }: { data: { t: number; v: number }[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`md-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.12} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#md-${color.replace('#', '')})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MachineDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { machines, telemetry, alerts, insights } = useDashboard();

  const machine = machines.find((m) => m.id === id);
  const data = id ? telemetry[id] : undefined;

  const machineAlerts = useMemo(
    () => alerts.filter((a) => a.machineId === id).slice(-10),
    [alerts, id]
  );

  const machineInsights = useMemo(
    () => insights.filter((i) => i.title.includes(machine?.name ?? '__none__')).slice(-5),
    [insights, machine?.name]
  );

  if (!machine) {
    return (
      <div className="flex items-center justify-center h-64 text-text-muted">
        Machine not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors">
        <ArrowLeft size={14} />
        Back
      </button>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Cpu size={18} className="text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-text">{machine.name}</h1>
              <Badge variant={machine.status === 'healthy' ? 'healthy' : machine.status === 'warning' ? 'warning' : 'critical'}>
                {machine.status}
              </Badge>
            </div>
            <p className="text-sm text-text-muted">{machine.location}</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm text-text-secondary">
          <div className="text-right">
            <p className="text-xs text-text-muted">Uptime</p>
            <p className="font-medium text-text">
              {Math.floor(machine.uptime / 3600)}h {Math.floor((machine.uptime % 3600) / 60)}m
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-muted">Utilization</p>
            <p className="font-medium text-text">{machine.utilization.toFixed(0)}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(Object.keys(metricConfig) as Array<keyof typeof metricConfig>).map((key) => {
          const cfg = metricConfig[key];
          const points = data?.[key] ?? [];
          const latest = points.length > 0 ? points[points.length - 1] : { v: 0 };
          return (
            <Card key={key}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <cfg.icon size={13} className="text-text-muted" />
                    <span className="text-xs font-medium text-text-secondary">{cfg.label}</span>
                  </div>
                  <span className="text-lg font-semibold text-text tabular-nums">
                    {latest.v.toFixed(1)}
                    <span className="text-xs text-text-muted font-normal ml-1">{cfg.unit}</span>
                  </span>
                </div>
                <Sparkline data={points} color={cfg.color} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
            <Badge variant={machineAlerts.length > 0 ? 'warning' : 'healthy'}>
              {machineAlerts.length}
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            {machineAlerts.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-text-muted">
                No alerts for this machine
              </div>
            ) : (
              <div className="divide-y divide-border">
                {machineAlerts.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 px-5 py-3">
                    <AlertTriangle size={12} className={a.severity === 'critical' ? 'text-danger shrink-0 mt-0.5' : 'text-warning shrink-0 mt-0.5'} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text truncate">{a.message}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-text-muted">
                        <Clock size={9} />
                        {formatTimestamp(a.timestamp)}
                        <span>{a.metric}: {a.value.toFixed(1)} (threshold: {a.threshold})</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Insights</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {machineInsights.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-text-muted">
                No insights generated for this machine yet. Insights appear when anomalous patterns are detected.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {machineInsights.map((ins) => (
                  <div key={ins.id} className="px-5 py-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                      <span className="text-xs font-medium text-text">{ins.title}</span>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed">{ins.description}</p>
                    <p className="text-[11px] text-text-muted flex items-center gap-1">
                      <Clock size={9} />
                      {formatTimestamp(ins.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
