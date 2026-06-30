// file: src/app/hangul/services/hangul-celebration.service.ts

import { Injectable, signal } from '@angular/core';

export type HangulCelebrationIntensity = 'minimal' | 'strong' | 'perfect';

export interface HangulCelebrationPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
  emoji: string;
}

export interface HangulCelebrationOptions {
  intensity?: HangulCelebrationIntensity;
  count?: number;
  playAudio?: boolean;
  audioSrc?: string;
}

const AUDIO_BY_INTENSITY: Record<HangulCelebrationIntensity, string> = {
  minimal: '/freesound_community-tada-fanfare-a-6313.mp3',
  strong: '/koiroylers-tada-fanfare-356032.mp3',
  perfect: '/tithuh-level-up-02-528919.mp3',
};

export const DEFAULT_HANGUL_CELEBRATION_AUDIO_SRC =
  AUDIO_BY_INTENSITY.minimal;

@Injectable({
  providedIn: 'root',
})
export class HangulCelebrationService {
  pieces = signal<HangulCelebrationPiece[]>([]);

  private clearTimeoutId: number | undefined;

  async celebrate(options: HangulCelebrationOptions = {}): Promise<void> {
    const intensity = options.intensity ?? 'strong';
    const count = options.count ?? this.getDefaultCount(intensity);

    this.pieces.set(this.createPieces(count, intensity));

    if (this.clearTimeoutId !== undefined) {
      window.clearTimeout(this.clearTimeoutId);
    }

    this.clearTimeoutId = window.setTimeout(() => {
      this.clear();
    }, this.getClearDelay(intensity));

    if (options.playAudio ?? true) {
      await this.playAudio(options.audioSrc ?? AUDIO_BY_INTENSITY[intensity]);
    }
  }

  clear(): void {
    this.pieces.set([]);

    if (this.clearTimeoutId !== undefined) {
      window.clearTimeout(this.clearTimeoutId);
      this.clearTimeoutId = undefined;
    }
  }

  private getDefaultCount(intensity: HangulCelebrationIntensity): number {
    switch (intensity) {
      case 'minimal':
        return 3;
      case 'strong':
        return 36;
      case 'perfect':
        return 90;
    }
  }

  private getClearDelay(intensity: HangulCelebrationIntensity): number {
    switch (intensity) {
      case 'minimal':
        return 2800;
      case 'strong':
        return 4300;
      case 'perfect':
        return 5600;
    }
  }

  private async playAudio(audioSrc: string): Promise<void> {
    try {
      const audio = new Audio(audioSrc);
      audio.currentTime = 0;
      await audio.play();
    } catch (error) {
      console.warn('Failed to play celebration audio.', error);
    }
  }

  private createPieces(
    count: number,
    intensity: HangulCelebrationIntensity,
  ): HangulCelebrationPiece[] {
    const emojisByIntensity: Record<HangulCelebrationIntensity, string[]> = {
      minimal: ['✨', '⭐'],
      strong: ['🎉', '✨', '⭐', '🌟', '💫'],
      perfect: ['💎', '🔷', '🔹', '🎉', '✨', '⭐', '🌟', '💫'],
    };

    const durationByIntensity: Record<
      HangulCelebrationIntensity,
      [number, number]
    > = {
      minimal: [1600, 2400],
      strong: [1800, 3600],
      perfect: [1800, 4600],
    };

    const sizeByIntensity: Record<HangulCelebrationIntensity, [number, number]> =
      {
        minimal: [18, 24],
        strong: [18, 30],
        perfect: [20, 38],
      };

    const [minDuration, maxDuration] = durationByIntensity[intensity];
    const [minSize, maxSize] = sizeByIntensity[intensity];
    const emojis = emojisByIntensity[intensity];

    return Array.from({ length: count }, (_, index) => ({
      id: Date.now() + index,
      left: randomBetween(0, 100),
      delay:
        intensity === 'perfect'
          ? randomBetween(0, 1200)
          : randomBetween(0, 700),
      duration: randomBetween(minDuration, maxDuration),
      size: randomBetween(minSize, maxSize),
      rotation: randomBetween(0, 360),
      emoji: emojis[index % emojis.length],
    }));
  }
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
