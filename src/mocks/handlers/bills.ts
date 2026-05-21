import { http, HttpResponse, delay } from "msw";
import { env } from "@/config/env";
import { seedBills } from "../data/seed";

const base = env.apiBaseUrl;

export const billHandlers = [
  http.get(`${base}/bills`, async ({ request }) => {
    await delay(400);
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const studentId = url.searchParams.get("studentId");
    const billType = url.searchParams.get("billType");
    const page = Number(url.searchParams.get("page") ?? "1");
    const perPage = Number(url.searchParams.get("perPage") ?? "20");

    let items = [...seedBills];
    if (status) items = items.filter((b) => b.status === status);
    if (studentId) items = items.filter((b) => b.studentId === studentId);
    if (billType) items = items.filter((b) => b.billType === billType);

    items.sort(
      (a, b) =>
        new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime(),
    );

    const total = items.length;
    const start = (page - 1) * perPage;
    const slice = items.slice(start, start + perPage);

    return HttpResponse.json({
      data: { items: slice, total },
      meta: { pagination: { page, perPage, total } },
      error: null,
    });
  }),
  http.get(`${base}/bills/:id`, async ({ params }) => {
    await delay(200);
    const bill = seedBills.find((b) => b.id === params.id);
    if (!bill) {
      return HttpResponse.json(
        { data: null, error: { code: "NOT_FOUND", message: "Bill not found" } },
        { status: 404 },
      );
    }
    return HttpResponse.json({ data: bill, error: null });
  }),
];
