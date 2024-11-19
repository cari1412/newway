import { Section, Cell, List } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '@/components/Page';

interface Country {
  id: string;
  name: string;
  flag: string;
  plansCount: number;
  startingPrice: number;
}

export const CountryList: FC = () => {
  const navigate = useNavigate();
  
  // Пример данных, в реальном приложении должны загружаться с бэкенда
  const countries: Country[] = [
    {
      id: 'us',
      name: 'США',
      flag: '🇺🇸',
      plansCount: 5,
      startingPrice: 10
    },
    {
      id: 'eu',
      name: 'Европа',
      flag: '🇪🇺',
      plansCount: 3,
      startingPrice: 15
    }
    // Добавьте другие страны
  ];

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