import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Coffee,
  Leaf,
  MapPin,
  Moon,
  Package,
  ShieldCheck,
  Sun,
  Truck,
} from 'lucide-react';

import { CheckoutContent } from '@/components/checkout/CheckoutContent';
import { FinalStatus } from '@/components/checkout/FinalStatus';
import { PaymentSummary } from '@/components/checkout/PaymentSummary';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { getProductById } from '@/services/productService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  clearPaymentResult,
  selectProduct,
  setStep,
} from '@/store/slices/checkoutSlice';
import type { Product, RoastLevel } from '@/types';
import { formatCOP } from '@/utils/formatters';

type LoadState = 'loading' | 'succeeded' | 'failed';

const ROAST_CONFIG: Record<
  RoastLevel,
  { label: string; accent: string; badge: string }
> = {
  light: {
    label: 'Tueste Claro',
    accent: 'from-amber-200/70 via-orange-200/30 to-transparent',
    badge: 'border-amber-300/60 bg-amber-100/80 text-amber-900',
  },
  medium: {
    label: 'Tueste Medio',
    accent: 'from-orange-300/70 via-orange-200/30 to-transparent',
    badge: 'border-orange-300/60 bg-orange-100/80 text-orange-900',
  },
  'medium-dark': {
    label: 'Tueste Medio Oscuro',
    accent: 'from-rose-300/60 via-orange-200/20 to-transparent',
    badge: 'border-rose-300/60 bg-rose-100/80 text-rose-900',
  },
  dark: {
    label: 'Tueste Oscuro',
    accent: 'from-stone-700/50 via-stone-500/20 to-transparent',
    badge: 'border-stone-500/40 bg-stone-900/80 text-stone-100',
  },
};

function formatCreatedAt(value?: string): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'long',
  }).format(date);
}

