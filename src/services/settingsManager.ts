/**
 * ANTIQORA Centralized Settings Manager
 * Single source of truth for all application preferences and system configurations.
 */

export type ThemeMode = 'dark' | 'light' | 'system';
export type DensityMode = 'comfortable' | 'compact';
export type FontSize = 'normal' | 'large' | 'xlarge';
export type ResultsPerPage = 10 | 20 | 30 | 50;
export type SafeSearchMode = 'strict' | 'moderate' | 'off';
export type AIAnswerStyle = 'simple' | 'standard' | 'detailed';
export type AISourceDisplay = 'always' | 'available';
export type ImageResultLayout = 'grid' | 'compact';
export type NewsSortOrder = 'latest' | 'relevance';

export interface AntiqoraSettings {
  // Appearance
  theme: ThemeMode;
  density: DensityMode;
  fontSize: FontSize;
  reducedMotion: boolean;
  highContrast: boolean;

  // Search Settings
  safeSearch: boolean;
  safeSearchMode: SafeSearchMode;
  resultsPerPage: ResultsPerPage;
  openInNewTab: boolean;
  searchSuggestions: boolean;
  autocomplete: boolean;
  recentSearchesEnabled: boolean;
  personalizedSearch: boolean;
  region: string;
  searchLanguage: string;

  // Language & Region
  interfaceLanguage: string;

  // Notifications
  notificationsEnabled: boolean;
  newsUpdates: boolean;
  searchNotifications: boolean;
  aiUpdates: boolean;
  appUpdates: boolean;

  // Voice Search
  voiceSearchEnabled: boolean;
  voiceLanguage: string;

  // AI Settings
  aiAnswersEnabled: boolean;
  aiAnswerLanguage: string;
  aiAnswerStyle: AIAnswerStyle;
  aiSourceDisplay: AISourceDisplay;
  showFutureScenarios: boolean;

  // Search Result Display
  imageResultLayout: ImageResultLayout;
  newsSortOrder: NewsSortOrder;

  // Accessibility
  keyboardShortcuts: boolean;
  screenReaderHints: boolean;
}

export const DEFAULT_SETTINGS: AntiqoraSettings = {
  // Appearance
  theme: 'dark',
  density: 'comfortable',
  fontSize: 'normal',
  reducedMotion: false,
  highContrast: false,

  // Search Settings
  safeSearch: true,
  safeSearchMode: 'strict',
  resultsPerPage: 20,
  openInNewTab: true,
  searchSuggestions: true,
  autocomplete: true,
  recentSearchesEnabled: true,
  personalizedSearch: true,
  region: 'us',
  searchLanguage: 'all',

  // Language & Region
  interfaceLanguage: 'en',

  // Notifications
  notificationsEnabled: false,
  newsUpdates: true,
  searchNotifications: true,
  aiUpdates: true,
  appUpdates: true,

  // Voice Search
  voiceSearchEnabled: true,
  voiceLanguage: 'en-US',

  // AI Settings
  aiAnswersEnabled: true,
  aiAnswerLanguage: 'auto',
  aiAnswerStyle: 'standard',
  aiSourceDisplay: 'always',
  showFutureScenarios: true,

  // Search Result Display
  imageResultLayout: 'grid',
  newsSortOrder: 'latest',

  // Accessibility
  keyboardShortcuts: true,
  screenReaderHints: true,
};

export const SUPPORTED_REGIONS = [
  { code: 'global', name: 'Global (All Regions)', flag: '🌐' },
  { code: 'in', name: 'India', flag: '🇮🇳' },
  { code: 'us', name: 'United States', flag: '🇺🇸' },
  { code: 'uk', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'ca', name: 'Canada', flag: '🇨🇦' },
  { code: 'au', name: 'Australia', flag: '🇦🇺' },
  { code: 'de', name: 'Germany', flag: '🇩🇪' },
  { code: 'fr', name: 'France', flag: '🇫🇷' },
  { code: 'jp', name: 'Japan', flag: '🇯🇵' },
  { code: 'kr', name: 'South Korea', flag: '🇰🇷' },
  { code: 'br', name: 'Brazil', flag: '🇧🇷' },
  { code: 'sg', name: 'Singapore', flag: '🇸🇬' },
  { code: 'ae', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'ch', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'nl', name: 'Netherlands', flag: '🇳🇱' }
];

