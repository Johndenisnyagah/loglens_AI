import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#FAF8F4] p-4 gap-4">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      {/* Main content card — mirrors the sidebar card aesthetic */}
      <div className="flex-1 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-auto">
          <div className="px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
