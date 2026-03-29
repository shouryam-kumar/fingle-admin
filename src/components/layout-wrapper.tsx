"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname.startsWith("/auth/");

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-4 pt-16 lg:pt-8 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
