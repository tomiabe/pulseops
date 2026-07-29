import { Link } from 'react-router-dom';
import { useDashboard } from '../stores/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Activity, Thermometer, Gauge, Vibrate, ChevronRight } from 'lucide-react';
import {
  ResponsiveContainer, Area, AreaChart,
} from 'recharts';

const metricConfig = {
  temperature: { label: 'Temperature', unit: '°C', color: '#ef4444', icon: Thermometer },
  pressure: { label: 'Pressure', unit: ' bar', color: '#6366f1', icon: Gauge },
  vibration: { label: 'Vibration', unit: ' mm/s', color: '#f59e0b', icon: Vibrate },
  efficiency: { label: 'Efficiency', unit: '%', color: '#22c55e', icon: Activity },
};

function MiniChart({ data, color }: { data: { t: number; v: number }[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={80}>
      <AreaChart data={data.slice(-30)}>
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.15} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#grad-${color.replace('#', '')})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function LiveMonitoring() {
  const { machines, telemetry } = useDashboard();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-text">Live Monitoring</h1>
        <p className="text-sm text-text-muted mt-0.5">Real-time sensor telemetry</p>
      </div>

      {machines.map((machine) => {
        const data = telemetry[machine.id];
        return (
          <Link key={machine.id} to={`/machines/${machine.id}`} className="block">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CardTitle>{machine.name}</CardTitle>
                <Badge variant={machine.status === 'healthy' ? 'healthy' : machine.status === 'warning' ? 'warning' : 'critical'}>
                  {machine.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">{machine.location}</span>
                <ChevronRight size={14} className="text-text-muted" />
              </div>
            </CardHeader>
            <CardContent>
              {data ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {(Object.keys(metricConfig) as Array<keyof typeof metricConfig>).map((key) => {
                    const cfg = metricConfig[key];
                    const points = data[key] as { t: number; v: number }[] | undefined;
                    if (!points || points.length === 0) return null;
                    const latest = points[points.length - 1];
                    const Icon = cfg.icon;
                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Icon size={12} className="text-text-muted" />
                          <span className="text-xs font-medium text-text-secondary">{cfg.label}</span>
                        </div>
                        <div className="text-xl font-semibold text-text tabular-nums">
                          {latest.v.toFixed(1)}
                          <span className="text-sm text-text-muted font-normal ml-1">{cfg.unit}</span>
                        </div>
                        <MiniChart data={points} color={cfg.color} />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-text-muted">
                  Waiting for telemetry data...
                </div>
              )}
            </CardContent>
          </Card>
          </Link>
        );
      })}
    </div>
  );
}
