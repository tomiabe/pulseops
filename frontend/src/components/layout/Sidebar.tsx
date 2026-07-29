import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  BarChart3,
  Siren,
  Circle,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useDashboard } from '../../stores/dashboard';
import { useSidebar } from '../../stores/sidebar';

const nav = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/live', label: 'Live Monitoring', icon: Activity },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/incidents', label: 'Incidents', icon: Siren },
];

function SidebarContent() {
  const connected = useDashboard((s) => s.connected);
  const close = useSidebar((s) => s.close);

  return (
    <>
      <div className="flex items-center justify-between px-5 h-14 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-accent flex items-center justify-center">
            <Activity size={14} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-text">PulseOps</span>
        </div>
        <button onClick={close} className="lg:hidden text-text-muted hover:text-text">
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={close}
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
    </>
  );
}

export function Sidebar() {
  const isOpen = useSidebar((s) => s.isOpen);
  const close = useSidebar((s) => s.close);
  const { pathname } = useLocation();

  useEffect(() => { close(); }, [pathname, close]);

  return (
    <>
      <aside className="hidden lg:flex fixed left-0 top-0 z-40 h-full w-56 border-r border-border bg-surface flex-col">
        <SidebarContent />
      </aside>

      <div
        data-open={isOpen}
        className="fixed inset-0 z-50 lg:hidden pointer-events-none data-[open=true]:pointer-events-auto"
      >
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm opacity-0 data-[open=true]:opacity-100 transition-opacity duration-200"
          data-open={isOpen}
          onClick={close}
        />
        <aside
          data-open={isOpen}
          className="fixed left-0 top-0 h-full w-72 border-r border-border bg-surface flex flex-col shadow-2xl -translate-x-full data-[open=true]:translate-x-0 transition-transform duration-200"
        >
          <SidebarContent />
        </aside>
      </div>
    </>
  );
}
