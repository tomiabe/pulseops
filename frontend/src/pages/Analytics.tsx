import { useDashboard } from '../stores/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Area, AreaChart, ReferenceLine, ReferenceArea,
} from 'recharts';

function ControlChart({
  data,
  metric,
  unit,
  color,
}: {
  data: { t: number; v: number }[];
  metric: string;
  unit: string;
  color: string;
}) {
  const values = data.map((d) => d.v);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const std = Math.sqrt(values.reduce((sq, v) => sq + (v - mean) ** 2, 0) / values.length);
  const ucl = mean + 3 * std;
  const lcl = mean - 3 * std;
  const usl = mean + 2 * std;
  const lsl = mean - 2 * std;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary">
          {metric} Control Chart
        </span>
        <div className="flex items-center gap-3 text-[11px] text-text-muted">
          <span>Mean: {mean.toFixed(1)}</span>
          <span>σ: {std.toFixed(2)}</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data.slice(-60)}>
          <defs>
            <linearGradient id={`ctrl-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.08} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="t" tick={false} axisLine={false} />
          <YAxis domain={[lcl - std, ucl + std]} tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} width={50} />
          <Tooltip
            contentStyle={{ background: '#1f1f23', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px' }}
            labelFormatter={() => ''}
            formatter={(value: unknown) => [`${Number(value).toFixed(2)}${unit}`, metric]}
          />
          <ReferenceLine y={mean} stroke="#6366f1" strokeDasharray="4 4" strokeWidth={1} />
          <ReferenceLine y={ucl} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1} />
          <ReferenceLine y={lcl} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1} />
          <ReferenceArea y1={lsl} y2={usl} fill="#22c55e" fillOpacity={0.04} />
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#ctrl-${metric})`} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 text-[11px] text-text-muted">
        <span className="flex items-center gap-1"><span className="h-1 w-3 rounded bg-accent/50" /> Mean</span>
        <span className="flex items-center gap-1"><span className="h-1 w-3 rounded bg-danger/50" /> UCL/LCL (±3σ)</span>
        <span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-success/20" /> Target zone (±2σ)</span>
      </div>
    </div>
  );
}

export function Analytics() {
  const { machines, telemetry } = useDashboard();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-text">Analytics</h1>
        <p className="text-sm text-text-muted mt-0.5">Statistical process control</p>
      </div>

      {machines.map((machine) => {
        const data = telemetry[machine.id];
        if (!data) return null;

        return (
          <Card key={machine.id}>
            <CardHeader>
              <CardTitle>{machine.name}</CardTitle>
              <Badge variant="info">SPC Active</Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                {(['temperature', 'pressure', 'vibration', 'efficiency'] as const).map((key) => {
                  const points = data[key];
                  if (!points || points.length < 5) return null;
                  const colors = { temperature: '#ef4444', pressure: '#6366f1', vibration: '#f59e0b', efficiency: '#22c55e' };
                  const units = { temperature: '°C', pressure: ' bar', vibration: ' mm/s', efficiency: '%' };
                  return (
                    <ControlChart
                      key={key}
                      data={points}
                      metric={key.charAt(0).toUpperCase() + key.slice(1)}
                      unit={units[key]}
                      color={colors[key]}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
