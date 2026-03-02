import { useFormContext } from 'react-hook-form';
import { ShieldCheck } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CardTypeIcon } from '@/components/checkout/CardTypeIcon';
import { formatCardNumber, formatExpiry } from '@/utils/cardValidation';
import type { CheckoutFormData } from '@/schemas/checkoutSchema';

export function CreditCardForm() {
  const { control, watch } = useFormContext<CheckoutFormData>();
  const cardNumber = watch('payment.cardNumber') ?? '';

  return (
    <div className="space-y-4">
      {/* ── Card Number ────────────────────────────────────────────────── */}
      <FormField
        control={control}
        name="payment.cardNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de tarjeta</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  placeholder="1234 5678 9012 3456"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  maxLength={19}
                  {...field}
                  onChange={(e) => {
                    field.onChange(formatCardNumber(e.target.value));
                  }}
                  className="pr-16 font-mono tracking-wider"
                />
                {/* Card type logo overlay */}
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <CardTypeIcon cardNumber={cardNumber} />
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ── Cardholder Name ────────────────────────────────────────────── */}
      <FormField
        control={control}
        name="payment.holderName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre del titular</FormLabel>
            <FormControl>
              <Input
                placeholder="Como aparece en tu tarjeta"
                autoComplete="cc-name"
                {...field}
                onChange={(e) =>
                  field.onChange(e.target.value.toUpperCase())
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ── Expiry + CVV ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="payment.expiry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de vencimiento</FormLabel>
              <FormControl>
                <Input
                  placeholder="MM/AA"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  maxLength={5}
                  {...field}
                  onChange={(e) => {
                    field.onChange(formatExpiry(e.target.value));
                  }}
                  className="font-mono tracking-wider"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="payment.cvv"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CVV</FormLabel>
              <FormControl>
                <Input
                  placeholder="•••"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  type="password"
                  maxLength={4}
                  {...field}
                  className="font-mono tracking-widest"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ── Security note ──────────────────────────────────────────────── */}
      <div className="flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2.5">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Los datos de tu tarjeta se validan localmente y nunca se almacenan.
          El CVV solo se mantiene en memoria y se descarta al finalizar la transacción.
        </p>
      </div>
    </div>
  );
}
