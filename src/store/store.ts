import { configureStore } from '@reduxjs/toolkit';
import type { CheckoutStep } from '@/types';
import productsReducer from './slices/productsSlice';
import checkoutReducer from './slices/checkoutSlice';
import {
  clearCheckoutPersistence,
  saveDelivery,
  saveSelectedProductId,
  saveStep,
} from '@/utils/persistence';

function getPersistedStep(step: CheckoutStep) {
  return step === 'checkout' ? 'checkout' : 'product';
}

export const store = configureStore({
  reducer: {
    products: productsReducer,
    checkout: checkoutReducer,
  },
});

// ── Manual persistence subscription ──────────────────────────────────────────
// Syncs relevant checkout state to localStorage after each dispatch.
// CC data is deliberately excluded.
let prevCheckout = store.getState().checkout;

store.subscribe(() => {
  const curr = store.getState().checkout;
  if (curr === prevCheckout) return;

  if (
    curr.step === 'product' &&
    !curr.selectedProduct &&
    !curr.delivery &&
    !curr.creditCard
  ) {
    clearCheckoutPersistence();
    prevCheckout = curr;
    return;
  }

  if (getPersistedStep(curr.step) !== getPersistedStep(prevCheckout.step)) {
    saveStep(getPersistedStep(curr.step));
  }
  if (curr.selectedProduct?.id !== prevCheckout.selectedProduct?.id) {
    if (curr.selectedProduct) saveSelectedProductId(curr.selectedProduct.id);
  }
  if (curr.delivery !== prevCheckout.delivery && curr.delivery) {
    saveDelivery(curr.delivery);
  }

  prevCheckout = curr;
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
