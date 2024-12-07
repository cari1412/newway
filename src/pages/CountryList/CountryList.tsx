import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Section, Cell, List, Spinner } from '@telegram-apps/telegram-ui';
import { Page } from '@/components/Page';
import { api } from '@/services/api';
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

// Интерфейсы для типизации
interface DisplayCountry {
  locationCode: string;
  name: string;
  minPrice: number;
  plansCount: number;
}

interface CacheData {
  data: DisplayCountry[];
  timestamp: number;
}

// Константы для кэширования
const CACHE_KEY = 'countries_cache';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 минут

// Вспомогательные функции
const getCachedData = (): DisplayCountry[] | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp }: CacheData = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

const setCachedData = (data: DisplayCountry[]): void => {
  try {
    const cacheData: CacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (err) {
    console.error('Cache save error:', err);
  }
};

export const CountryList = () => {
  const navigate = useNavigate();
  const [countries, setCountries] = useState<DisplayCountry[]>(() => getCachedData() || []);
  const [loading, setLoading] = useState(!countries.length);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных о странах
  useEffect(() => {
    const loadCountries = async (): Promise<void> => {
      if (countries.length) return;

      try {
        setLoading(true);
        const data = await api.getPackages();
        
        // Преобразуем и группируем данные по странам
        const countryMap = new Map<string, DisplayCountry>();
        
        data.forEach(pkg => {
          pkg.location.forEach((locationCode: string) => {
            const code = locationCode.trim();
            if (!code) return;

            if (!countryMap.has(code)) {
              countryMap.set(code, {
                locationCode: code,
                name: countryNames[code] || code,
                minPrice: pkg.price,
                plansCount: 1
              });
            } else {
              const country = countryMap.get(code)!;
              country.plansCount++;
              if (pkg.price < country.minPrice) {
                country.minPrice = pkg.price;
              }
            }
          });
        });

        // Преобразуем Map в массив и сортируем по имени
        const sortedCountries = Array.from(countryMap.values())
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(sortedCountries);
        setCachedData(sortedCountries);
        setError(null);

      } catch (err) {
        console.error('Failed to load countries:', err);
        setError('Ошибка загрузки данных. Пожалуйста, попробуйте позже');
      } finally {
        setLoading(false);
      }
    };

    loadCountries();
  }, [countries.length]);

  // Обработчик перехода к стране
  const handleCountryClick = (locationCode: string): void => {
    navigate(`/country/${locationCode}`);
  };

  // Мемоизированный рендер списка
  const renderedCountries = useMemo(() => {
    if (loading && !countries.length) {
      return (
        <div className="flex justify-center p-4">
          <Spinner size="m" />
        </div>
      );
    }

    if (error) {
      return (
        <Section header="Ошибка">
          <Cell>{error}</Cell>
        </Section>
      );
    }

    if (!countries.length) {
      return (
        <Section header="Нет данных">
          <Cell>Список стран пуст. Пожалуйста, попробуйте позже.</Cell>
        </Section>
      );
    }

    return (
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
    );
  }, [countries, loading, error, navigate]);

  return (
    <Page back={false}>
      <List>
        {renderedCountries}
      </List>
    </Page>
  );
};