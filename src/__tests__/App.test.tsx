jest.mock('@/services/productService', () => ({
  getProducts: jest.fn().mockResolvedValue([]),
}));

import { render, screen } from '@testing-library/react';
import App from '@/App';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders without crashing', () => {
    expect(() => render(<App />)).not.toThrow();
  });

  it('renders the ProductPage at the root route by default', () => {
    render(<App />);
    // ProductPage renders the brand name in the header
    expect(screen.getByText('Brews & Beans')).toBeInTheDocument();
  });

  it('renders a theme toggle button', () => {
    render(<App />);
    expect(
      screen.getByRole('button', { name: /switch to dark mode/i }),
    ).toBeInTheDocument();
  });
});
