// file: src/app/hangul/data/hangul-types.ts

export type HangulDifficulty = 'easy' | 'medium' | 'hard';

export type HangulKind = 'consonant' | 'vowel' | 'syllable';

export interface HangulItem {
  id: string;
  hangul: string;
  romanization: string;
  practicalPronunciation: string;
  kind: HangulKind;
  similarSound?: string;
  notes?: string;

  audioSrc?: string;
}

export interface HangulGroup {
  id: string;
  title: string;
  description: string;
  difficulty: HangulDifficulty;
  order: number;
  items: HangulItem[];
}