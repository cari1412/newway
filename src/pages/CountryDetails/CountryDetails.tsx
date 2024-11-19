import { Section, Cell, List } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Page } from '@/components/Page';

interface Plan {
  id: string;
  countryId: string;
  name: string;
  data: string;
  validity: string;
  price: number;
  description: string;
}

export const CountryDetails: FC = () => {
  const { countryId } = useParams();
  const navigate = useNavigate();

  const plans: Plan[] = [
    {
      id: 'us-1',
      countryId: 'us',
      name: 'Базовый',
      data: '5 GB',
      validity: '30 дней',
      price: 10,
      description: 'Интернет для базового использования'
    },
    {
      id: 'us-2',
      countryId: 'us',
      name: 'Стандарт',
      data: '10 GB',
      validity: '30 дней',
      price: 15,
      description: 'Оптимальный вариант для путешествий'
    }
  ];

  const countryPlans = plans.filter(plan => plan.countryId === countryId);

  return (
    <Page>
      <List>
        <Section
          header="Доступные тарифы"
          footer="Выберите тариф для просмотра подробной информации"
        >
          {countryPlans.map((plan) => (
            <Cell
              key={plan.id}
              onClick={() => navigate(`/plan/${plan.id}`)}
              subtitle={`${plan.data} • ${plan.validity}`}
              after={`${plan.price}$`}
            >
              {plan.name}
            </Cell>
          ))}
        </Section>
      </List>
    </Page>
  );
};