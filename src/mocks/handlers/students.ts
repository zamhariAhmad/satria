import { http, HttpResponse, delay } from "msw";
import { env } from "@/config/env";
import { seedStudents } from "../data/seed";

const base = env.apiBaseUrl;

export const studentHandlers = [
  http.get(`${base}/me/students`, async () => {
    await delay(150);
    return HttpResponse.json({ data: seedStudents, error: null });
  }),
  http.get(`${base}/students`, async () => {
    await delay(250);
    return HttpResponse.json({
      data: { items: seedStudents, total: seedStudents.length },
      error: null,
    });
  }),
];
