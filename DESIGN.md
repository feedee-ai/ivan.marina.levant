# Design

The studio is a black-box stage and the session is a duet. Their real studio has black curtains, so the site is dark, lit by one follow-spot: photos sit in pools of light that fall off to black, and amber marks only light and action.

## Color (dark only, one theme for the whole page)

| Token | Value | Role |
|---|---|---|
| `--bg` | `#0c0c0e` | Stage black, page ground |
| `--bg-2` | `#121215` | Quiet bands (cases, reviews), inputs, chips |
| `--bg-3` | `#19191d` | Raised: review cards, booking ticket |
| `--line` / `--line-2` | `rgb(236 231 224 / .12)` / `.22` | Hairlines, control borders |
| `--ink` | `#ece7e0` | Text |
| `--ink-2` | `#c3bdb5` | Secondary text |
| `--mute` | `#918b84` | Labels, meta (≥ 5:1 on `--bg`) |
| `--amber` / `--amber-hi` | `#ffae45` / `#ffc777` | The single accent: primary buttons, selected states, score playhead, stars, numerals in cases |
| `--on-amber` | `#160e03` | Text on amber |
| `--err` | `#ff8a7a` | Form errors only |

Rule: amber never decorates. It is either light (playhead, stars, logo dot) or the action. No coloured glows.

## Type

Commissioner (variable, self-hosted, Latin + Cyrillic, axes `wght`, `FLAR`, `VOLM`).
- Display: weight 700–760, `FLAR 100, VOLM 40–60`, tracking −0.035 to −0.045em, leading .9–.98. Hero `clamp(3.4rem, …, 7.6rem)`; ES/EN hero smaller (longer phrases) to stay on two lines.
- Body: weight 400, `FLAR 0`, 17px/1.6. Quotes: weight 330, large.
- No eyebrows/kickers above headings, except the hero credit line and the signature-service label.

## Shape

Pills for every control (buttons, chips, date/time, tags). Photos and panels stay sharp (radius 0). Inputs 12px. The booking summary is a ticket stub: punched notches via mask, dashed tear line.

## Components & motifs

- **Hero diptych:** Marina (top) and Ivan (bottom) each in their own radial pool of light (`mask-image: radial-gradient(closest-side …)`), copy left, live "next free sessions" chips across the bottom. Mobile: Marina only, fading down into the copy.
- **Press line:** giant `5,0`, five amber stars, one review set as a press quote.
- **Where it hurts:** tablist of zones as large type with a small pool of light on the active one; panel = photo, 4 facts (feels / cause / what we do / who leads), CTA that presets the booking.
- **Score (signature):** pinned section; two staves (Ivan, Marina) of stroke marks over a beat grid; scroll drives an amber playhead, marks light up as it passes; caption switches Sync → Async at the midpoint.
- **Cast:** two tall portraits on their curtains, Marina offset down; pointer spotlight on desktop.
- **Cases:** rows with big amber session counts (1 → 3 → 5).
- **Services:** one featured signature service + two-column hairline list, each with "Choose" that presets booking.
- **Reviews:** the only marquee; pauses on hover/focus; scroll-snap under reduced motion.
- **Box office:** chips for service/master, 14-day date strip, time pills, contact fields, sticky ticket summary → WhatsApp.

## Motion

- Curtain: two fold-textured panels part once per session (1050ms, `cubic-bezier(.77,0,.175,1)`), then the hero copy rises in sequence and the photos settle out of blur.
- Score playhead tied to scroll (rAF only while the section is on screen, no scroll listeners).
- Reveals: content fades/rises 22px; photos open with `clip-path` from the top. Elements already on screen are never hidden.
- UI: `cubic-bezier(.23,1,.32,1)`, 160–300ms, `:active` scale .97; hover effects gated by `(hover: hover) and (pointer: fine)`.
- `prefers-reduced-motion`: no curtain, static fully-lit score, no marquee, no reveals.
