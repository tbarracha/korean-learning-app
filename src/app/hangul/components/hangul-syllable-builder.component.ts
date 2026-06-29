// file: src/app/hangul/components/hangul-syllable-builder.component.ts

import { Component, computed, signal } from '@angular/core';
import { composeHangul } from '../utils/compose-hangul';

@Component({
  selector: 'app-hangul-syllable-builder',
  standalone: true,
  template: `
    <section class="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-4">
      <header>
        <h2 class="text-lg font-semibold">
          Build a syllable
        </h2>
        <p class="text-sm text-neutral-400">
          Pick a consonant and a vowel.
        </p>
      </header>

      <div class="space-y-3">
        <p class="text-sm text-neutral-400">Consonant</p>

        <div class="grid grid-cols-5 gap-2">
          @for (consonant of consonants; track consonant) {
            <button
              type="button"
              (click)="selectedConsonant.set(consonant)"
              class="rounded-xl py-3 text-xl"
              [class.bg-sky-500]="selectedConsonant() === consonant"
              [class.bg-white/10]="selectedConsonant() !== consonant"
            >
              {{ consonant }}
            </button>
          }
        </div>
      </div>

      <div class="space-y-3">
        <p class="text-sm text-neutral-400">Vowel</p>

        <div class="grid grid-cols-5 gap-2">
          @for (vowel of vowels; track vowel) {
            <button
              type="button"
              (click)="selectedVowel.set(vowel)"
              class="rounded-xl py-3 text-xl"
              [class.bg-sky-500]="selectedVowel() === vowel"
              [class.bg-white/10]="selectedVowel() !== vowel"
            >
              {{ vowel }}
            </button>
          }
        </div>
      </div>

      <div class="rounded-2xl bg-black/30 p-5 text-center">
        <div class="text-sm text-neutral-400">
          Result
        </div>

        <div class="mt-2 text-7xl font-bold">
          {{ result() ?? '—' }}
        </div>
      </div>
    </section>
  `,
})
export class HangulSyllableBuilderComponent {
  consonants = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ'];
  vowels = ['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅡ', 'ㅣ'];

  selectedConsonant = signal('ㄱ');
  selectedVowel = signal('ㅏ');

  result = computed(() => {
    return composeHangul(this.selectedConsonant(), this.selectedVowel());
  });
}