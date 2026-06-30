// file: src/app/shared/theme/theme-toggle-button.component.ts

import { Component, computed, inject } from '@angular/core';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-theme-toggle-button',
  standalone: true,
  template: `
    <button
      type="button"
      class="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100 px-3 py-2 text-sm font-medium text-base-content shadow-sm transition active:scale-[0.98]"
      [attr.aria-label]="label()"
      (click)="theme.toggleTheme()"
    >
      <span aria-hidden="true">
        @if (theme.theme() === 'dark') {
          ☀️
        } @else {
          🌙
        }
      </span>

      <span class="hidden sm:inline">
        {{ theme.theme() === 'dark' ? 'Light' : 'Dark' }}
      </span>
    </button>
  `,
})
export class ThemeToggleButtonComponent {
  readonly theme = inject(ThemeService);

  readonly label = computed(() => {
    return this.theme.theme() === 'dark'
      ? 'Switch to light theme'
      : 'Switch to dark theme';
  });
}