# C03 — Master build + design prompt (single, precise, front-loaded)

Grounded in `brief.md`, `SRS.md`, `discovery-guide.md`, `discovery-transcript.md`, `initial.json`. Nothing here goes beyond what those documents establish — every assumption is labeled as an assumption, not stated as fact. Send this as one turn. Build correctly from this spec the first time; do not plan to "fix it in polish" — polish is for wording/visual refinement only, not for correcting logic.

---

You are acting as a senior full-stack engineer and UI/UX product architect simultaneously. Build the working application AND apply the design system to it as you go — do not build unstyled first and skin it later. Every component should be built once, correctly, in its final visual form.

## 1. The problem (one sentence)

Inspection observations that should become customer offers die in the handoff between the technician's note and the coordinator ever seeing it — often after the customer's next appointment has already passed.

## 2. Ground truth data — do not deviate

```json
{
  "wheel_sets": [
    { "id": "TY-1", "customer_id": "CUS-1", "front": "review replacement", "rear": "no concern recorded", "size": "205/55 R16", "appointment": "Day 5", "contact": "available" },
    { "id": "TY-2", "customer_id": "CUS-2", "front": "measurement missing", "rear": "no concern recorded", "size": "unknown", "appointment": "Day 6", "contact": "missing" },
    { "id": "TY-3", "customer_id": "CUS-3", "front": "review replacement", "rear": "review replacement", "size": "225/45 R17", "appointment": "Day 4", "contact": "available" },
    { "id": "TY-4", "customer_id": "CUS-4", "front": "no concern recorded", "rear": "no concern recorded", "size": "205/55 R16", "appointment": "Day 7", "contact": "available" }
  ],
  "availability": [
    { "id": "ST-1", "size": "205/55 R16", "units": 2, "confirmed": true },
    { "id": "ST-2", "size": "225/45 R17", "units": 4, "confirmed": false }
  ],
  "rules": [
    "A technician approves fitment and required quantity.",
    "Unknown measurements create a review task.",
    "Only approved offers may become customer messages."
  ]
}
```

**Critical: there is no `preferred_language` or `contact_permission` field in this data.** Only `contact: available/missing` exists (can we reach this customer at all). Do not invent or display a field that isn't here.

## 3. Roles — single interactive user

- **Coordinator** — the only logged-in, interactive user of the app. Reviews the queue, approves/edits/rejects.
- **Technician** — NOT a system user. No dashboard, no login, no input form. Appears only as evidence metadata inside the coordinator's view (e.g., "flagged by technician during inspection").
- **Stock/Parts** — stubbed. Represented only by the static `confirmed: true/false` field. No live interaction.
- **Customer** — not a system user. Receives a simulated outbound message only, and only if `contact: available`.

## 4. Classification logic (build this exactly)

For each wheel set, classify into exactly one of three states:

1. **Offer Draft** — IF (front OR rear is "review replacement") AND size is known AND `contact: available`.
2. **Review Task** — IF size is unknown/measurement missing, OR `contact: missing`. **Show every applicable reason, not just one** — `TY-2` fails on both (unknown size AND missing contact) and must display both reasons simultaneously, never collapsed into a generic "incomplete" label.
3. **No Action** — IF both front and rear are "no concern recorded" (e.g., `TY-4`). Does not appear in the active queue, or appears visibly dismissed/greyed with no action required.

Stock confidence (`confirmed: true/false`) does NOT change which of the three states a record lands in — it only changes the **wording** of an Offer Draft: if the matched stock entry has `confirmed: false`, the draft message must use cautious phrasing ("availability to confirm"), never a firm promise of units on hand. This wording rule is an interpretive design decision consistent with the supplied rules, not a rule stated verbatim in `initial.json` — keep it, but don't present it as directly quoted.

Expected results on the supplied data: `TY-1` → Offer Draft (clean). `TY-2` → Review Task (dual reason). `TY-3` → Offer Draft with cautious stock wording + top-of-queue urgency (closest appointment, Day 4). `TY-4` → No Action.

## 5. Non-negotiable rule

No message is ever sent automatically — not even for the clean case (`TY-1`). A named coordinator must explicitly click Approve on every single record, every time.

