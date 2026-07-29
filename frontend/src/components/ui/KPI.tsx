import { cn, formatNumber } from '../../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from './Card';

interface KPIProps {
  label: string;
  value: string;
  change: number;
  unit?: string;
  className?: string;
}

export function KPICard({ label, value, change, unit, className }: KPIProps) {
  const isPositive = change >= 0;
  return (
    <Card className={cn('', className)}>
      <CardContent className="space-y-1.5">
        <p className="text-xs font-medium text-text-secondary">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold text-text tracking-tight">{value}</span>
          {unit && <span className="text-sm text-text-muted">{unit}</span>}
        </div>
        <div className={cn(
          'flex items-center gap-1 text-xs font-medium',
          isPositive ? 'text-success' : 'text-danger'
        )}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{isPositive ? '+' : ''}{formatNumber(change)}%</span>
          <span className="text-text-muted font-normal">vs yesterday</span>
        </div>
      </CardContent>
    </Card>
  );
}
