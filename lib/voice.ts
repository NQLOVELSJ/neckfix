let synth: SpeechSynthesis | null = null;
let utterance: SpeechSynthesisUtterance | null = null;

export function initVoice(): boolean {
  if (typeof window === "undefined") return false;
  synth = window.speechSynthesis;
  return !!synth;
}

export function speak(text: string, lang = "zh-CN", rate = 0.9): void {
  if (!synth) {
    synth = window.speechSynthesis;
  }
  if (!synth) return;

  synth.cancel();

  utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  const voices = synth.getVoices();
  const zhVoice = voices.find(
    (v) => v.lang.startsWith("zh-CN") || v.lang.startsWith("zh-TW") || v.lang.startsWith("zh")
  );
  if (zhVoice) {
    utterance.voice = zhVoice;
  }

  synth.speak(utterance);
}

export function speakInstruction(text: string): void {
  speak(text, "zh-CN", 0.85);
}

export function stopSpeaking(): void {
  if (synth) {
    synth.cancel();
  }
}

export function isSpeaking(): boolean {
  return synth?.speaking ?? false;
}
