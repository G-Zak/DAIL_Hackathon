# Wolf Handoff — C03 Tyre Inspection → Offer

## Problem validated

**Pain:** Inspection observations die between the technician and the coordinator. The shop's own
estimate in discovery was that roughly half of tyre-offer opportunities are missed before the
customer's next appointment. *That figure is client-stated and unvalidated — it is the reason to
build, not a result we can claim.*

**Actor:** Tyre and service coordinator.

**Outcome desired:** Coordinator sees the flagged inspection → approves the offer → the customer is
contacted before the appointment.

## Solution proven

Workflow: technician flags → the record queues and classifies itself immediately → coordinator
reviews the evidence and approves or rejects → the message is simulated as sent.

What the demo actually demonstrates:

- **Replicable.** Run it twice and you get the same starting state; Settings → Demo data → Reset
  restores `initial.json` exactly.
- **Correct classification.** All four supplied wheel sets land in the right state: TY-1 and TY-3
  offer drafts, TY-2 a review task, TY-4 no action.
- **Dual-reason review tasks.** TY-2 shows missing measurement **and** unreachable contact
  simultaneously, never collapsed into one generic label.
- **Priority that survives the stock problem.** TY-3 ranks above TY-1 despite unconfirmed stock,
  because its appointment is nearer.
- **Live re-evaluation, no reload.** Confirming stock for a size unblocks contacting, drops the
  cautious wording, and re-ranks the queue in place. Logging an inspection as the technician makes
  it appear in the coordinator queue immediately, already classified.
- **The recovery path.** Reject TY-3 for unconfirmed stock → it sits in the Rejected bin, not
  deleted → confirm the stock → a reminder names TY-3 specifically → one click brings it back as a
  fresh offer draft with firm wording.
- **Cross-role alerting.** A technician flagging *"customer is in the shop right now"* raises an
  urgent notification with an audible chime that the coordinator hears on arriving at their view.

## What's real vs. simulated

**Real:**

- Classification engine and the hard stock gate (decision rules in `lib/classify.ts`,
  `lib/gating.ts`)
- Evidence display — exact fields from `initial.json`, nothing inferred or invented
- Urgency scoring: `days_until_appointment + state_weight + stock_penalty`
- Approval controls and state transitions (approve, reject-with-reason, bulk-approve, resurrect),
  with real queue animations
- Draft generation from editable templates: 3 languages × 4 channels
- Revenue projection, stock demand vs. supply, review-reason breakdown — all computed live
- The `.ics` calendar file the call channel produces
- Notification centre and the audible chime

**Simulated or stubbed (labelled in the interface):**

- **Customer notification.** Every channel stops at "Approved — message simulated, not actually
  delivered." Nothing leaves the browser.
- **Phone number.** `+212 6 00 00 00 00` is a placeholder — `initial.json` has no phone numbers,
  only reachable/not-reachable.
- **Automated voice call.** Labelled "soon". Not built.
- **Stock confirmation.** Static `confirmed` flag plus a manual confirm button. No warehouse
  system.
- **Login, accounts, authorisation.** Role picker only, no password. Role gating is cosmetic.
- **Pricing.** A demo price list, labelled illustrative wherever it appears.
- **Email / push notification delivery.** In-app only.
- **Persistence.** In-memory; a reload resets by design.

## Assumptions stated

| Assumption | Value in the build | Basis |
|---|---|---|
| Language | French default, plus Darija (Arabic, RTL) and English | Moroccan market context. **No per-customer language field exists in `initial.json`** — applied uniformly, never inferred per record |
| Channel | WhatsApp default, plus SMS, email and call | WhatsApp dominance in Morocco. Same caveat: no per-customer channel field exists |
| Pricing | Demo list per size: 640–1390 MAD fitted (195/65 R15 → 235/40 R18), 800 MAD fallback, discount selectable 0–15% | **Not validated.** Illustrative only, so the demo can show how price and a discount change the conversation. `initial.json` has no pricing |
| Outreach scope | Appointment within 14 days (configurable 7/14/30/90) | `initial.json` has **no visit history**, so "customers who visited in the last X months" cannot be built without fabricating customer data. The window is measured against the appointment date instead |
| Stock | Binary `confirmed` flag plus a unit count | Supplied shape. No inventory aging, no warehouse API |
| Shop volume | ~10 inspections/week, ~50% missed today | Client discovery, unvalidated |
| Quantity needed | One tyre per flagged axle | Derived from the front/rear fields; `initial.json` states a technician approves quantity but does not supply it |

