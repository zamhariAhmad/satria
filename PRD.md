# Product Requirements Document — Satria

**Product:** Satria (Sistem Administrasi Tagihan & Pembayaran Santri)
**Version:** 1.0 (Draft)
**Date:** 2026-05-20
**Owner:** Frontend Engineering
**Status:** Draft — pending stakeholder review

---

## 1. Executive Summary

### 1.1 Background
Most pesantren still manage student payments (SPP, registration, meal fees, event fees, donations) through spreadsheets, paper books, or fragmented WhatsApp messages. This makes it hard for parents (wali) to track outstanding bills, for finance admins to reconcile incoming transfers, and for leadership to get a real-time view of cash flow.

### 1.2 Product Vision
Satria is a mobile-first web application that gives every stakeholder a single, trustworthy view of student payments. Parents see what they owe and pay in a few taps. Admins record and reconcile payments quickly. Leadership monitors collection performance at a glance.

### 1.3 Tagline
"Monitoring pembayaran santri yang transparan dan mudah."

### 1.4 Scope of This Document
This PRD covers the **frontend web application** built by the frontend team. The backend API is owned by a separate team and is consumed via REST. A mock layer (MSW) is included so frontend development can proceed before the backend is ready.

---

## 2. Goals & Success Metrics

### 2.1 Business Goals
- Reduce overdue payments by 30% within the first 6 months of rollout.
- Cut the time admins spend on manual reconciliation by at least 50%.
- Improve transparency and trust between the pesantren and parents.

### 2.2 Product Goals
- Deliver a mobile-first experience usable on entry-level Android devices.
- Provide self-service payment for parents via Virtual Account, QRIS, and payment gateway.
- Provide a fast, reliable admin workflow for manual payment recording and verification.

### 2.3 Success Metrics (KPIs)
| Metric | Target |
| --- | --- |
| % of bills paid before due date | ≥ 80% |
| Avg. time to reconcile a manual payment | ≤ 2 minutes |
| Avg. mobile Lighthouse Performance score | ≥ 85 |
| Wali active monthly usage | ≥ 70% of registered wali |
| Crash-free sessions | ≥ 99% |

---

## 3. Personas & Roles

### 3.1 Wali Santri (Parent/Guardian) — primary user
- **Goals:** know what to pay, pay easily, keep receipts.
- **Pain points:** unclear bills, lost receipts, repeated questions to admin.
- **Devices:** mostly Android phones, limited bandwidth.
- **Key screens:** dashboard, bill list, bill detail, payment, history.

### 3.2 Santri (Student)
- **Goals:** view their own bills and payment history.
- **Devices:** phone, occasionally shared.
- **Permissions:** read-only on their own data.

### 3.3 Admin Keuangan / Bendahara (Finance Admin)
- **Goals:** record manual payments, verify proofs, generate bills, reconcile gateway callbacks.
- **Devices:** mostly desktop but must work on tablets.
- **Permissions:** full CRUD on bills, payments, students, bill types.

### 3.4 Pimpinan Pesantren (Leadership)
- **Goals:** monitor collection performance, see outstanding amounts, export reports.
- **Devices:** phone and desktop.
- **Permissions:** read-only dashboards and reports.

---

## 4. Scope

### 4.1 In-Scope (MVP)
- Authentication and role-based routing.
- Student, class, bill type, and period master data (read for non-admin, CRUD for admin).
- Bill generation (per period, per event, per semester re-registration).
- Payment via Virtual Account, QRIS, payment gateway, and manual recording.
- Payment verification and reconciliation tools for admin.
- Digital receipts (PDF) for paid bills.
- In-app notifications and Firebase Cloud Messaging push.
- Dashboard and basic reports for admin and leadership.
- Voluntary donation (infaq) flow.

### 4.2 Out-of-Scope (MVP)
- Teacher payroll, academic records, attendance.
- Accounting integration (general ledger, journals).
- Auto-debit and installment plans.
- Multi-tenant SaaS support.
- Native mobile apps (web is mobile-first and PWA-ready).

---

## 5. User Stories

### 5.1 Wali Santri
- As a wali, I want to see all outstanding bills for my child so I know how much to pay.
- As a wali, I want to pay a bill via QRIS or VA so I do not need to visit the office.
- As a wali, I want to receive a push notification when a new bill is issued or due soon.
- As a wali, I want to download a receipt after payment so I have proof.
- As a wali, I want to make a voluntary donation (infaq) so I can support the pesantren.

### 5.2 Santri
- As a santri, I want to view my own bills and history so I can stay informed.

### 5.3 Admin
- As an admin, I want to generate monthly SPP bills in bulk so I do not enter them one by one.
- As an admin, I want to record a manual payment and attach proof so the wali's record is updated.
- As an admin, I want gateway callbacks to update bill status automatically so I save time.
- As an admin, I want to filter, search, and export the bill list so I can analyze data.

