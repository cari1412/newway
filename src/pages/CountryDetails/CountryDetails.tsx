import { Section, Cell, List, Spinner } from '@telegram-apps/telegram-ui';
import { FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Page } from '@/components/Page';
import { api, type Package } from '@/services/api';
import { formatPrice, formatValidity } from '@/utils/formats';
import { useInView } from 'react-intersection-observer';

const ITEMS_PER_PAGE = 20;

interface PageInfo {
  currentPage: number;
  hasMore: boolean;
}

export const CountryDetails: FC = () => {
  const { countryId } = useParams();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState<PageInfo>({
    currentPage: 1,
    hasMore: true
  });

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

      // Определяем, есть ли ещё страницы на основе количества полученных пакетов
      const hasMore = countryPackages.length === ITEMS_PER_PAGE;
      setPageInfo({
        currentPage,
        hasMore
      });
      
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
    setPageInfo({
      currentPage: 1,
      hasMore: true
    });
    loadPlans(1, true);
  }, [countryId]);

  // Загрузка при скролле
  useEffect(() => {
    if (inView && pageInfo.hasMore && !loading) {
      const nextPage = pageInfo.currentPage + 1;
      setPageInfo(prev => ({
        ...prev,
        currentPage: nextPage
      }));
      loadPlans(nextPage);
    }
  }, [inView, pageInfo.hasMore, loading]);

  if (loading && plans.length === 0) {
    return (
      <Page>
        <div className="flex justify-center p-4">
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
            {loading && pageInfo.hasMore && (
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