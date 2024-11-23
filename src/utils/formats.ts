export const getFlagEmoji = (countryCode: string): string => {
  if (countryCode.length !== 2) return '🌍';
  const OFFSET = 127397;
  const chars = countryCode
    .toUpperCase()
    .split('')
    .map(char => char.charCodeAt(0) + OFFSET);
  return String.fromCodePoint(...chars);
};

export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

export const formatValidity = (validity: string): string => {
  const [duration, unit] = validity.split(' ');
  const unitFormatted = unit === 'day' ? 'дней' : unit;
  return `${duration} ${unitFormatted}`;
};

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