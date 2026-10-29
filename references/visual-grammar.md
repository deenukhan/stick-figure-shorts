# Visual grammar

The default canvas is **16:9**: a 2560×1440 world rendered at `--scale=0.75` (1920×1080). All numbers below are in those world units at `Figure` scale 1. Everything is SVG drawn in `Film.tsx` with the parts in `kit.tsx`. 9:16 notes are in §9.

## Contents
1. The text rule (read first)
2. Character construction
3. Expressions
4. Palette and light
5. Sets and staging
6. Showing a fact without a card
7. Two motion styles: frames-only and full animation
8. Camera and timing
9. Subtitles
10. 9:16 (Shorts, Reels)

## 1. The text rule (read first)
These are Deenu's rules (2026-10-29). He watched films with fact cards and typography and said they "look like AI slop".
- **Animation carries every idea.** The viewer should get the point with the sound off and no text: staging, props, gestures, light and camera.
- **Plain subtitles** are the only always-on text (§9).
- **In-scene text is allowed only as a small complement to what the animation already shows**:
  - one short piece at a time;
  - attached to a prop or the set and drawn in the film's own style (same light, line and perspective);
  - timed to the word, and animated in and out with the action.

  Good examples: door signs that flip to "1/3" and "2/3"; a price tag tied to a briefcase; a desk calendar showing "28"; the real text on a phone screen the character is holding (a lock-screen clock, a message).
- **Never:** fact cards, full-screen typography, UI chips or pills, stakes tags, stamps, meters, floating labels, a floating "?", title cards, or source lines on screen. Sources go in `BRIEF.md`.

## 2. Character construction (`<Figure>`)
| Part | Spec |
|---|---|
| Origin | Between the feet, on the ground line. Height ~420 at s = 1. |
| Head | Circle r 62, fill #fbfbf8, **ink outline 7 px** (#16161d). Centre 352 above the ground. |
| Eyes | Ink ellipses rx 6.5, ry 10 (13 when surprised), 42 apart. `look=[x, y]` moves eyes, brows and mouth together. |
| Brows | 24 px ink strokes, 6 wide, ~30 above the eyes. They carry the emotion. |
| Mouth | 5.5 px ink stroke, small (≤ 28 wide). An open "o" for surprise. |
| Torso | One rounded trapezoid from the shoulders (y −282) to the hips (y −150), filled with **the costume colour**, 7 px outline, a darker seam and two pocket dashes. |
| Arms | **Single 9 px ink lines** in two segments. `armL/armR` = degrees from hanging, positive = forward; `elbowL/elbowR` bends the forearm. |
| Hands | White mitten circles r 15. `holdR` draws a prop at the front hand (a phone, a mic, a glowing orb). |
| Legs | Single 9 px ink lines to the sneakers. `walk={f * 0.3}` gives a step cycle with bob and arm swing. |
| Details | `hair="tuft"` (default), `"bun"`, `"none"`; `glasses`; `scarf`; `labCoat`; `sweat` 0–1; `headTilt`; `bob`. |

**Make every character readable from one colour + one detail** (yellow raincoat; coral jacket + curl; purple suit + glasses + slick hair). Don't reuse another channel's costume pairs.

## 3. Expressions
`neutral` · `worried` · `sly` · `happy` · `surprised` · `sad`, plus `sweat` for nerves and `blinkAt(f, seed)` (a different seed per character). Change the expression **on the word** that motivates it.

## 4. Palette and light
- **Sets:** dark and desaturated (night navy, slate, teal-grey).
- **One motivated light per shot,** drawn as a cone and a pool with `mixBlendMode: "screen"`. Examples:
  - a streetlamp, a pendant lamp or a spotlight;
  - a phone screen lighting a face;
  - headlights;
  - a glowing door.

  Light is what makes these films feel real, more than limb animation.
- **Costume colours:** one saturated hue per character; it is the only saturated thing in most frames.
- **Atmosphere:** something is always moving in the air: rain (2–3 layers plus brighter streaks inside the light cone), splashes, dust, confetti or falling bills. A radial vignette sits on every shot.

