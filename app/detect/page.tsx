"use client";

import { useState, useRef, useCallback, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    <div className="relative w-full max-w-2xl mx-auto aspect-[4/3] bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-14 h-14 mx-auto mb-4">
          <div className="absolute inset-0 border-2 border-teal-400/20 rounded-full" />
          <div className="absolute inset-0 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-teal-300/70 text-sm font-medium">正在加载姿态检测模型...</p>
      </div>
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
          <div className="flex items-center gap-2 mb-1">
            <span className="block w-6 h-0.5 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full" />
            <span className="text-xs font-medium tracking-widest text-teal-500/60 uppercase">Live Detection</span>
          </div>
          <h1 className="text-3xl font-bold text-teal-800 mb-2">姿态检测</h1>
          <p className="text-slate-500">
            实时评估脖子前倾、头部前伸、耸肩和身体倾斜四项指标
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="bg-red-50/80 backdrop-blur-sm border border-red-200/60 rounded-2xl p-4 mb-6 flex items-start gap-3 shadow-lg overflow-hidden"
            >
              <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-red-700">{error}</p>
                <p className="text-sm mt-1 text-red-400/80">
                  请确保浏览器已授予摄像头权限，并刷新页面后重试
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Camera View - glass-morphism frame with teal glow while detecting */}
            <div className="w-full max-w-2xl mx-auto">
              <div
                className={`relative rounded-2xl transition-all duration-500 ${
                  running
                    ? "ring-2 ring-teal-400/60 shadow-[0_0_35px_rgba(45,212,191,0.2)] shadow-teal-300/20"
                    : "ring-1 ring-slate-200/60 shadow-lg shadow-slate-200/50"
                }`}
              >
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
                  <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900">
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-teal-900/25 via-teal-900/5 to-transparent" />
                    {/* Decorative mesh pattern */}
                    <div
                      className="absolute inset-0 opacity-[0.03]"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                      }}
                    />
                    <div className="relative text-center z-10">
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="w-20 h-20 bg-gradient-to-br from-teal-500/15 to-slate-600/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-5 ring-1 ring-white/10 shadow-inner"
                      >
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          className="text-teal-400/60"
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
                        同意隐私声明后可开启摄像头
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        检测数据仅在本地浏览器处理，不上传服务器
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <motion.div
              className="flex gap-3"
              initial={false}
              animate={{ opacity: 1 }}
            >
              {!running ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!privacyOK) return;
                    setRunning(true);
                    setShowPose(true);
                    setError(null);
                  }}
                  className="flex-1 px-5 py-3.5 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-teal-500/25 hover:from-teal-400 hover:to-teal-500 hover:shadow-teal-500/35 active:scale-[0.97] transition-all duration-200 cursor-pointer touch-manipulation select-none"
                >
                  开启摄像头
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setRunning(false)}
                  className="flex-1 px-5 py-3.5 bg-gradient-to-br from-red-400 to-red-500 text-white rounded-xl font-semibold shadow-lg shadow-red-400/25 hover:from-red-300 hover:to-red-400 hover:shadow-red-400/35 active:scale-[0.97] transition-all duration-200 cursor-pointer touch-manipulation select-none"
                >
                  关闭摄像头
                </button>
              )}
              {analysis && (
                <Link
                  href={`/train?severity=${analysis.severity}`}
                  className="px-6 py-3.5 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-emerald-500/35 active:scale-[0.97] transition-all duration-200 no-underline text-center"
                >
                  开始训练
                </Link>
              )}
            </motion.div>

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
