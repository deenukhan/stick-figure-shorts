import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { loadVariableFont } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { Captions, CAPTION_FONT, eio, eout, Figure, Glint, Grain, INK, keys, lerp, pop, ramp, ShotDef, Shots, Sfx, Soundtrack, VH, VW, blinkAt, clamp01 } from "./kit";
import { CHUNKS, VOICE_END, WORDS } from "./words";

// "The Wallet": a 30 s stick-figure story short (9:16), every frame drawn in code. Sample film for the stick-figure-shorts skill.
// Narration: ElevenLabs eleven_v4, voice Tyler (xS4rWdm7XjmSzwmzOl3j), take A, muxed at +15 frames. Cue table: projects/stick-wallet-story/BRIEF.md
// Key frames: "wallet" f38 · "Inside" f98 · "hundred" f132 · "key" f187 · "Nobody" f215 · "cash" f278 · "keep" f301 ·
// "tested" f356 · "17,000" f418 · "40" f487 · "money" f546 · "More" f580 · "back" f620 · "honest" f680 · "would" f758 · voice ends f782.
// Fact (true): Cohn et al., Science 2019, 17,303 "lost" wallets in 355 cities, 40 countries; owners were contacted for ~40% of wallets
// with no cash and ~51% with cash, and the money effect held in 38 of 40 countries.

const { fontFamily: SERIF } = loadVariableFont("normal", { subsets: ["latin"] });
const { fontFamily: MONO } = loadMono("normal", { weights: ["500"], subsets: ["latin"] });
export const FILM_FRAMES = 900;

// sound design: every effect lands on its picture beat (frames are composition frames)
const SFX: Sfx[] = [
  [2, "sfx_footsteps", 0.5], [36, "sfx_sparkle", 0.35], [96, "sfx_whoosh", 0.3], [100, "sfx_card_slide", 0.35],
  [128, "sfx_card_slide", 0.4], [140, "sfx_pop", 0.35], [185, "sfx_sparkle", 0.4], [210, "sfx_whoosh", 0.25],
  [232, "sfx_gulp", 0.5], [270, "sfx_pop", 0.35], [298, "sfx_card_slide", 0.3], [326, "sfx_whoosh", 0.3],
  [352, "sfx_pop", 0.35], [384, "sfx_whoosh", 0.25], [412, "sfx_counter", 0.45], [486, "sfx_pop", 0.35],
  [522, "sfx_whoosh", 0.25], [528, "sfx_card_slide", 0.3], [604, "sfx_ding", 0.3], [634, "sfx_door_creak", 0.35],
  [686, "sfx_heart_chime", 0.45], [726, "sfx_whoosh", 0.25], [784, "sfx_reveal_hit", 0.45],
];

// palette: night navy, ONE warm light, the hero's mustard coat; fact cards on warm paper
const NAVY = "#1b2236", BRICK = "#242c44", WARM = "#ffcf73", COAT = "#e8b23a";
const PAPER = "#F6F1EA", PINK_OFF = "#2A1E17";
const GROUND = 1500;

