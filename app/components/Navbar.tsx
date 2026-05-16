"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "首页" },
  { href: "/detect", label: "检测" },
  { href: "/train", label: "训练" },
  { href: "/history", label: "记录" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-teal-100">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-teal-700 no-underline">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="12" r="6" fill="#ccfbf1" stroke="#0d9488" strokeWidth="2" />
            <path d="M8 28c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          NeckFix
        </Link>
        <div className="flex gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors no-underline ${
                pathname === href
                  ? "bg-teal-50 text-teal-700"
                  : "text-slate-500 hover:text-teal-600 hover:bg-teal-50/50"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
