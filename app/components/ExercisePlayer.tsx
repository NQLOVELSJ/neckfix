"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { speakInstruction, stopSpeaking, initVoice } from "@/lib/voice";
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
    phase === "inhale"
      ? "scale-125"
      : phase === "exhale"
      ? "scale-90"
      : "scale-105";
  const gradientClass =
    phase === "inhale"
      ? "from-teal-400/40 to-emerald-400/40"
      : phase === "hold"
      ? "from-amber-400/30 to-yellow-400/30"
      : "from-teal-400/40 to-emerald-500/40";

  const charMap = {
    inhale: "吸气",
    hold: "保持",
    exhale: "呼气",
  };

  return (
    <div className="relative w-40 h-40 mx-auto">
      {/* Inner pulsing ring */}
      <motion.div
        className={`absolute inset-2 rounded-full bg-gradient-to-br ${gradientClass}`}
        animate={{
          scale: phase === "inhale" ? [1, 1.15, 1] : phase === "hold" ? [1, 1.07, 1] : [1, 0.93, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Outer ring */}
      <div
        className={`absolute inset-0 rounded-full border-[3px] transition-all duration-[2s] ease-in-out ${
          phase === "inhale"
            ? "border-teal-400/60"
            : phase === "hold"
            ? "border-amber-400/50"
            : "border-emerald-400/60"
        } ${scaleClass}`}
      />
      {/* Character display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-sm font-bold tracking-widest transition-colors duration-500 ${
          phase === "inhale"
            ? "text-teal-700"
            : phase === "hold"
            ? "text-amber-700"
            : "text-emerald-700"
        }`}>
          {charMap[phase]}
        </span>
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

  function safeSpeak(text: string) {
    if (voiceEnabledRef.current) speakInstruction(text);
  }
  function toggleVoice() {
    voiceEnabledRef.current = !voiceEnabledRef.current;
    setVoiceEnabled(voiceEnabledRef.current);
    if (!voiceEnabledRef.current) stopSpeaking();
  }

  // Short beep via Web Audio API for countdown ticks
  const audioCtxRef = useRef<AudioContext | null>(null);
  function playBeep(freq = 880, duration = 0.12) {
    if (!voiceEnabledRef.current) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {
      // AudioContext not supported
    }
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
      safeSpeak(`${ex.name}。${ex.instructions[0] || ""}。开始！`);

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

        // Phase cycle every 4s — animation only, no voice
        if (elapsed % 4 === 0) {
          phaseRef.current =
            phaseRef.current === "inhale"
              ? "hold"
              : phaseRef.current === "hold"
              ? "exhale"
              : "inhale";
          setPhase(phaseRef.current);

          if (isLateral && phaseRef.current === "inhale") {
            sideRef.current = sideRef.current === "left" ? "right" : "left";
            setSide(sideRef.current);
          }
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
        // 3-second countdown with beeps between exercises
        countdownStartedRef.current = true;
        setPlaying(false);
        const next = currentIdx + 1;
        setRestCountdown(3);
        playBeep(660, 0.1);

        let count = 3;
        const cd = setInterval(() => {
          count--;
          setRestCountdown(count);
          if (count > 0) {
            playBeep(count === 1 ? 880 : 660, 0.1);
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

  // ── Completed state ──
  if (finished) {
    return (
      <div className="text-center py-10">
        {/* Checkmark with spring animation */}
        <motion.div
          className="w-24 h-24 mx-auto mb-5 relative"
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1,
          }}
        >
          <div className="absolute inset-0 bg-emerald-100 rounded-full" />
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.4, ease: "easeOut" }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </motion.div>
        </motion.div>

        {/* Celebration floating particles */}
        <div className="relative h-0">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-0 w-2 h-2 rounded-full"
              style={{
                backgroundColor: ["#10b981", "#0d9488", "#14b8a6", "#34d399", "#6ee7b7", "#f59e0b"][i],
              }}
              initial={{ opacity: 0, x: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 0],
                x: (i % 2 === 0 ? 1 : -1) * (20 + Math.random() * 60),
                y: -(30 + Math.random() * 50),
                scale: [0.5, 1.2, 0.6],
              }}
              transition={{
                duration: 1.5 + Math.random() * 1,
                delay: 0.5 + i * 0.12,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        <motion.h3
          className="text-2xl font-bold text-teal-800 mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          训练完成!
        </motion.h3>
        <motion.p
          className="text-slate-400 mb-6 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          已完成 {exercises.length} 个动作，共 {Math.round(exercises.reduce((s, e) => s + e.duration, 0) / 60)} 分钟
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.3 }}
        >
          <button
            onClick={onComplete}
            className="px-8 py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl font-medium transition-all duration-300 hover:from-teal-700 hover:to-teal-600 shadow-lg shadow-teal-500/25 cursor-pointer active:scale-[0.98]"
          >
            查看记录
          </button>
        </motion.div>
      </div>
    );
  }

  // Loading state before first exercise starts (no countdown)
  if (!playing && restCountdown === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-[3px] border-slate-200 rounded-full mx-auto mb-4 relative">
          <div className="absolute inset-[-3px] rounded-full border-[3px] border-transparent border-t-teal-500 animate-spin" />
        </div>
        <p className="text-slate-400 text-sm animate-pulse">准备训练...</p>
      </div>
    );
  }

  // Countdown between exercises
  if (!playing && restCountdown > 0) {
    return (
      <div className="text-center py-16">
        <motion.p
          className="text-slate-400 text-sm mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          动作 {currentIdx + 1} 完成
        </motion.p>
        <p className="text-slate-500 text-sm mb-6">休息一下，准备下一个动作</p>

        {/* Countdown number with scale animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={restCountdown}
            className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-400/20 to-emerald-400/20 flex items-center justify-center border-2 border-teal-200/40"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.4, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <motion.span
              className="text-5xl font-bold text-teal-600"
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              {restCountdown}
            </motion.span>
          </motion.div>
        </AnimatePresence>

        <motion.p
          className="text-slate-400 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {restCountdown === 1 ? "即将开始..." : "深呼吸放松"}
        </motion.p>
      </div>
    );
  }

  // ── Active exercise view ──
  return (
    <motion.div
      className="text-center py-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Exercise name */}
      <h3 className="text-2xl font-bold text-teal-800 mb-1 tracking-tight">{current.name}</h3>
      <div className="flex items-center justify-center gap-3 mb-2">
        <span className="text-xs text-slate-400 inline-flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          {current.targetMuscles}
        </span>
        <span className="text-xs text-slate-300">|</span>
        <span className="text-xs text-slate-400">
          难度 {current.level}
        </span>
      </div>
      <p className="text-slate-400 text-xs mb-5">
        动作 {currentIdx + 1} / {exercises.length}
      </p>

      {/* Voice toggle */}
      <div className="flex justify-center mb-4">
        <button
          type="button"
          onClick={toggleVoice}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer select-none ${
            voiceEnabled
              ? "bg-teal-50 text-teal-600 border border-teal-200 hover:bg-teal-100 shadow-sm"
              : "bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          {voiceEnabled ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8.5v7a4.47 4.47 0 0 0 2.5-3.5z" />
              </svg>
              <span>语音开</span>
              {/* Active indicator dot */}
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8.5v7a4.47 4.47 0 0 0 2.5-3.5zM23 9l-6 6m0-6l6 6" />
              </svg>
              <span>语音关</span>
            </>
          )}
        </button>
      </div>

      {/* Timer ring with gradient stroke */}
      <div className="relative w-28 h-28 mx-auto mb-6">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 36 36">
          <defs>
            <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="50%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          {/* Background ring */}
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f1f5f9" strokeWidth="2.5" />
          {/* Progress ring with gradient */}
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            stroke="url(#timer-gradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={`${(timeLeft / current.duration) * 97.4} 97.4`}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-teal-700 leading-none">{timeLeft}</span>
          <span className="text-[10px] text-slate-300 mt-0.5">秒</span>
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
    </motion.div>
  );
}
