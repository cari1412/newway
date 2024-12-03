// pages/PlanDetails/PlanDetails.tsx
import { Section, Cell, List, Button, Spinner } from '@telegram-apps/telegram-ui';
import { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Page } from '@/components/Page';
import { api, type Package } from '@/services/api';
import { formatPrice, getFlagEmoji, getNetworkTypeIcon } from '@/utils/formats';
import { toast } from 'react-hot-toast';
import { useCart } from '@/hooks/useCart';

const PlanDetails: FC = () => {
  const { planId } = useParams();
  const [plan, setPlan] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const loadPlan = async () => {
      if (!planId) return;

      try {
        setLoading(true);
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

  const handleAddToCart = async () => {
    if (!plan) return;
    
    try {
      await api.logPackageSelection(plan.id);
      addToCart(plan);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Ошибка при добавлении в корзину');
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
            multiline
          >
            {plan.name}
          </Cell>
        </Section>

        <Section header="Описание">
          <Cell multiline>{plan.description}</Cell>
        </Section>

        <Section header="Особенности">
          {networkTypes && (
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
          <Cell before="1️⃣">Оформите заказ в корзине</Cell>
          <Cell before="2️⃣">Отсканируйте QR-код</Cell>
          <Cell before="3️⃣">Установите профиль eSIM</Cell>
          <Cell before="4️⃣">Включите передачу данных</Cell>
          <Cell before="5️⃣">Готово к использованию!</Cell>
        </Section>

        <Section>
          <Cell>
            <div style={{ padding: '8px 0' }}>
              <Button 
                size="l" 
                mode="filled"
                stretched 
                onClick={handleAddToCart}
              >
                Добавить в корзину за {formatPrice(plan.price)}
              </Button>
            </div>
          </Cell>
        </Section>
      </List>
    </Page>
  );
};

export default PlanDetails;