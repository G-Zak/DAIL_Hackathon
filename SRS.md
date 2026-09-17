# SRS — C03: Tyre Inspection → Offer Workflow

Synthetic exercise. All data, records and customer references are fictional (see `initial.json`). This SRS covers the first working slice only — scoped for a 6-hour solo build.

**Context: Moroccan market.** This shop operates in Morocco. Practical implications for the build:
- **Languages:** French and Arabic (Darija) are the realistic customer-facing languages for message copy. Note: `initial.json`'s C03 `wheel_sets` do **not** actually carry a `preferred_language` field (that field exists on C01's customer records, a different case) — so this is a build-time assumption applied uniformly, not something read off a supplied record. Label it as such in the UI/README.
- **Channel:** WhatsApp is the dominant messaging channel in Morocco, more so than SMS or email — worth using as the simulated "send" channel in the UI copy (e.g., "Message envoyé via WhatsApp [simulated]"). Same caveat: `initial.json` only gives `contact: available/missing` (can we reach them at all), not a channel choice — WhatsApp-as-channel is an assumption, not supplied data.
- **No currency/pricing claims:** stay consistent with the exercise boundary (no live prices) — doubly relevant here since MAD pricing isn't supplied and shouldn't be invented.
- Keep this contextual, not load-bearing: don't invent Moroccan regulatory or consumer-protection rules not present in the brief — the rules given in `initial.json` remain the only source of truth for logic.

---

## 1. Problem statement

A technician inspects stored wheels and flags a wear/damage issue. That flag needs to become a customer offer before the customer's next booked appointment. Today, the flag sits unseen until it's too late — the coordinator doesn't reliably see it in time, and incomplete records (missing size, unconfirmed stock) get silently ignored or wrongly acted on.

## 2. Roles

| Role | Description | System access |
|---|---|---|
| **Technician** | Inspects wheel sets, records condition per axle + size, approves fitment/quantity | Read/write inspection records (simulated — pre-loaded via `initial.json`, not built as a live input form in v1) |
| **Coordinator** | Reviews flagged records, approves/edits/rejects offers, resolves review tasks | Primary user of the built app — full queue access, approve/reject/edit controls |
| **Stock/Parts (stubbed)** | Confirms size availability | Represented as a static `confirmed: true/false` field, no live interaction in v1 |
| **Customer** | Receives the offer if `contact: available` for their wheel set | Not a system user — receives simulated outbound message only |

## 3. Core entities (from `initial.json`)

- **Wheel set** (`TY-1`..`TY-4`): customer_id, front condition, rear condition, size, appointment date, contact availability.
- **Availability/stock** (`ST-1`, `ST-2`): size, units, confirmed (bool).
- **Rules:** a technician approves fitment/quantity; unknown measurements create a review task; only approved offers may become customer messages.

## 4. User stories

### Epic A — Visibility (the coordinator sees flagged wheel sets immediately)

- **US-1:** As a coordinator, I want to see all wheel sets that need attention in one queue, so I don't have to check paper job cards.
  - *Acceptance:* Queue lists all `wheel_sets` where front or rear is "review replacement" or measurement is missing. Sets with "no concern recorded" on both axles do not appear (or appear dismissed/greyed, no action needed).

- **US-2:** As a coordinator, I want each queue item to show the appointment date, so I know which ones are urgent.
  - *Acceptance:* Each row/card displays the appointment date; items with the nearest date are visually prioritized (sorted or flagged).

### Epic B — Evidence (the coordinator can trust the proposal before acting)

- **US-3:** As a coordinator, I want to see the source evidence behind every proposal, so I don't approve something I can't justify.
  - *Acceptance:* Clicking/expanding a queue item shows exactly what `initial.json` supplies: customer ID, front/rear condition, size, stock confirmation status, and `contact: available/missing`. No proposal is shown without this evidence visible. (No language/permission field exists in this case's data — don't display one as if it were supplied.)

- **US-4:** As a coordinator, I want incomplete records (missing size/measurement) or unreachable customers to be clearly separated from ready offers, so I never guess or propose to someone we can't contact.
  - *Acceptance:* `TY-2` (unknown size, missing measurement, **and** `contact: missing`) renders as a **review task**, not an offer draft — flagged for both reasons, not just one. UI visually distinguishes "offer draft" vs "review task" vs "no action" states.

