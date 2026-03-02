import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Product, RoastLevel } from '@/types';
import { CreditCard, MapPin, Package } from 'lucide-react';

// ── Roast level visual config ─────────────────────────────────────────────────

const ROAST_CONFIG: Record<
  RoastLevel,
  { label: string; pill: string; dot: string }
> = {
  light: {
    label: 'Light Roast',
    pill: 'bg-amber-100/90 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    dot: 'bg-amber-400',
  },
  medium: {
    label: 'Medium Roast',
    pill: 'bg-orange-100/90 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
    dot: 'bg-orange-500',
  },
  'medium-dark': {
    label: 'Medium Dark',
    pill: 'bg-red-100/90 text-red-900 dark:bg-red-900/40 dark:text-red-300',
    dot: 'bg-red-700',
  },
  dark: {
    label: 'Dark Roast',
    pill: 'bg-stone-900/80 text-stone-100 dark:bg-stone-700/80 dark:text-stone-100',
    dot: 'bg-stone-900 dark:bg-stone-400',
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: Product;
  onBuy: (product: Product) => void;
}

export function ProductCard({ product, onBuy }: ProductCardProps) {
  const roast = ROAST_CONFIG[product.roastLevel];
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;

  return (
    <Card className="group flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 dark:hover:shadow-stone-900/60">
      {/* ── Product image ── */}
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className={cn(
            'h-full w-full object-cover transition-transform duration-500',
            'group-hover:scale-105',
            isOutOfStock && 'opacity-50 grayscale',
          )}
        />

        {/* Roast level pill */}
        <span
          className={cn(
            'absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1',
            'text-xs font-medium backdrop-blur-sm',
            roast.pill,
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', roast.dot)} />
          {roast.label}
        </span>

        {/* Out-of-stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <span className="rounded-full bg-background/90 px-4 py-1.5 text-xs font-semibold text-foreground shadow">
              Out of Stock
            </span>
          </div>
        )}

        {/* Low stock ribbon */}
        {isLowStock && !isOutOfStock && (
          <span className="absolute right-3 top-3 rounded-full bg-destructive px-2.5 py-1 text-xs font-semibold text-destructive-foreground shadow">
            Only {product.stock} left
          </span>
        )}
      </div>

      {/* ── Product info ── */}
      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        {/* Origin & weight */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {product.origin}
          </span>
          <span className="h-3 w-px bg-border" />
          <span className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            {product.weight}g
          </span>
        </div>

        {/* Name */}
        <h3 className="text-base font-semibold leading-snug text-foreground">
          {product.name}
        </h3>

        {/* Description */}
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        {/* Tasting notes */}
        <div className="flex flex-wrap gap-1.5">
          {product.notes.map((note) => (
            <span
              key={note}
              className="rounded-full border border-border/60 bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground"
            >
              {note}
            </span>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price row */}
        <div className="flex items-end justify-between border-t border-border/40 pt-3">
          <div>
            <p className="text-2xl font-bold tracking-tight text-primary">
              ${product.price.toLocaleString('es-CO')}
            </p>
            <p className="text-[11px] text-muted-foreground">COP / 500g bag</p>
          </div>
          {!isLowStock && !isOutOfStock && (
            <p className="text-xs text-muted-foreground">
              {product.stock} in stock
            </p>
          )}
        </div>

        {/* CTA */}
        <Button
          className="w-full"
          size="lg"
          onClick={() => onBuy(product)}
          disabled={isOutOfStock}
        >
          <CreditCard className="h-4 w-4" />
          {isOutOfStock ? 'Out of Stock' : 'Pay with Credit Card'}
        </Button>
      </CardContent>
    </Card>
  );
}
