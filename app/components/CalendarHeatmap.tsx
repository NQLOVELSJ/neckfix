"use client";

import { useMemo } from "react";
import type { TrainingRecord } from "@/lib/storage";

interface Props {
  records: TrainingRecord[];
  year: number;
  month: number;
}

export default function CalendarHeatmap({ records, year, month }: Props) {
  const heatmap = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of records) {
      const total = map.get(r.date) || 0;
      map.set(r.date, total + r.duration);
    }
    return map;
  }, [records]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];

  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const totalSec = heatmap.get(dateStr) || 0;
    currentWeek.push(totalSec);

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  const maxDuration = Math.max(1, ...Array.from(heatmap.values()));

  function getColor(seconds: number | null): string {
    if (seconds === null) return "bg-transparent";
    if (seconds === 0) return "bg-slate-100";
    const ratio = seconds / maxDuration;
    if (ratio <= 0.125) return "bg-teal-50";
    if (ratio <= 0.25)  return "bg-teal-100";
    if (ratio <= 0.375) return "bg-teal-200";
    if (ratio <= 0.5)   return "bg-teal-300";
    if (ratio <= 0.625) return "bg-teal-400";
    if (ratio <= 0.75)  return "bg-teal-500";
    if (ratio <= 0.875) return "bg-teal-600";
    return "bg-teal-700";
  }

  function getTooltip(day: number | null, seconds: number | null): string {
    if (day === null || seconds === null) return "";
    if (seconds === 0) return `${month}/${day}: 无训练`;
    return `${month}/${day}: ${Math.round(seconds / 60)} 分钟训练`;
  }

  const hasData = weeks.some((week) => week.some((sec) => sec !== null && sec > 0));

  if (!hasData) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex w-14 h-14 items-center justify-center rounded-2xl mb-3"
          style={{ background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M3 9h18" />
          </svg>
        </div>
        <p className="text-slate-400 text-sm">本月暂无训练记录</p>
      </div>
    );
  }

  const weekDays = ["一", "二", "三", "四", "五", "六", "日"];

  return (
    <div>
      <div className="flex gap-1 mb-2">
        {weekDays.map((d) => (
          <div key={d} className="w-9 h-5 text-center text-[11px] text-slate-400 font-medium tracking-tight">
            {d}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex gap-1.5">
            {week.map((sec, di) => {
              const dayNumber =
                sec !== null
                  ? wi * 7 + di - firstDayOfWeek + 1
                  : null;
              const hasValue = sec !== null && sec > 0;
              return (
                <div
                  key={di}
                  className={`w-9 h-9 rounded-lg ${getColor(sec)} flex items-center justify-center text-xs font-medium transition-colors duration-200 ${
                    hasValue ? "text-white/90 shadow-sm" : "text-slate-400"
                  } ${sec === 0 ? "ring-1 ring-slate-200 ring-inset" : ""}`}
                  title={getTooltip(dayNumber, sec)}
                >
                  {dayNumber || ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-4 text-[11px] text-slate-400">
        <span className="font-medium">少</span>
        <div className="flex rounded-md overflow-hidden h-3 shadow-sm" style={{ width: "72px" }}>
          <div className="flex-1 bg-slate-100" />
          <div className="flex-1 bg-teal-50" />
          <div className="flex-1 bg-teal-100" />
          <div className="flex-1 bg-teal-200" />
          <div className="flex-1 bg-teal-300" />
          <div className="flex-1 bg-teal-400" />
          <div className="flex-1 bg-teal-500" />
          <div className="flex-1 bg-teal-600" />
          <div className="flex-1 bg-teal-700" />
        </div>
        <span className="font-medium">多</span>
      </div>
    </div>
  );
}
