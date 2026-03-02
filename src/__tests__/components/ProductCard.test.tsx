import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProductCard } from '@/components/product/ProductCard';
import type { Product } from '@/types';

const baseProduct: Product = {
  id: 'prod-001',
  name: 'Ethiopian Yirgacheffe',
  description: 'A bright, complex light roast from the birthplace of coffee.',
  price: 65_000,
  stock: 15,
  image: 'http://example.com/img.jpg',
  roastLevel: 'light',
  origin: 'Ethiopia',
  weight: 500,
  notes: ['Blueberry', 'Jasmine'],
};

describe('ProductCard', () => {
  const onBuy = jest.fn();

  function renderCard(product: Product = baseProduct) {
    return render(
      <MemoryRouter>
        <ProductCard product={product} onBuy={onBuy} />
      </MemoryRouter>,
    );
  }

  beforeEach(() => {
    onBuy.mockClear();
  });

  // ── Content rendering ────────────────────────────────────────────────────────

  it('renders the product name', () => {
    renderCard();
    expect(screen.getByText('Ethiopian Yirgacheffe')).toBeInTheDocument();
  });

  it('renders the product origin', () => {
    renderCard();
    expect(screen.getByText('Ethiopia')).toBeInTheDocument();
  });

  it('renders the product weight in grams', () => {
    renderCard();
    expect(screen.getByText('500g')).toBeInTheDocument();
  });

  it('renders the product description', () => {
    renderCard();
    expect(
      screen.getByText(
        'A bright, complex light roast from the birthplace of coffee.',
      ),
    ).toBeInTheDocument();
  });

  it('renders all tasting notes as chips', () => {
    renderCard();
    expect(screen.getByText('Blueberry')).toBeInTheDocument();
    expect(screen.getByText('Jasmine')).toBeInTheDocument();
  });

  it('renders the product image with correct alt text', () => {
    renderCard();
    const img = screen.getByRole('img', { name: 'Ethiopian Yirgacheffe' });
    expect(img).toBeInTheDocument();
  });

  // ── Roast level labels ────────────────────────────────────────────────────────

  it('shows "Tueste Claro" pill for light roast level', () => {
    renderCard();
    expect(screen.getByText('Tueste Claro')).toBeInTheDocument();
  });

  it('shows "Tueste Medio" pill for medium roast level', () => {
    renderCard({ ...baseProduct, roastLevel: 'medium' });
    expect(screen.getByText('Tueste Medio')).toBeInTheDocument();
  });

  it('shows "Tueste Medio Oscuro" pill for medium-dark roast level', () => {
    renderCard({ ...baseProduct, roastLevel: 'medium-dark' });
    expect(screen.getByText('Tueste Medio Oscuro')).toBeInTheDocument();
  });

  it('shows "Tueste Oscuro" pill for dark roast level', () => {
    renderCard({ ...baseProduct, roastLevel: 'dark' });
    expect(screen.getByText('Tueste Oscuro')).toBeInTheDocument();
  });

  // ── Stock states ──────────────────────────────────────────────────────────────

  it('shows stock count text when stock is above 5', () => {
    renderCard();
    expect(screen.getByText('15 disponibles')).toBeInTheDocument();
  });

  it('shows "Solo quedan X" badge when stock is between 1 and 5', () => {
    renderCard({ ...baseProduct, stock: 3 });
    expect(screen.getByText('Solo quedan 3')).toBeInTheDocument();
  });

  it('shows "Solo quedan 5" at the boundary (stock = 5)', () => {
    renderCard({ ...baseProduct, stock: 5 });
    expect(screen.getByText('Solo quedan 5')).toBeInTheDocument();
  });

  it('shows "Agotado" overlay when stock is 0', () => {
    renderCard({ ...baseProduct, stock: 0 });
    const allOutOfStock = screen.getAllByText('Agotado');
    expect(allOutOfStock.length).toBeGreaterThanOrEqual(1);
    expect(allOutOfStock[0]).toBeInTheDocument();
  });

  it('disables the button when stock is 0', () => {
    renderCard({ ...baseProduct, stock: 0 });
    const button = screen.getByRole('button', { name: /agotado/i });
    expect(button).toBeDisabled();
  });

  // ── CTA button behaviour ──────────────────────────────────────────────────────

  it('renders "Pagar con tarjeta" button when product is in stock', () => {
    renderCard();
    expect(
      screen.getByRole('button', { name: /pagar con tarjeta/i }),
    ).toBeInTheDocument();
  });

  it('calls onBuy with the product when the button is clicked', () => {
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: /pagar con tarjeta/i }));
    expect(onBuy).toHaveBeenCalledTimes(1);
    expect(onBuy).toHaveBeenCalledWith(baseProduct);
  });

  it('does not call onBuy when the product is out of stock', () => {
    renderCard({ ...baseProduct, stock: 0 });
    fireEvent.click(screen.getByRole('button', { name: /agotado/i }));
    expect(onBuy).not.toHaveBeenCalled();
  });

  it('does not show stock count text when stock is low (1–5)', () => {
    renderCard({ ...baseProduct, stock: 2 });
    // "X in stock" text should not appear — only the "Only X left" badge
    expect(screen.queryByText('2 disponibles')).not.toBeInTheDocument();
  });
});
