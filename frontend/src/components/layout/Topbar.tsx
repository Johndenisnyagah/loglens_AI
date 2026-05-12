import { Search, Bell, MoreHorizontal } from 'lucide-react';
import logoSrc from '../../assets/LOGO.png';

export function Topbar() {
  return (
    <header className="h-14 border-b border-[#EEF2F5] flex items-center px-6 gap-4 shrink-0">

      {/* Logo */}
      <div className="flex items-center gap-2.5 shrink-0">
        <img src={logoSrc} alt="LogLens AI" className="w-7 h-7 rounded-lg object-contain" />
        <span
          className="font-bold text-[#000000] text-sm tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          LogLens <span className="text-[#6AA6DA]">AI</span>
        </span>
      </div>

      {/* Search — center */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7A92A8]" strokeWidth={1.8} />
          <input
            type="text"
            placeholder="Search incidents, IPs, rules…"
            className="w-full pl-9 pr-4 py-2 bg-[#F5F7FA] rounded-xl text-sm text-[#000000] placeholder:text-[#7A92A8] border border-transparent focus:outline-none focus:border-[#DBE3E9] focus:bg-white transition"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button className="relative w-8 h-8 rounded-xl bg-[#F5F7FA] flex items-center justify-center text-[#3D5166] hover:bg-[#EEF2F5] transition-colors">
          <Bell className="w-3.5 h-3.5" strokeWidth={1.8} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#6AA6DA]" />
        </button>
        <button className="w-8 h-8 rounded-xl bg-[#F5F7FA] flex items-center justify-center text-[#3D5166] hover:bg-[#EEF2F5] transition-colors">
          <MoreHorizontal className="w-3.5 h-3.5" strokeWidth={1.8} />
        </button>
        <div className="w-8 h-8 rounded-xl bg-[#000000] flex items-center justify-center text-[#FBFBF8] text-[10px] font-bold select-none ml-1">
          LL
        </div>
      </div>

    </header>
  );
}
