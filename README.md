# TyreFlow — C03: Tyre inspection → customer offer

An inspection observation that should become a customer offer currently dies between the
technician's note and the coordinator seeing it — often after the customer's next appointment has
already passed. This is the working slice that closes that gap.

Synthetic exercise data. No real customers, shops or messages, and **nothing is ever actually
sent**.

## Run it

```bash
npm install
npm run dev
```

Open the printed URL. No environment variables, no database, no backend — state lives in memory
for the session, seeded from `docs/initial.json`.

```bash
npm run build && npm start   # production build
```

## Deploy (Vercel)

The Next.js project is at the repository root, so Vercel needs **zero configuration** — no Root
Directory to set, no environment variables.

1. [vercel.com/new](https://vercel.com/new) → import this repo
2. Leave every setting on its default (Framework: Next.js, Build: `next build`)
3. Deploy

Or from the CLI: `npx vercel --prod`

A deployment shows **exactly the same data as local**: records are compiled in from
`lib/seed-data.ts`, nothing is fetched at runtime. Appointment dates are derived from the session's
start date, so the demo never goes stale.

## The 90-second tour

1. Sign in as **Coordinator** → you land on the **Offer queue**, ranked by urgency.
2. Click any row → the record popup shows the evidence, the confidence meter, the priced draft, and
   Approve / Reject.
3. `TY-3` is **blocked** — stock for 225/45 R17 is unconfirmed, so Approve is disabled. Flag it to
   stock instead.
4. **Stock needs** → Confirm ST-2 → contacting unblocks automatically and an alert fires.
5. Sign out → sign in as **Technician** → log an inspection with *"customer is in the shop right
   now"* → sign back in as Coordinator and you'll **hear** the urgent chime waiting for you.
6. Settings → Demo data → **Reset to initial.json** returns everything to the start.

## What it does

| Area | Behaviour |
|---|---|
| **Classification** | Every wheel set becomes exactly one of Offer Draft / Review Task / No Action. Review tasks list *every* applicable reason, never collapsed — `TY-2` shows missing measurement **and** unreachable contact together. |
| **Priority** | `days_until_appointment + state_weight + stock_penalty`. On the supplied data: TY-3 → TY-1 → TY-2, with TY-4 excluded from Action needed. |
| **Stock gate** | Unconfirmed or missing stock **blocks contacting**; the size is flagged to a stock board instead. Confirming it unblocks contacting and raises an alert. Confirmed-but-short keeps cautious wording. |
| **Queue buckets** | Action needed · Resolved · Rejected (never deleted, with a reason) · No action (greyed, proof the system found nothing to do). |
| **Channels** | WhatsApp · SMS (character-counted) · Email (subject + formal register) · Call (script, `tel:`, real `.ics` download). |
| **Languages** | French (default) · Darija (Arabic, RTL) · English — fully editable templates with per-template reset. |
| **Alerts** | Bell + notification centre, audible chime, urgent tone for in-shop flags. |
| **Pricing** | Demo price list per size with a discount selector; changing the discount rewrites the draft. |
| **Approval** | No auto-send anywhere. Approve, bulk-approve and bringing a rejected record back are all explicit clicks. |

## Real vs. simulated

**Real** — computed live from the data, not scripted:

- Classification engine (`lib/classify.ts`) and the stock gate (`lib/gating.ts`)
- Urgency scoring and queue ordering (`lib/priority.ts`)
- Evidence display — exact fields from `initial.json`, nothing inferred
- Approve / reject / bulk-approve / resurrect state transitions, with queue animations
- Draft generation from editable templates, in three languages and four channels
- Revenue projection, stock demand vs. supply, review-reason breakdown
- The `.ics` calendar file the call channel produces
- Notification centre and the audible chime

**Simulated or stubbed** — labelled as such in the interface:

- **Message delivery.** Every channel stops at "Approved — message simulated, not actually
  delivered". Nothing leaves the browser.
- **Phone number.** `+212 6 00 00 00 00` is a placeholder; `initial.json` stores no phone numbers,
  only whether a customer is reachable.
- **Voice bot.** Labelled "soon", not built.
- **Stock confirmation.** A static `confirmed` flag plus a manual confirm button — no warehouse
  system.
- **Login and accounts.** A role picker with no password and no authorisation. Role gating is
  cosmetic.
- **Pricing.** A demo price list (640–1390 MAD per size), labelled illustrative everywhere it
  appears. `initial.json` carries no pricing.
- **Email / push notifications.** In-app only.
- **Persistence.** In-memory. A reload resets to the starting point by design.

## Data

`TY-1`–`TY-4` and `ST-1`/`ST-2` are **verbatim** `docs/initial.json` and never altered.
`TY-5`–`TY-14` and `ST-3`–`ST-5` are added demo volume, tagged **simulated** in the interface.
Inspections logged through the technician form are tagged **technician-entered**.

`initial.json` expresses appointments as "Day N" with no calendar anchor. The interface works in
real dates, so each is mapped onto a concrete date from the session start; the original string stays
on the record and is shown in the evidence block.

## Limitations

- No persistence, no real delivery channel, no live stock or inventory integration, no real
  authentication, no multi-shop support, no audit trail, no concurrent-coordinator locking.
- No customer history. `initial.json` supplies `customer_id` and nothing else per customer, so
  there is no "last visited" filter — outreach is scoped by **appointment date** (14-day window,
  configurable) rather than an invented visit history.
- Conversion impact is unproven. Only the workflow logic is validated here.
- Single-user session; two roles share one browser.

## Known deviation from the SRS

SRS US-6 allowed sending an unconfirmed-stock draft with hedged wording. That is now **blocked** —
we never contact a customer about a tyre we cannot supply. Cautious wording covers the
"confirmed but short on units" case instead.

## Repository

```
app/         Next.js App Router — login, coordinator views, technician view
components/  UI: queue table, record popup, composer, shell, analytics
lib/         classify · gating · priority · messages · templates · pricing · store
docs/        brief.md · SRS.md · initial.json · master-build-prompt.md · screenshots/
```

Further reading: [WolfHandoff.md](WolfHandoff.md) for the integration handoff, and
[PRESENTATION.md](PRESENTATION.md) for the 3-minute demo script.
