"use client";

import { useQuery } from "@tanstack/react-query";
import { History as HistoryIcon } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { Payment } from "@/features/payment/schemas/payment";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { ErrorScreen } from "@/components/common/ErrorScreen";
import { EmptyState } from "@/components/common/EmptyState";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

type ListResponse = { items: Payment[]; total: number };

function usePayments() {
  return useQuery({
    queryKey: ["payments", "list"],
    queryFn: () => apiFetch<ListResponse>("/payments"),
  });
}

export default function RiwayatPage() {
  const { data, isLoading, isError, refetch } = usePayments();

  return (
    <div>
      <PageHeader
        title="Riwayat Pembayaran"
        description="Pembayaran yang sudah berhasil kamu lakukan."
      />
      {isLoading ? (
        <LoadingScreen />
      ) : isError ? (
        <ErrorScreen onRetry={() => refetch()} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="Belum ada pembayaran"
          description="Pembayaran sukses akan muncul di sini."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {data.items.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-xl border bg-card p-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{p.billTitle}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {p.studentName} ·{" "}
                  {p.paidAt ? formatDateTime(p.paidAt) : "—"}
                </p>
                <Badge variant="muted" className="mt-1">
                  {p.method.toUpperCase()}
                </Badge>
              </div>
              <span className="shrink-0 text-sm font-semibold text-primary">
                {formatCurrency(p.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
