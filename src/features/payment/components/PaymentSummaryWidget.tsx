"use client";

import { Wallet, TrendingUp, AlertCircle } from "lucide-react";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { ErrorScreen } from "@/components/common/ErrorScreen";
import { usePaymentSummary } from "@/features/payment/api/use-payment-summary";
import { formatCurrency } from "@/lib/format";

export function PaymentSummaryWidget() {
  const { data, isLoading, isError, refetch } = usePaymentSummary();

  if (isLoading) return <LoadingScreen />;
  if (isError || !data) return <ErrorScreen onRetry={() => refetch()} />;

  return (
    <section
      aria-label="Ringkasan Pembayaran"
      className="overflow-hidden rounded-2xl border bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm"
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-primary-foreground/80">
              Total Tagihan
            </p>
            <p className="mt-1 text-2xl font-bold">
              {formatCurrency(data.totalBilled)}
            </p>
            <p className="text-[11px] text-primary-foreground/80">
              {data.categories.reduce((acc, c) => acc + c.count, 0)} tagihan
              dalam {data.categories.length} kategori
            </p>
          </div>
          <div className="rounded-full bg-white/20 p-2.5">
            <Wallet className="h-5 w-5" aria-hidden />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-white/20 border-t border-white/20 bg-white/5">
        <div className="flex items-center gap-2 px-4 py-3">
          <TrendingUp className="h-4 w-4 opacity-90" aria-hidden />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-primary-foreground/80">
              Sudah Dibayar
            </p>
            <p className="truncate text-sm font-bold">
              {formatCurrency(data.totalPaid)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-3">
          <AlertCircle className="h-4 w-4 opacity-90" aria-hidden />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-primary-foreground/80">
              Outstanding
            </p>
            <p className="truncate text-sm font-bold">
              {formatCurrency(data.totalOutstanding)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
