"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { PaymentSummary } from "@/features/payment/schemas/summary";

export const paymentKeys = {
  summary: ["payments", "summary"] as const,
};

export function usePaymentSummary() {
  return useQuery({
    queryKey: paymentKeys.summary,
    queryFn: () => apiFetch<PaymentSummary>("/dashboard/payment-summary"),
  });
}
