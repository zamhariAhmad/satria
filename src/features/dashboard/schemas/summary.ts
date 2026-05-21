import { z } from "zod";

export const dashboardSummarySchema = z.object({
  totalBilled: z.number(),
  totalPaid: z.number(),
  totalOutstanding: z.number(),
  overdueCount: z.number(),
  collectionRate: z.number(),
  recentPayments: z.array(
    z.object({
      id: z.string(),
      studentName: z.string(),
      amount: z.number(),
      paidAt: z.string(),
      method: z.string(),
    }),
  ),
  monthlyTrend: z.array(
    z.object({
      month: z.string(),
      billed: z.number(),
      paid: z.number(),
    }),
  ),
});
export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;
