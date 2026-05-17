"use client";

import { useState, useRef } from "react";
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
  const [countdown, setCountdown] = useState(0);
  const lastRequestRef = useRef(0);

  async function requestAdvice() {
    const now = Date.now();
    if (now - lastRequestRef.current < 15000) return; // 15s cooldown
    lastRequestRef.current = now;

    // Voice prompt: please sit upright, then 3-second countdown
    stopSpeaking();
    speakInstruction("请坐正，保持标准姿势");
    setCountdown(3);

    await new Promise<void>((resolve) => {
      let c = 3;
      const iv = setInterval(() => {
        c--;
        if (c <= 0) {
          clearInterval(iv);
          setCountdown(0);
          resolve();
        } else {
          setCountdown(c);
        }
      }, 1000);
    });

    // Collect recent data (last 3 seconds ~90 frames at 30fps, use last 30)
    const recent = poseHistory.slice(-30);
    if (recent.length < 5) {
      setError("数据不足，请保持摄像头开启至少 5 秒后再试");
      return;
    }

    setLoading(true);
    setError(null);

    const avgScores = {
      forwardHeadAngle: Math.round(recent.reduce((s, p) => s + p.forwardHeadAngle, 0) / recent.length),
      headProtrusion: Math.round(recent.reduce((s, p) => s + p.headProtrusion, 0) / recent.length),
      shoulderShrug: Math.round(recent.reduce((s, p) => s + p.shoulderShrug, 0) / recent.length),
      bodyTilt: Math.round(recent.reduce((s, p) => s + p.bodyTilt, 0) / recent.length),
      overallScore: Math.round(recent.reduce((s, p) => s + p.overallScore, 0) / recent.length),
      triggerCount: recent.length,
    };

    try {
      const res = await fetch("/api/ai-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(avgScores),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "请求失败");
      }
      const data = await res.json();
      setAdvice(data.advice);
      speakInstruction(data.advice);
    } catch (err: any) {
      setError(err.message || "AI 服务异常，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  if (!enabled) return null;

  return (
    <div className="bg-white rounded-2xl border border-amber-100 p-5">
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
        {countdown > 0 && (
          <span className="text-xs text-teal-500 animate-pulse ml-auto">
            请坐正 · {countdown}
          </span>
        )}
      </div>

      {/* Countdown overlay */}
      {countdown > 0 && (
        <div className="text-center py-4 mb-2 bg-teal-50 rounded-xl">
          <p className="text-teal-700 text-sm font-medium mb-1">请坐正，保持标准姿势</p>
          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl font-bold text-teal-700">{countdown}</span>
          </div>
        </div>
      )}

      {/* Manual trigger button */}
      {!advice && !loading && !countdown && (
        <button
          type="button"
          onClick={requestAdvice}
          disabled={!enabled || poseHistory.length < 5}
          className="w-full px-4 py-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl font-medium text-sm active:bg-amber-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation select-none"
        >
          🤖 获取 AI 建议
        </button>
      )}

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
        <>
          <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
            {advice}
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => {
                stopSpeaking();
                speakInstruction(advice);
              }}
              className="text-xs text-teal-500 hover:text-teal-600 flex items-center gap-1"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8.5v7a4.47 4.47 0 0 0 2.5-3.5z" />
              </svg>
              重新播报
            </button>
            <button
              onClick={requestAdvice}
              disabled={countdown > 0 || loading}
              className="text-xs text-amber-500 hover:text-amber-600 flex items-center gap-1"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 12a9 9 0 1 1-9-9" />
                <path d="M21 3v6h-6" />
              </svg>
              重新分析
            </button>
          </div>
        </>
      )}
    </div>
  );
}
