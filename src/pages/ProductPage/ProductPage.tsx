import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Coffee,
  Flame,
  Leaf,
  Moon,
  Search,
  ShieldCheck,
  Sun,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";

import { CheckoutContent } from "@/components/checkout/CheckoutContent";
import { FinalStatus } from "@/components/checkout/FinalStatus";
import { PaymentSummary } from "@/components/checkout/PaymentSummary";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearPaymentResult,
  selectProduct,
  setStep,
} from "@/store/slices/checkoutSlice";
import { fetchProducts } from "@/store/slices/productsSlice";
import type { Product, RoastLevel } from "@/types";
import { formatCOP } from "@/utils/formatters";

// ── Types ─────────────────────────────────────────────────────────────────────

type FilterId = "all" | RoastLevel;

// ── Constants ─────────────────────────────────────────────────────────────────

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "light", label: "Claro" },
  { id: "medium", label: "Medio" },
  { id: "medium-dark", label: "Medio Oscuro" },
  { id: "dark", label: "Oscuro" },
];

interface TrustBadge {
  icon: LucideIcon;
  title: string;
  sub: string;
}

const TRUST_BADGES: TrustBadge[] = [
  { icon: Flame, title: "Tostado en lotes pequeños", sub: "Lotes frescos cada semana" },
  { icon: Leaf, title: "100% origen único", sub: "6 regiones cafeteras premium" },
  {
    icon: ShieldCheck,
    title: "Pagos seguros",
    sub: "Encriptados y listos para la pasarela",
  },
  { icon: Truck, title: "Entrega rápida", sub: "1 a 3 días hábiles" },
];

const ROAST_LABELS: Record<RoastLevel, string> = {
  light: "Tueste Claro",
  medium: "Tueste Medio",
  "medium-dark": "Tueste Medio Oscuro",
  dark: "Tueste Oscuro",
};

// ── Sub-components ────────────────────────────────────────────────────────────

function ProductCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-border/50 bg-card">
      <div className="aspect-square w-full bg-muted" />
      <div className="space-y-3 p-4">
        <div className="flex gap-3">
          <div className="h-3 w-20 rounded-full bg-muted" />
          <div className="h-3 w-12 rounded-full bg-muted" />
        </div>
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-2/3 rounded bg-muted" />
        <div className="flex gap-1.5">
          <div className="h-5 w-16 rounded-full bg-muted" />
          <div className="h-5 w-14 rounded-full bg-muted" />
          <div className="h-5 w-16 rounded-full bg-muted" />
        </div>
        <div className="flex items-end justify-between border-t border-border/40 pt-3">
          <div className="h-7 w-24 rounded bg-muted" />
          <div className="h-3 w-14 rounded bg-muted" />
        </div>
        <div className="h-12 w-full rounded-xl bg-muted" />
      </div>
    </div>
  );
}

