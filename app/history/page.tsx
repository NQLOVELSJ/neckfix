"use client";

import { useState, useEffect } from "react";
import CalendarHeatmap from "@/app/components/CalendarHeatmap";
import StatsChart from "@/app/components/StatsChart";
import { getRecords, getTotalStats } from "@/lib/storage";
import type { TrainingRecord } from "@/lib/storage";

export default function HistoryPage() {
  const [records, setRecords] = useState<TrainingRecord[]>([]);
  const [mounted, setMounted] = useState(false);

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);

  useEffect(() => {
    setMounted(true);
    setRecords(getRecords());
  }, []);

  const stats = mounted ? getTotalStats() : null;

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
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-48" />
          <div className="grid sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-teal-800 mb-2">训练记录</h1>
        <p className="text-slate-500">追踪您的康复进展，保持训练习惯</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="总训练次数"
          value={stats?.totalSessions ?? 0}
          unit="次"
          color="teal"
        />
        <StatCard
          label="累计时长"
          value={stats?.totalMinutes ?? 0}
          unit="分钟"
          color="emerald"
        />
        <StatCard
          label="平均评分"
          value={stats?.avgScore ?? 0}
          unit="分"
          color="cyan"
        />
        <StatCard
          label="连续打卡"
          value={stats?.streakDays ?? 0}
          unit="天"
          color="amber"
        />
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">训练日历</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-400"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span className="text-sm font-medium text-slate-600 min-w-[7rem] text-center">
              {viewYear}年{viewMonth}月
            </span>
            <button
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-400"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
        <CalendarHeatmap records={monthRecords} year={viewYear} month={viewMonth} />
      </div>

      {/* Weekly Trend */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-8">
        <h2 className="font-semibold text-slate-800 mb-4">周训练趋势（近12周）</h2>
        <StatsChart records={records} />
      </div>

      {/* Recent Records */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="font-semibold text-slate-800 mb-4">最近记录</h2>
        {records.length === 0 ? (
          <p className="text-slate-300 text-sm text-center py-4">
            完成训练后，记录将显示在这里
          </p>
        ) : (
          <div className="space-y-2">
            {records
              .slice()
              .reverse()
              .slice(0, 10)
              .map((r, i) => (
                <div
                  key={`${r.date}-${i}`}
                  className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-300">{r.date}</span>
                    <span className="text-sm text-slate-600">
                      {r.exercisesCompleted} 个动作
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400">
                      {Math.round(r.duration / 60)} 分钟
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        r.overallScore >= 75
                          ? "bg-emerald-100 text-emerald-700"
                          : r.overallScore >= 55
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {r.overallScore}分
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: "teal" | "emerald" | "cyan" | "amber";
}) {
  const colors = {
    teal: "bg-teal-50 text-teal-700",
    emerald: "bg-emerald-50 text-emerald-700",
    cyan: "bg-cyan-50 text-cyan-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${colors[color]}`}>
        {value}
        <span className="text-sm font-normal ml-1 opacity-75">{unit}</span>
      </div>
    </div>
  );
}
