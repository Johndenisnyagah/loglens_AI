import { Outlet } from 'react-router-dom';
import { TopNavBar } from './TopNavBar';

export function AppLayout() {
  return (
    <div className="h-screen overflow-hidden bg-white flex flex-col">
      <TopNavBar />
      <main className="flex-1 overflow-auto">
        <div className="px-8 py-6 min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
