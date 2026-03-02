import { z } from 'zod';
import { luhnCheck } from '@/utils/cardValidation';

// ── Delivery schema ───────────────────────────────────────────────────────────

export const deliverySchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(80, 'Full name is too long'),

  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),

  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s\-()]{7,20}$/, 'Enter a valid phone number (7–20 digits)'),

  address: z
    .string()
    .trim()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address is too long'),

  city: z
    .string()
    .trim()
    .min(2, 'City must be at least 2 characters'),

  department: z
    .string()
    .trim()
    .min(2, 'Department/Region must be at least 2 characters'),
});

// ── Credit card schema ────────────────────────────────────────────────────────

export const creditCardSchema = z.object({
  cardNumber: z
    .string()
    .min(1, 'Card number is required')
    .refine(
      (val) => /^\d{4}(\s\d{4}){3}$/.test(val) || /^\d{16}$/.test(val),
      'Card number must be 16 digits',
    )
    .refine(
      (val) => luhnCheck(val.replace(/\s/g, '')),
      'Invalid card number (failed security check)',
    ),

  holderName: z
    .string()
    .trim()
    .min(2, 'Cardholder name must be at least 2 characters')
    .max(80, 'Name is too long')
    .regex(/^[a-zA-ZÀ-ÿ\s'.\-]+$/, 'Name can only contain letters and spaces'),

  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Enter expiry as MM/YY')
    .refine((val) => {
      const [mm, yy] = val.split('/').map(Number);
      const now = new Date();
      const cardYear = 2000 + yy;
      return (
        cardYear > now.getFullYear() ||
        (cardYear === now.getFullYear() && mm >= now.getMonth() + 1)
      );
    }, 'This card has expired'),

  cvv: z
    .string()
    .regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
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
