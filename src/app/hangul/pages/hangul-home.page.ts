// file: src/app/hangul/pages/hangul-home.page.ts

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HANGUL_GROUPS } from '../data/hangul-groups';

@Component({
  selector: 'app-hangul-home-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="min-h-dvh bg-neutral-950 text-white px-4 py-6">
      <section class="mx-auto max-w-md space-y-6">
        <header class="space-y-2">
          <p class="text-sm text-sky-300 font-medium">Korean Basics</p>

          <h1 class="text-3xl font-bold tracking-tight">
            Learn to read Hangul
          </h1>

          <p class="text-neutral-400">
            Start with simple consonants and vowels, then combine them into syllable blocks.
          </p>
        </header>

        <div class="grid gap-3">
          @for (group of groups; track group.id) {
            <a
              [routerLink]="['/hangul/groups', group.id]"
              class="rounded-2xl border border-white/10 bg-white/5 p-4 active:scale-[0.98] transition"
            >
              <div class="space-y-3">
                <div class="space-y-1">
                  <div class="flex items-center justify-between gap-3">
                    <h2 class="text-lg font-semibold">
                      {{ group.title }}
                    </h2>

                    <span class="rounded-full bg-sky-400/10 px-2.5 py-1 text-xs font-medium text-sky-300">
                      {{ group.difficulty }}
                    </span>
                  </div>

                  <p class="text-sm text-neutral-400">
                    {{ group.description }}
                  </p>
                </div>

                <div class="rounded-xl bg-black/30 px-3 py-2">
                  <p class="text-2xl font-semibold tracking-wide">
                    {{ getHangulPreview(group.items) }}
                  </p>
                </div>
              </div>
            </a>
          }
        </div>
      </section>
    </main>
  `,
})
export class HangulHomePage {
  groups = [...HANGUL_GROUPS].sort((a, b) => a.order - b.order);

  getHangulPreview(items: { hangul: string }[]): string {
    return items.map(item => item.hangul).join(' ');
  }
}