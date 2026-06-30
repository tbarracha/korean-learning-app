// file: src/app/hangul/components/hangul-celebration-overlay.component.ts

import { Component, inject } from '@angular/core';
import { HangulCelebrationService } from '../services/hangul-celebration.service';

@Component({
  selector: 'app-hangul-celebration-overlay',
  standalone: true,
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
    @if (celebration.pieces().length > 0) {
      <div class="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        @for (piece of celebration.pieces(); track piece.id) {
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
  `,
})
export class HangulCelebrationOverlayComponent {
  celebration = inject(HangulCelebrationService);
}