import type { Bill, BillStatus } from "@/features/bill/schemas/bill";

export const billStatusLabel: Record<BillStatus, string> = {
  open: "Belum Bayar",
  partial: "Sebagian",
  paid: "Lunas",
  overdue: "Lewat Tempo",
  cancelled: "Dibatalkan",
};

export const billStatusVariant: Record<
  BillStatus,
  "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "muted"
> = {
  open: "secondary",
  partial: "warning",
  paid: "success",
  overdue: "destructive",
  cancelled: "muted",
};

export function billOutstanding(bill: Bill) {
  return Math.max(0, bill.amount - bill.paid);
}
