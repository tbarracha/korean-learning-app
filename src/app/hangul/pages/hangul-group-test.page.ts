// file: src/app/hangul/pages/hangul-group-test.page.ts

import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HANGUL_GROUPS } from '../data/hangul-groups';
import { HangulItem } from '../data/hangul-types';

type TestQuestionType =
  | 'hangul-to-romanization'
  | 'romanization-to-hangul'
  | 'pronunciation-to-hangul'
  | 'pronunciation-to-romanization';

interface TestQuestion {
  id: string;
  type: TestQuestionType;
  prompt: string;
  answer: string;
  options: string[];
  item: HangulItem;
}

@Component({
  selector: 'app-hangul-group-test-page',
  standalone: true,
  imports: [RouterLink],
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

          @if (!isFinished()) {
            @if (currentQuestion()) {
              <section class="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div class="flex items-center justify-between gap-3">
                  <p class="text-sm text-neutral-400">
                    Question {{ currentQuestionIndex() + 1 }} / {{ questions().length }}
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
                    <p
                      class="font-bold"
                      [class.text-7xl]="isHangulPrompt(currentQuestion()!)"
                      [class.text-4xl]="!isHangulPrompt(currentQuestion()!)"
                    >
                      {{ currentQuestion()!.prompt }}
                    </p>
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
                    [class.border-white/10]="selectedAnswer() === undefined"
                    [class.bg-white/5]="selectedAnswer() === undefined"
                    [class.border-emerald-400]="isCorrectOption(option)"
                    [class.bg-emerald-400/15]="isCorrectOption(option)"
                    [class.text-emerald-200]="isCorrectOption(option)"
                    [class.border-red-400]="isWrongSelectedOption(option)"
                    [class.bg-red-400/15]="isWrongSelectedOption(option)"
                    [class.text-red-200]="isWrongSelectedOption(option)"
                    [class.opacity-60]="selectedAnswer() !== undefined && !isCorrectOption(option) && !isWrongSelectedOption(option)"
                  >
                    {{ option }}
                  </button>
                }
              </section>

              @if (selectedAnswer() !== undefined) {
                <section class="space-y-3">
                  <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
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
          } @else {
            <section class="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
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
                  (click)="restartTest()"
                  class="rounded-2xl bg-white/10 py-3 text-sm font-medium active:scale-[0.98] transition"
                >
                  Restart
                </button>

                <a
                  [routerLink]="['/hangul/groups', group()!.id]"
                  class="rounded-2xl bg-sky-500 py-3 text-sm font-semibold text-white active:scale-[0.98] transition"
                >
                  Back to group
                </a>
              </div>
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

  groups = [...HANGUL_GROUPS].sort((a, b) => a.order - b.order);

  group = computed(() => {
    const groupId = this.route.snapshot.paramMap.get('groupId');
    return this.groups.find((group) => group.id === groupId);
  });

  questions = computed(() => {
    const group = this.group();

    if (!group) {
      return [];
    }

    return createQuestionsForGroup(group.items);
  });

  currentQuestionIndex = signal(0);
  selectedAnswer = signal<string | undefined>(undefined);
  correctCount = signal(0);
  answeredCount = signal(0);
  isFinished = signal(false);

  currentQuestion = computed(() => {
    return this.questions()[this.currentQuestionIndex()];
  });

  selectAnswer(option: string): void {
    const question = this.currentQuestion();

    if (!question || this.selectedAnswer() !== undefined) {
      return;
    }

    this.selectedAnswer.set(option);
    this.answeredCount.update((count) => count + 1);

    if (option === question.answer) {
      this.correctCount.update((count) => count + 1);
    }
  }

  goToNextQuestion(): void {
    if (this.isLastQuestion()) {
      this.isFinished.set(true);
      return;
    }

    this.currentQuestionIndex.update((index) => index + 1);
    this.selectedAnswer.set(undefined);
  }

  restartTest(): void {
    this.currentQuestionIndex.set(0);
    this.selectedAnswer.set(undefined);
    this.correctCount.set(0);
    this.answeredCount.set(0);
    this.isFinished.set(false);
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

  getQuestionLabel(type: TestQuestionType): string {
    switch (type) {
      case 'hangul-to-romanization':
        return 'Choose the romanization';
      case 'romanization-to-hangul':
        return 'Choose the Hangul';
      case 'pronunciation-to-hangul':
        return 'Choose the Hangul from the sound hint';
      case 'pronunciation-to-romanization':
        return 'Choose the romanization from the sound hint';
    }
  }

  getResultMessage(): string {
    const total = this.questions().length;
    const correct = this.correctCount();

    if (total === 0) {
      return 'No questions available.';
    }

    const ratio = correct / total;

    if (ratio === 1) {
      return 'Perfect. You know this group well.';
    }

    if (ratio >= 0.8) {
      return 'Good work. A quick review should lock this in.';
    }

    if (ratio >= 0.5) {
      return 'Decent start. Practice the missed ones again.';
    }

    return 'This group needs more practice. Go slower and repeat it.';
  }
}

function createQuestionsForGroup(items: HangulItem[]): TestQuestion[] {
  const questionTypes: TestQuestionType[] = [
    'hangul-to-romanization',
    'romanization-to-hangul',
    'pronunciation-to-hangul',
    'pronunciation-to-romanization',
  ];

  const questions = items.flatMap((item) => {
    return questionTypes.map((type) => createQuestion(type, item, items));
  });

  return shuffle(questions);
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
    case 'pronunciation-to-hangul':
      return item.practicalPronunciation;
    case 'pronunciation-to-romanization':
      return item.practicalPronunciation;
  }
}

function getAnswerForType(type: TestQuestionType, item: HangulItem): string {
  switch (type) {
    case 'hangul-to-romanization':
      return item.romanization;
    case 'romanization-to-hangul':
      return item.hangul;
    case 'pronunciation-to-hangul':
      return item.hangul;
    case 'pronunciation-to-romanization':
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

function shuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
}