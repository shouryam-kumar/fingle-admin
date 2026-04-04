"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  {
    title: "Dashboard",
    items: [
      { href: "/", label: "Overview", icon: "📊" },
      { href: "/retention", label: "Retention", icon: "🔄" },
      { href: "/engagement", label: "Engagement", icon: "⚡" },
      { href: "/content", label: "Content", icon: "🎬" },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { href: "/users", label: "Users", icon: "👥" },
      { href: "/search", label: "User Search", icon: "🔍" },
      { href: "/funnel", label: "Funnel", icon: "🔻" },
      { href: "/devices", label: "Devices", icon: "📱" },
    ],
  },
  {
    title: "Real-time",
    items: [
      { href: "/live", label: "Live Feed", icon: "🔴" },
      { href: "/monitoring", label: "System Health", icon: "🏥" },
    ],
  },
  {
    title: "Moderation",
    items: [
      { href: "/moderation", label: "Reports & Users", icon: "🛡️" },
    ],
  },
  {
    title: "Admin",
    items: [
      { href: "/settings", label: "Settings", icon: "⚙️" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-[#12121a] border border-white/[0.08] flex items-center justify-center text-white"
      >
        ☰
      </button>

      {/* Backdrop */}
      {open && <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setOpen(false)} />}

    <aside className={`w-64 bg-[#0d0d14] border-r border-white/5 flex flex-col fixed lg:relative inset-y-0 left-0 z-50 transform transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <div>
            <h1 className="text-base font-semibold text-white">Fingle</h1>
            <p className="text-[11px] text-gray-500 font-medium tracking-wide uppercase">Analytics</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 mt-2 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.title} className="mb-4">
            <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider px-3 mb-2">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-purple-500/20 to-violet-500/10 text-purple-300 shadow-lg shadow-purple-500/5"
                        : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]"
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-2 px-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-[11px] text-gray-600">Live data</p>
        </div>
      </div>
    </aside>
    </>
  );
}
