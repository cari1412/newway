import React, { useState, useEffect } from 'react';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<string>(SUPPORTED_ASSETS[0].value);
  const [webApp, setWebApp] = useState<any>(null);

  // Инициализация Telegram WebApp
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      setWebApp(window.Telegram.WebApp);
      window.Telegram.WebApp.ready();
      console.log('Telegram WebApp initialized');
    } else {
      console.log('Telegram WebApp not available');
    }
  }, []);

  // Открытие инвойса
  const openInvoice = async (url: string): Promise<boolean> => {
    try {
      if (!webApp) {
        console.error('Telegram WebApp not initialized');
        return false;
      }

      console.log('Attempting to open invoice URL:', url);
      await webApp.openInvoice(url);
      console.log('Invoice opened successfully');
      return true;
    } catch (error) {
      console.error('Error opening invoice:', error);
      return false;
    }
  };

  // Обработка платежа
  const handlePayment = async () => {
    if (items.length === 0) {
      toast.error('Корзина пуста');
      return;
    }

    if (!selectedAsset) {
      toast.error('Выберите криптовалюту для оплаты');
      return;
    }

    if (!webApp) {
      toast.error('Ошибка инициализации платежной системы');
      return;
    }

    setIsProcessing(true);

    try {
      const item = items[0];
      
      const paymentData: PaymentRequestParams = {
        transactionId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        packageId: item.id,
        amount: item.price.toString(),
        asset: selectedAsset
      };

      console.log('Creating payment:', paymentData);
      
      const response = await api.createPayment(paymentData);
      console.log('Payment response:', response);

      if (!response.success || !response.data) {
        throw new Error(response.errorMsg || 'Ошибка при создании платежа');
      }

      const { 
        mini_app_invoice_url, 
        web_app_invoice_url, 
        bot_invoice_url 
      } = response.data;

      // Пробуем все доступные способы оплаты
      let paymentInitiated = false;

      // 1. Пробуем mini_app_invoice_url
      if (mini_app_invoice_url) {
        console.log('Trying mini app invoice URL');
        paymentInitiated = await openInvoice(mini_app_invoice_url);
      }

      // 2. Если не получилось, пробуем web_app_invoice_url
      if (!paymentInitiated && web_app_invoice_url) {
        console.log('Redirecting to web app invoice');
        window.location.href = web_app_invoice_url;
        paymentInitiated = true;
      }

      // 3. Как последний вариант, пробуем bot_invoice_url
      if (!paymentInitiated && bot_invoice_url) {
        console.log('Redirecting to bot invoice');
        window.location.href = bot_invoice_url;
        paymentInitiated = true;
      }

      if (!paymentInitiated) {
        throw new Error('Не удалось открыть форму оплаты');
      }

    } catch (error) {
      console.error('Payment error:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Ошибка при обработке платежа'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAssetSelect = (assetValue: string) => {
    setSelectedAsset(assetValue);
    console.log('Selected asset:', assetValue);
  };

  // Render пустой корзины
  if (items.length === 0) {
    return (
      <div className="w-full">
        <Section header="Корзина пуста">
          <Cell>Добавьте планы в корзину для оформления заказа</Cell>
        </Section>
      </div>
    );
  }

  // Основной render
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
              {webApp ? 
                `Выбрана валюта: ${SUPPORTED_ASSETS.find(a => a.value === selectedAsset)?.label || 'Не выбрана'}` :
                'Инициализация платежной системы...'
              }
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
                disabled={isProcessing || !selectedAsset || !webApp}
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