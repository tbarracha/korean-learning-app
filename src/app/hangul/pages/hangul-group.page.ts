// file: src/app/hangul/pages/hangul-group.page.ts

import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HANGUL_GROUPS } from '../data/hangul-groups';
import { ThemeToggleButtonComponent } from '../../shared/theme/theme-toggle-button.component';

@Component({
  selector: 'app-hangul-group-page',
  standalone: true,
  imports: [RouterLink, ThemeToggleButtonComponent],
  template: `
    <main class="min-h-dvh bg-base px-4 py-6 text-base-content">
      <section class="mx-auto max-w-md space-y-5">
        @if (group()) {
          <header class="space-y-4">
            <div class="flex items-center justify-between gap-3">
              <a routerLink="/hangul" class="text-sm font-medium text-primary">
                ← Back
              </a>

              <app-theme-toggle-button />
            </div>

            <div class="space-y-1">
              <div class="flex items-center justify-between gap-3">
                <h1 class="text-3xl font-bold">
                  {{ group()!.title }}
                </h1>

                <span
                  class="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary"
                >
                  {{ group()!.difficulty }}
                </span>
              </div>

              <p class="text-base-content/70">
                {{ group()!.description }}
              </p>
            </div>
          </header>

          <a
            [routerLink]="['/hangul/groups', group()!.id, 'test']"
            class="block rounded-2xl bg-primary py-3 text-center text-sm font-semibold text-primary-content transition active:scale-[0.98]"
          >
            Test this group
          </a>

          <div class="grid grid-cols-2 gap-3">
            @for (item of group()!.items; track item.id) {
              <a
                [routerLink]="['/hangul/practice', group()!.id, item.id]"
                class="rounded-2xl border border-base-300 bg-base-100 p-4 text-center shadow-sm transition active:scale-[0.98]"
              >
                <div class="space-y-3">
                  <div
                    class="mx-auto flex size-24 items-center justify-center rounded-2xl bg-base-200 text-6xl font-bold"
                  >
                    {{ item.hangul }}
                  </div>

                  <div class="space-y-1">
                    <p class="text-xl font-semibold">
                      {{ item.romanization }}
                    </p>

                    @if (item.similarSound) {
                      <p class="truncate text-xs text-base-content/55">
                        {{ item.similarSound }}
                      </p>
                    }
                  </div>

                  <div>
                    <span
                      class="inline-flex rounded-full bg-base-200 px-2 py-1 text-xs text-base-content/75"
                    >
                      {{ item.kind }}
                    </span>
                  </div>
                </div>
              </a>
            }
          </div>
        } @else {
          <div class="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
            <p class="font-medium">Group not found.</p>

            <a
              routerLink="/hangul"
              class="mt-2 inline-block text-sm font-medium text-primary"
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
