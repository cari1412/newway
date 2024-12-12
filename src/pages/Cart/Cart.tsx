import React from 'react';
import { Section, Cell, List, Button } from '@telegram-apps/telegram-ui';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/utils/formats';
import { api } from '@/services/api';
import { toast } from 'react-hot-toast';

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

export const Cart = () => {
  const { items, removeFromCart, getTotalPrice } = useCart();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [selectedAsset, setSelectedAsset] = React.useState('TON');

  const handlePayment = async () => {
    if (items.length === 0) return;
    
    try {
      setIsProcessing(true);
      
      for (const item of items) {
        const transactionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        
        console.log('Creating payment with params:', {
          transactionId,
          packageId: item.id,
          amount: item.price,
          asset: selectedAsset,
          currency_type: 'crypto'
        });
        
        const payment = await api.createPayment(
          transactionId,
          item.price,
          item.id,
          selectedAsset,
          selectedAsset === 'TON' ? 'ton' : 'crypto'
        );

        console.log('Payment created:', payment);

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
            throw new Error('URL оплаты не получен');
          }
        } else {
          throw new Error('Неверный формат ответа от сервера');
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
      <div className="w-full">
        <Section header="Корзина пуста">
          <Cell>Добавьте планы в корзину для оформления заказа</Cell>
        </Section>
      </div>
    );
  }

  return (
    <div className="w-full">
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
              <label className="block text-sm text-gray-100 mb-2">
                Выберите криптовалюту для оплаты:
              </label>
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg"
              >
                {SUPPORTED_ASSETS.map(asset => (
                  <option 
                    key={asset.value} 
                    value={asset.value}
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
    </div>
  );
};