import './App.css';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { store } from '@/store/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { rehydrateSelectedProduct } from '@/store/slices/checkoutSlice';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ProductPage } from '@/pages/ProductPage/ProductPage';
import { loadSelectedProductId } from '@/utils/persistence';

// ── Rehydration layer ─────────────────────────────────────────────────────────
// Once products load from API/mock, restore the previously selected product
// from localStorage so a page refresh doesn't break the checkout flow.

function RehydrationLayer() {
  const dispatch = useAppDispatch();
  const products = useAppSelector((s) => s.products.items);
  const selectedProduct = useAppSelector((s) => s.checkout.selectedProduct);

  useEffect(() => {
    if (products.length === 0 || selectedProduct !== null) return;
    const savedId = loadSelectedProductId();
    if (!savedId) return;
    const found = products.find((p) => p.id === savedId);
    if (found) dispatch(rehydrateSelectedProduct(found));
  }, [products, selectedProduct, dispatch]);

  return null;
}

// ── Placeholder pages (Steps 2-4 — implemented in future iterations) ──────────

function CheckoutPage() {
  return (
    <div className="flex min-h-screen items-center justify-center text-muted-foreground">
      Checkout — coming in Step 2
    </div>
  );
}

// ── Routing ───────────────────────────────────────────────────────────────────

function AppRoutes() {
  return (
    <>
      <RehydrationLayer />
      <Routes>
        <Route path="/" element={<ProductPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}
