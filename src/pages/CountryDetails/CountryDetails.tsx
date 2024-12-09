import { Section, Cell, List, Spinner } from '@telegram-apps/telegram-ui';
import { FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Page } from '@/components/Page';
import { api, type Package } from '@/services/api';
import { formatPrice, formatValidity } from '@/utils/formats';

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
        setLoading(true);
        const packages = await api.getPackages(countryId);
        const countryPackages = packages.filter(pkg => 
          pkg.location.includes(countryId.toUpperCase())
        );
        setPlans(countryPackages);
        setError(null);
      } catch (err) {
        console.error('Failed to load plans:', err);
        setError('Ошибка загрузки тарифов. Пожалуйста, попробуйте позже.');
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

  if (plans.length === 0) {
    return (
      <Page>
        <Section header="Нет доступных тарифов">
          <Cell>К сожалению, для выбранной страны нет доступных тарифных планов.</Cell>
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
              subtitle={`${plan.data} • ${formatValidity(plan.validity)}`}
              after={formatPrice(plan.price)} // Заменено с retailPrice на price
              multiline
            >
              {plan.name}
            </Cell>
          ))}
        </Section>
      </List>
    </Page>
  );
};