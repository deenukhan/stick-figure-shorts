import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { loadVariableFont } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { Captions, CAPTION_FONT, eio, eout, Figure, Grain, INK, keys, lerp, pop, ramp, rnd, ShotDef, Shots, Sfx, Soundtrack, VH, VW, blinkAt, clamp01 } from "./kit";
import { CHUNKS, VOICE_END, WORDS } from "./words";

// "The Lost Phone": an original ~59 s stick-figure thriller, 16:9 (stick-figure-shorts skill, visual-grammar §8), in two cuts:
//   PICTURE: each beat is a held tableau or a photo on the phone; a handheld camera, slow push-ins, impact shakes, rain and light do the work.
//   MOTION:  the same story and soundtrack, with the characters acting (walking, turning, reaching, flinching, the car pulling out) and motivated camera moves.
// Built from the study of @saveo.house Part 4 (references/saveo.house/EP4_DekmHjDtjqb_STUDY.md): light-led realism, rain and splashes,
// diegetic phone screens and photos, locked camera + push-ins, shake only on impacts, a two-button ending. Original story and characters.
// Narration: ElevenLabs eleven_v4, voice Ethan – Mystery & Suspense Narrator (eCGXfCpGinKGrwYNoBuo), one take (54.2 s), at +15 frames.
// Key frames: "2 a.m." f30 · "rain" f94 · "buzzing" f179 · "Nobody's" f214 · "pick" f265 · "unlocked" f287 · "wallpaper" f340 ·
// "photo of you" f381–406 · "taken tonight" f423 · "across the street" f446–493 · "gallery" f517 · "41 photos" f545 · "café" f627 ·
// "front door" f673 · "asleep" f711 · "Here's what" f735 · "exact time" f878 · "GPS location" f916–938 · "inside the file" f990 ·
// "check the last photo" f1030 · "twelve minutes ago" f1084 · "Location?" f1128 · "Your bedroom" f1153 · "car door shuts" f1227–1249 ·
// "phone buzzes" f1285 · "One new message" f1333 · "You found it" f1361 · "bring it home" f1411 · "So what do you do?" f1460 ·
// "Go home?" f1479 · "call the police?" f1513 · "Comment" f1549 · voice ends f1628.
// Text rule (Deenu, 2026-10-29): animation carries every idea; the only text is plain subtitles plus what a phone would really show
// (the lock-screen clock, one photo time, the message). No fact cards, chips, labels or title cards. The EXIF fact is acted out:
// the photo lifts out of the phone and opens to show a clock and a map pin hidden inside it.
// Fact: a phone photo's file can carry EXIF metadata, including the date/time it was taken and, when the camera has location access,
// its GPS coordinates (EXIF standard, CIPA DC-008).

const { fontFamily: SERIF } = loadVariableFont("normal", { subsets: ["latin"] });
const { fontFamily: MONO } = loadMono("normal", { weights: ["500"], subsets: ["latin"] });
export const FILM_FRAMES = 1760;
const serif = { fontFamily: SERIF, fontWeight: 800, fontVariationSettings: "'SOFT' 100, 'opsz' 144" } as const;

// cuts (composition frames)
const C = { A2: 106, A3: 214, A4: 255, A5: 287, A6: 423, A7: 462, A8: 517, A9: 617, A10: 659, A11: 705, A12: 735, A13: 1030, A14: 1128, A14b: 1153, A15: 1200, A16: 1220, A17: 1285, A18: 1460, A18b: 1479, A18c: 1513, A18d: 1549 };

const SFX: Sfx[] = [
  [40, "sfx_thunder", 0.3],
  [148, "sfx_phone_buzz", 0.55],
  [285, "sfx_screen_tap", 0.5], [395, "sfx_heartbeat", 0.5],
  [C.A6, "sfx_shutter", 0.6], [C.A7 + 4, "sfx_thunder", 0.4],
  [C.A8 + 2, "sfx_screen_tap", 0.45],
  [C.A9, "sfx_shutter", 0.55], [C.A10, "sfx_shutter", 0.55], [C.A11, "sfx_shutter", 0.55], [714, "sfx_heartbeat", 0.55],
  [800, "sfx_data_scan", 0.3], [876, "sfx_clock_tick", 0.5], [880, "sfx_pop", 0.25], [916, "sfx_pop", 0.3], [990, "sfx_data_scan", 0.3], [1006, "sfx_card_slide", 0.25],
  [C.A13 + 2, "sfx_screen_tap", 0.45], [1082, "sfx_pop", 0.28],
  [C.A14 - 2, "sfx_data_scan", 0.35], [1140, "sfx_pop", 0.3], [C.A14b - 2, "sfx_braam", 0.7],
  [C.A15, "sfx_heartbeat", 0.6],
  [1241, "sfx_car_door", 0.85], [1266, "sfx_thunder", 0.3],
  [C.A17 + 1, "sfx_phone_buzz", 0.6], [1331, "sfx_notify", 0.6],
  [C.A18, "sfx_heartbeat", 0.5], [C.A18b + 2, "sfx_thunder", 0.3], [C.A18c + 4, "sfx_screen_tap", 0.45], [1600, "sfx_thunder", 0.35],
];
const SFX_MOTION: Sfx[] = [[6, "sfx_footsteps", 0.35], [52, "sfx_footsteps", 0.3]];

// palette: a wet night street, a warm sodium streetlamp, a cold shelter light, the hero's yellow raincoat
const NIGHT = "#0c1220", BLD = "#121a2b", ROAD = "#151a24", WALK = "#1b202b", LAMP = "#ffcf84", COLD = "#9cc3ee", COAT = "#e2b13c", CAR = "#262b35";
const PAPER = "#F6F1EA", CINK = "#2A1E17", MUTED = "#7a6a5e";
const GROUND = 1250;  // near-sidewalk ground: feet stay above the caption band (1290+)
const LAMP_X = 1440, LAMP_Y = 300;
const BENCH_PHONE: [number, number] = [1880, 1074];

// ---------- particles ----------
const rr = (k: number, s: string) => rnd(`${s}-${k}`);
// rain: one path of streaks falling (frozen when f is fixed, e.g. inside a photo)
const Rain: React.FC<{ f: number; n: number; seed: string; speed: number; len: number; w: number; op: number; slant?: number; color?: string; x0?: number; x1?: number; y0?: number; y1?: number; clip?: string }> = ({ f, n, seed, speed, len, w, op, slant = 0.16, color = "#c9d8ee", x0 = -200, x1 = VW + 200, y0 = 0, y1 = VH, clip }) => {
  const H = y1 - y0 + len;
  let d = "";
  for (let k = 0; k < n; k++) {
    const sp = speed * (0.75 + 0.5 * rr(k, seed + "s"));
    const yy = ((rr(k, seed + "y") * H + f * sp) % H) + y0 - len * 0.5;
    const xx = x0 + rr(k, seed + "x") * (x1 - x0) - (yy - y0) * slant;
    d += `M ${xx.toFixed(1)},${yy.toFixed(1)} l ${(slant * len).toFixed(1)},${(-len).toFixed(1)} `;
  }
  return <path d={d} stroke={color} strokeWidth={w} opacity={op} strokeLinecap="round" clipPath={clip} />;
};
// splashes: little rings popping on the wet ground
const Splashes: React.FC<{ f: number; n: number; seed: string; x0: number; x1: number; y0: number; y1: number; op?: number; s?: number }> = ({ f, n, seed, x0, x1, y0, y1, op = 0.5, s = 1 }) => (
  <g>
    {Array.from({ length: n }, (_, k) => {
      const P = 12 + (k % 5) * 3;
      const ph = f + rr(k, seed) * P;
      const cyc = Math.floor(ph / P), t = (ph % P) / P;
      const x = x0 + rr(k * 97 + cyc, seed + "x") * (x1 - x0), y = y0 + rr(k * 13 + cyc, seed + "y") * (y1 - y0);
      const r = (4 + t * 20) * s;
      return <ellipse key={k} cx={x} cy={y} rx={r} ry={r * 0.3} fill="none" stroke="#c9d8ee" strokeWidth={2.5 * s} opacity={(1 - t) * op} />;
    })}
  </g>
);

