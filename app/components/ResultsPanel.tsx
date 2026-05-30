"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PoseAnalysis } from "@/lib/pose-analyzer";
import { getSeverityLabel, getSeverityColor } from "@/lib/pose-analyzer";

interface Props {
  analysis: PoseAnalysis | null;
}

function EmptyState() {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-8 text-center shadow-lg shadow-slate-200/40">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-20 h-20 bg-gradient-to-br from-teal-50 to-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-5 ring-1 ring-slate-200/50 shadow-inner"
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="text-teal-300/70"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
      </motion.div>
      <p className="text-sm font-medium text-slate-400">
        摄像头开启后，此处将显示实时检测结果
      </p>
      <p className="text-xs text-slate-300 mt-2">
        请保持面部与上半身在画面中清晰可见
      </p>
    </div>
  );
}

function ScoreGauge({ score, color }: { score: number; color: string }) {
  const CIRCUMFERENCE = 2 * Math.PI * 15.5; // r=15.5
  const targetDash = (score / 100) * CIRCUMFERENCE;
  const [animatedDash, setAnimatedDash] = useState(0);
  const prevScoreRef = useRef(0);

  useEffect(() => {
    const prev = prevScoreRef.current;
    const prevDash = (prev / 100) * CIRCUMFERENCE;
    prevScoreRef.current = score;

    // Animate from previous value to new value
    let start: number | null = null;
    const duration = 800; // ms

    function step(timestamp: number) {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = prevDash + (targetDash - prevDash) * eased;
      setAnimatedDash(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);

    return () => {
      start = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  return (
    <div className="relative w-[72px] h-[72px] flex items-center justify-center">
      <svg className="w-[72px] h-[72px] -rotate-90" viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r="15.5"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="3"
        />
        <circle
          cx="18"
          cy="18"
          r="15.5"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${animatedDash} ${CIRCUMFERENCE}`}
        />
      </svg>
      <span className="absolute text-xl font-bold text-slate-700">
        <AnimatedNumber value={score} />
      </span>
    </div>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  const prevRef = useRef(value);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = value;

    if (prev === value) {
      setDisplay(value);
      return;
    }

    let start: number | null = null;
    const duration = 800;

    function step(timestamp: number) {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(prev + (value - prev) * eased);
      setDisplay(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }, [value]);

  return <>{display}</>;
}

function getBarGradient(score: number): string {
  if (score < 30) return "from-emerald-400 to-emerald-500";
  if (score < 50) return "from-lime-400 to-emerald-500";
  if (score < 60) return "from-amber-400 to-orange-400";
  if (score < 80) return "from-orange-400 to-red-400";
  return "from-red-400 to-red-500";
}

function getSeverityGlow(severity: string): string {
  switch (severity) {
    case "good":
      return "bg-emerald-100 text-emerald-700 ring-emerald-300/40 shadow-emerald-200/40";
    case "mild":
      return "bg-amber-100 text-amber-700 ring-amber-300/40 shadow-amber-200/40";
    case "moderate":
      return "bg-orange-100 text-orange-700 ring-orange-300/40 shadow-orange-200/40";
    case "severe":
      return "bg-red-100 text-red-700 ring-red-300/40 shadow-red-200/40";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-300/40";
  }
}

export default function ResultsPanel({ analysis }: Props) {
  if (!analysis) {
    return <EmptyState />;
  }

  const items = [
    {
      label: "脖子前倾",
      score: analysis.forwardHeadAngle,
      detail: `Z深度: ${analysis.details.noseZDiff.toFixed(3)}`,
    },
    {
      label: "头部前伸",
      score: analysis.headProtrusion,
      detail: `headYRatio: ${analysis.details.headYRatio.toFixed(3)}`,
    },
    {
      label: "耸肩程度",
      score: analysis.shoulderShrug,
      detail: `肩高差: ${analysis.details.shoulderYDiff.toFixed(3)}`,
    },
    {
      label: "头部倾斜",
      score: analysis.bodyTilt,
      detail: `${Math.abs(analysis.details.coronalHeadTilt).toFixed(1)}° ${
        analysis.details.coronalHeadTilt > 0 ? "左低" : "右低"
      }`,
    },
  ];

  const severityColor = getSeverityColor(analysis.severity);
  const severityGlow = getSeverityGlow(analysis.severity);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-lg shadow-slate-200/40"
    >
      {/* Overall Score */}
      <div className="flex items-center gap-5 mb-6">
        <ScoreGauge score={analysis.overallScore} color={severityColor} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-slate-700 text-lg">综合评分</div>
          <motion.span
            className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold ring-1 shadow-md mt-1 ${severityGlow}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 20,
              delay: 0.15,
            }}
          >
            {getSeverityLabel(analysis.severity)}
          </motion.span>
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-4">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.08 * i, ease: "easeOut" }}
          >
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-slate-500 font-medium">{item.label}</span>
              <span className="font-semibold text-slate-600">{item.score}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${getBarGradient(item.score)}`}
                initial={{ width: 0 }}
                animate={{ width: `${item.score}%` }}
                transition={{ duration: 0.7, delay: 0.1 * i, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-slate-300 mt-1 ml-0.5">{item.detail}</p>
          </motion.div>
        ))}
      </div>

      {/* Distance indicator */}
      <AnimatePresence mode="wait">
        {(() => {
          const span = analysis.details.shoulderSpan;
          let distMsg = "";
          let distIcon = null;
          let distClasses = "";

          if (span > 0.70) {
            distMsg = "距离太近，请后退至约 50cm";
            distIcon = (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m21 16-4 4-4-4" />
                <path d="M17 12v8" />
                <path d="M3 8l4-4 4 4" />
                <path d="M7 4v8" />
              </svg>
            );
            distClasses =
              "bg-amber-50/80 backdrop-blur-sm text-amber-700 border-amber-200/60";
          } else if (span < 0.20) {
            distMsg = "距离太远，请靠近至约 50cm";
            distIcon = (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m21 16-4 4-4-4" />
                <path d="M17 12v8" />
                <path d="M3 8l4-4 4 4" />
                <path d="M7 4v8" />
              </svg>
            );
            distClasses =
              "bg-amber-50/80 backdrop-blur-sm text-amber-700 border-amber-200/60";
          } else {
            distMsg = "距离适中";
            distIcon = (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            );
            distClasses =
              "bg-emerald-50/80 backdrop-blur-sm text-emerald-700 border-emerald-200/60";
          }

          return (
            <motion.div
              key={distMsg}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className={`mt-4 px-4 py-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${distClasses}`}
            >
              {distIcon}
              <span>
                {distMsg}{" "}
                <span className="opacity-60">
                  (肩宽: {(span * 100).toFixed(0)}%)
                </span>
              </span>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Debug: raw data for calibration */}
      <details className="mt-5 pt-4 border-t border-slate-200/60 group">
        <summary className="text-xs text-slate-400 cursor-pointer select-none hover:text-slate-500 transition-colors flex items-center gap-1.5">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-200 group-open:rotate-90"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          校准数据 (点击展开)
        </summary>
        <div className="mt-3 p-3.5 bg-slate-50/80 backdrop-blur-sm rounded-xl text-xs font-mono text-slate-500 space-y-1.5 ring-1 ring-slate-200/40">
          <div className="font-semibold text-slate-600 mb-1">需要记录的值:</div>
          <div className="text-emerald-600 font-semibold">
            noseZNorm: {analysis.details.noseZNorm.toFixed(4)}
          </div>
          <div>noseZDiff(raw): {analysis.details.noseZDiff.toFixed(4)}</div>
          <div>headYRatio: {analysis.details.headYRatio.toFixed(4)}</div>
          <div>shoulderSpan: {analysis.details.shoulderSpan.toFixed(4)}</div>
          <div>tilt: {analysis.details.coronalHeadTilt.toFixed(2)}&deg;</div>
          <div>shoulderYDiff: {analysis.details.shoulderYDiff.toFixed(4)}</div>
          <div>earYNorm: {analysis.details.earYNorm.toFixed(4)}</div>
        </div>
      </details>
    </motion.div>
  );
}
