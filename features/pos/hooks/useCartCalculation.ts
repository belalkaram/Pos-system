
import { useMemo } from 'react';
import { CartItem, AppSettings } from '../../../types';

export const useCartCalculation = (cart: CartItem[], settings: AppSettings, orderType: string) => {
  const calculation = useMemo(() => {
    // إجمالي المبلغ الذي يدفعه العميل بناءً على أسعار المنيو
    const grossTotal = cart.reduce((sum, item) => sum + (item.totalItemPrice * item.quantity), 0);
    
    // رسوم الخدمة تضاف فوق السعر الشامل إذا كانت مطبقة
    const serviceCharge = orderType === 'dine-in' ? grossTotal * settings.serviceRate : 0;
    
    // المبلغ الإجمالي النهائي
    const total = grossTotal + serviceCharge;

    // استخراج قيمة الضريبة من السعر الإجمالي (لأن السعر شامل الضريبة أصلاً)
    // المعادلة: قيمة الضريبة = الإجمالي - (الإجمالي / (1 + نسبة الضريبة))
    const tax = grossTotal - (grossTotal / (1 + settings.taxRate));

    // صافي القيمة قبل الضريبة
    const subtotal = grossTotal - tax;

    return {
      subtotal, // السعر الصافي قبل الضريبة
      serviceCharge,
      tax,      // مبلغ الضريبة المستخرج من السعر
      total,    // الإجمالي النهائي (مساوي للـ grossTotal + الخدمة)
      itemCount: cart.reduce((sum, i) => sum + i.quantity, 0)
    };
  }, [cart, settings.serviceRate, settings.taxRate, orderType]);

  return calculation;
};