// ---------- the street (wide set): far buildings, road, near sidewalk, a streetlamp, a bus shelter, a dark car across the road ----------
type CarState = { dome?: number; lights?: number; dx?: number; head?: number };
const WINDOWS = Array.from({ length: 70 }, (_, k) => k);
const Car: React.FC<{ x: number; y: number; s?: number; st?: CarState }> = ({ x, y, s = 1, st = {} }) => {
  const dome = st.dome ?? 0, lights = st.lights ?? 0;
  return (
    <g transform={`translate(${x + (st.dx ?? 0)} ${y}) scale(${s})`}>
      {/* headlight beams first (behind the body), pointing right along the road */}
      {lights > 0.01 && (
        <g style={{ mixBlendMode: "screen" }} opacity={lights}>
          <path d="M 250,-58 L 1300,-170 L 1300,40 Z" fill="url(#beam)" />
          <ellipse cx={262} cy={-52} rx={60} ry={34} fill="url(#glare)" />
          <rect x={230} y={-10} width={900} height={60} fill="url(#beamRefl)" opacity={0.6} />
        </g>
      )}
      <path d="M -260,-20 L -250,-70 Q -240,-88 -200,-92 L -120,-96 L -70,-150 Q -55,-164 -20,-166 L 110,-166 Q 140,-164 160,-146 L 205,-98 L 240,-90 Q 262,-82 262,-58 L 262,-20 Q 262,-6 248,-6 L -246,-6 Q -260,-6 -260,-20 Z" fill={CAR} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M -105,-100 L -62,-146 Q -52,-156 -28,-156 L 40,-156 L 40,-100 Z M 52,-100 L 52,-156 L 106,-156 Q 128,-154 142,-140 L 182,-100 Z" fill={dome > 0.01 ? `rgba(255,214,150,${0.15 + 0.55 * dome})` : "#0f131b"} stroke={INK} strokeWidth={4} />
      {/* a silhouette at the wheel: only readable when the dome light is on */}
      <g opacity={0.25 + 0.75 * dome}><circle cx={96} cy={-128} r={18} fill="#0a0c12" /><path d="M 78,-100 Q 96,-118 114,-100 Z" fill="#0a0c12" /></g>
      <path d="M -40,-150 L -20,-108" stroke="#3a4152" strokeWidth={3} opacity={0.6} />
      {[-160, 160].map((wx) => <g key={wx}><circle cx={wx} cy={-6} r={40} fill="#0b0d12" stroke={INK} strokeWidth={5} /><circle cx={wx} cy={-6} r={16} fill="#3a404d" /></g>)}
      <rect x={244} y={-70} width={18} height={18} rx={4} fill={lights > 0.01 ? "#fff6d8" : "#4a4f5a"} />
      <rect x={-262} y={-70} width={12} height={16} rx={3} fill={lights > 0.01 ? "#ff4b3e" : "#5a2a2a"} />
      {lights > 0.01 && <ellipse cx={-262} cy={-62} rx={30} ry={18} fill="#ff4b3e" opacity={0.35 * lights} style={{ mixBlendMode: "screen" }} />}
    </g>
  );
};
const Lamp: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <path d={`M 1290,${GROUND} L 1290,330 Q 1290,290 1330,290 L ${LAMP_X - 30},290`} stroke="#252c3a" strokeWidth={16} fill="none" strokeLinecap="round" />
    <path d={`M 1290,${GROUND} L 1290,330 Q 1290,290 1330,290 L ${LAMP_X - 30},290`} stroke={INK} strokeWidth={4} fill="none" opacity={0.6} />
    <path d={`M ${LAMP_X - 52},${LAMP_Y + 10} L ${LAMP_X + 52},${LAMP_Y + 10} L ${LAMP_X + 30},${LAMP_Y - 18} L ${LAMP_X - 30},${LAMP_Y - 18} Z`} fill="#2c3445" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <g style={{ mixBlendMode: "screen" }} opacity={0.92 + 0.08 * Math.sin(f * 0.9) * Math.sin(f * 0.37)}>
      <path d={`M ${LAMP_X - 44},${LAMP_Y + 12} L ${LAMP_X + 44},${LAMP_Y + 12} L ${LAMP_X + 420},${GROUND} L ${LAMP_X - 420},${GROUND} Z`} fill="url(#cone)" />
      <circle cx={LAMP_X} cy={LAMP_Y + 14} r={90} fill="url(#bulb)" />
      <ellipse cx={LAMP_X} cy={GROUND} rx={460} ry={70} fill="url(#pool)" />
    </g>
  </g>
);
const Shelter: React.FC<{ f: number; glow?: number }> = ({ f, glow = 0 }) => (
  <g>
    {/* back glass */}
    <rect x={1580} y={510} width={700} height={640} fill="rgba(140,170,215,0.10)" stroke={INK} strokeWidth={5} />
    {[0, 1, 2].map((k) => <path key={k} d={`M ${1640 + k * 210},${540} l 120,-0 l -180,560 l -120,0 Z`} fill="#cfe2ff" opacity={0.05} />)}
    <line x1={1930} y1={510} x2={1930} y2={1150} stroke={INK} strokeWidth={4} opacity={0.7} />
    {/* ad lightbox */}
    <rect x={2090} y={560} width={180} height={470} rx={6} fill="url(#adbox)" stroke={INK} strokeWidth={5} />
    <circle cx={2180} cy={720} r={50} fill={COAT} opacity={0.75} />
    {[820, 860, 890].map((y, k) => <rect key={y} x={2120} y={y} width={k ? 100 : 130} height={14} rx={7} fill="#2a3448" opacity={0.7} />)}
    <rect x={2060} y={540} width={240} height={520} fill="url(#pool2)" style={{ mixBlendMode: "screen" }} opacity={0.5} />
    {/* roof + posts */}
    <rect x={1550} y={470} width={760} height={34} rx={4} fill="#2a3242" stroke={INK} strokeWidth={5} />
    <rect x={1550} y={466} width={760} height={6} fill="#56627a" />
    {[1570, 2290].map((x) => <rect key={x} x={x - 9} y={500} width={18} height={GROUND - 500} fill="#262d3b" stroke={INK} strokeWidth={4} />)}
    {/* bench */}
    <rect x={1700} y={1064} width={340} height={22} rx={6} fill="#3b4354" stroke={INK} strokeWidth={5} />
    {[1730, 2010].map((x) => <rect key={x} x={x - 7} y={1086} width={14} height={GROUND - 1086} fill="#2a303c" stroke={INK} strokeWidth={3} />)}
    {glow > 0.01 && <ellipse cx={BENCH_PHONE[0]} cy={BENCH_PHONE[1] - 20} rx={260} ry={150} fill="url(#screenGlow)" opacity={glow} style={{ mixBlendMode: "screen" }} />}
    <Rain f={f} n={40} seed="glass" speed={18} len={50} w={2} op={0.25} x0={1580} x1={2280} y0={510} y1={1150} clip="url(#glassClip)" />
  </g>
);
// the phone lying on the bench (front view: a thin slab with its screen lit)
const BenchPhone: React.FC<{ lit: number; jitter?: number }> = ({ lit, jitter = 0 }) => (
  <g transform={`translate(${BENCH_PHONE[0] + jitter} ${BENCH_PHONE[1]})`}>
    <rect x={-46} y={-12} width={92} height={12} rx={4} fill="#0b0d12" stroke={INK} strokeWidth={3} />
    <rect x={-40} y={-13} width={80} height={4} rx={2} fill={lit > 0.05 ? "#d8ecff" : "#1a2030"} opacity={0.4 + 0.6 * lit} />
    {Math.abs(jitter) > 0.01 && [-1, 1].map((sd) => <path key={sd} d={`M ${sd * 62},-24 q ${sd * 12},10 0,20 M ${sd * 78},-30 q ${sd * 16},14 0,30`} stroke="#d8ecff" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.9} />)}
  </g>
);

