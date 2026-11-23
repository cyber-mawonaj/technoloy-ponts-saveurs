export function isSpeechAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function stopSpeech(): void {
  if (!isSpeechAvailable()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore speech synthesis errors in restricted environments
  }
}

export function speakFrench(text: string): void {
  if (!isSpeechAvailable() || !text.trim()) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.96;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Non-fatal fallback
  }
}
