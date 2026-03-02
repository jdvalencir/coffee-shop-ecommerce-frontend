import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  CheckoutStep,
  CreditCard,
  DeliveryInfo,
  PaymentResultState,
  Product,
} from '@/types';

interface CheckoutState {
  step: CheckoutStep;
  /** The product the user selected to buy */
  selectedProduct: Product | null;
  /**
   * Credit card data — kept ONLY in memory, never persisted.
   * Cleared on every app initialisation.
   */
  creditCard: CreditCard | null;
  /** Delivery form — persisted by the store subscriber */
  delivery: DeliveryInfo | null;
  /** Final transaction outcome for the status screen */
  paymentResult: PaymentResultState;
}

function isCheckoutStep(v: unknown): v is CheckoutStep {
  return ['product', 'checkout', 'summary', 'status'].includes(v as string);
}

const savedStep = (() => {
  try { return localStorage.getItem('bb_step'); } catch { return null; }
})();

const initialState: CheckoutState = {
  step: isCheckoutStep(savedStep) ? savedStep : 'product',
  selectedProduct: null, // rehydrated by RehydrationLayer once products load
  creditCard: null,      // NEVER persisted
  delivery: (() => {
    try {
      const raw = localStorage.getItem('bb_delivery');
      return raw ? (JSON.parse(raw) as DeliveryInfo) : null;
    } catch { return null; }
  })(),
  paymentResult: {
    outcome: 'idle',
    status: null,
    transactionId: null,
    message: null,
  },
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    selectProduct(state, action: PayloadAction<Product>) {
      state.selectedProduct = action.payload;
    },
    rehydrateSelectedProduct(state, action: PayloadAction<Product>) {
      state.selectedProduct = action.payload;
    },
    setStep(state, action: PayloadAction<CheckoutStep>) {
      state.step = action.payload;
    },
    setCreditCard(state, action: PayloadAction<CreditCard>) {
      state.creditCard = action.payload;
    },
    setDelivery(state, action: PayloadAction<DeliveryInfo>) {
      state.delivery = action.payload;
    },
    setPaymentResult(state, action: PayloadAction<PaymentResultState>) {
      state.paymentResult = action.payload;
    },
    clearPaymentResult(state) {
      state.paymentResult = {
        outcome: 'idle',
        status: null,
        transactionId: null,
        message: null,
      };
    },
    resetCheckout(state) {
      state.step = 'product';
      state.selectedProduct = null;
      state.creditCard = null;
      state.delivery = null;
      state.paymentResult = {
        outcome: 'idle',
        status: null,
        transactionId: null,
        message: null,
      };
    },
  },
});

export const {
  selectProduct,
  rehydrateSelectedProduct,
  setStep,
  setCreditCard,
  setDelivery,
  setPaymentResult,
  clearPaymentResult,
  resetCheckout,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
