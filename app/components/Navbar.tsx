"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/components/AuthProvider";

const links = [
  { href: "/", label: "首页" },
  { href: "/detect", label: "检测" },
  { href: "/train", label: "训练" },
  { href: "/history", label: "记录" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-teal-100">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-teal-700 no-underline shrink-0">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="12" r="6" fill="#ccfbf1" stroke="#0d9488" strokeWidth="2" />
            <path d="M8 28c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          NeckFix
        </Link>

        <div className="flex items-center gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-2.5 py-2 rounded-lg text-sm font-medium transition-colors no-underline ${
                pathname === href
                  ? "bg-teal-50 text-teal-700"
                  : "text-slate-500 hover:text-teal-600 hover:bg-teal-50/50"
              }`}
            >
              {label}
            </Link>
          ))}

          {/* User menu */}
          <div className="relative ml-1" ref={menuRef}>
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
            ) : user ? (
              <>
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold cursor-pointer touch-manipulation select-none"
                >
                  {user.email?.charAt(0).toUpperCase() || "U"}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                    <div className="px-4 py-2 text-sm text-slate-500 truncate border-b border-slate-50">
                      {user.email}
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        setMenuOpen(false);
                        await signOut();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer touch-manipulation select-none"
                    >
                      退出登录
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link
                href="/auth/login"
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-teal-600 text-white no-underline hover:bg-teal-700 transition-colors"
              >
                登录
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
