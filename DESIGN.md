# Design

The studio after dark, annotated like their Instagram posts.

## Color

| Token | Value | Role |
|---|---|---|
| `--night` | `#121110` | Hero, four-hands, final band, footer |
| `--dark` | `#1a1817` | Dark sections |
| `--stone` | `#f1eee9` | Light sections (their greige slides), text on dark |
| `--ink` | `#1e1b19` | Text on stone, dark plaques on stone |
| `--taupe` | `#5b524e` | Display headings on stone (as on their light slides) |
| `--sand` | `#cdb293` | Single accent: primary buttons, accent words, dots |
| `--sand-deep` | `#85664b` | Sand on light ground (contrast-safe) |
| `--pulse` | `#d24a3c` | Pain marker only: active zone dot, strike-through of myths |

Strategy: restrained — tinted neutrals + one accent (sand). Red appears only where it means "pain", then turns sand ("relief").

## Type

- Display & labels: **Oswald** (variable, self-hosted), uppercase, tight leading (.88–.92). Closest open face to the condensed grotesk of their posts, with standard UA/RU Cyrillic.
- Body: **Onest** (variable, self-hosted).
- Do not use Sofia Sans: its default Cyrillic forms are Bulgarian (в looks like 6).

## Components & motifs

- Pill buttons: sand (primary), ghost/line (secondary), ink (on stone). `:active` scale .97.
- Dot + leader line annotations on photos (hero "Марина / Іван", zone pins).
- Frosted plaques over photos only (hero caption, four-hands bonuses, duo quote).
- Hairline-separated lists instead of card grids (manifesto points, cases, services, myths).
- `.cover` box: photo keeps its own coordinate space inside any crop (container units), so pins stay on target.

## Motion

- One authored entrance: hero lines mask up, photo settles, pins draw their leader lines.
- Signature: canvas of four hand paths, sync (mirrored) ↔ async (independent tempos), auto-cycles until the visitor picks a mode; pauses off-screen; static drawing under reduced motion.
- Zone switch: photo de-blurs in, pin turns from red to sand.
- Reviews marquee pauses on hover/focus; becomes a scroll-snap row under reduced motion.
- Easing: `cubic-bezier(.23,1,.32,1)` for UI, `cubic-bezier(.32,.72,0,1)` for the segmented thumb.
