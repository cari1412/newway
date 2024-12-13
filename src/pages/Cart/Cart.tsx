// Cart.tsx
import React from 'react';
import { Section, Cell, List, Button } from '@telegram-apps/telegram-ui';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/utils/formats';
import { api, PaymentRequestParams } from '@/services/api';
import { toast } from 'react-hot-toast';

export const SUPPORTED_ASSETS = [
  { value: 'TON', label: 'TON' },
  { value: 'USDT', label: 'USDT' },
  { value: 'BTC', label: 'Bitcoin' },
  { value: 'ETH', label: 'Ethereum' },
  { value: 'LTC', label: 'Litecoin' },
  { value: 'BNB', label: 'BNB' },
  { value: 'TRX', label: 'TRON' },
  { value: 'USDC', label: 'USDC' }
] as const;

export const Cart = () => {
  const { items, removeFromCart, getTotalPrice } = useCart();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [selectedAsset, setSelectedAsset] = React.useState<(typeof SUPPORTED_ASSETS)[number]['value']>(
    SUPPORTED_ASSETS[0].value
  );

  const handlePayment = async () => {
    if (items.length === 0) {
      toast.error('Корзина пуста');
      return;
    }

    if (!selectedAsset) {
      toast.error('Выберите криптовалюту для оплаты');
      return;
    }

    setIsProcessing(true);

    try {
      for (const item of items) {
        const paymentData: PaymentRequestParams = {
          transactionId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          packageId: item.id,
          amount: item.price.toString(),
          asset: selectedAsset,
          currency_type: 'crypto',
          paymentMethod: selectedAsset.toUpperCase() === 'TON' ? 'ton' : 'crypto'
        };

        console.log('Creating payment:', paymentData);

        const payment = await api.createPayment(paymentData);

        if (payment && payment.mini_app_invoice_url) {
          if (window.Telegram?.WebApp?.openInvoice) {
            window.Telegram.WebApp.openInvoice(payment.mini_app_invoice_url);
          } else {
            window.location.href = payment.web_app_invoice_url || payment.bot_invoice_url;
          }
          break;
        } else {
          throw new Error('Invalid payment response');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка при создании платежа');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAssetSelect = (assetValue: string) => {
    setSelectedAsset(assetValue as (typeof SUPPORTED_ASSETS)[number]['value']);
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
          <Cell>Выберите криптовалюту для оплаты:</Cell>
          {SUPPORTED_ASSETS.map((asset) => (
            <Cell
              key={asset.value}
              onClick={() => handleAssetSelect(asset.value)}
              after={selectedAsset === asset.value ? '✓' : null}
              className="cursor-pointer hover:bg-gray-700"
            >
              {asset.label}
            </Cell>
          ))}
        </Section>

        <Section>
          <Cell>
            <div className="text-sm text-gray-400">
              Выбрана валюта: {SUPPORTED_ASSETS.find(a => a.value === selectedAsset)?.label || 'Не выбрана'}
            </div>
          </Cell>
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
                disabled={isProcessing || !selectedAsset}
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