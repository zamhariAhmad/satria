import { faker } from "@faker-js/faker";
import type {
  Payment,
  PaymentMethod,
} from "@/features/payment/schemas/payment";
import type { Bill } from "@/features/bill/schemas/bill";

const METHODS: PaymentMethod[] = [
  "va_bca",
  "va_mandiri",
  "va_bni",
  "qris",
  "manual",
];

export function makePaymentsForPaidBills(bills: Bill[]): Payment[] {
  return bills
    .filter((b) => b.status === "paid")
    .map((b, i) => ({
      id: `pay-${b.id}`,
      billId: b.id,
      studentName: b.studentName,
      billTitle: b.title,
      amount: b.amount,
      method: faker.helpers.arrayElement(METHODS),
      status: "success" as const,
      paidAt: faker.date
        .between({
          from: new Date(b.createdAt),
          to: new Date(b.dueDate),
        })
        .toISOString(),
      gatewayRef: faker.string.alphanumeric(12).toUpperCase(),
      createdAt: b.createdAt,
    }))
    .sort(
      (a, b) =>
        new Date(b.paidAt ?? b.createdAt).getTime() -
        new Date(a.paidAt ?? a.createdAt).getTime(),
    )
    .slice(0, 50);
}
