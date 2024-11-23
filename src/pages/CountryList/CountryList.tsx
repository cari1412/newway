import { Section, Cell, List, Spinner } from '@telegram-apps/telegram-ui';
import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '@/components/Page';
import { api, type Package } from '@/services/api';
import { getFlagEmoji, formatPrice, formatPlansCount } from '@/utils/formats';

interface Country {
  id: string;
  name: string;
  flag: string;
  plansCount: number;
  startingPrice: number;
}

const getCountryName = (code: string): string => {
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
  return countryNames[code] || code;
};

const parseLocationToCountry = (packages: Package[]): Country[] => {
  const countryMap = new Map<string, Country>();

  packages.forEach(pkg => {
    pkg.location.forEach((locationCode: string) => {
      const countryCode = locationCode.trim();
      if (!countryCode) return;

      if (!countryMap.has(countryCode)) {
        countryMap.set(countryCode, {
          id: countryCode,
          name: getCountryName(countryCode),
          flag: getFlagEmoji(countryCode),
          plansCount: 1,
          startingPrice: pkg.retailPrice // Используем розничную цену
        });
      } else {
        const country = countryMap.get(countryCode)!;
        country.plansCount++;
        country.startingPrice = Math.min(country.startingPrice, pkg.retailPrice);
      }
    });
  });

  return Array.from(countryMap.values())
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const CountryList: FC = () => {
  const navigate = useNavigate();
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        setLoading(true);
        const packages = await api.getPackages();
        const countriesList = parseLocationToCountry(packages);
        setCountries(countriesList);
        setError(null);
      } catch (err) {
        console.error('Failed to load countries:', err);
        setError('Ошибка загрузки данных. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    loadCountries();
  }, []);

  if (loading) {
    return (
      <Page>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
          <Spinner size="m" />
        </div>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <Section header="Ошибка">
          <Cell>{error}</Cell>
        </Section>
      </Page>
    );
  }

  if (countries.length === 0) {
    return (
      <Page>
        <Section header="Нет данных">
          <Cell>Список стран пуст. Пожалуйста, попробуйте позже.</Cell>
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
              key={country.id}
              onClick={() => navigate(`/country/${country.id}`)}
              before={<span style={{ fontSize: '24px' }}>{country.flag}</span>}
              subtitle={`От ${formatPrice(country.startingPrice)} • ${formatPlansCount(country.plansCount)}`}
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