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
  const [selectedAsset, setSelectedAsset] = React.useState('TON');

  const handleAssetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedAsset(value);
  };

  const handlePayment = async () => {
    if (items.length === 0) return;
    
    try {
      setIsProcessing(true);
      
      for (const item of items) {
        const transactionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        
        // Передаем правильные параметры для создания платежа
        const payment = await api.createPayment(
          transactionId,
          item.price,
          item.id,
          'crypto',  // Используем cryptocurrency как метод оплаты
          selectedAsset // Передаем выбранный актив
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
            <div className="w-full space-y-2">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Выберите криптовалюту для оплаты:
              </div>
              <div className="relative">
                <select
                  value={selectedAsset}
                  onChange={handleAssetChange}
                  className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl appearance-none focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 text-base"
                  style={{
                    backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 8px center',
                    backgroundSize: '16px',
                    paddingRight: '32px'
                  }}
                >
                  {SUPPORTED_ASSETS.map(asset => (
                    <option key={asset.value} value={asset.value}>
                      {asset.label}
                    </option>
                  ))}
                </select>
              </div>
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