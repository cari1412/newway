import { Section, Cell, List, Spinner } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Page } from '@/components/Page';
import { api, type Package } from '@/services/api';

export const CountryDetails: FC = () => {
  const { countryId } = useParams();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlans = async () => {
      if (!countryId) return;

      try {
        const packages = await api.getPackages(countryId);
        setPlans(packages);
      } catch (err) {
        setError('Ошибка загрузки тарифов');
        console.error('Failed to load plans:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, [countryId]);

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

  return (
    <Page>
      <List>
        <Section
          header="Доступные тарифы"
          footer="Выберите тариф для просмотра подробной информации"
        >
          {plans.map((plan) => (
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