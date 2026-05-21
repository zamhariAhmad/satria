import { z } from "zod";

export const notificationTypeSchema = z.enum([
  "bill_new",
  "bill_due",
  "payment_success",
  "payment_failed",
  "announcement",
]);
export type NotificationType = z.infer<typeof notificationTypeSchema>;

export const notificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  type: notificationTypeSchema,
  readAt: z.string().nullable(),
  createdAt: z.string(),
});
export type Notification = z.infer<typeof notificationSchema>;
