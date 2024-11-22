import { Section, Cell, List, Spinner } from '@telegram-apps/telegram-ui';
import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '@/components/Page';
import { api, type Package } from '@/services/api';

interface Country {
  id: string;
  name: string;
  flag: string;
  plansCount: number;
  startingPrice: number;
}

const parseLocationToCountry = (packages: Package[]): Country[] => {
  const countryMap = new Map<string, Country>();

  packages.forEach(pkg => {
    // Split location string in case it contains multiple countries
    const locations = pkg.location.split(',');
    
    locations.forEach(location => {
      const cleanLocation = location.trim();
      if (!cleanLocation) return;

      if (!countryMap.has(cleanLocation)) {
        const locationInfo = pkg.locationNetworkList.find(l => 
          l.locationName.toLowerCase().includes(cleanLocation.toLowerCase())
        );

        countryMap.set(cleanLocation, {
          id: cleanLocation,
          name: locationInfo?.locationName || cleanLocation,
          flag: locationInfo?.locationLogo || '🌍',
          plansCount: 1,
          startingPrice: pkg.price
        });
      } else {
        const country = countryMap.get(cleanLocation)!;
        country.plansCount++;
        country.startingPrice = Math.min(country.startingPrice, pkg.price);
      }
    });
  });

  return Array.from(countryMap.values());
};

export const CountryList: FC = () => {
  const navigate = useNavigate();
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const packages = await api.getPackages();
        const countriesList = parseLocationToCountry(packages);
        setCountries(countriesList);
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

  const formatPrice = (price: number) => `${(price / 10000).toFixed(2)}$`;

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
              subtitle={`От ${formatPrice(country.startingPrice)} • ${country.plansCount} тарифов`}
            >
              {country.name}
            </Cell>
          ))}
        </Section>
      </List>
    </Page>
  );
};