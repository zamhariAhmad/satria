import { http, HttpResponse, delay } from "msw";
import { env } from "@/config/env";
import { seedPayments } from "../data/seed";

const base = env.apiBaseUrl;

export const paymentHandlers = [
  http.get(`${base}/payments`, async () => {
    await delay(400);
    return HttpResponse.json({
      data: { items: seedPayments, total: seedPayments.length },
      meta: {
        pagination: { page: 1, perPage: 50, total: seedPayments.length },
      },
      error: null,
    });
  }),
  http.post(`${base}/payments`, async () => {
    await delay(500);
    return HttpResponse.json({
      data: {
        id: `pay-${Date.now()}`,
        status: "pending",
        instructions: {
          method: "va_bca",
          vaNumber: "0123 4567 8910 1234",
          expireAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
        },
      },
      error: null,
    });
  }),
];
