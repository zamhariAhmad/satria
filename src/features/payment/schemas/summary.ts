import { z } from "zod";
import { billTypeSchema } from "@/features/bill/schemas/bill";

export const paymentCategorySummarySchema = z.object({
  type: billTypeSchema,
  label: z.string(),
  totalBilled: z.number(),
  totalPaid: z.number(),
  outstanding: z.number(),
  count: z.number(),
});
export type PaymentCategorySummary = z.infer<
  typeof paymentCategorySummarySchema
>;

export const paymentSummarySchema = z.object({
  totalBilled: z.number(),
  totalPaid: z.number(),
  totalOutstanding: z.number(),
  categories: z.array(paymentCategorySummarySchema),
});
export type PaymentSummary = z.infer<typeof paymentSummarySchema>;
