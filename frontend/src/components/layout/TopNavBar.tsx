import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Upload, ShieldAlert,
  FileText, Settings, Bell,
} from 'lucide-react';
import logoSrc from '../../assets/LOGO.png';

const navItems = [
  { to: '/',          label: 'Dashboard', icon: LayoutDashboard, end: true  },
  { to: '/upload',    label: 'Upload',    icon: Upload,          end: false },
  { to: '/incidents', label: 'Incidents', icon: ShieldAlert,     end: false },
  { to: '/reports',   label: 'Reports',   icon: FileText,        end: false },
  { to: '/settings',  label: 'Settings',  icon: Settings,        end: false },
];

export function TopNavBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);

  function isActive(to: string, end?: boolean) {
    return end ? pathname === to : pathname.startsWith(to);
  }

  return (
    <div className="px-5 pt-4 pb-0 shrink-0">
      <div className="bg-[#F5F7FA] border border-[#EEF2F5] rounded-2xl flex items-center px-3 py-2 gap-3">

        {/* Logo */}
        <div className="flex items-center gap-2 pr-3 border-r border-[#EEF2F5] shrink-0">
          <img src={logoSrc} alt="LogLens AI" className="w-6 h-6 rounded-lg object-contain" />
          <span
            className="font-bold text-[#000000] text-sm tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            LogLens <span className="text-[#6AA6DA]">AI</span>
          </span>
        </div>

        {/* Nav items — truly centered */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon, end }) => {
              const active = isActive(to, end);
              const show   = active || hovered === to;

              return (
                <button
                  key={to}
                  onClick={() => navigate(to)}
                  onMouseEnter={() => setHovered(to)}
                  onMouseLeave={() => setHovered(null)}
                  aria-label={label}
                >
                  <motion.div
                    animate={{ width: show ? 'auto' : '2rem' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className={`flex items-center gap-1.5 h-8 rounded-xl px-2 overflow-hidden transition-colors ${
                      active
                        ? 'bg-[#000000] text-[#FBFBF8]'
                        : 'text-[#7A92A8] hover:bg-[#EEF2F5] hover:text-[#000000]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={active ? 2.2 : 1.8} />
                    <AnimatePresence>
                      {show && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.15 }}
                          className="text-xs font-semibold whitespace-nowrap"
                        >
                          {label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 pl-3 border-l border-[#EEF2F5] shrink-0">
          <button className="relative w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#3D5166] hover:bg-[#EEF2F5] transition-colors">
            <Bell className="w-3.5 h-3.5" strokeWidth={1.8} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#6AA6DA]" />
          </button>
          <div className="w-8 h-8 rounded-xl bg-[#000000] flex items-center justify-center text-[#FBFBF8] text-[10px] font-bold select-none">
            LL
          </div>
        </div>

      </div>
    </div>
  );
}
