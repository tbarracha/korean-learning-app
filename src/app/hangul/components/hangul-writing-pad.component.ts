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

@Component({
  selector: 'app-hangul-writing-pad',
  standalone: true,
  template: `
    <div class="space-y-3">
      <div class="relative h-80 w-full overflow-hidden rounded-3xl border border-white/10 bg-white">
        @if (showPreview()) {
          <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span class="select-none text-[11rem] font-bold leading-none text-neutral-200">
              {{ preview() }}
            </span>
          </div>
        }

        <canvas
          #canvas
          class="relative z-10 h-full w-full touch-none"
        ></canvas>
      </div>

      <div class="grid grid-cols-3 gap-2">
        <button
          type="button"
          (click)="clear()"
          class="rounded-2xl bg-white/10 py-3 text-sm font-medium active:scale-[0.98] transition"
        >
          Clear
        </button>

        <button
          type="button"
          (click)="pronounce()"
          class="rounded-2xl bg-sky-500 py-3 text-sm font-medium text-white active:scale-[0.98] transition"
        >
          Pronounce
        </button>

        <button
          type="button"
          (click)="showPreviewAgain()"
          class="rounded-2xl bg-white/10 py-3 text-sm font-medium active:scale-[0.98] transition"
        >
          Preview
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

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;

    this.ctx = canvas.getContext('2d')!;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    this.ctx.lineWidth = 8;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = '#111827';

    canvas.addEventListener('pointerdown', this.startDrawing);
    canvas.addEventListener('pointermove', this.draw);
    canvas.addEventListener('pointerup', this.stopDrawing);
    canvas.addEventListener('pointerleave', this.stopDrawing);
  }

  ngOnDestroy(): void {
    const canvas = this.canvasRef.nativeElement;

    canvas.removeEventListener('pointerdown', this.startDrawing);
    canvas.removeEventListener('pointermove', this.draw);
    canvas.removeEventListener('pointerup', this.stopDrawing);
    canvas.removeEventListener('pointerleave', this.stopDrawing);

    if (this.previewTimeoutId !== undefined) {
      window.clearTimeout(this.previewTimeoutId);
    }
  }

  clear(): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();

    this.ctx.clearRect(0, 0, rect.width, rect.height);
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

  private startDrawing = (event: PointerEvent): void => {
    this.showPreview.set(false);
    this.drawing = true;

    const { x, y } = this.getPoint(event);
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  };

  private draw = (event: PointerEvent): void => {
    if (!this.drawing) return;

    const { x, y } = this.getPoint(event);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  };

  private stopDrawing = (): void => {
    this.drawing = false;
    this.ctx.closePath();
  };

  private getPoint(event: PointerEvent): { x: number; y: number } {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }
}