## 5. Sets and staging (16:9)
- Build each set as a component (`Stage`, `Street`, `Den`…) with a `blur` prop for close-ups. Big shapes, 4–8 px ink outlines, repeat patterns as thin lines one shade off the base.
- **Ground:** the figures' ground at y ≈ 1250–1380, so the feet stay just above the subtitle band (y 1290+) or sit under it on clear floor. A table top at y ≈ 940 when figures stand behind it.
- **Staging:** the hero on the left third (x ≈ 470–860) and the second character on the right (x ≈ 1700–2090) facing left, with the set or object in the middle. Medium shots: one figure at s 2.6–2.8 on one side. Close-ups: s 3.2–3.4 on the right third, the set scaled 1.5–2× and blurred behind.
- Spread repeating set pieces across the full width (wall lines, windows, bulbs, buildings).

## 6. Showing a fact without a card
Turn the number into **objects and action on the set**, at true scale where there is a scale. Worked patterns:

| Idea | Acted out as |
|---|---|
| Probability, e.g. stay 1/3 vs switch 2/3 (Three Doors) | Three glowing orbs ("chances"), one per door. The opened door's orb hops onto the other closed door, so it now holds two. The door signs flip to 1/3 and 2/3. |
| "Feels like 50-50, but it isn't" | A seesaw in a thought bubble with the two doors on its ends. It sits level, then slams down on one side. |
| "Most people do X" | Faint past contestants pop up and all do X; only one does the other thing. |
| Exponential growth (The Penny) | Two cash stacks on a table at the same scale (12 bundles = $1M). The penny's stack doubles in front of you (a copy drops onto it), passes yours on day 28 and smashes off the top of the frame on day 30. A desk calendar shows the day. |
| "A photo file stores time and GPS" (The Lost Phone) | The photo lifts out of the phone and opens; a clock (3:27) and a map pin come out of it on glowing threads, then slide back "inside the file". |
| "Doubles every day" | The penny splits into two, then four. |
| "For 30 days" | A desk calendar riffles from 1 to 30. |

Rules:
- **One idea per shot.**
- The action lands **on** the word.
- Numbers that the voice says do not also need to be written. Write one only when it is a prop that naturally carries text.

## 7. Two motion styles
Both use the same sets, voice and sound. Pick one, or make both as variations.
- **Frames-only (the reference's grammar).** Each beat is a held tableau with small life: a blink, a breath, a head turn, rain and light moving. The camera does the work:
  - a **handheld drift** on every shot (±8 px, ±0.25°, summed slow sines);
  - slow push-ins;
  - **impact shakes** on hits: a 20–26 px kick, then a damped spring with a ~5-frame period that settles in ~10 frames;
  - a **2-frame dip to black** before a big reveal;
  - a white camera flash when a photo appears.

  Fast cuts (2–3 s).
- **Full animation.** The characters act between poses:
  - walking (the camera pans with the walk, splashes at the feet), turning, reaching and picking up, flinching, whipping round;
  - props move: a phone trembles, a car pulls out, a stack drops;
  - camera moves are motivated by the action; handheld is lighter (±5 px).

## 8. Camera and timing
- **Cuts every 2.5–4 s** (2–3 s in action). 30 s ≈ 9–12 shots, 60 s ≈ 18–22.
- **Each shot: one eased push** (`z0 → z1`, 1.00 → 1.04–1.14 around `fx, fy`), plus the handheld and shakes of the chosen style. No whips or spins.
- **Shot rotation:** wide (the scene) → insert (the object) → medium (the reaction) → close-up (the decision) → the acted-out fact (wide or medium) → payoff wide → close-up on the question.
- **Action on the word:** start a move 2–4 frames before the key word so it lands with it.
- **Opening:** a fade from black over 8–10 frames. **Ending:** hold on the hero (no title card) for ~3 s after the last word, then fade over the last 15–18 frames.

## 9. Subtitles
- `Captions` in `kit.tsx`: **plain**. One line of 2–4 words, all white (Inter 800, 70 px in 16:9), with a soft dark shadow, centred, top y 1290, left/right margins 360. No karaoke highlight, no pops, no colour changes.
- Chunks: 2–4 words, broken at punctuation or pauses over 0.35 s (`cues.py --max 4`).
- Never over a face; keep key props above y 1290.

## 10. 9:16 (Shorts, Reels)
Deenu's channel is 16:9 only. If a 9:16 film is ever needed:
- set `VW = 1080, VH = 1920` and render without `--scale`;
- put the ground at y ≈ 1480–1500 (heads around y 1000–1100) and the subtitles at top y 1360 with 70 px margins (68 px font);
- keep the top 120 px and bottom 300 px free of key action (platform UI).
