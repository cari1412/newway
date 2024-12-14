import React, { useState, useCallback } from 'react';
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

  // Check if we're in Telegram WebApp environment
  const isTelegramWebApp = useCallback((): boolean => {
    return typeof window !== 'undefined' && 
           'Telegram' in window && 
           'WebApp' in window.Telegram;
  }, []);

  // Handle opening invoice URL in Telegram WebApp
  const handlePaymentUrl = async (invoice_url: string, type: string): Promise<boolean> => {
    try {
      if (!invoice_url) {
        console.log(`No ${type} URL provided`);
        return false;
      }

      console.log(`Attempting to open ${type} URL:`, invoice_url);

      if (type === 'mini_app' && isTelegramWebApp()) {
        await window.Telegram.WebApp.openInvoice(invoice_url);
        return true;
      } else if (['web_app', 'bot'].includes(type)) {
        window.location.href = invoice_url;
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Failed to open ${type} invoice:`, error);
      return false;
    }
  };

  // Main payment handler
  const handlePayment = async () => {
    // Validation checks
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
      const item = items[0];
      
      // Create unique transaction ID
      const paymentData: PaymentRequestParams = {
        transactionId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        packageId: item.id,
        amount: item.price.toString(),
        asset: selectedAsset
      };

      console.log('Initiating payment request:', paymentData);
      
      // Create payment
      const response = await api.createPayment(paymentData);
      console.log('Payment response received:', response);

      if (!response.success || !response.data) {
        throw new Error(response.errorMsg || 'Ошибка при создании платежа');
      }

      const { 
        mini_app_invoice_url, 
        web_app_invoice_url, 
        bot_invoice_url 
      } = response.data;

      console.log('Available payment URLs:', {
        mini_app: mini_app_invoice_url ? 'Available' : 'Not available',
        web_app: web_app_invoice_url ? 'Available' : 'Not available',
        bot: bot_invoice_url ? 'Available' : 'Not available'
      });

      // Try payment methods in order of preference
      let paymentSuccess = false;

      // 1. Try mini app invoice first (best user experience)
      if (!paymentSuccess && mini_app_invoice_url) {
        paymentSuccess = await handlePaymentUrl(mini_app_invoice_url, 'mini_app');
      }

      // 2. Try web app invoice as fallback
      if (!paymentSuccess && web_app_invoice_url) {
        paymentSuccess = await handlePaymentUrl(web_app_invoice_url, 'web_app');
      }

      // 3. Try bot invoice as last resort
      if (!paymentSuccess && bot_invoice_url) {
        paymentSuccess = await handlePaymentUrl(bot_invoice_url, 'bot');
      }

      if (!paymentSuccess) {
        throw new Error('Не удалось открыть форму оплаты. Пожалуйста, попробуйте позже');
      }

    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Произошла ошибка при обработке платежа. Пожалуйста, попробуйте позже'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Asset selection handler
  const handleAssetSelect = (assetValue: string) => {
    setSelectedAsset(assetValue);
    console.log('Selected asset:', assetValue);
  };

  // Render empty cart state
  if (items.length === 0) {
    return (
      <div className="w-full">
        <Section header="Корзина пуста">
          <Cell>Добавьте планы в корзину для оформления заказа</Cell>
        </Section>
      </div>
    );
  }

  // Render cart with items
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