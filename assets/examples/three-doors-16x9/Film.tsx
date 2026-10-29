import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { loadVariableFont } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { Captions, CAPTION_FONT, eio, eout, Figure, FigureProps, Glint, Grain, INK, keys, lerp, mix, pop, ramp, rnd, ShotDef, Shots, Sfx, Soundtrack, VH, VW, blinkAt, clamp01 } from "./kit";
import { CHUNKS, VOICE_END, WORDS } from "./words";

// "Three Doors", 16:9 cut: the 9:16 film (../stick-doors-story) restaged for a wide frame (2560x1440 world, rendered at 1920x1080).
// Same narration, cues and mix. Change from the 9:16 cut: the car and goats are introduced as a line-up that shuffles away,
// so the viewer does not learn early that the car is behind door 2.
// Narration: ElevenLabs eleven_v4, voice Jesse – warm audiobook narrator (UlSegI53MOVdpfoA7K1h), one take (29.60 s), muxed at +15 frames.
// Key frames: "game show" f37/45 · "Three doors" f64/71 · "Behind one" f92 · "car" f143 · "other two" f181 · "goats" f216 ·
// "pick" f245 · "door number one" f251–278 · "host" f297 · "knows" f317 · "opens" f359 · "three" f373 · "goat" f406 ·
// "switch?" f473 · "Most" f499 · "stay" f515 · "50-50" f560 · "isn't" f601 · "switch" f637 · "two … three" f665–707 ·
// "first pick" f730 · "one in three" f766–781 · "never changed" f814–836 · "So" f854 · "would you switch?" f880–898 · voice ends f898.
// Facts (standard Monty Hall assumptions: the host knows, always opens a goat door you didn't pick, always offers the switch):
// staying wins 1/3, switching wins 2/3. "Most people stay": Granberg & Brown (1995), most participants stick with their first choice.

const { fontFamily: SERIF } = loadVariableFont("normal", { subsets: ["latin"] });
const { fontFamily: MONO } = loadMono("normal", { weights: ["500"], subsets: ["latin"] });
export const FILM_FRAMES = VOICE_END + 110; // 1008

// sound design: every effect lands on its picture beat (composition frames). Big hits sit in the pauses.
const SFX: Sfx[] = [
  [36, "sfx_sparkle", 0.3], [60, "sfx_pop", 0.3], [68, "sfx_pop", 0.3], [76, "sfx_pop", 0.3],
  [88, "sfx_whoosh", 0.28], [140, "sfx_sparkle", 0.4], [208, "sfx_pop", 0.3], [221, "sfx_goat", 0.3],
  [235, "sfx_whoosh", 0.28], [250, "sfx_pop", 0.35], [268, "sfx_card_slide", 0.3],
  [288, "sfx_whoosh", 0.25], [316, "sfx_pop", 0.3], [338, "sfx_drumroll", 0.34],
  [355, "sfx_whoosh", 0.22], [363, "sfx_door_creak", 0.42], [410, "sfx_goat", 0.45],
  [425, "sfx_whoosh", 0.25], [476, "sfx_pop", 0.25], [484, "sfx_gulp", 0.45],
  [495, "sfx_whoosh", 0.25], [500, "sfx_card_slide", 0.3], [544, "sfx_pop", 0.3], [612, "sfx_reveal_hit", 0.45],
  [619, "sfx_whoosh", 0.22], [624, "sfx_card_slide", 0.3], [637, "sfx_pop", 0.3], [652, "sfx_card_slide", 0.3], [705, "sfx_ding", 0.38],
  [718, "sfx_whoosh", 0.25], [723, "sfx_card_slide", 0.3], [764, "sfx_pop", 0.32], [812, "sfx_pop", 0.35],
  [832, "sfx_whoosh", 0.28], [840, "sfx_cha_ching", 0.3],
  [878, "sfx_whoosh", 0.25], [901, "sfx_reveal_hit", 0.4],
];

// palette: night-navy game-show stage, ONE strong spotlight, bulb lights; the contestant's coral jacket is the hero colour,
// the host's deep purple suit the second costume; the car is bright yellow. Fact cards on warm paper.
const NAVY = "#131a31", WALL_LINE = "#1a2246", FLOOR = "#0d1225", DOOR = "#2c3c6e", FRAME = "#222a4c";
const BULB_OFF = "#3a4062", BULB = "#ffd36b", SPOT = "#fff0c8";
const CORAL = "#e5674a", PURPLE = "#5b3f8c", CAR = "#f5c331";
const PAPER = "#F6F1EA", CINK = "#2A1E17", MUTED = "#7a6a5e";
const GROUND = 1380, CX = VW / 2;
const DOOR_X = [940, 1280, 1620], DOOR_W = 290, DOOR_TOP = 480, DOOR_BOT = 1160;

// ---------- props ----------
const Car: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => {
  const dark = mix(CAR, "#000000", 0.3);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={4} rx={165} ry={13} fill="#000" opacity={0.25} />
      <path d="M -88,-96 L -60,-150 Q -54,-162 -40,-162 L 48,-162 Q 62,-162 70,-150 L 106,-96 Z" fill={CAR} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <path d="M -68,-100 L -47,-144 L -6,-144 L -6,-100 Z" fill="#cfe8f2" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 6,-100 L 6,-144 L 52,-144 L 82,-100 Z" fill="#cfe8f2" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -40,-140 l -12,26 M 18,-140 l -10,24" stroke="#ffffff" strokeWidth={6} strokeLinecap="round" opacity={0.8} />
      <path d="M -152,-38 L -152,-74 Q -150,-98 -122,-100 L 120,-100 Q 152,-98 158,-72 L 160,-38 Q 160,-26 148,-26 L -140,-26 Q -152,-26 -152,-38 Z" fill={CAR} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <path d="M -126,-86 L 128,-86" stroke="#fff6cf" strokeWidth={7} strokeLinecap="round" opacity={0.85} />
      <path d="M -6,-98 L -6,-42 M 22,-66 l 18,0" stroke={dark} strokeWidth={4} strokeLinecap="round" />
      <rect x={138} y={-80} width={18} height={15} rx={4} fill="#fff7d6" stroke={INK} strokeWidth={4} />
      <rect x={-154} y={-80} width={13} height={15} rx={3} fill={dark} stroke={INK} strokeWidth={4} />
      {[-92, 98].map((wx) => (
        <g key={wx}>
          <circle cx={wx} cy={-26} r={35} fill="#1d1d26" stroke={INK} strokeWidth={6} />
          <circle cx={wx} cy={-26} r={14} fill="#cfd3da" stroke={INK} strokeWidth={4} />
        </g>
      ))}
    </g>
  );
};

