import { render, screen, fireEvent } from '@testing-library/react';
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

  beforeEach(() => {
    onBuy.mockClear();
  });

  // ── Content rendering ────────────────────────────────────────────────────────

  it('renders the product name', () => {
    render(<ProductCard product={baseProduct} onBuy={onBuy} />);
    expect(screen.getByText('Ethiopian Yirgacheffe')).toBeInTheDocument();
  });

  it('renders the product origin', () => {
    render(<ProductCard product={baseProduct} onBuy={onBuy} />);
    expect(screen.getByText('Ethiopia')).toBeInTheDocument();
  });

  it('renders the product weight in grams', () => {
    render(<ProductCard product={baseProduct} onBuy={onBuy} />);
    expect(screen.getByText('500g')).toBeInTheDocument();
  });

  it('renders the product description', () => {
    render(<ProductCard product={baseProduct} onBuy={onBuy} />);
    expect(
      screen.getByText(
        'A bright, complex light roast from the birthplace of coffee.',
      ),
    ).toBeInTheDocument();
  });

  it('renders all tasting notes as chips', () => {
    render(<ProductCard product={baseProduct} onBuy={onBuy} />);
    expect(screen.getByText('Blueberry')).toBeInTheDocument();
    expect(screen.getByText('Jasmine')).toBeInTheDocument();
  });

  it('renders the product image with correct alt text', () => {
    render(<ProductCard product={baseProduct} onBuy={onBuy} />);
    const img = screen.getByRole('img', { name: 'Ethiopian Yirgacheffe' });
    expect(img).toBeInTheDocument();
  });

  // ── Roast level labels ────────────────────────────────────────────────────────

  it('shows "Light Roast" pill for light roast level', () => {
    render(<ProductCard product={baseProduct} onBuy={onBuy} />);
    expect(screen.getByText('Light Roast')).toBeInTheDocument();
  });

  it('shows "Medium Roast" pill for medium roast level', () => {
    render(
      <ProductCard product={{ ...baseProduct, roastLevel: 'medium' }} onBuy={onBuy} />,
    );
    expect(screen.getByText('Medium Roast')).toBeInTheDocument();
  });

  it('shows "Medium Dark" pill for medium-dark roast level', () => {
    render(
      <ProductCard
        product={{ ...baseProduct, roastLevel: 'medium-dark' }}
        onBuy={onBuy}
      />,
    );
    expect(screen.getByText('Medium Dark')).toBeInTheDocument();
  });

  it('shows "Dark Roast" pill for dark roast level', () => {
    render(
      <ProductCard product={{ ...baseProduct, roastLevel: 'dark' }} onBuy={onBuy} />,
    );
    expect(screen.getByText('Dark Roast')).toBeInTheDocument();
  });

  // ── Stock states ──────────────────────────────────────────────────────────────

  it('shows stock count text when stock is above 5', () => {
    render(<ProductCard product={baseProduct} onBuy={onBuy} />);
    expect(screen.getByText('15 in stock')).toBeInTheDocument();
  });

  it('shows "Only X left" badge when stock is between 1 and 5', () => {
    render(
      <ProductCard product={{ ...baseProduct, stock: 3 }} onBuy={onBuy} />,
    );
    expect(screen.getByText('Only 3 left')).toBeInTheDocument();
  });

  it('shows "Only 5 left" at the boundary (stock = 5)', () => {
    render(
      <ProductCard product={{ ...baseProduct, stock: 5 }} onBuy={onBuy} />,
    );
    expect(screen.getByText('Only 5 left')).toBeInTheDocument();
  });

  it('shows "Out of Stock" overlay when stock is 0', () => {
    render(
      <ProductCard product={{ ...baseProduct, stock: 0 }} onBuy={onBuy} />,
    );
    // "Out of Stock" appears in both the overlay span and the disabled button
    const allOutOfStock = screen.getAllByText('Out of Stock');
    expect(allOutOfStock.length).toBeGreaterThanOrEqual(1);
    expect(allOutOfStock[0]).toBeInTheDocument();
  });

  it('disables the button when stock is 0', () => {
    render(
      <ProductCard product={{ ...baseProduct, stock: 0 }} onBuy={onBuy} />,
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  // ── CTA button behaviour ──────────────────────────────────────────────────────

  it('renders "Pay with Credit Card" button when product is in stock', () => {
    render(<ProductCard product={baseProduct} onBuy={onBuy} />);
    expect(
      screen.getByRole('button', { name: /pay with credit card/i }),
    ).toBeInTheDocument();
  });

  it('calls onBuy with the product when the button is clicked', () => {
    render(<ProductCard product={baseProduct} onBuy={onBuy} />);
    fireEvent.click(screen.getByRole('button', { name: /pay with credit card/i }));
    expect(onBuy).toHaveBeenCalledTimes(1);
    expect(onBuy).toHaveBeenCalledWith(baseProduct);
  });

  it('does not call onBuy when the product is out of stock', () => {
    render(
      <ProductCard product={{ ...baseProduct, stock: 0 }} onBuy={onBuy} />,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onBuy).not.toHaveBeenCalled();
  });

  it('does not show stock count text when stock is low (1–5)', () => {
    render(
      <ProductCard product={{ ...baseProduct, stock: 2 }} onBuy={onBuy} />,
    );
    // "X in stock" text should not appear — only the "Only X left" badge
    expect(screen.queryByText('2 in stock')).not.toBeInTheDocument();
  });
});
