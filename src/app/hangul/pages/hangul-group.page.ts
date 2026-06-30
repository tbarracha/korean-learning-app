// file: src/app/hangul/pages/hangul-group.page.ts

import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HANGUL_GROUPS } from '../data/hangul-groups';

@Component({
  selector: 'app-hangul-group-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="min-h-dvh bg-neutral-950 text-white px-4 py-6">
      <section class="mx-auto max-w-md space-y-5">
        @if (group()) {
          <header class="space-y-2">
            <a routerLink="/hangul" class="text-sm text-sky-300"> ← Back </a>

            <div class="space-y-1">
              <div class="flex items-center justify-between gap-3">
                <h1 class="text-3xl font-bold">
                  {{ group()!.title }}
                </h1>

                <span
                  class="rounded-full bg-sky-400/10 px-2.5 py-1 text-xs font-medium text-sky-300"
                >
                  {{ group()!.difficulty }}
                </span>
              </div>

              <p class="text-neutral-400">
                {{ group()!.description }}
              </p>
            </div>
          </header>

          <a
            [routerLink]="['/hangul/groups', group()!.id, 'test']"
            class="block rounded-2xl bg-sky-500 py-3 text-center text-sm font-semibold text-white active:scale-[0.98] transition"
          >
            Test this group
          </a>

          <div class="grid grid-cols-2 gap-3">
            @for (item of group()!.items; track item.id) {
              <a
                [routerLink]="['/hangul/practice', group()!.id, item.id]"
                class="rounded-2xl border border-white/10 bg-white/5 p-4 text-center active:scale-[0.98] transition"
              >
                <div class="space-y-3">
                  <div
                    class="mx-auto flex size-24 items-center justify-center rounded-2xl bg-black/30 text-6xl font-bold"
                  >
                    {{ item.hangul }}
                  </div>

                  <div class="space-y-1">
                    <p class="text-xl font-semibold">
                      {{ item.romanization }}
                    </p>

                    @if (item.similarSound) {
                      <p class="truncate text-xs text-neutral-500">
                        {{ item.similarSound }}
                      </p>
                    }
                  </div>

                  <div>
                    <span
                      class="inline-flex rounded-full bg-white/10 px-2 py-1 text-xs text-neutral-300"
                    >
                      {{ item.kind }}
                    </span>
                  </div>
                </div>
              </a>
            }
          </div>
        } @else {
          <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p class="font-medium">Group not found.</p>

            <a
              routerLink="/hangul"
              class="mt-2 inline-block text-sm text-sky-300"
            >
              Go back to Hangul home
            </a>
          </div>
        }
      </section>
    </main>
  `,
})
export class HangulGroupPage {
  private route = inject(ActivatedRoute);

  group = computed(() => {
    const groupId = this.route.snapshot.paramMap.get('groupId');
    return HANGUL_GROUPS.find((group) => group.id === groupId);
  });
}