"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Receipt } from "lucide-react";
import { use } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { ErrorScreen } from "@/components/common/ErrorScreen";
import { EmptyState } from "@/components/common/EmptyState";
import { useBills } from "@/features/bill/api/use-bills";
import { BillRow } from "@/features/bill/components/BillRow";
import { billTypeFullLabel, billTypeLabel } from "@/features/bill/lib/types";
import { billTypeSchema, type BillType } from "@/features/bill/schemas/bill";
import { billOutstanding } from "@/features/bill/lib/status";
import { formatCurrency } from "@/lib/format";

type Params = Promise<{ type: string }>;

export default function CategoryDetailPage({ params }: { params: Params }) {
  const { type: rawType } = use(params);

  const parsed = billTypeSchema.safeParse(rawType);
  const billType: BillType | null = parsed.success ? parsed.data : null;

  const { data, isLoading, isError, refetch } = useBills(
    billType ? { billType, perPage: 100 } : {},
  );

  const summary = useMemo(() => {
    if (!data) return null;
    const items = data.items;
    const totalBilled = items.reduce((acc, b) => acc + b.amount, 0);
    const totalPaid = items.reduce((acc, b) => acc + b.paid, 0);
    const outstanding = items.reduce(
      (acc, b) => acc + billOutstanding(b),
      0,
    );
    return {
      totalBilled,
      totalPaid,
      outstanding,
      count: items.length,
    };
  }, [data]);

  if (!billType) {
    return (
      <div className="space-y-4">
        <Link
          href="/keuangan"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Keuangan
        </Link>
        <ErrorScreen
          title="Kategori tidak dikenal"
          description="Kategori tagihan yang kamu buka belum tersedia."
        />
      </div>
    );
  }

  if (isLoading) return <LoadingScreen />;
  if (isError || !data) return <ErrorScreen onRetry={() => refetch()} />;

  const items = [...data.items].sort((a, b) => {
    if (a.period !== b.period) return b.period.localeCompare(a.period);
    return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
  });

  return (
    <div className="space-y-4">
      <Link
        href="/keuangan"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Keuangan
      </Link>

      <PageHeader
        title={billTypeLabel[billType]}
        description={billTypeFullLabel[billType]}
      />

      {summary ? (
        <section
          aria-label={`Ringkasan ${billTypeLabel[billType]}`}
          className="overflow-hidden rounded-2xl border bg-gradient-to-br from-primary to-primary/80 p-4 text-primary-foreground shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-primary-foreground/80">
                {billTypeLabel[billType]}
              </p>
              <p className="mt-1 text-2xl font-bold">
                {formatCurrency(summary.totalBilled)}
              </p>
              <p className="text-[11px] text-primary-foreground/80">
                Total dari {summary.count} tagihan
              </p>
            </div>
            <div className="rounded-full bg-white/20 p-2.5">
              <Receipt className="h-5 w-5" aria-hidden />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-[10px] uppercase tracking-wide text-primary-foreground/80">
                Sudah Dibayar
              </p>
              <p className="mt-1 text-base font-bold">
                {formatCurrency(summary.totalPaid)}
              </p>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-[10px] uppercase tracking-wide text-primary-foreground/80">
                Outstanding
              </p>
              <p className="mt-1 text-base font-bold">
                {formatCurrency(summary.outstanding)}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <div>
        <h2 className="mb-2 px-1 text-sm font-semibold">Daftar Pembayaran</h2>
        {items.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Belum ada tagihan"
            description="Tagihan kategori ini akan muncul di sini ketika diterbitkan."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((bill) => (
              <li key={bill.id}>
                <BillRow bill={bill} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