### Epic C — Proposal (the system drafts the right offer)

- **US-5:** As a coordinator, I want the system to draft an offer message, so I don't have to write it myself.
  - *Acceptance:* Draft text is generated per wheel set, referencing the flagged axle(s) and size, only for records where `contact: available`. Language (French/Arabic) and channel (WhatsApp, per Moroccan context) are applied as a uniform, explicitly-labeled build assumption — not read from a per-customer field, since none exists in this case's `initial.json`.

- **US-6:** As a coordinator, I want offers involving unconfirmed stock to say so explicitly, so I never overpromise availability.
  - *Acceptance:* If `confirmed: false` for the matched stock size, the draft message includes cautious wording (e.g., "availability to confirm") instead of a firm promise.

### Epic D — Approval (nothing reaches the customer without a human)

- **US-7:** As a coordinator, I want to approve, edit, or reject every draft before it's sent, so nothing goes out unreviewed.
  - *Acceptance:* Every offer draft has three controls: Approve & Send (simulated), Edit, Reject. No auto-send path exists, even for the clean case (`TY-1`).

- **US-8:** As a coordinator, I want a simulated "sent" state after approval, clearly labeled as not a real message, so the demo doesn't overclaim.
  - *Acceptance:* Post-approval state shows "✓ Approved — message simulated, not actually delivered" or equivalent, visibly labeled.

### Epic E — Resulting state (something visibly changes)

- **US-9:** As a coordinator, I want the queue to update after I act, so I can see my decisions reflected.
  - *Acceptance:* After approve/reject, the item moves out of the "needs action" queue into a "resolved" or "sent" list. State persists for the session (real UI state change, not a scripted animation).

- **US-10:** As a coordinator, I want a repeatable starting point, so I can demo the same flow twice.
  - *Acceptance:* Reloading/resetting the app returns all 4 wheel sets to their original `initial.json` state — no persistence bugs, no random behavior.

### Epic F — Changed information (facilitator injection path)

- **US-11:** As a coordinator, I want the workflow to correctly re-evaluate a record when new information arrives (e.g., a missing size gets filled in, or stock confirmation flips), so the system proves it adapts, not just replays a fixed script.
  - *Acceptance:* A simulated "inject new info" control (button or edit) updates one field on one record (e.g., `TY-2.size`), and the proposal re-evaluates and moves from "review task" to "offer draft" (or vice versa) without a page reload/hardcoded animation.

## 5. MVP scope (build this first, in order)

1. Queue view rendering all 4 wheel sets with evidence fields visible (US-1, US-2, US-3).
2. Rule engine: classify each record as `offer_draft` / `review_task` / `no_action` (US-4).
3. Draft message generation respecting language + channel + stock confidence (US-5, US-6).
4. Approve/Edit/Reject controls with simulated send + labeling (US-7, US-8).
5. State change on action + repeatable reset (US-9, US-10).
6. One "inject new info" control to demo adaptability (US-11).

## 6. Explicitly out of scope for v1

- Real SMS/email/call delivery (always simulated, always labeled).
- Live stock/warehouse integration (static `confirmed` bool only).
- A technician-facing input form (technician data is pre-loaded from `initial.json`, not entered live).
- Pricing/quotes (exercise boundary: no live prices).
- Multi-shop support, per-customer language/channel preference (not supplied in this case's data), authentication/login.

## 7. Non-functional constraints

- Must run as a demoable web app (Next.js), deployable to Vercel.
- No alteration of supplied `initial.json` records — any demo-only additions must be visually labeled as simulated and kept separate.
- State must reset to a known starting point (no silent persistence drift between demo runs).

## 8. Open risks / unresolved (state these out loud in the 3-min talk)

- Real conversion impact is unproven — only the workflow logic is validated here.
- The "review task" routing assumes the coordinator checks the queue same-day; no reminder/escalation mechanism is built for v1.
- Language and channel (French/Arabic, WhatsApp) are build-time assumptions, not supplied per-customer data — a real system would need to capture and honor real per-customer preferences and consent, not modeled here.
