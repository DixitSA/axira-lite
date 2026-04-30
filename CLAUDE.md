# CLAUDE.md — Axira Lite

You are the lead engineer building Axira Lite, a dashboard-first operations app for small contractor/service businesses (detailers, landscapers, pressure washers, cleaners, etc.).

Core value: "See your money, track your jobs, send reminders, get paid faster."

This is NOT a CRM, NOT accounting software, NOT enterprise field service. It is a focused operational dashboard.

---

## Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict, no `any`)
- **Styling:** Tailwind CSS
- **Database:** Prisma + SQLite (dev), swappable to PostgreSQL for production
- **Components:** shadcn/ui if present in repo, otherwise hand-rolled with Tailwind
- **Data fetching:** Server components + server actions. No REST API layer.
- **Auth:** None. Single hardcoded business context (`businessId = 1`). All queries scoped to this.

---

## Design System (Enforced)

| Token | Value |
|---|---|
| Font | Inter, 400/500/600 weights |
| Body text | 14px (`text-sm`) |
| Secondary text | 13px |
| KPI numbers | 28–32px, font-semibold |
| Border radius | 8px (`rounded-lg`) |
| Spacing scale | 4/8/12/16/24/32px |
| Cards | `bg-white border border-gray-200 rounded-lg` — no box-shadow unless hover state |
| Accent | `#2563EB` (blue-600) |
| Overdue/Urgent | `red-500` / `red-50` bg |
| Warning/Watch | `amber-500` / `amber-50` bg |
| Healthy/Paid | `green-500` / `green-50` bg |
| Inactive/Muted | `gray-400` / `gray-50` bg |
| Page background | `gray-50` |
| Sidebar | `white` or `gray-900` — pick one, stay consistent |

**Rules:**
- No shadows on cards by default. `shadow-sm` on hover only if interactive.
- No gradients.
- No illustrations or decorative SVGs.
- Typography and spacing create hierarchy — not color overload.
- Tables: compact rows, 40px row height, `text-sm`, alternating row colors only if density demands it.
- Status badges: pill-shaped, colored bg with matching text, `text-xs font-medium px-2 py-0.5 rounded-full`.

---

## Data Model (4 tables)

### Business
```
id            Int       @id @default(autoincrement())
name          String
industryType  String
phone         String
email         String
timezone      String    @default("America/New_York")
createdAt     DateTime  @default(now())
updatedAt     DateTime  @updatedAt
```

### Client
```
id                 Int       @id @default(autoincrement())
businessId         Int
firstName          String
lastName           String
companyName        String?
phone              String
email              String?
address            String?
notes              String?
status             String    @default("ACTIVE")   // ACTIVE | WATCH | AT_RISK | INACTIVE
lastJobAt          DateTime?
totalRevenue       Float     @default(0)
outstandingBalance Float     @default(0)
createdAt          DateTime  @default(now())
updatedAt          DateTime  @updatedAt
```

### Job
```
id              Int       @id @default(autoincrement())
businessId      Int
clientId        Int
title           String
description     String?
address         String
scheduledStart  DateTime
scheduledEnd    DateTime?
status          String    @default("SCHEDULED")  // SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED
quotedAmount    Float?
finalAmount     Float?
internalNotes   String?
completedAt     DateTime?
invoicedAt      DateTime?
createdAt       DateTime  @default(now())
updatedAt       DateTime  @updatedAt
```

### Invoice
```
id             Int       @id @default(autoincrement())
businessId     Int
clientId       Int
jobId          Int?
invoiceNumber  String
amount         Float
paidAmount     Float     @default(0)
issueDate      DateTime
dueDate        DateTime
paidDate       DateTime?
status         String    @default("PENDING")  // DRAFT | PENDING | PAID | OVERDUE | VOID
notes          String?
createdAt      DateTime  @default(now())
updatedAt      DateTime  @updatedAt
```

### ReminderMessage
```
id          Int       @id @default(autoincrement())
businessId  Int
clientId    Int
invoiceId   Int?
jobId       Int?
content     String
status      String    @default("SENT")  // SENT | FAILED
sentAt      DateTime  @default(now())
createdAt   DateTime  @default(now())
```

