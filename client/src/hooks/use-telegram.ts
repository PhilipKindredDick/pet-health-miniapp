import { useEffect, useState, useCallback } from 'react';
import { 
  getTelegramWebApp, 
  isTelegramWebApp, 
  initTelegramApp, 
  getUserFromTelegram,
  hapticFeedback,
  type TelegramWebApp 
} from '@/lib/telegram';

export function useTelegram() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const tg = getTelegramWebApp();
    if (tg) {
      initTelegramApp();
      setWebApp(tg);
      setIsReady(true);
    } else {
      // Not in Telegram, but still ready to use as web app
      setIsReady(true);
    }
  }, []);

  const user = getUserFromTelegram();
  const isTelegram = isTelegramWebApp();
  const colorScheme = webApp?.colorScheme || 'light';

  const showMainButton = useCallback((text: string, onClick: () => void) => {
    if (webApp?.MainButton) {
      webApp.MainButton.setText(text);
      webApp.MainButton.onClick(onClick);
      webApp.MainButton.show();
    }
  }, [webApp]);

  const hideMainButton = useCallback(() => {
    webApp?.MainButton?.hide();
  }, [webApp]);

  const showBackButton = useCallback((onClick: () => void) => {
    if (webApp?.BackButton) {
      webApp.BackButton.onClick(onClick);
      webApp.BackButton.show();
    }
  }, [webApp]);

  const hideBackButton = useCallback(() => {
    webApp?.BackButton?.hide();
  }, [webApp]);

  const showConfirm = useCallback((message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (webApp) {
        webApp.showConfirm(message, (confirmed) => resolve(confirmed));
      } else {
        resolve(window.confirm(message));
      }
    });
  }, [webApp]);

  const showAlert = useCallback((message: string): Promise<void> => {
    return new Promise((resolve) => {
      if (webApp) {
        webApp.showAlert(message, () => resolve());
      } else {
        window.alert(message);
        resolve();
      }
    });
  }, [webApp]);

  return {
    webApp,
    isReady,
    isTelegram,
    user,
    colorScheme,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    showConfirm,
    showAlert,
    hapticFeedback,
  };
}
