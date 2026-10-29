import React from "react";
import { Composition, Folder } from "remotion";
import { FILM_FRAMES, LostPhoneFilm } from "./Film";
// Compositions for project "stick-lostphone": "The Lost Phone", an original ~59 s code-drawn stick-figure thriller, 16:9 (stick-figure-shorts skill).
// Two cuts of the same story and soundtrack: PICTURE (held tableaux + photos, handheld camera) and MOTION (characters act, motivated camera).
// World 2560x1440, render with --scale=0.75 for 1920x1080.

export const StickLostPhoneRoot: React.FC = () => (
  <Folder name="stick-lostphone">
    <Composition id="stick-lostphone-PICTURE" component={LostPhoneFilm} defaultProps={{ motion: false }} width={2560} height={1440} fps={30} durationInFrames={FILM_FRAMES} />
    <Composition id="stick-lostphone-MOTION" component={LostPhoneFilm} defaultProps={{ motion: true }} width={2560} height={1440} fps={30} durationInFrames={FILM_FRAMES} />
  </Folder>
);
