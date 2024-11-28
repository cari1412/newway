
interface TelegramWebApp {
  WebApp: {
    colorScheme: 'light' | 'dark';
    // другие свойства WebApp если нужны
  }
}

declare global {
  interface Window {
    Telegram: TelegramWebApp;
  }
}

export {};