const Street: React.FC<{ f: number; pan?: number; car?: CarState; benchGlow?: number; rain?: boolean; children?: React.ReactNode; front?: React.ReactNode }> = ({ f, pan = 0, car, benchGlow = 0, rain = true, children, front }) => (
  <g>
    {/* sky + far buildings (slow parallax) */}
    <rect width={VW} height={VH} fill={NIGHT} />
    <rect width={VW} height={800} fill="url(#sky)" />
    <g transform={`translate(${-pan * 0.25} 0)`}>
      {WINDOWS.map((k) => {
        if (k > 22) return null;
        const x = -400 + k * 170, top = 140 + rr(k, "bt") * 300, w = 160;
        return (
          <g key={k}>
            <rect x={x} y={top} width={w} height={790 - top} fill={k % 2 ? BLD : "#151e31"} stroke="#0a0f1a" strokeWidth={3} />
            {Array.from({ length: 12 }, (_, j) => {
              const wx = x + 22 + (j % 3) * 46, wy = top + 30 + Math.floor(j / 3) * 70;
              if (wy > 740) return null;
              const on = rr(k * 31 + j, "win") > 0.82;
              return <rect key={j} x={wx} y={wy} width={24} height={34} fill={on ? (rr(k + j, "wc") > 0.5 ? "#ffcf84" : "#9cc3ee") : "#0f1626"} opacity={on ? 0.75 : 1} />;
            })}
          </g>
        );
      })}
    </g>
    <rect x={0} y={700} width={VW} height={120} fill="url(#haze)" />
    {/* far sidewalk, road, near curb and sidewalk */}
    <g transform={`translate(${-pan * 0.6} 0)`}>
      <rect x={-1000} y={780} width={VW + 2000} height={40} fill="#1e2433" />
      <rect x={-1000} y={816} width={VW + 2000} height={6} fill="#2b3243" />
      <rect x={-1000} y={822} width={VW + 2000} height={240} fill={ROAD} />
      {Array.from({ length: 16 }, (_, k) => <rect key={k} x={-900 + k * 300} y={936} width={150} height={7} fill="#3a4152" opacity={0.6} />)}
      {/* wet reflections on the road */}
      <rect x={LAMP_X - 70 + pan * 0.6} y={822} width={140} height={240} fill="url(#refl)" opacity={0.55} filter="url(#streak)" />
      <Car x={640} y={846} s={1} st={car} />
      {(car?.lights ?? 0) > 0.01 && <rect x={880 + (car?.dx ?? 0)} y={850} width={120} height={210} fill="url(#refl)" opacity={0.7 * (car?.lights ?? 0)} filter="url(#streak)" />}
    </g>
    <g transform={`translate(${-pan} 0)`}>
      <rect x={-1000} y={1060} width={VW + 2000} height={22} fill="#2a3040" stroke={INK} strokeWidth={3} />
      <rect x={-1000} y={1082} width={VW + 2000} height={VH - 1082} fill={WALK} />
      {Array.from({ length: 30 }, (_, k) => <line key={k} x1={-900 + k * 180} y1={1082} x2={-1000 + k * 200} y2={VH} stroke="#161a23" strokeWidth={4} />)}
      {[1150, 1260, 1390].map((y) => <line key={y} x1={-1000} y1={y} x2={VW + 1000} y2={y} stroke="#161a23" strokeWidth={4} />)}
      {/* puddles that catch the lamp */}
      {[[700, 1330, 180], [1480, 1380, 260], [2250, 1320, 150]].map(([x, y, r], k) => (
        <g key={k}><ellipse cx={x} cy={y} rx={r} ry={r * 0.16} fill="#10141c" /><ellipse cx={x} cy={y} rx={r * 0.8} ry={r * 0.1} fill="url(#pool)" opacity={0.5} /></g>
      ))}
      <Lamp f={f} />
      <Shelter f={f} glow={benchGlow} />
      {children}
      {rain && <Splashes f={f} n={46} seed="sp" x0={-200} x1={VW + 200} y0={1100} y1={VH} op={0.45} />}
      {front}
    </g>
    {rain && (
      <g>
        <Rain f={f} n={260} seed="far" speed={26} len={60} w={2} op={0.22} />
        <Rain f={f} n={60} seed="cone" speed={30} len={70} w={2.5} op={0.55} color="#ffe6b8" clip="url(#coneClip)" />
        <Rain f={f} n={90} seed="near" speed={44} len={120} w={3.5} op={0.3} />
      </g>
    )}
  </g>
);

// ---------- the phone (insert) ----------
const PW = 520, PH = 1060;
const Phone: React.FC<{ x: number; y: number; rot?: number; s?: number; children?: React.ReactNode }> = ({ x, y, rot = 0, s = 1, children }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-PW / 2 - 300} y={-PH / 2 - 200} width={PW + 600} height={PH + 400} fill="url(#screenGlow)" opacity={0.55} style={{ mixBlendMode: "screen" }} />
    <rect x={-PW / 2 - 22} y={-PH / 2 - 22} width={PW + 44} height={PH + 44} rx={74} fill="#0b0d12" stroke={INK} strokeWidth={9} />
    <g transform={`translate(${-PW / 2} ${-PH / 2})`} clipPath="url(#screenClip)">
      <rect width={PW} height={PH} fill="#05070c" />
      {children}
      {/* raindrops on the glass */}
      {Array.from({ length: 14 }, (_, k) => <g key={k} opacity={0.55}><circle cx={rr(k, "dx") * PW} cy={rr(k, "dy") * PH} r={6 + rr(k, "dr") * 12} fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth={2} /></g>)}
    </g>
    <rect x={-60} y={-PH / 2 + 16} width={120} height={30} rx={15} fill="#000" />
  </g>
);
// the hand holding it: a yellow sleeve from the lower right and a white mitten on the phone's edge
const HoldHand: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <path d={`M ${x + 520},${y + 760} L ${x + 50},${y + 80}`} stroke={INK} strokeWidth={170} strokeLinecap="round" />
    <path d={`M ${x + 520},${y + 760} L ${x + 50},${y + 80}`} stroke={COAT} strokeWidth={150} strokeLinecap="round" />
    <circle cx={x} cy={y} r={96} fill="#fbfbf8" stroke={INK} strokeWidth={10} />
    <ellipse cx={x - 70} cy={y - 60} rx={34} ry={60} fill="#fbfbf8" stroke={INK} strokeWidth={9} transform={`rotate(-30 ${x - 70} ${y - 60})`} />
  </g>
);
const PhoneShot: React.FC<{ f: number; lift?: number; tremble?: number; children?: React.ReactNode }> = ({ f, lift = 0, tremble = 0, children }) => {
  const tx = tremble * Math.sin(f * 1.7) * 3, ty = tremble * Math.sin(f * 2.3 + 1) * 3 + lift;
  return (
    <g>
      <g transform="translate(1500 760) scale(2.1) translate(-1500 -800)" filter="url(#dof)"><Street f={f} /></g>
      <rect width={VW} height={VH} fill="#05070c" opacity={0.45} />
      <g transform={`translate(${tx} ${ty})`}>
        <Phone x={1180} y={650} rot={-3}>{children}</Phone>
        <HoldHand x={1452} y={930} />
      </g>
    </g>
  );
};

