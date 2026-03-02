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
import { selectProduct, setStep } from "@/store/slices/checkoutSlice";
import { fetchProducts } from "@/store/slices/productsSlice";
import type { Product, RoastLevel } from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────────

type FilterId = "all" | RoastLevel;

// ── Constants ─────────────────────────────────────────────────────────────────

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All Roasts" },
  { id: "light", label: "Light" },
  { id: "medium", label: "Medium" },
  { id: "medium-dark", label: "Medium Dark" },
  { id: "dark", label: "Dark" },
];

interface TrustBadge {
  icon: LucideIcon;
  title: string;
  sub: string;
}

const TRUST_BADGES: TrustBadge[] = [
  { icon: Flame, title: "Small Batch Roasted", sub: "Fresh weekly batches" },
  { icon: Leaf, title: "100% Single Origin", sub: "6 premium growing regions" },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    sub: "Wompi — encrypted & safe",
  },
  { icon: Truck, title: "Fast Delivery", sub: "1 – 3 business days" },
];

// Hero-featured product IDs (matches mock data)
const HERO_MAIN_ID = "prod-001"; // Ethiopian Yirgacheffe
const HERO_SIDE_1_ID = "prod-005"; // Kenya AA
const HERO_SIDE_2_ID = "prod-002"; // Colombian Supremo

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

  useEffect(() => {
    if (status === "idle") dispatch(fetchProducts());
  }, [status, dispatch]);

  function handleCheckoutOpenChange(nextOpen: boolean) {
    setIsCheckoutOpen(nextOpen);

    if (!nextOpen && checkoutStep === "checkout") {
      dispatch(setStep("product"));
    }
  }

  function handleBuy(product: Product) {
    dispatch(selectProduct(product));
    dispatch(setStep("checkout"));
    setIsCheckoutOpen(true);
  }

  function handleHeroBuy(productId: string) {
    const product = products.find((p) => p.id === productId);
    if (product) handleBuy(product);
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

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <Dialog
        open={isCheckoutOpen && !!selectedProduct}
        onOpenChange={handleCheckoutOpenChange}
      >
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto border-border/50 bg-background p-0">
          <DialogHeader className="border-b border-border/40 pr-12">
            <DialogTitle>Checkout</DialogTitle>
            <DialogDescription>
              Confirm your delivery details and payment without leaving the
              catalog.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 sm:p-6">
            <CheckoutContent onSubmitSuccess={() => setIsCheckoutOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>

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
              Brews &amp; Beans
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
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
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
          {/* ── Main grid: hero (2 cols) + side cards (1 col) ── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:h-[420px]">
            {/* ─── Main hero banner ─── */}
            <div
              className={cn(
                "group relative lg:col-span-2 h-72 lg:h-full overflow-hidden rounded-2xl cursor-pointer",
              )}
              onClick={() => handleHeroBuy(HERO_MAIN_ID)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === "Enter" && handleHeroBuy(HERO_MAIN_ID)
              }
              aria-label="Buy Ethiopian Yirgacheffe"
            >
              {/* Background image */}
              <img
                src="https://images.unsplash.com/photo-1559496417-e7f25cb247f3?auto=format&fit=crop&w=1200&q=85"
                alt="Ethiopian Yirgacheffe coffee bag"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Gradient overlay — stronger on left, fades right */}
              <div className="absolute inset-0 bg-linear-to-r from-stone-950/92 via-stone-950/55 to-stone-950/10" />
              {/* Subtle bottom vignette */}
              <div className="absolute inset-0 bg-linear-to-t from-stone-950/40 via-transparent to-transparent" />

              {/* Content */}
              <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-8">
                {/* Top badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-400 backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    Staff Pick
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-medium text-white/70 backdrop-blur-sm">
                    Light Roast
                  </span>
                </div>

                {/* Bottom content */}
                <div>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-amber-400/80">
                    Ethiopia · 500g Bag
                  </p>
                  <h2 className="mb-3 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-[42px]">
                    Ethiopian
                    <br />
                    Yirgacheffe
                  </h2>
                  <p className="mb-5 max-w-xs text-sm leading-relaxed text-white/65">
                    Layers of jasmine, bergamot and ripe blueberry — our most
                    celebrated light roast from the birthplace of coffee.
                  </p>

                  {/* CTAs */}
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      size="lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleHeroBuy(HERO_MAIN_ID);
                      }}
                      className="shadow-lg shadow-primary/25"
                    >
                      Pay with Credit Card
                    </Button>
                    <span className="rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-sm">
                      $65,000 COP
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Side cards column ─── */}
            <div className="flex h-full flex-row gap-4 lg:flex-col">
              {/* Side card 1 — Kenya AA */}
              <div
                className="group relative flex-1 overflow-hidden rounded-2xl min-h-36 lg:min-h-0 cursor-pointer"
                onClick={() => handleHeroBuy(HERO_SIDE_1_ID)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleHeroBuy(HERO_SIDE_1_ID)
                }
                aria-label="Buy Kenya AA"
              >
                <img
                  src="https://images.unsplash.com/photo-1561478908-d067fe75a553?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Kenya AA coffee"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-stone-950/88 via-stone-950/30 to-transparent" />

                <div className="relative z-10 flex h-full flex-col justify-between p-4">
                  {/* Badge */}
                  <span className="self-start rounded-full bg-destructive/85 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                    Only 5 left
                  </span>

                  {/* Info + arrow */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-white/55">
                        Kenya · Light Roast
                      </p>
                      <p className="text-sm font-bold text-white">Kenya AA</p>
                      <p className="text-sm font-bold text-amber-400">
                        $72,000 COP
                      </p>
                    </div>
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-all duration-200 group-hover:bg-primary group-hover:scale-110">
                      <ArrowRight className="h-3.5 w-3.5 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Side card 2 — Colombian Supremo */}
              <div
                className="group relative flex-1 overflow-hidden rounded-2xl min-h-36 lg:min-h-0 cursor-pointer"
                onClick={() => handleHeroBuy(HERO_SIDE_2_ID)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleHeroBuy(HERO_SIDE_2_ID)
                }
                aria-label="Buy Colombian Supremo"
              >
                <img
                  src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Colombian Supremo coffee"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-stone-950/88 via-stone-950/30 to-transparent" />

                <div className="relative z-10 flex h-full flex-col justify-between p-4">
                  {/* Badge */}
                  <span className="self-start rounded-full bg-amber-600/85 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                    Bestseller
                  </span>

                  {/* Info + arrow */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-white/55">
                        Colombia · Medium Roast
                      </p>
                      <p className="text-sm font-bold text-white">
                        Colombian Supremo
                      </p>
                      <p className="text-sm font-bold text-amber-400">
                        $48,000 COP
                      </p>
                    </div>
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-all duration-200 group-hover:bg-primary group-hover:scale-110">
                      <ArrowRight className="h-3.5 w-3.5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* end side cards */}
          </div>
          {/* end main grid */}

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
              Our Collection
            </h2>
            {status === "succeeded" && (
              <p className="text-sm text-muted-foreground">
                {filtered.length} of {products.length} products
              </p>
            )}
          </div>

          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search by name, origin, notes…"
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
              Couldn&apos;t load products
            </p>
            <p className="max-w-xs text-sm text-muted-foreground">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(fetchProducts())}
            >
              Try again
            </Button>
          </div>
        )}

        {status === "succeeded" && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <Search className="h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium text-foreground">No products found</p>
            <p className="text-sm text-muted-foreground">
              Try a different filter or search term
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setActiveFilter("all");
                setSearch("");
              }}
            >
              Clear filters
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
          <span>© 2024 Brews &amp; Beans. All rights reserved.</span>
        </div>
      </footer>
      </div>
    </>
  );
}
