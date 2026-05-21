"use client";

import { use } from "react";
import { Calendar, User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { ErrorScreen } from "@/components/common/ErrorScreen";
import { PageHeader } from "@/components/common/PageHeader";
import { useBill } from "@/features/bill/api/use-bills";
import {
  billOutstanding,
  billStatusLabel,
  billStatusVariant,
} from "@/features/bill/lib/status";
import { formatCurrency, formatDate } from "@/lib/format";
import { toast } from "sonner";

type Params = Promise<{ id: string }>;

export default function BillDetailPage({ params }: { params: Params }) {
  const { id } = use(params);
  const { data, isLoading, isError, refetch } = useBill(id);

  if (isLoading) return <LoadingScreen />;
  if (isError || !data)
    return <ErrorScreen onRetry={() => refetch()} description="Tagihan tidak ditemukan." />;

  const outstanding = billOutstanding(data);

  return (
    <div className="space-y-4">
      <PageHeader title={data.title} description={data.studentName} />

      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <Badge variant={billStatusVariant[data.status]}>
            {billStatusLabel[data.status]}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Periode {data.period}
          </span>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-muted-foreground">Jumlah</span>
            <span className="text-base font-medium">
              {formatCurrency(data.amount)}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-muted-foreground">Sudah dibayar</span>
            <span className="text-base font-medium">
              {formatCurrency(data.paid)}
            </span>
          </div>
          <div className="flex items-baseline justify-between border-t pt-2">
            <span className="text-sm font-semibold">Outstanding</span>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(outstanding)}
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" aria-hidden />
            Jatuh tempo {formatDate(data.dueDate)}
          </div>
          <div className="flex items-center gap-1.5">
            <UserIcon className="h-3.5 w-3.5" aria-hidden />
            {data.className}
          </div>
        </div>
      </div>

      <Button
        size="lg"
        className="w-full"
        disabled={data.status === "paid" || data.status === "cancelled"}
        onClick={() =>
          toast.info("Pembayaran akan dihubungkan ke gateway saat API siap.")
        }
      >
        {data.status === "paid" ? "Sudah Lunas" : "Bayar Sekarang"}
      </Button>
    </div>
  );
}