// a cute goat: white body, grey patch, little horns, beard. Origin between the hooves.
const Goat: React.FC<{ x: number; y: number; s?: number; facing?: 1 | -1; f: number; bleat?: number; hop?: number }> = ({ x, y, s = 1, facing = 1, f, bleat = 0, hop = 0 }) => {
  const bob = Math.sin(f * 0.16) * 3;
  const chew = Math.sin(f * 0.55) * 2;
  const W = "#f4f2ec";
  return (
    <g transform={`translate(${x} ${y}) scale(${s * facing} ${s})`}>
      <ellipse cx={8} cy={2} rx={112} ry={12} fill="#000" opacity={0.22} />
      <g transform={`translate(0 ${-hop})`}>
        {[-64, -36, 40, 66].map((lx, k) => (
          <g key={k}>
            <path d={`M ${lx},-84 L ${lx + (k % 2 ? 3 : -3)},-12`} stroke={INK} strokeWidth={9} strokeLinecap="round" />
            <rect x={lx - 10 + (k % 2 ? 3 : -3)} y={-14} width={20} height={14} rx={4} fill="#3b3540" stroke={INK} strokeWidth={4} />
          </g>
        ))}
        <path d="M -98,-140 q -24,-16 -18,-36 q 12,10 26,24" fill={W} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        {/* neck */}
        <path d="M 40,-150 L 92,-238 L 140,-212 L 96,-128 Z" fill={W} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        <ellipse cx={0} cy={-120} rx={104} ry={60} fill={W} stroke={INK} strokeWidth={7} />
        <ellipse cx={-34} cy={-130} rx={36} ry={22} fill="#d8d3c9" />
        <path d="M 40,-150 L 96,-128" stroke={W} strokeWidth={10} />
        {/* head */}
        <g transform={`translate(118 ${-232 + bob}) rotate(${-4 + chew * 0.6})`}>
          <path d="M -20,-44 C -30,-82 -66,-90 -80,-72 C -58,-76 -42,-66 -34,-40 Z" fill="#a59e92" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <path d="M -2,-50 C -6,-90 -40,-104 -58,-90 C -36,-88 -22,-74 -16,-46 Z" fill="#b8b1a5" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <ellipse cx={-40} cy={-14} rx={32} ry={11} transform="rotate(-22 -40 -14)" fill="#e6e1d8" stroke={INK} strokeWidth={5} />
          <path d="M -36,-24 Q -38,-56 -6,-56 Q 32,-54 46,-16 Q 58,16 42,32 Q 22,44 -6,32 Q -38,16 -36,-24 Z" fill={W} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
          <ellipse cx={34} cy={14} rx={21} ry={16} fill="#e7e1d6" />
          <circle cx={46} cy={6} r={3.5} fill={INK} />
          <path d="M 8,36 L 18,74 L 30,38 Z" fill="#dcd6cb" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <ellipse cx={4} cy={-16} rx={6.5} ry={9} fill={INK} />
          <circle cx={6} cy={-19} r={2.2} fill="#fff" />
          {bleat > 0.05 ? <ellipse cx={30} cy={30} rx={8} ry={4 + 8 * bleat} fill={INK} /> : <path d="M 20,28 q 10,7 20,-1" stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />}
        </g>
      </g>
    </g>
  );
};

// the host's microphone, drawn at his front hand (holdR)
const Mic: React.FC<{ r?: number }> = ({ r = 0 }) => (
  <g transform={`rotate(${r})`}>
    <rect x={-7} y={-64} width={14} height={60} rx={5} fill="#2a2a33" stroke={INK} strokeWidth={4} />
    <circle cx={0} cy={-78} r={18} fill="#b9bcc6" stroke={INK} strokeWidth={5} />
    <path d="M -12,-84 h 24 M -15,-77 h 30 M -12,-70 h 24" stroke="#7f8392" strokeWidth={2.5} />
  </g>
);

