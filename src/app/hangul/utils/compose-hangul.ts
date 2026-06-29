// file: src/app/hangul/utils/compose-hangul.ts

const INITIALS = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ',
  'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ',
  'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];

const VOWELS = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ',
  'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ',
  'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ',
  'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ',
  'ㅣ',
];

const FINALS = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ',
  'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ',
  'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ',
  'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ',
  'ㅌ', 'ㅍ', 'ㅎ',
];

export function composeHangul(
  initial: string,
  vowel: string,
  final = '',
): string | null {
  const initialIndex = INITIALS.indexOf(initial);
  const vowelIndex = VOWELS.indexOf(vowel);
  const finalIndex = FINALS.indexOf(final);

  if (initialIndex === -1 || vowelIndex === -1 || finalIndex === -1) {
    return null;
  }

  const code =
    0xac00 +
    initialIndex * 21 * 28 +
    vowelIndex * 28 +
    finalIndex;

  return String.fromCharCode(code);
}