// ---------- the photos (each a full 2560x1440 picture, drawn in code) ----------
type PhotoKind = "bus" | "cafe" | "door" | "asleep" | "bedroom";
const YouFig: React.FC<{ x: number; y: number; s: number; facing?: 1 | -1; walk?: number; look?: [number, number]; mood?: "neutral" | "worried" | "surprised" | "sad" | "happy"; armR?: number; elbowR?: number; holdR?: React.ReactNode; blink?: number; headTilt?: number; sweat?: number; bob?: number }> = (p) => (
  <Figure coat={COAT} hair="none" {...p} />
);
const Bedroom: React.FC<{ asleep: boolean }> = ({ asleep }) => (
  <g>
    <rect width={VW} height={VH} fill="#111827" />
    <rect y={1040} width={VW} height={400} fill="#0d1320" />
    {/* window with blinds, streetlight outside */}
    <rect x={1560} y={260} width={560} height={560} fill="#1d2a44" stroke={INK} strokeWidth={8} />
    <circle cx={1900} cy={400} r={180} fill="url(#pool)" opacity={0.6} />
    {Array.from({ length: 14 }, (_, k) => <rect key={k} x={1560} y={270 + k * 40} width={560} height={22} fill="#141c2e" />)}
    {/* blind light falling across the wall and the bed */}
    {Array.from({ length: 7 }, (_, k) => <path key={k} d={`M ${1500},${330 + k * 80} L ${600},${560 + k * 80} L ${600},${585 + k * 80} L ${1500},${352 + k * 80} Z`} fill="#9cb6e0" opacity={0.06} />)}
    {/* bed */}
    <rect x={420} y={600} width={980} height={330} rx={20} fill="#1c2436" stroke={INK} strokeWidth={8} />
    <rect x={380} y={900} width={1120} height={160} rx={18} fill="#222c42" stroke={INK} strokeWidth={8} />
    <rect x={480} y={800} width={300} height={110} rx={50} fill="#d9dde6" stroke={INK} strokeWidth={7} opacity={0.85} />
    {asleep ? (
      <g>
        <circle cx={640} cy={810} r={70} fill="#fbfbf8" stroke={INK} strokeWidth={7} />
        <path d="M 606,806 q 12,8 24,0 M 652,806 q 12,8 24,0" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M 600,860 Q 760,820 1000,850 Q 1300,830 1480,900 L 1480,1000 L 560,1000 Z" fill="#33405e" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      </g>
    ) : (
      <g>
        <path d="M 560,792 q 60,-20 120,10" stroke="#9aa2b2" strokeWidth={5} fill="none" />
        <path d="M 900,900 Q 1050,860 1200,920 Q 1320,880 1480,930 L 1480,1000 L 900,1000 Z" fill="#33405e" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        <path d="M 900,900 Q 960,960 900,1000" stroke={INK} strokeWidth={6} fill="none" />
        {/* doorframe in the foreground: the photo was taken from the doorway */}
        <rect x={0} y={0} width={190} height={VH} fill="#0a0e17" />
        <rect x={170} y={0} width={30} height={VH} fill="#1a2232" stroke={INK} strokeWidth={5} />
      </g>
    )}
  </g>
);
const PhotoScene: React.FC<{ kind: PhotoKind }> = ({ kind }) => {
  if (kind === "bus") return <g transform="translate(1150 820) scale(1.7) translate(-1150 -860)"><Street f={0}><YouFig x={1150} y={GROUND} s={1.5} walk={1.3} look={[10, 2]} /></Street></g>;
  if (kind === "cafe") return (
    <g>
      <rect width={VW} height={VH} fill="#2a1d16" />
      <rect x={300} y={160} width={1960} height={980} fill="#5a3b26" />
      {[[700, 330], [1300, 300], [1900, 340]].map(([x, y], k) => <g key={k}><line x1={x} y1={160} x2={x} y2={y - 40} stroke="#1a120c" strokeWidth={4} /><circle cx={x} cy={y} r={46} fill="#ffd28a" /><circle cx={x} cy={y} r={180} fill="url(#pool)" opacity={0.8} /></g>)}
      {[520, 680].map((y) => <rect key={y} x={1700} y={y} width={500} height={16} fill="#3a2618" />)}
      <YouFig x={1150} y={1300} s={2.1} look={[10, 6]} armR={70} elbowR={-60} holdR={<g><rect x={-26} y={-30} width={52} height={56} rx={8} fill="#f4efe6" stroke={INK} strokeWidth={5} /><path d="M 26,-16 q 22,4 0,26" stroke={INK} strokeWidth={5} fill="none" /></g>} />
      <rect x={600} y={1000} width={1300} height={40} rx={8} fill="#7a5233" stroke={INK} strokeWidth={7} />
      <rect x={640} y={1040} width={1220} height={400} fill="#3a2618" />
      {/* the window it was shot through: dark frame, reflections, rain streaks */}
      <path d={`M 0,0 H ${VW} V ${VH} H 0 Z M 300,160 V 1140 H 2260 V 160 Z`} fill="#0d0f14" fillRule="evenodd" />
      {[0, 1, 2, 3].map((k) => <path key={k} d={`M ${500 + k * 520},160 l 160,0 l -360,980 l -160,0 Z`} fill="#ffffff" opacity={0.04} />)}
      <Rain f={7} n={70} seed="cafeglass" speed={0} len={70} w={3} op={0.35} slant={0.03} x0={300} x1={2260} y0={160} y1={1140} />
    </g>
  );
  if (kind === "door") return (
    <g>
      <rect width={VW} height={VH} fill="#141a26" />
      <rect x={900} y={180} width={1300} height={1080} fill="#252c3b" />
      {Array.from({ length: 12 }, (_, k) => <line key={k} x1={900} y1={220 + k * 86} x2={2200} y2={220 + k * 86} stroke="#1c2230" strokeWidth={6} />)}
      <circle cx={1960} cy={380} r={260} fill="url(#pool)" />
      <rect x={1930} y={360} width={56} height={70} rx={10} fill="#ffe2a8" stroke={INK} strokeWidth={5} />
      <rect x={1400} y={360} width={420} height={890} fill="#5a3a26" stroke={INK} strokeWidth={9} />
      <rect x={1450} y={420} width={320} height={330} fill="none" stroke="#45301f" strokeWidth={8} />
      <rect x={1450} y={800} width={320} height={380} fill="none" stroke="#45301f" strokeWidth={8} />
      <circle cx={1760} cy={830} r={16} fill="#d9a441" stroke={INK} strokeWidth={4} />
      <text x={1610} y={330} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={64} fill="#d9c7a2">12</text>
      <rect x={1300} y={1250} width={620} height={40} fill="#323a4a" stroke={INK} strokeWidth={6} />
      <YouFig x={1250} y={1250} s={1.9} look={[14, 4]} armR={60} elbowR={-20} holdR={<path d="M 0,0 l 30,10 m -14,-5 l 4,12" stroke="#d9a441" strokeWidth={8} strokeLinecap="round" />} />
      {/* shot from across the yard, through wet leaves */}
      {Array.from({ length: 9 }, (_, k) => <ellipse key={k} cx={rr(k, "lf") * 900} cy={900 + rr(k, "lfy") * 600} rx={220} ry={90} fill="#0b1210" transform={`rotate(${-30 + k * 9} ${rr(k, "lf") * 900} ${900 + rr(k, "lfy") * 600})`} />)}
    </g>
  );
  return <Bedroom asleep={kind === "asleep"} />;
};
// a photo as a picture: graded, grainy, framed by the phone's gallery chrome
const Photo: React.FC<{ kind: PhotoKind; label?: string; night?: boolean }> = ({ kind, night }) => (
  <g>
    <g filter={night ? "url(#nightcam)" : "url(#photo)"}><PhotoScene kind={kind} /></g>
    <Grain id={`pg-${kind}`} opacity={night ? 0.24 : 0.18} />
    <rect width={VW} height={VH} fill="url(#vigPhoto)" />
  </g>
);
// the same picture as a vertical crop for the phone screen
const PhotoCrop: React.FC<{ kind: PhotoKind; vb: string; w?: number; h?: number; x?: number; y?: number; night?: boolean }> = ({ kind, vb, w = PW, h = PH, x = 0, y = 0, night }) => (
  <svg x={x} y={y} width={w} height={h} viewBox={vb} preserveAspectRatio="xMidYMid slice">
    <g filter={night ? "url(#nightcam)" : "url(#photo)"}><PhotoScene kind={kind} /></g>
  </svg>
);
const CROP: Record<PhotoKind, string> = { bus: "780 300 640 1300", cafe: "800 100 700 1400", door: "1000 120 700 1400", asleep: "300 380 700 1000", bedroom: "500 300 800 1100" };

