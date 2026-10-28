import React from "react";
import { Composition, Folder } from "remotion";
import { FILM_FRAMES, WalletFilm } from "./Film";
// Compositions for project "stick-wallet-story": a 30 s code-drawn stick-figure story short, 9:16 (stick-figure-shorts skill).
// Rendered muted; narration (projects/stick-wallet-story/input/narration_takeA.mp3) is muxed with ffmpeg at +15 frames.

export const StickWalletStoryRoot: React.FC = () => (
  <Folder name="stick-wallet-story">
    <Composition id="stick-wallet-story-FILM" component={WalletFilm} width={1080} height={1920} fps={30} durationInFrames={FILM_FRAMES} />
  </Folder>
);
