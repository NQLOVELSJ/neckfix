"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import CalendarHeatmap from "@/app/components/CalendarHeatmap";
import StatsChart from "@/app/components/StatsChart";
import { getRecords, getTotalStats, getRecordsAsync, getTotalStatsAsync, migrateLocalToSupabase } from "@/lib/storage";
import type { TrainingRecord } from "@/lib/storage";

export default function HistoryPage() {
  const [records, setRecords] = useState<TrainingRecord[]>([]);
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<ReturnType<typeof getTotalStats> | null>(null);

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);

  useEffect(() => {
    setMounted(true);
    async function load() {
      await migrateLocalToSupabase();
      const [recs, st] = await Promise.all([getRecordsAsync(), getTotalStatsAsync()]);
      setRecords(recs);
      setStats(st);
    }
    load();
  }, []);

  const monthRecords = records.filter((r) => {
    const [y, m] = r.date.split("-").map(Number);
    return y === viewYear && m === viewMonth;
  });

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  if (!mounted) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <motion.div
              className="h-8 bg-slate-200 rounded-lg w-48"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="h-4 bg-slate-100 rounded-lg w-64"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="h-28 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-100"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
    }),
  };

  const listVariants = {
    hidden: { opacity: 0, x: -8 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.04, duration: 0.35, ease: "easeOut" as const },
    }),
  };

  const StatCards = [
    {
      label: "总训练次数",
      value: stats?.totalSessions ?? 0,
      unit: "次",
      color: "teal" as const,
      gradient: "linear-gradient(135deg, #ccfbf1, #5eead4)",
      iconColor: "text-teal-700",
    },
    {
      label: "累计时长",
      value: stats?.totalMinutes ?? 0,
      unit: "分钟",
      color: "emerald" as const,
      gradient: "linear-gradient(135deg, #d1fae5, #6ee7b7)",
      iconColor: "text-emerald-700",
    },
    {
      label: "平均评分",
      value: stats?.avgScore ?? 0,
      unit: "分",
      color: "cyan" as const,
      gradient: "linear-gradient(135deg, #cffafe, #67e8f9)",
      iconColor: "text-cyan-700",
    },
    {
      label: "连续打卡",
      value: stats?.streakDays ?? 0,
      unit: "天",
      color: "amber" as const,
      gradient: "linear-gradient(135deg, #fef3c7, #fcd34d)",
      iconColor: "text-amber-700",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" as const }}
      >
        <h1 className="text-3xl font-bold text-teal-800 mb-2">训练记录</h1>
        <p className="text-slate-500">追踪您的康复进展，保持训练习惯</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {StatCards.map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <StatCard
              label={card.label}
              value={card.value}
              unit={card.unit}
              color={card.color}
              gradient={card.gradient}
              iconColor={card.iconColor}
            />
          </motion.div>
        ))}
      </div>

      {/* Calendar */}
      <motion.div
        className="bg-white rounded-2xl border border-slate-100 p-6 mb-8 shadow-sm"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" as const }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <span
              className="inline-flex w-8 h-8 items-center justify-center rounded-lg"
              style={{ background: "linear-gradient(135deg, #ccfbf1, #99f6e4)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-teal-700">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </span>
            训练日历
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-teal-50 hover:border-teal-200 text-slate-400 hover:text-teal-600 transition-colors cursor-pointer"
              aria-label="上个月"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-teal-700 min-w-[7rem] text-center">
              {viewYear}年{viewMonth}月
            </span>
            <button
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-teal-50 hover:border-teal-200 text-slate-400 hover:text-teal-600 transition-colors cursor-pointer"
              aria-label="下个月"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
        <CalendarHeatmap records={monthRecords} year={viewYear} month={viewMonth} />
      </motion.div>

      {/* Weekly Trend */}
      <motion.div
        className="bg-white rounded-2xl border border-slate-100 p-6 mb-8 shadow-sm"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45, ease: "easeOut" as const }}
      >
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <span
            className="inline-flex w-8 h-8 items-center justify-center rounded-lg"
            style={{ background: "linear-gradient(135deg, #d1fae5, #6ee7b7)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-emerald-700">
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
          </span>
          周训练趋势（近12周）
        </h2>
        <StatsChart records={records} />
      </motion.div>

      {/* Recent Records */}
      <motion.div
        className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55, ease: "easeOut" as const }}
      >
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <span
            className="inline-flex w-8 h-8 items-center justify-center rounded-lg"
            style={{ background: "linear-gradient(135deg, #cffafe, #67e8f9)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-cyan-700">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </span>
          最近记录
        </h2>
        {records.length === 0 ? (
          <motion.div
            className="text-center py-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="inline-flex w-16 h-16 items-center justify-center rounded-2xl mb-3"
              style={{ background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <p className="text-slate-400 text-sm">完成训练后，记录将显示在这里</p>
          </motion.div>
        ) : (
          <div className="space-y-0">
            {records
              .slice()
              .reverse()
              .slice(0, 10)
              .map((r, i) => {
                const severityScore = r.overallScore;
                const borderColor =
                  severityScore >= 75
                    ? "border-l-emerald-400"
                    : severityScore >= 55
                    ? "border-l-amber-400"
                    : "border-l-red-400";

                const badgeColor =
                  severityScore >= 75
                    ? "bg-emerald-50 text-emerald-700"
                    : severityScore >= 55
                    ? "bg-amber-50 text-amber-700"
                    : "bg-red-50 text-red-700";

                const dotColor =
                  severityScore >= 75
                    ? "bg-emerald-400"
                    : severityScore >= 55
                    ? "bg-amber-400"
                    : "bg-red-400";

                const [y, m, d] = r.date.split("-");
                const monthNames = ["", "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
                const formattedDate = `${monthNames[parseInt(m)]}${parseInt(d)}日`;

                return (
                  <motion.div
                    key={`${r.date}-${i}`}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={listVariants}
                    className={`relative flex items-center justify-between py-3 px-4 border-l-2 ${borderColor} bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all rounded-r-xl ml-1`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
                      <div>
                        <span className="text-sm font-medium text-slate-700">{formattedDate}</span>
                        <span className="text-xs text-slate-400 ml-2">
                          {r.exercisesCompleted} 个动作
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-500 tabular-nums">
                        {Math.round(r.duration / 60)} 分钟
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${badgeColor} shadow-sm`}>
                        {r.overallScore}分
                      </span>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function useAnimatedValue(target: number) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>(0);
  const previousTarget = useRef(0);

  useEffect(() => {
    if (target === previousTarget.current) return;
    previousTarget.current = target;

    const startValue = display;
    const delta = target - startValue;
    if (delta === 0) return;

    const duration = Math.min(1200, Math.max(400, Math.abs(delta) * 20));
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(startValue + delta * eased));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target]);

  return display;
}

function StatCard({
  label,
  value,
  unit,
  color,
  gradient,
  iconColor,
}: {
  label: string;
  value: number;
  unit: string;
  color: "teal" | "emerald" | "cyan" | "amber";
  gradient: string;
  iconColor: string;
}) {
  const animatedValue = useAnimatedValue(value);

  const colorMap = {
    teal: { bg: "bg-teal-50", text: "text-teal-700", ring: "ring-teal-200/50" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200/50" },
    cyan: { bg: "bg-cyan-50", text: "text-cyan-700", ring: "ring-cyan-200/50" },
    amber: { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200/50" },
  };

  const icons = {
    teal: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    emerald: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    cyan: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    amber: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  };

  return (
    <div className={`relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm p-5 overflow-hidden ring-1 ${colorMap[color].ring} hover:shadow-md transition-shadow duration-300`}>
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
          style={{ background: gradient }}
        >
          <span className={iconColor}>{icons[color]}</span>
        </div>
      </div>
      <div className="text-xs text-slate-400 font-medium mb-1">{label}</div>
      <div className={`text-2xl font-bold ${colorMap[color].text} tabular-nums`}>
        {animatedValue}
        <span className="text-sm font-normal ml-1 opacity-60">{unit}</span>
      </div>
    </div>
  );
}
