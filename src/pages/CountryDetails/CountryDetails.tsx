import { Section, Cell, List, Spinner } from '@telegram-apps/telegram-ui';
import { FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Page } from '@/components/Page';
import { api, type Package } from '@/services/api';
import { formatPrice, formatValidity } from '@/utils/formats';
import { useInView } from 'react-intersection-observer';

const ITEMS_PER_PAGE = 20;

export const CountryDetails: FC = () => {
  const { countryId } = useParams();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  // Загрузка планов
  const loadPlans = async (currentPage: number, isFirstLoad: boolean = false) => {
    if (!countryId) return;

    try {
      setLoading(true);
      const response = await api.getPackages({
        location: countryId.toUpperCase(),
        page: currentPage,
        limit: ITEMS_PER_PAGE
      });

      const countryPackages = response.packageList.filter((pkg: Package) => 
        pkg.location.includes(countryId.toUpperCase())
      );

      if (isFirstLoad) {
        setPlans(countryPackages);
      } else {
        setPlans(prev => [...prev, ...countryPackages]);
      }

      setHasMore(response.page < response.totalPages);
      setError(null);
    } catch (err) {
      console.error('Failed to load plans:', err);
      setError('Ошибка загрузки тарифов. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  // Первоначальная загрузка
  useEffect(() => {
    setPlans([]);
    setPage(1);
    setHasMore(true);
    loadPlans(1, true);
  }, [countryId]);

  // Загрузка при скролле
  useEffect(() => {
    if (inView && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadPlans(nextPage);
    }
  }, [inView, hasMore, loading]);

  if (loading && plans.length === 0) {
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
              after={formatPrice(plan.price)}
              multiline
            >
              {plan.name}
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