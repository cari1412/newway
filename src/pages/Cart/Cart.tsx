import React from 'react';
import { Section, Cell, List, Button } from '@telegram-apps/telegram-ui';
import { Page } from '@/components/Page';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/utils/formats';
import { api } from '@/services/api';
import { toast } from 'react-hot-toast';

// Поддерживаемые криптовалюты
const SUPPORTED_ASSETS = [
  { value: 'TON', label: 'TON' },
  { value: 'USDT', label: 'USDT' },
  { value: 'BTC', label: 'Bitcoin' },
  { value: 'ETH', label: 'Ethereum' },
  { value: 'LTC', label: 'Litecoin' },
  { value: 'BNB', label: 'BNB' },
  { value: 'TRX', label: 'TRON' },
  { value: 'USDC', label: 'USDC' }
];

export const Cart: React.FC = () => {
  const { items, removeFromCart, getTotalPrice } = useCart();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [selectedAsset, setSelectedAsset] = React.useState(SUPPORTED_ASSETS[0].value);

  const handlePayment = async () => {
    if (items.length === 0) return;
    
    try {
      setIsProcessing(true);
      
      for (const item of items) {
        const transactionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        
        console.log('Creating payment with params:', {
          transactionId,
          amount: item.price,
          packageId: item.id,
          asset: selectedAsset
        });

        const payment = await api.createPayment(
          transactionId,
          item.price,
          item.id,
          selectedAsset
        );

        if ('payment_url' in payment) {
          window.location.href = payment.payment_url;
        } else if ('bot_invoice_url' in payment) {
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
                <div className="flex items-center gap-2">
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
            <div className="w-full">
              <div className="text-sm text-gray-100 mb-2">
                Выберите криптовалюту для оплаты:
              </div>
              <select
                value={selectedAsset}
                onChange={(e) => {
                  console.log('Selected asset:', e.target.value);
                  setSelectedAsset(e.target.value);
                }}
                className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg appearance-none focus:outline-none focus:border-blue-500"
                style={{
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                  backgroundSize: '1.5em',
                  paddingRight: '2.5em'
                }}
              >
                {SUPPORTED_ASSETS.map(asset => (
                  <option 
                    key={asset.value} 
                    value={asset.value}
                    className="bg-gray-800 text-white"
                  >
                    {asset.label}
                  </option>
                ))}
              </select>
            </div>
          </Cell>
        </Section>

        <Section>
          <Cell after={formatPrice(getTotalPrice())}>
            <strong>Итого</strong>
          </Cell>
          <Cell>
            <div className="p-2">
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