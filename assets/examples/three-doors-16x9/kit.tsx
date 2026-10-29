import React from "react";
import { Audio, interpolate, random, Sequence, staticFile } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

// stick-figure-shorts kit: everything a code-drawn stick-figure story short needs, in one file.
// Copied from the stick-figure-shorts skill (assets/template/kit.tsx). Keep it generic: story-specific
// drawing goes in Film.tsx. 16:9 variant: the canvas is 2560x1440 world units, rendered at --scale=0.75 to 1920x1080, 30 fps.

export const { fontFamily: CAPTION_FONT } = loadInter("normal", { weights: ["800"], subsets: ["latin"] });
export const VW = 2560;
export const VH = 1440;

// ---------- maths ----------
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ramp = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
export const eio = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const eout = (t: number) => 1 - Math.pow(1 - t, 3);
export const eback = (t: number) => { const c1 = 1.7, c3 = c1 + 1; return t >= 1 ? 1 : 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
export const rnd = (s: string) => random(s);
const hex = (c: string) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
export const mix = (a: string, b: string, t: number) => {
  const A = hex(a), B = hex(b), k = clamp01(t);
  return "#" + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, "0")).join("");
};
// piecewise eased keyframes [frame, value]
export const keys = (f: number, K: [number, number][]) => {
  for (let k = 0; k < K.length - 1; k++) if (f <= K[k + 1][0]) return lerp(K[k][1], K[k + 1][1], eio(ramp(f, K[k][0], K[k + 1][0])));
  return K[K.length - 1][1];
};
// a pop-in that overshoots a little (0 → 1)
export const pop = (f: number, at: number, dur = 10) => eback(ramp(f, at, at + dur));

