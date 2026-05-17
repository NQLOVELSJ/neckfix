"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ExercisePlayer from "@/app/components/ExercisePlayer";
import ExerciseDemo from "@/app/components/ExerciseDemo";
import { getTrainingPlan } from "@/lib/exercises";
import { speakInstruction, stopSpeaking, initVoice } from "@/lib/voice";

export default function TrainPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-slate-200 rounded w-48" /><div className="h-64 bg-slate-100 rounded-2xl" /></div></div>}>
      <TrainContent />
    </Suspense>
  );
}

function TrainContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const severityParam = searchParams.get("severity") as
    | "good"
    | "mild"
    | "moderate"
    | "severe"
    | null;

  const [selectedSeverity, setSelectedSeverity] = useState<
    "good" | "mild" | "moderate" | "severe"
  >(severityParam || "mild");
  const [started, setStarted] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewPhase, setPreviewPhase] = useState<"idle" | "hold">("idle");
  const [score] = useState(() =>
    severityParam
      ? { good: 85, mild: 60, moderate: 45, severe: 25 }[severityParam]
      : 60
  );

  const plan = useMemo(() => getTrainingPlan(selectedSeverity), [selectedSeverity]);

  const levels: Array<{
    key: "good" | "mild" | "moderate" | "severe";
    label: string;
    desc: string;
    color: string;
  }> = [
    {
      key: "good",
      label: "基础维护",
      desc: "保持良好姿态，预防为主",
      color: "bg-emerald-50 border-emerald-200 text-emerald-700",
    },
    {
      key: "mild",
      label: "轻度矫正",
      desc: "轻度前倾，初级康复训练",
      color: "bg-amber-50 border-amber-200 text-amber-700",
    },
    {
      key: "moderate",
      label: "中度矫正",
      desc: "明显前倾，中级强化训练",
      color: "bg-orange-50 border-orange-200 text-orange-700",
    },
    {
      key: "severe",
      label: "重度矫正",
      desc: "严重前倾，高级康复训练",
      color: "bg-red-50 border-red-200 text-red-700",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-teal-800 mb-2">康复训练</h1>
        <p className="text-slate-500">根据检测结果自动匹配分级康复计划</p>
      </div>

      {!started ? (
        <>
          {/* Level Selection */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {levels.map((lvl) => (
              <button
                key={lvl.key}
                onClick={() => setSelectedSeverity(lvl.key)}
                className={`text-left p-5 rounded-2xl border-2 transition-all ${
                  selectedSeverity === lvl.key
                    ? `${lvl.color} shadow-md`
                    : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                }`}
              >
                <div className="font-semibold text-lg mb-1">{lvl.label}</div>
                <div className="text-sm opacity-75">{lvl.desc}</div>
              </button>
            ))}
          </div>

          {/* Plan Preview */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-8">
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              训练计划 · {plan.level} 级
            </h2>
            <div className="space-y-3">
              {plan.exercises.map((ex, i) => (
                <div
                  key={ex.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
                >
                  <div className="w-8 h-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-700 text-sm">{ex.name}</div>
                    <div className="text-xs text-slate-400">
                      {ex.targetMuscles} · {ex.duration}秒
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setPreviewId(ex.id); setPreviewPhase("idle"); }}
                    className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-teal-200 text-teal-600 active:bg-teal-50 transition-colors touch-manipulation select-none"
                    title="查看动作演示"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-slate-400">
              总时长：约 {Math.round(plan.totalDuration / 60)} 分钟
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setStarted(true)}
              className="px-8 py-3.5 bg-teal-600 text-white rounded-xl font-semibold text-lg hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200"
            >
              开始训练
            </button>
          </div>

          {/* Preview Modal */}
          {previewId && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
              style={{ animation: "fadeIn 0.15s ease-out" }}
              onClick={() => setPreviewId(null)}
            >
              <div
                className="bg-white rounded-2xl mx-4 p-6 max-w-sm w-full shadow-xl"
                style={{ animation: "scaleIn 0.2s ease-out" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 text-lg">
                    {plan.exercises.find(e => e.id === previewId)?.name} 演示
                  </h3>
                  <button
                    type="button"
                    onClick={() => setPreviewId(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <div className="bg-slate-50 rounded-xl py-6 mb-4">
                  <ExerciseDemo exerciseId={previewId} phase={previewPhase} />
                </div>

                {/* Exercise info */}
                {(() => {
                  const ex = plan.exercises.find(e => e.id === previewId);
                  if (!ex) return null;

                  function narrateExercise() {
                    if (!ex) return;
                    initVoice();
                    stopSpeaking();
                    const lines = [
                      `${ex.name}。${ex.description}`,
                      `目标肌群：${ex.targetMuscles}。时长${ex.duration}秒。`,
                      ...ex.instructions.map((step, i) => `第${i + 1}步：${step}`),
                    ];
                    // Chain with per-character delay so each line finishes before next starts
                    const msPerChar = 300;
                    let delay = 0;
                    for (const line of lines) {
                      setTimeout(() => speakInstruction(line), delay);
                      delay += line.length * msPerChar + 500;
                    }
                  }

                  return (
                    <div className="mt-4 text-left space-y-3">
                      {/* Meta info */}
                      <div className="flex gap-3 text-xs text-slate-500">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-full">🎯 {ex.targetMuscles}</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded-full">⏱ {ex.duration}秒</span>
                        <span className="bg-slate-100 px-2 py-0.5 rounded-full">📊 {ex.level}</span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {ex.description}
                      </p>

                      {/* Step flow */}
                      <div className="bg-teal-50 rounded-xl p-3">
                        <h4 className="text-xs font-semibold text-teal-700 mb-2">动作流程</h4>
                        <ol className="space-y-1.5">
                          {ex.instructions.map((step, i) => (
                            <li key={i} className="flex gap-2 text-xs text-slate-600">
                              <span className="shrink-0 w-5 h-5 bg-teal-200 text-teal-700 rounded-full flex items-center justify-center font-bold text-[10px]">
                                {i + 1}
                              </span>
                              <span className="pt-0.5">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Voice narration + action buttons */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={narrateExercise}
                          className="flex-1 px-3 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs font-medium active:bg-amber-100 transition-colors touch-manipulation select-none flex items-center justify-center gap-1"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8.5v7a4.47 4.47 0 0 0 2.5-3.5z" />
                          </svg>
                          语音讲解
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewPhase(p => p === "hold" ? "idle" : "hold")}
                          className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-colors touch-manipulation select-none ${
                            previewPhase === "hold"
                              ? "bg-slate-100 text-slate-500 border border-slate-200"
                              : "bg-teal-600 text-white active:bg-teal-800"
                          }`}
                        >
                          {previewPhase === "hold" ? "还原动作" : "模拟动作"}
                        </button>
                        <button
                          type="button"
                          onClick={() => { stopSpeaking(); setPreviewId(null); }}
                          className="px-3 py-2 rounded-xl border border-slate-200 text-slate-400 text-xs font-medium active:bg-slate-100 transition-colors touch-manipulation select-none"
                        >
                          关闭
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <ExercisePlayer
            exercises={plan.exercises}
            severity={selectedSeverity}
            overallScore={score}
            onComplete={() => router.push("/history")}
          />
        </div>
      )}
    </div>
  );
}
