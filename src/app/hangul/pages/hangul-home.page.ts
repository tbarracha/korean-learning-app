// file: src/app/hangul/pages/hangul-home.page.ts

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HANGUL_GROUPS } from '../data/hangul-groups';
import { ThemeToggleButtonComponent } from '../../shared/theme/theme-toggle-button.component';

@Component({
  selector: 'app-hangul-home-page',
  standalone: true,
  imports: [RouterLink, ThemeToggleButtonComponent],
  template: `
    <main class="min-h-dvh bg-base px-4 py-6 text-base-content">
      <section class="mx-auto max-w-md space-y-6">
        <header class="space-y-4">
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-2">
              <p class="text-sm font-medium text-primary">Korean Basics</p>

              <h1 class="text-3xl font-bold tracking-tight">
                Learn to read Hangul
              </h1>
            </div>

            <app-theme-toggle-button />
          </div>

          <p class="text-base-content/70">
            Start with simple consonants and vowels, then combine them into syllable blocks.
          </p>
        </header>

        <div class="grid gap-3">
          @for (group of groups; track group.id) {
            <a
              [routerLink]="['/hangul/groups', group.id]"
              class="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm transition active:scale-[0.98]"
            >
              <div class="space-y-3">
                <div class="space-y-1">
                  <div class="flex items-center justify-between gap-3">
                    <h2 class="text-lg font-semibold">
                      {{ group.title }}
                    </h2>

                    <span class="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
                      {{ group.difficulty }}
                    </span>
                  </div>

                  <p class="text-sm text-base-content/70">
                    {{ group.description }}
                  </p>
                </div>

                <div class="rounded-xl bg-base-200 px-3 py-2">
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
    return items.map((item) => item.hangul).join(' ');
  }
}