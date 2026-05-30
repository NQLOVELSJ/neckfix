"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
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
      <motion.div
        className="text-center py-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className="inline-flex w-16 h-16 items-center justify-center rounded-2xl mb-3"
          style={{ background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round">
            <path d="M3 3v18h18" />
            <path d="m19 9-5 5-4-4-3 3" />
          </svg>
        </div>
        <p className="text-slate-400 text-sm">暂无训练数据，完成训练后此处将显示趋势图表</p>
      </motion.div>
    );
  }

  const barVariants = {
    hidden: { scaleY: 0, originY: 1 },
    visible: (i: number) => ({
      scaleY: 1,
      originY: 1,
      transition: {
        delay: i * 0.06,
        duration: 0.55,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    }),
  };

  const labelVariants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1,
      transition: { delay: i * 0.06 + 0.3, duration: 0.3 },
    }),
  };

  return (
    <div>
      <div className="flex items-end gap-2 h-36 mb-2 px-0.5">
        {weeklyData.map(([week, data], i) => {
          const height = Math.max(4, (data.minutes / maxMinutes) * 100);
          return (
            <div
              key={week}
              className="flex-1 flex flex-col items-center gap-1.5"
              title={`${week}: ${data.sessions} 次训练, ${data.minutes} 分钟`}
            >
              <motion.span
                className="text-[11px] text-slate-400 font-medium tabular-nums"
                custom={i}
                initial="hidden"
                animate="visible"
                variants={labelVariants}
              >
                {data.minutes > 0 ? `${data.minutes}m` : ""}
              </motion.span>
              <motion.div
                className="flex-1 w-full max-w-[40px] rounded-t-lg cursor-pointer"
                style={{
                  background: data.minutes > 0
                    ? "linear-gradient(to top, #0d9488, #2dd4bf)"
                    : "linear-gradient(to top, #e2e8f0, #f1f5f9)",
                  height: `${height}%`,
                  minHeight: data.minutes > 0 ? 8 : 0,
                  originY: 1,
                }}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={barVariants}
                whileHover={{
                  scaleX: 1.15,
                  transition: { duration: 0.2, ease: "easeOut" },
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 px-0.5">
        {weeklyData.map(([week], i) => {
          const label = week.slice(5);
          return (
            <motion.div
              key={week}
              className="flex-1 text-center text-[10px] text-slate-400 font-medium tracking-tight"
              custom={i}
              initial="hidden"
              animate="visible"
              variants={labelVariants}
            >
              {label}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
