import {
  AlertTriangle,
  CreditCard,
  Loader2,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useProcessPayment } from "@/hooks/useProcessPayment";
import { useAppSelector } from "@/store/hooks";
import { BASE_FEE_COP, DELIVERY_FEE_COP } from "@/types";
import { formatCOP } from "@/utils/formatters";

interface PaymentSummaryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SummaryRow({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: number;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={
          emphasis
            ? "text-sm font-semibold text-foreground"
            : "text-sm text-muted-foreground"
        }
      >
        {label}
      </span>
      <span
        className={
          emphasis
            ? "text-base font-bold text-foreground"
            : "text-sm font-semibold text-foreground"
        }
      >
        {formatCOP(value)}
      </span>
    </div>
  );
}

export function PaymentSummary({ open, onOpenChange }: PaymentSummaryProps) {
  const selectedProduct = useAppSelector(
    (state) => state.checkout.selectedProduct,
  );
  const delivery = useAppSelector((state) => state.checkout.delivery);
  const creditCard = useAppSelector((state) => state.checkout.creditCard);
  const { processPayment, isProcessing, error } = useProcessPayment();

  if (!selectedProduct || !delivery || !creditCard) {
    return null;
  }

  const total = selectedProduct.price + BASE_FEE_COP + DELIVERY_FEE_COP;
  const cardLastFour = creditCard.number.slice(-4);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border/60 bg-background p-0 sm:rounded-3xl">
        <div className="overflow-hidden rounded-3xl">
          <div className="bg-linear-to-br from-primary/12 via-background to-amber-500/10 px-5 py-5 sm:px-6">
            <DialogHeader>
              <DialogTitle className="text-left text-xl font-semibold">
                Resumen de pago
              </DialogTitle>
              <DialogDescription className="text-left text-sm leading-6">
                Revisa el desglose final de tu pedido antes de confirmar el
                pago.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-5 px-5 py-5 sm:px-6">
            <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
              <div className="flex items-start gap-3">
                <div className="h-16 w-16 overflow-hidden rounded-2xl bg-muted">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {selectedProduct.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selectedProduct.origin} · {selectedProduct.weight}g
                  </p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-primary">
                    Listo para el cobro final
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-4">
              <div className="space-y-3">
                <SummaryRow label="Producto" value={selectedProduct.price} />
                <SummaryRow label="Tarifa base" value={BASE_FEE_COP} />
                <SummaryRow label="Envío" value={DELIVERY_FEE_COP} />
                <Separator />
                <SummaryRow label="Total" value={total} emphasis />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <CreditCard className="h-3.5 w-3.5" />
                  Método de pago
                </div>
                <p className="text-sm font-semibold text-foreground">
                  Tarjeta terminada en {cardLastFour}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {creditCard.holderName}
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  Entrega
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {delivery.city}, {delivery.department}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {delivery.address}
                </p>
              </div>
            </div>

            {error ? (
              <div className="flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <p className="text-xs leading-5 text-muted-foreground">
                  La acción final tokeniza primero la tarjeta y luego envía solo
                  el token junto con los datos del pedido a tu endpoint local.
                </p>
              </div>
            </div>

            <Button
              type="button"
              size="lg"
              className="w-full gap-2"
              disabled={isProcessing}
              onClick={() => {
                void processPayment();
              }}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              {isProcessing ? "Procesando pago seguro…" : "Confirmar y pagar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
