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
    if (ratio < 0.25) return "bg-teal-100";
    if (ratio < 0.5) return "bg-teal-200";
    if (ratio < 0.75) return "bg-teal-300";
    return "bg-teal-500";
  }

  function getTooltip(day: number | null, seconds: number | null): string {
    if (day === null || seconds === null) return "";
    if (seconds === 0) return `${month}/${day}: 无训练`;
    return `${month}/${day}: ${Math.round(seconds / 60)} 分钟训练`;
  }

  const weekDays = ["一", "二", "三", "四", "五", "六", "日"];

  return (
    <div>
      <div className="flex gap-1 mb-1">
        {weekDays.map((d) => (
          <div key={d} className="w-8 h-5 text-center text-xs text-slate-300">
            {d}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex gap-1">
            {week.map((sec, di) => {
              const dayNumber =
                sec !== null
                  ? wi * 7 + di - firstDayOfWeek + 1
                  : null;
              return (
                <div
                  key={di}
                  className={`w-8 h-8 rounded-md ${getColor(sec)} flex items-center justify-center text-xs ${
                    sec && sec > 0 ? "text-white font-medium" : "text-slate-400"
                  }`}
                  title={getTooltip(dayNumber, sec)}
                >
                  {dayNumber || ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-slate-300">
        <span>少</span>
        <div className="w-3 h-3 bg-slate-100 rounded-sm" />
        <div className="w-3 h-3 bg-teal-100 rounded-sm" />
        <div className="w-3 h-3 bg-teal-200 rounded-sm" />
        <div className="w-3 h-3 bg-teal-300 rounded-sm" />
        <div className="w-3 h-3 bg-teal-500 rounded-sm" />
        <span>多</span>
      </div>
    </div>
  );
}
