import { useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPaymentResult, setStep } from "@/store/slices/checkoutSlice";
import {
  BASE_FEE_COP,
  DELIVERY_FEE_COP,
  type TransactionStatus,
} from "@/types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";
const CARD_TOKENIZATION_URL =
  import.meta.env.VITE_PAYMENT_TOKENIZATION_URL ??
  "https://api-sandbox.co.uat.wompi.dev/v1/tokens/cards";
const PAYMENT_PUBLIC_KEY = import.meta.env.VITE_PAYMENT_PUBLIC_KEY ?? "";
const TRANSACTIONS_URL = `${API_BASE_URL}/transactions`;

interface ProcessPaymentSuccess {
  transactionId: string | null;
  status: TransactionStatus;
}

interface WompiTokenResponse {
  data?: {
    id?: string;
  };
  error?: {
    message?: string;
    reason?: string;
    messages?: unknown;
  };
}

interface TransactionResponse {
  success?: boolean;
  transactionId?: string;
  status?: string;
  message?: string;
  error?: string;
  receipt?: {
    transactionId?: string;
    status?: string;
  };
}

function normalizeTransactionStatus(
  status: string | undefined,
): TransactionStatus {
  switch (status?.toUpperCase()) {
    case "APPROVED":
      return "approved";
    case "FAILED":
    case "DECLINED":
      return "declined";
    case "PENDING":
    default:
      return "pending";
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

function extractGatewayError(payload: WompiTokenResponse) {
  const messages = payload.error?.messages;

  if (Array.isArray(messages)) {
    const firstMessage = messages.find(
      (item): item is { message?: string } =>
        typeof item === "object" && item !== null && "message" in item,
    );

    if (firstMessage?.message) {
      return firstMessage.message;
    }
  }

  if (typeof messages === "string" && messages.trim()) {
    return messages;
  }

  if (
    typeof messages === "object" &&
    messages !== null &&
    "message" in messages &&
    typeof (messages as { message?: unknown }).message === "string"
  ) {
    return (messages as { message: string }).message;
  }

  return (
    payload.error?.reason ??
    payload.error?.message ??
    "Falló la tokenización de la tarjeta"
  );
}

export function useProcessPayment() {
  const dispatch = useAppDispatch();
  const selectedProduct = useAppSelector(
    (state) => state.checkout.selectedProduct,
  );
  const creditCard = useAppSelector((state) => state.checkout.creditCard);
  const delivery = useAppSelector((state) => state.checkout.delivery);

  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState<ProcessPaymentSuccess | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function processPayment() {
    if (!selectedProduct || !creditCard || !delivery) {
      const message =
        "Faltan datos del checkout. Completa nuevamente el paso anterior.";
      setError(message);
      setSuccess(null);
      dispatch(
        setPaymentResult({
          outcome: "error",
          status: "error",
          transactionId: null,
          message,
        }),
      );
      dispatch(setStep("status"));
      return null;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      if (!PAYMENT_PUBLIC_KEY) {
        throw new Error("Falta la llave pública de la pasarela de pago.");
      }

      const [expMonth, expYearShort] = creditCard.expiry.split("/");
      const normalizedExpYear = expYearShort.slice(-2);

      const tokenResponse = await fetch(CARD_TOKENIZATION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PAYMENT_PUBLIC_KEY}`,
        },
        body: JSON.stringify({
          number: creditCard.number,
          cvc: creditCard.cvv,
          exp_month: expMonth,
          exp_year: normalizedExpYear,
          card_holder: creditCard.holderName,
        }),
      });

      const tokenPayload = (await tokenResponse.json()) as WompiTokenResponse;
      const cardToken = tokenPayload.data?.id;

      if (!tokenResponse.ok || !cardToken) {
        throw new Error(extractGatewayError(tokenPayload));
      }

      const totalAmount =
        (selectedProduct.price + BASE_FEE_COP + DELIVERY_FEE_COP) * 100;

      const transactionResponse = await fetch(TRANSACTIONS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: totalAmount,
          cardToken,
          productId: selectedProduct.id,
          fullName: delivery.fullName,
          email: delivery.email,
          phone: delivery.phone,
          address: delivery.address,
          city: delivery.city,
          region: delivery.department,
        }),
      });

      const transactionPayload =
        (await transactionResponse.json()) as TransactionResponse;

      if (!transactionResponse.ok || !transactionPayload.success) {
        throw new Error(
          transactionPayload.message ??
            transactionPayload.error ??
            "La transacción fue rechazada.",
        );
      }

      const result = {
        transactionId:
          transactionPayload.receipt?.transactionId ??
          transactionPayload.transactionId ??
          null,
        status: normalizeTransactionStatus(
          transactionPayload.receipt?.status ?? transactionPayload.status,
        ),
      };

      setSuccess(result);
      dispatch(
        setPaymentResult({
          outcome: result.status === "approved" ? "success" : "pending",
          status: result.status,
          transactionId: result.transactionId,
          message:
            result.status === "approved"
              ? null
              : "Tu transacción todavía está siendo confirmada.",
        }),
      );
      dispatch(setStep("status"));

      return result;
    } catch (caughtError) {
      const message = getErrorMessage(
        caughtError,
        "No pudimos completar el pago. Inténtalo de nuevo.",
      );

      setError(message);
      setSuccess(null);
      dispatch(
        setPaymentResult({
          outcome: "error",
          status: "error",
          transactionId: null,
          message,
        }),
      );
      dispatch(setStep("status"));

      return null;
    } finally {
      setIsProcessing(false);
    }
  }

  return {
    processPayment,
    isProcessing,
    success,
    error,
  };
}
