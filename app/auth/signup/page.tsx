"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmailSent, setShowEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("密码长度至少 6 位");
      return;
    }
    if (password !== confirm) {
      setError("两次密码输入不一致");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined,
      },
    });

    setLoading(false);

    if (err) {
      setError(err.status === 429
        ? "注册过于频繁，请稍后再试"
        : err.message === "User already registered"
        ? "该邮箱已注册"
        : err.message);
    } else {
      setShowEmailSent(true);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined,
      },
    });
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-teal-800 text-center mb-8">注册 NeckFix</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-1">
              邮箱
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-300 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-600 mb-1">
              密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="至少 6 位"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-300 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-slate-600 mb-1">
              确认密码
            </label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              placeholder="再次输入密码"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-300 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 bg-teal-600 text-white rounded-xl font-medium active:bg-teal-800 transition-colors disabled:opacity-50 touch-manipulation select-none cursor-pointer"
          >
            {loading ? "注册中..." : "注册"}
          </button>
        </form>

        {/* Email sent confirmation */}
        {showEmailSent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" style={{ animation: "fadeIn 0.15s ease-out" }}>
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl text-center" style={{ animation: "scaleIn 0.2s ease-out" }}>
              <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-teal-800 mb-2">确认邮件已发送</h2>
              <p className="text-slate-500 text-sm mb-1">
                我们已将确认邮件发送至
              </p>
              <p className="text-teal-700 font-semibold text-sm mb-4 break-all">
                {email}
              </p>
              <p className="text-slate-400 text-xs mb-6">
                请检查收件箱（及垃圾邮件箱），点击邮件中的确认链接完成注册。
              </p>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="w-full px-4 py-2.5 rounded-xl border border-teal-200 text-teal-600 font-medium text-sm active:bg-teal-50 transition-colors disabled:opacity-50 touch-manipulation select-none cursor-pointer"
                >
                  {loading ? "发送中..." : "重新发送确认邮件"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/auth/login")}
                  className="w-full px-4 py-2.5 bg-teal-600 text-white rounded-xl font-medium text-sm active:bg-teal-800 transition-colors touch-manipulation select-none cursor-pointer"
                >
                  前往登录
                </button>
              </div>
            </div>
          </div>
        )}

        {!showEmailSent && (
          <p className="text-center text-sm text-slate-400 mt-6">
            已有账号？{" "}
            <Link href="/auth/login" className="text-teal-600 font-medium no-underline hover:underline">
              登录
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
