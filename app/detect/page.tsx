"use client";

import { useState, useRef, useCallback, lazy, Suspense } from "react";
import ResultsPanel from "@/app/components/ResultsPanel";
import PrivacyNotice from "@/app/components/PrivacyNotice";
import AIAdvice from "@/app/components/AIAdvice";
import type { PoseAnalysis, Landmark } from "@/lib/pose-analyzer";
import Link from "next/link";

// Lazy-load PoseDetector only when needed to prevent MediaPipe bundle
// from crashing mobile browsers during initial page load
const PoseDetector = lazy(() => import("@/app/components/PoseDetector"));

function PoseFallback() {
  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-[4/3] bg-black rounded-2xl overflow-hidden flex items-center justify-center">
      <div className="text-white text-sm animate-pulse">正在加载姿态检测...</div>
    </div>
  );
}

export default function DetectPage() {
  const [privacyOK, setPrivacyOK] = useState(false);
  const [running, setRunning] = useState(false);
  const [analysis, setAnalysis] = useState<PoseAnalysis | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPose, setShowPose] = useState(false);
  const poseHistoryRef = useRef<PoseAnalysis[]>([]);

  const handleAccept = () => {
    setPrivacyOK(true);
    setRunning(true);
    setShowPose(true);
  };

  const handleDecline = () => {
    setPrivacyOK(true);
    setRunning(false);
  };

  const handleResults = useCallback((result: PoseAnalysis | null) => {
    setAnalysis(result);
    if (result) {
      poseHistoryRef.current = [...poseHistoryRef.current.slice(-119), result];
    }
  }, []);

  return (
    <>
      <PrivacyNotice
        open={!privacyOK && !running}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-teal-800 mb-2">姿态检测</h1>
          <p className="text-slate-500">
            实时评估脖子前倾、头部前伸、耸肩和身体倾斜四项指标
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6 flex items-start gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <p className="font-medium">{error}</p>
              <p className="text-sm mt-1 text-red-400">
                请确保：① 浏览器支持 WebRTC ② 已授予摄像头权限
              </p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Camera View - only mount after user accepts */}
            {showPose ? (
              <Suspense fallback={<PoseFallback />}>
                <PoseDetector
                  running={running}
                  onResults={handleResults}
                  onLandmarks={() => {}}
                  onReady={() => setReady(true)}
                  onError={setError}
                />
              </Suspense>
            ) : (
              <div className="relative w-full max-w-2xl mx-auto aspect-[4/3] bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center">
                <div className="text-center text-slate-400">
                  <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" x2="12" y1="19" y2="22" />
                    </svg>
                  </div>
                  <p className="text-sm">同意隐私声明后可开启摄像头</p>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-3">
              {!running ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!privacyOK) return;
                    setRunning(true);
                    setShowPose(true);
                    setError(null);
                  }}
                  className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-xl font-medium active:bg-teal-800 transition-colors cursor-pointer touch-manipulation select-none"
                >
                  开启摄像头
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setRunning(false)}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium active:bg-red-700 transition-colors cursor-pointer touch-manipulation select-none"
                >
                  关闭摄像头
                </button>
              )}
              {analysis && (
                <Link
                  href={`/train?severity=${analysis.severity}`}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors no-underline text-center"
                >
                  开始训练
                </Link>
              )}
            </div>

            {/* AI Advice */}
            <AIAdvice poseHistory={poseHistoryRef.current} enabled={running} />
          </div>

          {/* Results Sidebar */}
          <div>
            <ResultsPanel analysis={analysis} />
            {ready && !analysis && (
              <p className="text-center text-slate-400 text-sm mt-4">
                请确保面部和上半身清晰可见
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
