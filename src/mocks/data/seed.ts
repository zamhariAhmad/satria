import type { User } from "@/features/auth/schemas/user";
import type { Notification } from "@/features/notification/schemas/notification";
import type {
  PaymentSummary,
  PaymentCategorySummary,
} from "@/features/payment/schemas/summary";
import type { BillType } from "@/features/bill/schemas/bill";
import { billTypeFullLabel } from "@/features/bill/lib/types";
import { makeMonthlySppBills, makeExtraBills } from "../factories/bill";
import { makeStudents } from "../factories/student";
import { makePaymentsForPaidBills } from "../factories/payment";

const currentYear = new Date().getFullYear();

export const seedUser: User = {
  id: "user-wali-1",
  name: "Bapak Ahmad Hidayat",
  email: "wali@satria.test",
  phone: "+62 812 3456 7890",
  role: "wali",
};

export const seedAdminUser: User = {
  id: "user-admin-1",
  name: "Ustadzah Siti",
  email: "admin@satria.test",
  phone: "+62 813 0000 0001",
  role: "admin",
};

export const seedStudents = makeStudents(2, seedUser.id);

export const seedBills = seedStudents.flatMap((s) => [
  ...makeMonthlySppBills(s, currentYear),
  ...makeExtraBills(s),
]);

export const seedPayments = makePaymentsForPaidBills(seedBills);

export const seedNotifications: Notification[] = [
  {
    id: "notif-1",
    title: "Tagihan SPP Mei tersedia",
    body: "Mohon lakukan pembayaran sebelum 10 Mei untuk menghindari denda.",
    type: "bill_new",
    readAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: "notif-2",
    title: "Pembayaran SPP April berhasil",
    body: "Terima kasih, kwitansi sudah tersedia di riwayat.",
    type: "payment_success",
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
  },
  {
    id: "notif-3",
    title: "Pengumuman: Daftar ulang semester",
    body: "Periode daftar ulang dibuka 1 - 30 Juni 2026.",
    type: "announcement",
    readAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
  },
];

export function getDashboardSummary() {
  const totalBilled = seedBills.reduce((acc, b) => acc + b.amount, 0);
  const totalPaid = seedBills.reduce((acc, b) => acc + b.paid, 0);
  const totalOutstanding = totalBilled - totalPaid;
  const overdueCount = seedBills.filter((b) => b.status === "overdue").length;
  const collectionRate = totalBilled === 0 ? 0 : totalPaid / totalBilled;

  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - (5 - i));
    const key = `${month.getFullYear()}-${(month.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    const bills = seedBills.filter((b) => b.period === key);
    return {
      month: month.toLocaleString("id-ID", { month: "short" }),
      billed: bills.reduce((a, b) => a + b.amount, 0),
      paid: bills.reduce((a, b) => a + b.paid, 0),
    };
  });

  return {
    totalBilled,
    totalPaid,
    totalOutstanding,
    overdueCount,
    collectionRate,
    monthlyTrend,
    recentPayments: seedPayments.slice(0, 5).map((p) => ({
      id: p.id,
      studentName: p.studentName,
      amount: p.amount,
      paidAt: p.paidAt ?? p.createdAt,
      method: p.method,
    })),
  };
}

export function getPaymentSummary(): PaymentSummary {
  const featuredTypes: BillType[] = [
    "syahriah",
    "hbh",
    "psb",
    "heregistrasi",
    "tunggakan_bebas",
  ];

  const categories: PaymentCategorySummary[] = featuredTypes.map((type) => {
    const bills = seedBills.filter((b) => b.billType === type);
    const totalBilled = bills.reduce((a, b) => a + b.amount, 0);
    const totalPaid = bills.reduce((a, b) => a + b.paid, 0);
    return {
      type,
      label: billTypeFullLabel[type],
      totalBilled,
      totalPaid,
      outstanding: Math.max(0, totalBilled - totalPaid),
      count: bills.length,
    };
  });

  const totalBilled = seedBills.reduce((a, b) => a + b.amount, 0);
  const totalPaid = seedBills.reduce((a, b) => a + b.paid, 0);

  return {
    totalBilled,
    totalPaid,
    totalOutstanding: Math.max(0, totalBilled - totalPaid),
    categories,
  };
}