// the host: deep-purple suit, glasses, slick hair, white shirt V + bow tie, mic in hand
const Host: React.FC<Omit<FigureProps, "coat"> & { micR?: number }> = (p) => {
  const s = p.s ?? 1, fc = p.facing ?? 1, bob = p.bob ?? 0;
  const shY = -282 - bob, headY = -352 - bob;
  return (
    <g>
      <Figure {...p} coat={PURPLE} glasses hair="none" holdR={<Mic r={p.micR ?? 0} />} />
      <g transform={`translate(${p.x} ${p.y}) scale(${s * fc} ${s})`}>
        <path d={`M -18,${shY - 8} L 0,${shY + 30} L 18,${shY - 8} Z`} fill="#fbfbf8" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <path d={`M 0,${shY + 6} L -20,${shY - 5} L -20,${shY + 17} Z M 0,${shY + 6} L 20,${shY - 5} L 20,${shY + 17} Z`} fill={INK} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        <g transform={`rotate(${p.headTilt ?? 0} 0 ${headY + 50})`}>
          <path d={`M -61,${headY - 8} Q -62,${headY - 68} 0,${headY - 68} Q 62,${headY - 68} 62,${headY - 12} Q 34,${headY - 50} -8,${headY - 48} Q -42,${headY - 44} -61,${headY - 8} Z`} fill="#2f2a36" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d={`M -6,${headY - 50} Q 4,${headY - 60} 14,${headY - 66}`} stroke="#5a5266" strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
};

const You: React.FC<Omit<FigureProps, "coat">> = (p) => <Figure {...p} coat={CORAL} />;

// confetti: small SVG rectangles bursting up from a point and falling back
const Confetti: React.FC<{ t: number; x: number; y: number; n?: number; seed?: string }> = ({ t, x, y, n = 70, seed = "c" }) => {
  if (t <= 0) return null;
  const cols = [CORAL, CAR, "#fbfbf8", "#a48bd6"];
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const vx = (rnd(`${seed}x${i}`) - 0.5) * 44;
        const vy = -16 - rnd(`${seed}y${i}`) * 24;
        const px = x + vx * t, py = y + vy * t + 0.6 * t * t;
        const rot = rnd(`${seed}r${i}`) * 360 + t * (rnd(`${seed}s${i}`) - 0.5) * 30;
        const w = 16 + rnd(`${seed}w${i}`) * 12, h = 9 + rnd(`${seed}h${i}`) * 6;
        const flip = Math.abs(Math.cos(t * 0.25 + i));
        return <rect key={i} x={-w / 2} y={(-h / 2) * flip} width={w} height={Math.max(2, h * flip)} rx={2} fill={cols[i % 4]} stroke={INK} strokeWidth={2} transform={`translate(${px} ${py}) rotate(${rot})`} />;
      })}
    </g>
  );
};
// slow falling confetti for the last shot
const ConfettiRain: React.FC<{ f: number; n?: number }> = ({ f, n = 34 }) => {
  const cols = [CORAL, CAR, "#fbfbf8", "#a48bd6"];
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x0 = rnd(`rx${i}`) * VW, sp = 5 + rnd(`rs${i}`) * 5;
        const py = ((rnd(`ry${i}`) * 1700 + f * sp) % 1700) - 150;
        const px = x0 + Math.sin(f * 0.05 + i) * 30;
        const flip = Math.abs(Math.cos(f * 0.12 + i));
        return <rect key={i} x={-11} y={-6 * flip} width={22} height={Math.max(2, 12 * flip)} rx={2} fill={cols[i % 4]} stroke={INK} strokeWidth={2.5} transform={`translate(${px} ${py}) rotate(${rnd(`rr${i}`) * 360 + f * 2})`} />;
      })}
    </g>
  );
};

// thought-bubble cloud (centre ~ 0,50 at scale 1)
const CLOUD = "M -170,40 a 80,80 0 0 1 90,-110 a 90,90 0 0 1 160,-10 a 80,80 0 0 1 90,110 a 70,70 0 0 1 -40,120 a 90,90 0 0 1 -150,30 a 90,90 0 0 1 -140,-30 a 70,70 0 0 1 -10,-110 z";

// ---------- the set: a game-show stage at night ----------
type DoorState = { open?: number; lit?: number; glow?: number; xray?: number; content?: "car" | "goat"; pop?: number; bleat?: number; hop?: number };
const Door: React.FC<{ f: number; i: number; st: DoorState }> = ({ f, i, st }) => {
  const cx = DOOR_X[i], x0 = cx - DOOR_W / 2, x1 = cx + DOOR_W / 2, H = DOOR_BOT - DOOR_TOP;
  const open = st.open ?? 0, lit = st.lit ?? 0, glow = st.glow ?? 0, xray = st.xray ?? 0;
  const fx0 = x0 - 22, fx1 = x1 + 22, fy0 = DOOR_TOP - 22;
  const bulbs: [number, number][] = [];
  for (let k = 0; k < 15; k++) bulbs.push([fx0, DOOR_BOT - 24 - k * 46]);
  for (let k = 1; k < 8; k++) bulbs.push([lerp(fx0, fx1, k / 8), fy0]);
  for (let k = 14; k >= 0; k--) bulbs.push([fx1, DOOR_BOT - 24 - k * 46]);
  // the panel swings towards us about its right-hand hinge
  const th = open * (Math.PI / 2) * 1.05;
  const farX = x1 - DOOR_W * Math.cos(th) + 84 * Math.sin(th);
  const ex = 40 * Math.sin(th);
  const kx = (x1 - farX) / DOOR_W;
  const seen = Math.max(open, xray);
  const popK = st.pop ?? 1;
  const panelFill = mix(DOOR, "#121731", Math.sin(th) * 0.7);
  return (
    <g>
      {glow > 0.01 && <rect x={fx0 - 20} y={fy0 - 20} width={fx1 - fx0 + 40} height={DOOR_BOT - fy0 + 20} rx={20} fill={BULB} opacity={glow * 0.75} filter="url(#glow)" style={{ mixBlendMode: "screen" }} />}
      <rect x={fx0} y={fy0} width={fx1 - fx0} height={DOOR_BOT - fy0} rx={12} fill={FRAME} stroke={INK} strokeWidth={7} />
      {bulbs.map(([bx, by], k) => {
        const b = lit * (0.68 + 0.32 * ((k + Math.floor(f / 6)) % 2));
        return (
          <g key={k}>
            {b > 0.05 && <circle cx={bx} cy={by} r={19} fill={BULB} opacity={0.32 * b} style={{ mixBlendMode: "screen" }} />}
            <circle cx={bx} cy={by} r={8} fill={mix(BULB_OFF, BULB, b)} stroke={INK} strokeWidth={3} />
          </g>
        );
      })}
      {/* inside: a lit booth */}
      <rect x={x0} y={DOOR_TOP} width={DOOR_W} height={H} fill="url(#room)" stroke={INK} strokeWidth={5} />
      <rect x={x0} y={DOOR_BOT - 70} width={DOOR_W} height={70} fill="#b98445" opacity={0.55} />
      {seen > 0.01 && st.content === "car" && popK > 0.01 && <Car x={cx} y={DOOR_BOT - 16} s={0.86 * popK} />}
      {seen > 0.01 && st.content === "goat" && popK > 0.01 && <Goat x={cx - 22} y={DOOR_BOT - 14} s={0.9 * popK} f={f} bleat={st.bleat} hop={st.hop} />}
      {/* the door panel */}
      {open < 0.999 && (
        <g opacity={1 - 0.8 * xray}>
          <path d={`M ${farX},${DOOR_TOP - ex} L ${x1},${DOOR_TOP} L ${x1},${DOOR_BOT} L ${farX},${DOOR_BOT + ex} Z`} fill={panelFill} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
          {kx > 0.05 && (
            <g transform={`translate(${x1} 0) scale(${kx} 1) translate(${-x1} 0)`} opacity={1 - ramp(open, 0.15, 0.5)}>
              <rect x={x0 + 30} y={DOOR_TOP + 40} width={DOOR_W - 60} height={340} rx={14} fill="none" stroke="#22305c" strokeWidth={7} />
              <rect x={x0 + 30} y={DOOR_TOP + 420} width={DOOR_W - 60} height={220} rx={14} fill="none" stroke="#22305c" strokeWidth={7} />
              <text x={cx} y={DOOR_TOP + 272} textAnchor="middle" style={serif} fontSize={190} fill="#efe4cc">{i + 1}</text>
              <circle cx={x0 + 34} cy={DOOR_TOP + H * 0.58} r={13} fill="#d8b25a" stroke={INK} strokeWidth={4} />
            </g>
          )}
        </g>
      )}
      {xray > 0.01 && open < 0.5 && <rect x={x0 + 6} y={DOOR_TOP + 6} width={DOOR_W - 12} height={H - 12} rx={8} fill="none" stroke="#fbfbf8" strokeWidth={5} strokeDasharray="18 14" opacity={xray * 0.8} />}
      {/* number sign above the door */}
      <rect x={cx - 66} y={DOOR_TOP - 150} width={132} height={96} rx={16} fill="#1c2346" stroke={INK} strokeWidth={6} />
      <text x={cx} y={DOOR_TOP - 76} textAnchor="middle" style={serif} fontSize={78} fill={mix("#59618a", BULB, lit)}>{i + 1}</text>
    </g>
  );
};

