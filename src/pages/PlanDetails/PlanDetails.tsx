import { Section, Cell, List, Button } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useParams } from 'react-router-dom';
import { Page } from '@/components/Page';

interface PlanFeature {
  icon: string;
  title: string;
  description: string;
}

interface PlanDetails {
  id: string;
  name: string;
  countryName: string;
  flag: string;
  price: number;
  data: string;
  validity: string;
  description: string;
  features: PlanFeature[];
  coverageAreas: string[];
  instructions: string[];
}

export const PlanDetails: FC = () => {
  const { planId } = useParams();

  // Пример данных, в реальном приложении должны загружаться с бэкенда
  const plan: PlanDetails = {
    id: 'us-1',
    name: 'Премиум США',
    countryName: 'США',
    flag: '🇺🇸',
    price: 29.99,
    data: '10 GB',
    validity: '30 дней',
    description: 'Высокоскоростной интернет для комфортного путешествия по США с поддержкой 4G/5G сетей.',
    features: [
      {
        icon: '📱',
        title: 'Мгновенная активация',
        description: 'Активируйте eSIM сразу после покупки'
      },
      {
        icon: '🌐',
        title: '4G/5G покрытие',
        description: 'Поддержка высокоскоростных сетей'
      },
      {
        icon: '🔄',
        title: 'Автопродление',
        description: 'Возможность автоматического продления тарифа'
      }
    ],
    coverageAreas: [
      'Все 50 штатов США',
      'Аляска',
      'Гавайи',
      'Пуэрто-Рико'
    ],
    instructions: [
      'Отсканируйте QR-код после покупки',
      'Установите eSIM профиль',
      'Включите передачу данных',
      'Готово к использованию!'
    ]
  };

  const handlePurchase = () => {
    // Здесь будет логика покупки тарифа
    console.log('Покупка тарифа:', planId);
  };

  return (
    <Page>
      <List>
        {/* Основная информация */}
        <Section>
          <Cell
            before={<span style={{ fontSize: '24px' }}>{plan.flag}</span>}
            after={`${plan.price}$`}
            subtitle={`${plan.data} • ${plan.validity}`}
          >
            {plan.name}
          </Cell>
        </Section>

        {/* Описание тарифа */}
        <Section header="Описание">
          <Cell multiline>{plan.description}</Cell>
        </Section>

        {/* Особенности */}
        <Section header="Особенности">
          {plan.features.map((feature, index) => (
            <Cell
              key={index}
              before={<span style={{ fontSize: '20px' }}>{feature.icon}</span>}
              subtitle={feature.description}
              multiline
            >
              {feature.title}
            </Cell>
          ))}
        </Section>

        {/* Зона покрытия */}
        <Section header="Зона покрытия">
          {plan.coverageAreas.map((area, index) => (
            <Cell key={index}>{area}</Cell>
          ))}
        </Section>

        {/* Инструкция по установке */}
        <Section header="Как установить">
          {plan.instructions.map((instruction, index) => (
            <Cell key={index} before={`${index + 1}.`}>
              {instruction}
            </Cell>
          ))}
        </Section>

        {/* Кнопка покупки */}
        <Section>
          <Cell>
            <div style={{ padding: '8px 0' }}>
              <Button size="l" stretched onClick={handlePurchase}>
                Купить за {plan.price}$
              </Button>
            </div>
          </Cell>
        </Section>
      </List>
    </Page>
  );
};