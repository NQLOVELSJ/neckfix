let synth: SpeechSynthesis | null = null;

export function initVoice(): boolean {
  if (typeof window === "undefined") return false;
  synth = window.speechSynthesis;
  return !!synth;
}

function getZhVoice(): SpeechSynthesisVoice | undefined {
  if (!synth) return undefined;
  const zh = synth.getVoices().filter(
    (v) => v.lang.startsWith("zh-CN") || v.lang.startsWith("zh-TW") || v.lang.startsWith("zh"),
  );
  if (zh.length === 0) return undefined;

  // Prefer natural-sounding voices over robotic ones, ranked by quality
  const prefer = [
    "tingting",    // macOS — excellent female CN voice
    "huihui",      // Windows — good female CN voice
    "yaoyao",      // Windows 11 — newer female CN (Microsoft Speech)
    "kangkang",    // Windows — male CN
    "xiaoxiao",    // Edge/Win11 — neural female CN
    "yunjian",     // Edge/Win11 — neural male CN
    "xiaoyi",      // Edge/Win11 — neural female CN/TW
    "yunxi",       // Edge/Win11 — neural male CN
    "yunyang",     // Edge/Win11 — neural male CN
    "xiaobei",     // Edge/Win11 — neural female CN (northeastern)
    "xiaoni",      // Edge/Win11 — neural female CN
    "xiaomo",      // Edge/Win11 — neural female CN/TW
    "xiaoxuan",    // Edge/Win11 — neural female CN
    "xiaohan",     // Edge/Win11 — neural female CN
    "xiaorui",     // Edge/Win11 — neural female CN
    "xiaoshuang",  // Edge/Win11 — neural child CN
  ];
  for (const name of prefer) {
    const match = zh.find((v) => v.name.toLowerCase().includes(name));
    if (match) return match;
  }
  return zh[0];
}

function doSpeak(text: string, lang: string, rate: number): void {
  if (!synth) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = rate;
  u.pitch = 1.1;  // slightly higher pitch sounds more natural in Chinese
  u.volume = 0.95;
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
  setTimeout(() => doSpeak(text, lang, rate), 50);
}

export function speakInstruction(text: string): void {
  speak(text, "zh-CN", 1.0);
}

// Faster rate for phase cues so voice keeps up with 4s breathing cycle
export function speakFast(text: string): void {
  speak(text, "zh-CN", 1.2);
}

// Non-interrupting speak — skips if something is already playing
export function speakIfSilent(text: string): boolean {
  if (!synth) {
    synth = typeof window !== "undefined" ? window.speechSynthesis : null;
  }
  if (!synth) return false;

  if (synth.speaking) return false;

  doSpeak(text, "zh-CN", 1.0);
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
