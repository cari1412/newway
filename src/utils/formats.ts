// Базовое форматирование цен
export const formatPrice = (price: number): string => {
  if (!price) return '$0.00';
  const priceInDollars = price / 100; // Конвертируем центы в доллары
  return `$${priceInDollars.toFixed(2)}`;
};

// Форматирование объема данных
export const formatDataVolume = (dataStr: string): string => {
  return dataStr; // Данные уже приходят в формате "XX.X GB"
};

// Продвинутое форматирование данных
export const formatDataSize = (gb: number): string => {
  if (gb >= 1024) {
    return `${(gb / 1024).toFixed(1)} TB`;
  }
  if (gb >= 1) {
    return `${gb} GB`;
  }
  return `${(gb * 1024).toFixed(0)} MB`;
};

// Форматирование срока действия
export const formatValidity = (validity: string): string => {
  const [duration, unit] = validity.split(' ');
  const unitFormatted = unit === 'day' ? 'дней' : unit;
  return `${duration} ${unitFormatted}`;
};

// Форматирование количества планов
export const formatPlansCount = (count: number): string => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return `${count} тарифов`;
  }

  switch (lastDigit) {
    case 1:
      return `${count} тариф`;
    case 2:
    case 3:
    case 4:
      return `${count} тарифа`;
    default:
      return `${count} тарифов`;
  }
};

// Работа с иконками и эмодзи
export const getFlagEmoji = (countryCode: string): string => {
  if (countryCode.length !== 2) return '🌍';
  const OFFSET = 127397;
  const chars = countryCode
    .toUpperCase()
    .split('')
    .map(char => char.charCodeAt(0) + OFFSET);
  return String.fromCodePoint(...chars);
};

export const getNetworkTypeIcon = (type: string): string => {
  switch (type.toLowerCase()) {
    case '5g':
      return '📶';
    case '4g':
    case 'lte':
      return '📡';
    case '3g':
      return '📱';
    default:
      return '🌐';
  }
};

// Работа с ценами и скидками
export const calculateDiscount = (originalPrice: number, discountedPrice: number): number => {
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

export const formatDiscount = (discount: number): string => {
  return `-${discount}%`;
};

export const getPriceRange = (prices: number[]): string => {
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? formatPrice(min) : `от ${formatPrice(min)}`;
};

// Форматирование скорости интернета
export const formatSpeed = (speed: string): string => {
  const speedMap: Record<string, string> = {
    '3G': 'до 7.2 Мбит/с',
    '4G': 'до 150 Мбит/с',
    '5G': 'до 1 Гбит/с',
    'LTE': 'до 150 Мбит/с'
  };
  return speedMap[speed] || speed;
};

// Работа с особенностями тарифа
export const getFeatureIcon = (feature: string): string => {
  const iconMap: Record<string, string> = {
    'speed': '⚡',
    'coverage': '📡',
    'support': '📞',
    'activation': '🔄',
    'validity': '📅',
    'data': '📊',
    'roaming': '🌍',
    'unlimited': '∞',
    'wifi': '📶',
    'messaging': '💬',
    'voice': '📞',
    'esim': '📱',
  };
  return iconMap[feature.toLowerCase()] || '📱';
};

// Работа с датами
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

// Форматирование оставшегося времени
export const formatTimeLeft = (expiryDate: Date): string => {
  const now = new Date();
  const diff = expiryDate.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days > 30) {
    const months = Math.floor(days / 30);
    return `${months} мес.`;
  }
  if (days > 0) {
    return `${days} дн.`;
  }
  return 'Истекает сегодня';
};

// Сортировка и фильтрация
export const sortByPrice = (a: { price: number }, b: { price: number }): number => {
  return a.price - b.price;
};

export const sortByData = (a: { data: string }, b: { data: string }): number => {
  const getGB = (str: string) => parseFloat(str.split(' ')[0]);
  return getGB(a.data) - getGB(b.data);
};

// Работа со статусами заказов
export const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'active': 'Активен',
    'pending': 'Ожидает активации',
    'expired': 'Истёк',
    'cancelled': 'Отменён',
    'processing': 'Обрабатывается',
    'failed': 'Ошибка'
  };
  return statusMap[status.toLowerCase()] || status;
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'active': '#4CAF50',
    'pending': '#FFC107',
    'expired': '#F44336',
    'cancelled': '#9E9E9E',
    'processing': '#2196F3',
    'failed': '#F44336'
  };
  return colorMap[status.toLowerCase()] || '#9E9E9E';
};

// Индикаторы загрузки
export const getLoadingText = (action: string): string => {
  const texts: Record<string, string> = {
    'loading': 'Загрузка...',
    'processing': 'Обработка...',
    'saving': 'Сохранение...',
    'activating': 'Активация...',
    'connecting': 'Подключение...'
  };
  return texts[action.toLowerCase()] || 'Загрузка...';
};