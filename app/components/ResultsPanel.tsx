"use client";

import type { PoseAnalysis } from "@/lib/pose-analyzer";
import { getSeverityLabel, getSeverityColor } from "@/lib/pose-analyzer";

interface Props {
  analysis: PoseAnalysis | null;
}

export default function ResultsPanel({ analysis }: Props) {
  if (!analysis) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center text-slate-300">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
        </div>
        <p className="text-sm">摄像头开启后，此处将显示实时检测结果</p>
      </div>
    );
  }

  const cvaLabel =
    analysis.details.cvaAngle >= 50 ? "正常" :
    analysis.details.cvaAngle >= 45 ? "轻度" :
    analysis.details.cvaAngle >= 35 ? "中度" : "重度";

  const items = [
    {
      label: "颅椎角 (CVA)",
      score: analysis.forwardHeadAngle,
      detail: `${analysis.details.cvaAngle.toFixed(1)}° · ${cvaLabel}`,
    },
    {
      label: "头部前伸",
      score: analysis.headProtrusion,
      detail: `Y比率: ${analysis.details.headYRatio.toFixed(3)}`,
    },
    {
      label: "耸肩程度",
      score: analysis.shoulderShrug,
      detail: `肩高差: ${analysis.details.shoulderYDiff.toFixed(3)}`,
    },
    {
      label: "头部倾斜",
      score: analysis.bodyTilt,
      detail: `${Math.abs(analysis.details.coronalHeadTilt).toFixed(1)}° ${analysis.details.coronalHeadTilt > 0 ? "右倾" : "左倾"}`,
    },
  ];

  const severityColor = getSeverityColor(analysis.severity);
  const dashLen = analysis.overallScore * 0.974;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      {/* Overall Score */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f1f5f9" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke={severityColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${dashLen} 97.4`}
            />
          </svg>
          <span className="absolute text-lg font-bold text-slate-800">{analysis.overallScore}</span>
        </div>
        <div>
          <div className="font-semibold text-slate-800 text-lg">综合评分</div>
          <div className="text-sm font-medium" style={{ color: severityColor }}>
            {getSeverityLabel(analysis.severity)}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-500">{item.label}</span>
              <span className="font-medium text-slate-700">{item.score}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${item.score}%`,
                  background:
                    item.score < 30 ? "#10b981" : item.score < 60 ? "#f59e0b" : "#ef4444",
                }}
              />
            </div>
            <p className="text-xs text-slate-300 mt-0.5">{item.detail}</p>
          </div>
        ))}
      </div>

      {/* Distance indicator */}
      {(() => {
        const span = analysis.details.shoulderSpan;
        let distMsg = "";
        let distColor = "";
        if (span > 0.50) {
          distMsg = "距离太近，请后退至约 50cm";
          distColor = "text-amber-600 bg-amber-50 border-amber-200";
        } else if (span < 0.20) {
          distMsg = "距离太远，请靠近至约 50cm";
          distColor = "text-amber-600 bg-amber-50 border-amber-200";
        } else {
          distMsg = "距离适中";
          distColor = "text-emerald-600 bg-emerald-50 border-emerald-200";
        }
        return (
          <div className={`mt-4 px-3 py-2 rounded-lg border text-xs font-medium ${distColor}`}>
            {distMsg} (肩宽: {(span * 100).toFixed(0)}%)
          </div>
        );
      })()}

      {/* Debug: raw data for calibration */}
      <details className="mt-4 pt-3 border-t border-slate-100">
        <summary className="text-xs text-slate-400 cursor-pointer select-none">校准数据 (点击展开)</summary>
        <div className="mt-2 p-3 bg-slate-50 rounded-xl text-xs font-mono text-slate-500 space-y-1">
          <div>CVA角: {analysis.details.cvaAngle.toFixed(2)}°</div>
          <div>ear-shoulderZDiff: {analysis.details.earShoulderZDiff.toFixed(4)}</div>
          <div>headYRatio: {analysis.details.headYRatio.toFixed(4)}</div>
          <div>shoulderSpan: {analysis.details.shoulderSpan.toFixed(4)}</div>
          <div>coronalTilt: {analysis.details.coronalHeadTilt.toFixed(2)}°</div>
          <div>shoulderYDiff: {analysis.details.shoulderYDiff.toFixed(4)}</div>
        </div>
      </details>
    </div>
  );
}