// ---------- phone screens (screen space 520x1060) ----------
const HomeScreen: React.FC<{ k?: number; time?: string }> = ({ k = 1, time = "2:01" }) => (
  <g opacity={k}>
    <PhotoCrop kind="bus" vb={CROP.bus} />
    <rect width={PW} height={PH} fill="url(#homeShade)" />
    <text x={PW / 2} y={210} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={124} fill="#fbfbf8">{time}</text>
    <text x={PW / 2} y={258} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={28} fill="#fbfbf8" opacity={0.85}>Thursday, October 29</text>
    <rect x={30} y={920} width={460} height={110} rx={36} fill="rgba(255,255,255,0.18)" />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={52 + i * 110} y={940} width={84} height={72} rx={20} fill={["#7fb6ff", "#8bd17c", "#f2f2f2", "#ffb35a"][i]} opacity={0.9} />)}
  </g>
);
const THUMBS: PhotoKind[] = ["bus", "door", "cafe", "asleep", "bus", "cafe", "door", "bedroom", "asleep", "cafe", "bus", "door", "asleep", "cafe", "door", "bus", "asleep", "door"];
const GalleryScreen: React.FC<{ scroll: number; hi?: number }> = ({ scroll, hi = -1 }) => (
  <g>
    <rect width={PW} height={PH} fill="#0b0d12" />
    <g transform={`translate(0 ${-scroll})`}>
      {THUMBS.map((kind, i) => {
        const c = i % 3, r = Math.floor(i / 3);
        return (
          <g key={i}>
            <PhotoCrop kind={kind} vb={CROP[kind]} x={4 + c * 172} y={190 + r * 172} w={168} h={168} night={kind === "asleep" || kind === "bedroom"} />
            {i === hi && <rect x={4 + c * 172} y={190 + r * 172} width={168} height={168} fill="none" stroke={COAT} strokeWidth={8} />}
          </g>
        );
      })}
    </g>
    <rect width={PW} height={180} fill="#0b0d12" opacity={0.92} />
  </g>
);
const InfoScreen: React.FC<{ chip: number; map: number; pin: number }> = ({ chip, map, pin }) => (
  <g>
    <rect width={PW} height={PH} fill="#0b0d12" />
    <PhotoCrop kind="bedroom" vb={CROP.bedroom} w={PW} h={560} night />
    <text x={28} y={630} fontFamily={CAPTION_FONT} fontWeight={800} fontSize={38} fill="#fbfbf8">Today · 1:51 AM</text>
    {chip > 0.01 && <rect x={28} y={650} width={lerp(0, 330, eout(chip))} height={6} rx={3} fill={COAT} />}
    {map > 0.01 && (
      <g opacity={map}>
        <rect x={28} y={740} width={464} height={290} rx={22} fill="#1a2233" />
        {[[28, 830, 492, 820], [28, 930, 492, 950], [140, 740, 170, 1030], [330, 740, 300, 1030]].map(([a, b, c2, d], k) => <line key={k} x1={a} y1={b} x2={c2} y2={d} stroke="#2d3850" strokeWidth={18} />)}
        {[[60, 760], [200, 760], [360, 760], [60, 860], [200, 860], [360, 860], [60, 960], [200, 960], [360, 960]].map(([x, y], k) => k === 4 ? null : <rect key={k} x={x} y={y} width={70} height={50} rx={6} fill="#232c40" />)}
        {/* your home: a little house on the map */}
        <g transform="translate(245 900)"><path d="M -40,0 L -40,-34 L 0,-62 L 40,-34 L 40,0 Z" fill="#3a4560" stroke="#8fa0c4" strokeWidth={4} strokeLinejoin="round" /><rect x={-10} y={-24} width={20} height={24} fill="#ffcf84" /></g>
        <circle cx={420} cy={1000} r={12} fill="#4aa3ff" stroke="#fff" strokeWidth={4} />
        {pin > 0.01 && (
          <g transform={`translate(245 ${lerp(740, 838, eout(pin))}) scale(${clamp01(pin * 1.2)})`}>
            <path d="M 0,0 C -34,-40 -34,-80 0,-80 C 34,-80 34,-40 0,0 Z" fill="#ff4b3e" stroke={INK} strokeWidth={5} />
            <circle cx={0} cy={-54} r={11} fill="#fff" />
          </g>
        )}
      </g>
    )}
  </g>
);
const MessageScreen: React.FC<{ banner: number; t1: number; t2: number }> = ({ banner, t1, t2 }) => {
  const L1 = "You found it.", L2 = "Now bring it home.";
  return (
    <g>
      <HomeScreen time="2:04" />
      <rect width={PW} height={PH} fill="#000" opacity={0.25 * banner} />
      <g transform={`translate(0 ${lerp(-220, 0, eout(banner))})`} opacity={clamp01(banner * 1.5)}>
        <rect x={18} y={40} width={484} height={190} rx={32} fill="rgba(250,250,248,0.94)" />
        <rect x={40} y={64} width={56} height={56} rx={14} fill="#8bd17c" />
        <text x={112} y={92} fontFamily={CAPTION_FONT} fontWeight={800} fontSize={30} fill={INK}>Unknown</text>
        <text x={480} y={92} textAnchor="end" fontFamily={MONO} fontSize={22} fill="#6b6f78">now</text>
        <text x={112} y={146} fontFamily={CAPTION_FONT} fontWeight={800} fontSize={36} fill={INK}>{L1.slice(0, Math.round(L1.length * t1))}</text>
        <text x={112} y={190} fontFamily={CAPTION_FONT} fontWeight={800} fontSize={36} fill={INK}>{L2.slice(0, Math.round(L2.length * t2))}</text>
      </g>
    </g>
  );
};

// ---------- the fact, acted out: the photo lifts out of the phone and opens; a clock and a map pin come out of it ----------
const Clock: React.FC<{ x: number; y: number; k: number; spin?: number }> = ({ x, y, k, spin = 0 }) => k <= 0.01 ? null : (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <circle r={150} fill="url(#screenGlow)" style={{ mixBlendMode: "screen" }} />
    <circle r={104} fill="#fbfbf8" stroke={INK} strokeWidth={9} />
    {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-84} x2={0} y2={i % 3 ? -74 : -66} stroke={INK} strokeWidth={i % 3 ? 4 : 7} transform={`rotate(${i * 30})`} />)}
    {/* 3:27 */}
    <line x1={0} y1={0} x2={0} y2={-48} stroke={INK} strokeWidth={10} strokeLinecap="round" transform={`rotate(${103.5 + spin * 360})`} />
    <line x1={0} y1={0} x2={0} y2={-72} stroke={COAT} strokeWidth={7} strokeLinecap="round" transform={`rotate(${162 + spin * 1440})`} />
    <circle r={9} fill={INK} />
  </g>
);
const PinMap: React.FC<{ x: number; y: number; k: number; pin: number }> = ({ x, y, k, pin }) => k <= 0.01 ? null : (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <rect x={-150} y={-110} width={300} height={220} rx={26} fill="#1a2233" stroke={INK} strokeWidth={8} />
    {[[-150, -40, 150, -50], [-150, 50, 150, 64], [-70, -110, -80, 110], [70, -110, 56, 110]].map(([a, b, c2, d], i) => <line key={i} x1={a} y1={b} x2={c2} y2={d} stroke="#2d3850" strokeWidth={16} />)}
    <g transform="translate(0 30)"><path d="M -30,0 L -30,-26 L 0,-48 L 30,-26 L 30,0 Z" fill="#3a4560" stroke="#8fa0c4" strokeWidth={4} strokeLinejoin="round" /><rect x={-8} y={-18} width={16} height={18} fill="#ffcf84" /></g>
    {pin > 0.01 && <g transform={`translate(0 ${lerp(-60, 2, eout(pin))}) scale(${clamp01(pin * 1.3)})`}><path d="M 0,0 C -30,-34 -30,-70 0,-70 C 30,-70 30,-34 0,0 Z" fill="#ff4b3e" stroke={INK} strokeWidth={5} /><circle cx={0} cy={-46} r={10} fill="#fff" /></g>}
  </g>
);
const FileReveal: React.FC<{ F: number; M: boolean }> = ({ F, M }) => {
  const lift = eio(ramp(F, 800, 832)), back = eio(ramp(F, 1004, 1026));
  const k = lift * (1 - back);
  const cx = lerp(1180, 1580, k), cy = lerp(650, 640, k), w = lerp(470, 820, k), h = (w * 9) / 16;
  const turn = M ? Math.sin(Math.PI * ramp(F, 800, 832)) * 0.35 : 0;      // the card swings a little as it lifts out
  const into = eio(ramp(F, 990, 1006));                                     // clock + pin slide back into the file
  const kc = pop(F, 878, 14) * (1 - into), kp = pop(F, 918, 14) * (1 - into);
  const clock: [number, number] = [lerp(2190, cx, into), lerp(400, cy, into)];
  const map: [number, number] = [lerp(2190, cx, into), lerp(930, cy, into)];
  return (
    <g>
      <PhoneShot f={F} tremble={M ? 1 : 0.3}><PhotoCrop kind="asleep" vb={CROP.asleep} night /><rect width={PW} height={PH} fill="#000" opacity={0.55 * k} /></PhoneShot>
      {k > 0.01 && (
        <g transform={`translate(${cx} ${cy}) scale(${1 - Math.abs(turn) * 0.4} 1) rotate(${-3 * k})`}>
          <rect x={-w / 2 - 24} y={-h / 2 - 24} width={w + 48} height={h + 48} rx={18} fill="url(#screenGlow)" opacity={0.9} style={{ mixBlendMode: "screen" }} />
          <svg x={-w / 2} y={-h / 2} width={w} height={h} viewBox="0 0 2560 1440"><g filter="url(#nightcam)"><PhotoScene kind="asleep" /></g></svg>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill="none" stroke="#dbe9ff" strokeWidth={6} opacity={0.9} />
        </g>
      )}
      {/* glowing threads tie what's inside the file to the photo */}
      {[[kc, clock], [kp, map]].map(([kk, pt], i) => (kk as number) > 0.01 && <line key={i} x1={cx + w * 0.3} y1={cy + (i ? h * 0.3 : -h * 0.3)} x2={(pt as number[])[0]} y2={(pt as number[])[1]} stroke="#bfe0ff" strokeWidth={5} strokeDasharray="14 12" strokeDashoffset={-F * 2} opacity={0.75 * (kk as number)} />)}
      <Clock x={clock[0]} y={clock[1]} k={1.15 * kc * lerp(1, 0.3, into)} spin={M ? 1 - eout(ramp(F, 878, 900)) : 0} />
      <PinMap x={map[0]} y={map[1]} k={1.1 * kp * lerp(1, 0.3, into)} pin={ramp(F, 926, 938)} />
    </g>
  );
};

