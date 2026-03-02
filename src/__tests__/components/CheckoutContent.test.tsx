import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import type { PreloadedState } from '@reduxjs/toolkit';

import { CheckoutContent } from '@/components/checkout/CheckoutContent';
import { ThemeProvider } from '@/contexts/ThemeContext';
import checkoutReducer from '@/store/slices/checkoutSlice';
import productsReducer from '@/store/slices/productsSlice';
import type { Product } from '@/types';

jest.mock('@/services/productService', () => ({
  getProducts: jest.fn(),
}));

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

type TestRootState = {
  products: {
    items: Product[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
  };
  checkout: {
    step: 'product' | 'checkout' | 'summary' | 'status';
    selectedProduct: Product | null;
    creditCard: {
      number: string;
      holderName: string;
      expiry: string;
      cvv: string;
    } | null;
    delivery: {
      fullName: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      department: string;
    } | null;
    paymentResult: {
      outcome: 'idle' | 'pending' | 'success' | 'error';
      status: 'pending' | 'approved' | 'declined' | 'error' | null;
      transactionId: string | null;
      message: string | null;
    };
  };
};

function renderCheckoutContent(
  options?: {
    onSubmitSuccess?: jest.Mock;
    preloadedState?: PreloadedState<TestRootState>;
  },
) {
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
      ...options?.preloadedState,
    },
  });

  const view = render(
    <Provider store={store}>
      <ThemeProvider>
        <CheckoutContent onSubmitSuccess={options?.onSubmitSuccess} />
      </ThemeProvider>
    </Provider>,
  );

  return { store, ...view };
}

function fillDeliveryForm() {
  fireEvent.change(screen.getByLabelText(/nombre completo/i), {
    target: { value: 'Juan Perez' },
  });
  fireEvent.change(screen.getByLabelText(/^email$/i), {
    target: { value: 'juan@example.com' },
  });
  fireEvent.change(screen.getByLabelText(/tel[eé]fono/i), {
    target: { value: '+57 300 000 0000' },
  });
  fireEvent.change(screen.getByLabelText(/direcci[oó]n de entrega/i), {
    target: { value: 'Calle 123 #45-67' },
  });
  fireEvent.change(screen.getByLabelText(/ciudad/i), {
    target: { value: 'Bogota' },
  });
  fireEvent.change(screen.getByLabelText(/departamento \/ regi[oó]n/i), {
    target: { value: 'Cundinamarca' },
  });
}

function fillPaymentForm() {
  fireEvent.change(screen.getByPlaceholderText('1234 5678 9012 3456'), {
    target: { value: '4242 4242 4242 4242' },
  });
  fireEvent.change(screen.getByPlaceholderText('Como aparece en tu tarjeta'), {
    target: { value: 'Juan Perez' },
  });
  fireEvent.change(screen.getByPlaceholderText('MM/AA'), {
    target: { value: '12/50' },
  });
  fireEvent.change(screen.getByPlaceholderText('•••'), {
    target: { value: '123' },
  });
}

describe('CheckoutContent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders nothing when there is no selected product', () => {
    const { container } = renderCheckoutContent({
      preloadedState: {
        checkout: {
          step: 'checkout',
          selectedProduct: null,
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

    expect(container).toBeEmptyDOMElement();
  });

  it('shows a delivery CTA before the payment summary CTA', async () => {
    renderCheckoutContent();

    expect(
      screen.getByRole('button', { name: /continuar al pago/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /revisar resumen de pago/i }),
    ).not.toBeInTheDocument();

    fillDeliveryForm();

    fireEvent.click(screen.getByRole('button', { name: /continuar al pago/i }));

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('1234 5678 9012 3456'),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole('button', { name: /revisar resumen de pago/i }),
    ).toBeInTheDocument();
  });

  it('keeps the user on delivery and shows validation errors when delivery is invalid', async () => {
    renderCheckoutContent();

    fireEvent.click(screen.getByRole('button', { name: /continuar al pago/i }));

    expect(
      await screen.findByText(/el nombre completo debe tener al menos 2 caracteres/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText('1234 5678 9012 3456'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/primero completa tus datos de entrega para continuar a la tarjeta/i),
    ).toBeInTheDocument();
  });

  it('keeps the user on payment and shows payment errors on invalid submit', async () => {
    renderCheckoutContent();

    fillDeliveryForm();
    fireEvent.click(screen.getByRole('button', { name: /continuar al pago/i }));

    await screen.findByPlaceholderText('1234 5678 9012 3456');

    fireEvent.click(screen.getByRole('button', { name: /revisar resumen de pago/i }));

    expect(await screen.findByText(/el n[uú]mero de tarjeta es obligatorio/i)).toBeInTheDocument();
    expect(
      screen.getByText(/al confirmar, aceptas continuar con una transacci[oó]n segura de prueba/i),
    ).toBeInTheDocument();
  });

  it('submits valid delivery and payment data and advances to the summary step', async () => {
    const onSubmitSuccess = jest.fn();
    const { store } = renderCheckoutContent({ onSubmitSuccess });

    fillDeliveryForm();
    fireEvent.click(screen.getByRole('button', { name: /continuar al pago/i }));

    await screen.findByPlaceholderText('1234 5678 9012 3456');

    fillPaymentForm();
    fireEvent.click(screen.getByRole('button', { name: /revisar resumen de pago/i }));

    await waitFor(() => {
      expect(store.getState().checkout.step).toBe('summary');
    });

    expect(store.getState().checkout.delivery).toEqual({
      fullName: 'Juan Perez',
      email: 'juan@example.com',
      phone: '+57 300 000 0000',
      address: 'Calle 123 #45-67',
      city: 'Bogota',
      department: 'Cundinamarca',
    });
    expect(store.getState().checkout.creditCard).toEqual({
      number: '4242424242424242',
      holderName: 'JUAN PEREZ',
      expiry: '12/50',
      cvv: '123',
    });
    expect(onSubmitSuccess).toHaveBeenCalledTimes(1);
  });

  it('hides the product image when the image fails to load', () => {
    renderCheckoutContent();

    const productImage = screen.getByAltText(selectedProduct.name);
    fireEvent.error(productImage);

    expect(productImage).toHaveStyle({ display: 'none' });
  });
});