const VALANCE = (() => {
  let d = `M 0,0 L ${VW},0 L ${VW},130`;
  for (let k = 19; k >= 0; k--) d += ` Q ${k * 128 + 64},210 ${k * 128},130`;
  return d + " Z";
})();

const Stage: React.FC<{ f: number; doors: DoorState[]; spotX?: number; spot?: number; blur?: number }> = ({ f, doors, spotX = CX, spot = 1, blur = 0 }) => {
  const D = <g>{doors.map((st, i) => <Door key={i} f={f} i={i} st={st} />)}</g>;
  return (
    <g filter={blur ? (blur > 10 ? "url(#dof2)" : "url(#dof)") : undefined}>
      <rect width={VW} height={VH} fill={NAVY} />
      {Array.from({ length: 27 }, (_, k) => <line key={k} x1={k * 96 + 12} y1={0} x2={k * 96 + 12} y2={DOOR_BOT} stroke={WALL_LINE} strokeWidth={6} />)}
      {/* a dim arch of bulbs on the back wall */}
      {Array.from({ length: 33 }, (_, k) => {
        const a = Math.PI * (k / 32);
        return <circle key={k} cx={CX - Math.cos(a) * 760} cy={400 - Math.sin(a) * 160} r={7} fill={mix(BULB_OFF, BULB, 0.3 + 0.3 * ((k + Math.floor(f / 8)) % 2))} opacity={0.75} />;
      })}
      <path d={VALANCE} fill="#1b2142" stroke={INK} strokeWidth={6} />
      {D}
      {/* glossy floor with reflections */}
      <rect y={DOOR_BOT} width={VW} height={VH - DOOR_BOT} fill={FLOOR} />
      <g clipPath="url(#floorClip)"><g transform={`translate(0 ${2 * DOOR_BOT}) scale(1 -1)`} opacity={0.22}>{D}</g></g>
      <rect y={DOOR_BOT} width={VW} height={VH - DOOR_BOT} fill="url(#floorFade)" />
      {[1230, 1310, 1400].map((y, k) => <line key={k} x1={0} y1={y} x2={VW} y2={y} stroke="#161d38" strokeWidth={4} />)}
      <line x1={0} y1={DOOR_BOT} x2={VW} y2={DOOR_BOT} stroke={INK} strokeWidth={8} />
      {/* the one strong light: a spotlight from above */}
      <g opacity={spot} style={{ mixBlendMode: "screen" }}>
        <path d={`M ${spotX - 50},0 L ${spotX + 50},0 L ${spotX + 460},${VH} L ${spotX - 460},${VH} Z`} fill="url(#spotCone)" />
        <ellipse cx={spotX} cy={GROUND - 30} rx={540} ry={74} fill="url(#spotPool)" />
      </g>
    </g>
  );
};

// a close-up background: the stage scaled up about a point and blurred
const StageBG: React.FC<{ f: number; doors: DoorState[]; k: number; cx: number; cy: number; spotX?: number; blur?: number }> = ({ f, doors, k, cx, cy, spotX, blur = 9 }) => (
  <g transform={`translate(${VW / 2} ${VH / 2}) scale(${k}) translate(${-cx} ${-cy})`}><Stage f={f} doors={doors} spotX={spotX} blur={blur} /></g>
);

