import { http, HttpResponse, delay } from "msw";
import { env } from "@/config/env";
import { seedUser, seedAdminUser } from "../data/seed";

const base = env.apiBaseUrl;

const KNOWN_ACCOUNTS = [
  {
    user: seedUser,
    password: "password",
    aliases: ["wali@satria.test", seedUser.phone, "wali"],
  },
  {
    user: seedAdminUser,
    password: "admin123",
    aliases: ["admin@satria.test", seedAdminUser.phone, "admin"],
  },
];

function findAccount(identifier: string) {
  const id = identifier.trim().toLowerCase();
  return KNOWN_ACCOUNTS.find((acc) =>
    acc.aliases.some((a) => a.toLowerCase() === id),
  );
}

export const authHandlers = [
  http.post(`${base}/auth/login`, async ({ request }) => {
    await delay(450);
    let body: { identifier?: string; password?: string } = {};
    try {
      body = (await request.json()) as typeof body;
    } catch {
      /* ignore */
    }
    const account = body.identifier ? findAccount(body.identifier) : null;
    if (!account || account.password !== body.password) {
      return HttpResponse.json(
        {
          data: null,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Email/nomor HP atau password salah.",
          },
        },
        { status: 401 },
      );
    }
    return HttpResponse.json({
      data: {
        token: `mock-token-${account.user.id}-${Date.now()}`,
        user: account.user,
      },
      error: null,
    });
  }),

  http.post(`${base}/auth/register`, async ({ request }) => {
    await delay(600);
    let body: {
      name?: string;
      email?: string;
      phone?: string;
    } = {};
    try {
      body = (await request.json()) as typeof body;
    } catch {
      /* ignore */
    }
    if (!body.name || !body.email || !body.phone) {
      return HttpResponse.json(
        {
          data: null,
          error: {
            code: "INVALID_INPUT",
            message: "Lengkapi data pendaftaran.",
          },
        },
        { status: 400 },
      );
    }
    const newUser = {
      id: `user-wali-${Date.now()}`,
      name: body.name,
      email: body.email,
      phone: body.phone,
      role: "wali" as const,
    };
    return HttpResponse.json({
      data: {
        token: `mock-token-${newUser.id}`,
        user: newUser,
      },
      error: null,
    });
  }),

  http.post(`${base}/auth/forgot-password`, async () => {
    await delay(400);
    return HttpResponse.json({
      data: {
        ok: true,
        message: "Tautan reset telah dikirim. Periksa email atau WhatsApp.",
      },
      error: null,
    });
  }),

  http.post(`${base}/auth/logout`, async () => {
    await delay(150);
    return HttpResponse.json({ data: { ok: true }, error: null });
  }),

  http.get(`${base}/me`, async () => {
    await delay(150);
    return HttpResponse.json({ data: seedUser, error: null });
  }),
];
