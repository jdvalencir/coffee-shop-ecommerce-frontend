import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Package } from 'lucide-react';

import { CreditCardForm } from '@/components/checkout/CreditCardForm';
import { DeliveryForm } from '@/components/checkout/DeliveryForm';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { checkoutSchema, type CheckoutFormData } from '@/schemas/checkoutSchema';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCreditCard, setDelivery, setStep } from '@/store/slices/checkoutSlice';
import { BASE_FEE_COP, DELIVERY_FEE_COP } from '@/types';
import { formatCOP } from '@/utils/formatters';

function PriceRow({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: number;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={
          bold
            ? 'text-sm font-semibold text-foreground'
            : 'text-sm text-muted-foreground'
        }
      >
        {label}
      </span>
      <span
        className={
          bold
            ? 'text-sm font-bold text-primary'
            : 'text-sm font-medium text-foreground'
        }
      >
        {formatCOP(value)}
      </span>
    </div>
  );
}

function ErrorDot() {
  return (
    <span
      aria-hidden="true"
      className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-destructive"
    />
  );
}

interface CheckoutContentProps {
  onSubmitSuccess?: () => void;
}

export function CheckoutContent({ onSubmitSuccess }: CheckoutContentProps) {
  const dispatch = useAppDispatch();
  const selectedProduct = useAppSelector((s) => s.checkout.selectedProduct);
  const savedDelivery = useAppSelector((s) => s.checkout.delivery);
  const [activeTab, setActiveTab] = useState<'delivery' | 'payment'>('delivery');

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      delivery: {
        fullName: savedDelivery?.fullName ?? '',
        email: savedDelivery?.email ?? '',
        phone: savedDelivery?.phone ?? '',
        address: savedDelivery?.address ?? '',
        city: savedDelivery?.city ?? '',
        department: savedDelivery?.department ?? '',
      },
      payment: {
        cardNumber: '',
        holderName: '',
        expiry: '',
        cvv: '',
      },
    },
  });

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
  } = form;
  const watchedDelivery = useWatch({
    control,
    name: 'delivery',
  });

  const normalizedSavedDelivery = useMemo(
    () => ({
      fullName: savedDelivery?.fullName ?? '',
      email: savedDelivery?.email ?? '',
      phone: savedDelivery?.phone ?? '',
      address: savedDelivery?.address ?? '',
      city: savedDelivery?.city ?? '',
      department: savedDelivery?.department ?? '',
    }),
    [savedDelivery],
  );

  useEffect(() => {
    if (!watchedDelivery) {
      return;
    }

    const hasAnyValue = Object.values(watchedDelivery).some((value) => value.trim() !== '');
    if (!hasAnyValue && !savedDelivery) {
      return;
    }

    const savedSnapshot = JSON.stringify(normalizedSavedDelivery);
    const currentSnapshot = JSON.stringify(watchedDelivery);

    if (currentSnapshot !== savedSnapshot) {
      dispatch(
        setDelivery({
          fullName: watchedDelivery.fullName,
          email: watchedDelivery.email,
          phone: watchedDelivery.phone,
          address: watchedDelivery.address,
          city: watchedDelivery.city,
          department: watchedDelivery.department,
        }),
      );
    }
  }, [dispatch, normalizedSavedDelivery, savedDelivery, watchedDelivery]);

  if (!selectedProduct) return null;

  const total = selectedProduct.price + BASE_FEE_COP + DELIVERY_FEE_COP;
  const hasDeliveryErrors =
    !!errors.delivery && Object.keys(errors.delivery).length > 0;
  const hasPaymentErrors =
    !!errors.payment && Object.keys(errors.payment).length > 0;

  function onSubmit(data: CheckoutFormData) {
    dispatch(
      setDelivery({
        fullName: data.delivery.fullName,
        email: data.delivery.email,
        phone: data.delivery.phone,
        address: data.delivery.address,
        city: data.delivery.city,
        department: data.delivery.department,
      }),
    );

    dispatch(
      setCreditCard({
        number: data.payment.cardNumber.replace(/\s/g, ''),
        holderName: data.payment.holderName,
        expiry: data.payment.expiry,
        cvv: data.payment.cvv,
      }),
    );

    dispatch(setStep('summary'));
    onSubmitSuccess?.();
  }

  function onInvalidSubmit(fieldErrors: FieldErrors<CheckoutFormData>) {
    if (fieldErrors.delivery) {
      setActiveTab('delivery');
      return;
    }

    if (fieldErrors.payment) {
      setActiveTab('payment');
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-10">
      <section className="order-1 lg:col-span-3 lg:order-2">
        <div className="mb-5">
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
            Complete your order
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Fill in your delivery and payment details below.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit, onInvalidSubmit)} noValidate>
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as 'delivery' | 'payment')}
            >
              <TabsList className="mb-1 w-full">
                <TabsTrigger value="delivery" className="flex-1">
                  <Package className="mr-1.5 h-3.5 w-3.5" />
                  Delivery Info
                  {hasDeliveryErrors && <ErrorDot />}
                </TabsTrigger>
                <TabsTrigger value="payment" className="flex-1">
                  <Lock className="mr-1.5 h-3.5 w-3.5" />
                  Payment
                  {hasPaymentErrors && <ErrorDot />}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="delivery">
                <DeliveryForm />
              </TabsContent>

              <TabsContent value="payment">
                <CreditCardForm />
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              <Button
                type="submit"
                size="lg"
                className="w-full gap-2 shadow-lg shadow-primary/20"
                disabled={isSubmitting}
              >
                <Lock className="h-4 w-4" />
                {isSubmitting ? 'Processing…' : 'Review Payment Summary'}
              </Button>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                By confirming you agree to proceed with a secure test
                transaction.
              </p>
            </div>
          </form>
        </Form>
      </section>

      <aside className="order-2 lg:col-span-2 lg:order-1">
        <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Order Summary
          </h2>

          <div className="flex gap-3">
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {selectedProduct.name}
              </p>
              <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                {selectedProduct.origin} ·{' '}
                {selectedProduct.roastLevel.replace('-', ' ')} roast ·{' '}
                {selectedProduct.weight}g
              </p>
              <p className="mt-1.5 text-sm font-bold text-primary">
                {formatCOP(selectedProduct.price)}
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2.5">
            <PriceRow label="Product amount" value={selectedProduct.price} />
            <PriceRow label="Base fee" value={BASE_FEE_COP} />
            <PriceRow label="Delivery Fee" value={DELIVERY_FEE_COP} />
            <Separator className="my-1" />
            <PriceRow label="Total amount" value={total} bold />
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2.5">
            <Lock className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Secure payment processing in test mode
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
