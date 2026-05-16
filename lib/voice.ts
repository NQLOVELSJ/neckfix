let synth: SpeechSynthesis | null = null;

export function initVoice(): boolean {
  if (typeof window === "undefined") return false;
  synth = window.speechSynthesis;
  return !!synth;
}

function getZhVoice(): SpeechSynthesisVoice | undefined {
  if (!synth) return undefined;
  return synth.getVoices().find(
    (v) => v.lang.startsWith("zh-CN") || v.lang.startsWith("zh-TW") || v.lang.startsWith("zh"),
  );
}

function doSpeak(text: string, lang: string, rate: number): void {
  if (!synth) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = rate;
  u.pitch = 1.0;
  u.volume = 1.0;
  const voice = getZhVoice();
  if (voice) u.voice = voice;
  synth.speak(u);
}

// Interrupting speak — cancels any current speech (for critical announcements)
export function speak(text: string, lang = "zh-CN", rate = 0.9): void {
  if (!synth) {
    synth = typeof window !== "undefined" ? window.speechSynthesis : null;
  }
  if (!synth) return;

  synth.cancel();
  // Small delay after cancel to ensure speech engine is ready
  setTimeout(() => doSpeak(text, lang, rate), 80);
}

export function speakInstruction(text: string): void {
  speak(text, "zh-CN", 0.85);
}

// Non-interrupting speak — skips if something is already playing
export function speakIfSilent(text: string): boolean {
  if (!synth) {
    synth = typeof window !== "undefined" ? window.speechSynthesis : null;
  }
  if (!synth) return false;

  if (synth.speaking) return false;

  doSpeak(text, "zh-CN", 0.9);
  return true;
}

export function stopSpeaking(): void {
  if (synth) {
    synth.cancel();
  }
}

export function isSpeaking(): boolean {
  return synth?.speaking ?? false;
}