// stakes tag, top left
const PickTag: React.FC<{ f: number; at: number; text?: string }> = ({ f, at, text = "YOUR PICK · DOOR 1" }) => {
  const k = pop(f, at, 12);
  if (k <= 0.01) return null;
  return (
    <g transform={`translate(90 150) scale(${1.35 * k})`} opacity={clamp01(k)}>
      <rect x={0} y={-44} width={text.length * 20.6 + 92} height={76} rx={38} fill="#fbfbf8" stroke={INK} strokeWidth={5} />
      <circle cx={36} cy={-6} r={10} fill={CORAL} stroke={INK} strokeWidth={3} />
      <text x={60} y={6} fontFamily={MONO} fontSize={32} fill={INK} letterSpacing={1}>{text}</text>
    </g>
  );
};

// ---------- fact cards ----------
const serif = { fontFamily: SERIF, fontWeight: 800, fontVariationSettings: "'SOFT' 100, 'opsz' 144" } as const;
const Card: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <g>
    <rect width={VW} height={VH} fill={PAPER} />
    <Grain id="g1" />
    <text x={VW / 2} y={190} textAnchor="middle" fontFamily={MONO} fontSize={44} letterSpacing={8} fill={MUTED}>{label}</text>
    <g transform={`translate(${CX} 740) scale(1.12) translate(${-CX} -740)`}>{children}</g>
  </g>
);
// a flat door icon for the cards; x,y = bottom centre
const DoorIcon: React.FC<{ x: number; y: number; n: number; w?: number; h?: number; hi?: number; grey?: number; k?: number }> = ({ x, y, n, w = 220, h = 330, hi = 0, grey = 0, k = 1 }) => {
  if (k <= 0.01) return null;
  const fill = mix(mix("#d9cdbf", CORAL, hi), "#ece6dd", grey);
  const ink = mix(CINK, "#b8ab9d", grey);
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <rect x={-w / 2 - 14} y={-h - 14} width={w + 28} height={h + 14} rx={16} fill="none" stroke={ink} strokeWidth={6} />
      <rect x={-w / 2} y={-h} width={w} height={h} rx={10} fill={fill} stroke={ink} strokeWidth={6} />
      <text x={0} y={-h * 0.42} textAnchor="middle" style={serif} fontSize={h * 0.36} fill={hi > 0.5 ? "#fbfbf8" : ink}>{n}</text>
      <circle cx={w / 2 - 24} cy={-h * 0.4} r={9} fill={ink} />
    </g>
  );
};
const Padlock: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => k <= 0.01 ? null : (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <path d="M -38,-30 L -38,-62 A 38,38 0 0 1 38,-62 L 38,-30" fill="none" stroke={CINK} strokeWidth={16} strokeLinecap="round" />
    <rect x={-62} y={-36} width={124} height={100} rx={16} fill={CORAL} stroke={CINK} strokeWidth={7} />
    <circle cx={0} cy={6} r={12} fill={CINK} />
    <rect x={-5} y={8} width={10} height={28} rx={4} fill={CINK} />
  </g>
);
// (drawn inside the card's 1.12 group, so y 1254/1297 land at ~1318/1366 on screen)
const SourceLine: React.FC<{ a: string; b?: string; o: number }> = ({ a, b, o }) => (
  <g opacity={o}>
    <text x={VW / 2} y={1254} textAnchor="middle" fontFamily={MONO} fontSize={32} fill={MUTED}>{a}</text>
    {b && <text x={VW / 2} y={1297} textAnchor="middle" fontFamily={MONO} fontSize={32} fill={MUTED}>{b}</text>}
  </g>
);

// door states
const C3: ["goat", "car", "goat"] = ["goat", "car", "goat"];
const doorsWith = (s: DoorState[]) => s.map((d, i) => ({ content: C3[i], ...d }));


