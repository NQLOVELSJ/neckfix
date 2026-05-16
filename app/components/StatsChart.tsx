"use client";

import { useMemo } from "react";
import type { TrainingRecord } from "@/lib/storage";

interface Props {
  records: TrainingRecord[];
}

export default function StatsChart({ records }: Props) {
  const weeklyData = useMemo(() => {
    const map = new Map<string, { sessions: number; minutes: number }>();

    for (const r of records) {
      const d = new Date(r.date);
      const monday = new Date(d);
      monday.setDate(d.getDate() - d.getDay() + 1);
      const key = monday.toISOString().slice(0, 10);

      const existing = map.get(key) || { sessions: 0, minutes: 0 };
      existing.sessions++;
      existing.minutes += Math.round(r.duration / 60);
      map.set(key, existing);
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12);
  }, [records]);

  const maxMinutes = Math.max(1, ...weeklyData.map(([, v]) => v.minutes));

  if (weeklyData.length === 0) {
    return (
      <div className="text-center py-8 text-slate-300 text-sm">
        暂无训练数据，完成训练后此处将显示趋势图表
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-end gap-2 h-32 mb-2">
        {weeklyData.map(([week, data]) => {
          const height = Math.max(4, (data.minutes / maxMinutes) * 100);
          return (
            <div
              key={week}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <span className="text-xs text-slate-400 font-medium">
                {data.minutes > 0 ? `${data.minutes}m` : ""}
              </span>
              <div
                className="w-full bg-teal-500 rounded-t-md transition-all hover:bg-teal-600"
                style={{ height: `${height}%`, minHeight: data.minutes > 0 ? 8 : 0 }}
                title={`${week}: ${data.sessions} 次训练, ${data.minutes} 分钟`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        {weeklyData.map(([week]) => (
          <div key={week} className="flex-1 text-center text-xs text-slate-300">
            {week.slice(5)}
          </div>
        ))}
      </div>
    </div>
  );
}