const STORAGE_KEY = 'antiqora_settings_v2';
type Listener = (settings: AntiqoraSettings) => void;

class SettingsManager {
  private settings: AntiqoraSettings;
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.settings = this.loadInitialSettings();
    this.applyToDOM(this.settings);
    this.listenToSystemTheme();
  }

  private loadInitialSettings(): AntiqoraSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to parse stored Antiqora settings, using fallback defaults', e);
    }

    // Migrate from legacy keys if available
    const legacyTheme = localStorage.getItem('antiqora_theme') as ThemeMode | null;
    const legacyLang = localStorage.getItem('antiqora_lang');
    const legacyDepth = localStorage.getItem('antiqora_depth') as AIAnswerStyle | null;

    return {
      ...DEFAULT_SETTINGS,
      theme: legacyTheme || DEFAULT_SETTINGS.theme,
      interfaceLanguage: legacyLang || DEFAULT_SETTINGS.interfaceLanguage,
      aiAnswerStyle: legacyDepth || DEFAULT_SETTINGS.aiAnswerStyle,
    };
  }

  private listenToSystemTheme() {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', () => {
      if (this.settings.theme === 'system') {
        this.applyToDOM(this.settings);
        this.notify();
      }
    });
  }

  public applyToDOM(settings: AntiqoraSettings) {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // 1. Theme application
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' &&
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // 2. Font size
    root.setAttribute('data-font-size', settings.fontSize);

    // 3. Reduced Motion
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // 4. High Contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // 5. Density
    root.setAttribute('data-density', settings.density);
  }

  public getSettings(): AntiqoraSettings {
    return { ...this.settings };
  }

  public updateSetting<K extends keyof AntiqoraSettings>(
    key: K,
    value: AntiqoraSettings[K]
  ): AntiqoraSettings {
    return this.updateSettings({ [key]: value } as unknown as Partial<AntiqoraSettings>);
  }

  public updateSettings(partial: Partial<AntiqoraSettings>): AntiqoraSettings {
    // If safeSearch boolean is toggled, synchronize safeSearchMode
    if ('safeSearch' in partial && partial.safeSearch !== undefined) {
      if (!('safeSearchMode' in partial)) {
        partial.safeSearchMode = partial.safeSearch ? 'strict' : 'off';
      }
    } else if ('safeSearchMode' in partial && partial.safeSearchMode !== undefined) {
      partial.safeSearch = partial.safeSearchMode !== 'off';
    }

    this.settings = { ...this.settings, ...partial };
    this.saveSettings();
    this.applyToDOM(this.settings);
    this.notify();
    return { ...this.settings };
  }

  public resetSettings(): AntiqoraSettings {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveSettings();
    this.applyToDOM(this.settings);
    this.notify();
    return { ...this.settings };
  }

  private saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      // Keep legacy keys in sync for backwards compatibility
      localStorage.setItem('antiqora_theme', this.settings.theme);
      localStorage.setItem('antiqora_lang', this.settings.interfaceLanguage);
      localStorage.setItem('antiqora_depth', this.settings.aiAnswerStyle);
    } catch (e) {
      console.warn('Failed to save Antiqora settings to localStorage', e);
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const current = this.getSettings();
    this.listeners.forEach(fn => {
      try {
        fn(current);
      } catch (err) {
        console.error('Error in settings listener:', err);
      }
    });
  }
}

export const settingsManager = new SettingsManager();