### 5.4 Pimpinan
- As a pimpinan, I want a dashboard of total billed, paid, and outstanding so I understand cash flow.
- As a pimpinan, I want to see overdue students by class so I can follow up.

---

## 6. Functional Requirements

### 6.1 Authentication & Profile
- Email/phone + password login.
- OTP verification for first-time wali registration (handled by backend).
- Forgot password flow.
- Profile page: change password, update phone, manage FCM push permission.
- Multi-child support: a wali can switch between linked santri.

### 6.2 Master Data (Admin)
- CRUD: santri, kelas/halaqah, bill type, billing period, academic year.
- Import students via CSV (post-MVP if backend not ready).

### 6.3 Bill Management
- Bill types: SPP (monthly), Registration, Re-registration (per semester), Meals/Asrama, Event, Infaq (voluntary).
- Admin can generate bills in bulk per period or per cohort.
- Each bill: amount, due date, status (open, partial, paid, overdue, cancelled), notes.
- Wali sees grouped bills per santri with totals.

### 6.4 Payment
- Methods: VA (Bank Mandiri/BCA/BNI/BRI), QRIS, payment gateway (Midtrans or Xendit), manual record by admin.
- Wali selects bill(s) → chooses method → backend returns instructions or redirect URL.
- Status polling via TanStack Query refetch + push notification on success.
- Partial payments allowed if backend supports.

### 6.5 Verification & Reconciliation
- Webhook updates handled by backend; frontend reflects status.
- Admin "Pending Verification" queue for manual proofs.
- Admin can approve, reject (with reason), or adjust amount.

### 6.6 Receipts & History
- Paid bills produce a PDF receipt downloadable by wali.
- History view: filter by period, type, status; export CSV (admin).

### 6.7 Notifications
- In-app notification center with unread counter.
- Firebase Cloud Messaging push for: new bill, due-date reminder (H-3, H-1, due day), payment success, payment failure, broadcast announcements.
- Per-user preferences for which channels to receive.

### 6.8 Dashboard & Reports
- Admin dashboard: total billed, total paid, outstanding, overdue count, top overdue students, recent payments.
- Pimpinan dashboard: trend chart (monthly), collection rate, breakdown by bill type and class.
- Reports: bill summary, payment summary, outstanding by class. Export PDF/Excel.

### 6.9 Voluntary Donation (Infaq)
- Wali can donate any amount with optional note and "as anonymous" toggle.
- Receipt issued on success.

---

## 7. User Flows (high-level)

### 7.1 Wali pays SPP via VA
1. Wali opens app → Dashboard shows outstanding total.
2. Taps "Bills" tab → sees list grouped by santri.
3. Taps a bill → "Pay Now" → selects VA bank.
4. Receives VA number and instructions; status badge shows "Waiting for payment".
5. After bank transfer, backend webhook flips status to "Paid"; wali receives FCM push and sees a green "Paid" badge.

### 7.2 Admin records a manual payment
1. Admin opens Bills → filters by santri or status.
2. Opens bill → "Record Payment" → enters amount, method, date, optional proof file.
3. Submits → bill status updates to Paid/Partial; receipt generated.

### 7.3 Pimpinan reviews monthly performance
1. Opens Dashboard → date range = this month.
2. Reviews collection rate chart and overdue list.
3. Exports outstanding-by-class report as PDF.

### 7.4 Bill auto-generation
- Backend cron creates monthly SPP bills on day 1 of each month and re-registration bills on semester start. Frontend simply lists them.

---

## 8. Architecture & Tech Stack (Frontend)

### 8.1 Stack
- **Framework:** Next.js 15 (App Router) + TypeScript (strict).
- **Styling:** Tailwind CSS + shadcn/ui (Radix primitives).
- **Server state:** TanStack Query v5 (queries, mutations, infinite queries).
- **Forms:** React Hook Form + Zod resolver.
- **Validation:** Zod schemas shared by forms, mocks, and API parsing.
- **Client state:** Zustand for cross-cutting UI state (auth user, theme, notifications drawer).
- **HTTP client:** `fetch` wrapped with a thin client (`lib/api.ts`) — interceptors for auth, error normalization.
- **Push:** Firebase Cloud Messaging Web SDK.
- **Tables:** TanStack Table.
- **Charts:** Recharts.
- **Icons:** lucide-react.
- **Toasts:** sonner.
- **PDF (receipts):** server-side from backend; frontend just downloads.
- **i18n:** ID first; strings centralized for future EN.