// ---------- the shots (16:9: the doors hold the centre, you on the left, the host on the right) ----------
const SHOTS: ShotDef[] = [
  // A · wide stage: you're on a game show. Three doors light up one by one
  { from: 0, to: 90, z0: 1.0, z1: 1.06, fx: CX, fy: 860, render: (f) => {
    const lit = (i: number) => eout(ramp(f, 60 + i * 8, 66 + i * 8));
    const doors = doorsWith([0, 1, 2].map((i) => ({ lit: lit(i), glow: lit(i) * (1 - ramp(f, 66 + i * 8, 86 + i * 8)) * 0.8 })));
    return (
      <g>
        <Stage f={f} doors={doors} spot={keys(f, [[0, 0.25], [14, 0.25], [26, 1]])} />
        <You x={470} y={GROUND} s={1.3} mood={f < 16 ? "neutral" : f < 38 ? "surprised" : "happy"} look={f > 60 ? [6, -12] : [8, -2]} blink={blinkAt(f, 1)} armR={keys(f, [[0, 10], [36, 10], [46, 40]])} elbowR={keys(f, [[0, 0], [36, 0], [46, 60]])} />
        <Host x={2090} y={GROUND} s={1.3} facing={-1} mood="happy" look={[6, -2]} blink={blinkAt(f, 2)} armL={keys(f, [[0, -10], [56, -10], [66, 130]])} elbowL={keys(f, [[0, 0], [56, 0], [66, -20]])} armR={55} elbowR={85} micR={-12} />
      </g>
    );
  } },
  // B · the prizes: a car and two goats line up in front of the closed doors, then shuffle away behind them
  // (no x-ray, so the viewer never learns which door hides the car)
  { from: 90, to: 237, z0: 1.1, z1: 1.17, fx: CX, fy: 1250, render: (f) => {
    const F = f + 90;
    const out = eio(ramp(F, 226, 236)), sh = eio(ramp(F, 220, 234)), arc = Math.sin(sh * Math.PI) * 70;
    const kC = pop(F, 136, 12) * (1 - out), kL = pop(F, 207, 10) * (1 - out), kR = pop(F, 212, 10) * (1 - out);
    const doors = doorsWith([{ lit: 1 }, { lit: 1 }, { lit: 1 }]);
    return (
      <g>
        <Stage f={F} doors={doors} spot={1} />
        {kL > 0.01 && <Goat x={lerp(820, 1740, sh)} y={1250 - arc} s={1.1 * kL} f={F} />}
        {kR > 0.01 && <Goat x={lerp(1740, 1280, sh)} y={1250 - arc} s={1.1 * kR} facing={-1} f={F} bleat={Math.sin(ramp(F, 214, 228) * Math.PI)} />}
        {kC > 0.01 && <Car x={lerp(1280, 820, sh)} y={1250 - arc} s={1.35 * kC} />}
        <Glint x={1360} y={1090} t={ramp(F, 142, 164)} r={70} />
        <Glint x={1170} y={1180} t={ramp(F, 150, 170)} r={40} />
      </g>
    );
  } },
  // C · medium: you pick door number one (it glows)
  { from: 237, to: 290, z0: 1.0, z1: 1.05, fx: CX, fy: 720, render: (f) => {
    const F = f + 237;
    const g = eout(ramp(F, 249, 258));
    const doors = doorsWith([{ lit: 1, glow: g * (0.75 + 0.25 * Math.sin(F * 0.4)) }, { lit: 0.35 }, { lit: 0.35 }]);
    return (
      <g>
        <StageBG f={F} doors={doors} k={1.5} cx={1080} cy={800} spotX={940} blur={0} />
        <You x={2050} y={1640} s={2.8} facing={-1} mood="happy" look={[10, -6]} blink={blinkAt(F, 3)} armR={keys(F, [[237, 10], [243, 10], [252, 104]])} elbowR={-6} />
        <PickTag f={F} at={268} />
      </g>
    );
  } },
  // D1 · medium: the host, who knows where the car is
  { from: 290, to: 357, z0: 1.0, z1: 1.06, fx: 1500, fy: 700, render: (f) => {
    const F = f + 290;
    const b = pop(F, 316, 12);
    const doors = doorsWith([{ lit: 0.6, glow: 0.3 }, { lit: 0.6 }, { lit: 0.6 }]);
    return (
      <g>
        <StageBG f={F} doors={doors} k={1.6} cx={1450} cy={780} spotX={1620} blur={9} />
        <Host x={1840} y={1640} s={2.8} facing={-1} mood={F > 315 ? "sly" : "happy"} look={F > 315 ? [-12, -10] : [-4, 0]} blink={blinkAt(F, 4)} armR={keys(F, [[290, 40], [300, 62]])} elbowR={85} micR={-14} armL={-8} />
        {b > 0.01 && (
          <g opacity={clamp01(b)} transform={`translate(1160 400) scale(${1.15 * b})`}>
            <circle cx={150} cy={330} r={18} fill="#fbfbf8" stroke={INK} strokeWidth={6} />
            <circle cx={110} cy={262} r={28} fill="#fbfbf8" stroke={INK} strokeWidth={6} />
            <path d={CLOUD} fill="#fbfbf8" stroke={INK} strokeWidth={7} strokeLinejoin="round" transform="scale(0.95)" />
            <Car x={0} y={110} s={0.62} />
            <Glint x={50} y={20} t={ramp(F, 334, 352)} r={34} />
          </g>
        )}
        <PickTag f={F} at={-99} />
      </g>
    );
  } },
  // D2 · wide: he opens door three… a goat
  { from: 357, to: 427, z0: 1.0, z1: 1.07, fx: 1560, fy: 900, render: (f) => {
    const F = f + 357;
    const o = eio(ramp(F, 362, 384));
    const bl = Math.sin(ramp(F, 408, 424) * Math.PI);
    const doors = doorsWith([{ lit: 0.55, glow: 0.3 }, { lit: 0.55 }, { lit: 1, open: o, bleat: bl, hop: 16 * Math.sin(ramp(F, 403, 413) * Math.PI) }]);
    return (
      <g>
        <Stage f={F} doors={doors} spotX={1620} />
        <You x={470} y={GROUND} s={1.3} mood={F > 403 ? "surprised" : "worried"} look={[12, -4]} blink={blinkAt(F, 5)} />
        <Host x={2090} y={GROUND} s={1.3} facing={-1} mood="happy" look={[12, -2]} blink={blinkAt(F, 6)} armL={keys(F, [[357, -10], [360, -10], [370, 88]])} elbowL={-8} armR={55} elbowR={85} micR={8} />
        <PickTag f={F} at={-99} />
      </g>
    );
  } },
  // E · close-up two-shot: the host leans in with the mic. Do you want to switch?
  { from: 427, to: 497, z0: 1.0, z1: 1.06, fx: CX, fy: 760, render: (f) => {
    const F = f + 427;
    const lean = eio(ramp(F, 430, 450));
    const q = pop(F, 475, 10);
    const doors = doorsWith([{ lit: 0.7, glow: 0.3 }, { lit: 0.7 }, { lit: 0.7, open: 1 }]);
    return (
      <g>
        <StageBG f={F} doors={doors} k={1.8} cx={CX} cy={760} spotX={CX} blur={14} />
        <You x={820} y={1830} s={3.2} mood={F > 471 ? "worried" : "neutral"} look={F > 478 ? [4, 2] : [12, -2]} sweat={eio(ramp(F, 474, 486))} blink={blinkAt(F, 7)} />
        <Host x={lerp(1820, 1730, lean)} y={1830} s={3.2} facing={-1} mood={F > 470 ? "happy" : "sly"} look={[12, 0]} headTilt={lerp(0, 8, lean)} blink={blinkAt(F, 8)} armR={lerp(40, 78, lean)} elbowR={lerp(80, 14, lean)} micR={lerp(-10, -40, lean)} />
        {q > 0.01 && <text x={1250} y={560} textAnchor="middle" style={serif} fontSize={210} fill="#fbfbf8" stroke={INK} strokeWidth={7} paintOrder="stroke" transform="rotate(10 1250 480)" opacity={clamp01(q)}>?</text>}
        <PickTag f={F} at={-99} />
      </g>
    );
  } },
  // F · fact card: most people stay (left). It feels like 50/50… it isn't (right)
  { from: 497, to: 621, z0: 1.0, z1: 1.03, render: (f) => {
    const F = f + 497;
    const s1 = eout(ramp(F, 597, 605)), s2 = eout(ramp(F, 603, 611));
    const bub = pop(F, 544, 12);
    return (
      <Card label="WHAT MOST PEOPLE DO">
        <g transform={`translate(760 640) scale(${pop(F, 499, 12)})`}><text textAnchor="middle" style={serif} fontSize={150} fill={CINK}>Most people</text></g>
        <g transform={`translate(760 900) scale(${pop(F, 514, 12)})`}><text textAnchor="middle" style={serif} fontSize={250} fill={CORAL}>stay.</text></g>
        {bub > 0.01 && (
          <g opacity={clamp01(bub)} transform={`translate(1800 640) scale(${bub})`}>
            <circle cx={-330} cy={262} r={20} fill="#fff" stroke={CINK} strokeWidth={6} />
            <circle cx={-286} cy={200} r={30} fill="#fff" stroke={CINK} strokeWidth={6} />
            <path d={CLOUD} transform="translate(0 -46) scale(2.05 1.32)" fill="#fff" stroke={CINK} strokeWidth={5} strokeLinejoin="round" />
            <text x={0} y={80} textAnchor="middle" style={serif} fontSize={180} fill={CINK} opacity={1 - 0.55 * s2}>50/50</text>
            <text x={0} y={-104} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={44} fill={MUTED}>feels like</text>
          </g>
        )}
        <path d="M 1530,580 L 2070,770" stroke={CORAL} strokeWidth={26} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - s1} opacity={s1 > 0 ? 1 : 0} />
        <path d="M 1530,770 L 2070,580" stroke={CORAL} strokeWidth={26} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - s2} opacity={s2 > 0 ? 1 : 0} />
        <g transform={`translate(1800 1120) scale(${pop(F, 600, 12)})`}><text textAnchor="middle" style={serif} fontSize={150} fill={CINK}>It isn&apos;t.</text></g>
        <SourceLine a="Granberg & Brown (1995): most participants" b="stick with their first choice" o={eio(ramp(F, 520, 534))} />
      </Card>
    );
  } },
  // G1 · fact card: door 1 = 1/3, doors 2+3 = 2/3 … door 3 is a goat, so the whole 2/3 moves onto door 2
  { from: 621, to: 720, z0: 1.0, z1: 1.03, render: (f) => {
    const F = f + 621;
    const mv = eio(ramp(F, 650, 674));
    const xR = lerp(1320, 980, mv), xL = 740, mid = (xL + xR) / 2;
    const br = eout(ramp(F, 636, 648));
    const sx = 1960;
    return (
      <Card label="THE REAL ODDS">
        <DoorIcon x={520} y={820} n={1} k={pop(F, 622, 10)} />
        <DoorIcon x={860} y={820} n={2} k={pop(F, 625, 10)} hi={eio(ramp(F, 664, 676))} />
        <DoorIcon x={1200} y={820} n={3} k={pop(F, 628, 10)} grey={eio(ramp(F, 648, 660))} />
        {pop(F, 650, 10) > 0.01 && <Goat x={1190} y={816} s={0.42 * pop(F, 650, 10)} f={F} />}
        <g opacity={eio(ramp(F, 628, 638))}>
          <text x={520} y={960} textAnchor="middle" style={serif} fontSize={100} fill={CINK}>1/3</text>
        </g>
        <g opacity={br}>
          <path d={`M ${xL},${840} L ${xL},${868} L ${xR},${868} L ${xR},${840} M ${mid},${868} L ${mid},${896}`} stroke={CORAL} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x={mid} y={990} textAnchor="middle" style={serif} fontSize={112} fill={CORAL}>2/3</text>
        </g>
        <g opacity={eio(ramp(F, 662, 672))}>
          <text x={sx - 20} y={640} textAnchor="end" style={serif} fontSize={116} fill={CINK}>Switch</text>
          <path d={`M ${sx + 8},604 L ${sx + 100},604 M ${sx + 72},576 L ${sx + 102},604 L ${sx + 72},632`} stroke={CINK} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x={sx + 128} y={640} textAnchor="start" style={serif} fontSize={116} fill={CINK}>win</text>
        </g>
        <g transform={`translate(1930 880) scale(${pop(F, 676, 12)})`}><text textAnchor="middle" style={serif} fontSize={170} fill={CORAL}>2 out of 3</text></g>
        <SourceLine a="Probability: stay 1/3 · switch 2/3" b="(the host always reveals a goat)" o={eio(ramp(F, 690, 702))} />
      </Card>
    );
  } },
  // G2 · fact card: your first pick only had a 1/3 chance… and that never changed
  { from: 720, to: 834, z0: 1.0, z1: 1.03, render: (f) => {
    const F = f + 720;
    const st = pop(F, 814, 12);
    return (
      <Card label="YOUR FIRST PICK">
        <DoorIcon x={820} y={1100} n={1} w={300} h={450} k={pop(F, 722, 12)} />
        <Padlock x={820} y={860} k={pop(F, 811, 12)} />
        <g transform={`translate(1720 760) scale(${pop(F, 764, 12)})`}><text textAnchor="middle" style={serif} fontSize={260} fill={CINK}>1/3</text></g>
        <text x={1720} y={860} textAnchor="middle" fontFamily={CAPTION_FONT} fontWeight={800} fontSize={60} fill={MUTED} opacity={eio(ramp(F, 780, 790))}>chance</text>
        {st > 0.01 && (
          <g transform={`translate(1720 1060) rotate(-5) scale(${st})`}>
            <rect x={-330} y={-92} width={660} height={140} rx={22} fill="none" stroke={CORAL} strokeWidth={8} />
            <text x={0} y={18} textAnchor="middle" style={serif} fontSize={92} fill={CORAL}>never changed</text>
          </g>
        )}
        <SourceLine a="Probability: stay 1/3 · switch 2/3" b="(the host always reveals a goat)" o={eio(ramp(F, 730, 742))} />
      </Card>
    );
  } },
  // H · wide payoff: you switch to door 2 → the car. Confetti
  { from: 834, to: 880, z0: 1.0, z1: 1.06, fx: CX, fy: 860, render: (f) => {
    const F = f + 834;
    const o = eout(ramp(F, 836, 850));
    const up = F > 846;
    const doors = doorsWith([{ lit: 0.5 }, { lit: 1, open: o, glow: 0.6 * ramp(F, 842, 852) }, { lit: 0.5, open: 1 }]);
    return (
      <g>
        <Stage f={F} doors={doors} spotX={CX} />
        <Glint x={1340} y={DOOR_BOT - 130} t={ramp(F, 848, 870)} r={60} />
        <You x={470} y={GROUND} s={1.3} mood={up ? "happy" : "surprised"} look={[12, -8]} blink={blinkAt(F, 9)} armL={up ? 160 : -10} elbowL={up ? -20 : 0} armR={up ? 165 : 95} elbowR={up ? -15 : 0} bob={up ? 6 * Math.abs(Math.sin((F - 846) * 0.35)) : 0} />
        <Host x={2090} y={GROUND} s={1.3} facing={-1} mood="happy" look={[10, -6]} blink={blinkAt(F, 11)} armL={up ? 150 : -10} elbowL={up ? -20 : 0} armR={55} elbowR={85} micR={-12} />
        <Confetti t={F - 844} x={CX} y={760} />
        <PickTag f={F} at={-99} text="SWITCHED · DOOR 2" />
      </g>
    );
  } },
  // I · close-up, you on the right third: so… would you switch? (the title takes the left side)
  { from: 880, to: FILM_FRAMES, z0: 1.0, z1: 1.06, fx: 1760, fy: 900, render: (f) => {
    const F = f + 880;
    const doors = doorsWith([{ lit: 0.6 }, { lit: 1, open: 1, glow: 0.4 }, { lit: 0.6, open: 1 }]);
    return (
      <g>
        <StageBG f={F} doors={doors} k={1.7} cx={CX} cy={820} spotX={CX} blur={14} />
        <ConfettiRain f={F} n={50} />
        <You x={1760} y={2130} s={3.4} mood="neutral" look={F > 884 ? [0, 2] : [-10, -4]} headTilt={F > 884 ? -4 : 0} blink={blinkAt(F, 10)} />
      </g>
    );
  } },
];

