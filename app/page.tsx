"use client";

import Link from "next/link";
import { motion } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Shared easing                                                      */
/* ------------------------------------------------------------------ */

const smoothEase: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: smoothEase,
    },
  },
};

const stepContainerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const stepItemVariant = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: smoothEase,
    },
  },
};

const cardMotion = {
  rest: {
    y: 0,
    boxShadow: "0 1px 3px 0 rgba(19,78,74,0.04), 0 1px 2px -1px rgba(19,78,74,0.03)",
  },
  hover: {
    y: -4,
    boxShadow:
      "0 20px 40px -10px rgba(19,78,74,0.15), 0 0 0 1px rgba(13,148,136,0.1)",
    transition: { duration: 0.3, ease: smoothEase },
  },
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:py-20">
      {/* ============ Hero ============ */}
      <section className="relative text-center mb-16 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] opacity-25 animate-float"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(45,212,191,0.35), transparent 65%)",
              animationDuration: "8s",
            }}
          />
          <div
            className="absolute top-10 left-1/4 w-[600px] h-[400px] opacity-20 animate-float"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(16,185,129,0.3), transparent 60%)",
              animationDuration: "10s",
              animationDelay: "3s",
            }}
          />
          <div
            className="absolute -bottom-10 right-1/4 w-[500px] h-[350px] opacity-15 animate-float"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(6,182,212,0.25), transparent 60%)",
              animationDuration: "9s",
              animationDelay: "5s",
            }}
          />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: smoothEase }}
          className="text-4xl sm:text-5xl font-bold text-teal-800 mb-4 tracking-tight relative"
        >
          告别「短信脖」
          <span className="block text-teal-600 text-2xl sm:text-3xl mt-2 font-semibold">
            NeckFix 帮您科学纠正
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: smoothEase }}
          className="text-slate-500 max-w-lg mx-auto text-lg leading-relaxed relative"
        >
          基于 AI 视觉检测，实时评估脖子前倾、头部前伸、耸肩和身体倾斜。
          所有检测纯本地运行，保护您的隐私。
        </motion.p>
      </section>

      {/* ============ Feature Cards ============ */}
      <motion.section
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16"
      >
        <motion.div variants={fadeUpItem}>
          <FeatureCard
            href="/detect"
            icon={<DetectIcon />}
            title="姿态检测"
            desc="实时摄像头检测，四维度评估颈部姿态"
            accent="bg-teal-50 text-teal-700"
          />
        </motion.div>
        <motion.div variants={fadeUpItem}>
          <FeatureCard
            href="/train"
            icon={<TrainIcon />}
            title="康复训练"
            desc="分级动作指导，动画+语音双重引导"
            accent="bg-emerald-50 text-emerald-700"
          />
        </motion.div>
        <motion.div variants={fadeUpItem}>
          <FeatureCard
            href="/history"
            icon={<HistoryIcon />}
            title="数据记录"
            desc="打卡日历与趋势图表，追踪康复进展"
            accent="bg-cyan-50 text-cyan-700"
          />
        </motion.div>
        <motion.div variants={fadeUpItem}>
          <FeatureCard
            href="/detect"
            icon={<AIIcon />}
            title="AI 建议"
            desc="智能分析姿态数据，给出个性化纠正方案"
            accent="bg-amber-50 text-amber-700"
          />
        </motion.div>
      </motion.section>

      {/* ============ How it works ============ */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: smoothEase }}
        className="bg-white rounded-2xl border border-teal-100 p-8 sm:p-10"
      >
        <h2 className="text-2xl font-bold text-teal-800 mb-8 text-center">使用流程</h2>
        <motion.div
          variants={stepContainerVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-3 gap-6"
        >
          {[
            { step: "01", title: "开启摄像头", desc: "浏览器端完成检测，画面不上传" },
            { step: "02", title: "实时检测分析", desc: "AI 自动评估四项姿态指标" },
            { step: "03", title: "跟随训练", desc: "分级康复动作，语音引导跟练" },
          ].map(({ step, title, desc }) => (
            <motion.div
              key={step}
              variants={stepItemVariant}
              className="text-center"
            >
              <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                {step}
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">{title}</h3>
              <p className="text-sm text-slate-400">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* ============ CTA ============ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45, ease: smoothEase }}
        className="mt-12 text-center"
      >
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-block"
        >
          <Link
            href="/detect"
            className="inline-flex items-center gap-2 bg-teal-600 text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-teal-700 transition-colors no-underline shadow-lg shadow-teal-200 animate-glow-pulse"
          >
            开始检测
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      </motion.section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  FeatureCard                                                        */
/* ------------------------------------------------------------------ */

function FeatureCard({
  href,
  icon,
  title,
  desc,
  accent,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  accent: string;
}) {
  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      variants={cardMotion}
      className="rounded-2xl"
    >
      <Link
        href={href}
        className="block bg-white rounded-2xl border border-slate-100 p-6 hover:border-teal-200 transition-colors no-underline group"
      >
        <motion.div
          whileHover={{ scale: 1.08 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${accent}`}
        >
          {icon}
        </motion.div>
        <h3 className="font-semibold text-slate-800 mb-1.5">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
      </Link>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

function DetectIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}

function TrainIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  );
}

function AIIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4Z" />
      <path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4Z" />
      <line x1="12" x2="12" y1="11" y2="14" />
    </svg>
  );
}
