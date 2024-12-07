import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Section, Cell, List, Spinner } from '@telegram-apps/telegram-ui';
import { Page } from '@/components/Page';
import { api, type CountryData } from '@/services/api';
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

// Интерфейс для отображения данных страны
interface DisplayCountry extends CountryData {
  name: string;
  flag: string;
}

export const CountryList: React.FC = () => {
  const navigate = useNavigate();
  const [countries, setCountries] = useState<DisplayCountry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        setLoading(true);
        const countryData = await api.getCountries();
        
        // Преобразуем данные для отображения
        const displayCountries = countryData.map(country => ({
          ...country,
          name: countryNames[country.locationCode] || country.locationCode,
          flag: getFlagEmoji(country.locationCode)
        }));

        // Сортируем по имени
        const sortedCountries = displayCountries.sort((a, b) => 
          a.name.localeCompare(b.name)
        );

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
            key={country.locationCode}
            onClick={() => navigate(`/country/${country.locationCode}`)}
            before={
              <span className="text-2xl inline-block min-w-8">
                {country.flag}
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