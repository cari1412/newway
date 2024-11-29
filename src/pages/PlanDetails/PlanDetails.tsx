import { Section, Cell, List, Button, Spinner } from '@telegram-apps/telegram-ui';
import { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Page } from '@/components/Page';
import { api, type Package } from '@/services/api';
import { formatPrice, getFlagEmoji, getNetworkTypeIcon } from '@/utils/formats';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { toast } from 'react-hot-toast';

const PlanDetails: FC = () => {
  const { planId } = useParams();
  const [plan, setPlan] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tonConnectUI] = useTonConnectUI();

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

  const checkPaymentStatus = async (transactionId: string): Promise<boolean> => {
    let attempts = 0;
    const maxAttempts = 10;
    const checkInterval = 3000;

    while (attempts < maxAttempts) {
      try {
        const verified = await api.verifyPayment(transactionId);
        if (verified) {
          return true;
        }
        attempts++;
        await new Promise(resolve => setTimeout(resolve, checkInterval));
      } catch (error) {
        console.error('Payment verification attempt failed:', error);
      }
    }
    return false;
  };

  const handlePurchase = async () => {
    if (!plan || processing) return;
    
    try {
      setProcessing(true);
      
      if (!tonConnectUI.connected) {
        await tonConnectUI.connectWallet();
        setProcessing(false);
        return;
      }

      const transactionId = `purchase-${Date.now()}`;
      
      // Используем price вместо retailPrice
      const payment = await api.createPayment(transactionId, plan.price, plan.id);

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
        messages: [
          {
            address: payment.address,
            amount: payment.amount,
            payload: payment.payload,
          },
        ],
      };

      const result = await tonConnectUI.sendTransaction(transaction);
      
      if (result) {
        await api.createOrder(transactionId, plan.id);

        toast.loading('Проверка оплаты...', { duration: 3000 });

        const paymentVerified = await checkPaymentStatus(transactionId);

        if (paymentVerified) {
          toast.success('Оплата прошла успешно! Ваш eSIM будет доставлен в ближайшее время.');
        } else {
          toast.error('Не удалось подтвердить оплату. Пожалуйста, свяжитесь с поддержкой.');
        }
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      toast.error('Ошибка при оплате. Пожалуйста, попробуйте позже.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Page>
        <div className="flex justify-center p-5">
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
            before={<span className="text-2xl">{countryFlag}</span>}
            after={formatPrice(plan.price)} // Используем price вместо retailPrice
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
              before={<span className="text-xl">🌐</span>}
              subtitle="Поддержка сетей"
              multiline
            >
              {networkTypes}
            </Cell>
          )}
          {features.map((feature: string, index: number) => (
            <Cell
              key={index}
              before={<span className="text-xl">{getNetworkTypeIcon(feature)}</span>}
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
              before={<span className="text-xl">{getFlagEmoji(countryCode)}</span>}
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
            <div className="py-2">
              <Button 
                size="l" 
                stretched 
                onClick={handlePurchase}
                disabled={processing}
              >
                {processing ? (
                  <div className="flex items-center justify-center gap-2">
                    <Spinner size="s" />
                    <span>Обработка...</span>
                  </div>
                ) : (
                  `Купить за ${formatPrice(plan.price)}` // Используем price вместо retailPrice
                )}
              </Button>
            </div>
          </Cell>
        </Section>
      </List>
    </Page>
  );
};

export default PlanDetails;