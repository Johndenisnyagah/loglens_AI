import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Upload, ShieldAlert, FileText, Settings } from 'lucide-react';

const navItems = [
  { to: '/',          label: 'Dashboard',   icon: LayoutDashboard, end: true  },
  { to: '/upload',    label: 'Upload',      icon: Upload,          end: false },
  { to: '/incidents', label: 'Incidents',   icon: ShieldAlert,     end: false },
  { to: '/reports',   label: 'Reports',     icon: FileText,        end: false },
  { to: '/settings',  label: 'Settings',    icon: Settings,        end: false },
];

export function BottomNavBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);

  function isActive(to: string, end?: boolean) {
    return end ? pathname === to : pathname.startsWith(to);
  }

  return (
    <nav className="shrink-0 border-t border-[#EEF2F5] bg-white px-4 py-2 flex items-center justify-around">
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
            className="flex items-center justify-center"
          >
            <motion.div
              animate={{ width: show ? 'auto' : '2.5rem' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`flex items-center gap-2 h-10 rounded-2xl px-3 overflow-hidden ${
                active
                  ? 'bg-[#000000] text-[#FBFBF8]'
                  : 'text-[#7A92A8] hover:bg-[#F5F7FA] hover:text-[#000000]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={active ? 2.2 : 1.8} />

              <AnimatePresence>
                {show && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs font-semibold whitespace-nowrap overflow-hidden"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </button>
        );
      })}
    </nav>
  );
}
