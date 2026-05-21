"use client";

import Link from "next/link";
import {
  GraduationCap,
  Sparkles,
  Receipt,
  ClipboardList,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BillType } from "@/features/bill/schemas/bill";
import { usePaymentSummary } from "@/features/payment/api/use-payment-summary";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { ErrorScreen } from "@/components/common/ErrorScreen";
import { formatCurrency } from "@/lib/format";

type CategoryItem = {
  type: BillType;
  label: string;
  icon: LucideIcon;
  tone: "emerald" | "amber" | "sky" | "violet" | "rose";
};

const ITEMS: CategoryItem[] = [
  { type: "syahriah", label: "Syahriah", icon: GraduationCap, tone: "emerald" },
  { type: "hbh", label: "HBH", icon: Sparkles, tone: "amber" },
  { type: "psb", label: "PSB", icon: Receipt, tone: "sky" },
  { type: "heregistrasi", label: "Heregistrasi", icon: ClipboardList, tone: "violet" },
  {
    type: "tunggakan_bebas",
    label: "Tunggakan Bebas",
    icon: AlertTriangle,
    tone: "rose",
  },
];

const TONE_BG: Record<CategoryItem["tone"], string> = {
  emerald: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  sky: "bg-sky-100 text-sky-700",
  violet: "bg-violet-100 text-violet-700",
  rose: "bg-rose-100 text-rose-700",
};

export function CategoryMenuGrid() {
  const { data, isLoading, isError, refetch } = usePaymentSummary();

  if (isLoading) return <LoadingScreen />;
  if (isError || !data) return <ErrorScreen onRetry={() => refetch()} />;

  const summaryByType = new Map(data.categories.map((c) => [c.type, c]));

  return (
    <section
      aria-label="Kategori Tagihan"
      className="rounded-2xl border bg-card p-3"
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold">Kategori Tagihan</h2>
        <span className="text-[11px] text-muted-foreground">
          Pilih kategori
        </span>
      </div>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const summary = summaryByType.get(item.type);
          const outstanding = summary?.outstanding ?? 0;
          const count = summary?.count ?? 0;

          return (
            <li key={item.type}>
              <Link
                href={`/keuangan/kategori/${item.type}`}
                className="group flex h-full flex-col gap-2 rounded-xl border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-accent/40 active:bg-accent/60"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${TONE_BG[item.tone]}`}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <ArrowRight
                    className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </div>
                <p className="truncate text-sm font-semibold">{item.label}</p>
                <div className="mt-auto">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Outstanding
                  </p>
                  <p className="truncate text-sm font-bold text-primary">
                    {formatCurrency(outstanding)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {count} tagihan
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
