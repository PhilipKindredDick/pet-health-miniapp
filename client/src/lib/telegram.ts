declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      photo_url?: string;
    };
    start_param?: string;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    setText: (text: string) => void;
  };
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  platform: string;
  version: string;
  sendData: (data: string) => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink: (url: string) => void;
  showPopup: (params: {
    title?: string;
    message: string;
    buttons?: Array<{ id?: string; type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'; text?: string }>;
  }, callback?: (buttonId: string) => void) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
}

export function getTelegramWebApp(): TelegramWebApp | null {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
}

export function isTelegramWebApp(): boolean {
  return getTelegramWebApp() !== null;
}

export function initTelegramApp() {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.ready();
    tg.expand();
    
    // Apply Telegram theme colors to CSS variables
    applyTelegramTheme(tg);
  }
}

export function applyTelegramTheme(tg: TelegramWebApp) {
  const root = document.documentElement;
  const params = tg.themeParams;
  
  if (params.bg_color) {
    root.style.setProperty('--tg-theme-bg-color', params.bg_color);
  }
  if (params.text_color) {
    root.style.setProperty('--tg-theme-text-color', params.text_color);
  }
  if (params.hint_color) {
    root.style.setProperty('--tg-theme-hint-color', params.hint_color);
  }
  if (params.link_color) {
    root.style.setProperty('--tg-theme-link-color', params.link_color);
  }
  if (params.button_color) {
    root.style.setProperty('--tg-theme-button-color', params.button_color);
  }
  if (params.button_text_color) {
    root.style.setProperty('--tg-theme-button-text-color', params.button_text_color);
  }
  if (params.secondary_bg_color) {
    root.style.setProperty('--tg-theme-secondary-bg-color', params.secondary_bg_color);
  }

  // Set dark mode based on Telegram theme
  if (tg.colorScheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function getUserFromTelegram() {
  const tg = getTelegramWebApp();
  return tg?.initDataUnsafe?.user || null;
}

export function hapticFeedback(type: 'success' | 'warning' | 'error' | 'light' | 'medium' | 'heavy') {
  const tg = getTelegramWebApp();
  if (!tg) return;

  if (type === 'success' || type === 'warning' || type === 'error') {
    tg.HapticFeedback.notificationOccurred(type);
  } else {
    tg.HapticFeedback.impactOccurred(type);
  }
}
