import { z } from "zod";

export const billStatusSchema = z.enum([
  "open",
  "partial",
  "paid",
  "overdue",
  "cancelled",
]);
export type BillStatus = z.infer<typeof billStatusSchema>;

export const billTypeSchema = z.enum([
  "syahriah",
  "psb",
  "hbh",
  "heregistrasi",
  "tunggakan_bebas",
  "re_registration",
  "meal",
  "event",
  "infaq",
]);
export type BillType = z.infer<typeof billTypeSchema>;

export const billSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  className: z.string(),
  billType: billTypeSchema,
  title: z.string(),
  period: z.string(),
  amount: z.number().nonnegative(),
  paid: z.number().nonnegative(),
  dueDate: z.string(),
  status: billStatusSchema,
  notes: z.string().optional(),
  createdAt: z.string(),
});
export type Bill = z.infer<typeof billSchema>;

export const billListResponseSchema = z.object({
  items: z.array(billSchema),
  total: z.number(),
});
export type BillListResponse = z.infer<typeof billListResponseSchema>;
