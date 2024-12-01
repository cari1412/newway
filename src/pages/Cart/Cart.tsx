// pages/Cart/Cart.tsx
import { Section, Cell, List, Button, Spinner } from '@telegram-apps/telegram-ui';
import { FC } from 'react';
import { Page } from '@/components/Page';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/utils/formats';

export const Cart: FC = () => {
  const { items, removeFromCart, getTotalPrice, isLoading, checkoutCart } = useCart();

  if (isLoading) {
    return (
      <Page>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
          <Spinner size="m" />
        </div>
      </Page>
    );
  }

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
                onClick={checkoutCart}
                disabled={isLoading}
              >
                {isLoading ? 'Оформление...' : 'Оформить заказ'}
              </Button>
            </div>
          </Cell>
        </Section>
      </List>
    </Page>
  );
};