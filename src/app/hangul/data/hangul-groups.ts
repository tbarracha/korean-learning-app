// file: src/app/hangul/data/hangul-groups.ts

import { HANGUL_AUDIO_SRC_BY_ID } from './generated/hangul-audio.generated';
import { HangulGroup, HangulItem } from './hangul-types';

function withAudioSources(groups: HangulGroup[]): HangulGroup[] {
  return groups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      audioSrc: HANGUL_AUDIO_SRC_BY_ID[item.id],
    })),
  }));
}

function consonant(
  id: string,
  hangul: string,
  romanization: string,
  practicalPronunciation: string,
  similarSound: string,
  ttsText: string,
): HangulItem {
  return {
    id,
    hangul,
    romanization,
    practicalPronunciation,
    kind: 'consonant',
    similarSound,
    ttsText,
  };
}

function vowel(
  id: string,
  hangul: string,
  romanization: string,
  practicalPronunciation: string,
  similarSound: string,
  ttsText: string,
): HangulItem {
  return {
    id,
    hangul,
    romanization,
    practicalPronunciation,
    kind: 'vowel',
    similarSound,
    ttsText,
  };
}

function syllable(
  id: string,
  hangul: string,
  romanization: string,
  practicalPronunciation = romanization,
  similarSound = `like ${romanization}`,
): HangulItem {
  return {
    id,
    hangul,
    romanization,
    practicalPronunciation,
    kind: 'syllable',
    similarSound,
    ttsText: hangul,
  };
}

