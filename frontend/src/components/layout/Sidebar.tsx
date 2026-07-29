import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  BarChart3,
  Siren,
  Circle,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useDashboard } from '../../stores/dashboard';

const nav = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/live', label: 'Live Monitoring', icon: Activity },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/incidents', label: 'Incidents', icon: Siren },
];

export function Sidebar() {
  const connected = useDashboard((s) => s.connected);

  return (
    <aside className="fixed left-0 top-0 z-40 h-full w-56 border-r border-border bg-surface flex flex-col">
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-border">
        <div className="h-7 w-7 rounded-lg bg-accent flex items-center justify-center">
          <Activity size={14} className="text-white" />
        </div>
        <span className="text-sm font-semibold text-text">PulseOps</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-secondary hover:text-text hover:bg-surface/50'
              )
            }
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-border">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <Circle
              size={6}
              className={cn(connected ? 'text-success' : 'text-danger')}
              fill="currentColor"
            />
            {connected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </div>
    </aside>
  );
}