### 8.2 Why this stack
- Next.js App Router gives streaming, route groups, and good DX for mobile-first SSR/CSR mix.
- TanStack Query handles caching, retries, and optimistic UI cleanly.
- shadcn/ui yields fully owned, themable components — perfect for the green Satria identity.
- Zod + RHF is the de-facto choice for typed, runtime-validated forms.

### 8.3 Theming (Green Dominant)
shadcn theme variables in `globals.css`:
- `--primary: 142 71% 45%` (≈ Tailwind `green-600`).
- `--primary-foreground: 0 0% 100%`.
- `--ring: 142 71% 45%`.
- Soft surfaces use `green-50`/`green-100`.
- Semantic: success = green, warning = amber, danger = red, info = blue-500.
- **Font:** Inter (loaded via `next/font/google`), weights 400/500/600/700.

### 8.4 Mobile-First Layout
- Default viewport target: 360–414px width.
- Bottom navigation bar for primary tabs (Home, Bills, History, Profile) on mobile.
- Sticky top header with brand + bell.
- Cards and lists, never wide tables, on mobile; tables appear from `md:` breakpoint.
- Tap targets ≥ 44px, type scale ≥ 14px body.
- Safe-area padding for iOS notches via `env(safe-area-inset-*)`.

### 8.5 Component Strategy (Component-Based)
Three layers, every component in its own file with named export and typed props.

1. **`components/ui/`** — shadcn primitives (Button, Input, Dialog, Sheet, Tabs, Card, Badge, Toast, etc.). Generated via `shadcn add`.
2. **`components/common/`** — composite, app-agnostic pieces:
   - `PageHeader`
   - `BottomNav`
   - `TopBar`
   - `EmptyState`
   - `StatCard`
   - `DataTable` (TanStack Table wrapper)
   - `FormField` (RHF + shadcn Input/Select/Textarea wrapper)
   - `ConfirmDialog`
   - `LoadingScreen`, `ErrorScreen`
3. **`features/<domain>/components/`** — domain components:
   - `BillCard`, `BillList`, `BillFilters`, `PayBillSheet`
   - `PaymentMethodSelector`
   - `DashboardSummary`
   - `NotificationItem`

Conventions:
- Server components by default; mark `'use client'` only where needed.
- Co-locate Zod schemas in `features/<domain>/schemas/`.
- Co-locate query hooks in `features/<domain>/api/` (e.g. `useBills`, `useCreatePayment`).
- No business logic in `app/` route files — they orchestrate composition only.

### 8.6 Mock Layer (Pre-API)
Goal: build, run, and demo every flow without the real backend.

- **Library:** MSW (Mock Service Worker), browser worker for client, Node server for tests.
- **Toggle:** `NEXT_PUBLIC_USE_MOCK=true` enables MSW at app bootstrap.
- **Structure:**
  ```
  src/mocks/
    browser.ts
    server.ts
    handlers/
      auth.ts
      bills.ts
      payments.ts
      students.ts
      dashboard.ts
      notifications.ts
    data/
      seed.ts            # deterministic seed
    factories/
      student.ts
      bill.ts
      payment.ts
  ```
- **Schema parity:** the same Zod schemas validate both mock responses and real responses. When backend ships, only `NEXT_PUBLIC_USE_MOCK=false` and a base URL change.
- **Seed data:** 50 santri across 6 classes, 12 months of SPP, mixed statuses (paid, partial, overdue), plus a few event and infaq bills.
- **Latency simulation:** random 200–600ms to mirror real conditions.

### 8.7 Folder Structure
```
src/
  app/
    (auth)/login/page.tsx
    (app)/
      layout.tsx              # mobile shell with TopBar + BottomNav
      dashboard/page.tsx
      bills/page.tsx
      bills/[id]/page.tsx
      history/page.tsx
      profile/page.tsx
      admin/...               # admin-only routes
    layout.tsx
    globals.css
  components/
    ui/                       # shadcn
    common/
  features/
    auth/
    bill/
      api/
      components/
      schemas/
      types/
    payment/
    student/
    dashboard/
    notification/
  lib/
    api.ts
    query-client.ts
    firebase.ts
    format.ts
    cn.ts
  hooks/
  providers/
    QueryProvider.tsx
    ThemeProvider.tsx
    AuthProvider.tsx
    MockProvider.tsx
  config/
    brand.ts
    env.ts
    routes.ts
  mocks/
  styles/
```

---

## 9. API Contract (assumptions)

All endpoints under `/api/v1`, JSON, bearer-token auth.

Standard envelope:
```json
{ "data": {}, "meta": { "pagination": { "page": 1, "perPage": 20, "total": 100 } }, "error": null }
```

