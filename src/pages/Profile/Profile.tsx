// src/pages/Profile/Profile.tsx
import { Section, Cell, List, Spinner } from '@telegram-apps/telegram-ui';
import { FC, useState, useEffect } from 'react';
import { Page } from '@/components/Page';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/utils/formats';

interface Order {
  id: string;
  date: string;
  amount: number;
  status: string;
}

export const Profile: FC = () => {
  const { items } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const [orderHistory] = useState<Order[]>([]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSupportClick = () => {
    const tg = window.Telegram?.WebApp;
    if (tg?.openTelegramLink) {
      tg.openTelegramLink('https://t.me/your_support_bot');
    } else {
      // Запасной вариант
      window.open('https://t.me/your_support_bot', '_blank');
    }
  };

  const handleFaqClick = () => {
    const tg = window.Telegram?.WebApp;
    if (tg?.openLink) {
      tg.openLink('https://your-faq-page.com');
    } else {
      window.open('https://your-faq-page.com', '_blank');
    }
  };

  if (isLoading) {
    return (
      <Page>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
          <Spinner size="m" />
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <List>
        <Section header="Профиль">
          <Cell before="👤">Личные данные</Cell>
          <Cell before="📱" subtitle="Telegram Mini App">Версия приложения 1.0.0</Cell>
        </Section>

        <Section header="Корзина">
          <Cell
            before="🛒"
            subtitle={items.length > 0 ? `${items.length} ${items.length === 1 ? 'план' : 'планов'}` : 'Пусто'}
          >
            Товары в корзине
          </Cell>
        </Section>

        <Section header="История заказов">
          {orderHistory.length > 0 ? (
            orderHistory.map((order) => (
              <Cell
                key={order.id}
                subtitle={`Заказ #${order.id}`}
                after={formatPrice(order.amount)}
              >
                {order.date}
              </Cell>
            ))
          ) : (
            <Cell>У вас пока нет заказов</Cell>
          )}
        </Section>

        <Section header="Поддержка">
          <Cell
            before="💬"
            subtitle="Служба поддержки"
            onClick={handleSupportClick}
          >
            Написать в поддержку
          </Cell>
          <Cell
            before="📖"
            subtitle="Часто задаваемые вопросы"
            onClick={handleFaqClick}
          >
            FAQ
          </Cell>
        </Section>

        <Section>
          <Cell 
            before="ℹ️"
            subtitle="Версия 1.0.0"
          >
            О приложении
          </Cell>
        </Section>
      </List>
    </Page>
  );
};

export default Profile;