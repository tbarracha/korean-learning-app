// file: src/app/hangul/components/hangul-writing-pad.component.ts

import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { HangulPronunciationService } from '../services/hangul-pronunciation.service';

interface DrawingPoint {
  x: number;
  y: number;
}

@Component({
  selector: 'app-hangul-writing-pad',
  standalone: true,
  template: `
    <div class="space-y-3">
      <div
        class="relative h-80 w-full overflow-hidden rounded-3xl border border-white/10 bg-white"
      >
        <div
          class="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(17,24,39,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(17,24,39,0.06)_1px,transparent_1px)] bg-[size:50%_50%]"
        ></div>

        <div
          class="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-neutral-200"
        ></div>

        <div
          class="pointer-events-none absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-neutral-200"
        ></div>

        @if (showPreview()) {
          <div
            class="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <span
              class="select-none text-[10.5rem] font-bold leading-none text-neutral-200/80"
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
          class="rounded-2xl bg-white/10 py-3 text-sm font-medium active:scale-[0.98] transition"
        >
          🧽 Clear
        </button>

        <button
          type="button"
          (click)="pronounce()"
          class="rounded-2xl bg-sky-500 py-3 text-sm font-medium text-white active:scale-[0.98] transition"
        >
          🔊 Pronounce
        </button>

        <button
          type="button"
          (click)="showPreviewAgain()"
          class="rounded-2xl bg-white/10 py-3 text-sm font-medium active:scale-[0.98] transition"
        >
          👁️ Preview
        </button>
      </div>
    </div>
  `,
})
export class HangulWritingPadComponent implements AfterViewInit, OnDestroy {
  private pronunciation = inject(HangulPronunciationService);

  preview = input('');
  audioSrc = input<string | undefined>();

  @ViewChild('canvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  showPreview = signal(true);

  private ctx!: CanvasRenderingContext2D;
  private drawing = false;
  private previewTimeoutId: number | undefined;
  private lastPoint: DrawingPoint | undefined;
  private activePointerId: number | undefined;

  ngAfterViewInit(): void {
    this.setupCanvas();

    const canvas = this.canvasRef.nativeElement;

    canvas.addEventListener('pointerdown', this.startDrawing);
    canvas.addEventListener('pointermove', this.draw);
    canvas.addEventListener('pointerup', this.stopDrawing);
    canvas.addEventListener('pointercancel', this.stopDrawing);
    canvas.addEventListener('pointerleave', this.stopDrawing);
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
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();

    this.ctx.clearRect(0, 0, rect.width, rect.height);
    this.lastPoint = undefined;
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
    this.ctx.strokeStyle = '#111827';

    this.ctx.shadowColor = 'rgba(17, 24, 39, 0.12)';
    this.ctx.shadowBlur = 1;
  }

  private startDrawing = (event: PointerEvent): void => {
    event.preventDefault();

    const canvas = this.canvasRef.nativeElement;

    this.showPreview.set(false);
    this.drawing = true;
    this.activePointerId = event.pointerId;

    canvas.setPointerCapture(event.pointerId);

    const point = this.getPoint(event);
    this.lastPoint = point;

    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, this.ctx.lineWidth / 2, 0, Math.PI * 2);
    this.ctx.fillStyle = '#111827';
    this.ctx.fill();
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
      this.drawSmoothPoint(this.getPoint(pointerEvent));
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
