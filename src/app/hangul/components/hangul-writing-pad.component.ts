// file: src/app/hangul/components/hangul-writing-pad.component.ts

import {
  AfterViewInit,
  Component,
  ElementRef,
  effect,
  inject,
  input,
  OnChanges,
  OnDestroy,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { HangulPronunciationService } from '../services/hangul-pronunciation.service';
import { ThemeService } from '../../shared/theme/theme.service';

interface DrawingPoint {
  x: number;
  y: number;
}

interface DrawingStroke {
  points: DrawingPoint[];
}

@Component({
  selector: 'app-hangul-writing-pad',
  standalone: true,
  template: `
    <div class="space-y-3">
      <div
        class="relative h-80 w-full overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-sm"
      >
        <div
          class="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_srgb,var(--theme-base-content)_8%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_srgb,var(--theme-base-content)_8%,transparent)_1px,transparent_1px)] bg-[size:50%_50%]"
        ></div>

        <div
          class="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-base-300"
        ></div>

        <div
          class="pointer-events-none absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-base-300"
        ></div>

        @if (showPreview()) {
          <div
            class="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <span
              class="select-none text-[10.5rem] font-bold leading-none text-base-content/15"
            >
              {{ preview() }}
            </span>
          </div>
        }

        <canvas #canvas class="relative z-10 h-full w-full touch-none"></canvas>
      </div>

      <div class="grid grid-cols-3 gap-2">
        <button
          type="button"
          (click)="clear()"
          class="rounded-2xl bg-base-200 py-3 text-sm font-medium text-base-content transition active:scale-[0.98]"
        >
          🧽 Clear
        </button>

        <button
          type="button"
          (click)="pronounce()"
          class="rounded-2xl bg-primary py-3 text-sm font-medium text-primary-content transition active:scale-[0.98]"
        >
          🔊 Pronounce
        </button>

        <button
          type="button"
          (click)="showPreviewAgain()"
          class="rounded-2xl bg-base-200 py-3 text-sm font-medium text-base-content transition active:scale-[0.98]"
        >
          👁️ Preview
        </button>
      </div>
    </div>
  `,
})
export class HangulWritingPadComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  private pronunciation = inject(HangulPronunciationService);
  private theme = inject(ThemeService);

  preview = input('');
  audioSrc = input<string | undefined>();
  resetKey = input<string | undefined>();

  @ViewChild('canvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  showPreview = signal(true);

  private ctx!: CanvasRenderingContext2D;
  private drawing = false;
  private previewTimeoutId: number | undefined;
  private lastPoint: DrawingPoint | undefined;
  private activePointerId: number | undefined;
  private viewReady = false;

  private strokes: DrawingStroke[] = [];
  private currentStroke: DrawingStroke | undefined;

  constructor() {
    effect(() => {
      this.theme.theme();

      if (!this.viewReady) {
        return;
      }

      this.redrawCanvas();
    });
  }

  ngAfterViewInit(): void {
    this.setupCanvas();
    this.viewReady = true;

    const canvas = this.canvasRef.nativeElement;

    canvas.addEventListener('pointerdown', this.startDrawing);
    canvas.addEventListener('pointermove', this.draw);
    canvas.addEventListener('pointerup', this.stopDrawing);
    canvas.addEventListener('pointercancel', this.stopDrawing);
    canvas.addEventListener('pointerleave', this.stopDrawing);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['resetKey'] || !this.viewReady) {
      return;
    }

    this.resetPad();
  }

  ngOnDestroy(): void {
    const canvas = this.canvasRef.nativeElement;

    canvas.removeEventListener('pointerdown', this.startDrawing);
    canvas.removeEventListener('pointermove', this.draw);
    canvas.removeEventListener('pointerup', this.stopDrawing);
    canvas.removeEventListener('pointercancel', this.stopDrawing);
    canvas.removeEventListener('pointerleave', this.stopDrawing);

    if (this.previewTimeoutId !== undefined) {
      window.clearTimeout(this.previewTimeoutId);
    }
  }

  clear(): void {
    if (!this.ctx) {
      return;
    }

    this.strokes = [];
    this.currentStroke = undefined;
    this.lastPoint = undefined;

    this.clearCanvasPixels();
  }

  async pronounce(): Promise<void> {
    await this.pronunciation.pronounce({
      text: this.preview(),
      audioSrc: this.audioSrc(),
      lang: 'ko-KR',
      rate: 0.8,
    });
  }

  showPreviewAgain(): void {
    this.showPreview.set(true);

    if (this.previewTimeoutId !== undefined) {
      window.clearTimeout(this.previewTimeoutId);
    }

    this.previewTimeoutId = window.setTimeout(() => {
      this.showPreview.set(false);
    }, 1200);
  }

  private resetPad(): void {
    this.clear();
    this.showPreview.set(true);
    this.drawing = false;
    this.lastPoint = undefined;
    this.activePointerId = undefined;

    if (this.previewTimeoutId !== undefined) {
      window.clearTimeout(this.previewTimeoutId);
      this.previewTimeoutId = undefined;
    }
  }

  private setupCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;

    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);

    this.ctx = canvas.getContext('2d')!;
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    this.ctx.lineWidth = 11;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    this.applyCanvasInkStyle();
  }

  private startDrawing = (event: PointerEvent): void => {
    event.preventDefault();

    const canvas = this.canvasRef.nativeElement;

    this.applyCanvasInkStyle();

    this.showPreview.set(false);
    this.drawing = true;
    this.activePointerId = event.pointerId;

    canvas.setPointerCapture(event.pointerId);

    const point = this.getPoint(event);

    this.currentStroke = {
      points: [point],
    };

    this.strokes.push(this.currentStroke);
    this.lastPoint = point;

    this.drawDot(point);
    this.ctx.beginPath();
    this.ctx.moveTo(point.x, point.y);
  };

  private draw = (event: PointerEvent): void => {
    if (!this.drawing || this.activePointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();

    const events = this.getCoalescedPointerEvents(event);

    for (const pointerEvent of events) {
      const point = this.getPoint(pointerEvent);

      this.currentStroke?.points.push(point);
      this.drawSmoothPoint(point);
    }
  };

  private stopDrawing = (event: PointerEvent): void => {
    if (this.activePointerId !== event.pointerId) {
      return;
    }

    const canvas = this.canvasRef.nativeElement;

    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }

    this.drawing = false;
    this.activePointerId = undefined;
    this.lastPoint = undefined;
    this.currentStroke = undefined;
    this.ctx.closePath();
  };

  private drawSmoothPoint(currentPoint: DrawingPoint): void {
    if (!this.lastPoint) {
      this.lastPoint = currentPoint;
      return;
    }

    const midPoint = {
      x: (this.lastPoint.x + currentPoint.x) / 2,
      y: (this.lastPoint.y + currentPoint.y) / 2,
    };

    this.ctx.quadraticCurveTo(
      this.lastPoint.x,
      this.lastPoint.y,
      midPoint.x,
      midPoint.y,
    );

    this.ctx.stroke();

    this.lastPoint = currentPoint;
  }

  private redrawCanvas(): void {
    if (!this.ctx) {
      return;
    }

    this.clearCanvasPixels();
    this.applyCanvasInkStyle();

    for (const stroke of this.strokes) {
      this.drawStoredStroke(stroke);
    }
  }

  private drawStoredStroke(stroke: DrawingStroke): void {
    if (stroke.points.length === 0) {
      return;
    }

    const [firstPoint, ...remainingPoints] = stroke.points;

    this.drawDot(firstPoint);

    if (remainingPoints.length === 0) {
      return;
    }

    let previousPoint = firstPoint;

    this.ctx.beginPath();
    this.ctx.moveTo(firstPoint.x, firstPoint.y);

    for (const currentPoint of remainingPoints) {
      const midPoint = {
        x: (previousPoint.x + currentPoint.x) / 2,
        y: (previousPoint.y + currentPoint.y) / 2,
      };

      this.ctx.quadraticCurveTo(
        previousPoint.x,
        previousPoint.y,
        midPoint.x,
        midPoint.y,
      );

      this.ctx.stroke();

      previousPoint = currentPoint;
    }

    this.ctx.closePath();
  }

  private drawDot(point: DrawingPoint): void {
    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, this.ctx.lineWidth / 2, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.beginPath();
  }

  private clearCanvasPixels(): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();

    this.ctx.clearRect(0, 0, rect.width, rect.height);
  }

  private applyCanvasInkStyle(): void {
    const inkColor = this.getCanvasInkColor();

    this.ctx.strokeStyle = inkColor;
    this.ctx.fillStyle = inkColor;
    this.ctx.shadowColor = colorWithAlpha(inkColor, 0.12);
    this.ctx.shadowBlur = 1;
  }

  private getCanvasInkColor(): string {
    const theme = this.theme.theme();

    if (theme === 'light') {
      return '#020617';
    }

    return '#f8fafc';
  }

  private getCoalescedPointerEvents(event: PointerEvent): PointerEvent[] {
    if ('getCoalescedEvents' in event) {
      return event.getCoalescedEvents();
    }

    return [event];
  }

  private getPoint(event: PointerEvent): DrawingPoint {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }
}

function colorWithAlpha(color: string, alpha: number): string {
  if (!color.startsWith('#')) {
    return color;
  }

  const normalized = color.slice(1);

  if (normalized.length !== 6) {
    return color;
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}