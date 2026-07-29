import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function Card({
  className,
  children,
  ...props
}: { className?: string; children?: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-xl border border-border bg-card', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
}: { className?: string; children?: ReactNode }) {
  return (
    <div className={cn('flex items-center justify-between px-5 py-4 border-b border-border', className)}>
      {children}
    </div>
  );
}

export function CardContent({
  className,
  children,
}: { className?: string; children?: ReactNode }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}

export function CardTitle({
  className,
  children,
}: { className?: string; children?: ReactNode }) {
  return <h3 className={cn('text-sm font-medium text-text', className)}>{children}</h3>;
}
