import { Outlet } from 'react-router-dom';
import { Menu, Circle } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useSidebar } from '../../stores/sidebar';
import { useDashboard } from '../../stores/dashboard';
import { cn } from '../../lib/utils';

function MobileHeader() {
  const toggle = useSidebar((s) => s.toggle);
  const connected = useDashboard((s) => s.connected);

  return (
    <header className="lg:hidden flex items-center justify-between h-14 px-4 border-b border-border bg-surface">
      <button onClick={toggle} className="text-text-muted hover:text-text">
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-md bg-accent flex items-center justify-center">
          <Circle size={10} className="text-white" fill="currentColor" />
        </div>
        <span className="text-sm font-semibold text-text">PulseOps</span>
      </div>

      <Circle
        size={8}
        className={cn(connected ? 'text-success' : 'text-danger')}
        fill="currentColor"
      />
    </header>
  );
}

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <MobileHeader />
      <main className="lg:pl-56 pt-14 lg:pt-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
