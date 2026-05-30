"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  /* ── scroll-aware shadow ── */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── outside-click closes user dropdown ── */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ── lock body scroll when mobile menu open ── */
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const userInitial = user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <>
      <nav
        className={`sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-teal-100/60 transition-shadow duration-500 ${
          scrolled ? "shadow-lg" : "shadow-none"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* ── Logo ── */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg text-teal-700 no-underline shrink-0"
          >
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <circle
                cx="16"
                cy="12"
                r="6"
                fill="#ccfbf1"
                stroke="#0d9488"
                strokeWidth="2"
              />
              <path
                d="M8 28c0-4.418 3.582-8 8-8s8 3.582 8 8"
                stroke="#0d9488"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            NeckFix
          </Link>

          {/* ── Desktop nav links (hidden on mobile) ── */}
          <div className="hidden sm:flex items-center gap-1">
            {links.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-2.5 py-2 rounded-lg text-sm font-medium no-underline transition-colors ${
                    isActive
                      ? "text-teal-700"
                      : "text-slate-500 hover:text-teal-600"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-teal-50 rounded-lg"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </Link>
              );
            })}
          </div>

          {/* ── Right side: user menu + mobile hamburger ── */}
          <div className="flex items-center gap-2">
            {/* User section */}
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
            ) : user ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold cursor-pointer touch-manipulation select-none hover:ring-2 hover:ring-teal-300/50 transition-shadow"
                >
                  {userInitial}
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50"
                    >
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-teal-600 text-white no-underline hover:bg-teal-700 transition-colors"
              >
                登录
              </Link>
            )}

            {/* Hamburger — mobile only */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="sm:hidden p-1.5 rounded-lg text-slate-600 hover:bg-teal-50 transition-colors"
              aria-label="打开菜单"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile slide-in menu ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black/30 z-40 sm:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide panel */}
            <motion.div
              key="mobile-panel"
              initial={{ x: "100%", scale: 0.96, opacity: 0 }}
              animate={{ x: 0, scale: 1, opacity: 1 }}
              exit={{ x: "100%", scale: 0.96, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 330,
                damping: 32,
              }}
              className="fixed top-0 right-0 bottom-0 w-64 bg-white shadow-2xl z-50 sm:hidden flex flex-col"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-4 h-14 border-b border-slate-100 shrink-0">
                <span className="font-bold text-teal-700 text-lg">NeckFix</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-teal-50 transition-colors"
                  aria-label="关闭菜单"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 p-4 flex flex-col gap-1">
                {links.map(({ href, label }) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-3 rounded-xl text-sm font-medium no-underline transition-colors ${
                        isActive
                          ? "bg-teal-50 text-teal-700"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
