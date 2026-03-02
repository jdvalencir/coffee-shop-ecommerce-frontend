// ── Domain types ─────────────────────────────────────────────────────────────

export type RoastLevel = 'light' | 'medium' | 'medium-dark' | 'dark';

export interface Product {
  id: string;
  name: string;
  description: string;
  /** Price in Colombian Pesos (COP) */
  price: number;
  stock: number;
  image: string;
  roastLevel: RoastLevel;
  origin: string;
  /** Weight in grams */
  weight: number;
  /** Tasting notes */
  notes: string[];
}

export interface CreditCard {
  number: string;
  holderName: string;
  expiry: string;
  cvv: string;
}

export interface DeliveryInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  department: string;
}

export type TransactionStatus = 'pending' | 'approved' | 'declined' | 'error';

export interface Transaction {
  id: string;
  productId: string;
  subtotal: number;
  baseFee: number;
  deliveryFee: number;
  total: number;
  status: TransactionStatus;
  createdAt: string;
}

export type CheckoutStep = 'product' | 'checkout' | 'summary' | 'status';

// ── Fee constants (COP) ───────────────────────────────────────────────────────
export const BASE_FEE_COP = 3_000;
export const DELIVERY_FEE_COP = 8_000;
