import { useMemo } from 'react';
import { useDashboard } from '../stores/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { formatTimestamp } from '../lib/utils';
import { cn } from '../lib/utils';
import { AlertTriangle, CheckCircle2, Clock, Info } from 'lucide-react';

export function Incidents() {
  const { alerts, insights } = useDashboard();

  const events = useMemo(() =>
    [
      ...insights.map((i) => ({ ...i, kind: 'insight' as const })),
      ...alerts.map((a) => ({
        id: a.id,
        type: a.severity === 'critical' ? 'critical' as const : a.severity === 'warning' ? 'warning' as const : 'info' as const,
        title: a.message,
        description: `${a.metric}: ${a.value.toFixed(1)} (threshold: ${a.threshold})`,
        timestamp: a.timestamp,
        kind: 'alert' as const,
      })),
    ].sort((a, b) => b.timestamp - a.timestamp),
    [alerts, insights]
  );

  const typeConfig = {
    critical: { icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/10' },
    warning: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
    info: { icon: Info, color: 'text-accent', bg: 'bg-accent/10' },
    success: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-text">Incidents</h1>
        <p className="text-sm text-text-muted mt-0.5">Event timeline</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          <Badge variant="info">{events.length} events</Badge>
        </CardHeader>
        <CardContent className="p-0">
          {events.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-text-muted">
              No events recorded yet
            </div>
          ) : (
            <div className="divide-y divide-border">
              {events.slice(0, 50).map((event) => {
                const cfg = typeConfig[event.type] || typeConfig.info;
                const Icon = cfg.icon;
                return (
                  <div key={event.id} className="flex gap-4 px-5 py-4 hover:bg-surface/50 transition-colors">
                    <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0', cfg.bg)}>
                      <Icon size={14} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text truncate">{event.title}</span>
                        <Badge variant={event.type === 'critical' ? 'critical' : event.type === 'warning' ? 'warning' : event.type === 'success' ? 'success' : 'info'}>
                          {event.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{event.description}</p>
                      <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-text-muted">
                        <Clock size={10} />
                        {formatTimestamp(event.timestamp)}
                        {event.kind === 'alert' && <span className="text-text-muted/60">• Alert</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