Initial endpoints expected from backend:
- `POST /auth/login`
- `GET /me`
- `GET /students` (admin) / `GET /me/students` (wali)
- `GET /bills?studentId=&status=&period=&page=`
- `GET /bills/:id`
- `POST /bills/bulk` (admin)
- `POST /payments` (manual or initiate gateway)
- `POST /payments/:id/verify` (admin)
- `GET /payments?...`
- `GET /dashboard/summary`
- `GET /notifications`
- `POST /devices/fcm-token`

Frontend will mock all of the above via MSW until ready.

---

## 10. Data Model (Frontend Types)

Key entities (full Zod schemas live under each feature):

- **User**: `{ id, name, email, phone, role: 'wali' | 'santri' | 'admin' | 'pimpinan' }`
- **Student**: `{ id, nis, name, className, photoUrl?, waliId }`
- **BillType**: `{ id, code, name, recurring: 'monthly' | 'semester' | 'one_time' }`
- **Bill**: `{ id, studentId, billTypeId, period, amount, paid, dueDate, status, createdAt }`
- **Payment**: `{ id, billId, amount, method, status, paidAt, proofUrl?, gatewayRef? }`
- **Notification**: `{ id, userId, title, body, type, readAt?, createdAt }`

---

## 11. Non-Functional Requirements

- **Performance:** First Contentful Paint < 1.8s on 3G fast; route transitions < 200ms; Lighthouse mobile ≥ 85.
- **Accessibility:** WCAG 2.1 AA target — visible focus, semantic HTML, color contrast ≥ 4.5:1 against the green palette, keyboard support on all dialogs.
- **Security:** HTTPS only; tokens in httpOnly cookies if backend supports, otherwise memory + refresh; route guards via Next middleware; never log PII.
- **Reliability:** Sentry (or backend-equivalent) for error reporting; retry queries with exponential backoff; offline-friendly cache where useful.
- **Internationalization:** copy centralized; default `id-ID`.
- **PWA:** installable, basic offline shell (post-MVP).

---

## 12. Validation & Error Handling

- Every form: Zod schema → `useForm({ resolver: zodResolver(schema) })`.
- API errors normalized to `{ code, message, fields? }`; field-level errors mapped back into RHF.
- UX rules:
  - Toast for transient errors (e.g., network).
  - Inline messages for form fields.
  - Full-screen `ErrorScreen` with retry for fatal route load failures.
- TanStack Query: `retry: 2` on queries, `retry: 0` on mutations; staleTime 30s for lists, 5s for detail.

---

## 13. Notifications (FCM)

- Service worker registered at `/firebase-messaging-sw.js`.
- After login, request notification permission, fetch token, send to backend (`POST /devices/fcm-token`).
- Foreground messages → in-app toast + add to notification center.
- Background messages → native push.
- Triggers (server-side): new bill, H-3 / H-1 / due-day reminders, payment success/failure, broadcast.

---

## 14. Roadmap & Milestones

**Phase 1 — MVP (~6 weeks)**
- Auth, mobile shell, theme, mock layer.
- Wali: dashboard, bills, payment via VA/QRIS/gateway, history, receipt download.
- Admin: student & bill type master, bulk SPP generation, manual payment recording, pending verification queue.
- Pimpinan: dashboard summary.
- FCM push for the four core triggers.

**Phase 2 (~4 weeks)**
- Advanced reports & exports (Excel/PDF).
- Infaq donation flow polished.
- Audit log surface for admin.
- Notification preferences screen.

**Phase 3 (later)**
- Multi-child grouping, autodebit hooks, accounting export, PWA offline shell.

---

## 15. Risks & Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Backend API delays | Blocks frontend | MSW mock layer with full schema parity |
| Payment gateway webhook flakiness | Status drift | Manual reconciliation tools for admin |
| Low wali adoption | Underused product | Mobile-first UX, push reminders, onboarding tips |
| FCM permission denial | No push | Graceful fallback to in-app center + email later |
| Data accuracy in mocks misleads dev | Surprises at integration | Contract-test mocks against backend OpenAPI when available |

---

## 16. Open Questions

1. Multi-child handling: switcher in top bar vs. consolidated list view?
2. Are partial payments allowed by policy? (assumed yes)
3. Discounts and scholarships — supported in MVP?
4. Academic year format: Gregorian (2025/2026) or Hijri?
5. Will admin operate primarily on desktop? (we'll still ship responsive)
6. Final selection between Midtrans and Xendit as the gateway.

---

## 17. Glossary

- **Santri** — student of a pesantren.
- **Wali** — parent or legal guardian of a santri.
- **SPP** — monthly tuition fee.
- **Daftar ulang** — semester re-registration fee.
- **Infaq** — voluntary donation.
- **VA** — Virtual Account, a bank-issued payable account.
- **QRIS** — Indonesian unified QR payment standard.
- **FCM** — Firebase Cloud Messaging.
