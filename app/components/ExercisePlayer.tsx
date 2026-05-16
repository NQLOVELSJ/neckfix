"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { speakInstruction, speakIfSilent, stopSpeaking, initVoice } from "@/lib/voice";
import type { Exercise } from "@/lib/exercises";
import { saveRecordAsync } from "@/lib/storage";
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
  const [restCountdown, setRestCountdown] = useState(0);
  const [side, setSide] = useState<"left" | "right">("left");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const startedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<"inhale" | "hold" | "exhale">("inhale");
  const sideRef = useRef<"left" | "right">("left");
  const baseIdRef = useRef("");
  const countdownStartedRef = useRef(false);
  const voiceEnabledRef = useRef(true);

  const current = exercises[currentIdx];
  const isLast = currentIdx >= exercises.length - 1;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const phaseWords: Record<string, Record<string, string>> = {
    "chin-tuck": {
      inhale: "吸气，准备后缩下巴",
      hold: "下巴后缩，保持",
      exhale: "缓慢还原，放松",
    },
    "neck-flexion": {
      inhale: "吸气，准备低头",
      hold: "低头前屈，保持",
      exhale: "缓慢抬头，还原",
    },
    "lateral-flexion": {
      inhale: "",
      hold: "",
      exhale: "缓慢回正",
    },
    "scapular-retraction": {
      inhale: "吸气，准备收缩肩胛",
      hold: "肩胛收缩，保持",
      exhale: "缓慢放松",
    },
  };

  function getPhaseWord(baseId: string, ph: string, sd: "left" | "right"): string {
    if (baseId === "lateral-flexion") {
      if (ph === "inhale") return sd === "right" ? "吸气，准备右侧屈" : "吸气，准备左侧屈";
      if (ph === "hold") return sd === "right" ? "右侧屈，保持" : "左侧屈，保持";
      return "缓慢回正";
    }
    return phaseWords[baseId]?.[ph] || "";
  }

  function safeSpeak(text: string) {
    if (voiceEnabledRef.current) speakInstruction(text);
  }
  function safeSpeakIfSilent(text: string): boolean {
    if (!voiceEnabledRef.current) return false;
    return speakIfSilent(text);
  }
  function toggleVoice() {
    voiceEnabledRef.current = !voiceEnabledRef.current;
    setVoiceEnabled(voiceEnabledRef.current);
    if (!voiceEnabledRef.current) stopSpeaking();
  }

  const startExercise = useCallback(
    (index: number) => {
      const ex = exercises[index];
      if (!ex) return;

      const bId = ex.id.replace(/-l[123]$/, "");
      baseIdRef.current = bId;
      const isLateral = bId === "lateral-flexion";

      setCurrentIdx(index);
      setRestCountdown(0);
      setTimeLeft(ex.duration);
      setPlaying(true);
      phaseRef.current = "inhale";
      setPhase("inhale");
      if (isLateral) {
        sideRef.current = "left";
        setSide("left");
      }

      initVoice();

      // Intro: exercise name + first instruction
      const firstInst = ex.instructions[0] || "";
      safeSpeak(`${ex.name}。${firstInst}。准备好了吗？开始！`);

      // Remaining instructions spread evenly
      const remaining = ex.instructions.slice(1);
      const spacing = remaining.length > 0
        ? Math.floor(ex.duration / (remaining.length + 1))
        : 0;
      let spokenIdx = 0;

      clearTimer();
      let elapsed = 0;

      timerRef.current = setInterval(() => {
        elapsed++;

        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearTimer();
            return 0;
          }
          return prev - 1;
        });

        // Phase cycle every 4s — voice synced with head movement
        if (elapsed % 4 === 0) {
          phaseRef.current =
            phaseRef.current === "inhale"
              ? "hold"
              : phaseRef.current === "hold"
              ? "exhale"
              : "inhale";
          setPhase(phaseRef.current);

          // For lateral flexion, toggle side at start of each new breath cycle (exhale→inhale)
          if (isLateral && phaseRef.current === "inhale") {
            sideRef.current = sideRef.current === "left" ? "right" : "left";
            setSide(sideRef.current);
          }

          // Exercise-specific phase cue — interrupting so user can follow by voice alone
          const word = getPhaseWord(bId, phaseRef.current, sideRef.current);
          if (word) safeSpeak(word);
        }

        // Milestone instructions — non-interrupting secondary cues
        if (
          spacing > 0 &&
          elapsed % spacing === 0 &&
          spokenIdx < remaining.length
        ) {
          safeSpeakIfSilent(remaining[spokenIdx]);
          spokenIdx++;
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
        safeSpeak("训练完成！您做得很好，请继续保持。");

        const today = new Date().toISOString().slice(0, 10);
        saveRecordAsync({
          date: today,
          duration: exercises.reduce((s, e) => s + e.duration, 0),
          exercisesCompleted: exercises.length,
          severity,
          overallScore,
        });
      } else if (!countdownStartedRef.current) {
        // 3-second countdown between exercises
        countdownStartedRef.current = true;
        setPlaying(false);
        const next = currentIdx + 1;
        let count = 3;
        setRestCountdown(3);
        safeSpeak("休息一下");

        const cd = setInterval(() => {
          count--;
          setRestCountdown(count);
          if (count === 1) {
            safeSpeak("准备");
          }
          if (count <= 0) {
            clearInterval(cd);
            setRestCountdown(0);
            countdownStartedRef.current = false;
            startExercise(next);
          }
        }, 1000);

        return () => {
          clearInterval(cd);
          countdownStartedRef.current = false;
        };
      }
    }
    // playing intentionally omitted from deps — setting it false inside effect
    // must not trigger cleanup that kills the countdown interval.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, finished, isLast, currentIdx, severity, overallScore, exercises, startExercise]);

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

  // Loading state before first exercise starts (no countdown)
  if (!playing && restCountdown === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">准备训练...</p>
      </div>
    );
  }

  // Countdown between exercises
  if (!playing && restCountdown > 0) {
    return (
      <div className="text-center py-16 animate-[fadeIn_0.2s_ease-out]">
        <p className="text-slate-400 text-sm mb-2">
          动作 {currentIdx + 1} 完成
        </p>
        <p className="text-slate-500 text-sm mb-4">休息一下，准备下一个动作</p>
        <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto animate-[scaleIn_0.3s_ease-out]">
          <span className="text-4xl font-bold text-teal-700">{restCountdown}</span>
        </div>
        <p className="text-slate-400 text-xs mt-3">
          {restCountdown === 1 ? "即将开始..." : "深呼吸放松"}
        </p>
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

      {/* Voice toggle */}
      <div className="flex justify-center mb-4">
        <button
          type="button"
          onClick={toggleVoice}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors touch-manipulation select-none cursor-pointer ${
            voiceEnabled
              ? "bg-teal-50 text-teal-600 border border-teal-200"
              : "bg-slate-50 text-slate-400 border border-slate-200"
          }`}
        >
          {voiceEnabled ? "🔊 语音开" : "🔇 语音关"}
        </button>
      </div>

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
          side={baseIdRef.current === "lateral-flexion" ? side : undefined}
        />
      </div>

      {/* Breathing indicator */}
      <BreathingCircle phase={phase} />
    </div>
  );
}
