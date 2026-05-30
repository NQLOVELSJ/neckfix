"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
    icon: string;
    borderColor: string;
    bgFrom: string;
    selectedBgFrom: string;
    badgeColor: string;
  }> = [
    {
      key: "good",
      label: "基础维护",
      desc: "保持良好姿态，预防为主",
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      borderColor: "border-emerald-400",
      bgFrom: "from-slate-50",
      selectedBgFrom: "from-emerald-50/70",
      badgeColor: "bg-emerald-100 text-emerald-700",
    },
    {
      key: "mild",
      label: "轻度矫正",
      desc: "轻度前倾，初级康复训练",
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
      borderColor: "border-amber-400",
      bgFrom: "from-slate-50",
      selectedBgFrom: "from-amber-50/70",
      badgeColor: "bg-amber-100 text-amber-700",
    },
    {
      key: "moderate",
      label: "中度矫正",
      desc: "明显前倾，中级强化训练",
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      borderColor: "border-orange-400",
      bgFrom: "from-slate-50",
      selectedBgFrom: "from-orange-50/70",
      badgeColor: "bg-orange-100 text-orange-700",
    },
    {
      key: "severe",
      label: "重度矫正",
      desc: "严重前倾，高级康复训练",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
      borderColor: "border-red-400",
      bgFrom: "from-slate-50",
      selectedBgFrom: "from-red-50/70",
      badgeColor: "bg-red-100 text-red-700",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-teal-800 mb-2 tracking-tight">康复训练</h1>
        <p className="text-slate-500 text-sm">根据检测结果自动匹配分级康复计划</p>
      </motion.div>

      {!started ? (
        <>
          {/* Level Selection */}
          <motion.div
            className="grid sm:grid-cols-2 gap-3 mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {levels.map((lvl) => {
              const isSelected = selectedSeverity === lvl.key;
              return (
                <button
                  key={lvl.key}
                  onClick={() => setSelectedSeverity(lvl.key)}
                  className={`relative text-left p-5 rounded-2xl border transition-all duration-300 cursor-pointer select-none
                    ${isSelected
                      ? `border-l-[3px] ${lvl.borderColor} bg-gradient-to-r ${lvl.selectedBgFrom} to-white shadow-md border-t-transparent border-r-transparent border-b-transparent`
                      : "bg-gradient-to-r from-white to-slate-50/50 border-slate-100/80 text-slate-500 hover:border-slate-200 hover:shadow-sm"
                    }`}
                >
                  {/* Gradient left accent strip for selected */}
                  {isSelected && (
                    <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full ${lvl.borderColor.replace("border-", "bg-")} opacity-0`} />
                  )}
                  <div className="flex items-start gap-3">
                    <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                      isSelected
                        ? lvl.badgeColor
                        : "bg-slate-100 text-slate-400"
                    }`}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={lvl.icon} />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-[15px] mb-0.5 leading-tight">{lvl.label}</div>
                      <div className={`text-xs leading-relaxed ${isSelected ? "opacity-75" : "opacity-65"}`}>{lvl.desc}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </motion.div>

          {/* Plan Preview Card */}
          <motion.div
            className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-6 mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {/* Plan header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center shadow-sm shadow-teal-200">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                </div>
                训练计划
                <span className="px-2 py-0.5 bg-teal-50 text-teal-600 rounded-full text-xs font-medium">
                  {plan.level} 级
                </span>
              </h2>
              <span className="text-xs text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
                约 {Math.round(plan.totalDuration / 60)} 分钟
              </span>
            </div>

            {/* Exercise list */}
            <div className="space-y-2">
              {plan.exercises.map((ex, i) => (
                <div
                  key={ex.id}
                  className="flex items-center gap-3 p-3.5 bg-slate-50/60 hover:bg-slate-50 rounded-xl transition-all duration-200 group cursor-default"
                >
                  {/* Gradient number badge */}
                  <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow-sm shadow-teal-200/50">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-700 text-sm group-hover:text-slate-800 transition-colors">{ex.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {ex.targetMuscles} &middot; {ex.duration}秒
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => { setPreviewId(ex.id); setPreviewPhase("idle"); }}
                      className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border border-teal-200/70 text-teal-500 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-600 active:bg-teal-100 transition-all duration-200 cursor-pointer select-none"
                      title="查看动作演示"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <button
              onClick={() => setStarted(true)}
              className="px-10 py-4 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:from-teal-700 hover:to-teal-600 animate-glow-pulse shadow-lg shadow-teal-500/25 cursor-pointer active:scale-[0.98]"
            >
              开始训练
            </button>
          </motion.div>

          {/* Preview Modal - Glass-morphism with AnimatePresence */}
          <AnimatePresence>
            {previewId && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setPreviewId(null)}
              >
                {/* Backdrop */}
                <motion.div
                  className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />

                {/* Modal */}
                <motion.div
                  className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-white/60"
                  initial={{ opacity: 0, scale: 0.93, y: 24 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.93, y: 24 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                      <span className="w-7 h-7 bg-gradient-to-br from-teal-400 to-teal-500 rounded-lg flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        </svg>
                      </span>
                      {plan.exercises.find(e => e.id === previewId)?.name} 演示
                    </h3>
                    <button
                      type="button"
                      onClick={() => setPreviewId(null)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>

                  {/* Demo area */}
                  <div className="bg-gradient-to-b from-slate-50 to-white rounded-xl py-6 mb-4 border border-slate-100">
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
                      const msPerChar = 300;
                      let delay = 0;
                      for (const line of lines) {
                        setTimeout(() => speakInstruction(line), delay);
                        delay += line.length * msPerChar + 500;
                      }
                    }

                    return (
                      <div className="text-left space-y-3">
                        {/* Meta tags */}
                        <div className="flex gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100/80 rounded-full text-xs text-slate-500">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                            {ex.targetMuscles}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100/80 rounded-full text-xs text-slate-500">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            {ex.duration}秒
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100/80 rounded-full text-xs text-slate-500">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                            {ex.level}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {ex.description}
                        </p>

                        {/* Step flow */}
                        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-3.5 border border-teal-100/50">
                          <h4 className="text-xs font-semibold text-teal-700 mb-2 flex items-center gap-1.5">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                            动作流程
                          </h4>
                          <ol className="space-y-1.5">
                            {ex.instructions.map((step, i) => (
                              <li key={i} className="flex gap-2 text-xs text-slate-600">
                                <span className="shrink-0 w-5 h-5 bg-gradient-to-br from-teal-400 to-teal-500 text-white rounded-full flex items-center justify-center font-bold text-[10px] shadow-sm">
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
                            className="flex-1 px-3 py-2.5 bg-amber-50/80 border border-amber-200 text-amber-700 rounded-xl text-xs font-medium hover:bg-amber-100 active:bg-amber-200 transition-colors cursor-pointer select-none flex items-center justify-center gap-1.5"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8.5v7a4.47 4.47 0 0 0 2.5-3.5z" />
                            </svg>
                            语音讲解
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewPhase(p => p === "hold" ? "idle" : "hold")}
                            className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer select-none ${
                              previewPhase === "hold"
                                ? "bg-slate-100 text-slate-500 border border-slate-200"
                                : "bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:from-teal-700 hover:to-teal-600 active:from-teal-800 active:to-teal-700 shadow-sm shadow-teal-500/20"
                            }`}
                          >
                            {previewPhase === "hold" ? "还原动作" : "模拟动作"}
                          </button>
                          <button
                            type="button"
                            onClick={() => { stopSpeaking(); setPreviewId(null); }}
                            className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-400 text-xs font-medium hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer select-none"
                          >
                            关闭
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <motion.div
          className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <ExercisePlayer
            exercises={plan.exercises}
            severity={selectedSeverity}
            overallScore={score}
            onComplete={() => router.push("/history")}
          />
        </motion.div>
      )}
    </div>
  );
}
