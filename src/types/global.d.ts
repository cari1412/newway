// src/types/global.d.ts
export {};

declare global {
  interface WebApp {
    openTelegramLink(url: string): void;
    openLink(url: string): void;
    ready(): void;
    close(): void;
    expand(): void;
    MainButton: {
      text: string;
      color: string;
      textColor: string;
      isVisible: boolean;
      isActive: boolean;
      show(): void;
      hide(): void;
      enable(): void;
      disable(): void;
      showProgress(leaveActive: boolean): void;
      hideProgress(): void;
      onClick(callback: () => void): void;
      offClick(callback: () => void): void;
      setText(text: string): void;
    };
  }

  interface Window {
    Telegram: {
      WebApp: WebApp;
    };
  }
}