import { NavLink, useLocation } from 'react-router-dom';
import { Settings } from 'lucide-react';

import dashboardSrc from '../../assets/dashboard.svg';
import uploadSrc    from '../../assets/upload.svg';
import incidentsSrc from '../../assets/incidents.svg';
import reportsSrc   from '../../assets/reports.svg';

const navItems = [
  { to: '/',          label: 'Dashboard',   icon: dashboardSrc,  end: true },
  { to: '/upload',    label: 'Upload Logs', icon: uploadSrc               },
  { to: '/incidents', label: 'Incidents',   icon: incidentsSrc            },
  { to: '/reports',   label: 'Reports',     icon: reportsSrc              },
];

// Make black SVG icons match the text color
const ACTIVE_FILTER  = 'brightness(0) saturate(100%) invert(55%) sepia(60%) saturate(400%) hue-rotate(180deg)'; // → Cornflower blue
const DEFAULT_FILTER = 'brightness(0) opacity(0.45)'; // → muted gray

export function Sidebar() {
  const { pathname } = useLocation();

  function isActive(to: string, end?: boolean) {
    return end ? pathname === to : pathname.startsWith(to);
  }

  return (
    <aside className="w-52 shrink-0 border-r border-[#EEF2F5] flex flex-col overflow-y-auto">

      {/* Top spacer — pushes nav to vertical center */}
      <div className="flex-1" />

      {/* Navigation — vertically centered */}
      <div className="px-4">
        <div className="space-y-0.5">
          {navItems.map(({ to, label, icon, end }) => {
            const active = isActive(to, end);
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                  active
                    ? 'bg-[#EEF2F5] text-[#000000] font-semibold'
                    : 'text-[#7A92A8] hover:bg-[#F5F7FA] hover:text-[#000000]'
                }`}
              >
                <img
                  src={icon}
                  alt=""
                  className="w-4 h-4 shrink-0"
                  style={{ filter: active ? ACTIVE_FILTER : DEFAULT_FILTER }}
                />
                {label}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Bottom spacer — slightly larger than top to shift items above center */}
      <div className="flex-1 mb-8" />

      {/* Settings pinned at bottom */}
      <div className="px-4 pb-5 border-t border-[#EEF2F5] pt-4">
        <NavLink
          to="/settings"
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
            isActive('/settings')
              ? 'bg-[#EEF2F5] text-[#000000] font-semibold'
              : 'text-[#7A92A8] hover:bg-[#F5F7FA] hover:text-[#000000]'
          }`}
        >
          <Settings
            className={`w-4 h-4 shrink-0 ${isActive('/settings') ? 'text-[#6AA6DA]' : 'text-[#7A92A8]'}`}
            strokeWidth={isActive('/settings') ? 2.2 : 1.8}
          />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
