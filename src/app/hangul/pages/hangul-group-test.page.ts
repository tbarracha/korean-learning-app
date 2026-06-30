// file: src/app/hangul/pages/hangul-group-test.page.ts

import { NgClass } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HANGUL_GROUPS } from '../data/hangul-groups';
import { HangulItem } from '../data/hangul-types';
import { HangulPronunciationService } from '../services/hangul-pronunciation.service';

type TestQuestionType =
  | 'hangul-to-romanization'
  | 'romanization-to-hangul'
  | 'audio-to-hangul'
  | 'audio-to-romanization';

type TestState = 'setup' | 'active' | 'finished';

type ConfettiIntensity = 'minimal' | 'strong' | 'perfect';

interface TestQuestion {
  id: string;
  type: TestQuestionType;
  prompt: string;
  answer: string;
  options: string[];
  item: HangulItem;
}

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
  emoji: string;
}

const COMPLETION_AUDIO_SRC = '/tithuh-level-up-02-528919.mp3';

const MIN_PASSING_SCORE_RATIO = 0.5;
const STRONG_PASSING_SCORE_RATIO = 0.8;
const PERFECT_SCORE_RATIO = 1;

@Component({
  selector: 'app-hangul-group-test-page',
  standalone: true,
  imports: [RouterLink, NgClass],
  styles: [
    `
      @keyframes hangul-confetti-fall {
        0% {
          transform: translateY(-20vh) rotate(0deg);
          opacity: 0;
        }

        10% {
          opacity: 1;
        }

        100% {
          transform: translateY(110vh) rotate(720deg);
          opacity: 0;
        }
      }

      .confetti-piece {
        animation-name: hangul-confetti-fall;
        animation-timing-function: linear;
        animation-fill-mode: both;
      }
    `,
  ],
  template: `
    <main class="min-h-dvh bg-neutral-950 text-white px-4 py-6">
      <section class="mx-auto max-w-md space-y-5">
        @if (group()) {
          <header class="flex items-center gap-3">
            <a
              [routerLink]="['/hangul/groups', group()!.id]"
              class="shrink-0 text-sm text-sky-300"
            >
              ← Back
            </a>

            <h1 class="min-w-0 truncate text-lg font-semibold text-neutral-200">
              {{ group()!.title }} Test
            </h1>
          </header>

          @if (testState() === 'setup') {
            <section
              class="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div class="space-y-2">
                <p class="text-sm text-sky-300">Test setup</p>

                <h2 class="text-2xl font-bold">
                  How many questions?
                </h2>

                <p class="text-sm text-neutral-400">
                  Questions are randomized and will not repeat inside the same
                  test.
                </p>
              </div>

              <div class="grid grid-cols-3 gap-2">
                @for (size of availableQuestionCounts(); track size) {
                  <button
                    type="button"
                    (click)="selectedQuestionCount.set(size)"
                    class="rounded-2xl border py-4 text-center text-lg font-semibold transition active:scale-[0.98]"
                    [ngClass]="getQuestionCountClass(size)"
                  >
                    {{ size }}
                  </button>
                }
              </div>

              <div class="rounded-2xl bg-black/20 p-4 text-sm text-neutral-400">
                <p>
                  Available unique questions:
                  <span class="font-semibold text-neutral-200">
                    {{ allPossibleQuestionCount() }}
                  </span>
                </p>

                <p class="mt-1">
                  Selected:
                  <span class="font-semibold text-neutral-200">
                    {{ selectedQuestionCount() }}
                  </span>
                </p>
              </div>

              <button
                type="button"
                (click)="startTest()"
                class="w-full rounded-2xl bg-sky-500 py-3 text-sm font-semibold text-white active:scale-[0.98] transition"
              >
                Start test
              </button>
            </section>
          }

          @if (testState() === 'active') {
            @if (currentQuestion()) {
              <section
                class="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div class="flex items-center justify-between gap-3">
                  <p class="text-sm text-neutral-400">
                    Question {{ currentQuestionIndex() + 1 }} /
                    {{ questions().length }}
                  </p>

                  <p class="text-sm text-neutral-400">
                    Score: {{ correctCount() }} / {{ answeredCount() }}
                  </p>
                </div>

                <div class="mt-4 space-y-3">
                  <p class="text-sm text-sky-300">
                    {{ getQuestionLabel(currentQuestion()!.type) }}
                  </p>

                  <div
                    class="flex min-h-32 items-center justify-center rounded-2xl bg-black/30 px-4 py-6 text-center"
                  >
                    @if (isAudioQuestion(currentQuestion()!)) {
                      <button
                        type="button"
                        (click)="playCurrentQuestionAudio()"
                        class="flex flex-col items-center gap-2 rounded-2xl bg-sky-500 px-8 py-5 text-white active:scale-[0.98] transition"
                      >
                        <span class="text-4xl">🔊</span>
                        <span class="text-sm font-semibold">Play audio</span>
                      </button>
                    } @else {
                      <p
                        class="font-bold"
                        [class.text-7xl]="isHangulPrompt(currentQuestion()!)"
                        [class.text-4xl]="!isHangulPrompt(currentQuestion()!)"
                      >
                        {{ currentQuestion()!.prompt }}
                      </p>
                    }
                  </div>
                </div>
              </section>

              <section class="grid gap-3">
                @for (option of currentQuestion()!.options; track option) {
                  <button
                    type="button"
                    (click)="selectAnswer(option)"
                    [disabled]="selectedAnswer() !== undefined"
                    class="rounded-2xl border p-4 text-left text-lg font-semibold transition active:scale-[0.98]"
                    [ngClass]="getOptionClass(option)"
                  >
                    {{ option }}
                  </button>
                }
              </section>

              @if (selectedAnswer() !== undefined) {
                <section class="space-y-3">
                  <div
                    class="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        @if (selectedAnswer() === currentQuestion()!.answer) {
                          <p class="font-semibold text-emerald-300">
                            Correct
                          </p>
                        } @else {
                          <p class="font-semibold text-red-300">
                            Not quite
                          </p>

                          <p class="mt-1 text-sm text-neutral-400">
                            Correct answer: {{ currentQuestion()!.answer }}
                          </p>
                        }
                      </div>

                      <button
                        type="button"
                        (click)="playCurrentQuestionAudio()"
                        class="shrink-0 rounded-xl bg-sky-500 px-3 py-2 text-xs font-semibold text-white active:scale-[0.98] transition"
                      >
                        🔊 Play
                      </button>
                    </div>

                    <p class="mt-3 text-sm text-neutral-500">
                      {{ currentQuestion()!.item.hangul }}
                      ·
                      {{ currentQuestion()!.item.romanization }}
                      @if (currentQuestion()!.item.similarSound) {
                        · {{ currentQuestion()!.item.similarSound }}
                      }
                    </p>
                  </div>

                  <button
                    type="button"
                    (click)="goToNextQuestion()"
                    class="w-full rounded-2xl bg-sky-500 py-3 text-sm font-semibold text-white active:scale-[0.98] transition"
                  >
                    @if (isLastQuestion()) {
                      Finish test
                    } @else {
                      Next question
                    }
                  </button>
                </section>
              }
            }
          }

          @if (testState() === 'finished') {
            <section
              class="relative overflow-hidden space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-center"
            >
              @if (shouldShowConfetti()) {
                <div
                  class="pointer-events-none fixed inset-0 z-50 overflow-hidden"
                >
                  @for (piece of confettiPieces; track piece.id) {
                    <span
                      class="confetti-piece absolute top-0"
                      [style.left.%]="piece.left"
                      [style.animation-delay.ms]="piece.delay"
                      [style.animation-duration.ms]="piece.duration"
                      [style.font-size.px]="piece.size"
                      [style.transform]="'rotate(' + piece.rotation + 'deg)'"
                    >
                      {{ piece.emoji }}
                    </span>
                  }
                </div>
              }

              <div>
                <p class="text-sm text-sky-300">Test complete</p>

                <h2 class="mt-2 text-4xl font-bold">
                  {{ correctCount() }} / {{ questions().length }}
                </h2>

                <p class="mt-2 text-neutral-400">
                  {{ getResultMessage() }}
                </p>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  (click)="resetToSetup()"
                  class="rounded-2xl bg-white/10 py-3 text-sm font-medium active:scale-[0.98] transition"
                >
                  New test
                </button>

                <button
                  type="button"
                  (click)="restartSameTest()"
                  class="rounded-2xl bg-white/10 py-3 text-sm font-medium active:scale-[0.98] transition"
                >
                  Retry same
                </button>
              </div>

              <a
                [routerLink]="['/hangul/groups', group()!.id]"
                class="block rounded-2xl bg-sky-500 py-3 text-sm font-semibold text-white active:scale-[0.98] transition"
              >
                Back to group
              </a>
            </section>
          }
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
export class HangulGroupTestPage {
  private route = inject(ActivatedRoute);
  private pronunciation = inject(HangulPronunciationService);

  groups = [...HANGUL_GROUPS].sort((a, b) => a.order - b.order);

  testState = signal<TestState>('setup');

  selectedQuestionCount = signal(10);
  questions = signal<TestQuestion[]>([]);

  currentQuestionIndex = signal(0);
  selectedAnswer = signal<string | undefined>(undefined);
  correctCount = signal(0);
  answeredCount = signal(0);

  confettiPieces: ConfettiPiece[] = [];

  group = computed(() => {
    const groupId = this.route.snapshot.paramMap.get('groupId');
    return this.groups.find((group) => group.id === groupId);
  });

  allPossibleQuestions = computed(() => {
    const group = this.group();

    if (!group) {
      return [];
    }

    return createAllPossibleQuestionsForGroup(group.items);
  });

  allPossibleQuestionCount = computed(() => {
    return this.allPossibleQuestions().length;
  });

  availableQuestionCounts = computed(() => {
    const max = this.allPossibleQuestionCount();
    const wantedCounts = [10, 15, 20];
    const available = wantedCounts.filter((count) => count <= max);

    if (available.length > 0) {
      return available;
    }

    return max > 0 ? [max] : [];
  });

  currentQuestion = computed(() => {
    return this.questions()[this.currentQuestionIndex()];
  });

  scoreRatio = computed(() => {
    const total = this.questions().length;

    if (total === 0) {
      return 0;
    }

    return this.correctCount() / total;
  });

  shouldShowConfetti = computed(() => {
    return (
      this.testState() === 'finished' &&
      this.scoreRatio() >= MIN_PASSING_SCORE_RATIO
    );
  });

  startTest(): void {
    const count = Math.min(
      this.selectedQuestionCount(),
      this.allPossibleQuestionCount(),
    );

    const questions = createRandomQuestionSet(this.allPossibleQuestions(), count);

    this.questions.set(questions);
    this.currentQuestionIndex.set(0);
    this.selectedAnswer.set(undefined);
    this.correctCount.set(0);
    this.answeredCount.set(0);
    this.confettiPieces = [];
    this.testState.set('active');
  }

  resetToSetup(): void {
    this.questions.set([]);
    this.currentQuestionIndex.set(0);
    this.selectedAnswer.set(undefined);
    this.correctCount.set(0);
    this.answeredCount.set(0);
    this.confettiPieces = [];
    this.testState.set('setup');
  }

  restartSameTest(): void {
    this.currentQuestionIndex.set(0);
    this.selectedAnswer.set(undefined);
    this.correctCount.set(0);
    this.answeredCount.set(0);
    this.confettiPieces = [];
    this.testState.set('active');
  }

  async playCurrentQuestionAudio(): Promise<void> {
    const question = this.currentQuestion();

    if (!question) {
      return;
    }

    await this.playQuestionAudio(question);
  }

  async selectAnswer(option: string): Promise<void> {
    const question = this.currentQuestion();

    if (!question || this.selectedAnswer() !== undefined) {
      return;
    }

    this.selectedAnswer.set(option);
    this.answeredCount.update((count) => count + 1);

    if (option === question.answer) {
      this.correctCount.update((count) => count + 1);
      await this.playQuestionAudio(question);
    }
  }

  async goToNextQuestion(): Promise<void> {
    if (this.isLastQuestion()) {
      this.refreshConfettiForScore();
      this.testState.set('finished');

      if (this.scoreRatio() >= MIN_PASSING_SCORE_RATIO) {
        await this.playCompletionAudio();
      }

      return;
    }

    this.currentQuestionIndex.update((index) => index + 1);
    this.selectedAnswer.set(undefined);
  }

  isLastQuestion(): boolean {
    return this.currentQuestionIndex() >= this.questions().length - 1;
  }

  isCorrectOption(option: string): boolean {
    const question = this.currentQuestion();

    return this.selectedAnswer() !== undefined && question?.answer === option;
  }

  isWrongSelectedOption(option: string): boolean {
    const question = this.currentQuestion();

    return (
      this.selectedAnswer() !== undefined &&
      this.selectedAnswer() === option &&
      question?.answer !== option
    );
  }

  isHangulPrompt(question: TestQuestion): boolean {
    return question.type === 'hangul-to-romanization';
  }

  isAudioQuestion(question: TestQuestion): boolean {
    return (
      question.type === 'audio-to-hangul' ||
      question.type === 'audio-to-romanization'
    );
  }

  getQuestionCountClass(size: number): string {
    if (this.selectedQuestionCount() === size) {
      return 'border-sky-400 bg-sky-500 text-white';
    }

    return 'border-white/10 bg-white/5 text-neutral-200';
  }

  getOptionClass(option: string): string {
    if (this.selectedAnswer() === undefined) {
      return 'border-white/10 bg-white/5';
    }

    if (this.isCorrectOption(option)) {
      return 'border-emerald-400 bg-emerald-400/15 text-emerald-200';
    }

    if (this.isWrongSelectedOption(option)) {
      return 'border-red-400 bg-red-400/15 text-red-200';
    }

    return 'opacity-60';
  }

  getQuestionLabel(type: TestQuestionType): string {
    switch (type) {
      case 'hangul-to-romanization':
        return 'Choose the romanization';
      case 'romanization-to-hangul':
        return 'Choose the Hangul';
      case 'audio-to-hangul':
        return 'Listen and choose the Hangul';
      case 'audio-to-romanization':
        return 'Listen and choose the romanization';
    }
  }

  getResultMessage(): string {
    const total = this.questions().length;
    const correct = this.correctCount();

    if (total === 0) {
      return 'No questions available.';
    }

    const ratio = correct / total;

    if (ratio === PERFECT_SCORE_RATIO) {
      return 'Perfect. Clean run. You owned this group.';
    }

    if (ratio >= STRONG_PASSING_SCORE_RATIO) {
      return 'Great work. You passed this group strongly.';
    }

    if (ratio >= MIN_PASSING_SCORE_RATIO) {
      return 'You passed, but barely. Review this group before moving on.';
    }

    return 'This group needs more practice. Go slower and repeat it.';
  }

  private refreshConfettiForScore(): void {
    const ratio = this.scoreRatio();

    if (ratio >= PERFECT_SCORE_RATIO) {
      this.confettiPieces = createConfettiPieces(90, 'perfect');
      return;
    }

    if (ratio >= STRONG_PASSING_SCORE_RATIO) {
      this.confettiPieces = createConfettiPieces(36, 'strong');
      return;
    }

    if (ratio >= MIN_PASSING_SCORE_RATIO) {
      this.confettiPieces = createConfettiPieces(3, 'minimal');
      return;
    }

    this.confettiPieces = [];
  }

  private async playQuestionAudio(question: TestQuestion): Promise<void> {
    await this.pronunciation.pronounce({
      text: question.item.ttsText ?? question.item.hangul,
      audioSrc: question.item.audioSrc,
      lang: 'ko-KR',
      rate: 0.8,
    });
  }

  private async playCompletionAudio(): Promise<void> {
    try {
      const audio = new Audio(COMPLETION_AUDIO_SRC);
      audio.currentTime = 0;
      await audio.play();
    } catch (error) {
      console.warn('Failed to play completion audio.', error);
    }
  }
}

function createAllPossibleQuestionsForGroup(items: HangulItem[]): TestQuestion[] {
  const questionTypes: TestQuestionType[] = [
    'hangul-to-romanization',
    'romanization-to-hangul',
    'audio-to-hangul',
    'audio-to-romanization',
  ];

  const questions = items.flatMap((item) => {
    return questionTypes.map((type) => createQuestion(type, item, items));
  });

  return questions;
}

function createRandomQuestionSet(
  allQuestions: TestQuestion[],
  count: number,
): TestQuestion[] {
  return shuffle(allQuestions).slice(0, count);
}

function createQuestion(
  type: TestQuestionType,
  item: HangulItem,
  allItems: HangulItem[],
): TestQuestion {
  const answer = getAnswerForType(type, item);
  const prompt = getPromptForType(type, item);
  const options = createOptions(type, item, allItems);

  return {
    id: `${item.id}-${type}`,
    type,
    prompt,
    answer,
    options,
    item,
  };
}

function getPromptForType(type: TestQuestionType, item: HangulItem): string {
  switch (type) {
    case 'hangul-to-romanization':
      return item.hangul;
    case 'romanization-to-hangul':
      return item.romanization;
    case 'audio-to-hangul':
    case 'audio-to-romanization':
      return 'audio';
  }
}

function getAnswerForType(type: TestQuestionType, item: HangulItem): string {
  switch (type) {
    case 'hangul-to-romanization':
      return item.romanization;
    case 'romanization-to-hangul':
      return item.hangul;
    case 'audio-to-hangul':
      return item.hangul;
    case 'audio-to-romanization':
      return item.romanization;
  }
}

function createOptions(
  type: TestQuestionType,
  item: HangulItem,
  allItems: HangulItem[],
): string[] {
  const answer = getAnswerForType(type, item);

  const candidates = allItems
    .filter((candidate) => candidate.id !== item.id)
    .map((candidate) => getAnswerForType(type, candidate))
    .filter((value) => value !== answer);

  const wrongOptions = shuffle([...new Set(candidates)]).slice(0, 3);

  return shuffle([answer, ...wrongOptions]);
}

function createConfettiPieces(
  count: number,
  intensity: ConfettiIntensity = 'strong',
): ConfettiPiece[] {
  const emojisByIntensity: Record<ConfettiIntensity, string[]> = {
    minimal: ['✨', '⭐'],
    strong: ['🎉', '✨', '⭐', '🌟', '💫'],
    perfect: ['💎', '🔷', '🔹', '🎉', '✨', '⭐', '🌟', '💫'],
  };

  const durationByIntensity: Record<ConfettiIntensity, [number, number]> = {
    minimal: [1600, 2400],
    strong: [1800, 3600],
    perfect: [1800, 4600],
  };

  const sizeByIntensity: Record<ConfettiIntensity, [number, number]> = {
    minimal: [18, 24],
    strong: [18, 30],
    perfect: [20, 38],
  };

  const [minDuration, maxDuration] = durationByIntensity[intensity];
  const [minSize, maxSize] = sizeByIntensity[intensity];
  const emojis = emojisByIntensity[intensity];

  return Array.from({ length: count }, (_, index) => ({
    id: index,
    left: randomBetween(0, 100),
    delay:
      intensity === 'perfect'
        ? randomBetween(0, 1200)
        : randomBetween(0, 700),
    duration: randomBetween(minDuration, maxDuration),
    size: randomBetween(minSize, maxSize),
    rotation: randomBetween(0, 360),
    emoji: emojis[index % emojis.length],
  }));
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
}