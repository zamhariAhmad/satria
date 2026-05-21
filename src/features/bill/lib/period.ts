import type { Bill } from "@/features/bill/schemas/bill";

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function billPeriodParts(bill: Bill): { bulan: string; tahun: number } {
  // Period format: "YYYY-MM"; fallback to dueDate.
  const match = /^(\d{4})-(\d{2})$/.exec(bill.period);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    return { bulan: MONTH_NAMES[month - 1] ?? "—", tahun: year };
  }
  const d = new Date(bill.dueDate);
  return { bulan: MONTH_NAMES[d.getMonth()], tahun: d.getFullYear() };
}