// ---------- sets ----------
const Street: React.FC<{ f: number; blur?: number; lamp?: number }> = ({ f, blur = 0, lamp = 1 }) => {
  const flick = 0.94 + 0.06 * Math.sin(f * 0.9) * Math.sin(f * 0.23);
  return (
    <g filter={blur ? "url(#dof)" : undefined}>
      <rect width={VW} height={VH} fill={NAVY} />
      {Array.from({ length: 30 }, (_, r) => <path key={r} d={`M 0,${r * 48} L ${VW},${r * 48}`} stroke={BRICK} strokeWidth={4} />)}
      {Array.from({ length: 30 }, (_, r) => Array.from({ length: 9 }, (_, c) => <line key={`${r}-${c}`} x1={c * 130 + (r % 2) * 65} y1={r * 48} x2={c * 130 + (r % 2) * 65} y2={r * 48 + 48} stroke={BRICK} strokeWidth={4} />))}
      {/* closed shop: shutter + dead sign */}
      <rect x={90} y={760} width={430} height={640} rx={6} fill="#2c3550" stroke={INK} strokeWidth={6} />
      {Array.from({ length: 15 }, (_, k) => <line key={k} x1={96} y1={800 + k * 40} x2={514} y2={800 + k * 40} stroke="#232b43" strokeWidth={5} />)}
      <rect x={70} y={690} width={470} height={70} rx={8} fill="#222a40" stroke={INK} strokeWidth={6} />
      <rect x={210} y={1180} width={190} height={70} rx={10} fill="#3a4462" stroke={INK} strokeWidth={4} />
      <text x={305} y={1226} textAnchor="middle" fontFamily={MONO} fontSize={30} fill="#8d97b5">CLOSED</text>
      {/* sidewalk, curb, road */}
      <rect y={1400} width={VW} height={170} fill="#40475f" />
      {Array.from({ length: 6 }, (_, k) => <line key={k} x1={k * 220 + 40} y1={1400} x2={k * 220 + 10} y2={1570} stroke="#363c52" strokeWidth={4} />)}
      <rect y={1566} width={VW} height={26} fill="#5a6180" stroke={INK} strokeWidth={4} />
      <rect y={1592} width={VW} height={VH - 1592} fill="#161b2b" />
      {Array.from({ length: 5 }, (_, k) => <rect key={k} x={k * 260 - 40} y={1760} width={150} height={16} rx={8} fill="#2a3045" />)}
      {/* the one light: a street lamp, cone + reflection on the wet road */}
      <rect x={884} y={360} width={22} height={1210} fill="#2e3550" stroke={INK} strokeWidth={5} />
      <path d="M 895,370 Q 895,320 840,322 L 760,322" stroke="#2e3550" strokeWidth={18} fill="none" strokeLinecap="round" />
      <path d="M 700,322 L 820,322 L 800,350 L 720,350 Z" fill="#39415f" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <g opacity={lamp * flick} style={{ mixBlendMode: "screen" }}>
        <path d="M 722,350 L 798,350 L 1080,1510 L 380,1510 Z" fill="url(#cone)" />
        <ellipse cx={720} cy={1490} rx={360} ry={70} fill="url(#pool)" />
        <rect x={700} y={1600} width={60} height={320} fill="url(#streak)" />
        <circle cx={760} cy={352} r={70} fill="url(#bulb)" />
      </g>
      <rect x={724} y={346} width={72} height={8} rx={4} fill="#fff6dc" opacity={lamp} />
    </g>
  );
};

const Doorway: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect width={VW} height={VH} fill="#22313d" />
    {Array.from({ length: 34 }, (_, r) => <path key={r} d={`M 0,${r * 44 + 20} L ${VW},${r * 44 + 20}`} stroke="#283a48" strokeWidth={8} />)}
    {/* the open door: warm inside */}
    <rect x={600} y={700} width={340} height={800} fill="#2b2a2f" stroke={INK} strokeWidth={8} />
    <rect x={616} y={716} width={308} height={784} fill="#ffcf7a" />
    <rect x={616} y={716} width={308} height={784} fill="url(#inside)" />
    <path d="M 924,716 L 990,690 L 990,1530 L 924,1500 Z" fill="#7a4b33" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <circle cx={972} cy={1120} r={9} fill={WARM} stroke={INK} strokeWidth={3} />
    <rect x={566} y={660} width={408} height={44} rx={6} fill="#384c5a" stroke={INK} strokeWidth={6} />
    <rect x={700} y={600} width={120} height={50} rx={8} fill="#f2e6cf" stroke={INK} strokeWidth={4} />
    <text x={760} y={638} textAnchor="middle" fontFamily={MONO} fontSize={34} fill={INK}>12</text>
    <rect y={1500} width={VW} height={VH - 1500} fill="#3b4652" />
    <path d={`M 616,1500 L 924,1500 L 1080,1760 L 380,1760 Z`} fill="#ffd894" opacity={0.28} style={{ mixBlendMode: "screen" }} />
    <rect x={560} y={1500} width={420} height={34} rx={8} fill="#5b4a3c" stroke={INK} strokeWidth={5} />
    {/* plant */}
    <path d="M 120,1500 L 140,1380 L 260,1380 L 280,1500 Z" fill="#b8704a" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {[-40, 0, 40].map((a, k) => <ellipse key={k} cx={200 + a * 1.4} cy={1300 - Math.abs(a) * 0.4} rx={30} ry={80} transform={`rotate(${a + Math.sin(f * 0.05 + k) * 3} ${200} 1380)`} fill="#4f8a5b" stroke={INK} strokeWidth={5} />)}
  </g>
);