function HeroSkeleton() {
  return (
    <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-3 lg:min-h-0">
      <div className="animate-pulse overflow-hidden rounded-2xl bg-muted lg:col-span-2 lg:h-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:min-h-0 lg:grid-cols-1">
        <div className="animate-pulse min-h-36 rounded-2xl bg-muted lg:min-h-0" />
        <div className="animate-pulse min-h-36 rounded-2xl bg-muted lg:min-h-0" />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ProductPage() {
  const dispatch = useAppDispatch();
  const { theme, toggleTheme } = useTheme();

  const { items: products, status, error } = useAppSelector((s) => s.products);
  const selectedProduct = useAppSelector((s) => s.checkout.selectedProduct);
  const checkoutStep = useAppSelector((s) => s.checkout.step);

  const [activeFilter, setActiveFilter] = useState<FilterId>("all");
  const [search, setSearch] = useState("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const isSummaryOpen = checkoutStep === "summary" && !!selectedProduct;
  const isStatusOpen = checkoutStep === "status";

  useEffect(() => {
    if (status === "idle") dispatch(fetchProducts());
  }, [status, dispatch]);

  function handleCheckoutOpenChange(nextOpen: boolean) {
    setIsCheckoutOpen(nextOpen);

    if (!nextOpen && checkoutStep === "checkout") {
      dispatch(setStep("product"));
    }
  }

  function handleSummaryOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      return;
    }

    dispatch(setStep("checkout"));
    setIsCheckoutOpen(true);
  }

  function handleBuy(product: Product) {
    dispatch(clearPaymentResult());
    dispatch(selectProduct(product));
    dispatch(setStep("checkout"));
    setIsCheckoutOpen(true);
  }

  const filtered = products.filter((p) => {
    const matchesRoast =
      activeFilter === "all" || p.roastLevel === activeFilter;
    const matchesSearch =
      search.trim() === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.origin.toLowerCase().includes(search.toLowerCase()) ||
      p.notes.some((n) => n.toLowerCase().includes(search.toLowerCase()));
    return matchesRoast && matchesSearch;
  });
  const heroPool =
    filtered.length >= 3 ? filtered : products.length >= 3 ? products : filtered;
  const heroSource = [...heroPool]
    .sort((a, b) => a.stock - b.stock || a.price - b.price)
    .slice(0, 3);
  const [heroMain, ...heroSides] = heroSource;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <Dialog
        open={isCheckoutOpen && !!selectedProduct}
        onOpenChange={handleCheckoutOpenChange}
      >
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto border-border/50 bg-background p-0">
          <DialogHeader className="border-b border-border/40 pr-12">
            <DialogTitle>Pagar</DialogTitle>
            <DialogDescription>
              Confirma tus datos de entrega y pago sin salir del catálogo.
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

      <div className="min-h-screen bg-background">
      {/* ══════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
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
              theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
            }
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════
          HERO — NextMerce-style grid
      ══════════════════════════════════════════════ */}
      <section className="border-b border-border/40 bg-muted/20 dark:bg-stone-950/40">
        <div className="mx-auto flex max-w-7xl flex-col px-4 py-4 sm:px-6 sm:py-6 lg:min-h-[calc(100vh-3.5rem)]">
          {status === "loading" && <HeroSkeleton />}

          {status !== "loading" && heroMain && (
            <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-3 lg:min-h-0">
              <div
                className={cn(
                  "group relative min-h-[26rem] cursor-pointer overflow-hidden rounded-2xl sm:min-h-[30rem] lg:col-span-2 lg:h-full lg:min-h-0",
                )}
                onClick={() => handleBuy(heroMain)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleBuy(heroMain)}
                aria-label={`Comprar ${heroMain.name}`}
              >
                <img
                  src={heroMain.image}
                  alt={`${heroMain.name} cafe`}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-r from-stone-950/92 via-stone-950/55 to-stone-950/10" />
                <div className="absolute inset-0 bg-linear-to-t from-stone-950/40 via-transparent to-transparent" />

                <div className="relative z-10 flex h-full flex-col justify-between p-4 sm:p-6 md:p-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-400 backdrop-blur-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      Destacado del catálogo
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-medium text-white/70 backdrop-blur-sm">
                      {ROAST_LABELS[heroMain.roastLevel]}
                    </span>
                  </div>

                  <div>
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-amber-400/80">
                      {heroMain.origin} · Bolsa de {heroMain.weight}g
                    </p>
                    <h2 className="mb-3 max-w-lg text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-[42px]">
                      {heroMain.name}
                    </h2>
                    <p className="mb-5 max-w-xl text-sm leading-relaxed text-white/70 sm:text-[15px]">
                      {heroMain.description}
                    </p>

                    <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                      <Button
                        size="lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuy(heroMain);
                        }}
                        className="w-full shadow-lg shadow-primary/25 sm:w-auto"
                      >
                        Pagar con tarjeta
                      </Button>
                      <span className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-center text-sm font-bold text-white backdrop-blur-sm sm:w-auto sm:text-left">
                        {formatCOP(heroMain.price)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:min-h-0 lg:grid-cols-1">
                {heroSides.map((product) => {
                  const badgeText =
                    product.stock <= 5
                      ? `Solo quedan ${product.stock}`
                      : product.roastLevel === "medium"
                        ? "Más vendido"
                        : "Selección fresca";

                  return (
                    <div
                      key={product.id}
                      className="group relative min-h-44 cursor-pointer overflow-hidden rounded-2xl sm:min-h-48 lg:min-h-0"
                      onClick={() => handleBuy(product)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && handleBuy(product)}
                      aria-label={`Comprar ${product.name}`}
                    >
                      <img
                        src={product.image}
                        alt={`${product.name} cafe`}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-stone-950/88 via-stone-950/30 to-transparent" />

                      <div className="relative z-10 flex h-full flex-col justify-between p-4">
                        <span
                          className={cn(
                            "self-start rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm",
                            product.stock <= 5
                              ? "bg-destructive/85"
                              : "bg-amber-600/85",
                          )}
                        >
                          {badgeText}
                        </span>

                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wider text-white/55">
                              {product.origin} · {ROAST_LABELS[product.roastLevel]}
                            </p>
                            <p className="text-sm font-bold text-white">
                              {product.name}
                            </p>
                            <p className="text-sm font-bold text-amber-400">
                              {formatCOP(product.price)}
                            </p>
                          </div>
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-all duration-200 group-hover:scale-110 group-hover:bg-primary">
                            <ArrowRight className="h-3.5 w-3.5 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Trust badges bar ── */}
          {/* gap-px + bg-border creates hairline dividers between cells */}
          <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border/50 bg-border/50 sm:grid-cols-4">
            {TRUST_BADGES.map(({ icon: Icon, title, sub }) => (
              <div
                key={title}
                className="flex items-center gap-3 bg-card px-4 py-3.5"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/15">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-foreground">
                    {title}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CATALOG
      ══════════════════════════════════════════════ */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Toolbar */}
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Nuestra colección
            </h2>
            {status === "succeeded" && (
              <p className="text-sm text-muted-foreground">
                {filtered.length} de {products.length} productos
              </p>
            )}
          </div>

          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Buscar por nombre, origen o notas…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                "w-full rounded-lg border border-border bg-background py-2 pl-8 pr-3 text-sm",
                "placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                "transition-shadow duration-150",
              )}
            />
          </div>
        </div>

        {/* Roast filter chips */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveFilter(id)}
              className={cn(
                "flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-150",
                activeFilter === id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Products grid */}
        {status === "loading" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {status === "failed" && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <Coffee className="h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium text-foreground">
              No se pudieron cargar los productos
            </p>
            <p className="max-w-xs text-sm text-muted-foreground">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(fetchProducts())}
            >
              Reintentar
            </Button>
          </div>
        )}

        {status === "succeeded" && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <Search className="h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium text-foreground">No se encontraron productos</p>
            <p className="text-sm text-muted-foreground">
              Prueba con otro filtro o término de búsqueda
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setActiveFilter("all");
                setSearch("");
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        )}

        {status === "succeeded" && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onBuy={handleBuy}
              />
            ))}
          </div>
        )}
      </main>

      {/* ══════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════ */}
      <footer className="mt-16 border-t border-border/40 py-8 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Coffee className="h-4 w-4" />
          <span>© 2024 Hispania Coffee. Todos los derechos reservados.</span>
        </div>
      </footer>
      </div>
    </>
  );
}
