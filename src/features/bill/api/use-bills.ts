"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type {
  Bill,
  BillListResponse,
  BillStatus,
  BillType,
} from "@/features/bill/schemas/bill";

export const billKeys = {
  all: ["bills"] as const,
  list: (params: BillListParams) => ["bills", "list", params] as const,
  detail: (id: string) => ["bills", "detail", id] as const,
};

export type BillListParams = {
  status?: BillStatus;
  studentId?: string;
  billType?: BillType;
  page?: number;
  perPage?: number;
};

export function useBills(params: BillListParams = {}) {
  return useQuery({
    queryKey: billKeys.list(params),
    queryFn: () =>
      apiFetch<BillListResponse>("/bills", {
        query: {
          status: params.status,
          studentId: params.studentId,
          billType: params.billType,
          page: params.page,
          perPage: params.perPage,
        },
      }),
  });
}

export function useBill(id: string | undefined) {
  return useQuery({
    queryKey: billKeys.detail(id ?? ""),
    enabled: !!id,
    queryFn: () => apiFetch<Bill>(`/bills/${id}`),
  });
}
