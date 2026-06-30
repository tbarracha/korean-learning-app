// file: src/app/hangul/pages/hangul-practice.page.ts

import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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
          <header class="flex items-center gap-3">
            <a
              [routerLink]="['/hangul/groups', group()!.id]"
              class="shrink-0 text-sm text-sky-300"
            >
              ← Back
            </a>

            <h1 class="min-w-0 truncate text-lg font-semibold text-neutral-200">
              {{ group()!.title }}
            </h1>
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

              <span
                class="rounded-full bg-white/10 px-2.5 py-1 text-xs text-neutral-300"
              >
                {{ item()!.kind }}
              </span>
            </div>
          </section>

          <section class="space-y-3">
            <div class="flex items-center justify-between gap-3">
              <h2 class="font-semibold">Try writing it</h2>

              <p class="text-right text-sm text-neutral-500">
                {{ currentItemPosition() }} / {{ group()!.items.length }}
              </p>
            </div>

            <app-hangul-writing-pad
              [resetKey]="item()!.id"
              [preview]="item()!.hangul"
              [audioSrc]="item()!.audioSrc"
            />
          </section>

          <section class="space-y-3">
            @if (nextItem()) {
              <a
                [routerLink]="[
                  '/hangul/practice',
                  group()!.id,
                  nextItem()!.id
                ]"
                class="block rounded-2xl bg-sky-500 py-3 text-center text-sm font-semibold text-white active:scale-[0.98] transition"
              >
                Next: {{ nextItem()!.romanization }}
              </a>
            } @else {
              <div class="grid grid-cols-2 gap-2">
                <a
                  [routerLink]="[
                    '/hangul/practice',
                    group()!.id,
                    firstItem()!.id
                  ]"
                  class="rounded-2xl bg-white/10 py-3 text-center text-sm font-medium active:scale-[0.98] transition"
                >
                  Restart
                </a>

                @if (nextGroup() && nextGroup()!.items.length > 0) {
                  <a
                    [routerLink]="[
                      '/hangul/practice',
                      nextGroup()!.id,
                      nextGroup()!.items[0].id
                    ]"
                    class="rounded-2xl bg-sky-500 py-3 text-center text-sm font-semibold text-white active:scale-[0.98] transition"
                  >
                    Next group
                  </a>
                } @else {
                  <a
                    routerLink="/hangul"
                    class="rounded-2xl bg-sky-500 py-3 text-center text-sm font-semibold text-white active:scale-[0.98] transition"
                  >
                    Finish
                  </a>
                }
              </div>

              <p class="text-center text-xs text-neutral-500">
                You reached the end of this group.
              </p>
            }
          </section>
        } @else {
          <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p class="font-medium">Item not found.</p>

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
export class HangulPracticePage {
  private route = inject(ActivatedRoute);

  private paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  groups = [...HANGUL_GROUPS].sort((a, b) => a.order - b.order);

  groupId = computed(() => {
    return this.paramMap().get('groupId');
  });

  itemId = computed(() => {
    return this.paramMap().get('itemId');
  });

  group = computed(() => {
    const groupId = this.groupId();
    return this.groups.find((group) => group.id === groupId);
  });

  item = computed(() => {
    const itemId = this.itemId();
    return this.group()?.items.find((item) => item.id === itemId);
  });

  currentItemIndex = computed(() => {
    const group = this.group();
    const item = this.item();

    if (!group || !item) {
      return -1;
    }

    return group.items.findIndex((candidate) => candidate.id === item.id);
  });

  currentItemPosition = computed(() => {
    const index = this.currentItemIndex();
    return index < 0 ? 0 : index + 1;
  });

  firstItem = computed(() => {
    return this.group()?.items[0];
  });

  nextItem = computed(() => {
    const group = this.group();
    const currentIndex = this.currentItemIndex();

    if (!group || currentIndex < 0) {
      return undefined;
    }

    return group.items[currentIndex + 1];
  });

  nextGroup = computed(() => {
    const group = this.group();

    if (!group) {
      return undefined;
    }

    const currentGroupIndex = this.groups.findIndex(
      (candidate) => candidate.id === group.id,
    );

    if (currentGroupIndex < 0) {
      return undefined;
    }

    return this.groups[currentGroupIndex + 1];
  });
}