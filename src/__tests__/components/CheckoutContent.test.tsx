import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import { CheckoutContent } from '@/components/checkout/CheckoutContent';
import { ThemeProvider } from '@/contexts/ThemeContext';
import checkoutReducer from '@/store/slices/checkoutSlice';
import productsReducer from '@/store/slices/productsSlice';
import type { Product } from '@/types';

const selectedProduct: Product = {
  id: 'prod-001',
  name: 'Ethiopian Yirgacheffe',
  description: 'A bright, complex light roast from the birthplace of coffee.',
  price: 65_000,
  stock: 15,
  image: '/static/products/etiopia-yirgacheffe.webp',
  roastLevel: 'light',
  origin: 'Ethiopia',
  weight: 500,
  notes: ['Blueberry', 'Jasmine'],
};

function renderCheckoutContent() {
  const store = configureStore({
    reducer: { products: productsReducer, checkout: checkoutReducer },
    preloadedState: {
      products: { items: [], status: 'idle', error: null },
      checkout: {
        step: 'checkout',
        selectedProduct,
        creditCard: null,
        delivery: null,
        paymentResult: {
          outcome: 'idle',
          status: null,
          transactionId: null,
          message: null,
        },
      },
    },
  });

  return render(
    <Provider store={store}>
      <ThemeProvider>
        <CheckoutContent />
      </ThemeProvider>
    </Provider>,
  );
}

describe('CheckoutContent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows a delivery CTA before the payment summary CTA', async () => {
    renderCheckoutContent();

    expect(
      screen.getByRole('button', { name: /continuar al pago/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /revisar resumen de pago/i }),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/nombre completo/i), {
      target: { value: 'Juan Perez' },
    });
    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: 'juan@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/telefono/i), {
      target: { value: '+57 300 000 0000' },
    });
    fireEvent.change(screen.getByLabelText(/direccion de entrega/i), {
      target: { value: 'Calle 123 #45-67' },
    });
    fireEvent.change(screen.getByLabelText(/ciudad/i), {
      target: { value: 'Bogota' },
    });
    fireEvent.change(screen.getByLabelText(/departamento \/ region/i), {
      target: { value: 'Cundinamarca' },
    });

    fireEvent.click(screen.getByRole('button', { name: /continuar al pago/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/numero de tarjeta/i)).toBeInTheDocument();
    });

    expect(
      screen.getByRole('button', { name: /revisar resumen de pago/i }),
    ).toBeInTheDocument();
  });
});
