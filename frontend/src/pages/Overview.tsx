import { Link } from 'react-router-dom';
import { useDashboard } from '../stores/dashboard';
import { KPICard } from '../components/ui/KPI';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { formatTimestamp } from '../lib/utils';
import {
  AlertTriangle,
  Clock,
  Cpu,
  HardDrive,
  Radio,
  ChevronRight,
} from 'lucide-react';

const machineIcons = [Cpu, HardDrive, Radio, Cpu, HardDrive, Radio];

export function Overview() {
  const { machines, alerts, kpis, insights } = useDashboard();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text">Overview</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Real-time operations summary
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Assets</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {machines.map((m, i) => {
                const Icon = machineIcons[i % machineIcons.length];
                return (
                  <Link
                    key={m.id}
                    to={`/machines/${m.id}`}
                    className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-3.5 hover:bg-surface/50 transition-colors group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Icon size={14} className="text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate">{m.name}</p>
                      <p className="text-xs text-text-muted">{m.location}</p>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 text-xs text-text-secondary shrink-0 whitespace-nowrap">
                      <span>{m.temperature.toFixed(1)}°C</span>
                      <span>{m.efficiency.toFixed(1)}%</span>
                    </div>
                    <Badge variant={m.status === 'healthy' ? 'healthy' : m.status === 'warning' ? 'warning' : m.status === 'critical' ? 'critical' : 'offline'} className="shrink-0">
                      {m.status}
                    </Badge>
                    <ChevronRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
              <Badge variant={alerts.filter(a => !a.acknowledged).length > 0 ? 'warning' : 'healthy'}>
                {alerts.filter(a => !a.acknowledged).length} active
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {alerts.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-text-muted">
                  No active alerts
                </div>
              ) : (
                <div className="divide-y divide-border max-h-[320px] overflow-y-auto">
                  {alerts.slice(0, 5).map((a) => (
                    <div key={a.id} className="px-5 py-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={12} className={a.severity === 'critical' ? 'text-danger' : a.severity === 'warning' ? 'text-warning' : 'text-accent'} />
                        <span className="text-xs font-medium text-text truncate">{a.message}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {formatTimestamp(a.timestamp)}
                        </span>
                        <span>{a.machineName}</span>
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
              {insights.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-text-muted">
                  No insights yet
                </div>
              ) : (
                <div className="divide-y divide-border max-h-[200px] overflow-y-auto">
                  {insights.slice(0, 3).map((ins) => (
                    <div key={ins.id} className="px-5 py-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          ins.type === 'critical' && 'bg-danger',
                          ins.type === 'warning' && 'bg-warning',
                          ins.type === 'success' && 'bg-success',
                          ins.type === 'info' && 'bg-accent',
                        )} />
                        <span className="text-xs font-medium text-text">{ins.title}</span>
                      </div>
                      <p className="text-xs text-text-muted leading-relaxed">{ins.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