**No Payment table.** Invoice has `paidAmount` and `paidDate`.
**No ClientHealthSnapshot table.** Health is derived at query time.
**No ActionItem table.** Actions are computed on dashboard load.
**No User table.** Single business context, no auth.

---

## Derived Logic (utility functions, not tables)

### Invoice Status (lib/utils/invoice-status.ts)
```
if (status === "VOID") return "VOID"
if (status === "DRAFT") return "DRAFT"
if (paidDate && paidAmount >= amount) return "PAID"
if (new Date() > dueDate) return "OVERDUE"
return "PENDING"
```
Single source of truth. Never duplicate this logic.

### Client Health (lib/utils/client-health.ts)
```
daysSinceLastJob = today - client.lastJobAt
if (!lastJobAt) return "INACTIVE"
if (daysSinceLastJob < 30) return "ACTIVE"
if (daysSinceLastJob < 60) return "WATCH"
if (daysSinceLastJob < 120) return "AT_RISK"
return "INACTIVE"
```
Thresholds hardcoded in a constants file. No settings page.

### Dashboard Actions (lib/utils/dashboard-actions.ts)
Computed at request time. Returns typed array of action cards:
- Overdue invoices (count + total $)
- Completed jobs missing invoices (count)
- Jobs scheduled today (count)
- Jobs scheduled tomorrow (count)
- AT_RISK or INACTIVE clients with > $500 lifetime revenue (count)
- Invoices due within 3 days (count + total $)

Each action: `{ type, title, description, priority, count, amount?, href }`.

---

## Folder Structure

```
src/
  app/
    layout.tsx          # Root layout with sidebar
    page.tsx            # Redirects to /dashboard
    dashboard/
      page.tsx          # Dashboard (server component)
    jobs/
      page.tsx          # Jobs table
    invoices/
      page.tsx          # Invoices table
    clients/
      page.tsx          # Clients table
    reminders/
      page.tsx          # Reminder log
  components/
    layout/
      sidebar.tsx
      page-header.tsx
    ui/
      kpi-card.tsx
      status-badge.tsx
      action-card.tsx
      data-table.tsx    # Reusable table shell
      empty-state.tsx
      loading-skeleton.tsx
    dashboard/          # Dashboard-specific composites
    jobs/               # Jobs-specific composites
    invoices/           # Invoices-specific composites
    clients/            # Clients-specific composites
    reminders/
      compose-modal.tsx
  lib/
    db.ts               # Prisma client singleton
    utils/
      invoice-status.ts
      client-health.ts
      dashboard-actions.ts
      format.ts         # Currency, date, phone formatters
      constants.ts      # Health thresholds, status colors, etc.
    actions/            # Server actions
      jobs.ts
      invoices.ts
      clients.ts
      reminders.ts
prisma/
  schema.prisma
  seed.ts
```

---

## Build Phases (one per Claude Code session)

### Phase 0: Scaffold
- `npx create-next-app@latest axira-lite --typescript --tailwind --app --src-dir`
- Install Prisma, configure SQLite
- Define schema, run migration
- Write `seed.ts` with realistic data:
  - 1 business
  - 30 clients (mix of statuses)
  - 80 jobs (mix of SCHEDULED/IN_PROGRESS/COMPLETED/CANCELLED, spread across last 90 days + next 7 days)
  - 50 invoices (mix of PAID/PENDING/OVERDUE/DRAFT)
  - Ensure numbers make sense: paid invoices have paidDate/paidAmount, overdue invoices have dueDate in past, etc.
- Run seed, verify with Prisma Studio
- Create `lib/db.ts`, `lib/utils/*` (all utility functions)
- **Deliverable:** `npx prisma studio` shows coherent data. Utility functions exist and are correct.

### Phase 1: Layout + Dashboard
- Root layout with sidebar navigation (Dashboard, Jobs, Invoices, Clients, Reminders)
- Sidebar: fixed left, 240px, icon + label for each nav item, active state
- Dashboard page (server component):
  - KPI row: Revenue (this month), Outstanding, Overdue, Jobs This Week, Active Clients, At-Risk Clients
  - Action Center: computed action cards, sorted by priority, clickable (href to filtered page)
  - Jobs snapshot: today's + tomorrow's jobs in a compact list
  - Invoice snapshot: overdue + due soon in a compact list
