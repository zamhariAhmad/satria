import { http, HttpResponse, delay } from "msw";
import { env } from "@/config/env";
import { getDashboardSummary, getPaymentSummary } from "../data/seed";

const base = env.apiBaseUrl;

export const dashboardHandlers = [
  http.get(`${base}/dashboard/summary`, async () => {
    await delay(350);
    return HttpResponse.json({ data: getDashboardSummary(), error: null });
  }),
  http.get(`${base}/dashboard/payment-summary`, async () => {
    await delay(300);
    return HttpResponse.json({ data: getPaymentSummary(), error: null });
  }),
];
