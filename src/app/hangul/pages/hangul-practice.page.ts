// file: src/app/hangul/pages/hangul-practice.page.ts

import { Component, computed, effect, inject, signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HANGUL_GROUPS } from '../data/hangul-groups';
import { HangulWritingPadComponent } from '../components/hangul-writing-pad.component';
import { HangulPronunciationService } from '../services/hangul-pronunciation.service';
import { ThemeToggleButtonComponent } from '../../shared/theme/theme-toggle-button.component';

@Component({
  selector: 'app-hangul-practice-page',
  standalone: true,
  imports: [RouterLink, HangulWritingPadComponent, ThemeToggleButtonComponent],
  template: `
    <main class="min-h-dvh bg-base px-4 py-6 text-base-content">
      <section class="mx-auto max-w-md space-y-5">
        @if (item() && group()) {
          <header class="flex items-center justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3">
              <a
                [routerLink]="['/hangul/groups', group()!.id]"
                class="shrink-0 text-sm font-medium text-primary"
              >
                ← Back
              </a>

              <h1 class="min-w-0 truncate text-lg font-semibold text-base-content/85">
                {{ group()!.title }}
              </h1>
            </div>

            <app-theme-toggle-button />
          </header>

          <section class="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
            <div class="flex items-start justify-between gap-4">
              <div class="space-y-1">
                <h2 class="text-3xl font-bold">
                  {{ item()!.romanization }}
                </h2>

                @if (item()!.similarSound) {
                  <p class="text-sm text-base-content/70">
                    {{ item()!.similarSound }}
                  </p>
                }
              </div>

              <span
                class="rounded-full bg-base-200 px-2.5 py-1 text-xs text-base-content/75"
              >
                {{ item()!.kind }}
              </span>
            </div>
          </section>

          <section class="space-y-3">
            <div class="flex items-center justify-between gap-3">
              <h2 class="font-semibold">Try writing it</h2>

              <p class="text-right text-sm text-base-content/55">
                {{ currentItemPosition() }} / {{ group()!.items.length }}
              </p>
            </div>

            <app-hangul-writing-pad
              [resetKey]="item()!.id"
              [preview]="item()!.hangul"
              [audioSrc]="item()!.audioSrc"
              (shapeChecked)="handleShapeChecked()"
            />
          </section>

          <section class="space-y-3">
            @if (!hasCheckedCurrentItem()) {
              <button
                type="button"
                (click)="handleBottomAction()"
                class="block w-full rounded-2xl bg-base-200 py-3 text-center text-sm font-medium text-base-content transition active:scale-[0.98]"
              >
                Check
              </button>
            } @else if (nextItem()) {
              <button
                type="button"
                (click)="handleBottomAction()"
                class="block w-full rounded-2xl bg-primary py-3 text-center text-sm font-semibold text-primary-content transition active:scale-[0.98]"
              >
                Next: {{ nextItem()!.romanization }}
              </button>
            } @else {
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  (click)="restartGroup()"
                  class="rounded-2xl bg-base-200 py-3 text-center text-sm font-medium text-base-content transition active:scale-[0.98]"
                >
                  Restart
                </button>

                @if (nextGroup() && nextGroup()!.items.length > 0) {
                  <button
                    type="button"
                    (click)="goToNextGroup()"
                    class="rounded-2xl bg-primary py-3 text-center text-sm font-semibold text-primary-content transition active:scale-[0.98]"
                  >
                    Next group
                  </button>
                } @else {
                  <button
                    type="button"
                    (click)="finishPractice()"
                    class="rounded-2xl bg-primary py-3 text-center text-sm font-semibold text-primary-content transition active:scale-[0.98]"
                  >
                    Finish
                  </button>
                }
              </div>

              <a
                [routerLink]="['/hangul/groups', group()!.id, 'test']"
                class="block rounded-2xl bg-base-200 py-3 text-center text-sm font-medium text-base-content transition active:scale-[0.98]"
              >
                Test this group
              </a>
            }

            @if (!nextItem()) {
              <p class="text-center text-xs text-base-content/55">
                You reached the end of this group.
              </p>
            }
          </section>
        } @else {
          <div class="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
            <p class="font-medium">Item not found.</p>

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
export class HangulPracticePage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pronunciation = inject(HangulPronunciationService);

  @ViewChild(HangulWritingPadComponent)
  private writingPad?: HangulWritingPadComponent;

  private lastPronouncedItemId: string | undefined;

  private paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  groups = [...HANGUL_GROUPS].sort((a, b) => a.order - b.order);
  hasCheckedCurrentItem = signal(false);

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

  constructor() {
    effect(() => {
      const item = this.item();

      if (!item) {
        return;
      }

      if (this.lastPronouncedItemId === item.id) {
        return;
      }

      this.lastPronouncedItemId = item.id;

      void this.pronunciation.pronounce({
        text: item.ttsText ?? item.hangul,
        audioSrc: item.audioSrc,
        lang: 'ko-KR',
        rate: 0.8,
      });

      this.hasCheckedCurrentItem.set(false);
    });
  }

  async handleBottomAction(): Promise<void> {
    if (!this.hasCheckedCurrentItem()) {
      await this.writingPad?.checkShape();
      return;
    }

    const group = this.group();
    const nextItem = this.nextItem();

    if (group && nextItem) {
      await this.router.navigate(['/hangul/practice', group.id, nextItem.id]);
    }
  }

  handleShapeChecked(): void {
    this.hasCheckedCurrentItem.set(true);
  }

  async restartGroup(): Promise<void> {
    const group = this.group();
    const firstItem = this.firstItem();

    if (!group || !firstItem) {
      return;
    }

    await this.router.navigate(['/hangul/practice', group.id, firstItem.id]);
  }

  async goToNextGroup(): Promise<void> {
    const nextGroup = this.nextGroup();

    if (!nextGroup?.items.length) {
      return;
    }

    await this.router.navigate([
      '/hangul/practice',
      nextGroup.id,
      nextGroup.items[0].id,
    ]);
  }

  async finishPractice(): Promise<void> {
    await this.router.navigate(['/hangul']);
  }
}
