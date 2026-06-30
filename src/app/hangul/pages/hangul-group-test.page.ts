// file: src/app/hangul/pages/hangul-group-test.page.ts

import { NgClass } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HANGUL_GROUPS } from '../data/hangul-groups';
import { HangulItem } from '../data/hangul-types';
import { HangulPronunciationService } from '../services/hangul-pronunciation.service';
import { ThemeToggleButtonComponent } from '../../shared/theme/theme-toggle-button.component';
import { HangulCelebrationOverlayComponent } from '../components/hangul-celebration-overlay.component';
import { HangulCelebrationService } from '../services/hangul-celebration.service';
import { HangulWritingPadComponent } from '../components/hangul-writing-pad.component';
import { HangulShapeScore } from '../services/hangul-shape-scoring.service';

type TestQuestionType =
  | 'hangul-to-romanization'
  | 'romanization-to-hangul'
  | 'audio-to-hangul'
  | 'audio-to-romanization'
  | 'romanization-to-drawing'
  | 'audio-to-drawing';

type TestState = 'setup' | 'active' | 'finished';

interface TestQuestion {
  id: string;
  type: TestQuestionType;
  prompt: string;
  answer: string;
  options: string[];
  item: HangulItem;
}

const MIN_PASSING_SCORE_RATIO = 0.5;
const STRONG_PASSING_SCORE_RATIO = 0.8;
const PERFECT_SCORE_RATIO = 1;

const DRAWING_PASSING_SCORE = 80;

