import { render, screen, fireEvent, within, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

import { ProductPage } from '@/pages/ProductPage/ProductPage';
import { ThemeProvider } from '@/contexts/ThemeContext';
import productsReducer from '@/store/slices/productsSlice';
import checkoutReducer from '@/store/slices/checkoutSlice';
import { mockProducts } from '@/mock/products';
import { getProducts } from '@/services/productService';

jest.mock('@/services/productService', () => ({
  getProducts: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/components/checkout/PaymentSummary', () => ({
  PaymentSummary: () => null,
}));

jest.mock('@/components/checkout/FinalStatus', () => ({
  FinalStatus: () => null,
}));

type ProductsStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

function renderPage(status: ProductsStatus = 'succeeded', error: string | null = null) {
  const store = configureStore({
    reducer: { products: productsReducer, checkout: checkoutReducer },
    preloadedState: {
      products: { items: status === 'succeeded' ? mockProducts : [], status, error },
    },
  });
  return render(
    <Provider store={store}>
      <ThemeProvider>
        <MemoryRouter>
          <ProductPage />
        </MemoryRouter>
      </ThemeProvider>
    </Provider>,
  );
}

function getCatalog() {
  return screen.getByRole('main');
}

describe('ProductPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the brand name in the header', () => {
    renderPage();
    expect(screen.getByText('Hispania Coffee')).toBeInTheDocument();
  });

  it('renders the dark/light mode toggle button', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /cambiar a modo (oscuro|claro)/i })).toBeInTheDocument();
  });

  it('toggles the theme when the toggle button is clicked', () => {
    renderPage();
    const toggle = screen.getByRole('button', { name: /cambiar a modo (oscuro|claro)/i });
    const nextMode = /modo oscuro/i.test(toggle.getAttribute('aria-label') ?? '') ? /modo claro/i : /modo oscuro/i;
    fireEvent.click(toggle);
    expect(screen.getByRole('button', { name: nextMode })).toBeInTheDocument();
  });

  it('renders product cards in the catalog when status is "succeeded"', () => {
    renderPage();
    const main = getCatalog();
    expect(within(main).getByText('Ethiopian Yirgacheffe')).toBeInTheDocument();
    expect(within(main).getByText('Brazil Santos')).toBeInTheDocument();
  });

  it('renders the collection heading and product count', () => {
    renderPage();
    expect(screen.getByText('Nuestra colección')).toBeInTheDocument();
    expect(screen.getByText('6 de 6 productos')).toBeInTheDocument();
  });

  it('renders loading skeletons when status is "loading"', () => {
    renderPage('loading');
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows an error message when status is "failed"', () => {
    renderPage('failed', 'Network Error');
    expect(screen.getByText('No se pudieron cargar los productos')).toBeInTheDocument();
    expect(screen.getByText('Network Error')).toBeInTheDocument();
  });

  it('renders a "Reintentar" button in failed state', () => {
    renderPage('failed', 'Error');
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
  });

  it('shows all products in the catalog with the default "Todos" filter', () => {
    renderPage();
    const main = getCatalog();
    expect(within(main).getByText('Ethiopian Yirgacheffe')).toBeInTheDocument();
    expect(within(main).getByText('Sumatra Mandheling')).toBeInTheDocument();
  });

  it('filters catalog to light roast only', () => {
    renderPage();
    fireEvent.click(screen.getByText('Claro'));
    const main = getCatalog();
    expect(within(main).getByText('Ethiopian Yirgacheffe')).toBeInTheDocument();
    expect(within(main).queryByText('Sumatra Mandheling')).not.toBeInTheDocument();
  });

  it('filters catalog to medium roast only', () => {
    renderPage();
    fireEvent.click(screen.getByText('Medio'));
    const main = getCatalog();
    expect(within(main).getByText('Brazil Santos')).toBeInTheDocument();
    expect(within(main).queryByText('Sumatra Mandheling')).not.toBeInTheDocument();
  });

  it('filters catalog to dark roast only', () => {
    renderPage();
    fireEvent.click(screen.getByText('Oscuro'));
    const main = getCatalog();
    expect(within(main).getByText('Sumatra Mandheling')).toBeInTheDocument();
    expect(within(main).queryByText('Brazil Santos')).not.toBeInTheDocument();
  });

  it('filters catalog to medium-dark roast only', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Medio Oscuro' }));
    const main = getCatalog();
    expect(within(main).getByText('Guatemala Antigua')).toBeInTheDocument();
    expect(within(main).queryByText('Sumatra Mandheling')).not.toBeInTheDocument();
  });

  it('filters catalog by product name via search', () => {
    renderPage();
    fireEvent.change(screen.getByPlaceholderText(/buscar por nombre/i), { target: { value: 'Sumatra' } });
    const main = getCatalog();
    expect(within(main).getByText('Sumatra Mandheling')).toBeInTheDocument();
    expect(within(main).queryByText('Brazil Santos')).not.toBeInTheDocument();
  });

  it('filters catalog by origin via search', () => {
    renderPage();
    fireEvent.change(screen.getByPlaceholderText(/buscar por nombre/i), { target: { value: 'Brazil' } });
    const main = getCatalog();
    expect(within(main).getByText('Brazil Santos')).toBeInTheDocument();
    expect(within(main).queryByText('Sumatra Mandheling')).not.toBeInTheDocument();
  });

  it('filters catalog by tasting note via search', () => {
    renderPage();
    fireEvent.change(screen.getByPlaceholderText(/buscar por nombre/i), { target: { value: 'Blueberry' } });
    const main = getCatalog();
    expect(within(main).getByText('Ethiopian Yirgacheffe')).toBeInTheDocument();
    expect(within(main).queryByText('Brazil Santos')).not.toBeInTheDocument();
  });

  it('shows "No products found" when search has no matches', () => {
    renderPage();
    fireEvent.change(screen.getByPlaceholderText(/buscar por nombre/i), { target: { value: 'xyznotfound123' } });
    expect(screen.getByText('No se encontraron productos')).toBeInTheDocument();
  });

  it('clears search and filter when "Clear filters" is clicked', () => {
    renderPage();
    fireEvent.change(screen.getByPlaceholderText(/buscar por nombre/i), { target: { value: 'xyznotfound' } });
    fireEvent.click(screen.getByRole('button', { name: /limpiar filtros/i }));
    expect(within(getCatalog()).getByText('Ethiopian Yirgacheffe')).toBeInTheDocument();
  });

  it('opens the checkout modal when a catalog product card buy button is clicked', () => {
    renderPage();
    const buyButtons = within(getCatalog()).getAllByRole('button', { name: /pagar con tarjeta/i });
    fireEvent.click(buyButtons[0]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Completa tu pedido')).toBeInTheDocument();
    expect(screen.getByText('Pagar')).toBeInTheDocument();
  });

  it('opens the checkout modal when the hero main banner is clicked', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /comprar kenya aa/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('opens the checkout modal when hero "Buy Sumatra Mandheling" is clicked', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /comprar sumatra mandheling/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('opens the checkout modal when hero "Buy Guatemala Antigua" is clicked', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /comprar guatemala antigua/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders the footer copyright text', () => {
    renderPage();
    expect(screen.getByText(/hispania coffee.*todos los derechos reservados/i)).toBeInTheDocument();
  });

  it('renders trust badges', () => {
    renderPage();
    expect(screen.getByText('Tostado en lotes pequeños')).toBeInTheDocument();
    expect(screen.getByText('Pagos seguros')).toBeInTheDocument();
    expect(screen.getByText('Entrega rápida')).toBeInTheDocument();
    expect(screen.getByText('100% origen único')).toBeInTheDocument();
  });

  it('dispatches fetchProducts when status is idle', async () => {
    const mockedGetProducts = getProducts as jest.Mock;
    mockedGetProducts.mockResolvedValueOnce(mockProducts);
    await act(async () => { renderPage('idle'); });
    expect(mockedGetProducts).toHaveBeenCalled();
  });
});