// ---------- props ----------
const Bill: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`}>
    <rect x={-170} y={-78} width={340} height={156} rx={10} fill="#a9cf8f" stroke={INK} strokeWidth={6} />
    <rect x={-150} y={-60} width={300} height={120} rx={6} fill="none" stroke="#6f9a5d" strokeWidth={4} />
    <circle cx={0} cy={0} r={40} fill="#c4e0ae" stroke="#6f9a5d" strokeWidth={4} />
    <text x={-118} y={-22} fontFamily={CAPTION_FONT} fontWeight={800} fontSize={34} fill="#4d7340">100</text>
    <text x={118} y={48} textAnchor="end" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={34} fill="#4d7340">100</text>
    <text x={0} y={14} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={40} fill="#4d7340">$</text>
  </g>
);
const Key: React.FC<{ x: number; y: number; r?: number; s?: number }> = ({ x, y, r = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M 40,-12 L 190,-12 L 190,12 L 170,12 L 170,34 L 150,34 L 150,12 L 130,12 L 130,28 L 112,28 L 112,12 L 40,12 Z" fill="#e2ad46" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <circle cx={0} cy={0} r={52} fill="#e2ad46" stroke={INK} strokeWidth={6} />
    <circle cx={-6} cy={0} r={18} fill="#2b2b33" stroke={INK} strokeWidth={5} />
  </g>
);
// a small closed wallet (side view, for hands and the ground)
const MiniWallet: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <rect x={-46} y={-30} width={92} height={60} rx={10} fill="#8a5a3c" stroke={INK} strokeWidth={5} />
    <rect x={-38} y={-22} width={76} height={44} rx={7} fill="none" stroke="#c99a6e" strokeWidth={2.5} strokeDasharray="7 6" />
    <rect x={22} y={-12} width={30} height={22} rx={5} fill="#6f4730" stroke={INK} strokeWidth={4} />
  </g>
);

// "found" chip: our own stakes tag, small, top left
const FoundTag: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  const k = pop(f, at, 12);
  if (k <= 0.01) return null;
  return (
    <g transform={`translate(70 150) scale(${k})`} opacity={clamp01(k)}>
      <rect x={0} y={-44} width={560} height={76} rx={38} fill="#fbfbf8" stroke={INK} strokeWidth={5} />
      <text x={34} y={6} fontFamily={MONO} fontSize={32} fill={INK} letterSpacing={1}>FOUND · $100 + 1 KEY</text>
    </g>
  );
};

// ---------- fact cards ----------
const Card: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <g>
    <rect width={VW} height={VH} fill={PAPER} />
    <Grain id="g1" />
    <text x={VW / 2} y={300} textAnchor="middle" fontFamily={MONO} fontSize={32} letterSpacing={6} fill="#7a6a5e">{label}</text>
    {children}
  </g>
);
const serif = { fontFamily: SERIF, fontWeight: 800, fontVariationSettings: "'SOFT' 100, 'opsz' 144" } as const;

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

// ---------- the shots ----------
const SHOTS: ShotDef[] = [
  // A · wide street: you walk in, the wallet glints
  { from: 0, to: 98, z0: 1.0, z1: 1.12, fx: 520, fy: 1300, render: (f) => {
    const x = keys(f, [[0, -160], [46, 330], [98, 334]]);
    const walking = f < 44;
    return (
      <g>
        <Street f={f} />
        <g transform="translate(610 1462)"><MiniWallet s={1.5} /></g>
        <Glint x={660} y={1434} t={ramp(f, 34, 60)} r={56} />
        <Figure x={x} y={GROUND + 10} s={1.5} coat={COAT} walk={walking ? f * 0.3 : 0} mood={f > 50 ? "surprised" : "neutral"} look={f > 46 ? [10, 10] : [6, 0]} blink={blinkAt(f, 1)} />
      </g>
    );
  } },
  // B · insert: the wallet opens. $100 … and a key
  { from: 98, to: 212, z0: 1.0, z1: 1.08, fx: 540, fy: 900, render: (f, p) => {
    const F = f + 98;
    const open = eout(ramp(F, 100, 120));
    const bill = eout(ramp(F, 129, 150));
    const key = eout(ramp(F, 179, 194));
    return (
      <g>
        <rect width={VW} height={VH} fill="#3b4158" />
        {Array.from({ length: 9 }, (_, k) => <line key={k} x1={k * 140 - 60} y1={0} x2={k * 140 + 120} y2={VH} stroke="#343a50" strokeWidth={6} />)}
        <ellipse cx={540} cy={1000} rx={600} ry={520} fill="url(#pool2)" style={{ mixBlendMode: "screen" }} />
        {/* open wallet, top-down */}
        <g transform="translate(540 1010)">
          <rect x={-380} y={-230} width={760} height={460} rx={34} fill="#6f4730" stroke={INK} strokeWidth={8} />
          <g transform={`scale(${lerp(0.5, 1, open)} 1)`}>
            <rect x={-360} y={-210} width={720} height={420} rx={26} fill="#8a5a3c" stroke={INK} strokeWidth={7} />
            <line x1={0} y1={-210} x2={0} y2={210} stroke="#5d3b28" strokeWidth={6} />
            <rect x={-330} y={-180} width={300} height={360} rx={18} fill="none" stroke="#c99a6e" strokeWidth={4} strokeDasharray="12 10" />
            <rect x={30} y={-180} width={300} height={360} rx={18} fill="none" stroke="#c99a6e" strokeWidth={4} strokeDasharray="12 10" />
            {[-60, 20, 100].map((y, k) => <path key={k} d={`M 50,${y} Q 180,${y + 26} 310,${y}`} stroke="#5d3b28" strokeWidth={6} fill="none" />)}
            <rect x={70} y={-150} width={220} height={70} rx={10} fill="#d8d2c4" stroke={INK} strokeWidth={5} />
            <rect x={90} y={-132} width={60} height={34} rx={5} fill="#e2ad46" stroke={INK} strokeWidth={3} />
          </g>
          {bill > 0.01 && <Bill x={lerp(-40, -150, bill)} y={lerp(40, -310, bill)} r={lerp(0, -8, bill)} />}
          {key > 0.01 && <Key x={lerp(80, 170, key)} y={lerp(40, -330, key)} r={lerp(0, -24, key)} s={1.1} />}
          <Glint x={lerp(80, 170, key)} y={lerp(40, -330, key)} t={ramp(F, 187, 205)} r={60} />
        </g>
        {/* mittens holding the wallet */}
        {[-1, 1].map((sd) => <g key={sd}><path d={`M ${540 + sd * 700},1980 L ${540 + sd * 395},1120`} stroke={INK} strokeWidth={22} strokeLinecap="round" /><circle cx={540 + sd * 385} cy={1110} r={46} fill="#fbfbf8" stroke={INK} strokeWidth={9} /></g>)}
        <g opacity={eio(ramp(F, 140, 152))}>
          <rect x={300} y={360} width={480} height={110} rx={55} fill="#fbfbf8" stroke={INK} strokeWidth={6} />
          <text x={540} y={436} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={64} fill={INK}>$100</text>
        </g>
        <g data-p={p} />
      </g>
    );
  } },
  // C · medium: you check the street. Nobody saw you
  { from: 212, to: 254, z0: 1.0, z1: 1.05, fx: 540, fy: 800, render: (f) => {
    const F = f + 212;
    const lx = keys(F, [[212, 0], [217, -16], [226, -16], [231, 16], [242, 16], [248, 0]]);
    return (
      <g>
        <g transform="translate(540 960) scale(1.5) translate(-540 -960)"><Street f={F} blur={9} /></g>
        <Figure x={540} y={1680} s={2.6} coat={COAT} mood="worried" look={[lx, 0]} sweat={eio(ramp(F, 230, 240))} blink={blinkAt(F, 2)} armR={34} elbowR={60} holdR={<MiniWallet s={1} />} />
        <FoundTag f={F} at={212} />
      </g>
    );
  } },
  // D · close-up: the thought. You'd think the cash makes people keep it
  { from: 254, to: 328, z0: 1.0, z1: 1.09, fx: 540, fy: 820, render: (f) => {
    const F = f + 254;
    const bub = pop(F, 272, 12);
    return (
      <g>
        <g transform="translate(540 960) scale(1.9) translate(-540 -960)"><Street f={F} blur={14} /></g>
        <Figure x={430} y={2290} s={4.2} coat={COAT} mood={F > 296 ? "sly" : "neutral"} look={F > 296 ? [16, -4] : [10, -10]} blink={blinkAt(F, 3)} />
        {/* thought bubble with a pile of cash */}
        <g opacity={clamp01(bub)} transform={`translate(800 420) scale(${bub})`}>
          <circle cx={-200} cy={330} r={18} fill="#fbfbf8" stroke={INK} strokeWidth={6} />
          <circle cx={-150} cy={260} r={28} fill="#fbfbf8" stroke={INK} strokeWidth={6} />
          <path d="M -170,40 a 80,80 0 0 1 90,-110 a 90,90 0 0 1 160,-10 a 80,80 0 0 1 90,110 a 70,70 0 0 1 -40,120 a 90,90 0 0 1 -150,30 a 90,90 0 0 1 -140,-30 a 70,70 0 0 1 -10,-110 z" fill="#fbfbf8" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
          <g transform="translate(0 30) scale(0.42)">
            {[0, 1, 2, 3].map((k) => <Bill key={k} x={(k % 2) * 30 - 15} y={-k * 46 + 60} r={(k % 2 ? 4 : -4) + Math.sin(F * 0.2 + k) * 1.5} />)}
          </g>
        </g>
        {/* the hand closes on the wallet on "keep" */}
        <g transform={`translate(${lerp(1200, 870, eout(ramp(F, 296, 310)))} 1520)`}>
          <path d="M 260,320 L 40,40" stroke={INK} strokeWidth={34} strokeLinecap="round" />
          <g transform="rotate(-12)"><MiniWallet s={2.6} /></g>
          <circle cx={30} cy={30} r={58} fill="#fbfbf8" stroke={INK} strokeWidth={10} />
        </g>
        <FoundTag f={F} at={-99} />
      </g>
    );
  } },
  // E · fact card: so scientists tested it
  { from: 328, to: 386, z0: 1.0, z1: 1.04, render: (f) => {
    const F = f + 328;
    return (
      <Card label="A REAL EXPERIMENT · 2019">
        <g opacity={eio(ramp(F, 336, 348))}><Figure x={540} y={1240} s={1.45} coat="#fff" labCoat glasses hair="tuft" mood="happy" look={[6, -4]} blink={blinkAt(F, 4)} armR={60} elbowR={50} holdR={<g transform="rotate(-20)"><rect x={-40} y={-56} width={80} height={104} rx={8} fill="#f2e6cf" stroke={INK} strokeWidth={5} /><path d="M -22,-24 h 44 M -22,0 h 44 M -22,24 h 30" stroke={INK} strokeWidth={4} /></g>} /></g>
        <g transform={`translate(540 1470) scale(${pop(F, 354, 12)})`}>
          <text textAnchor="middle" y={0} style={serif} fontSize={104} fill={PINK_OFF}>So scientists</text>
          <text textAnchor="middle" y={112} style={serif} fontSize={104} fill={PINK_OFF}>tested it.</text>
        </g>
      </Card>
    );
  } },
  // F · fact card: 17,000 wallets, 40 countries
  { from: 386, to: 524, z0: 1.0, z1: 1.05, render: (f) => {
    const F = f + 386;
    const n = 17000 * eout(ramp(F, 412, 462));
    const cells = Math.round(96 * eout(ramp(F, 412, 462)));
    return (
      <Card label="LOST ON PURPOSE">
        <text x={VW / 2} y={560} textAnchor="middle" style={serif} fontSize={200} fill={PINK_OFF} opacity={eio(ramp(F, 400, 412))}>{fmt(n)}</text>
        <text x={VW / 2} y={650} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={58} fill="#7a6a5e" opacity={eio(ramp(F, 458, 468))}>wallets</text>
        <g transform="translate(150 730)">
          {Array.from({ length: cells }, (_, i) => <g key={i} transform={`translate(${(i % 12) * 66} ${Math.floor(i / 12) * 54})`}><rect width={52} height={36} rx={7} fill="#8a5a3c" stroke={INK} strokeWidth={3} /><rect x={32} y={10} width={14} height={14} rx={3} fill="#6f4730" /></g>)}
        </g>
        <g transform="translate(540 1300)" opacity={eio(ramp(F, 484, 494))}>
          <text textAnchor="middle" y={0} style={serif} fontSize={120} fill={PINK_OFF}>40 countries</text>
          <g transform="translate(-330 60)">
            {Array.from({ length: 40 }, (_, i) => { const k = pop(F, 488 + i * 0.5, 8); return <circle key={i} cx={(i % 10) * 73} cy={Math.floor(i / 10) * 64 + 20} r={22 * k} fill={i % 7 === 3 ? COAT : "#2A1E17"} opacity={0.85} />; })}
          </g>
        </g>
      </Card>
    );
  } },
  // G · fact card: more of the cash wallets came back
  { from: 524, to: 636, z0: 1.0, z1: 1.04, render: (f) => {
    const F = f + 524;
    const b1 = eout(ramp(F, 530, 556)), b2 = eout(ramp(F, 578, 606));
    const H = 760, base = 1460;
    const bar = (x: number, v: number, pct: number, label: string, hi: boolean) => (
      <g>
        <rect x={x} y={base - H * pct * v} width={300} height={H * pct * v} rx={18} fill={hi ? COAT : "#d9cdbf"} stroke={INK} strokeWidth={6} />
        <text x={x + 150} y={base - H * pct * v - 36} textAnchor="middle" style={serif} fontSize={hi ? 120 : 96} fill={PINK_OFF} opacity={v}>{Math.round(pct * 100 * v)}%</text>
        <text x={x + 150} y={base + 76} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={50} fill={PINK_OFF}>{label}</text>
      </g>
    );
    return (
      <Card label="OWNER CONTACTED">
        {bar(170, b1, 0.4, "No cash", false)}
        {bar(610, b2, 0.51, "With cash", true)}
        <line x1={120} y1={base} x2={960} y2={base} stroke={INK} strokeWidth={6} strokeLinecap="round" />
        <text x={VW / 2} y={1720} textAnchor="middle" fontFamily={MONO} fontSize={26} fill="#7a6a5e" opacity={eio(ramp(F, 600, 615))}>Cohn et al., Science (2019) · 17,303 wallets · 40 countries</text>
      </Card>
    );
  } },
  // H · doorway: you give it back. More honest, not less
  { from: 636, to: 728, z0: 1.0, z1: 1.07, fx: 600, fy: 1150, render: (f) => {
    const F = f + 636;
    const reach = eio(ramp(F, 644, 672));
    const given = F > 676;
    const heart = pop(F, 688, 12);
    return (
      <g>
        <g transform="translate(0 70)"><Doorway f={F} /></g>
        <Figure x={350} y={GROUND + 70} s={1.4} coat={COAT} mood={given ? "happy" : "neutral"} look={[10, 0]} blink={blinkAt(F, 5)} armR={lerp(10, 82, reach)} elbowR={lerp(0, 10, reach)} holdR={!given ? <MiniWallet s={0.9} /> : undefined} />
        <Figure x={790} y={GROUND + 70} s={1.25} facing={-1} coat="#8a6fb3" scarf="#4f8fd6" hair="bun" mood={F > 680 ? "happy" : "surprised"} look={[8, 0]} blink={blinkAt(F, 6)} armR={given ? 70 : 10} elbowR={given ? 30 : 0} holdR={given ? <MiniWallet s={0.9} /> : undefined} />
        {heart > 0.01 && <path transform={`translate(580 ${930 - (F - 688) * 1.2}) scale(${heart * 1.3})`} d="M 0,22 C -34,0 -22,-30 0,-12 C 22,-30 34,0 0,22 Z" fill="#ff7a8a" stroke={INK} strokeWidth={5} opacity={1 - ramp(F, 715, 728)} />}
      </g>
    );
  } },
  // I · close-up under the lamp: so… would you give it back?
  { from: 728, to: 900, z0: 1.0, z1: 1.08, fx: 540, fy: 1100, render: (f) => {
    const F = f + 728;
    const toCam = F > 756;
    return (
      <g>
        <g transform="translate(540 960) scale(1.7) translate(-560 -1000)"><Street f={F} blur={12} /></g>
        <Figure x={540} y={2420} s={3.6} coat={COAT} mood={toCam ? "neutral" : "worried"} look={toCam ? [0, 2] : [-12, 8]} blink={blinkAt(F, 7)} armR={50} elbowR={70} holdR={<MiniWallet s={1.2} />} headTilt={toCam ? -4 : 0} />
      </g>
    );
  } },
];

export const WalletFilm: React.FC = () => {
  const f = useCurrentFrame();
  const onCard = f >= 328 && f < 636;
  const endCard = eio(ramp(f, 786, 800));
  const fade = Math.max(1 - ramp(f, 0, 8), ramp(f, 884, 899));
  return (
    <AbsoluteFill style={{ backgroundColor: NAVY }}>
      <Soundtrack total={FILM_FRAMES} voice={staticFile("projects/stick-wallet-story/narration.wav")} voiceEnd={VOICE_END} music="music_suspense" amb="amb_city_night" ambVol={0.6} sfx={SFX} />
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <filter id="dof"><feGaussianBlur stdDeviation="9" /></filter>
          <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={WARM} stopOpacity="0.55" /><stop offset="1" stopColor={WARM} stopOpacity="0.06" /></linearGradient>
          <radialGradient id="pool"><stop offset="0" stopColor={WARM} stopOpacity="0.45" /><stop offset="1" stopColor={WARM} stopOpacity="0" /></radialGradient>
          <radialGradient id="pool2"><stop offset="0" stopColor={WARM} stopOpacity="0.5" /><stop offset="1" stopColor={WARM} stopOpacity="0" /></radialGradient>
          <radialGradient id="bulb"><stop offset="0" stopColor="#fff4d0" stopOpacity="0.95" /><stop offset="1" stopColor={WARM} stopOpacity="0" /></radialGradient>
          <linearGradient id="streak" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={WARM} stopOpacity="0.5" /><stop offset="1" stopColor={WARM} stopOpacity="0" /></linearGradient>
          <radialGradient id="inside" cx="0.5" cy="0.35" r="0.8"><stop offset="0" stopColor="#fff2c8" stopOpacity="0.9" /><stop offset="1" stopColor="#e9a54f" stopOpacity="0.6" /></radialGradient>
          <radialGradient id="vig" cx="0.5" cy="0.45" r="0.75"><stop offset="0.55" stopColor="#05070d" stopOpacity="0" /><stop offset="1" stopColor="#05070d" stopOpacity="0.55" /></radialGradient>
        </defs>
      </svg>
      <Shots f={f} shots={SHOTS} />
      {!onCard && <svg width={VW} height={VH} style={{ position: "absolute", inset: 0 }}><rect width={VW} height={VH} fill="url(#vig)" /></svg>}
      <Captions f={f} words={WORDS} chunks={CHUNKS} hide={onCard || endCard > 0.5} />
      {endCard > 0.01 && (
        <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(10,12,20,${0.7 * endCard}) 0%, rgba(10,12,20,${0.25 * endCard}) 45%, rgba(10,12,20,0) 70%)`, alignItems: "center" }}>
          <div style={{ ...serif, fontSize: 170, color: "#fbfbf8", opacity: endCard, transform: `translateY(${(1 - endCard) * 30}px)`, textShadow: "0 6px 30px rgba(0,0,0,0.5)", marginTop: 300 }}>Would you?</div>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: fade }} />
    </AbsoluteFill>
  );
};