// ---------- the ending, acted out: home (your lit window, someone inside) or the police (the dial pad) ----------
const HomeWindow: React.FC<{ f: number; M: boolean }> = ({ f, M }) => {
  const sx = M ? lerp(-160, 160, eio(ramp(f, C.A18b + 6, C.A18c - 4))) : 40;
  return (
    <g>
      <rect width={VW} height={VH} fill="#0b1120" />
      <rect x={560} y={0} width={1440} height={VH} fill="#141c2e" />
      {Array.from({ length: 18 }, (_, k) => { const c = k % 6, r = Math.floor(k / 6); const x = 640 + c * 220, y = 120 + r * 420; return (c === 3 && r === 1) ? null : <rect key={k} x={x} y={y} width={140} height={220} fill={rr(k, "hw") > 0.8 ? "#2a3550" : "#0f1626"} stroke={INK} strokeWidth={6} />; })}
      {/* your window: lit, a curtain, a silhouette moving behind it */}
      <g transform="translate(1300 540)">
        <rect x={0} y={0} width={140} height={220} fill="#ffcf84" stroke={INK} strokeWidth={6} />
        <rect x={0} y={0} width={140} height={220} fill="#ffe2b0" opacity={0.6} />
        <g clipPath="url(#winClip)"><circle cx={70 + sx * 0.4} cy={80} r={34} fill="#3a2a1a" opacity={0.85} /><rect x={36 + sx * 0.4} y={110} width={68} height={120} rx={20} fill="#3a2a1a" opacity={0.85} /></g>
        <path d="M 0,0 Q 30,110 10,220 L 0,220 Z M 140,0 Q 110,110 130,220 L 140,220 Z" fill="#e8b878" opacity={0.8} />
        <circle cx={70} cy={110} r={260} fill="url(#pool)" opacity={0.7} style={{ mixBlendMode: "screen" }} />
      </g>
      <Rain f={f} n={260} seed="hw" speed={30} len={70} w={2.5} op={0.3} />
      <Rain f={f} n={70} seed="hw2" speed={46} len={120} w={3.5} op={0.3} />
    </g>
  );
};
const DialScreen: React.FC<{ glow: number }> = ({ glow }) => (
  <g>
    <rect width={PW} height={PH} fill="#0b0d12" />
    {Array.from({ length: 12 }, (_, k) => { const c = k % 3, r = Math.floor(k / 3); return <circle key={k} cx={110 + c * 150} cy={360 + r * 140} r={56} fill="#262b36" />; })}
    <circle cx={PW / 2} cy={930} r={66 + 8 * glow} fill="#3ccf6b" opacity={0.6 + 0.4 * glow} />
    <path d={`M ${PW / 2 - 26},${922} q 6,-22 18,-18 l 8,14 q -8,8 4,20 q 12,12 20,4 l 14,8 q 4,12 -18,18 q -30,4 -46,-46 z`} fill="#fbfbf8" />
  </g>
);

// ---------- camera: handheld drift + damped impact shakes (both cuts; the picture cut leans on it more) ----------
const KICKS: [number, number][] = [[150, 3], [184, 3], [395, 3], [C.A14b, 26], [1243, 18], [C.A15, 4]];
const camera = (f: number, M: boolean) => {
  const A = M ? 5 : 8;
  let dx = A * (Math.sin(f * 0.071) + 0.6 * Math.sin(f * 0.153 + 1.3) + 0.3 * Math.sin(f * 0.31 + 2));
  let dy = A * 0.8 * (Math.sin(f * 0.063 + 0.7) + 0.6 * Math.sin(f * 0.141 + 2.1) + 0.3 * Math.sin(f * 0.27));
  const rot = (M ? 0.15 : 0.25) * Math.sin(f * 0.05 + 0.4);
  for (const [at, amp] of KICKS) {
    const t = f - at;
    if (t >= 0 && t < 30) { const e = amp * Math.exp(-t / 6); dx += e * Math.cos((2 * Math.PI * t) / 5); dy += e * 0.7 * Math.sin((2 * Math.PI * t) / 5 + 0.6); }
  }
  return { dx, dy, rot };
};

