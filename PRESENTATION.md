# 3-Minute Demo Script — C03 TyreFlow

**Setup before you speak:** signed in as **Coordinator**, on the **Offer queue**, browser sound on,
window maximised. Have Settings → Demo data → Reset ready in case you need a clean run.

Total: ~3:00. Word counts are tuned for a calm pace — if you are rushing, cut the bracketed lines.

---

## 0:00 – 0:20 · Result first

> "This is a shift's worth of tyre inspections, ranked by how soon the customer is coming back.
> Eleven need action. Four are ready to send right now. One is blocked — and the system knows
> exactly why.
>
> Before today, this was a paper job card that the coordinator found on Thursday for a Tuesday
> appointment."

*(Do nothing but point at the queue. Let them read it.)*

## 0:20 – 0:45 · The pain, in one breath

> "The technician spots worn tyres while the wheels are off. That observation has to become a
> customer conversation before the next appointment. Today it often doesn't — the note sits
> somewhere the coordinator never looks in time.
>
> So I didn't build a chatbot. I built the handoff."

## 0:45 – 1:20 · Evidence, then the offer

**Click `TY-3`.**

> "Top of the queue. Before I'm allowed to propose anything, I see the evidence the technician
> recorded — both axles flagged, size 225/45 R17, customer reachable, appointment in three days.
>
> The system drafted the message, priced it, applied the discount, and wrote it in French. It'll
> write it in Darija or English too — that's a build-time assumption, because the data has no
> language field per customer. I'm not pretending it does."

**Click Darija.** *(Text flips right-to-left.)*

> "Same record, real right-to-left."

## 1:20 – 1:50 · The rule that matters

> "Now watch the Approve button. It's dead. I can't send this.
>
> Stock for this size isn't confirmed — so the system refuses to let me promise a tyre we might not
> have. That's the one rule I'd defend in front of a customer."

**Click "Flag 225/45 R17 to stock".** **Go to Stock needs.**

> "Instead of a promise, the shop gets a signal: this size is holding up an offer, two units, and
> here's who's waiting."

**Click "Confirm ST-2".**

> "Stock lands —" *(chime sounds)* "— and contacting unblocks itself. The wording drops the hedge."

## 1:50 – 2:20 · The bit that recovers money

> "Here's what I'd have missed. Say I'd already rejected that offer last week because stock looked
> hopeless."

*(If you pre-rejected a record, open the Rejected bin and point at the reminder banner. If not, say
it instead of showing it.)*

> "Rejected records aren't deleted — they sit in a bin with the reason. When stock for that exact
> size arrives, the system comes back and names the record: *this offer is ready to revisit*. One
> click and it's live again.
>
> That's revenue that used to die quietly."

## 2:20 – 2:40 · The alert you can hear

**Sign out → sign in as Technician → tick "customer is in the shop right now" → Send.**
**Sign out → sign in as Coordinator.**

> "Last one. The customer is standing in the shop right now and the technician just flagged their
> tyres."

*(Urgent chime plays on arrival.)*

> "The coordinator hears that and can catch them before they walk out. That's the difference between
> an offer and a missed one."

## 2:40 – 3:00 · Promise vs. hypothesis

> "What I can demonstrate: the workflow. Classification, evidence, the stock rule, the recovery
> path, and a human approving every single message — nothing here sends on its own.
>
> What's still a hypothesis: whether customers actually book when we reach them this way. I have no
> conversion data and I'm not going to invent it.
>
> The next test is one shop, one coordinator, two weeks — measure how many inspections become
> approved offers, and how many blocked offers we recover once stock lands. That last number is the
> business case."

---

## If you have 30 seconds of questions

- **"Is anything actually sent?"** No. Every channel stops at *simulated, not delivered*. The only
  real file it produces is a calendar invite.
- **"Where does the price come from?"** A demo list, labelled illustrative everywhere. The supplied
  data has no pricing, so I refused to imply it did.
- **"Why not filter by customers who visited recently?"** There's no visit history in the data.
  Inventing one would be fabricating customer records, so outreach is scoped by appointment date
  instead — and the right window is a discovery question for you.
- **"What breaks first in production?"** The stock feed. The whole gate is only as good as that
  boolean.
- **"How long?"** Six hours, including discovery.

## Failure plan

If the live demo misbehaves: screenshots of every beat above are in `docs/screenshots/`, in order.
Talk through those — the narrative doesn't change.
