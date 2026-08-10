# Glass Beat Design System

## Overview

Glass Beat is a tactile rhythm game built around wiping moisture, steam, and frost from glass. The interface has two visual modes:

- **Lobby:** a warm cream canvas with large, saturated stage cards. It should feel playful and approachable before play begins.
- **In-stage:** an immersive, dark environmental scene with minimal translucent controls. The glass or mirror is always the main artifact.

The useful ideas adapted from the Clay reference are the warm canvas, rounded medium-weight display type, generous card radii, saturated feature surfaces, restrained shadows, a 4px spacing grid, and 44px touch targets. SaaS navigation, forms, pricing, testimonials, footers, six-color cycling, clay characters, and marketing-page section patterns are intentionally excluded.

## Principles

1. **The surface is the hero.** Stage cards show real cropped gameplay, and the play screen gives almost all available space to glass.
2. **Playful outside, immersive inside.** The lobby is warm and colorful; stages inherit the temperature and light of their environment.
3. **Color carries depth.** Prefer saturated card fills and thin highlights over stacked shadows.
4. **One rhythm language.** Perfect, Good, and Miss colors never change between stages.
5. **Material is not decoration.** Fog, droplets, refraction, fingerprints, and sound respond to input; they are not generic glass overlays.

## Token Architecture

Use four conceptual layers, but keep implementation in the existing CSS and `THEMES` object.

1. **Base:** type, spacing, radii, and motion.
2. **Semantic:** canvas, surface, text, accent, border, and feedback roles.
3. **Component:** only values shared by real components such as buttons, HUD chips, and stage cards.
4. **Stage:** palette and material values supplied by each stage.

Shader coefficients, droplet physics, sound envelopes, judgement windows, stage copy, and asset URLs are not design tokens.

## Colors

### Lobby and Shared UI

| Token | Value | Use |
|---|---:|---|
| `--color-lobby-canvas` | `#fff8ed` | Stage-select background |
| `--color-lobby-soft` | `#f7f0e2` | Quiet bands and locked cards |
| `--color-lobby-strong` | `#ede4d4` | Selected or pressed neutral surface |
| `--color-ink` | `#12110f` | Lobby headlines and primary buttons |
| `--color-body` | `#3d3934` | Lobby body copy |
| `--color-muted` | `#746e65` | Captions and secondary metadata |
| `--color-hairline` | `#ddd4c4` | Thin borders |
| `--color-on-dark` | `#ffffff` | Text on dark controls |

### Rhythm Feedback

| Token | Value | Meaning |
|---|---:|---|
| `--feedback-perfect` | `#f9d66d` | Perfect timing |
| `--feedback-good` | `#8ed8c4` | Good timing |
| `--feedback-miss` | `#ff7185` | Missed timing |

These colors stay fixed across every stage so players learn them once.

### Stage Palettes

| Stage | Card | Background | Accent | Text | Surface direction |
|---|---:|---:|---:|---:|---|
| 01 Frost Window | `#8fbac8` | `#050d13` | `#8fbac8` | `#eaf8fb` | Cold, granular, crystalline |
| 02 Steamed Night | `#e9a77c` | `#160f0c` | `#c9a486` | `#fff0e1` | Warm, wet, softly refractive |
| 03 Shower Mirror | `#78cdc3` | `#071716` | `#78cdc3` | `#eafffc` | Dense steam, indoor mint light |

Do not add a general brand rainbow. Each stage owns one card color because the current game has three material worlds.

## Typography

Use locally available system fonts until licensed fonts are bundled.

- **Display:** `Pretendard Variable`, Pretendard, Apple SD Gothic Neo, sans-serif; weight 500; negative tracking.
- **UI:** the same stack at weight 400–600 for Korean consistency.
- **Stage labels and scores:** Inter or Manrope when available, then the UI stack.

| Token | Size | Weight | Line height | Tracking | Use |
|---|---:|---:|---:|---:|---|
| `--type-display-xl` | `56px` | 500 | 1.0 | `-0.045em` | Lobby title |
| `--type-display-lg` | `40px` | 500 | 1.08 | `-0.035em` | Section title |
| `--type-display-md` | `32px` | 500 | 1.12 | `-0.025em` | Stage-card title |
| `--type-title-lg` | `24px` | 600 | 1.3 | `-0.015em` | In-stage headline |
| `--type-title-md` | `18px` | 600 | 1.4 | `-0.01em` | Card metadata |
| `--type-body` | `16px` | 400 | 1.55 | `0` | Instructions |
| `--type-body-sm` | `14px` | 400 | 1.5 | `0` | HUD and captions |
| `--type-label` | `12px` | 600 | 1.4 | `0.14em` | Stage number and status |

Do not use weight 700 for display text. Warmth should come from shape and spacing, not heavy weight.

## Spacing and Layout

### Spacing Scale

`4, 8, 12, 16, 24, 32, 48, 72px`

