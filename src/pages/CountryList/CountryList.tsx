import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Section, Cell, List, Spinner } from '@telegram-apps/telegram-ui';
import { Page } from '@/components/Page';
import { api } from '@/services/api';
import { getFlagEmoji, formatPrice, formatPlansCount } from '@/utils/formats';

// Типы данных оптимизированы для списка стран
interface CountryData {
  id: string;
  name: string;
  flag: string;
  startingPrice: number;
  plansCount: number;
}

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

export const CountryList: React.FC = () => {
  const navigate = useNavigate();
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        setLoading(true);
        // Используем пустые параметры для получения только базового списка
        const response = await api.getPackages();
        
        // Создаем Map для группировки по странам
        const countryMap = new Map<string, CountryData>();
        
        response.forEach(pkg => {
          pkg.location.forEach((locationCode: string) => {
            const countryCode = locationCode.trim();
            if (!countryCode) return;

            if (!countryMap.has(countryCode)) {
              countryMap.set(countryCode, {
                id: countryCode,
                name: countryNames[countryCode] || countryCode,
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

        const sortedCountries = Array.from(countryMap.values())
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(sortedCountries);
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

  // Мемоизируем отрендеренный список стран
  const renderedCountries = useMemo(() => {
    if (loading) {
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

    if (countries.length === 0) {
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
            key={country.id}
            onClick={() => navigate(`/country/${country.id}`)}
            before={
              <span className="text-2xl">{country.flag}</span>
            }
            subtitle={`От ${formatPrice(country.startingPrice)} • ${formatPlansCount(country.plansCount)}`}
            multiline
          >
            {country.name}
          </Cell>
        ))}
      </Section>
    );
  }, [countries, loading, error]);

  return (
    <Page back={false}>
      <List>
        {renderedCountries}
      </List>
    </Page>
  );
};