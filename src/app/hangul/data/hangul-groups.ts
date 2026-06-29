// file: src/app/hangul/data/hangul-groups.ts

import { HANGUL_AUDIO_SRC_BY_ID } from './generated/hangul-audio.generated';
import { HangulGroup } from './hangul-types';

const RAW_HANGUL_GROUPS: HangulGroup[] = [
  {
    id: 'easy-consonants',
    title: 'Easy Consonants',
    description: 'Start with simple Korean consonants.',
    difficulty: 'easy',
    order: 1,
    items: [
      {
        id: 'giyeok',
        hangul: 'ㄱ',
        romanization: 'g/k',
        practicalPronunciation: 'g',
        kind: 'consonant',
        similarSound: 'like g in “go”',
      },
      {
        id: 'nieun',
        hangul: 'ㄴ',
        romanization: 'n',
        practicalPronunciation: 'n',
        kind: 'consonant',
        similarSound: 'like n in “no”',
      },
      {
        id: 'digeut',
        hangul: 'ㄷ',
        romanization: 'd/t',
        practicalPronunciation: 'd',
        kind: 'consonant',
        similarSound: 'like d in “dog”',
      },
      {
        id: 'rieul',
        hangul: 'ㄹ',
        romanization: 'r/l',
        practicalPronunciation: 'r/l',
        kind: 'consonant',
        similarSound: 'between r and l',
      },
      {
        id: 'mieum',
        hangul: 'ㅁ',
        romanization: 'm',
        practicalPronunciation: 'm',
        kind: 'consonant',
        similarSound: 'like m in “mom”',
      },
    ],
  },
  {
    id: 'easy-vowels',
    title: 'Easy Vowels',
    description: 'Learn the first basic Korean vowels.',
    difficulty: 'easy',
    order: 2,
    items: [
      {
        id: 'a',
        hangul: 'ㅏ',
        romanization: 'a',
        practicalPronunciation: 'a',
        kind: 'vowel',
        similarSound: 'like a in “father”',
      },
      {
        id: 'eo',
        hangul: 'ㅓ',
        romanization: 'eo',
        practicalPronunciation: 'aw/uh',
        kind: 'vowel',
        similarSound: 'like “uh” but more open',
      },
      {
        id: 'o',
        hangul: 'ㅗ',
        romanization: 'o',
        practicalPronunciation: 'o',
        kind: 'vowel',
        similarSound: 'like o in “go”',
      },
      {
        id: 'u',
        hangul: 'ㅜ',
        romanization: 'u',
        practicalPronunciation: 'oo',
        kind: 'vowel',
        similarSound: 'like oo in “moon”',
      },
      {
        id: 'eu',
        hangul: 'ㅡ',
        romanization: 'eu',
        practicalPronunciation: 'eu',
        kind: 'vowel',
        similarSound: 'tight “uh” sound',
      },
      {
        id: 'i',
        hangul: 'ㅣ',
        romanization: 'i',
        practicalPronunciation: 'ee',
        kind: 'vowel',
        similarSound: 'like ee in “see”',
      },
    ],
  },
  {
    id: 'first-syllables',
    title: 'First Syllables',
    description: 'Combine consonants and vowels into real Hangul blocks.',
    difficulty: 'easy',
    order: 3,
    items: [
      {
        id: 'ga',
        hangul: '가',
        romanization: 'ga',
        practicalPronunciation: 'ga',
        kind: 'syllable',
        similarSound: 'like ga in “garden”',
      },
      {
        id: 'na',
        hangul: '나',
        romanization: 'na',
        practicalPronunciation: 'na',
        kind: 'syllable',
        similarSound: 'like na',
      },
      {
        id: 'da',
        hangul: '다',
        romanization: 'da',
        practicalPronunciation: 'da',
        kind: 'syllable',
        similarSound: 'like da',
      },
      {
        id: 'ma',
        hangul: '마',
        romanization: 'ma',
        practicalPronunciation: 'ma',
        kind: 'syllable',
        similarSound: 'like ma',
      },
    ],
  },
];

export const HANGUL_GROUPS: HangulGroup[] = RAW_HANGUL_GROUPS.map(group => ({
  ...group,
  items: group.items.map(item => ({
    ...item,
    audioSrc: HANGUL_AUDIO_SRC_BY_ID[item.id],
  })),
}));