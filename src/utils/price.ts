interface PriceRange {
  min: number;
  max: number;
  markup: number;
}

export const PRICE_RANGES: PriceRange[] = [
  { min: 0, max: 10, markup: 90 },      // До $10 - маржа 90%
  { min: 10, max: 20.99, markup: 80 },  // $10-20.99 - маржа 80%
  { min: 21, max: 29.99, markup: 70 },  // $21-29.99 - маржа 70%
  { min: 30, max: 49.99, markup: 60 },  // $30-49.99 - маржа 60%
  { min: 50, max: Infinity, markup: 50 } // От $50 - маржа 50%
];

export const calculateRetailPrice = (wholesalePrice: number): number => {
  const range = PRICE_RANGES.find(
    range => wholesalePrice >= range.min && wholesalePrice <= range.max
  );
  const markup = range ? range.markup : 50;
  return Number((wholesalePrice * (1 + markup / 100)).toFixed(2));
};

export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

export const getAppliedMarkup = (price: number): number => {
  const range = PRICE_RANGES.find(
    range => price >= range.min && price <= range.max
  );
  return range ? range.markup : 50;
};

// Вспомогательная функция для отладки
export const debugPrice = (wholesalePrice: number): void => {
  const markup = getAppliedMarkup(wholesalePrice);
  const retail = calculateRetailPrice(wholesalePrice);
  console.log({
    wholesale: `$${wholesalePrice}`,
    markup: `${markup}%`,
    retail: `$${retail}`,
    profit: `$${(retail - wholesalePrice).toFixed(2)}`
  });
};