// Cart.tsx
import React from 'react';
import { Section, Cell, List, Button } from '@telegram-apps/telegram-ui';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/utils/formats';
import { api, PaymentRequestParams } from '@/services/api';
import { toast } from 'react-hot-toast';

type AssetType = {
  value: string;
  label: string;
};

const SUPPORTED_ASSETS: readonly AssetType[] = [
  { value: 'TON', label: 'TON' },
  { value: 'USDT', label: 'USDT' },
  { value: 'BTC', label: 'Bitcoin' },
  { value: 'ETH', label: 'Ethereum' },
  { value: 'LTC', label: 'Litecoin' },
  { value: 'BNB', label: 'BNB' },
  { value: 'TRX', label: 'TRON' },
  { value: 'USDC', label: 'USDC' }
] as const;

export const Cart: React.FC = () => {
  const { items, removeFromCart, getTotalPrice } = useCart();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [selectedAsset, setSelectedAsset] = React.useState<string>(SUPPORTED_ASSETS[0].value);

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
      // Process one item at a time
      const item = items[0]; // Start with first item
      
      const paymentData: PaymentRequestParams = {
        transactionId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        packageId: item.id,
        amount: item.price.toString(),
        asset: selectedAsset,
        currency_type: 'crypto',
        paymentMethod: selectedAsset.toUpperCase() === 'TON' ? 'ton' : 'crypto'
      };

      console.log('Creating payment:', paymentData);

      const response = await api.createPayment(paymentData);
      console.log('Payment response:', response);

      if (!response.ok || !response.result) {
        throw new Error('Некорректный ответ от сервера');
      }

      const { mini_app_invoice_url, web_app_invoice_url, bot_invoice_url } = response.result;

      // Check if we're in Telegram environment
      if (window.Telegram?.WebApp) {
        try {
          // Prefer mini app invoice URL for Telegram environment
          if (mini_app_invoice_url) {
            await window.Telegram.WebApp.openInvoice(mini_app_invoice_url);
          } else if (web_app_invoice_url) {
            window.location.href = web_app_invoice_url;
          } else if (bot_invoice_url) {
            window.location.href = bot_invoice_url;
          } else {
            throw new Error('Не получены URL для оплаты');
          }
        } catch (invoiceError) {
          console.error('Error opening invoice:', invoiceError);
          // Try fallback to web_app_invoice_url if openInvoice fails
          if (web_app_invoice_url) {
            window.location.href = web_app_invoice_url;
          } else {
            throw new Error('Ошибка при открытии платежа');
          }
        }
      } else {
        // Not in Telegram environment, use web version
        if (web_app_invoice_url) {
          window.location.href = web_app_invoice_url;
        } else if (bot_invoice_url) {
          window.location.href = bot_invoice_url;
        } else {
          throw new Error('Не получены URL для оплаты');
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
    setSelectedAsset(assetValue);
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
              className="cursor-pointer hover:bg-gray-100/10"
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