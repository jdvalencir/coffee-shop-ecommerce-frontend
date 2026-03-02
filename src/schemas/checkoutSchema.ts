import { z } from 'zod';
import { luhnCheck } from '@/utils/cardValidation';

// ── Delivery schema ───────────────────────────────────────────────────────────

export const deliverySchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'El nombre completo debe tener al menos 2 caracteres')
    .max(80, 'El nombre completo es demasiado largo'),

  email: z
    .string()
    .trim()
    .min(1, 'El correo es obligatorio')
    .email('Ingresa un correo válido'),

  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s\-()]{7,20}$/, 'Ingresa un teléfono válido (7 a 20 dígitos)'),

  address: z
    .string()
    .trim()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(200, 'La dirección es demasiado larga'),

  city: z
    .string()
    .trim()
    .min(2, 'La ciudad debe tener al menos 2 caracteres'),

  department: z
    .string()
    .trim()
    .min(2, 'El departamento o región debe tener al menos 2 caracteres'),
});

// ── Credit card schema ────────────────────────────────────────────────────────

export const creditCardSchema = z.object({
  cardNumber: z
    .string()
    .min(1, 'El número de tarjeta es obligatorio')
    .refine(
      (val) => /^\d{4}(\s\d{4}){3}$/.test(val) || /^\d{16}$/.test(val),
      'El número de tarjeta debe tener 16 dígitos',
    )
    .refine(
      (val) => luhnCheck(val.replace(/\s/g, '')),
      'El número de tarjeta es inválido (falló la validación de seguridad)',
    ),

  holderName: z
    .string()
    .trim()
    .min(2, 'El nombre del titular debe tener al menos 2 caracteres')
    .max(80, 'El nombre es demasiado largo')
    .regex(/^[a-zA-ZÀ-ÿ\s'.-]+$/, 'El nombre solo puede contener letras y espacios'),

  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Ingresa la fecha como MM/AA')
    .refine((val) => {
      const [mm, yy] = val.split('/').map(Number);
      const now = new Date();
      const cardYear = 2000 + yy;
      return (
        cardYear > now.getFullYear() ||
        (cardYear === now.getFullYear() && mm >= now.getMonth() + 1)
      );
    }, 'Esta tarjeta está vencida'),

  cvv: z
    .string()
    .regex(/^\d{3,4}$/, 'El CVV debe tener 3 o 4 dígitos'),
});

// ── Combined form schema ──────────────────────────────────────────────────────

export const checkoutSchema = z.object({
  delivery: deliverySchema,
  payment: creditCardSchema,
});

// ── Inferred types ────────────────────────────────────────────────────────────

export type DeliveryFormData = z.infer<typeof deliverySchema>;
export type CreditCardFormData = z.infer<typeof creditCardSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
