// Форматирование цен и скидок
export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

export const calculateDiscount = (originalPrice: number, discountedPrice: number): number => {
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

export const formatDiscount = (discount: number): string => {
  return `-${discount}%`;
};

// Форматирование объема данных
export const formatDataVolume = (dataStr: string): string => {
  return dataStr; // Данные уже приходят в нужном формате
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

// Получение иконок для типов сетей
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

// Эмодзи флагов и локализация
export const getFlagEmoji = (countryCode: string): string => {
  if (countryCode.length !== 2) return '🌍';
  const OFFSET = 127397;
  const chars = countryCode
    .toUpperCase()
    .split('')
    .map(char => char.charCodeAt(0) + OFFSET);
  return String.fromCodePoint(...chars);
};

// Работа с функциями и особенностями
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

// Вспомогательные функции для дат
export const formatExpiryDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

// Функции сортировки
export const sortByPrice = (a: { price: number }, b: { price: number }): number => {
  return a.price - b.price;
};

export const sortByData = (a: { data: string }, b: { data: string }): number => {
  const getGB = (str: string) => parseFloat(str.split(' ')[0]);
  return getGB(a.data) - getGB(b.data);
};

// Работа со статусами
export const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'active': 'Активен',
    'pending': 'Ожидает активации',
    'expired': 'Истёк',
    'cancelled': 'Отменён'
  };
  return statusMap[status.toLowerCase()] || status;
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'active': '#4CAF50',
    'pending': '#FFC107',
    'expired': '#F44336',
    'cancelled': '#9E9E9E'
  };
  return colorMap[status.toLowerCase()] || '#9E9E9E';
};