function ProductSkeleton() {
  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-12">
      <div className="animate-pulse space-y-4">
        <div className="aspect-[4/3] rounded-3xl bg-muted" />
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="h-24 rounded-2xl bg-muted" />
          <div className="h-24 rounded-2xl bg-muted" />
          <div className="h-24 rounded-2xl bg-muted" />
        </div>
      </div>
      <div className="animate-pulse space-y-4 rounded-3xl border border-border/50 bg-card p-6">
        <div className="h-6 w-28 rounded-full bg-muted" />
        <div className="h-10 w-3/4 rounded-xl bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
        <div className="h-16 rounded-2xl bg-muted" />
        <div className="h-12 rounded-2xl bg-muted" />
      </div>
    </main>
  );
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { theme, toggleTheme } = useTheme();
  const hasMissingId = !id;
  const selectedProduct = useAppSelector((state) => state.checkout.selectedProduct);
  const checkoutStep = useAppSelector((state) => state.checkout.step);

  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<{ id: string; message: string } | null>(
    null,
  );
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    let active = true;

    getProductById(id)
      .then((nextProduct) => {
        if (!active) return;
        setProduct(nextProduct);
        setError(null);
      })
      .catch((nextError: Error) => {
        if (!active) return;
        setProduct(null);
        setError({
          id,
          message: nextError.message || 'No se pudo cargar el producto.',
        });
      });

    return () => {
      active = false;
    };
  }, [id]);

  const status: LoadState = hasMissingId
    ? 'failed'
    : error?.id === id
      ? 'failed'
      : product?.id === id
        ? 'succeeded'
        : 'loading';
  const isSummaryOpen = checkoutStep === 'summary' && !!selectedProduct;
  const isStatusOpen = checkoutStep === 'status';

  function handleCheckoutOpenChange(nextOpen: boolean) {
    setIsCheckoutOpen(nextOpen);

    if (!nextOpen && checkoutStep === 'checkout') {
      dispatch(setStep('product'));
    }
  }

  function handleSummaryOpenChange(nextOpen: boolean) {
    if (nextOpen) return;

    dispatch(setStep('checkout'));
    setIsCheckoutOpen(true);
  }

  function handleBuy() {
    if (!product || product.stock === 0) return;

    dispatch(clearPaymentResult());
    dispatch(selectProduct(product));
    dispatch(setStep('checkout'));
    setIsCheckoutOpen(true);
  }

  const createdAtLabel = formatCreatedAt(product?.createdAt);
  const roast = product ? ROAST_CONFIG[product.roastLevel] : null;
  const isOutOfStock = product?.stock === 0;
  const isLowStock = !!product && product.stock > 0 && product.stock <= 5;

  return (
    <div className="min-h-screen bg-background">
      <Dialog
        open={isCheckoutOpen && !!selectedProduct}
        onOpenChange={handleCheckoutOpenChange}
      >
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto border-border/50 bg-background p-0">
          <DialogHeader className="border-b border-border/40 pr-12">
            <DialogTitle>Pagar</DialogTitle>
            <DialogDescription>
              Confirma tus datos de entrega y pago sin salir de la vista del producto.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 sm:p-6">
            <CheckoutContent onSubmitSuccess={() => setIsCheckoutOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>

      <PaymentSummary
        open={isSummaryOpen}
        onOpenChange={handleSummaryOpenChange}
      />

      <FinalStatus open={isStatusOpen} />

      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Button asChild variant="ghost" size="sm" className="gap-1.5">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Volver al catálogo</span>
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Coffee className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base font-bold tracking-tight text-foreground">
              Hispania Coffee
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={
              theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
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

      {status === 'loading' && <ProductSkeleton />}

      {(hasMissingId || status === 'failed') && (
        <main className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6">
          <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-destructive">
              Producto no disponible
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
              No pudimos cargar este café.
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {hasMissingId
                ? 'No se recibió un identificador de producto.'
                : error?.message ??
                  'Inténtalo de nuevo en un momento o vuelve al catálogo.'}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button asChild variant="outline">
                <Link to="/">Volver al catálogo</Link>
              </Button>
              <Button onClick={() => window.location.reload()}>Reintentar</Button>
            </div>
          </div>
        </main>
      )}

      {status === 'succeeded' && product && roast && (
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="space-y-5">
              <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card shadow-sm">
                <div
                  className={cn(
                    'absolute inset-0 bg-linear-to-br opacity-80',
                    roast.accent,
                  )}
                />
                <img
                  src={product.image}
                  alt={product.name}
                  className={cn(
                    'relative aspect-[4/3] w-full object-cover',
                    isOutOfStock && 'grayscale opacity-60',
                  )}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/50 bg-card p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    Origen
                  </div>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {product.origin}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/50 bg-card p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    <Package className="h-3.5 w-3.5" />
                    Peso
                  </div>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {product.weight}g
                  </p>
                </div>
                <div className="rounded-2xl border border-border/50 bg-card p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    <Leaf className="h-3.5 w-3.5" />
                    Perfil
                  </div>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {roast.label}
                  </p>
                </div>
              </div>

              <section className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Notas de cata
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.notes.length > 0 ? (
                    product.notes.map((note) => (
                      <Badge key={note} variant="outline" className="px-3 py-1.5 text-sm">
                        {note}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Este producto todavía no tiene notas de cata.
                    </p>
                  )}
                </div>
              </section>
            </section>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="overflow-hidden rounded-3xl border border-border/50 bg-card shadow-sm">
                <div className="border-b border-border/50 p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={roast.badge}>
                      {roast.label}
                    </Badge>
                    {createdAtLabel && (
                      <Badge variant="secondary" className="px-3 py-1">
                        Agregado {createdAtLabel}
                      </Badge>
                    )}
                  </div>

                  <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    {product.name}
                  </h1>
                  <p className="mt-4 text-base leading-7 text-muted-foreground">
                    {product.description}
                  </p>
                </div>

                <div className="space-y-5 p-6">
                  <div className="rounded-2xl bg-muted/50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      Precio
                    </p>
                    <p className="mt-2 text-4xl font-semibold tracking-tight text-primary">
                      {formatCOP(product.price)}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Pago seguro con entrega local en Colombia.
                    </p>
                  </div>

                  <div className="space-y-3 rounded-2xl border border-border/50 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Inventario</span>
                      <span
                        className={cn(
                          'font-semibold',
                          isOutOfStock
                            ? 'text-destructive'
                            : isLowStock
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-foreground',
                        )}
                      >
                        {isOutOfStock
                          ? 'Agotado'
                          : isLowStock
                            ? `Solo quedan ${product.stock}`
                            : `${product.stock} disponibles`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Envío</span>
                      <span className="font-semibold text-foreground">
                        1 a 3 días hábiles
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Pago</span>
                      <span className="font-semibold text-foreground">
                        Tarjeta
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleBuy}
                    disabled={isOutOfStock}
                  >
                    {isOutOfStock ? 'Agotado' : 'Comprar ahora'}
                  </Button>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border/50 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        Pago protegido
                      </div>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        Los datos del checkout se encriptan y se procesan dentro del flujo de pago.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/50 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Truck className="h-4 w-4 text-primary" />
                        Despacho rápido
                      </div>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        Los lotes recién tostados se preparan para una entrega local rápida.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      )}
    </div>
  );
}
