# Three Doors (16:9)
A 33.6 s stick-figure story about the Monty Hall problem, restaged for a 16:9 YouTube frame. The canvas is a 2560×1440 world rendered at `--scale=0.75` (1920×1080).
- `kit.tsx`: the template kit with the 16:9 settings (`VW 2560`, `VH 1440`, captions at top 1290, 84 px).
- `Film.tsx`: the shots. It plays `projects/stick-doors-story/narration.wav` and the shared sound library; swap in your own narration path and `words.ts` when you reuse it.
- Facts: staying wins 1/3 and switching wins 2/3 under the standard rules (the host knows, always opens a goat door you didn't pick, always offers the switch). "Most people stay": Granberg & Brown (1995).
