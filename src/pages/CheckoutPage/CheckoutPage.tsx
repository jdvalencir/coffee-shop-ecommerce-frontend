import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, Coffee, Moon, Sun } from 'lucide-react';

import { CheckoutContent } from '@/components/checkout/CheckoutContent';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';
import { useTheme } from '@/contexts/ThemeContext';

// ── Main component ────────────────────────────────────────────────────────────

export function CheckoutPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const selectedProduct = useAppSelector((s) => s.checkout.selectedProduct);
  const steps = [
    { label: 'Catalog', done: true, active: false },
    { label: 'Checkout', done: false, active: true },
    { label: 'Summary', done: false, active: false },
    { label: 'Confirmation', done: false, active: false },
  ];

  if (!selectedProduct) return <Navigate to="/" replace />;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Back */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to catalog</span>
          </Button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Coffee className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base font-bold tracking-tight text-foreground">
              Brews &amp; Beans
            </span>
          </div>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={
              theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
            }
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </header>

      {/* ── Progress bar ──────────────────────────────────────────────────── */}
      <div className="border-b border-border/40 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6">
          <ol className="flex items-center gap-1.5 text-xs">
            {steps.map((s, i) => (
              <li key={s.label} className="flex items-center gap-1.5">
                <span
                  className={
                    s.active
                      ? 'font-semibold text-primary'
                      : s.done
                        ? 'text-muted-foreground'
                        : 'text-muted-foreground/40'
                  }
                >
                  {s.label}
                </span>
                {i < steps.length - 1 && (
                  <span className="h-px w-4 bg-border/60" />
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <CheckoutContent onSubmitSuccess={() => navigate('/')} />
      </main>
    </div>
  );
}
