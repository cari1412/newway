import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Section, Cell, List, Spinner } from '@telegram-apps/telegram-ui';
import { Page } from '@/components/Page';
import { api, Package } from '@/services/api';
import { getFlagEmoji, formatPrice, formatPlansCount } from '@/utils/formats';
import { useInView } from 'react-intersection-observer';

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

interface DisplayCountry {
  locationCode: string;
  name: string;
  minPrice: number;
  plansCount: number;
}

const ITEMS_PER_PAGE = 10;

export const CountryList = () => {
  const navigate = useNavigate();
  const [countries, setCountries] = useState<DisplayCountry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allCountries, setAllCountries] = useState<DisplayCountry[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  // Начальная загрузка всех данных
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const response = await api.getPackages();
        const packages = response.packageList;
        
        // Преобразуем и группируем данные по странам
        const countryMap = new Map<string, DisplayCountry>();
        
        packages.forEach((pkg: Package) => {
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

        setAllCountries(sortedCountries);
        // Загружаем первую страницу
        setCountries(sortedCountries.slice(0, ITEMS_PER_PAGE));
        setHasMore(sortedCountries.length > ITEMS_PER_PAGE);
        setError(null);
      } catch (err) {
        console.error('Failed to load countries:', err);
        setError('Ошибка загрузки данных. Пожалуйста, попробуйте позже');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Загрузка следующей страницы при прокрутке
  useEffect(() => {
    if (inView && hasMore && !loading) {
      const nextPage = page + 1;
      const start = (nextPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const newCountries = allCountries.slice(start, end);
      
      setCountries(prev => [...prev, ...newCountries]);
      setPage(nextPage);
      setHasMore(end < allCountries.length);
    }
  }, [inView, hasMore, loading, page, allCountries]);

  const handleCountryClick = (locationCode: string): void => {
    navigate(`/country/${locationCode}`);
  };

  if (loading && !countries.length) {
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
          
          {/* Элемент для отслеживания прокрутки */}
          <div ref={ref} style={{ height: '20px' }}>
            {loading && hasMore && (
              <div className="flex justify-center p-4">
                <Spinner size="s" />
              </div>
            )}
          </div>
        </Section>
      </List>
    </Page>
  );
};