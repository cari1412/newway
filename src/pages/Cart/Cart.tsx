import React from 'react';
import { Section, Cell, List, Button } from '@telegram-apps/telegram-ui';
import { Page } from '@/components/Page';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/utils/formats';
import { api, PaymentMethod } from '@/services/api';
import { toast } from 'react-hot-toast';

interface PaymentOption {
  value: PaymentMethod;
  label: string;
}

const paymentOptions: PaymentOption[] = [
  { value: 'ton', label: 'TON' },
  { value: 'crypto', label: 'Crypto Pay' }
];

const cryptoAssets = [
  { value: 'TON', label: 'TON' },
  { value: 'USDT', label: 'USDT' },
  { value: 'BTC', label: 'Bitcoin' },
  { value: 'ETH', label: 'Ethereum' }
];

export const Cart: React.FC = () => {
  const { items, removeFromCart, getTotalPrice } = useCart();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>('ton');
  const [cryptoAsset, setCryptoAsset] = React.useState('TON');

  const handlePayment = async () => {
    if (items.length === 0) return;
    
    try {
      setIsProcessing(true);
      
      for (const item of items) {
        const transactionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        
        const payment = await api.createPayment(
          transactionId,
          item.price,
          item.id,
          paymentMethod,
          cryptoAsset
        );

        if ('payment_url' in payment) {
          // TON payment
          window.location.href = payment.payment_url;
        } else if ('bot_invoice_url' in payment) {
          // Crypto Pay payment
          const isTelegramWebApp = window.Telegram?.WebApp;
          const paymentUrl = isTelegramWebApp 
            ? payment.mini_app_invoice_url 
            : payment.web_app_invoice_url;
            
          if (paymentUrl) {
            window.location.href = paymentUrl;
          } else {
            toast.error('Ошибка: URL оплаты не получен');
          }
        } else {
          toast.error('Ошибка: Неверный формат ответа от сервера');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка при создании платежа');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <Page>
        <Section header="Корзина пуста">
          <Cell>Добавьте планы в корзину для оформления заказа</Cell>
        </Section>
      </Page>
    );
  }

  return (
    <Page>
      <List>
        <Section header="Ваша корзина">
          {items.map((item) => (
            <Cell
              key={item.id}
              subtitle={`${item.data} • ${item.validity}`}
              after={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{formatPrice(item.price)}</span>
                  <Button
                    size="s"
                    mode="outline"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Удалить
                  </Button>
                </div>
              }
              multiline
            >
              {item.name}
            </Cell>
          ))}
        </Section>

        <Section header="Способ оплаты">
          <Cell>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid #ddd'
              }}
            >
              {paymentOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Cell>
          
          {paymentMethod === 'crypto' && (
            <Cell>
              <select
                value={cryptoAsset}
                onChange={(e) => setCryptoAsset(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}
              >
                {cryptoAssets.map(asset => (
                  <option key={asset.value} value={asset.value}>
                    {asset.label}
                  </option>
                ))}
              </select>
            </Cell>
          )}
        </Section>

        <Section>
          <Cell after={formatPrice(getTotalPrice())}>
            <strong>Итого</strong>
          </Cell>
          <Cell>
            <div style={{ padding: '8px 0' }}>
              <Button
                size="l"
                mode="filled"
                stretched
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? 'Создание платежа...' : 'Оплатить'}
              </Button>
            </div>
          </Cell>
        </Section>
      </List>
    </Page>
  );
};