// ---------- the shots ----------
const makeShots = (M: boolean): ShotDef[] => [
  // A1 · wide street at 2 a.m., rain. You walk home.
  { from: 0, to: C.A2, z0: 1.0, z1: 1.06, fx: 1200, fy: 900, render: (f) => {
    const x = M ? lerp(260, 1180, f / C.A2) : 980;
    const pan = M ? lerp(0, 380, eio(f / C.A2)) : 0;
    return <Street f={f} pan={pan}><YouFig x={x} y={GROUND} s={1.5} walk={M ? f * 0.3 : 1.3} look={[10, 2]} blink={blinkAt(f, 1)} />{M && <Splashes f={f} n={4} seed="feet" x0={x - 60} x1={x + 60} y0={GROUND - 6} y1={GROUND + 6} op={0.8} s={1.4} />}</Street>;
  } },
  // A2 · the bench: a phone is buzzing
  { from: C.A2, to: C.A3, z0: 2.5, z1: 2.68, fx: BENCH_PHONE[0], fy: 1020, render: (f) => {
    const F = f + C.A2;
    const buzz = (F >= 148 && F < 168) || (F >= 182 && F < 202);
    const lit = Math.max(eio(ramp(F, 144, 150)) * (1 - ramp(F, 205, 212)), 0);
    return <Street f={F} benchGlow={lit * (1.1 + 0.4 * Math.sin(F * 0.8))}><BenchPhone lit={lit} jitter={buzz ? (M ? 4 : 1.5) * Math.sin(F * 3.1) + 0.02 : 0} /></Street>;
  } },
  // A3 · nobody's around: you look up and down the street
  { from: C.A3, to: C.A4, z0: 1.3, z1: 1.36, fx: 1700, fy: 900, render: (f) => {
    const F = f + C.A3;
    const lx = M ? keys(F, [[C.A3, -18], [228, -18], [242, 18]]) : F < 235 ? -18 : 18;
    return <Street f={F} benchGlow={0.6}><BenchPhone lit={0.8} /><YouFig x={1580} y={GROUND} s={1.5} look={[lx, 0]} mood="worried" facing={lx < 0 ? -1 : 1} blink={blinkAt(F, 4)} /></Street>;
  } },
  // A4 · you pick it up
  { from: C.A4, to: C.A5, z0: 2.0, z1: 2.08, fx: 1760, fy: 980, render: (f) => {
    const F = f + C.A4;
    const armR = M ? keys(F, [[C.A4, 10], [264, 62], [272, 62], [284, 110]]) : F < 270 ? 62 : 110;
    const elbowR = M ? keys(F, [[C.A4, 0], [272, 0], [284, -60]]) : F < 270 ? 0 : -60;
    const held = F >= 270;
    return <Street f={F} benchGlow={held ? 0 : 0.6}>{!held && <BenchPhone lit={0.8} />}<YouFig x={1660} y={GROUND} s={1.5} look={held ? [8, 10] : [12, 14]} mood="worried" armR={armR} elbowR={elbowR} headTilt={held ? 6 : 10} holdR={held ? <rect x={-12} y={-34} width={24} height={46} rx={5} fill="#0b0d12" stroke={INK} strokeWidth={3} /> : undefined} /></Street>;
  } },
  // A5 · phone insert: it's unlocked… the wallpaper is a photo of you
  { from: C.A5, to: C.A6, z0: 1.0, z1: 1.16, fx: 1180, fy: 560, render: (f) => {
    const F = f + C.A5;
    const on = eio(ramp(F, 287, 293));
    return <PhoneShot f={F} lift={M ? lerp(260, 0, eout(ramp(F, C.A5, C.A5 + 14))) : 0} tremble={M ? 1 : 0.3}><HomeScreen k={on} /></PhoneShot>;
  } },
  // A6 · the picture: taken tonight
  { from: C.A6, to: C.A7, z0: 1.04, z1: 1.14, fx: 1150, fy: 800, render: (f) => <g transform={M ? `translate(${lerp(40, -40, f / (C.A7 - C.A6))} 0)` : undefined}><Photo kind="bus" label="Today · 1:48 AM" /></g> },
  // A7 · from across the street: a dark parked car
  { from: C.A7, to: C.A8, z0: 1.0, z1: 1.12, fx: 700, fy: 820, render: (f) => {
    const F = f + C.A7;
    return <Street f={F}><YouFig x={2050} y={GROUND} s={1.5} facing={-1} look={[12, -8]} mood="worried" armR={40} elbowR={-40} blink={blinkAt(F, 2)} headTilt={M ? lerp(0, -6, ramp(F, C.A7, C.A7 + 16)) : -4} /></Street>;
  } },
  // A8 · the gallery: 41 photos
  { from: C.A8, to: C.A9, z0: 1.0, z1: 1.08, fx: 1180, fy: 600, render: (f) => {
    const F = f + C.A8;
    const scroll = M ? 520 * eio(ramp(F, 520, 600)) : 0;
    return <PhoneShot f={F} tremble={M ? 1 : 0.3}><GalleryScreen scroll={scroll} /></PhoneShot>;
  } },
  // A9–A11 · you at the café · your front door · asleep
  { from: C.A9, to: C.A10, z0: 1.02, z1: 1.1, fx: 1200, fy: 800, render: (f) => <g transform={M ? `translate(${lerp(260, 0, eout(ramp(f, 0, 10)))} 0)` : undefined}><Photo kind="cafe" label="Mon · 1:12 PM" /></g> },
  { from: C.A10, to: C.A11, z0: 1.02, z1: 1.1, fx: 1300, fy: 800, render: (f) => <g transform={M ? `translate(${lerp(260, 0, eout(ramp(f, 0, 10)))} 0)` : undefined}><Photo kind="door" label="Tue · 11:40 PM" /></g> },
  { from: C.A11, to: C.A12, z0: 1.04, z1: 1.14, fx: 700, fy: 820, render: (f) => <g transform={M ? `translate(${lerp(260, 0, eout(ramp(f, 0, 10)))} 0)` : undefined}><Photo kind="asleep" label="Wed · 3:27 AM" night /></g> },
  // A12 · fact card: the file stores the exact time and GPS location
  { from: C.A12, to: C.A13, z0: 1.0, z1: 1.05, fx: 1600, fy: 660, render: (f) => <FileReveal F={f + C.A12} M={M} /> },
  // A13 · the last photo: twelve minutes ago
  { from: C.A13, to: C.A14, z0: 1.0, z1: 1.1, fx: 1180, fy: 640, render: (f) => {
    const F = f + C.A13;
    return <PhoneShot f={F} tremble={M ? 1.4 : 0.4}><g transform={M ? `translate(0 ${lerp(300, 0, eout(ramp(F, C.A13, C.A13 + 14)))})` : undefined}><InfoScreen chip={ramp(F, 1082, 1096)} map={eio(ramp(F, 1110, 1124))} pin={0} /></g></PhoneShot>;
  } },
  // A14 · location… (the pin drops on HOME)
  { from: C.A14, to: C.A14b, z0: 1.5, z1: 1.62, fx: 1180, fy: 1000, render: (f) => {
    const F = f + C.A14;
    return <PhoneShot f={F} tremble={M ? 1.6 : 0.5}><InfoScreen chip={1} map={1} pin={M ? eout(ramp(F, 1134, 1146)) : pop(F, 1138, 8)} /></PhoneShot>;
  } },
  // A14b · your bedroom (the last photo, full frame)
  { from: C.A14b, to: C.A15, z0: 1.0, z1: 1.14, fx: 1100, fy: 820, render: () => <Photo kind="bedroom" label="Today · 1:51 AM · Home" night /> },
  // A15 · close-up: your face in the phone light
  { from: C.A15, to: C.A16, z0: 1.0, z1: 1.05, fx: 1700, fy: 600, render: (f) => {
    const F = f + C.A15;
    return (
      <g>
        <g transform="translate(1500 760) scale(2) translate(-1500 -760)" filter="url(#dof)"><Street f={F} /></g>
        <rect width={VW} height={VH} fill="#05070c" opacity={0.35} />
        <YouFig x={1700} y={1740} s={3.4} mood="surprised" look={[0, 6]} sweat={1} blink={1} headTilt={M ? lerp(0, -5, ramp(F, C.A15, C.A15 + 10)) : 0} bob={M ? -8 * eout(ramp(F, C.A15, C.A15 + 6)) : 0} />
        <ellipse cx={1700} cy={620} rx={360} ry={300} fill="url(#screenGlow)" opacity={0.6} style={{ mixBlendMode: "screen" }} />
        <Rain f={F} n={80} seed="cu" speed={44} len={120} w={3.5} op={0.3} />
      </g>
    );
  } },
  // A16 · behind you, a car door shuts; the headlights come on
  { from: C.A16, to: C.A17, z0: 1.0, z1: 1.08, fx: 900, fy: 820, render: (f) => {
    const F = f + C.A16;
    const dome = ramp(F, 1222, 1226) * (1 - ramp(F, 1243, 1247));
    const lights = F >= 1262 ? (M ? eio(ramp(F, 1262, 1266)) : 1) : 0;
    const turned = F >= 1244;
    return <Street f={F} car={{ dome, lights, dx: M ? 140 * eio(ramp(F, 1268, 1285)) : 0 }}><YouFig x={2050} y={GROUND} s={1.5} facing={turned ? -1 : 1} look={turned ? [14, -6] : [10, 12]} mood={turned ? "surprised" : "worried"} armR={turned ? 50 : 70} elbowR={-50} headTilt={turned && M ? -6 : 0} holdR={<rect x={-12} y={-34} width={24} height={46} rx={5} fill="#0b0d12" stroke={INK} strokeWidth={3} />} /></Street>;
  } },
  // A17 · the phone buzzes: one new message
  { from: C.A17, to: C.A18, z0: 1.05, z1: 1.3, fx: 1180, fy: 300, render: (f) => {
    const F = f + C.A17;
    const buzz = F >= 1287 && F < 1307 ? Math.sin(F * 3.1) * (M ? 5 : 2) : 0;
    return <g transform={`translate(${buzz} 0)`}><PhoneShot f={F} tremble={M ? 1.8 : 0.5}><MessageScreen banner={M ? ramp(F, 1331, 1342) : pop(F, 1333, 8)} t1={ramp(F, 1361, 1372)} t2={ramp(F, 1411, 1426)} /></PhoneShot></g>;
  } },
  // A18 · so what do you do? (close on you, eyes going left: home)
  { from: C.A18, to: C.A18b, z0: 1.0, z1: 1.05, fx: 1700, fy: 600, render: (f) => {
    const F = f + C.A18;
    return (
      <g>
        <g transform="translate(1500 760) scale(2) translate(-1500 -760)" filter="url(#dof)"><Street f={F} car={{ lights: 1, dx: 140 }} /></g>
        <rect width={VW} height={VH} fill="#05070c" opacity={0.35} />
        <YouFig x={1700} y={1740} s={3.4} mood="worried" look={M ? [lerp(0, -18, eio(ramp(F, C.A18 + 4, C.A18 + 14))), -4] : [-18, -4]} sweat={0.8} blink={blinkAt(F, 9)} />
        <ellipse cx={1700} cy={620} rx={360} ry={300} fill="url(#screenGlow)" opacity={0.5} style={{ mixBlendMode: "screen" }} />
        <Rain f={F} n={80} seed="cu2" speed={44} len={120} w={3.5} op={0.3} />
      </g>
    );
  } },
  // A18b · go home? your window down the street is lit, and someone is moving behind the curtain
  { from: C.A18b, to: C.A18c, z0: 1.0, z1: 1.12, fx: 1370, fy: 650, render: (f) => <HomeWindow f={f + C.A18b} M={M} /> },
  // A18c · or call the police? the dial pad, your thumb over the call button
  { from: C.A18c, to: C.A18d, z0: 1.0, z1: 1.1, fx: 1180, fy: 820, render: (f) => {
    const F = f + C.A18c;
    return <PhoneShot f={F} tremble={M ? 1.8 : 0.5}><DialScreen glow={0.5 + 0.5 * Math.sin(F * 0.25)} /></PhoneShot>;
  } },
  // A18d · headlights on you; you look one way, then the other. Comment HOME or POLICE
  { from: C.A18d, to: FILM_FRAMES, z0: 1.0, z1: 1.08, fx: 1800, fy: 640, render: (f) => {
    const F = f + C.A18;
    const sweep = M ? lerp(-400, 2200, eio(ramp(F, C.A18d, 1660))) : 900;
    return (
      <g>
        <g transform="translate(1500 760) scale(1.8) translate(-1500 -760)" filter="url(#dof)"><Street f={F} car={{ lights: 1, dx: 140 }} /></g>
        <rect width={VW} height={VH} fill="#05070c" opacity={0.3} />
        <ellipse cx={sweep} cy={560} rx={900} ry={700} fill="url(#glare2)" opacity={M ? 0.55 : 0.4} style={{ mixBlendMode: "screen" }} />
        <YouFig x={1820} y={1690} s={3.2} facing={-1} mood="worried" look={M ? [16 * Math.cos(ramp(F, 1570, 1640) * Math.PI), 0] : F < 1600 ? [16, 0] : [-16, 0]} blink={blinkAt(F, 6)} sweat={0.7} armR={60} elbowR={-70} holdR={<rect x={-14} y={-38} width={28} height={52} rx={6} fill="#0b0d12" stroke={INK} strokeWidth={3} />} headTilt={M ? 3 * Math.sin(F * 0.05) : 0} />
        <Rain f={F} n={90} seed="end" speed={44} len={120} w={3.5} op={0.32} />
      </g>
    );
  } },
];

