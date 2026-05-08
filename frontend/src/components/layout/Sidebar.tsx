import { NavLink, useLocation } from 'react-router-dom';
import { Settings, ChevronLeft, ChevronRight } from 'lucide-react';

import logoSrc      from '../../assets/White_logo.png';
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

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

const WHITE_FILTER = 'brightness(0) invert(1)';   // black SVG → white
const DARK_FILTER  = 'brightness(0)';              // black SVG → dark (for ivory active state)

export function Sidebar({ collapsed, onToggle }: Props) {
  const { pathname } = useLocation();

  function isActive(to: string, end?: boolean) {
    return end ? pathname === to : pathname.startsWith(to);
  }

  return (
    <aside
      className="shrink-0 bg-[#111827] flex flex-col rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.18)] transition-[width] duration-300 ease-in-out overflow-hidden my-4 ml-4 sticky top-4 self-start"
      style={{ width: collapsed ? 72 : 240, height: 'calc(100vh - 2rem)' }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="relative px-5 pt-5 pb-5">
        {/* Collapse toggle — top-right corner */}
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-colors"
        >
          {collapsed
            ? <ChevronRight className="w-3.5 h-3.5" />
            : <ChevronLeft  className="w-3.5 h-3.5" />}
        </button>

        {/* Logo + name — centered */}
        <div className={`flex flex-col items-center ${collapsed ? 'mt-1' : 'mt-0'}`}>
          <img
            src={logoSrc}
            alt="LogLens AI"
            className={`rounded-xl object-contain transition-all duration-300 ${
              collapsed ? 'w-[96px] h-[96px]' : 'w-[120px] h-[120px]'
            }`}
          />
          {!collapsed && (
            <p className="font-bold text-white text-base mt-3" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em' }}>LogLens AI</p>
          )}
        </div>
      </div>

      {/* ── Navigation ─────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 flex flex-col justify-center gap-1 -mt-16">
        {navItems.map(({ to, label, icon, end }) => {
          const active = isActive(to, end);
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 rounded-xl transition-all duration-150 overflow-hidden
                ${collapsed ? 'justify-center px-0 py-3 mx-auto w-12' : 'px-3 py-2.5'}
                ${active
                  ? 'bg-[#FAF8F4] text-[#111827]'
                  : 'text-white/50 hover:bg-[#FAF8F4]/10 hover:text-white'
                }`}
            >
              <img
                src={icon}
                alt=""
                className="w-6 h-6 shrink-0"
                style={{
                  filter: active ? DARK_FILTER : WHITE_FILTER,
                  opacity: active ? 0.85 : 0.55,
                }}
              />
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap">{label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Bottom ─────────────────────────────────────────────────── */}
      <div className="px-3 pb-5 pt-3">
        <NavLink
          to="/settings"
          title={collapsed ? 'Settings' : undefined}
          className={`flex items-center gap-3 rounded-xl transition-all duration-150 overflow-hidden
            ${collapsed ? 'justify-center px-0 py-3 mx-auto w-12' : 'px-3 py-2.5'}
            ${isActive('/settings')
              ? 'bg-[#FAF8F4] text-[#111827]'
              : 'text-white/50 hover:bg-[#FAF8F4]/10 hover:text-white'
            }`}
        >
          <Settings
            className="w-6 h-6 shrink-0"
            strokeWidth={1.8}
            style={{ opacity: isActive('/settings') ? 0.85 : 0.55 }}
          />
          {!collapsed && (
            <span className="text-sm font-medium whitespace-nowrap">Settings</span>
          )}
        </NavLink>
      </div>
    </aside>
  );
}