export const DoorsFilm: React.FC = () => {
  const f = useCurrentFrame();
  const onCard = f >= 497 && f < 834;
  const endCard = eio(ramp(f, 902, 916));
  const fade = Math.max(1 - ramp(f, 0, 8), ramp(f, FILM_FRAMES - 16, FILM_FRAMES - 1));
  return (
    <AbsoluteFill style={{ backgroundColor: NAVY }}>
      <Soundtrack total={FILM_FRAMES} voice={staticFile("projects/stick-doors-story/narration.wav")} voiceEnd={VOICE_END} music="music_suspense" sfx={SFX} />
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <filter id="dof"><feGaussianBlur stdDeviation="7" /></filter>
          <filter id="dof2"><feGaussianBlur stdDeviation="11" /></filter>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="24" /></filter>
          <clipPath id="floorClip"><rect x={0} y={DOOR_BOT} width={VW} height={VH - DOOR_BOT} /></clipPath>
          <linearGradient id="room" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe9b0" /><stop offset="1" stopColor="#e4a95a" /></linearGradient>
          <linearGradient id="floorFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={FLOOR} stopOpacity="0.15" /><stop offset="0.55" stopColor={FLOOR} stopOpacity="0.95" /><stop offset="1" stopColor={FLOOR} stopOpacity="1" /></linearGradient>
          <linearGradient id="spotCone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={SPOT} stopOpacity="0.5" /><stop offset="1" stopColor={SPOT} stopOpacity="0.08" /></linearGradient>
          <radialGradient id="spotPool"><stop offset="0" stopColor={SPOT} stopOpacity="0.45" /><stop offset="1" stopColor={SPOT} stopOpacity="0" /></radialGradient>
          <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stopColor="#05070d" stopOpacity="0" /><stop offset="1" stopColor="#05070d" stopOpacity="0.55" /></radialGradient>
        </defs>
      </svg>
      <Shots f={f} shots={SHOTS} />
      {!onCard && <svg width={VW} height={VH} style={{ position: "absolute", inset: 0 }}><rect width={VW} height={VH} fill="url(#vig)" /></svg>}
      <Captions f={f} words={WORDS} chunks={CHUNKS} hide={onCard || endCard > 0.5} />
      {endCard > 0.01 && (
        <AbsoluteFill style={{ background: `linear-gradient(90deg, rgba(10,12,20,${0.8 * endCard}) 0%, rgba(10,12,20,${0.4 * endCard}) 45%, rgba(10,12,20,0) 68%)`, justifyContent: "center" }}>
          <div style={{ ...serif, fontSize: 230, lineHeight: 1.0, color: "#fbfbf8", opacity: endCard, marginLeft: 220, transform: `translateX(${(1 - endCard) * -40}px)`, textShadow: "0 6px 30px rgba(0,0,0,0.5)" }}>Would you<br />switch?</div>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: fade }} />
    </AbsoluteFill>
  );
};
