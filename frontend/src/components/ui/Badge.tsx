import { cn } from '../../lib/utils';

type BadgeVariant = 'healthy' | 'warning' | 'critical' | 'offline' | 'info' | 'success';

const variants: Record<BadgeVariant, string> = {
  healthy: 'bg-success/10 text-success border-success/20',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  critical: 'bg-danger/10 text-danger border-danger/20',
  offline: 'bg-text-muted/10 text-text-muted border-text-muted/20',
  info: 'bg-accent/10 text-accent border-accent/20',
};

export function Badge({
  variant = 'info',
  children,
  className,
}: {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
    >
      <span className={cn(
        'h-1.5 w-1.5 rounded-full',
        (variant === 'healthy' || variant === 'success') && 'bg-success',
        variant === 'warning' && 'bg-warning',
        variant === 'critical' && 'bg-danger',
        variant === 'offline' && 'bg-text-muted',
        variant === 'info' && 'bg-accent',
      )} />
      {children}
    </span>
  );
}
