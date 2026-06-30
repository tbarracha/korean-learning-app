// file: src/app/shared/theme/theme.service.ts

import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type AppTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'korean-learning-theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  readonly theme = signal<AppTheme>(this.getInitialTheme());

  constructor() {
    this.applyTheme(this.theme());
  }

  setTheme(theme: AppTheme): void {
    this.theme.set(theme);
    this.applyTheme(theme);

    if (this.isBrowser()) {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }

  toggleTheme(): void {
    this.setTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }

  private getInitialTheme(): AppTheme {
    if (!this.isBrowser()) {
      return 'dark';
    }

    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }

    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;

    return prefersDark ? 'dark' : 'light';
  }

  private applyTheme(theme: AppTheme): void {
    const root = this.document.documentElement;

    root.classList.toggle('dark', theme === 'dark');
    root.dataset['theme'] = theme;
    root.style.colorScheme = theme;
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}