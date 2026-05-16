"use client";

interface Props {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export default function PrivacyNotice({ open, onAccept, onDecline }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" style={{ animation: "fadeIn 0.2s ease-out" }}>
      <div className="bg-white rounded-2xl max-w-md mx-4 p-6 shadow-xl border border-teal-100" style={{ animation: "scaleIn 0.25s ease-out" }}>
        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-teal-800 mb-3">隐私保护声明</h2>
        <div className="text-slate-500 text-sm leading-relaxed space-y-2 mb-6">
          <p>
            您的隐私是我们的首要考量。NeckFix 的摄像头检测<b className="text-slate-700">完全在您的浏览器中运行</b>。
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>摄像头画面<b className="text-slate-700">不会上传</b>到任何服务器</li>
            <li>姿态数据<b className="text-slate-700">仅在本地处理</b>，使用 WebAssembly 技术</li>
            <li>AI 建议请求仅发送<b className="text-slate-700">脱敏的统计数据</b>，不包含图像</li>
            <li>训练记录存储在<b className="text-slate-700">您的浏览器本地</b></li>
          </ul>
          <p>您可以随时关闭摄像头，断开与姿态检测的连接。</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onDecline}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-medium active:bg-slate-100 transition-colors cursor-pointer touch-manipulation select-none"
          >
            暂不使用
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="flex-1 px-4 py-2.5 rounded-xl bg-teal-600 text-white font-medium active:bg-teal-800 transition-colors cursor-pointer touch-manipulation select-none"
          >
            同意并继续
          </button>
        </div>
      </div>
    </div>
  );
}
