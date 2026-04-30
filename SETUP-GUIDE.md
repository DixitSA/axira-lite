# Axira Lite — Setup & Execution Guide

## Before You Start

### Prerequisites
- Node.js 18+
- Claude Code installed and authenticated
- Terminal ready (Windows Terminal recommended)

### Directory Setup
```bash
cd "D:\Corner Store Marketing Agency"
npx create-next-app@latest axira-lite --typescript --tailwind --app --src-dir --eslint
cd axira-lite
```

### Drop CLAUDE.md Into Root
Copy the CLAUDE.md file into `D:\Corner Store Marketing Agency\axira-lite\CLAUDE.md`

---

## How to Run Sessions

### Terminal 1: Dev Server
```bash
cd "D:\Corner Store Marketing Agency\axira-lite"
npm run dev
```
Keep this running. Check `localhost:3000` after each phase.

### Terminal 2: Claude Code
```bash
cd "D:\Corner Store Marketing Agency\axira-lite"
claude
```

---

## Phase-by-Phase Prompts

Paste these into Claude Code one at a time. One phase per session.

---

### Phase 0: Scaffold

```
Read CLAUDE.md. Execute Phase 0.

Install prisma and @prisma/client. Initialize prisma with SQLite datasource.

Create the schema with all 5 models (Business, Client, Job, Invoice, ReminderMessage) exactly as defined in CLAUDE.md. Include all relations.

Run the migration: `npx prisma migrate dev --name init`

Create prisma/seed.ts with realistic contractor business data:
- 1 business (mobile detailing company)
- 30 clients with realistic names, phones, varied statuses
- 80 jobs spread across last 90 days and next 7 days. Mix of SCHEDULED (future), IN_PROGRESS (today), COMPLETED (past), CANCELLED. Realistic service titles: "Full Detail - Sedan", "Interior Clean - SUV", "Ceramic Coating", "Paint Correction", etc.
- 50 invoices linked to completed/in-progress jobs. Mix: ~20 PAID (with paidDate and paidAmount), ~15 PENDING, ~10 OVERDUE (dueDate in past, no paidDate), ~5 DRAFT.
- Make the numbers believable: detailing jobs range $150-$800. Some clients have 5+ jobs, some have 1. Top clients have $3k-$8k lifetime revenue.

Configure seed script in package.json. Run seed. Verify with `npx prisma studio`.

Create lib/db.ts (prisma singleton), lib/utils/invoice-status.ts, lib/utils/client-health.ts, lib/utils/dashboard-actions.ts, lib/utils/format.ts, lib/utils/constants.ts — all per CLAUDE.md spec.

Commit: "phase 0: scaffold, schema, seed, utilities"
```

---

### Phase 1: Layout + Dashboard

```
Read CLAUDE.md. Execute Phase 1.

Build the root layout with a fixed left sidebar (240px). Navigation items: Dashboard, Jobs, Invoices, Clients, Reminders. Use lucide-react icons. Active state: accent bg with white text. Inactive: gray text. App name "Axira" at top of sidebar, text-lg font-semibold.

Build the dashboard page as a server component. Query real data from the database.

KPI row (6 cards in a grid):
1. Revenue This Month — sum of paidAmount on invoices paid this month
2. Outstanding — sum of amount on unpaid invoices (PENDING + OVERDUE)
3. Overdue — sum of amount on OVERDUE invoices only
4. Jobs This Week — count of jobs with scheduledStart this week
5. Active Clients — count of clients with lastJobAt within 30 days
6. At-Risk Clients — count of clients with lastJobAt 60-120 days ago

Action Center below KPIs — use dashboard-actions.ts to compute action cards. Each card: icon, title, description with counts/amounts, colored left border by priority, clickable (href to relevant page).

Below action center, two columns:
- Left: "Today's Jobs" and "Tomorrow's Jobs" — compact lists showing client name, service, time, status badge
- Right: "Overdue Invoices" and "Due Soon" — compact lists showing client, amount, due date, days overdue

Build reusable components: kpi-card.tsx, action-card.tsx, status-badge.tsx, empty-state.tsx, loading-skeleton.tsx.

Follow the design system exactly. gray-50 page bg. White cards with border-gray-200 and rounded-lg. No shadows.

Commit: "phase 1: layout, sidebar, dashboard with live data"
```

---

### Phase 2: Jobs Page

```
Read CLAUDE.md. Execute Phase 2.

Build the jobs page. Server component for initial data load, client component wrapper for filters and interactions.

Page header: "Jobs" title, job count, "Add Job" button (disabled/placeholder for now).

Data table with columns: Client (firstName lastName), Title, Scheduled Date (formatted), Status (badge), Amount (formatted currency), Invoice Status (badge — "Invoiced", "Not Invoiced", "N/A").

Filter bar above table:
- Search input: filters by client name or job title
- Status multi-select: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
- Invoice filter: All, Invoiced, Not Invoiced

Row actions dropdown (three-dot menu):
- "Mark In Progress" (if SCHEDULED) — server action, updates status
- "Mark Complete" (if SCHEDULED or IN_PROGRESS) — server action, sets status=COMPLETED, completedAt=now()
- "Create Invoice" (if COMPLETED and not invoiced) — server action, creates invoice with amount=finalAmount||quotedAmount, status=PENDING, issueDate=now(), dueDate=now()+30days, generates invoiceNumber. Then sets job.invoicedAt=now(). Revalidate page.
- "Cancel" (if not COMPLETED) — server action

Sort by scheduled date descending by default. Clicking column headers toggles sort.

Commit: "phase 2: jobs page with filters, search, status actions, invoice creation"
```

