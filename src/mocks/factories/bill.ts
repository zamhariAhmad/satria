import { faker } from "@faker-js/faker";
import type {
  Bill,
  BillStatus,
  BillType,
} from "@/features/bill/schemas/bill";
import type { Student } from "@/features/student/schemas/student";

const TITLES: Record<BillType, string> = {
  syahriah: "Syahriah Bulanan",
  psb: "PSB (Penerimaan Santri Baru)",
  hbh: "HBH (Hari Besar Haul)",
  heregistrasi: "Heregistrasi Semester",
  tunggakan_bebas: "Tunggakan Bebas",
  re_registration: "Daftar Ulang Semester",
  meal: "Uang Makan",
  event: "Kegiatan",
  infaq: "Infaq Sukarela",
};

const AMOUNTS: Record<BillType, number> = {
  syahriah: 750_000,
  psb: 5_000_000,
  hbh: 350_000,
  heregistrasi: 1_500_000,
  tunggakan_bebas: 500_000,
  re_registration: 1_750_000,
  meal: 850_000,
  event: 250_000,
  infaq: 0,
};

function pickStatus(dueDate: Date, paid: number, amount: number): BillStatus {
  if (paid >= amount) return "paid";
  if (paid > 0) return "partial";
  if (dueDate.getTime() < Date.now()) return "overdue";
  return "open";
}

export function makeMonthlySppBills(student: Student, year: number): Bill[] {
  return Array.from({ length: 12 }, (_, monthIdx) => {
    const month = monthIdx + 1;
    const dueDate = new Date(year, monthIdx, 10);
    const amount = AMOUNTS.syahriah;
    const isPast = dueDate.getTime() < Date.now();
    const isCurrent =
      dueDate.getMonth() === new Date().getMonth() &&
      dueDate.getFullYear() === new Date().getFullYear();

    let paid = 0;
    if (isPast && !isCurrent) {
      paid = faker.helpers.weightedArrayElement([
        { value: amount, weight: 7 },
        { value: amount * 0.5, weight: 1 },
        { value: 0, weight: 2 },
      ]);
    }

    return {
      id: `bill-syahriah-${student.id}-${year}-${month}`,
      studentId: student.id,
      studentName: student.name,
      className: student.className,
      billType: "syahriah" as BillType,
      title: `${TITLES.syahriah} ${month.toString().padStart(2, "0")}/${year}`,
      period: `${year}-${month.toString().padStart(2, "0")}`,
      amount,
      paid,
      dueDate: dueDate.toISOString(),
      status: pickStatus(dueDate, paid, amount),
      createdAt: new Date(year, monthIdx, 1).toISOString(),
    } satisfies Bill;
  });
}

export function makeExtraBills(student: Student): Bill[] {
  const types: BillType[] = [
    "psb",
    "hbh",
    "heregistrasi",
    "tunggakan_bebas",
    "re_registration",
    "event",
    "meal",
  ];
  return types.map((t, i) => {
    const dueDate = faker.date.soon({ days: 14 + i * 7 });
    const amount = AMOUNTS[t];
    const paid = faker.helpers.weightedArrayElement([
      { value: amount, weight: 4 },
      { value: Math.round(amount * 0.5), weight: 2 },
      { value: 0, weight: 4 },
    ]);
    return {
      id: `bill-${t}-${student.id}-${i}`,
      studentId: student.id,
      studentName: student.name,
      className: student.className,
      billType: t,
      title: TITLES[t],
      period: `${dueDate.getFullYear()}-${(dueDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`,
      amount,
      paid,
      dueDate: dueDate.toISOString(),
      status: pickStatus(dueDate, paid, amount),
      createdAt: new Date().toISOString(),
    } satisfies Bill;
  });
}