// ---------- shots + camera ----------
// The genre cuts every ~3 s. A shot = [from, to, render]. Each shot gets ONE slow eased push (zoom z0 → z1 around a focus point).
export type ShotDef = { from: number; to: number; z0?: number; z1?: number; fx?: number; fy?: number; render: (f: number, p: number) => React.ReactNode };
export const Shots: React.FC<{ f: number; shots: ShotDef[] }> = ({ f, shots }) => {
  const s = shots.find((x) => f >= x.from && f < x.to) ?? shots[shots.length - 1];
  const p = ramp(f, s.from, s.to);
  const z = lerp(s.z0 ?? 1, s.z1 ?? 1.06, eio(p));
  const fx = s.fx ?? VW / 2, fy = s.fy ?? VH / 2;
  return (
    <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${fx} ${fy}) scale(${z}) translate(${-fx} ${-fy})`}>{s.render(f - s.from, p)}</g>
    </svg>
  );
};

// ---------- the stick figure ----------
// Local space: origin = between the feet on the ground. Head radius 62, total height ~420 at scale 1.
// The look: a white circle head with a heavy ink outline, dot eyes, brows that carry the mood,
// single-line stick limbs, white mitten hands, chunky sneakers, ONE costume colour on the torso.
export const INK = "#16161d";
export const LINE = 7;
export type Mood = "neutral" | "worried" | "sly" | "happy" | "surprised" | "sad";
export type FigureProps = {
  x: number; y: number; s?: number; facing?: 1 | -1;
  coat: string; coatDark?: string;
  walk?: number;            // walk phase in radians (0 = standing)
  armL?: number; armR?: number;   // arm angles in degrees from straight down (positive = forward)
  elbowL?: number; elbowR?: number; // extra bend at the elbow (degrees)
  mood?: Mood; look?: [number, number]; blink?: number; // look: eye offset in px; blink 1 = open
  sweat?: number;           // 0..1
  hair?: "tuft" | "bun" | "none"; hairColor?: string;
  glasses?: boolean; scarf?: string; labCoat?: boolean;
  headTilt?: number; bob?: number;
  holdR?: React.ReactNode;  // drawn at the right (front) hand, in hand-local space
};
const limb = (sx: number, sy: number, a: number, len: number, bend = 0) => {
  const r1 = ((a) * Math.PI) / 180, r2 = ((a + bend) * Math.PI) / 180;
  const ex = sx + Math.sin(r1) * len * 0.52, ey = sy + Math.cos(r1) * len * 0.52;
  const hx = ex + Math.sin(r2) * len * 0.48, hy = ey + Math.cos(r2) * len * 0.48;
  return { d: `M ${sx},${sy} L ${ex},${ey} L ${hx},${hy}`, hx, hy };
};
export const Face: React.FC<{ mood: Mood; look: [number, number]; blink: number; cy: number }> = ({ mood, look, blink, cy }) => {
  const [lx, ly] = look;
  const ey = cy - 4 + ly;
  const eh = (mood === "surprised" ? 13 : 10) * blink;
  const brow = (side: -1 | 1) => {
    const bx = side * 22 + lx, by = cy - 30 + ly;
    // inner end = towards the nose
    const inner = { neutral: 0, worried: -9, sly: 7, happy: -3, surprised: -10, sad: -8 }[mood];
    const outer = { neutral: 0, worried: 5, sly: -4, happy: -3, surprised: -10, sad: 6 }[mood];
    return <path d={`M ${bx - side * 12},${by + inner} L ${bx + side * 12},${by + outer}`} stroke={INK} strokeWidth={6} strokeLinecap="round" />;
  };
  const my = cy + 26 + ly * 0.6, mx = lx * 0.8;
  const mouth = {
    neutral: `M ${mx - 9},${my} L ${mx + 9},${my}`,
    worried: `M ${mx - 12},${my + 3} q 6,-6 12,0 q 6,6 12,0`,
    sly: `M ${mx - 12},${my + 2} Q ${mx + 2},${my + 8} ${mx + 14},${my - 4}`,
    happy: `M ${mx - 14},${my - 3} Q ${mx},${my + 14} ${mx + 14},${my - 3}`,
    surprised: "",
    sad: `M ${mx - 12},${my + 6} Q ${mx},${my - 6} ${mx + 12},${my + 6}`,
  }[mood];
  return (
    <g>
      {[-1, 1].map((side) => <ellipse key={side} cx={side * 21 + lx} cy={ey} rx={6.5} ry={Math.max(1.5, eh)} fill={INK} />)}
      {brow(-1)}{brow(1)}
      {mood === "surprised" ? <ellipse cx={mx} cy={my + 2} rx={8} ry={10} fill={INK} /> : <path d={mouth} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
    </g>
  );
};
export const Figure: React.FC<FigureProps> = (p) => {
  const s = p.s ?? 1, fc = p.facing ?? 1, w = p.walk ?? 0;
  const walking = p.walk !== undefined && p.walk !== 0;
  const bob = (p.bob ?? 0) + (walking ? Math.abs(Math.sin(w)) * 6 : 0);
  const hipY = -150 - bob, shY = -282 - bob, headY = -352 - bob;
  const step = walking ? Math.sin(w) * 34 : 0;
  const lift = (ph: number) => (walking ? Math.max(0, Math.sin(ph)) * 14 : 0);
  const feet: [number, number][] = [[-20 - step, -10 - lift(w + Math.PI)], [20 + step, -10 - lift(w)]];
  const armSwing = walking ? Math.sin(w) * 22 : 0;
  // angles: 0 = hanging straight down, positive = swung forward (towards where the figure faces)
  const aL = limb(-40, shY + 10, (p.armL ?? -10) + armSwing, 120, p.elbowL ?? 0);
  const aR = limb(40, shY + 10, (p.armR ?? 10) - armSwing, 120, p.elbowR ?? 0);
  const coat = p.labCoat ? "#f4f4f2" : p.coat;
  const blink = p.blink ?? 1;
  return (
    <g transform={`translate(${p.x} ${p.y}) scale(${s * fc} ${s})`}>
      <ellipse cx={0} cy={2} rx={70} ry={11} fill="#000" opacity={0.22} />
      {/* legs: single ink lines, sneakers */}
      {feet.map(([fx, fy], k) => (
        <g key={k}>
          <path d={`M ${k ? 14 : -14},${hipY} L ${fx},${fy - 6}`} stroke={INK} strokeWidth={9} strokeLinecap="round" />
          <path d={`M ${fx - 16},${fy + 4} q -2,-16 14,-16 l 10,0 q 20,2 22,16 z`} fill="#fbfbf8" stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
        </g>
      ))}
      {/* back arm */}
      <path d={aL.d} stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={aL.hx} cy={aL.hy} r={15} fill="#fbfbf8" stroke={INK} strokeWidth={5.5} />
      {/* torso: one costume colour */}
      <path d={`M ${-46},${shY} Q 0,${shY - 16} 46,${shY} L ${p.labCoat ? 62 : 56},${hipY + 6} Q 0,${hipY + 18} ${p.labCoat ? -62 : -56},${hipY + 6} Z`} fill={coat} stroke={INK} strokeWidth={LINE} strokeLinejoin="round" />
      {p.labCoat ? <path d={`M 0,${shY - 8} L 0,${hipY + 12} M -18,${shY - 4} L 0,${shY + 34} L 18,${shY - 4}`} stroke={INK} strokeWidth={4} fill="none" /> : <path d={`M 0,${shY + 4} L 0,${hipY + 10}`} stroke={p.coatDark ?? mix(p.coat, "#000000", 0.35)} strokeWidth={4} />}
      {!p.labCoat && <path d={`M -30,${hipY - 34} l 20,0 M 10,${hipY - 34} l 20,0`} stroke={p.coatDark ?? mix(p.coat, "#000000", 0.35)} strokeWidth={4} strokeLinecap="round" />}
      {p.scarf && <path d={`M -38,${shY - 6} Q 0,${shY + 18} 38,${shY - 6} L 34,${shY + 10} Q 0,${shY + 32} -34,${shY + 10} Z M 18,${shY + 14} l 8,44 l 16,-4 l -10,-40`} fill={p.scarf} stroke={INK} strokeWidth={5} strokeLinejoin="round" />}
      {/* head */}
      <g transform={`rotate(${p.headTilt ?? 0} 0 ${headY + 50})`}>
        {p.hair === "bun" && <g><circle cx={0} cy={headY - 66} r={26} fill={p.hairColor ?? "#b9b6b0"} stroke={INK} strokeWidth={LINE} /></g>}
        <circle cx={0} cy={headY} r={62} fill="#fbfbf8" stroke={INK} strokeWidth={LINE} />
        {p.hair === "bun" && <path d={`M ${-60},${headY - 12} Q ${-56},${headY - 66} 0,${headY - 64} Q ${56},${headY - 66} ${60},${headY - 12} Q 30,${headY - 40} 0,${headY - 40} Q -30,${headY - 40} ${-60},${headY - 12} Z`} fill={p.hairColor ?? "#b9b6b0"} stroke={INK} strokeWidth={LINE} strokeLinejoin="round" />}
        {(p.hair ?? "tuft") === "tuft" && <path d={`M -10,${headY - 60} q 2,-26 22,-24 q -16,6 -8,22`} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />}
        <Face mood={p.mood ?? "neutral"} look={p.look ?? [0, 0]} blink={blink} cy={headY + 6} />
        {p.glasses && <g fill="none" stroke={INK} strokeWidth={4}><circle cx={-21 + (p.look?.[0] ?? 0)} cy={headY + 2 + (p.look?.[1] ?? 0)} r={16} /><circle cx={21 + (p.look?.[0] ?? 0)} cy={headY + 2 + (p.look?.[1] ?? 0)} r={16} /><path d={`M ${-5 + (p.look?.[0] ?? 0)},${headY + 2 + (p.look?.[1] ?? 0)} l 10,0`} /></g>}
        {(p.sweat ?? 0) > 0.01 && <path d={`M 66,${headY - 34} q -12,18 0,24 q 12,-6 0,-24 z`} fill="#8fd0ff" stroke={INK} strokeWidth={4} opacity={p.sweat} transform={`translate(0 ${(1 - (p.sweat ?? 0)) * -10})`} />}
      </g>
      {/* front arm + anything held */}
      <path d={aR.d} stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {p.holdR && <g transform={`translate(${aR.hx} ${aR.hy})`}>{p.holdR}</g>}
      <circle cx={aR.hx} cy={aR.hy} r={15} fill="#fbfbf8" stroke={INK} strokeWidth={5.5} />
    </g>
  );
};
// natural blinking: returns 1 (open) most of the time, a 4-frame close every ~3.5 s
export const blinkAt = (f: number, seed = 0) => { const q = (f + seed * 41) % 104; return q < 4 ? Math.abs(Math.cos((q / 4) * Math.PI)) * 0.9 + 0.1 : 1; };

// ---------- karaoke captions ----------
// The genre's subtitle: 2–4 heavy white words, the spoken word bright, the rest dim. Over light cards, pass dark.
export const Captions: React.FC<{ f: number; words: [number, number, string][]; chunks: [number, number][]; y?: number; dark?: boolean; hide?: boolean }> = ({ f, words, chunks, y = 1290, dark, hide }) => {
  if (hide) return null;
  const c = chunks.find(([a, b], k) => f >= words[a][0] - 2 && f < (chunks[k + 1] ? Math.min(words[chunks[k + 1][0]][0] - 2, words[b][1] + 24) : words[b][1] + 24));
  if (!c) return null;
  const on = dark ? "#16161d" : "#ffffff", off = dark ? "rgba(22,22,29,0.32)" : "rgba(255,255,255,0.42)";
  return (
    <div style={{ position: "absolute", left: 360, right: 360, top: y, display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "0 18px", fontFamily: CAPTION_FONT, fontWeight: 800, fontSize: 84, lineHeight: 1.15, letterSpacing: "-0.01em", textAlign: "center" }}>
      {words.slice(c[0], c[1] + 1).map(([s, , t], i) => (
        <span key={i} style={{ color: f >= s ? on : off, textShadow: dark ? "none" : "0 3px 0 rgba(0,0,0,0.55), 0 0 22px rgba(0,0,0,0.65)", transform: `translateY(${f >= s ? 0 : 4}px)` }}>{t}</span>
      ))}
    </div>
  );
};

// ---------- small props ----------
export const Glint: React.FC<{ x: number; y: number; t: number; r?: number }> = ({ x, y, t, r = 40 }) => {
  if (t <= 0 || t >= 1) return null;
  const k = Math.sin(t * Math.PI);
  return <g transform={`translate(${x} ${y}) rotate(${t * 90}) scale(${k})`}><path d={`M 0,${-r} L ${r * 0.16},${-r * 0.16} L ${r},0 L ${r * 0.16},${r * 0.16} L 0,${r} L ${-r * 0.16},${r * 0.16} L ${-r},0 L ${-r * 0.16},${-r * 0.16} Z`} fill="#fffbe6" /></g>;
};
// soft paper grain for flat cards
export const Grain: React.FC<{ id: string; opacity?: number }> = ({ id, opacity = 0.06 }) => (
  <g opacity={opacity} style={{ mixBlendMode: "multiply" }}>
    <filter id={id}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="5" /><feColorMatrix type="saturate" values="0" /></filter>
    <rect width={VW} height={VH} filter={`url(#${id})`} />
  </g>
);

// ---------- soundtrack ----------
// The whole mix lives in the composition, so the render comes out finished: narration + music bed + ambience + SFX.
// Files: the narration (loudness-normalised to -16 LUFS) in assets/projects/<slug>/narration.wav,
// the shared library in assets/projects/stick-sound-library/ (sfx_*.mp3, music_*.mp3, amb_*.mp3).
// Levels that work: voice 1.0 · music 0.2 under the voice, up to 0.34 once it ends · ambience 0.5 · SFX 0.25–0.6.
export const LIB = (name: string) => staticFile(`projects/stick-sound-library/${name}.mp3`);
export type Sfx = [frame: number, name: string, volume?: number];
export const Soundtrack: React.FC<{
  total: number; voice: string; voiceAt?: number; voiceEnd: number;
  music?: string; musicAt?: number; musicLen?: number; amb?: string; ambVol?: number; sfx?: Sfx[];
}> = ({ total, voice, voiceAt = 15, voiceEnd, music, musicAt = 0, musicLen = 1050, amb, ambVol = 0.5, sfx = [] }) => {
  const end = Math.min(total, musicAt + musicLen);
  const musicVol = (f: number) => {
    const g = f + musicAt; // composition frame
    const under = interpolate(g, [voiceEnd, voiceEnd + 20], [0.2, 0.34], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fadeIn = interpolate(g, [musicAt, musicAt + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fadeOut = interpolate(g, [end - 40, end - 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return under * fadeIn * fadeOut;
  };
  return (
    <>
      <Sequence from={voiceAt} durationInFrames={total - voiceAt}><Audio src={voice} /></Sequence>
      {music && <Sequence from={musicAt} durationInFrames={end - musicAt}><Audio src={LIB(music)} volume={musicVol} /></Sequence>}
      {amb && <Audio src={LIB(amb)} loop volume={(f) => ambVol * interpolate(f, [0, 15, total - 30, total - 2], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />}
      {sfx.map(([at, name, v = 0.45], k) => (
        <Sequence key={k} from={Math.max(0, at)} durationInFrames={Math.min(150, total - Math.max(0, at))}><Audio src={LIB(name)} volume={v} /></Sequence>
      ))}
    </>
  );
};