---

### Phase 3: Invoices Page

```
Read CLAUDE.md. Execute Phase 3.

Build the invoices page. Same pattern as jobs: server component + client interactivity.

Page header: "Invoices" title, total count, outstanding amount shown.

Data table columns: Invoice # (INV-XXXX), Client, Linked Job (title or "—"), Amount, Issue Date, Due Date, Status (badge), Days Overdue (number, only shown if overdue, red text).

Overdue rows: red-50 background or 3px red left border. Make them impossible to miss.

Filter bar:
- Search: client name or invoice number
- Status filter: ALL, OVERDUE, PENDING, PAID, DRAFT

Row actions:
- "Mark Paid" — server action: sets paidAmount=amount, paidDate=now(), status="PAID". Also updates client.outstandingBalance (recalculate from all unpaid invoices for that client). Revalidate.
- "Send Reminder" — opens compose modal (build a basic version now, full version in Phase 5). Pre-fills client and invoice context.
- "Void" — server action: sets status="VOID". Revalidate.

Sort by due date ascending by default (most urgent first).

Commit: "phase 3: invoices page with filters, mark paid, void, overdue highlighting"
```

---

### Phase 4: Clients Page

```
Read CLAUDE.md. Execute Phase 4.

Build the clients page.

Page header: "Clients" title, total count.

Data table columns: Name (firstName + lastName), Phone (formatted), Total Revenue (currency), Outstanding Balance (currency, red if > 0), Last Job (relative date — "3 days ago", "2 months ago"), Health (status badge using client-health.ts).

Derive health status at query time for each client using the utility function. Do not store it.

Search: filter by name or phone number.

Sort: default by lastJobAt descending (most recent first). All columns sortable.

Quick actions per row:
- "New Job" — placeholder link to /jobs (or opens simple form later)
- "Send Reminder" — opens compose modal with client pre-filled

Clients with outstanding balance > 0: subtle highlight or indicator.
AT_RISK and INACTIVE clients: health badge should be visually prominent (red/amber).

Commit: "phase 4: clients page with derived health, search, sort, quick actions"
```

---

### Phase 5: Reminders

```
Read CLAUDE.md. Execute Phase 5.

Build the reminder compose modal as a client component.

Modal trigger: "Send Reminder" buttons across jobs, invoices, and clients pages.

Modal contents:
- "To" field: client name + phone (pre-filled, read-only when triggered from context)
- Template buttons: "Overdue Invoice", "Job Confirmation", "Follow-up / Rebook"
- Message textarea: pre-filled when template selected, fully editable
- "Send" button

Template logic (lib/utils/reminder-templates.ts):
- Overdue: "Hi {firstName}, this is {businessName}. You have an outstanding balance of {amount} due on {dueDate}. Please let us know if you have any questions. Thanks!"
- Job Confirmation: "Hi {firstName}, just confirming your {serviceType} appointment on {appointmentDate}. See you then! — {businessName}"
- Follow-up: "Hi {firstName}, it's been a while since your last {serviceType} with us. Ready to schedule another? Reply or call us anytime. — {businessName}"

On send: server action creates ReminderMessage record with status="SENT", sentAt=now(). Show success toast. Close modal.

Build reminders page at /reminders: simple table showing all ReminderMessage records. Columns: Client, Message (truncated), Status, Sent At. Sorted by sentAt desc. No actions needed — read-only log.

Commit: "phase 5: compose modal with templates, reminder log page"
```

---

### Phase 6: Polish

```
Read CLAUDE.md. Execute Phase 6.

Full audit pass:

1. Click every button on every page. If it doesn't do something, either make it work or remove it.
2. Verify dashboard KPI numbers match actual database counts. Query independently and compare.
3. Check all pages at 1280px, 1440px, and 768px widths. Sidebar should collapse to icon-only or hamburger on mobile.
4. Add loading.tsx skeleton files for dashboard, jobs, invoices, clients, reminders.
5. Verify empty states render correctly (test by temporarily clearing seed data).
6. Read every string of text in the app. Fix any typos, awkward phrasing, or inconsistencies.
7. Confirm page headers are consistent: same component, same spacing, same pattern on every page.
8. Verify status badges use the exact same color mapping everywhere (constants.ts).
9. Check that compose modal works when triggered from jobs page, invoices page, and clients page.
10. Make sure invoice creation from a job correctly updates all related state.

Commit: "phase 6: polish pass — responsive, loading states, audit, consistency"
```

---

## Session Management Tips

- **One phase per session.** Don't combine.
- If context is getting long, use `/compact` to summarize and keep going.
- If Claude Code asks questions, it's usually because the prompt was ambiguous. Clarify and re-run.
- After each phase, verify in browser before starting the next.
- If something breaks between phases, open a new session with: `Read CLAUDE.md. The app is on Phase N. [describe the issue]. Fix it.`

---

## After All Phases

You'll have:
- A working dashboard with real KPIs and action cards
- A jobs table with status transitions and invoice creation
- An invoices table with mark-paid and overdue highlighting
- A clients table with derived health scoring
- A reminder compose flow with templates
- A reminder log
- No dead buttons, no broken states, no auth complexity

From here, you can layer on:
- Auth (NextAuth or Clerk)
- PostgreSQL swap (one line in schema.prisma)
- Real Twilio integration (replace the DB write with an API call)
- Charts on dashboard
- Client detail pages
- Settings
- CSV import
