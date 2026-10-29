# Visual grammar

All numbers are for a 1080×1920 canvas at `Figure` scale 1. Everything is SVG drawn in `Film.tsx` with the parts in `kit.tsx`.

## Contents
1. Character construction
2. Expressions
3. Palette
4. Sets
5. Fact cards
6. Camera and timing
7. Captions and tags

## 1. Character construction (`<Figure>`)
| Part | Spec |
|---|---|
| Origin | Between the feet, on the ground line. Height ~420 px at s = 1. |
| Head | Circle r 62, fill #fbfbf8, **ink outline 7 px** (#16161d). Centre 352 px above the ground. |
| Eyes | Ink ellipses rx 6.5, ry 10 (13 when surprised), 42 px apart. `look=[x, y]` moves eyes, brows and mouth together. |
| Brows | 24 px ink strokes, 6 px wide, ~30 px above the eyes. They carry the emotion. |
| Mouth | 5.5 px ink stroke, small (≤ 28 px wide). An open "o" for surprise. |
| Torso | One rounded trapezoid from the shoulders (y −282) to the hips (y −150), filled with **the costume colour**, 7 px outline, a darker centre seam and two pocket dashes. |
| Arms | **Single 9 px ink lines** in two segments (shoulder → elbow → hand). `armL/armR` = degrees from hanging, positive = forward; `elbowL/elbowR` bends the forearm. |
| Hands | White mitten circles r 15, 5.5 px outline. `holdR` draws a prop at the front hand. |
| Legs | Single 9 px ink lines from the hips to the sneakers. `walk={f * 0.3}` gives a step cycle with bob and arm swing. |
| Feet | Chunky white sneakers, 5.5 px outline, toe forward. |
| Details | `hair="tuft"` (one curl, default), `"bun"`, `"none"`; `glasses`; `scarf` colour; `labCoat`; `sweat` 0–1; `headTilt`. |

**Make every character readable from one colour + one detail.** Hero: mustard coat + a curl. Owner: lilac cardigan + grey bun + blue scarf. Scientist: lab coat + glasses. Don't reuse another channel's costume pairs.

## 2. Expressions
`neutral` (flat brows) · `worried` (inner ends up, wavy mouth) · `sly` (inner ends down, crooked smile) · `happy` (soft arcs, smile) · `surprised` (brows high, "o") · `sad` (inner ends up, frown). Add `sweat` for nerves, and blink with `blinkAt(f, seed)` (a different seed per character).

Change the expression **on the word** that motivates it ("keep" → sly), never between words.

## 3. Palette
- **Sets:** dark and desaturated. The Wallet uses night navy #1b2236, brick lines #242c44, slate pavement #40475f, road #161b2b, teal-grey wall #22313d.
- **One warm light per set:** #ffcf73 as a cone, a pool on the ground and a streak on the wet road, blended with `mixBlendMode: "screen"`.
- **Costume colours:** one saturated hue per character (hero mustard #e8b23a). It's the only saturated thing in most frames.
- **Cards:** warm paper #F6F1EA, ink #2A1E17, muted label #7a6a5e, a single highlight in the hero colour.
- **Vignette** on story shots (not on cards): a radial fade to #05070d at 55% opacity.

## 4. Sets
- Build each set as a component: `Street`, `Doorway`, `Office`… with a `blur` prop for close-ups (`<filter id="dof"><feGaussianBlur stdDeviation="9"/>`).
- Few, big shapes with 4–8 px ink outlines; repeat patterns (bricks, shutters, tiles) as thin lines one shade off the base colour.
- A ground line at y ≈ 1500 for wide shots, so heads land around y 1000–1100 and captions (y 1360) sit on legs, not faces.
- For close-ups, scale the set 1.5–1.9× about the centre and blur it; put the figure at s 2.6 (medium) or 3.6–4.2 (close).

## 5. Fact cards
- Paper background with a faint grain (`<Grain>`), a **mono label** at y 300 (32 px, letter-spacing 6, muted), and **one big idea**: a Fraunces 800 number (120–200 px) or a two-bar chart.
- Animate the number on the spoken word (a counter with `eout`, a bar growing over ~25 frames).
- Small icons (wallets, dots) in a grid that fills with the counter. At most 2 colours: ink + the hero colour.
- Source line at the bottom in 26 px mono when there's a study.
- Captions are hidden on cards (the card is the caption).

## 6. Camera and timing
- **Cuts every 2.5–4 s.** Cards may run 2–4.5 s. 30 s ≈ 8–10 shots.
- **One move per shot:** `z0 → z1` (1.00 → 1.04–1.14) eased in-out around `fx, fy`. No pans that change direction, no shake.
- **Order:** wide → insert → medium → close → card → card → card → payoff wide → close-up question → title.
- **Action on the word:** a slide or pop starts 2–4 frames before the key word, so it lands with it.
- **Opening:** a fade from black over 8 frames. **Ending:** the title card ~4 frames after the last word, a fade to black over the last 15 frames.

## 7. Captions and tags
- `Captions`: Inter 800, 68 px, line-height 1.15, centred, left/right margins 70 px, top y 1360. The spoken word is white and the upcoming words 42% white, with a dark shadow; on light backgrounds pass `dark`.
- Chunks: 2–4 words, broken at punctuation or pauses over 0.35 s (`cues.py --max 4`).
- One optional stakes tag top left (a white pill, 32 px mono). Keep it out of the top 120 px.
- The title card at the end: Fraunces 800, ~170 px, white, over a top-down dark gradient; keep it clear of faces.

## 8. 16:9 (YouTube)
For a main YouTube channel, build the same film on a wide canvas. Nothing about the look changes; only the staging does.
- **Canvas:** in `kit.tsx` set `VW = 2560, VH = 1440` (world units), and in `index.tsx` make the composition 2560×1440. Render with `bash scripts/render.sh <engine> <slug> <out.mp4> --scale=0.75` for 1920×1080. At this world size, every prop, figure scale and stroke width from the 9:16 numbers above still fits.
- **Captions:** `top 1290, left/right 360, 84 px` (one line of 2–4 words in the lower band).
- **Ground and set:** the floor line at y ≈ 1160, the figures' ground at y ≈ 1380 (s 1.3 in wide shots), door or window tops around y 480. Spread repeating set pieces across the full width (wall lines, valance, bulbs).
- **Staging:** the hero on the left third (x ≈ 470), the second character on the right (x ≈ 2090) facing left, the set or object in the middle. Medium shots: one figure at s 2.8 on one side, the blurred set behind. Two-shot close-ups: both figures at s 3.2, about 900 apart.
- **Fact cards:** split them left and right (the claim on the left, the picture or number on the right). Scale the card content by ~1.12 about the centre, a 44 px mono label at y 190, the source line around y 1320.
- **End title:** on the left over a left-to-right dark gradient, two lines at ~230 px; the hero close-up on the right third.
- **Captions vs props:** in the lower band (y 1290–1390) keep key props above it. Push in around a low focus point (`fy` ≈ 1250) when the object stands on the floor.
- **Platform:** no Shorts UI to dodge, but YouTube's progress bar and title overlay cover the top and bottom ~6% on hover.
