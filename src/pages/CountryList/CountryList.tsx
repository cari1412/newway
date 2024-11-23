import { Section, Cell, List, Spinner } from '@telegram-apps/telegram-ui';
import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '@/components/Page';
import { api, type Package } from '@/services/api';

// Определяем только нужные интерфейсы
interface Country {
  id: string;
  name: string;
  flag: string;
  plansCount: number;
  startingPrice: number;
}

// Функция для получения названия страны по коду
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
    // Добавьте другие страны по необходимости
  };
  return countryNames[code] || code;
};

// Функция для преобразования списка пакетов в список стран
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
          startingPrice: pkg.price
        });
      } else {
        const country = countryMap.get(countryCode)!;
        country.plansCount++;
        country.startingPrice = Math.min(country.startingPrice, pkg.price);
      }
    });
  });

  return Array.from(countryMap.values())
    .sort((a, b) => a.name.localeCompare(b.name));
};

// Функция для получения эмодзи флага страны
const getFlagEmoji = (countryCode: string): string => {
  if (countryCode.length !== 2) return '🌍';
  
  const OFFSET = 127397;
  const chars = countryCode
    .toUpperCase()
    .split('')
    .map(char => char.charCodeAt(0) + OFFSET);
  
  return String.fromCodePoint(...chars);
};

// Функция форматирования цены
const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

// Функция форматирования количества тарифов
const formatPlansCount = (count: number): string => {
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