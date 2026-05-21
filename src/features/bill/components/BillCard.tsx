import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Bill } from "@/features/bill/schemas/bill";
import {
  billOutstanding,
  billStatusLabel,
  billStatusVariant,
} from "@/features/bill/lib/status";

type BillCardProps = {
  bill: Bill;
};

export function BillCard({ bill }: BillCardProps) {
  const outstanding = billOutstanding(bill);
  return (
    <Link
      href={`/keuangan/${bill.id}`}
      className="block rounded-xl border bg-card p-4 transition-colors hover:bg-accent/40 active:bg-accent/60"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant={billStatusVariant[bill.status]}>
              {billStatusLabel[bill.status]}
            </Badge>
            <span className="truncate text-xs text-muted-foreground">
              {bill.className}
            </span>
          </div>
          <h3 className="mt-2 truncate text-sm font-semibold">{bill.title}</h3>
          <p className="truncate text-xs text-muted-foreground">
            {bill.studentName}
          </p>
        </div>
        <ChevronRight
          className="h-4 w-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Outstanding
          </p>
          <p className="text-base font-semibold">
            {formatCurrency(outstanding)}
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" aria-hidden />
          Due {formatDate(bill.dueDate)}
        </div>
      </div>
    </Link>
  );
}
