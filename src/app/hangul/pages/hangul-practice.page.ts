// file: src/app/hangul/pages/hangul-practice.page.ts

import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HANGUL_GROUPS } from '../data/hangul-groups';
import { HangulWritingPadComponent } from '../components/hangul-writing-pad.component';

@Component({
  selector: 'app-hangul-practice-page',
  standalone: true,
  imports: [RouterLink, HangulWritingPadComponent],
  template: `
    <main class="min-h-dvh bg-neutral-950 text-white px-4 py-6">
      <section class="mx-auto max-w-md space-y-5">
        @if (item() && group()) {
          <header class="space-y-3">
            <a
              [routerLink]="['/hangul/groups', group()!.id]"
              class="text-sm text-sky-300"
            >
              ← Back
            </a>

            <div class="space-y-1">
              <div class="flex items-center justify-between gap-3">
                <h1 class="text-3xl font-bold">
                  {{ group()!.title }}
                </h1>

                <span class="rounded-full bg-sky-400/10 px-2.5 py-1 text-xs font-medium text-sky-300">
                  {{ group()!.difficulty }}
                </span>
              </div>

              <p class="text-neutral-400">
                {{ group()!.description }}
              </p>
            </div>
          </header>

          <section class="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div class="flex items-start justify-between gap-4">
              <div class="space-y-1">
                <h2 class="text-3xl font-bold">
                  {{ item()!.romanization }}
                </h2>

                @if (item()!.similarSound) {
                  <p class="text-sm text-neutral-400">
                    {{ item()!.similarSound }}
                  </p>
                }
              </div>

              <span class="rounded-full bg-white/10 px-2.5 py-1 text-xs text-neutral-300">
                {{ item()!.kind }}
              </span>
            </div>
          </section>

          <section class="space-y-3">
            <div class="flex items-center justify-between">
              <h2 class="font-semibold">
                Try writing it
              </h2>

              <p class="text-sm text-neutral-500">
                Preview disappears after first stroke
              </p>
            </div>

            <app-hangul-writing-pad [preview]="item()!.hangul" />
          </section>
        } @else {
          <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p class="font-medium">Item not found.</p>

            <a routerLink="/hangul" class="mt-2 inline-block text-sm text-sky-300">
              Go back to Hangul home
            </a>
          </div>
        }
      </section>
    </main>
  `,
})
export class HangulPracticePage {
  private route = inject(ActivatedRoute);

  group = computed(() => {
    const groupId = this.route.snapshot.paramMap.get('groupId');
    return HANGUL_GROUPS.find(group => group.id === groupId);
  });

  item = computed(() => {
    const itemId = this.route.snapshot.paramMap.get('itemId');
    return this.group()?.items.find(item => item.id === itemId);
  });
}