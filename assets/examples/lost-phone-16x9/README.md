# The Lost Phone (16:9, 58.7 s)
An original second-person thriller: at 2 a.m. you find a buzzing phone whose wallpaper is a photo of you. It ends on "Go home or call the police?"
- One `Film.tsx` with a `motion` prop gives two cuts of the same story and soundtrack (`index.tsx` registers both):
  - **frames-only** (`stick-lostphone-PICTURE`): held tableaux, a handheld camera, push-ins, impact shakes, a 2-frame black dip before the reveal, camera flashes on the photos;
  - **full animation** (`stick-lostphone-MOTION`): you walk, look around, reach, flinch and whip round; the car pulls out.
- What to borrow:
  - the rain system (`Rain`, `Splashes`, brighter rain inside the lamp cone);
  - `Phone`, `PhoneShot` and `HoldHand` for phone inserts;
  - photos drawn in code (`PhotoScene`), shown on the phone or full frame with a camera flash;
  - the fact acted out with no card: `FileReveal` lifts the photo out of the phone, and a clock and a map pin come out of it.
- The only text besides plain subtitles is what a real phone shows (a lock-screen clock, one photo time, the message).
- Fact: a phone photo's file can carry EXIF metadata, including the time it was taken and, with location access, its GPS coordinates (EXIF, CIPA DC-008).
- It plays `projects/stick-lostphone/narration.wav` plus `music_thriller`, `amb_rain` and the phone/thunder/braam SFX from the shared library; swap in your own narration path and `words.ts`.
