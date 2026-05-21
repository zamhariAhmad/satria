import { z } from "zod";

export const paymentMethodSchema = z.enum([
  "manual",
  "va_bca",
  "va_mandiri",
  "va_bni",
  "va_bri",
  "qris",
  "gateway",
]);
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const paymentStatusSchema = z.enum([
  "pending",
  "success",
  "failed",
  "expired",
  "refunded",
]);
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export const paymentSchema = z.object({
  id: z.string(),
  billId: z.string(),
  studentName: z.string(),
  billTitle: z.string(),
  amount: z.number().nonnegative(),
  method: paymentMethodSchema,
  status: paymentStatusSchema,
  paidAt: z.string().optional(),
  proofUrl: z.string().url().optional(),
  gatewayRef: z.string().optional(),
  createdAt: z.string(),
});
export type Payment = z.infer<typeof paymentSchema>;