const RAW_HANGUL_GROUPS: HangulGroup[] = [
  {
    id: 'easy-consonants',
    title: 'Easy Consonants',
    description: 'Start with simple Korean consonants.',
    difficulty: 'easy',
    order: 1,
    items: [
      consonant('giyeok', 'ㄱ', 'g/k', 'g', 'like g in “go”', '기역'),
      consonant('nieun', 'ㄴ', 'n', 'n', 'like n in “no”', '니은'),
      consonant('digeut', 'ㄷ', 'd/t', 'd', 'like d in “dog”', '디귿'),
      consonant('rieul', 'ㄹ', 'r/l', 'r/l', 'between r and l', '리을'),
      consonant('mieum', 'ㅁ', 'm', 'm', 'like m in “mom”', '미음'),
    ],
  },
  {
    id: 'easy-vowels',
    title: 'Easy Vowels',
    description: 'Learn the first basic Korean vowels.',
    difficulty: 'easy',
    order: 2,
    items: [
      vowel('a', 'ㅏ', 'a', 'a', 'like a in “father”', '아'),
      vowel('eo', 'ㅓ', 'eo', 'aw/uh', 'like “uh” but more open', '어'),
      vowel('o', 'ㅗ', 'o', 'o', 'like o in “go”', '오'),
      vowel('u', 'ㅜ', 'u', 'oo', 'like oo in “moon”', '우'),
      vowel('eu', 'ㅡ', 'eu', 'eu', 'tight “uh” sound', '으'),
      vowel('i', 'ㅣ', 'i', 'ee', 'like ee in “see”', '이'),
    ],
  },
  {
    id: 'first-syllables',
    title: 'First Syllables',
    description: 'Combine consonants and vowels into real Hangul blocks.',
    difficulty: 'easy',
    order: 3,
    items: [
      syllable('ga', '가', 'ga', 'ga', 'like ga in “garden”'),
      syllable('na', '나', 'na'),
      syllable('da', '다', 'da'),
      syllable('ra', '라', 'ra/la'),
      syllable('ma', '마', 'ma'),
    ],
  },
  {
    id: 'more-basic-consonants',
    title: 'More Basic Consonants',
    description: 'Finish the common simple consonants.',
    difficulty: 'easy',
    order: 4,
    items: [
      consonant('bieup', 'ㅂ', 'b/p', 'b', 'like b in “boy”', '비읍'),
      consonant('siot', 'ㅅ', 's', 's', 'like s in “see”', '시옷'),
      consonant('ieung', 'ㅇ', 'ng / silent', 'silent/ng', 'silent at the start, ng at the end', '이응'),
      consonant('jieut', 'ㅈ', 'j', 'j', 'like j in “jam”', '지읒'),
      consonant('hieut', 'ㅎ', 'h', 'h', 'like h in “hat”', '히읗'),
    ],
  },
  {
    id: 'more-first-syllables',
    title: 'More First Syllables',
    description: 'Use the rest of the simple consonants with ㅏ.',
    difficulty: 'easy',
    order: 5,
    items: [
      syllable('ba', '바', 'ba'),
      syllable('sa', '사', 'sa'),
      syllable('a-syllable', '아', 'a', 'a', 'starts with silent ㅇ'),
      syllable('ja', '자', 'ja'),
      syllable('ha', '하', 'ha'),
    ],
  },
  {
    id: 'y-vowels',
    title: 'Y Vowels',
    description: 'Learn vowels that start with a y-like sound.',
    difficulty: 'medium',
    order: 6,
    items: [
      vowel('ya', 'ㅑ', 'ya', 'ya', 'like ya', '야'),
      vowel('yeo', 'ㅕ', 'yeo', 'yaw/yuh', 'like yuh, but open', '여'),
      vowel('yo', 'ㅛ', 'yo', 'yo', 'like yo', '요'),
      vowel('yu', 'ㅠ', 'yu', 'yoo', 'like you', '유'),
    ],
  },
  {
    id: 'y-vowel-syllables',
    title: 'Y Vowel Syllables',
    description: 'Practice y-like vowels inside syllable blocks.',
    difficulty: 'medium',
    order: 7,
    items: [
      syllable('gya', '갸', 'gya'),
      syllable('nyeo', '녀', 'nyeo'),
      syllable('dyo', '됴', 'dyo'),
      syllable('ryu', '류', 'ryu/lyu'),
      syllable('mya', '먀', 'mya'),
      syllable('bya', '뱌', 'bya'),
      syllable('syo', '쇼', 'syo/sho'),
      syllable('hyo', '효', 'hyo'),
    ],
  },
  {
    id: 'aspirated-consonants',
    title: 'Aspirated Consonants',
    description: 'These consonants have a stronger breathy sound.',
    difficulty: 'medium',
    order: 8,
    items: [
      consonant('kieuk', 'ㅋ', 'k', 'k', 'strong k sound', '키읔'),
      consonant('tieut', 'ㅌ', 't', 't', 'strong t sound', '티읕'),
      consonant('pieup', 'ㅍ', 'p', 'p', 'strong p sound', '피읖'),
      consonant('chieut', 'ㅊ', 'ch', 'ch', 'like ch in “chair”', '치읓'),
    ],
  },
  {
    id: 'aspirated-syllables',
    title: 'Aspirated Syllables',
    description: 'Practice stronger consonants with simple vowels.',
    difficulty: 'medium',
    order: 9,
    items: [
      syllable('ka', '카', 'ka'),
      syllable('ta', '타', 'ta'),
      syllable('pa', '파', 'pa'),
      syllable('cha', '차', 'cha'),
      syllable('ko', '코', 'ko'),
      syllable('tu', '투', 'tu'),
      syllable('pi', '피', 'pi'),
      syllable('cheo', '처', 'cheo'),
    ],
  },
  {
    id: 'ae-e-vowels',
    title: 'AE and E Vowels',
    description: 'Learn vowels that sound close to e/eh.',
    difficulty: 'medium',
    order: 10,
    items: [
      vowel('ae', 'ㅐ', 'ae', 'eh', 'like e in “bed”', '애'),
      vowel('e', 'ㅔ', 'e', 'eh', 'also close to e in “bed”', '에'),
      vowel('yae', 'ㅒ', 'yae', 'yeh', 'like yeh', '얘'),
      vowel('ye', 'ㅖ', 'ye', 'yeh', 'like yeh', '예'),
    ],
  },
  {
    id: 'ae-e-syllables',
    title: 'AE and E Syllables',
    description: 'Practice similar e-like vowels in blocks.',
    difficulty: 'medium',
    order: 11,
    items: [
      syllable('gae', '개', 'gae'),
      syllable('ge', '게', 'ge'),
      syllable('nae', '내', 'nae'),
      syllable('ne', '네', 'ne'),
      syllable('dae', '대', 'dae'),
      syllable('de', '데', 'de'),
      syllable('mae', '매', 'mae'),
      syllable('me', '메', 'me'),
    ],
  },
  {
    id: 'tense-consonants',
    title: 'Tense Consonants',
    description: 'These are tighter, stronger double consonants.',
    difficulty: 'hard',
    order: 12,
    items: [
      consonant('ssang-giyeok', 'ㄲ', 'kk', 'kk', 'tense k/g sound', '쌍기역'),
      consonant('ssang-digeut', 'ㄸ', 'tt', 'tt', 'tense d/t sound', '쌍디귿'),
      consonant('ssang-bieup', 'ㅃ', 'pp', 'pp', 'tense b/p sound', '쌍비읍'),
      consonant('ssang-siot', 'ㅆ', 'ss', 'ss', 'tense s sound', '쌍시옷'),
      consonant('ssang-jieut', 'ㅉ', 'jj', 'jj', 'tense j sound', '쌍지읒'),
    ],
  },
  {
    id: 'tense-syllables',
    title: 'Tense Syllables',
    description: 'Practice tense consonants in syllable blocks.',
    difficulty: 'hard',
    order: 13,
    items: [
      syllable('kka', '까', 'kka'),
      syllable('tta', '따', 'tta'),
      syllable('ppa', '빠', 'ppa'),
      syllable('ssa', '싸', 'ssa'),
      syllable('jja', '짜', 'jja'),
      syllable('kko', '꼬', 'kko'),
      syllable('ppu', '뿌', 'ppu'),
      syllable('jji', '찌', 'jji'),
    ],
  },
  {
    id: 'compound-vowels',
    title: 'Compound Vowels',
    description: 'Learn vowels made by combining simple vowel shapes.',
    difficulty: 'hard',
    order: 14,
    items: [
      vowel('wa', 'ㅘ', 'wa', 'wa', 'ㅗ + ㅏ', '와'),
      vowel('wae', 'ㅙ', 'wae', 'weh', 'ㅗ + ㅐ', '왜'),
      vowel('oe', 'ㅚ', 'oe', 'weh/way', 'ㅗ + ㅣ', '외'),
      vowel('wo', 'ㅝ', 'wo', 'wuh', 'ㅜ + ㅓ', '워'),
      vowel('we', 'ㅞ', 'we', 'weh', 'ㅜ + ㅔ', '웨'),
      vowel('wi', 'ㅟ', 'wi', 'wee', 'ㅜ + ㅣ', '위'),
      vowel('ui', 'ㅢ', 'ui', 'ui/ee', 'ㅡ + ㅣ', '의'),
    ],
  },
  {
    id: 'compound-vowel-syllables',
    title: 'Compound Vowel Syllables',
    description: 'Practice compound vowels inside full blocks.',
    difficulty: 'hard',
    order: 15,
    items: [
      syllable('gwa', '과', 'gwa'),
      syllable('gwe', '궤', 'gwe'),
      syllable('gwi', '귀', 'gwi'),
      syllable('nwa', '놔', 'nwa'),
      syllable('dwae', '돼', 'dwae'),
      syllable('mwo', '뭐', 'mwo'),
      syllable('swi', '쉬', 'swi/shwi'),
      syllable('hui', '희', 'hui'),
    ],
  },
  {
    id: 'batchim-first-finals',
    title: 'First Final Consonants',
    description: 'Learn syllables with a final consonant, called batchim.',
    difficulty: 'hard',
    order: 16,
    items: [
      syllable('gak', '각', 'gak'),
      syllable('gan', '간', 'gan'),
      syllable('gal', '갈', 'gal'),
      syllable('gam', '감', 'gam'),
      syllable('gap', '갑', 'gap'),
      syllable('gat', '갓', 'gat'),
      syllable('gang', '강', 'gang'),
      syllable('gah', '갛', 'gah'),
    ],
  },
  {
    id: 'batchim-patterns',
    title: 'Batchim Patterns',
    description: 'See how final consonants change the feel of a syllable.',
    difficulty: 'hard',
    order: 17,
    items: [
      syllable('nak', '낙', 'nak'),
      syllable('nan', '난', 'nan'),
      syllable('nal', '날', 'nal'),
      syllable('nam', '남', 'nam'),
      syllable('dap', '답', 'dap'),
      syllable('dat', '닷', 'dat'),
      syllable('mak', '막', 'mak'),
      syllable('man', '만', 'man'),
    ],
  },
];

export const HANGUL_GROUPS: HangulGroup[] = withAudioSources(RAW_HANGUL_GROUPS);