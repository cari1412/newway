export const COUNTRY_DATA: Record<string, { name: string; flag: string }> = {
  us: { name: 'США', flag: '🇺🇸' },
  eu: { name: 'Европа', flag: '🇪🇺' },
};

export const getCountryName = (countryId: string): string => {
  return COUNTRY_DATA[countryId]?.name || countryId.toUpperCase();
};

export const getCountryFlag = (countryId: string): string => {
  return COUNTRY_DATA[countryId]?.flag || '🌍';
};