## Unresolved risks

1. **Real conversion is unmeasured.** Nothing here proves customers book when reached this way.
   Only the workflow logic is validated.
2. **Stock integration.** The demo gates on a boolean; production needs a live warehouse connection,
   and the gate is only as trustworthy as that feed.
3. **Pricing.** Illustrative. Real fitted prices will differ and change the projection materially.
4. **Customer history and consent.** No visit history, no contact-permission field. A real system
   must capture and honour consent — the current model only knows "reachable / not reachable".
5. **Concurrency.** Single-user session. Two coordinators could approve the same record.
6. **No audit trail.** Approvals and rejections are not recorded anywhere durable.
7. **Outreach window is a guess.** 14 days is a default, not a validated figure. The right window
   (and whether "last visited" should drive it at all) is a discovery question: does the shop's CRM
   even track visits, and what is their maintenance cycle?

## Next validation test

**Pilot with one real shop, one coordinator, two weeks.**

- Give the coordinator the app against live inspection data.
- Measure: share of inspections that become an approved offer (against the ~50% miss baseline).
- Measure: share of approved offers that convert to a booking.
- Measure: minutes saved per coordinator per day.
- Measure: how often the stock gate blocks an offer, and how many of those are recovered from the
  Rejected bin once stock lands — this is the feature with the clearest revenue story.
- Then, and only then, set pricing and discount strategy from real booking data.

## Integration checklist (for the Wolf team)

Before production:

- [ ] Replace the simulated send with a real WhatsApp Business API / SMS / email provider
- [ ] Add per-customer contact details and **consent**, and honour them per channel
- [ ] Hook in the real customer database in place of `lib/seed-data.ts`
- [ ] Connect the live stock system so `confirmed` and unit counts are trustworthy
- [ ] Pull real fitted pricing; replace the demo price list
- [ ] Persist state (Supabase is the planned store) — `lib/store.tsx` is the single swap point
- [ ] Real authentication and role-based authorisation (currently cosmetic)
- [ ] Audit trail: who approved or rejected what, when, and why
- [ ] Multi-user locking for concurrent coordinators
- [ ] Push / email delivery for alerts so the coordinator is reachable off-screen
- [ ] Compliance review: contact permission, data privacy, message retention and audit logs

## Ownership & access

- **Owner:** Tyre and service coordinator.
- **Roles in the build:** `technician` (inspection entry only — never contacts a customer) and
  `coordinator` (queue, approvals, stock board, settings).
- **Permission model:** TODO. Role gating is cosmetic in this slice; both views are reachable
  without authentication.
- **Data:** synthetic throughout. Production uses the shop's own customer records.

## Architecture notes for whoever picks this up

- `lib/seed-data.ts` — the only data source. Swapping it (or the store that reads it) is the
  Supabase integration point.
- `lib/classify.ts` — the three-state classification rules, verbatim from the supplied rules.
- `lib/gating.ts` — the "never contact what we cannot supply" rule. This is the one place that
  decides whether Approve is even available.
- `lib/priority.ts` — the urgency score. Tune the weights here.
- `lib/templates.ts` — default message copy per channel and language; user edits live in settings.
- `lib/store.tsx` — all mutable state and actions in one provider, mounted at the root layout.

## Time spent

- Discovery: 1.5 h (interviews, requirements)
- Build: 4 h (MVP plus the stock gate, rejected-bin recovery, confidence meter, alerting)
- Demo prep: 0.5 h (rehearsal, script)
- **Total: 6 h (Octopus constraint)**
