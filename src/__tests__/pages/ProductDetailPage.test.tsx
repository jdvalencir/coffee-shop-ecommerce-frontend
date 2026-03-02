import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { fireEvent } from '@testing-library/react';

import { ThemeProvider } from '@/contexts/ThemeContext';
import { ProductDetailPage } from '@/pages/ProductDetailPage/ProductDetailPage';
import productsReducer from '@/store/slices/productsSlice';
import checkoutReducer from '@/store/slices/checkoutSlice';
import { getProductById } from '@/services/productService';

jest.mock('@/services/productService', () => ({
  getProductById: jest.fn(),
}));

jest.mock('@/components/checkout/PaymentSummary', () => ({
  PaymentSummary: () => null,
}));

jest.mock('@/components/checkout/FinalStatus', () => ({
  FinalStatus: () => null,
}));

function renderPage() {
  const store = configureStore({
    reducer: { products: productsReducer, checkout: checkoutReducer },
  });

  return render(
    <Provider store={store}>
      <ThemeProvider>
        <MemoryRouter initialEntries={['/products/prod-001']}>
          <Routes>
            <Route path="/products/:id" element={<ProductDetailPage />} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    </Provider>,
  );
}

describe('ProductDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads the product by route id and opens the checkout modal from buy now', async () => {
    (getProductById as jest.Mock).mockResolvedValueOnce({
      id: 'prod-001',
      name: 'Cafe de Origen 340g',
      description: 'Cafe tostado de origen con notas achocolatadas',
      price: 250000,
      stock: 12,
      image: 'https://cdn.example.com/products/cafe-origen.jpg',
      roastLevel: 'medium',
      origin: 'Huila, Colombia',
      weight: 500,
      notes: ['chocolate', 'caramelo', 'ciruela'],
      createdAt: '2026-03-01T15:30:00.000Z',
    });

    await act(async () => {
      renderPage();
    });

    expect(getProductById).toHaveBeenCalledWith('prod-001');
    expect(
      await screen.findByRole('heading', { name: 'Cafe de Origen 340g' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Huila, Colombia')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /comprar ahora/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Completa tu pedido')).toBeInTheDocument();
    expect(screen.getByText('Pagar')).toBeInTheDocument();
  });
});
