import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { UploadLogs } from './pages/UploadLogs';
import { Incidents } from './pages/Incidents';
import { IncidentDetail } from './pages/IncidentDetail';
import { Placeholder } from './pages/Placeholder';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="upload" element={<UploadLogs />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="incidents/:id" element={<IncidentDetail />} />
          <Route path="reports" element={<Placeholder title="Reports" subtitle="Report generation is coming soon." />} />
          <Route path="settings" element={<Placeholder title="Settings" subtitle="Settings will be available in a future release." />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