- All components: `kpi-card.tsx`, `action-card.tsx`, `status-badge.tsx`
- Loading skeleton for dashboard
- Empty state if no data
- **Deliverable:** Dashboard renders with real seeded data. All KPIs are accurate. Action cards link to correct pages.

### Phase 2: Jobs Page
- Server component with client-side interactivity for filters/actions
- Table columns: Client, Title, Scheduled Date, Status, Amount, Invoice Status
- Filters: status (multi-select), date range, invoiced vs not
- Search by client name or job title
- Row actions: Mark Complete (server action), Create Invoice (navigates or opens modal)
- Status transitions: SCHEDULED → IN_PROGRESS → COMPLETED
- Completing a job sets `completedAt`
- Creating an invoice from a job pre-fills clientId, jobId, amount
- **Deliverable:** Jobs page fully functional. Can filter, search, mark complete, create invoice.

### Phase 3: Invoices Page
- Table columns: Invoice #, Client, Job, Amount, Issue Date, Due Date, Status, Days Overdue
- Filters: status (OVERDUE, PENDING, PAID, DRAFT)
- Search by client name or invoice number
- Row actions: Mark Paid (server action, sets paidAmount + paidDate), Send Reminder (opens compose modal)
- Overdue rows visually distinct (red-50 bg or left border)
- Mark Paid action: sets `paidAmount = amount`, `paidDate = now()`, `status = "PAID"`
- **Deliverable:** Invoices page fully functional. Can filter, mark paid, see overdue clearly.

### Phase 4: Clients Page
- Table columns: Name, Phone, Total Revenue, Outstanding Balance, Last Job, Health Status
- Search by name or phone
- Health status derived at query time using `client-health.ts`
- Row click: no detail page yet, just highlight or expand
- Quick actions: Create Job (navigate), Send Reminder (compose modal)
- Sort by revenue, outstanding balance, last job date, health
- **Deliverable:** Clients page renders with derived health. Sorting/search works.

### Phase 5: Reminders
- Compose modal (client component):
  - Select client (pre-filled if triggered from context)
  - Message textarea
  - Template buttons: "Overdue Invoice", "Job Confirmation", "Follow-up"
  - Templates interpolate: firstName, amount, dueDate, serviceType, appointmentDate
  - Send button → server action → writes ReminderMessage to DB with status SENT
  - No actual SMS delivery. Just DB record.
- Reminders page: log of all sent messages, sorted by sentAt desc
- **Deliverable:** Can compose and "send" reminders from any context. Reminder log shows history.

### Phase 6: Polish
- Verify every button works
- Verify all numbers on dashboard match actual data
- Responsive: sidebar collapses on mobile
- Consistent page headers across all pages
- Loading states on all pages
- Empty states on all pages
- Audit all text for typos
- **Deliverable:** App is demo-ready. No dead buttons. No broken states.

---

## Code Rules

1. No `any` types. Ever.
2. Server components by default. Client components only for interactivity (filters, modals, forms).
3. Mark client components with `"use client"` at the top.
4. All database queries go through server actions or server components. No client-side fetching.
5. Tailwind only. No CSS files. No styled-components. No CSS modules.
6. All monetary values displayed with `formatCurrency()` from `lib/utils/format.ts`.
7. All dates displayed with `formatDate()` / `formatRelativeDate()` from `lib/utils/format.ts`.
8. Status badge colors defined once in `constants.ts`, consumed everywhere.
9. No `console.log` in committed code.
10. Prisma client instantiated once in `lib/db.ts` with the singleton pattern.

---

## Session Workflow

1. Start each session by reading this file.
2. State which phase you're working on.
3. Implement the phase completely.
4. Keep diffs under 200 lines per logical change where possible.
5. Test by running `npm run dev` and verifying in browser.
6. Commit after each phase with message: `phase N: [description]`.
7. Use `/compact` at ~70% context usage.
8. Do not start the next phase in the same session unless context allows.

---

## What NOT to Build

- No auth/login
- No user management
- No settings page
- No CSV import
- No charts (Phase 1 dashboard uses numbers, not charts)
- No API routes (use server actions)
- No Payment model
- No ClientHealthSnapshot model
- No ActionItem model
- No SMS provider integration (just DB writes)
- No tests (until core product works end-to-end)
