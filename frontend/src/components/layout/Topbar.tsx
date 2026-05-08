import { Search, Bell } from 'lucide-react';

export function Topbar() {
  return (
    <header className="h-16 border-b border-[#F3F4F6] flex items-center px-7 gap-5 shrink-0">
      {/* Search */}
      <div className="relative w-72">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" strokeWidth={1.8} />
        <input
          type="text"
          placeholder="Search…"
          className="w-full pl-10 pr-4 py-2.5 bg-[#F9FAFB] rounded-xl text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:bg-white border border-transparent focus:border-[#7C3AED]/20 transition"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 ml-auto">
        <button className="relative w-10 h-10 rounded-xl bg-[#F9FAFB] flex items-center justify-center text-[#6B7280] hover:bg-[#F3F4F6] transition-colors">
          <Bell className="w-4 h-4" strokeWidth={1.8} />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
        </button>

        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center text-white text-xs font-bold shadow-sm select-none cursor-pointer">
          LL
        </div>
      </div>
    </header>
  );
}
