"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import type { Bill } from "@/features/bill/schemas/bill";
import {
  billStatusLabel,
  billStatusVariant,
} from "@/features/bill/lib/status";
import { billPeriodParts } from "@/features/bill/lib/period";
import { billOutstanding } from "@/features/bill/lib/status";

type BillRowProps = {
  bill: Bill;
};

export function BillRow({ bill }: BillRowProps) {
  const { bulan, tahun } = billPeriodParts(bill);
  const sisa = billOutstanding(bill);

  return (
    <Link
      href={`/keuangan/${bill.id}`}
      className="block rounded-xl border bg-card p-3 transition-colors hover:bg-accent/40 active:bg-accent/60"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Calendar
              className="h-3.5 w-3.5 text-muted-foreground"
              aria-hidden
            />
            <p className="truncate text-sm font-semibold">
              {bulan} {tahun}
            </p>
            <Badge variant={billStatusVariant[bill.status]}>
              {billStatusLabel[bill.status]}
            </Badge>
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {bill.studentName} · {bill.className}
          </p>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Nominal
          </dt>
          <dd className="text-sm font-medium">{formatCurrency(bill.amount)}</dd>
        </div>
        <div className="text-right">
          <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Sisa Bayar
          </dt>
          <dd
            className={
              sisa === 0
                ? "text-sm font-bold text-primary"
                : "text-sm font-bold text-destructive"
            }
          >
            {formatCurrency(sisa)}
          </dd>
        </div>
      </dl>
    </Link>
  );
}
