import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:py-20">
      {/* Hero */}
      <section className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-teal-800 mb-4 tracking-tight">
          告别「短信脖」
          <span className="block text-teal-600 text-2xl sm:text-3xl mt-2 font-semibold">
            NeckFix 帮您科学纠正
          </span>
        </h1>
        <p className="text-slate-500 max-w-lg mx-auto text-lg leading-relaxed">
          基于 AI 视觉检测，实时评估脖子前倾、头部前伸、耸肩和身体倾斜。
          所有检测纯本地运行，保护您的隐私。
        </p>
      </section>

      {/* Feature Cards */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
        <FeatureCard
          href="/detect"
          icon={<DetectIcon />}
          title="姿态检测"
          desc="实时摄像头检测，四维度评估颈部姿态"
          accent="bg-teal-50 text-teal-700"
        />
        <FeatureCard
          href="/train"
          icon={<TrainIcon />}
          title="康复训练"
          desc="分级动作指导，动画+语音双重引导"
          accent="bg-emerald-50 text-emerald-700"
        />
        <FeatureCard
          href="/history"
          icon={<HistoryIcon />}
          title="数据记录"
          desc="打卡日历与趋势图表，追踪康复进展"
          accent="bg-cyan-50 text-cyan-700"
        />
        <FeatureCard
          href="/detect"
          icon={<AIIcon />}
          title="AI 建议"
          desc="智能分析姿态数据，给出个性化纠正方案"
          accent="bg-amber-50 text-amber-700"
        />
      </section>

      {/* How it works */}
      <section className="bg-white rounded-2xl border border-teal-100 p-8 sm:p-10">
        <h2 className="text-2xl font-bold text-teal-800 mb-8 text-center">使用流程</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { step: "01", title: "开启摄像头", desc: "浏览器端完成检测，画面不上传" },
            { step: "02", title: "实时检测分析", desc: "AI 自动评估四项姿态指标" },
            { step: "03", title: "跟随训练", desc: "分级康复动作，语音引导跟练" },
          ].map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                {step}
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">{title}</h3>
              <p className="text-sm text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-12 text-center">
        <Link
          href="/detect"
          className="inline-flex items-center gap-2 bg-teal-600 text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-teal-700 transition-colors no-underline shadow-lg shadow-teal-200"
        >
          开始检测
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </section>
    </div>
  );
}

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
    <Link
      href={href}
      className="block bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:border-teal-200 transition-all no-underline group"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${accent}`}>
        {icon}
      </div>
      <h3 className="font-semibold text-slate-800 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
    </Link>
  );
}

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
