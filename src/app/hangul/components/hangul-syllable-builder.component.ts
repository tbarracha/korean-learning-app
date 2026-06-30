// file: src/app/hangul/components/hangul-syllable-builder.component.ts

import { Component, computed, signal } from '@angular/core';
import { composeHangul } from '../utils/compose-hangul';

@Component({
  selector: 'app-hangul-syllable-builder',
  standalone: true,
  template: `
    <section class="space-y-5 rounded-3xl border border-base-300 bg-base-100 p-4 shadow-sm">
      <header>
        <h2 class="text-lg font-semibold text-base-content">
          Build a syllable
        </h2>
        <p class="text-sm text-base-content/70">
          Pick a consonant and a vowel.
        </p>
      </header>

      <div class="space-y-3">
        <p class="text-sm text-base-content/70">Consonant</p>

        <div class="grid grid-cols-5 gap-2">
          @for (consonant of consonants; track consonant) {
            <button
              type="button"
              (click)="selectedConsonant.set(consonant)"
              class="rounded-xl py-3 text-xl font-semibold transition active:scale-[0.98]"
              [class.bg-primary]="selectedConsonant() === consonant"
              [class.text-primary-content]="selectedConsonant() === consonant"
              [class.bg-base-200]="selectedConsonant() !== consonant"
              [class.text-base-content]="selectedConsonant() !== consonant"
            >
              {{ consonant }}
            </button>
          }
        </div>
      </div>

      <div class="space-y-3">
        <p class="text-sm text-base-content/70">Vowel</p>

        <div class="grid grid-cols-5 gap-2">
          @for (vowel of vowels; track vowel) {
            <button
              type="button"
              (click)="selectedVowel.set(vowel)"
              class="rounded-xl py-3 text-xl font-semibold transition active:scale-[0.98]"
              [class.bg-primary]="selectedVowel() === vowel"
              [class.text-primary-content]="selectedVowel() === vowel"
              [class.bg-base-200]="selectedVowel() !== vowel"
              [class.text-base-content]="selectedVowel() !== vowel"
            >
              {{ vowel }}
            </button>
          }
        </div>
      </div>

      <div class="rounded-2xl bg-base-200 p-5 text-center">
        <div class="text-sm text-base-content/70">
          Result
        </div>

        <div class="mt-2 text-7xl font-bold text-base-content">
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