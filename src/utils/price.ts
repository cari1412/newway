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

export const calculateRetailPrice = (wholesalePriceInDollars: number): number => {
  // Проверяем входную цену
  if (!wholesalePriceInDollars || wholesalePriceInDollars <= 0) {
    console.warn('Invalid wholesale price:', wholesalePriceInDollars);
    return 0;
  }

  // Находим нужную наценку
  const range = PRICE_RANGES.find(
    range => wholesalePriceInDollars >= range.min && wholesalePriceInDollars <= range.max
  );

  const markup = range ? range.markup : 50;
  const retailPrice = wholesalePriceInDollars * (1 + markup / 100);

  // Debug log
  console.log('Price calculation:', {
    wholesalePriceInDollars,
    markup,
    retailPrice: retailPrice.toFixed(2),
    range: range ? `$${range.min}-$${range.max}` : 'default'
  });

  return Number(retailPrice.toFixed(2));
};