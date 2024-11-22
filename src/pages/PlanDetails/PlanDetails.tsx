import { Section, Cell, List, Button, Spinner } from '@telegram-apps/telegram-ui';
import { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Page } from '@/components/Page';
import { api, type Package } from '@/services/api';

const formatBytes = (bytes: number) => {
  const GB = bytes / (1024 * 1024 * 1024);
  return `${GB} GB`;
};

const formatPrice = (price: number) => {
  return `${(price / 10000).toFixed(2)}$`;
};

export const PlanDetails: FC = () => {
  const { planId } = useParams();
  const [plan, setPlan] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlan = async () => {
      if (!planId) return;

      try {
        const packages = await api.getPackages();
        const matchingPlan = packages.find((p: Package) => p.packageCode === planId);
        
        if (matchingPlan) {
          setPlan(matchingPlan);
        } else {
          setError('План не найден');
        }
      } catch (err) {
        setError('Ошибка загрузки данных');
        console.error('Failed to load plan:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [planId]);

  const handlePurchase = async () => {
    if (!plan) return;
    
    try {
      const transactionId = `purchase-${Date.now()}`;
      await api.createOrder(transactionId, [{
        packageCode: plan.packageCode,
        count: 1,
        price: plan.price
      }]);
      // Handle successful purchase (e.g. show success message, redirect)
    } catch (err) {
      console.error('Purchase failed:', err);
      // Handle error
    }
  };

  if (loading) {
    return (
      <Page>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
          <Spinner size="m" />
        </div>
      </Page>
    );
  }

  if (error || !plan) {
    return (
      <Page>
        <Section header="Ошибка">
          <Cell>{error || 'План не найден'}</Cell>
        </Section>
      </Page>
    );
  }

  const flag = plan.locationNetworkList[0]?.locationLogo || '🌍';

  return (
    <Page>
      <List>
        <Section>
          <Cell
            before={<span style={{ fontSize: '24px' }}>{flag}</span>}
            after={formatPrice(plan.price)}
            subtitle={`${formatBytes(plan.volume)} • ${plan.duration} ${plan.durationUnit}`}
          >
            {plan.name}
          </Cell>
        </Section>

        <Section header="Описание">
          <Cell multiline>{plan.description}</Cell>
        </Section>

        <Section header="Особенности">
          <Cell
            before={<span style={{ fontSize: '20px' }}>🌐</span>}
            subtitle="Поддержка высокоскоростных сетей"
            multiline
          >
            {plan.speed} покрытие
          </Cell>
          {plan.locationNetworkList[0]?.operatorList.map((op, index) => (
            <Cell
              key={index}
              before={<span style={{ fontSize: '20px' }}>📡</span>}
              subtitle={op.networkType}
              multiline
            >
              {op.operatorName}
            </Cell>
          ))}
        </Section>

        <Section header="Зона покрытия">
          {plan.locationNetworkList.map((location, index) => (
            <Cell key={index}>{location.locationName}</Cell>
          ))}
        </Section>

        <Section header="Как установить">
          <Cell before="1.">Отсканируйте QR-код после покупки</Cell>
          <Cell before="2.">Установите eSIM профиль</Cell>
          <Cell before="3.">Включите передачу данных</Cell>
          <Cell before="4.">Готово к использованию!</Cell>
        </Section>

        <Section>
          <Cell>
            <div style={{ padding: '8px 0' }}>
              <Button size="l" stretched onClick={handlePurchase}>
                Купить за {formatPrice(plan.price)}
              </Button>
            </div>
          </Cell>
        </Section>
      </List>
    </Page>
  );
};