import { Injectable, signal } from '@angular/core';

type ColorScheme = 'light' | 'dark';

const THEME_KEY = 'muttum_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _isDark = signal<boolean>(false);
  readonly isDark = this._isDark.asReadonly();

  toggle(): void {
    this.applyScheme(this._isDark() ? 'light' : 'dark');
  }

  applyScheme(scheme: ColorScheme): void {
    localStorage.setItem(THEME_KEY, scheme);
    document.documentElement.classList.toggle('ion-palette-dark', scheme === 'dark');
    this._isDark.set(scheme === 'dark');
  }

  initialize(): void {
    this.applyScheme(this.resolveInitialScheme());
  }

  private resolveInitialScheme(): ColorScheme {
    const stored = localStorage.getItem(THEME_KEY) as ColorScheme | null;
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
