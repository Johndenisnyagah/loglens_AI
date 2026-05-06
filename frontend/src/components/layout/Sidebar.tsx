import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  ShieldAlert,
  FileText,
  Settings,
  Shield,
} from 'lucide-react';

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard',   end: true },
  { to: '/upload',    icon: Upload,          label: 'Upload Logs'           },
  { to: '/incidents', icon: ShieldAlert,     label: 'Incidents'             },
  { to: '/reports',   icon: FileText,        label: 'Reports'               },
];

export function Sidebar() {
  const { pathname } = useLocation();

  function active(to: string, end?: boolean) {
    return end ? pathname === to : pathname.startsWith(to);
  }

  return (
    <aside className="w-14 shrink-0 flex flex-col items-center py-5 gap-1 bg-[#EEECEA]">
      {/* Logo mark */}
      <div className="w-9 h-9 rounded-xl bg-[#5B7FD4] flex items-center justify-center mb-5 shadow-sm">
        <Shield className="w-4 h-4 text-white" strokeWidth={2.5} />
      </div>

      {/* Navigation icons */}
      <div className="flex flex-col items-center gap-1 flex-1">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={label}
            className={() =>
              `w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 ${
                active(to, end)
                  ? 'bg-[#E2E0DA] text-[#1C1C1E] shadow-sm'
                  : 'text-[#9A9994] hover:bg-[#E8E6E0] hover:text-[#1C1C1E]'
              }`
            }
          >
            <Icon className="w-[18px] h-[18px]" strokeWidth={active(to, end) ? 2.2 : 1.8} />
          </NavLink>
        ))}
      </div>

      {/* Settings pinned at bottom */}
      <NavLink
        to="/settings"
        title="Settings"
        className={() =>
          `w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 ${
            active('/settings')
              ? 'bg-[#E2E0DA] text-[#1C1C1E] shadow-sm'
              : 'text-[#9A9994] hover:bg-[#E8E6E0] hover:text-[#1C1C1E]'
          }`
        }
      >
        <Settings className="w-[18px] h-[18px]" strokeWidth={active('/settings') ? 2.2 : 1.8} />
      </NavLink>
    </aside>
  );
}
