// file: src/app/hangul/services/hangul-pronunciation.service.ts

import { Injectable } from '@angular/core';

export interface PronounceHangulOptions {
  text: string;
  lang?: string;
  rate?: number;
  pitch?: number;
}

@Injectable({
  providedIn: 'root',
})
export class HangulPronunciationService {
  private readonly defaultLang = 'ko-KR';

  pronounce(options: PronounceHangulOptions): void {
    if (!this.canSpeak()) {
      console.warn('Speech synthesis is not supported in this browser.');
      return;
    }

    const text = options.text.trim();

    if (!text) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = options.lang ?? this.defaultLang;
    utterance.rate = options.rate ?? 0.85;
    utterance.pitch = options.pitch ?? 1;

    const voice = this.findKoreanVoice();

    if (voice) {
      utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
  }

  canSpeak(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  private findKoreanVoice(): SpeechSynthesisVoice | undefined {
    const voices = window.speechSynthesis.getVoices();

    return voices.find(voice => {
      return voice.lang.toLowerCase().startsWith('ko');
    });
  }
}