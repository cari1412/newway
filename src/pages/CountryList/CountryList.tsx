import { Section, Cell, List, Spinner } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Page } from '@/components/Page';
import { api, type Country } from '@/services/api';
import { getCountryFlag, getCountryName } from '@/utils/countries';

export const CountryList: FC = () => {
  const navigate = useNavigate();
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const packages = await api.getPackages();
        const countriesMap = new Map<string, Country>();

        packages.forEach(pkg => {
          if (!countriesMap.has(pkg.countryId)) {
            countriesMap.set(pkg.countryId, {
              id: pkg.countryId,
              name: getCountryName(pkg.countryId),
              flag: getCountryFlag(pkg.countryId),
              plansCount: 1,
              startingPrice: pkg.price
            });
          } else {
            const country = countriesMap.get(pkg.countryId)!;
            country.plansCount++;
            country.startingPrice = Math.min(country.startingPrice, pkg.price);
          }
        });

        setCountries(Array.from(countriesMap.values()));
      } catch (err) {
        setError('Ошибка загрузки данных');
        console.error('Failed to load countries:', err);
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
          <Spinner size = 'm' />
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
              subtitle={`От ${country.startingPrice}$ • ${country.plansCount} тарифов`}
            >
              {country.name}
            </Cell>
          ))}
        </Section>
      </List>
    </Page>
  );
};