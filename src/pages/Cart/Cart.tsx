import { Section, Cell, List, Button } from '@telegram-apps/telegram-ui';
import { FC, useState } from 'react';
import { Page } from '@/components/Page';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/utils/formats';
import { api } from '@/services/api';
import { toast } from 'react-hot-toast';

export const Cart: FC = () => {
   const { items, removeFromCart, getTotalPrice } = useCart();
   const [isProcessing, setIsProcessing] = useState(false);

   const handlePayment = async () => {
       if (items.length === 0) return;
       
       try {
           setIsProcessing(true);
           for (const item of items) {
               const transactionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
               const payment = await api.createPayment(transactionId, item.price, item.id);
               
               if (payment.paymentDetails?.address) {
                   toast.success(
                       `Для оплаты ${item.name}:\nАдрес: ${payment.paymentDetails.address}\nСумма: ${formatPrice(item.price)}`,
                       { duration: 15000 }
                   );
               }

               if (payment.deepLink) {
                   toast.success(
                       `Оплатить через TON кошелек: ${payment.deepLink}`,
                       { duration: 15000 }
                   );
               }
           }
       } catch (error) {
           console.error('Payment error:', error);
           toast.error('Ошибка при создании платежа');
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