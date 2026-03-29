"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    document.body.style.backgroundColor = dark ? "#0a0a0f" : "#f8fafc";
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-sm hover:bg-white/[0.08] transition-colors"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
