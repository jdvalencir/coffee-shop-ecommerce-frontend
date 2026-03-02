import { useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCcw,
  ShieldAlert,
} from 'lucide-react';

import { useTransactionStatus } from '@/hooks/useTransactionStatus';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProducts } from '@/store/slices/productsSlice';
import { resetCheckout, setPaymentResult } from '@/store/slices/checkoutSlice';

interface FinalStatusProps {
  open: boolean;
}

export function FinalStatus({ open }: FinalStatusProps) {
  const dispatch = useAppDispatch();
  const paymentResult = useAppSelector((state) => state.checkout.paymentResult);
  const shouldPoll =
    paymentResult.status === 'pending' && Boolean(paymentResult.transactionId);
  const {
    status: polledStatus,
    message: polledMessage,
    isLoading,
    isPolling,
    error: pollingError,
  } = useTransactionStatus(shouldPoll ? paymentResult.transactionId : null);

  useEffect(() => {
    if (!shouldPoll || !polledStatus || polledStatus === 'pending') {
      return;
    }

    dispatch(
      setPaymentResult({
        outcome: polledStatus === 'approved' ? 'success' : 'error',
        status: polledStatus,
        transactionId: paymentResult.transactionId,
        message:
          polledStatus === 'approved'
            ? polledMessage
            : polledMessage ?? 'The transaction could not be approved.',
      }),
    );
  }, [
    dispatch,
    paymentResult.transactionId,
    polledMessage,
    polledStatus,
    shouldPoll,
  ]);

  const resolvedStatus = shouldPoll ? polledStatus ?? 'pending' : paymentResult.status;
  const resolvedMessage = shouldPoll
    ? pollingError ?? polledMessage ?? paymentResult.message
    : paymentResult.message;
  const isPendingView = shouldPoll && (isLoading || isPolling || resolvedStatus === 'pending');
  const isSuccessView = resolvedStatus === 'approved';
  const isErrorView =
    !isPendingView &&
    (resolvedStatus === 'declined' ||
      resolvedStatus === 'error' ||
      paymentResult.outcome === 'error');

  function handleBackToCatalog() {
    dispatch(resetCheckout());
    void dispatch(fetchProducts());
  }

  useEffect(() => {
    if (!open || !isSuccessView) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      dispatch(resetCheckout());
      void dispatch(fetchProducts());
    }, 5_000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [dispatch, isSuccessView, open]);

  return (
    <Dialog open={open} onOpenChange={() => undefined}>
      <DialogContent className="max-w-md border-border/60 bg-background p-0 sm:rounded-3xl">
        <div className="overflow-hidden rounded-3xl">
          <div className="bg-linear-to-br from-background via-background to-primary/10 px-6 py-6">
            <DialogHeader>
              <DialogTitle className="text-left text-xl font-semibold">
                Transaction Status
              </DialogTitle>
              <DialogDescription className="text-left">
                We are validating the final result of your coffee order.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 py-7">
            {isPendingView ? (
              <div className="flex flex-col items-center text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Loader2 className="h-10 w-10 animate-spin" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  Payment in progress
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Your transaction is currently pending. We are checking the
                  backend every 3 seconds until the payment gateway returns the
                  final result.
                </p>
                {paymentResult.transactionId ? (
                  <p className="mt-4 rounded-full bg-muted px-4 py-2 text-xs font-medium text-muted-foreground">
                    Transaction ID: {paymentResult.transactionId}
                  </p>
                ) : null}
              </div>
            ) : null}

            {isSuccessView ? (
              <div className="flex flex-col items-center text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  Payment approved
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Your order was confirmed successfully and the inventory is
                  ready to be refreshed.
                </p>
                {paymentResult.transactionId ? (
                  <p className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm font-medium text-foreground">
                    Transaction ID: {paymentResult.transactionId}
                  </p>
                ) : null}
                {resolvedMessage ? (
                  <p className="mt-3 text-xs text-muted-foreground">
                    {resolvedMessage}
                  </p>
                ) : null}
                <p className="mt-3 text-xs text-muted-foreground">
                  This confirmation will close automatically in 5 seconds.
                </p>
              </div>
            ) : null}

            {isErrorView ? (
              <div className="flex flex-col items-center text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  {pollingError ? (
                    <AlertTriangle className="h-10 w-10" />
                  ) : (
                    <ShieldAlert className="h-10 w-10" />
                  )}
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  Payment failed
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {resolvedMessage ??
                    'The transaction was declined or could not be confirmed.'}
                </p>
                {paymentResult.transactionId ? (
                  <p className="mt-4 rounded-full bg-muted px-4 py-2 text-xs font-medium text-muted-foreground">
                    Transaction ID: {paymentResult.transactionId}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-8">
              <Button
                type="button"
                size="lg"
                className="w-full gap-2"
                onClick={handleBackToCatalog}
              >
                <RefreshCcw className="h-4 w-4" />
                Back to catalog
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