const SHOTS_PICTURE = makeShots(false);
const SHOTS_MOTION = makeShots(true);

export const LostPhoneFilm: React.FC<{ motion?: boolean }> = ({ motion = false }) => {
  const f = useCurrentFrame();
  const M = motion;
  const cam = camera(f, M);
  const fade = Math.max(1 - ramp(f, 0, 10), ramp(f, FILM_FRAMES - 18, FILM_FRAMES - 1));
  return (
    <AbsoluteFill style={{ backgroundColor: NIGHT }}>
      <Soundtrack total={FILM_FRAMES} voice={staticFile("projects/stick-lostphone/narration.wav")} voiceEnd={VOICE_END} music="music_thriller" musicLen={FILM_FRAMES} amb="amb_rain" ambVol={0.55} sfx={M ? [...SFX, ...SFX_MOTION] : SFX} />
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <filter id="dof"><feGaussianBlur stdDeviation="9" /></filter>
          <filter id="streak"><feGaussianBlur stdDeviation="10 34" /></filter>
          <filter id="photo"><feColorMatrix type="matrix" values="0.85 0.12 0.03 0 0.02  0.06 0.88 0.06 0 0.02  0.04 0.12 0.78 0 0.01  0 0 0 1 0" /><feGaussianBlur stdDeviation="1" /></filter>
          <filter id="nightcam"><feColorMatrix type="matrix" values="0.62 0.28 0.1 0 0.05  0.32 0.62 0.1 0 0.06  0.3 0.38 0.52 0 0.08  0 0 0 1 0" /><feGaussianBlur stdDeviation="1.2" /></filter>
          <clipPath id="screenClip"><rect width={PW} height={PH} rx={52} /></clipPath>
          <clipPath id="winClip"><rect x={0} y={0} width={140} height={220} /></clipPath>
          <clipPath id="glassClip"><rect x={1580} y={510} width={700} height={640} /></clipPath>
          <clipPath id="coneClip"><path d={`M ${LAMP_X - 44},${LAMP_Y + 12} L ${LAMP_X + 44},${LAMP_Y + 12} L ${LAMP_X + 420},${GROUND} L ${LAMP_X - 420},${GROUND} Z`} /></clipPath>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#070b15" /><stop offset="1" stopColor="#1a2440" /></linearGradient>
          <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a3554" stopOpacity="0" /><stop offset="0.6" stopColor="#2a3554" stopOpacity="0.35" /><stop offset="1" stopColor="#2a3554" stopOpacity="0" /></linearGradient>
          <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={LAMP} stopOpacity="0.55" /><stop offset="1" stopColor={LAMP} stopOpacity="0.06" /></linearGradient>
          <linearGradient id="refl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={LAMP} stopOpacity="0.7" /><stop offset="1" stopColor={LAMP} stopOpacity="0" /></linearGradient>
          <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff4d6" stopOpacity="0.55" /><stop offset="1" stopColor="#fff4d6" stopOpacity="0" /></linearGradient>
          <linearGradient id="beamRefl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff4d6" stopOpacity="0.5" /><stop offset="1" stopColor="#fff4d6" stopOpacity="0" /></linearGradient>
          <linearGradient id="adbox" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e8f1fb" /><stop offset="1" stopColor="#b9cde6" /></linearGradient>
          <linearGradient id="topBar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity="0.6" /><stop offset="1" stopColor="#000" stopOpacity="0" /></linearGradient>
          <linearGradient id="homeShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity="0.45" /><stop offset="0.35" stopColor="#000" stopOpacity="0" /><stop offset="0.8" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.4" /></linearGradient>
          <radialGradient id="pool"><stop offset="0" stopColor={LAMP} stopOpacity="0.45" /><stop offset="1" stopColor={LAMP} stopOpacity="0" /></radialGradient>
          <radialGradient id="pool2"><stop offset="0" stopColor={COLD} stopOpacity="0.4" /><stop offset="1" stopColor={COLD} stopOpacity="0" /></radialGradient>
          <radialGradient id="bulb"><stop offset="0" stopColor="#fff4d0" stopOpacity="0.95" /><stop offset="1" stopColor={LAMP} stopOpacity="0" /></radialGradient>
          <radialGradient id="glare"><stop offset="0" stopColor="#ffffff" stopOpacity="1" /><stop offset="1" stopColor="#fff4d6" stopOpacity="0" /></radialGradient>
          <radialGradient id="glare2"><stop offset="0" stopColor="#fff4d6" stopOpacity="0.8" /><stop offset="1" stopColor="#fff4d6" stopOpacity="0" /></radialGradient>
          <radialGradient id="screenGlow"><stop offset="0" stopColor="#bfe0ff" stopOpacity="0.5" /><stop offset="1" stopColor="#bfe0ff" stopOpacity="0" /></radialGradient>
          <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.5" stopColor="#03050a" stopOpacity="0" /><stop offset="1" stopColor="#03050a" stopOpacity="0.7" /></radialGradient>
          <radialGradient id="vigPhoto" cx="0.5" cy="0.5" r="0.8"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.45" /></radialGradient>
        </defs>
      </svg>
      <AbsoluteFill style={{ transform: `translate(${cam.dx}px, ${cam.dy}px) rotate(${cam.rot}deg) scale(1.035)` }}>
        <Shots f={f} shots={M ? SHOTS_MOTION : SHOTS_PICTURE} />
        <svg width={VW} height={VH} style={{ position: "absolute", inset: 0 }}><rect width={VW} height={VH} fill="url(#vig)" /></svg>
      </AbsoluteFill>
      {/* a camera flash as each photo appears (it tells you it's a picture, without a label) */}
      {[C.A6, C.A9, C.A10, C.A11, C.A14b].map((at) => f >= at && f < at + 6 && <AbsoluteFill key={at} style={{ backgroundColor: "#ffffff", opacity: 0.55 * (1 - (f - at) / 6) }} />)}
      {/* a 2-frame dip to black on the braam (the reference's impact grammar) */}
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: f >= C.A14b - 2 && f < C.A14b ? 1 : f >= C.A14b && f < C.A14b + 3 ? 1 - (f - C.A14b) / 3 : 0 }} />
      <Captions f={f} words={WORDS} chunks={CHUNKS} />
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: fade }} />
    </AbsoluteFill>
  );
};
