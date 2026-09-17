# TyreFlow — C03 Inspection → Offer workflow

Synthetic exercise prototype. Grounded in `../brief.md`, `../SRS.md`, `../initial.json` and
`../master-build-prompt.md`. No real customers, shops, or messages.

## Run

```bash
npm install
npm run dev
```

No env vars, database or backend — all state lives in memory for the session. Deployable to Vercel
as-is. Supabase is the planned backing store.

## Routes

| Route | Role | What |
|---|---|---|
| `/login` | both | Demo role picker (no password, no real auth) |
| `/technician` | technician | Log an inspection; flag "customer is in the shop right now" |
| `/dashboard` | coordinator | Stats + revenue projection + action queue + breakdown (analytics merged in) |
| `/queue` | coordinator | Action needed / Resolved / Rejected / No action, filters, bulk-approve, demo injections |
| `/stock` | coordinator | Flagged stock needs, stock on record, offers currently blocked |
| `/settings` | both | Default language & channel, outreach window, pricing/discount, message templates |

The technician's sidebar contains only Inspections and Settings — they never see the queue and
never contact a customer.

## The stock gate

We never contact a customer about a tyre we cannot supply.

| Stock state | What happens |
|---|---|
| Unconfirmed / no record | **Contacting blocked.** Approve is disabled; the coordinator flags the size to the stock board instead |
| Confirmed, fewer units than needed | Contacting allowed, draft stays cautious about quantity |
| Confirmed with enough units | Contacting allowed, firm wording |

Confirming a size unblocks contacting automatically and raises a notification — but sending still
needs a human click. Rejected-on-stock records return only via the Feature 8 reminder.

**Outreach window, not visit history.** `initial.json` has no visit history — only the next
appointment — so "only customers who visited in the last X months" cannot be built without
inventing customer data. Instead, when stock lands, only customers whose **appointment** falls
inside the outreach window (default 14 days, configurable) are raised. The right "X months" is a
client discovery question: does their CRM even track visits, and what is their maintenance cycle?

## Queue structure and priority

Four buckets: **Action needed** (Offer Draft + Review Task), **Resolved**, **Rejected**,
**No action** (greyed, kept as proof the system found nothing to do).

```
urgency score = days_until_appointment + state_weight + stock_penalty
state_weight:  offer_draft 0 · review_task +2 · no_action excluded
stock_penalty: confirmed 0 · short 0.25 · unconfirmed 0.5 · none 0.75
```

On the supplied records that yields **TY-3 → TY-1 → TY-2**, with TY-4 absent from Action needed.

Transitions: approve slides the row right into Resolved (~420ms), reject slides it left into
Rejected, injections re-classify instantly with no animation, and reset restores everything.

## Channels

WhatsApp · SMS (character-counted) · Email (subject + formal register) · **Call**.

The call channel gives a spoken script, a `tel:` button, and a real `.ics` download for the
appointment. The number shown is a labeled placeholder — `initial.json` stores no phone numbers,
only whether a customer is reachable. Automated voice calling is a labeled stub, not built.

Every message is template-driven in three languages (French / Darija RTL / English) and fully
editable in Settings, with per-template reset to default. Tokens: `{{customer}} {{axles}} {{size}}
{{date}} {{stock}} {{price}} {{shop}}`.

## Alerts

Bell + notification centre in the top bar: unread badge, urgent styling, click-through to the
record. Fires on in-shop flags (technician marks the customer as still on site so the coordinator
can catch them before they leave), new inspections, and stock confirmations. In-app only —
email/push is planned, not built.

## Dates and pricing

Appointments are real calendar dates. `initial.json` expresses them as "Day N" with no anchor, so
each is mapped onto a concrete date from the session start; the original string is kept on the
record as provenance and shown in the evidence block.

Prices come from a small **demo price list** per size with a flat discount selector (0/5/10/15%) —
`initial.json` carries no pricing, so every figure is labeled illustrative. No catalogue.

## Explicitly rejected (do not re-add)

- **No auto-send, anywhere.** Bulk-approve, resurrection and stock-unblocking are all explicit
  human clicks.
- **No customer history, profile or segmentation.** Only `customer_id` exists per customer; no
  loyalty tier, visit count or ranking is fabricated.

## Real vs. simulated

| Component | Status |
|---|---|
| Classification, stock gate, priority, buckets, approve/reject/resurrect | **Real** — computed live |
| WhatsApp / SMS / email / call delivery | **Simulated** — labeled everywhere; only the `.ics` file is a real artifact |
| Login, accounts, email/push alerts | **Stub** — role picker only; Supabase auth planned |
| Stock confirmation | **Simulated** — static `confirmed` flag, no inventory system |
| Prices and projection | **Demo price list**, illustrative |
| Persistence | **None yet** — in-memory, resets on reload |

## Data

`TY-1..TY-4` and `ST-1/ST-2` are verbatim `initial.json` and never altered. `TY-5..TY-14` and
`ST-3..ST-5` are added demo volume tagged **simulated**; technician entries are tagged
**technician-entered**.

## Known deviation from the original SRS

US-6 allowed sending an unconfirmed-stock draft with hedged wording. That is now **blocked** —
cautious wording covers the "confirmed but short on units" case instead. This follows the later
instruction that we must not contact customers about tyres we cannot supply.

## Next validation test

Do coordinators act on in-shop alerts before the customer leaves, does the stock gate recover
revenue that used to die in the Rejected bin, and does showing a price with a discount change
response rates? None of it is measurable without a live pilot.