- Lobby maximum width: `1280px`.
- Lobby desktop layout: three stage cards in one row.
- Card padding: `32px` desktop, `24px` compact.
- Major lobby band gap: `72px`.
- In-stage outer safe area: at least `24px` desktop and `12px` compact.

The menu reduces columns rather than shrinking cards: three columns on desktop, two on tablet only when legible, and one on mobile.

## Elevation and Material

| Level | Treatment | Use |
|---|---|---|
| Flat | Saturated fill, no shadow | Stage cards |
| Hairline | 1px low-contrast border | Buttons and locked states |
| Glass chip | Translucent fill, 12–16px blur, inset highlight | In-stage HUD |
| Scene lift | One broad, low-alpha shadow | Game canvas only |

Do not use heavy shadows on every component. Stage preview imagery, card color, condensation, and refraction provide the depth.

## Shapes

| Token | Value | Use |
|---|---:|---|
| `--radius-sm` | `8px` | Small status elements |
| `--radius-md` | `12px` | Buttons |
| `--radius-lg` | `16px` | Secondary panels |
| `--radius-xl` | `24px` | Stage cards |
| `--radius-pill` | `999px` | HUD chips and short badges only |

Buttons are rounded rectangles, not pills. Pills are reserved for compact HUD controls and status badges.

## Components

### Stage Select

**Lobby header** uses the cream canvas, one large 500-weight title, a short instruction, and no marketing navigation.

**Stage card** is the primary menu artifact. It uses the stage card color, `24px` radius, `32px` padding, a large stage number, title, best score, and a cropped live-looking preview of the surface. The preview is more important than an icon or illustration.

**Locked stage card** keeps the same geometry, uses the soft cream surface, desaturates its preview, and shows one lock condition. Do not cover it with a generic black overlay.

**Current/next stage card** may use a 2px ink outline. Avoid extra ribbons, glows, and badges competing for attention.

### Buttons

**Primary button:** near-black background, white text, `44px` minimum height, `12px` radius, `14px / 600` label.

**Secondary button:** transparent or cream surface with a 1px hairline border.

**HUD chip:** translucent stage-colored surface, pill shape, minimum `40px` height, thin specular border, and restrained backdrop blur.

Every interactive target must be at least `44×44px` on touch screens.

### In-stage HUD

Only show stage identity, progress or score, pause, and reset. Controls sit outside the active rubbing area whenever space allows. The finger, droplets, and rhythm feedback must never be covered by decorative UI.

### Rhythm Feedback

Perfect, Good, and Miss use the shared semantic colors. Feedback is short text plus a restrained scale-and-fade pulse; it does not use a modal, card, or large particle burst.

## Motion

| Token | Value | Use |
|---|---:|---|
| `--motion-fast` | `120ms` | Press and judgement feedback |
| `--motion-base` | `220ms` | Card and button state changes |
| `--motion-scene` | `420ms` | Stage entry and palette transition |
| `--ease-out` | `cubic-bezier(.2,.8,.2,1)` | Default UI easing |

- Stage-card hover: at most `translateY(-4px)` and `scale(1.01)`.
- Button press: `translateY(1px)`; no elastic bounce.
- Stage unlock: one color reveal or fog-clear transition, not a shower of unrelated particles.
- Respect `prefers-reduced-motion` by removing transforms and shortening scene transitions.

Physics-driven finger, water, and frost motion is not governed by UI motion tokens.

## Responsive Behavior

| Range | Behavior |
|---|---|
| `< 768px` | One stage card per row; 36px lobby title; compact HUD; 12px safe area |
| `768–1023px` | One or two cards depending on available preview width |
| `>= 1024px` | Three cards; full stage metadata; 24px safe area |

The playable surface preserves its aspect ratio. On narrow screens, controls reflow around the surface rather than scaling below readable or touchable sizes.

## Do and Don't

### Do

- Use the warm cream lobby to make the game inviting before entering a dark stage.
- Give each stage one saturated card color and one distinct material behavior.
- Keep display text at weight 500 with negative tracking.
- Put gameplay previews inside stage cards.
- Use one broad shadow on the game canvas and color contrast elsewhere.
- Keep judgement colors consistent.

### Don't

- Do not turn the play screen into a cream marketing page.
- Do not import Clay's six-color palette when only three stage identities exist.
- Do not add clay mascots or 3D scenery unrelated to wiping glass.
- Do not add marketing navigation, forms, pricing cards, testimonials, or a footer.
- Do not use generic liquid-glass styling on every control.
- Do not encode shader, droplet, audio, or judgement parameters as visual tokens.

## Implementation Boundary

- CSS owns base, semantic, and component tokens used by DOM UI.
- `THEMES` owns Phaser text colors, stage backgrounds, material assets, and renderer values.
- The two systems share naming and intent but do not read each other's runtime values.
- Add new component tokens only when a second real consumer appears.

