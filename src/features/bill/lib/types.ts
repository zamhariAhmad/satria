import type { BillType } from "@/features/bill/schemas/bill";

export const billTypeLabel: Record<BillType, string> = {
  syahriah: "Syahriah",
  psb: "PSB",
  hbh: "HBH",
  heregistrasi: "Heregistrasi",
  tunggakan_bebas: "Tunggakan Bebas",
  re_registration: "Daftar Ulang",
  meal: "Uang Makan",
  event: "Kegiatan",
  infaq: "Infaq",
};

export const billTypeFullLabel: Record<BillType, string> = {
  syahriah: "Syahriah Bulanan",
  psb: "Penerimaan Santri Baru",
  hbh: "Hari Besar Haul",
  heregistrasi: "Heregistrasi Semester",
  tunggakan_bebas: "Tunggakan Bebas",
  re_registration: "Daftar Ulang Semester",
  meal: "Uang Makan",
  event: "Kegiatan",
  infaq: "Infaq Sukarela",
};
