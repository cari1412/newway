import { Section, Cell, List, Button, Spinner } from '@telegram-apps/telegram-ui';
import { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Page } from '@/components/Page';
import { api, type Package } from '@/services/api';

// Вспомогательные функции
const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

const getFlagEmoji = (countryCode: string): string => {
  if (countryCode.length !== 2) return '🌍';
  const OFFSET = 127397;
  const chars = countryCode
    .toUpperCase()
    .split('')
    .map(char => char.charCodeAt(0) + OFFSET);
  return String.fromCodePoint(...chars);
};

const getNetworkTypeIcon = (type: string): string => {
  switch (type.toLowerCase()) {
    case '5g':
      return '📶';
    case '4g':
    case 'lte':
      return '📡';
    case '3g':
      return '📱';
    default:
      return '🌐';
  }
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
        const matchingPlan = packages.find((p: Package) => p.id === planId);
        
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
        packageCode: plan.id,
        count: 1
      }]);
      alert('Заказ успешно создан!');
    } catch (err) {
      console.error('Purchase failed:', err);
      alert('Ошибка при создании заказа. Пожалуйста, попробуйте позже.');
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

  const countryFlag = getFlagEmoji(plan.location[0]);

  const features = plan.features || [];
  const networkTypes = features
    .filter(f => f.toLowerCase().includes('g'))
    .join('/');

  return (
    <Page>
      <List>
        <Section>
          <Cell
            before={<span style={{ fontSize: '24px' }}>{countryFlag}</span>}
            after={formatPrice(plan.price)}
            subtitle={`${plan.data} • ${plan.validity}`}
          >
            {plan.name}
          </Cell>
        </Section>

        <Section header="Описание">
          <Cell multiline>{plan.description}</Cell>
        </Section>

        <Section header="Особенности">
          {features.length > 0 && (
            <Cell
              before={<span style={{ fontSize: '20px' }}>🌐</span>}
              subtitle="Поддержка сетей"
              multiline
            >
              {networkTypes}
            </Cell>
          )}
          {features.map((feature: string, index: number) => (
            <Cell
              key={index}
              before={<span style={{ fontSize: '20px' }}>{getNetworkTypeIcon(feature)}</span>}
              multiline
            >
              {feature}
            </Cell>
          ))}
        </Section>

        <Section header="Зона покрытия">
          {plan.location.map((countryCode: string, index: number) => (
            <Cell 
              key={index}
              before={<span style={{ fontSize: '20px' }}>{getFlagEmoji(countryCode)}</span>}
            >
              {countryCode}
            </Cell>
          ))}
        </Section>

        <Section header="Инструкция по установке">
          <Cell before="1️⃣">Оплатите eSIM</Cell>
          <Cell before="2️⃣">Отсканируйте QR-код</Cell>
          <Cell before="3️⃣">Установите профиль eSIM</Cell>
          <Cell before="4️⃣">Включите передачу данных</Cell>
          <Cell before="5️⃣">Готово к использованию!</Cell>
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