@Component({
  selector: 'app-hangul-group-test-page',
  standalone: true,
  imports: [
    RouterLink,
    NgClass,
    ThemeToggleButtonComponent,
    HangulCelebrationOverlayComponent,
    HangulWritingPadComponent,
  ],
  template: `
    <main class="min-h-dvh bg-base px-4 py-6 text-base-content">
      <app-hangul-celebration-overlay />

      <section class="mx-auto max-w-md space-y-5">
        @if (group()) {
          <header class="flex items-center justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3">
              <a
                [routerLink]="['/hangul/groups', group()!.id]"
                class="shrink-0 text-sm font-medium text-primary"
              >
                ← Back
              </a>

              <h1 class="min-w-0 truncate text-lg font-semibold text-base-content/85">
                {{ group()!.title }} Test
              </h1>
            </div>

            <app-theme-toggle-button />
          </header>

          @if (testState() === 'setup') {
            <section
              class="space-y-4 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm"
            >
              <div class="space-y-2">
                <p class="text-sm font-medium text-primary">Test setup</p>

                <h2 class="text-2xl font-bold">How many questions?</h2>

                <p class="text-sm text-base-content/70">
                  Questions are randomized and will not repeat inside the same
                  test.
                </p>
              </div>

              <button
                type="button"
                (click)="toggleWritingQuestions()"
                class="flex w-full items-center justify-between rounded-2xl border border-base-300 bg-base-100 px-4 py-3 text-left shadow-sm transition active:scale-[0.98]"
              >
                <div>
                  <p class="text-sm font-semibold text-base-content">
                    Include writing questions
                  </p>

                  <p class="text-xs text-base-content/65">
                    Add draw-the-Hangul questions to this test
                  </p>
                </div>

                <span
                  class="rounded-full px-3 py-1 text-xs font-semibold"
                  [class.bg-primary]="includeWritingQuestions()"
                  [class.text-primary-content]="includeWritingQuestions()"
                  [class.bg-base-200]="!includeWritingQuestions()"
                  [class.text-base-content/75]="!includeWritingQuestions()"
                >
                  {{ includeWritingQuestions() ? 'On' : 'Off' }}
                </span>
              </button>

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

              <div
                class="rounded-2xl bg-base-200 p-4 text-sm text-base-content/70"
              >
                <p>
                  Available unique questions:
                  <span class="font-semibold text-base-content">
                    {{ allPossibleQuestionCount() }}
                  </span>
                </p>

                <p class="mt-1">
                  Selected:
                  <span class="font-semibold text-base-content">
                    {{ selectedQuestionCount() }}
                  </span>
                </p>
              </div>

              <button
                type="button"
                (click)="startTest()"
                class="w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-content transition active:scale-[0.98]"
              >
                Start test
              </button>
            </section>
          }

          @if (testState() === 'active') {
            @if (currentQuestion()) {
              <section
                class="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm"
              >
                <div class="flex items-center justify-between gap-3">
                  <p class="text-sm text-base-content/70">
                    Question {{ currentQuestionIndex() + 1 }} /
                    {{ questions().length }}
                  </p>

                  <p class="text-sm text-base-content/70">
                    Score: {{ correctCount() }} / {{ answeredCount() }}
                  </p>
                </div>

                <div class="mt-4 space-y-3">
                  <p class="text-sm font-medium text-primary">
                    {{ getQuestionLabel(currentQuestion()!.type) }}
                  </p>

                  <div
                    class="flex min-h-32 items-center justify-center rounded-2xl bg-base-200 px-4 py-6 text-center"
                  >
                    @if (isAudioQuestion(currentQuestion()!)) {
                      <button
                        type="button"
                        (click)="playCurrentQuestionAudio()"
                        class="flex flex-col items-center gap-2 rounded-2xl bg-primary px-8 py-5 text-primary-content transition active:scale-[0.98]"
                      >
                        <span class="text-4xl">🔊</span>
                        <span class="text-sm font-semibold">Play audio</span>
                      </button>
                    } @else {
                      <p
                        class="font-bold text-base-content"
                        [class.text-7xl]="isHangulPrompt(currentQuestion()!)"
                        [class.text-4xl]="!isHangulPrompt(currentQuestion()!)"
                      >
                        {{ currentQuestion()!.prompt }}
                      </p>
                    }
                  </div>
                </div>
              </section>

              @if (isDrawingQuestion(currentQuestion()!)) {
                <app-hangul-writing-pad
                  [resetKey]="currentQuestion()!.id"
                  [preview]="currentQuestion()!.item.hangul"
                  [audioSrc]="currentQuestion()!.item.audioSrc"
                  [initialPreviewVisible]="false"
                  [revealPreviewOnCheck]="false"
                  [showPreviewButton]="false"
                  [showSoundButton]="false"
                  [interactionLocked]="selectedAnswer() !== undefined"
                  (shapeChecked)="handleDrawingScore($event)"
                />
              } @else {
                <section class="grid gap-3">
                  @for (option of currentQuestion()!.options; track option) {
                    <button
                      type="button"
                      (click)="selectAnswer(option)"
                      [disabled]="selectedAnswer() !== undefined"
                      class="rounded-2xl border p-4 text-left text-lg font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed"
                      [ngClass]="getOptionClass(option)"
                    >
                      {{ option }}
                    </button>
                  }
                </section>
              }

              @if (selectedAnswer() !== undefined) {
                <section class="space-y-3">
                  <div
                    class="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        @if (isDrawingQuestion(currentQuestion()!)) {
                          @if ((lastDrawingScore() ?? 0) >= DRAWING_PASSING_SCORE) {
                            <p class="font-semibold text-success">Correct</p>
                          } @else {
                            <p class="font-semibold text-danger">Not quite</p>
                          }

                          <p class="mt-1 text-sm text-base-content/70">
                            Shape score: {{ lastDrawingScore() ?? 0 }}%
                          </p>
                        } @else {
                          @if (selectedAnswer() === currentQuestion()!.answer) {
                            <p class="font-semibold text-success">Correct</p>
                          } @else {
                            <p class="font-semibold text-danger">Not quite</p>

                            <p class="mt-1 text-sm text-base-content/70">
                              Correct answer: {{ currentQuestion()!.answer }}
                            </p>
                          }
                        }
                      </div>

                      <button
                        type="button"
                        (click)="playCurrentQuestionAudio()"
                        class="shrink-0 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-content transition active:scale-[0.98]"
                      >
                        🔊 Play
                      </button>
                    </div>

                    <p class="mt-3 text-sm text-base-content/55">
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
                    class="w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-content transition active:scale-[0.98]"
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
              class="relative space-y-4 overflow-hidden rounded-2xl border border-base-300 bg-base-100 p-5 text-center shadow-sm"
            >
              <div>
                <p class="text-sm font-medium text-primary">Test complete</p>

                <h2 class="mt-2 text-4xl font-bold">
                  {{ correctCount() }} / {{ questions().length }}
                </h2>

                <p class="mt-2 text-base-content/70">
                  {{ getResultMessage() }}
                </p>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  (click)="resetToSetup()"
                  class="rounded-2xl bg-base-200 py-3 text-sm font-medium text-base-content transition active:scale-[0.98]"
                >
                  New test
                </button>

                <button
                  type="button"
                  (click)="restartSameTest()"
                  class="rounded-2xl bg-base-200 py-3 text-sm font-medium text-base-content transition active:scale-[0.98]"
                >
                  Retry same
                </button>
              </div>

              <a
                [routerLink]="['/hangul/groups', group()!.id]"
                class="block rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-content transition active:scale-[0.98]"
              >
                Back to group
              </a>
            </section>
          }
        } @else {
          <div
            class="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm"
          >
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
export class HangulGroupTestPage {
  protected readonly DRAWING_PASSING_SCORE = DRAWING_PASSING_SCORE;

  private route = inject(ActivatedRoute);
  private pronunciation = inject(HangulPronunciationService);
  private celebration = inject(HangulCelebrationService);

  groups = [...HANGUL_GROUPS].sort((a, b) => a.order - b.order);

  testState = signal<TestState>('setup');

  selectedQuestionCount = signal(10);
  questions = signal<TestQuestion[]>([]);

  currentQuestionIndex = signal(0);
  selectedAnswer = signal<string | undefined>(undefined);
  correctCount = signal(0);
  answeredCount = signal(0);
  lastDrawingScore = signal<number | undefined>(undefined);
  includeWritingQuestions = signal(false);

  group = computed(() => {
    const groupId = this.route.snapshot.paramMap.get('groupId');
    return this.groups.find((group) => group.id === groupId);
  });

  allPossibleQuestions = computed(() => {
    const group = this.group();

    if (!group) {
      return [];
    }

    return createAllPossibleQuestionsForGroup(
      group.items,
      this.includeWritingQuestions(),
    );
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

  startTest(): void {
    const count = Math.min(
      this.selectedQuestionCount(),
      this.allPossibleQuestionCount(),
    );

    const questions = createRandomQuestionSet(this.allPossibleQuestions(), count);

    this.celebration.clear();
    this.questions.set(questions);
    this.currentQuestionIndex.set(0);
    this.selectedAnswer.set(undefined);
    this.correctCount.set(0);
    this.answeredCount.set(0);
    this.lastDrawingScore.set(undefined);
    this.testState.set('active');
  }

  resetToSetup(): void {
    this.celebration.clear();
    this.questions.set([]);
    this.currentQuestionIndex.set(0);
    this.selectedAnswer.set(undefined);
    this.correctCount.set(0);
    this.answeredCount.set(0);
    this.lastDrawingScore.set(undefined);
    this.testState.set('setup');
  }

  restartSameTest(): void {
    this.celebration.clear();
    this.currentQuestionIndex.set(0);
    this.selectedAnswer.set(undefined);
    this.correctCount.set(0);
    this.answeredCount.set(0);
    this.lastDrawingScore.set(undefined);
    this.testState.set('active');
  }

  toggleWritingQuestions(): void {
    this.includeWritingQuestions.update((value) => !value);
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

  handleDrawingScore(score: HangulShapeScore): void {
    const question = this.currentQuestion();

    if (!question || this.selectedAnswer() !== undefined) {
      return;
    }

    this.lastDrawingScore.set(score.score);
    this.selectedAnswer.set(`drawing:${score.score}`);
    this.answeredCount.update((count) => count + 1);

    if (score.score >= DRAWING_PASSING_SCORE) {
      this.correctCount.update((count) => count + 1);
    }
  }

  async goToNextQuestion(): Promise<void> {
    if (this.isLastQuestion()) {
      this.testState.set('finished');
      await this.celebrateTestResult();
      return;
    }

    this.currentQuestionIndex.update((index) => index + 1);
    this.selectedAnswer.set(undefined);
    this.lastDrawingScore.set(undefined);
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
      question.type === 'audio-to-romanization' ||
      question.type === 'audio-to-drawing'
    );
  }

  isDrawingQuestion(question: TestQuestion): boolean {
    return isDrawingQuestionType(question.type);
  }

  getQuestionCountClass(size: number): string {
    if (this.selectedQuestionCount() === size) {
      return 'border-primary bg-primary text-primary-content';
    }

    return 'border-base-300 bg-base-100 text-base-content';
  }

  getOptionClass(option: string): string {
    if (this.selectedAnswer() === undefined) {
      return 'border-base-300 bg-base-100 text-base-content';
    }

    if (this.isCorrectOption(option)) {
      return 'border-success bg-success/15 text-success';
    }

    if (this.isWrongSelectedOption(option)) {
      return 'border-danger bg-danger/15 text-danger';
    }

    return 'border-base-300 bg-base-100 text-base-content opacity-60';
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
      case 'romanization-to-drawing':
        return 'Draw the Hangul';
      case 'audio-to-drawing':
        return 'Listen and draw the Hangul';
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

  private async celebrateTestResult(): Promise<void> {
    const ratio = this.scoreRatio();

    if (ratio >= PERFECT_SCORE_RATIO) {
      await this.celebration.celebrate({
        intensity: 'perfect',
        count: 90,
        playAudio: true,
      });
      return;
    }

    if (ratio >= STRONG_PASSING_SCORE_RATIO) {
      await this.celebration.celebrate({
        intensity: 'strong',
        count: 36,
        playAudio: true,
      });
      return;
    }

    if (ratio >= MIN_PASSING_SCORE_RATIO) {
      await this.celebration.celebrate({
        intensity: 'minimal',
        count: 3,
        playAudio: true,
      });
    }
  }

  private async playQuestionAudio(question: TestQuestion): Promise<void> {
    await this.pronunciation.pronounce({
      text: question.item.ttsText ?? question.item.hangul,
      audioSrc: question.item.audioSrc,
      lang: 'ko-KR',
      rate: 0.8,
    });
  }
}

function createAllPossibleQuestionsForGroup(
  items: HangulItem[],
  includeWritingQuestions: boolean,
): TestQuestion[] {
  const questionTypes: TestQuestionType[] = [
    'hangul-to-romanization',
    'romanization-to-hangul',
    'audio-to-hangul',
    'audio-to-romanization',
  ];

  if (includeWritingQuestions) {
    questionTypes.push('romanization-to-drawing', 'audio-to-drawing');
  }

  return items.flatMap((item) => {
    return questionTypes.map((type) => createQuestion(type, item, items));
  });
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
  const options = isDrawingQuestionType(type)
    ? []
    : createOptions(type, item, allItems);

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
    case 'romanization-to-drawing':
      return item.romanization;
    case 'audio-to-hangul':
    case 'audio-to-romanization':
    case 'audio-to-drawing':
      return 'audio';
  }
}

function getAnswerForType(type: TestQuestionType, item: HangulItem): string {
  switch (type) {
    case 'hangul-to-romanization':
      return item.romanization;
    case 'romanization-to-hangul':
    case 'audio-to-hangul':
    case 'romanization-to-drawing':
    case 'audio-to-drawing':
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

function isDrawingQuestionType(type: TestQuestionType): boolean {
  return type === 'romanization-to-drawing' || type === 'audio-to-drawing';
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
}
