jest.mock('@/services/productService', () => ({
  getProducts: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/components/checkout/PaymentSummary', () => ({
  PaymentSummary: () => null,
}));

jest.mock('@/components/checkout/FinalStatus', () => ({
  FinalStatus: () => null,
}));

import { act, render, screen } from '@testing-library/react';
import App from '@/App';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders without crashing', async () => {
    await act(async () => {
      expect(() => render(<App />)).not.toThrow();
    });
  });

  it('renders the ProductPage at the root route by default', async () => {
    await act(async () => {
      render(<App />);
    });
    // ProductPage renders the brand name in the header
    expect(screen.getByText('Brews & Beans')).toBeInTheDocument();
  });

  it('renders a theme toggle button', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(
      screen.getByRole('button', { name: /switch to dark mode/i }),
    ).toBeInTheDocument();
  });
});
