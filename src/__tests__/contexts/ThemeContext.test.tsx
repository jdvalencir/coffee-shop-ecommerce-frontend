import { render, screen, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

// Helper component to expose context values via text
function ThemeConsumer() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset classList on <html> element
    document.documentElement.classList.remove('dark');
  });

  // ── ThemeProvider ─────────────────────────────────────────────────────────────

  describe('ThemeProvider', () => {
    it('renders children without crashing', () => {
      render(
        <ThemeProvider>
          <p>child</p>
        </ThemeProvider>,
      );
      expect(screen.getByText('child')).toBeInTheDocument();
    });

    it('defaults to "light" theme when localStorage is empty and no system preference', () => {
      // jsdom matchMedia returns false by default
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>,
      );
      expect(screen.getByTestId('theme').textContent).toBe('light');
    });

    it('restores "dark" theme from localStorage', () => {
      localStorage.setItem('bb_theme', 'dark');
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>,
      );
      expect(screen.getByTestId('theme').textContent).toBe('dark');
    });

    it('restores "light" theme from localStorage', () => {
      localStorage.setItem('bb_theme', 'light');
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>,
      );
      expect(screen.getByTestId('theme').textContent).toBe('light');
    });

    it('adds "dark" class to <html> when theme is dark', () => {
      localStorage.setItem('bb_theme', 'dark');
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>,
      );
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('removes "dark" class from <html> when theme is light', () => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('bb_theme', 'light');
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>,
      );
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  // ── toggleTheme ───────────────────────────────────────────────────────────────

  describe('toggleTheme', () => {
    it('switches from light to dark when toggled', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>,
      );
      expect(screen.getByTestId('theme').textContent).toBe('light');

      act(() => {
        screen.getByRole('button', { name: /toggle/i }).click();
      });

      expect(screen.getByTestId('theme').textContent).toBe('dark');
    });

    it('switches from dark to light when toggled', () => {
      localStorage.setItem('bb_theme', 'dark');
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>,
      );
      expect(screen.getByTestId('theme').textContent).toBe('dark');

      act(() => {
        screen.getByRole('button', { name: /toggle/i }).click();
      });

      expect(screen.getByTestId('theme').textContent).toBe('light');
    });

    it('persists the toggled theme to localStorage', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>,
      );
      act(() => {
        screen.getByRole('button', { name: /toggle/i }).click();
      });
      expect(localStorage.getItem('bb_theme')).toBe('dark');
    });

    it('updates <html> class when toggled to dark', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>,
      );
      act(() => {
        screen.getByRole('button', { name: /toggle/i }).click();
      });
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('double-toggle returns to original theme', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>,
      );
      act(() => {
        screen.getByRole('button', { name: /toggle/i }).click();
      });
      act(() => {
        screen.getByRole('button', { name: /toggle/i }).click();
      });
      expect(screen.getByTestId('theme').textContent).toBe('light');
    });
  });

  // ── useTheme outside provider ─────────────────────────────────────────────────

  describe('useTheme', () => {
    it('throws when used outside ThemeProvider', () => {
      // Suppress the React error boundary console output during this test
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      function BadConsumer() {
        useTheme();
        return null;
      }

      expect(() => render(<BadConsumer />)).toThrow(
        'useTheme must be used within ThemeProvider',
      );

      consoleSpy.mockRestore();
    });
  });
});
