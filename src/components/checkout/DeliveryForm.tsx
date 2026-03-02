import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { CheckoutFormData } from '@/schemas/checkoutSchema';

export function DeliveryForm() {
  const { control } = useFormContext<CheckoutFormData>();

  return (
    <div className="space-y-4">
      {/* ── Full Name ──────────────────────────────────────────────────── */}
      <FormField
        control={control}
        name="delivery.fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre completo</FormLabel>
            <FormControl>
              <Input
                placeholder="Juan Pérez"
                autoComplete="name"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ── Email + Phone ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="delivery.email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="tu@correo.com"
                  autoComplete="email"
                  inputMode="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="delivery.phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="+57 300 000 0000"
                  autoComplete="tel"
                  inputMode="tel"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* ── Address ────────────────────────────────────────────────────── */}
      <FormField
        control={control}
        name="delivery.address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dirección de entrega</FormLabel>
            <FormControl>
              <Input
                placeholder="Calle, número, apartamento…"
                autoComplete="street-address"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ── City + Department ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="delivery.city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ciudad</FormLabel>
              <FormControl>
                <Input
                  placeholder="Bogotá"
                  autoComplete="address-level2"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="delivery.department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departamento / Región</FormLabel>
              <FormControl>
                <Input
                  placeholder="Cundinamarca"
                  autoComplete="address-level1"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
