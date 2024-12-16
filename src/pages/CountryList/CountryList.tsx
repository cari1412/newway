import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Section, Cell, List, Spinner } from '@telegram-apps/telegram-ui';
import { Page } from '@/components/Page';
import { api, CountrySummary } from '@/services/api';
import { getFlagEmoji, formatPrice, formatPlansCount } from '@/utils/formats';

// Словарь названий стран
const countryNames: Record<string, string> = {
  KW: 'Кувейт',
  KR: 'Южная Корея',
  KZ: 'Казахстан',
  JE: 'Джерси',
  KG: 'Кыргызстан',
  QA: 'Катар',
  UZ: 'Узбекистан',
  AM: 'Армения',
  KH: 'Камбоджа',
  CA: 'Канада',
  DO: 'Доминиканская Республика',
};

interface DisplayCountry extends CountrySummary {
  name: string;
}

export const CountryList = () => {
  const navigate = useNavigate();
  const [countries, setCountries] = useState<DisplayCountry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        setLoading(true);
        const summaryData = await api.getCountriesSummary();
        
        const displayCountries = summaryData
          .map(country => ({
            ...country,
            name: countryNames[country.locationCode] || country.locationCode
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(displayCountries);
        setError(null);
      } catch (err) {
        console.error('Failed to load countries:', err);
        setError('Ошибка загрузки данных. Пожалуйста, попробуйте позже');
      } finally {
        setLoading(false);
      }
    };

    loadCountries();
  }, []);

  const handleCountryClick = (locationCode: string): void => {
    navigate(`/country/${locationCode}`);
  };

  if (loading) {
    return (
      <Page back={false}>
        <div className="flex justify-center p-4">
          <Spinner size="m" />
        </div>
      </Page>
    );
  }

  if (error) {
    return (
      <Page back={false}>
        <Section header="Ошибка">
          <Cell>{error}</Cell>
        </Section>
      </Page>
    );
  }

  return (
    <Page back={false}>
      <List>
        <Section
          header="Доступные страны"
          footer="Выберите страну для просмотра доступных eSIM тарифов"
        >
          {countries.map((country) => (
            <Cell
              key={country.locationCode}
              onClick={() => handleCountryClick(country.locationCode)}
              before={
                <span className="text-2xl inline-block min-w-8">
                  {getFlagEmoji(country.locationCode)}
                </span>
              }
              subtitle={`От ${formatPrice(country.minPrice)} • ${formatPlansCount(country.plansCount)}`}
              multiline
            >
              {country.name}
            </Cell>
          ))}
        </Section>
      </List>
    </Page>
  );
};