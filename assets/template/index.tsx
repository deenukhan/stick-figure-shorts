import React from "react";
import { Composition, Folder } from "remotion";
import { FILM_FRAMES, DoorsFilm } from "./Film";
// Compositions for project "stick-doors-16x9": "Three Doors" restaged for 16:9 (YouTube). The canvas is 2560x1440;
// render with --scale=0.75 for 1920x1080. The mix (narration + music + SFX) lives in the composition.

export const StickDoors16x9Root: React.FC = () => (
  <Folder name="stick-doors-16x9">
    <Composition id="stick-doors-16x9-FILM" component={DoorsFilm} width={2560} height={1440} fps={30} durationInFrames={FILM_FRAMES} />
  </Folder>
);
