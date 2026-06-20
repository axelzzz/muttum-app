import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type ColorScheme = 'light' | 'dark';

const THEME_KEY = 'muttum_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private scheme: ColorScheme = this.resolveInitialScheme();
  private isDarkSubject = new BehaviorSubject<boolean>(this.scheme === 'dark');

  isDark$ = this.isDarkSubject.asObservable();

  get isDark(): boolean {
    return this.isDarkSubject.value;
  }

  toggle(): void {
    this.applyScheme(this.isDark ? 'light' : 'dark');
  }

  applyScheme(scheme: ColorScheme): void {
    this.scheme = scheme;
    localStorage.setItem(THEME_KEY, scheme);
    document.documentElement.classList.toggle('ion-palette-dark', scheme === 'dark');
    this.isDarkSubject.next(scheme === 'dark');
  }

  initialize(): void {
    this.applyScheme(this.scheme);
  }

  private resolveInitialScheme(): ColorScheme {
    const stored = localStorage.getItem(THEME_KEY) as ColorScheme | null;
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
