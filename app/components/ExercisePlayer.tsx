"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { speakInstruction, stopSpeaking, initVoice } from "@/lib/voice";
import type { Exercise } from "@/lib/exercises";
import { saveRecord } from "@/lib/storage";
import ExerciseDemo from "@/app/components/ExerciseDemo";

interface Props {
  exercises: Exercise[];
  severity: string;
  overallScore: number;
  onComplete: () => void;
}

function BreathingCircle({ phase }: { phase: "inhale" | "hold" | "exhale" }) {
  const scaleClass =
    phase === "inhale" ? "scale-125" : phase === "exhale" ? "scale-90" : "scale-105";
  const colorClass =
    phase === "inhale"
      ? "border-teal-400 bg-teal-500/30"
      : phase === "hold"
      ? "border-amber-400 bg-amber-500/20"
      : "border-emerald-400 bg-emerald-500/30";

  return (
    <div className="relative w-32 h-32 mx-auto">
      <div
        className={`absolute inset-0 rounded-full border-2 transition-all duration-[2s] ease-in-out ${colorClass} ${scaleClass}`}
      />
      <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-teal-700">
        {phase === "inhale" ? "吸" : phase === "hold" ? "停" : "呼"}
      </div>
    </div>
  );
}

export default function ExercisePlayer({
  exercises,
  severity,
  overallScore,
  onComplete,
}: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [timeLeft, setTimeLeft] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const startedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<"inhale" | "hold" | "exhale">("inhale");
  const stepRef = useRef(0);

  const current = exercises[currentIdx];
  const isLast = currentIdx >= exercises.length - 1;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startExercise = useCallback(
    (index: number) => {
      const ex = exercises[index];
      if (!ex) return;

      setCurrentIdx(index);
      setTimeLeft(ex.duration);
      setPlaying(true);
      stepRef.current = 0;
      phaseRef.current = "inhale";
      setPhase("inhale");

      initVoice();
      speakInstruction(`${ex.name}，${ex.description}。准备好了吗？开始！`);

      clearTimer();
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearTimer();
            return 0;
          }
          return prev - 1;
        });

        stepRef.current++;
        if (stepRef.current % 4 === 0) {
          phaseRef.current =
            phaseRef.current === "inhale"
              ? "hold"
              : phaseRef.current === "hold"
              ? "exhale"
              : "inhale";
          setPhase(phaseRef.current);
        }

        if (stepRef.current === 1) {
          speakInstruction(ex.instructions[0]);
        } else if (stepRef.current % 6 === 0) {
          const instIdx = Math.floor(stepRef.current / 6) % ex.instructions.length;
          speakInstruction(ex.instructions[instIdx]);
        }
      }, 1000);
    },
    [exercises, clearTimer]
  );

  // Auto-start first exercise on mount
  useEffect(() => {
    if (!startedRef.current && exercises.length > 0) {
      startedRef.current = true;
      const t = setTimeout(() => startExercise(0), 500);
      return () => {
        clearTimeout(t);
        startedRef.current = false; // reset for Strict Mode double-invoke
      };
    }
  }, [exercises, startExercise]);

  useEffect(() => {
    if (timeLeft === 0 && playing && !finished) {
      if (isLast) {
        setPlaying(false);
        setFinished(true);
        stopSpeaking();
        speakInstruction("训练完成！您做得很好，请继续保持。");

        const today = new Date().toISOString().slice(0, 10);
        saveRecord({
          date: today,
          duration: exercises.reduce((s, e) => s + e.duration, 0),
          exercisesCompleted: exercises.length,
          severity,
          overallScore,
        });
      } else {
        const next = currentIdx + 1;
        speakInstruction("休息一下，准备下一个动作");
        setTimeout(() => startExercise(next), 3000);
      }
    }
  }, [timeLeft, playing, finished, isLast, currentIdx, severity, overallScore, exercises, startExercise]);

  useEffect(() => {
    return () => {
      clearTimer();
      stopSpeaking();
    };
  }, [clearTimer]);

  if (finished) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-spring-in">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-teal-800 mb-2">训练完成!</h3>
        <p className="text-slate-400 mb-6">
          已完成 {exercises.length} 个动作，共 {Math.round(exercises.reduce((s, e) => s + e.duration, 0) / 60)} 分钟
        </p>
        <button
          onClick={onComplete}
          className="px-6 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors"
        >
          查看记录
        </button>
      </div>
    );
  }

  // Loading state before first exercise starts
  if (!playing) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">准备训练...</p>
      </div>
    );
  }

  return (
    <div className="text-center py-8 animate-[fadeIn_0.3s_ease-out]">
      <h3 className="text-2xl font-bold text-teal-800 mb-1">{current.name}</h3>
      <p className="text-slate-400 text-sm mb-2">
        {current.targetMuscles} · 难度 {current.level}
      </p>
      <p className="text-slate-500 text-sm mb-6">
        动作 {currentIdx + 1} / {exercises.length}
      </p>

      {/* Timer */}
      <div className="relative w-24 h-24 mx-auto mb-6">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f1f5f9" strokeWidth="3" />
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            stroke="#0d9488"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${(timeLeft / current.duration) * 97.4} 97.4`}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-teal-700">{timeLeft}</span>
          <span className="text-xs text-slate-300 ml-0.5 mt-1">s</span>
        </div>
      </div>

      {/* Exercise Demo */}
      <div className="mb-2">
        <ExerciseDemo
          exerciseId={current.id}
          phase={phase === "inhale" ? "idle" : phase}
        />
      </div>

      {/* Breathing indicator */}
      <BreathingCircle phase={phase} />
    </div>
  );
}
