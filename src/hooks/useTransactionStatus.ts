import { useEffect, useRef, useState } from "react";

import type { TransactionStatus } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";
const TRANSACTIONS_BASE_URL = `${API_BASE_URL}/transactions`;
const POLLING_INTERVAL_MS = 3_000;

interface TransactionStatusResponse {
  success?: boolean;
  status?: string;
  message?: string;
  error?: string;
  transaction?: {
    id?: string;
    status?: string;
    message?: string;
    statusMessage?: string;
  };
  receipt?: {
    transactionId?: string;
    status?: string;
    message?: string;
    statusMessage?: string;
  };
}

function normalizeStatus(status: string | undefined): TransactionStatus {
  switch (status?.toUpperCase()) {
    case "APPROVED":
      return "approved";
    case "FAILED":
    case "DECLINED":
      return "declined";
    case "ERROR":
      return "error";
    case "PENDING":
    default:
      return "pending";
  }
}

function extractStatus(payload: TransactionStatusResponse): TransactionStatus {
  return normalizeStatus(
    payload.receipt?.status ?? payload.transaction?.status ?? payload.status,
  );
}

function extractMessage(payload: TransactionStatusResponse): string | null {
  return (
    payload.receipt?.statusMessage ??
    payload.receipt?.message ??
    payload.transaction?.statusMessage ??
    payload.transaction?.message ??
    payload.message ??
    payload.error ??
    null
  );
}

export function useTransactionStatus(transactionId: string | null) {
  const [status, setStatus] = useState<TransactionStatus | null>(
    transactionId ? "pending" : null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(transactionId));
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!transactionId) {
      setStatus(null);
      setMessage(null);
      setIsPolling(false);
      setIsLoading(false);
      setError(null);
      return;
    }

    let isCancelled = false;

    async function checkTransactionStatus() {
      try {
        const response = await fetch(
          `${TRANSACTIONS_BASE_URL}/${transactionId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        const payload = (await response.json()) as TransactionStatusResponse;

        if (!response.ok) {
          throw new Error(
            payload.message ??
              payload.error ??
              "Unable to verify the transaction.",
          );
        }

        if (isCancelled) {
          return;
        }

        const nextStatus = extractStatus(payload);
        const nextMessage = extractMessage(payload);

        setStatus(nextStatus);
        setMessage(nextMessage);
        setError(null);
        setIsLoading(false);

        if (nextStatus === "pending") {
          setIsPolling(true);
          return;
        }

        setIsPolling(false);
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } catch (caughtError) {
        if (isCancelled) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to verify the transaction.",
        );
        setStatus("error");
        setIsLoading(false);
        setIsPolling(false);
        if (intervalRef.current) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }

    setIsLoading(true);
    void checkTransactionStatus();

    intervalRef.current = window.setInterval(() => {
      void checkTransactionStatus();
    }, POLLING_INTERVAL_MS);

    return () => {
      isCancelled = true;
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [transactionId]);

  return {
    status,
    message,
    isLoading,
    isPolling,
    error,
  };
}
