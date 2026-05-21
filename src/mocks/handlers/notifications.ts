import { http, HttpResponse, delay } from "msw";
import { env } from "@/config/env";
import { seedNotifications } from "../data/seed";

const base = env.apiBaseUrl;

export const notificationHandlers = [
  http.get(`${base}/notifications`, async () => {
    await delay(200);
    return HttpResponse.json({
      data: { items: seedNotifications, total: seedNotifications.length },
      error: null,
    });
  }),
  http.post(`${base}/notifications/:id/read`, async () => {
    await delay(120);
    return HttpResponse.json({ data: { ok: true }, error: null });
  }),
];
