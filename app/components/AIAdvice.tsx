"use client";

import { useState, useEffect, useRef } from "react";
import { speakInstruction, stopSpeaking } from "@/lib/voice";
import type { PoseAnalysis } from "@/lib/pose-analyzer";

interface Props {
  poseHistory: PoseAnalysis[];
  enabled: boolean;
}

export default function AIAdvice({ poseHistory, enabled }: Props) {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastRequestRef = useRef(0);
  const prevLengthRef = useRef(0);

  useEffect(() => {
    if (!enabled || poseHistory.length === 0) return;
    if (poseHistory.length === prevLengthRef.current) return;
    prevLengthRef.current = poseHistory.length;

    if (poseHistory.length < 60) return;

    const now = Date.now();
    if (now - lastRequestRef.current < 120000) return;

    const recentIssues = poseHistory.slice(-60).filter((p) => p.overallScore < 55);
    if (recentIssues.length < 30) return;

    lastRequestRef.current = now;
    setLoading(true);
    setError(null);

    const avgScores = {
      forwardHeadAngle: Math.round(recentIssues.reduce((s, p) => s + p.forwardHeadAngle, 0) / recentIssues.length),
      headProtrusion: Math.round(recentIssues.reduce((s, p) => s + p.headProtrusion, 0) / recentIssues.length),
      shoulderShrug: Math.round(recentIssues.reduce((s, p) => s + p.shoulderShrug, 0) / recentIssues.length),
      bodyTilt: Math.round(recentIssues.reduce((s, p) => s + p.bodyTilt, 0) / recentIssues.length),
      overallScore: Math.round(recentIssues.reduce((s, p) => s + p.overallScore, 0) / recentIssues.length),
      triggerCount: recentIssues.length,
    };

    fetch("/api/ai-advice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(avgScores),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "请求失败");
        }
        return res.json();
      })
      .then((data) => {
        setAdvice(data.advice);
        speakInstruction(data.advice);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [poseHistory, enabled]);

  if (!enabled) return null;
  if (!advice && !loading && !error) return null;

  return (
    <div className="bg-white rounded-2xl border border-amber-100 p-5 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center gap-2 mb-3">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4Z" />
          <path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4Z" />
          <circle cx="12" cy="10" r="1" />
        </svg>
        <span className="font-semibold text-amber-700 text-sm">AI 纠正建议</span>
        {loading && (
          <span className="text-xs text-slate-300 animate-pulse ml-auto">分析中...</span>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-slate-400 text-sm py-2">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-amber-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 bg-amber-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 bg-amber-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          AI 正在分析您的姿态数据...
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {advice && !loading && (
        <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
          {advice}
        </div>
      )}

      {advice && (
        <button
          onClick={() => {
            stopSpeaking();
            speakInstruction(advice);
          }}
          className="mt-3 text-xs text-teal-500 hover:text-teal-600 flex items-center gap-1"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8.5v7a4.47 4.47 0 0 0 2.5-3.5z" />
          </svg>
          重新播报
        </button>
      )}
    </div>
  );
}
