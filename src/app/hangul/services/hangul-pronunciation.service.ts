// file: src/app/hangul/services/hangul-pronunciation.service.ts

import { Injectable } from '@angular/core';

export interface PronounceHangulOptions {
  text: string;
  audioSrc?: string;
  lang?: string;
  rate?: number;
  pitch?: number;
}

@Injectable({
  providedIn: 'root',
})
export class HangulPronunciationService {
  async pronounce(options: PronounceHangulOptions): Promise<void> {
    if (options.audioSrc) {
      const played = await this.playLocalAudio(options.audioSrc);

      if (played) {
        return;
      }
    }

    this.pronounceWithBrowser(options);
  }

  private async playLocalAudio(src: string): Promise<boolean> {
    try {
      const audio = new Audio(src);
      audio.currentTime = 0;

      await audio.play();

      return true;
    } catch (error) {
      console.warn('Local Hangul audio failed. Falling back to browser TTS.', {
        src,
        error,
      });

      return false;
    }
  }

  private pronounceWithBrowser(options: PronounceHangulOptions): boolean {
    if (!this.canUseNativeSpeech()) {
      console.warn('Browser speech synthesis is not available.');
      return false;
    }

    const text = options.text.trim();

    if (!text) {
      return false;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = options.lang ?? 'ko-KR';
    utterance.rate = options.rate ?? 0.8;
    utterance.pitch = options.pitch ?? 1;

    const voice = this.findKoreanVoice();

    if (voice) {
      utterance.voice = voice;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);

    return true;
  }

  private canUseNativeSpeech(): boolean {
    return (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      'SpeechSynthesisUtterance' in window
    );
  }

  private findKoreanVoice(): SpeechSynthesisVoice | undefined {
    const voices = window.speechSynthesis.getVoices();

    return (
      voices.find(voice => voice.lang === 'ko-KR') ??
      voices.find(voice => voice.lang.toLowerCase().startsWith('ko'))
    );
  }
}