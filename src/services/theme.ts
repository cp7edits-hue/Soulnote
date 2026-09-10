import { UserSettings } from '../types';
import { StorageService } from './storage';

export type ThemeMode = 'system' | 'light' | 'dark';

class ThemeServiceClass {
  private mediaQuery: MediaQueryList | null = null;
  private currentMode: ThemeMode = 'system';
  private listener: ((e: MediaQueryListEvent) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    }
  }

  /**
   * Initializes the theme on application bootstrap.
   */
  public init(): ThemeMode {
    const settings = StorageService.getSettings();
    const mode = settings.theme || 'system';
    this.applyTheme(mode);
    return mode;
  }

  /**
   * Returns whether the theme currently resolved to dark (taking system into account).
   */
  public isDark(): boolean {
    if (this.currentMode === 'dark') return true;
    if (this.currentMode === 'light') return false;
    return Boolean(this.mediaQuery?.matches);
  }

  /**
   * Applies the theme mode immediately to the document root and persists if requested.
   */
  public applyTheme(mode: ThemeMode): void {
    this.currentMode = mode;
    const root = document.documentElement;

    // Remove any previous listener
    if (this.mediaQuery && this.listener) {
      this.mediaQuery.removeEventListener('change', this.listener);
      this.listener = null;
    }

    const resolveAndSetClass = () => {
      let shouldBeDark = false;
      if (mode === 'dark') {
        shouldBeDark = true;
      } else if (mode === 'light') {
        shouldBeDark = false;
      } else {
        // System preference
        shouldBeDark = Boolean(this.mediaQuery?.matches);
      }

      if (shouldBeDark) {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        root.style.colorScheme = 'light';
      }
    };

    resolveAndSetClass();

    // If 'system', attach dynamic listener for OS light/dark changes
    if (mode === 'system' && this.mediaQuery) {
      this.listener = () => {
        if (this.currentMode === 'system') {
          resolveAndSetClass();
        }
      };
      this.mediaQuery.addEventListener('change', this.listener);
    }
  }

  public getMode(): ThemeMode {
    return this.currentMode;
  }
}

export const ThemeService = new ThemeServiceClass();
