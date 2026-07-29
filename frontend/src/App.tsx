import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Overview } from './pages/Overview';
import { LiveMonitoring } from './pages/LiveMonitoring';
import { Analytics } from './pages/Analytics';
import { Incidents } from './pages/Incidents';
import { MachineDetail } from './pages/MachineDetail';
import { useWebSocket } from './hooks/useWebSocket';

function AppContent() {
  useWebSocket();

  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Overview />} />
        <Route path="/live" element={<LiveMonitoring />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/machines/:id" element={<MachineDetail />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