## 6. Build order (build in this sequence, styled correctly at each step — no unstyled placeholder pass)

1. **Queue view** — all wheel sets, evidence fields visible without extra clicks (customer ID, front/rear condition, size, stock status, contact availability, appointment date). Nearest appointment visually prioritized.
2. **Classification engine** — implement the logic in §4 exactly, producing the three states.
3. **Draft message generator** — per Offer Draft record, referencing flagged axle(s) + size, in French/Arabic (Darija) copy, styled as a WhatsApp-style message bubble. This language/channel choice is a uniform, explicitly labeled build-time assumption (no such field exists per-customer) — label it once, clearly, not per-record.
4. **Approve / Edit / Reject controls** — every draft gets all three. Approval flips state to a simulated "sent," visibly labeled "✓ Approved — message simulated, not actually delivered."
5. **Resulting state + reset** — approving/rejecting moves the item out of the active queue into a resolved list; a reset control restores all 4 records to their exact original `initial.json` values, no randomness.
6. **"Inject new information" control** — a clearly separated demo-only control (visually and spatially distinct from the coordinator's real workflow, e.g., a distinct panel or footer, never mixed into the queue itself) that lets you flip one field (e.g., `TY-2.size` gets filled in, or `ST-2.confirmed` flips) and see the affected record's classification re-evaluate live, no page reload, no scripted animation.

## 7. Design system (apply while building, not after)

**Principles:** low cognitive load, evidence visible without extra clicks, foolproof state distinction, demo controls never contaminate the real workflow visually.

**Palette/typography:** clean B2B SaaS aesthetic, high contrast (bright shop lighting). Semantic colors: urgency/appointment-proximity (e.g., amber→red as date nears), Offer Draft (green-adjacent, "ready"), Review Task (amber/orange, with sub-badges for "missing measurement" and "unreachable contact" shown together when both apply), Confirmed stock vs Unconfirmed stock (distinct, not just a boolean icon — wording matters here).

**Layout:** master-detail — queue/sidebar on one side (sorted by urgency), active record detail + message composer on the other (or expandable cards if you prefer a single-column mobile-first layout). Demo/reset controls live in a visually separate zone (e.g., a labeled "Demo Controls" panel or footer bar), never inline with real queue actions.

**Languages:** Arabic (RTL), French (LTR), English (LTR). Draft message copy is delivered in one of these three languages as a uniform build-time assumption (no per-customer language field exists in the data — this is applied uniformly, not toggled per record). Show the message in one language in the demo; label the language choice explicitly in the UI/README as an assumption. Arabic/Darija text must render RTL correctly in the message bubble.

**Components:**
- *Queue card (collapsed):* customer ID, status badge, appointment date, one-line condition summary.
- *Queue card (expanded)/detail view:* full evidence block (front/rear condition, size, stock confirmation, contact availability) + the draft composer if applicable.
- *Status badges:* three states from §4, with Review Task showing which sub-reason(s) apply.
- *Evidence block:* always visible before or alongside any proposal — never gated behind an extra click for the primary reasoning fields.
- *Message composer:* WhatsApp-style bubble, RTL support for Arabic text, LTR for French/English, persistent "simulated — not sent" label, cautious-wording flag rendered visibly when stock is unconfirmed.

**Interaction/state transitions:** approve/reject gives immediate visible feedback (toast or inline state change) always including the word "simulated." Empty/resolved state after all items are actioned should read clearly (not just a blank screen).

## 8. Explicitly out of scope (do not build)

Real SMS/WhatsApp/email delivery, live stock/warehouse integration, a technician input form, pricing/quotes, multi-shop support, authentication/login, per-customer language/channel preference (not supplied).

## 9. Non-functional constraints

Next.js, deployable to Vercel. Never alter the supplied `initial.json` values — any added simulated record must be visually labeled and kept separate. State must reset to the exact known starting point every time — no persistence drift.

## 10. Deliverable

A single working, styled Next.js app satisfying all of the above, in one pass. Confirm you've understood this scope, flag anything ambiguous, then build — do not ask me to re-explain what's already specified here.
