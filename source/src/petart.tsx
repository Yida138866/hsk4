// Original pet artwork (inline SVG): bunny, panda, kitten × 5 stages, with outfits, accessories, rooms.
import type { ReactNode } from "./kit";

export type Kind = "bunny" | "panda" | "kitten";
export type Equip = { acc?: string; outfit?: string; room?: string; furn?: string[] };
const INK = "#4a2a52";
const PAL: Record<Kind, { body: string; stroke: string; inner: string; dark: string; egg: string; egg2: string }> = {
  bunny: { body: "#ffffff", stroke: "#f3a7c9", inner: "#ffc2dc", dark: "#ffc2dc", egg: "#ffe3ef", egg2: "#ffb3d1" },
  panda: { body: "#ffffff", stroke: "#cdbfd6", inner: "#f6c6da", dark: "#4b3b55", egg: "#f6f2fa", egg2: "#4b3b55" },
  kitten: { body: "#ffe2c6", stroke: "#f2ad7a", inner: "#ffc2cf", dark: "#f5b58a", egg: "#fff0dd", egg2: "#ffb98a" },
};

function Ears({ k }: { k: Kind }) {
  const p = PAL[k];
  if (k === "bunny") return (<g>
    <ellipse cx="80" cy="38" rx="12" ry="32" transform="rotate(-12 80 38)" fill={p.body} stroke={p.stroke} strokeWidth="3" />
    <ellipse cx="80" cy="40" rx="5.5" ry="21" transform="rotate(-12 80 40)" fill={p.inner} />
    <ellipse cx="120" cy="38" rx="12" ry="32" transform="rotate(12 120 38)" fill={p.body} stroke={p.stroke} strokeWidth="3" />
    <ellipse cx="120" cy="40" rx="5.5" ry="21" transform="rotate(12 120 40)" fill={p.inner} /></g>);
  if (k === "panda") return (<g><circle cx="62" cy="56" r="15" fill={p.dark} /><circle cx="138" cy="56" r="15" fill={p.dark} /></g>);
  return (<g>
    <path d="M58 76 L66 32 L96 54 Z" fill={p.body} stroke={p.stroke} strokeWidth="3" strokeLinejoin="round" /><path d="M66 66 L69 44 L86 56 Z" fill={p.inner} />
    <path d="M142 76 L134 32 L104 54 Z" fill={p.body} stroke={p.stroke} strokeWidth="3" strokeLinejoin="round" /><path d="M134 66 L131 44 L114 56 Z" fill={p.inner} /></g>);
}

function Face({ k, stage, mood }: { k: Kind; stage: number; mood: string }) {
  const p = PAL[k];
  const sad = mood === "miss";
  const big = stage >= 3;
  const eyes = stage === 1 && !sad
    ? <g fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round"><path d="M76 96 q6 -7 12 0" /><path d="M112 96 q6 -7 12 0" /></g>
    : <g>
      <ellipse cx="82" cy="96" rx={big ? 6.5 : 5.5} ry={big ? 8 : 6.5} fill={k === "panda" ? "#fff" : INK} />
      <ellipse cx="118" cy="96" rx={big ? 6.5 : 5.5} ry={big ? 8 : 6.5} fill={k === "panda" ? "#fff" : INK} />
      {k === "panda" ? <g fill={INK}><circle cx="83" cy="97" r="4" /><circle cx="117" cy="97" r="4" /></g> : null}
      <circle cx="84.5" cy="93" r="2.2" fill="#fff" /><circle cx="120.5" cy="93" r="2.2" fill="#fff" />
      {big ? <g stroke={INK} strokeWidth="2" strokeLinecap="round"><path d="M75 89 l-4 -3" /><path d="M76 86 l-2 -4" /><path d="M125 89 l4 -3" /><path d="M124 86 l2 -4" /></g> : null}
    </g>;
  return (
    <g>
      {k === "panda" ? <g fill={p.dark}><ellipse cx="81" cy="97" rx="12" ry="14" transform="rotate(20 81 97)" /><ellipse cx="119" cy="97" rx="12" ry="14" transform="rotate(-20 119 97)" /></g> : null}
      {k === "kitten" ? <g fill="none" stroke="#f0a070" strokeWidth="4" strokeLinecap="round"><path d="M92 50 v10" /><path d="M100 48 v12" /><path d="M108 50 v10" /></g> : null}
      {eyes}
      {sad ? <g stroke={INK} strokeWidth="2.2" strokeLinecap="round" fill="none"><path d="M74 84 l12 4" /><path d="M126 84 l-12 4" /></g> : null}
      <ellipse cx="68" cy="110" rx="8" ry="4.5" fill="#ffb3d1" opacity="0.85" /><ellipse cx="132" cy="110" rx="8" ry="4.5" fill="#ffb3d1" opacity="0.85" />
      <path d="M97 104 l3 3 l3 -3z" fill={k === "kitten" ? "#f48ca8" : INK} />
      {sad ? <path d="M93 116 q7 -5 14 0" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
        : <path d="M92 110 q4 5 8 0 q4 5 8 0" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />}
      {sad ? <path d="M128 104 q3 6 0 9 q-3 -3 0 -9z" fill="#9fd0ff" /> : null}
      {k === "kitten" ? <g stroke="#d99b7a" strokeWidth="1.6" strokeLinecap="round"><path d="M60 104 h-16" /><path d="M60 110 l-15 4" /><path d="M140 104 h16" /><path d="M140 110 l15 4" /></g> : null}
    </g>
  );
}

function Outfit({ id, stage }: { id?: string; stage: number }) {
  if (!id) {
    if (stage === 2) return <g><path d="M78 150 h44 v10 a22 12 0 0 1 -44 0z" fill="#ffd36e" opacity="0.95" /><circle cx="100" cy="152" r="3" fill="#fff" /></g>; // school bib
    if (stage === 3) return <g><path d="M70 136 L100 160 L130 136 L124 132 L100 150 L76 132 Z" fill="#8fb8ff" /><path d="M96 152 l4 10 l4 -10z" fill="#ff7eb6" /></g>; // sailor collar
    if (stage === 4) return <g><path d="M64 140 Q100 128 136 140 L142 196 Q100 204 58 196 Z" fill="#6c4f9e" /><path d="M86 132 L100 150 L114 132" fill="#fff" stroke="#e7d9ff" strokeWidth="2" /></g>; // gown
    return null;
  }
  if (id === "aodai") return <g><path d="M74 132 Q100 124 126 132 L132 200 L108 200 L100 168 L92 200 L68 200 Z" fill="#ff8cc0" /><path d="M92 128 h16 v8 h-16z" fill="#ffd1e6" /><g fill="#fff" opacity="0.8"><circle cx="90" cy="150" r="3" /><circle cx="112" cy="160" r="2.5" /><circle cx="98" cy="176" r="2" /></g><path d="M78 200 l6 -24 M122 200 l-6 -24" stroke="#ffd1e6" strokeWidth="2" /></g>;
  if (id === "dress") return <g><path d="M78 134 h44 l14 56 q-36 12 -72 0z" fill="#c58bff" /><path d="M66 186 q34 12 68 0" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="4 4" /><circle cx="100" cy="146" r="4" fill="#ffd36e" /></g>;
  if (id === "hoodie") return <g><path d="M66 140 Q100 126 134 140 L136 186 Q100 196 64 186 Z" fill="#7ad8c8" /><path d="M86 160 h28 v12 h-28z" fill="#5cc0b0" /><path d="M92 136 v14 M108 136 v14" stroke="#fff" strokeWidth="2.5" /></g>;
  if (id === "scarf") return <g><path d="M70 132 Q100 146 130 132 L130 142 Q100 156 70 142 Z" fill="#ff6f91" /><path d="M116 142 l8 30 l-12 2 l-4 -28z" fill="#ff6f91" /><path d="M114 172 l10 0" stroke="#fff" strokeWidth="2" /></g>;
  return null;
}

function Acc({ id, k }: { id?: string; k: Kind }) {
  const top = k === "panda" ? 46 : 50;
  if (id === "bow") return <g transform="translate(100 140)"><path d="M0 0 l-18 -11 v22z M0 0 l18 -11 v22z" fill="#ff5fa2" /><circle r="5.5" fill="#ff8cc0" /></g>;
  if (id === "glasses") return <g fill="rgba(255,255,255,0.25)" stroke="#8f2160" strokeWidth="3"><circle cx="82" cy="96" r="13" /><circle cx="118" cy="96" r="13" /><path d="M95 96 h10" /></g>;
  if (id === "crown") return <g>{[66, 82, 100, 118, 134].map((x, i) => <g key={x}><circle cx={x} cy={top + (i % 2 ? -2 : 2)} r="7" fill={["#ff8cc0", "#ffd36e", "#c58bff", "#7ad8c8", "#ff8cc0"][i]} /><circle cx={x} cy={top + (i % 2 ? -2 : 2)} r="2.5" fill="#fff" /></g>)}</g>;
  if (id === "beret") return <g><ellipse cx="96" cy={top - 2} rx="38" ry="13" fill="#e8559a" /><circle cx="96" cy={top - 15} r="4" fill="#e8559a" /></g>;
  return null;
}

export function Room({ id, furn, children }: { id?: string; furn?: string[]; children?: ReactNode }) {
  const bg: Record<string, ReactNode> = {
    sakura: <g><rect width="200" height="220" fill="#ffe8f1" />{[[30, 30], [160, 50], [90, 18], [40, 120], [170, 140]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`} fill="#ffb3d1">{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy="-5" rx="3.5" ry="6" transform={`rotate(${a})`} />)}<circle r="2" fill="#fff" /></g>)}</g>,
    night: <g><rect width="200" height="220" fill="#4b3b78" />{[[20, 20], [60, 50], [150, 25], [180, 70], [100, 15], [30, 90]].map(([x, y], i) => <path key={i} d={`M${x} ${y - 5} l1.6 3.4 l3.4 1.6 l-3.4 1.6 l-1.6 3.4 l-1.6 -3.4 l-3.4 -1.6 l3.4 -1.6z`} fill="#ffe28a" />)}<circle cx="165" cy="40" r="14" fill="#fff6c8" /><circle cx="171" cy="35" r="12" fill="#4b3b78" /></g>,
    beach: <g><rect width="200" height="130" fill="#bfe8ff" /><rect y="130" width="200" height="90" fill="#ffe7b8" /><path d="M0 128 q25 -10 50 0 t50 0 t50 0 t50 0 v10 h-200z" fill="#7fd0f0" /><circle cx="160" cy="36" r="16" fill="#ffd36e" /></g>,
  };
  return (
    <svg viewBox="0 0 200 220" width="100%" height="100%" aria-hidden="true" style={{ display: "block" }}>
      <defs><linearGradient id="rbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff3f9" /><stop offset="1" stopColor="#f3e8ff" /></linearGradient></defs>
      {id && bg[id] ? bg[id] : <rect width="200" height="220" fill="url(#rbg)" />}
      <ellipse cx="100" cy="206" rx="80" ry="10" fill="rgba(143,33,96,0.08)" />
      {furn?.includes("plant") ? <g><path d="M18 205 h22 l-3 -22 h-16z" fill="#f2a679" /><path d="M29 184 q-14 -18 -4 -32 q8 14 4 32 q4 -22 16 -26 q0 18 -16 26" fill="#6ccf9a" /></g> : null}
      {furn?.includes("lamp") ? <g><path d="M170 206 h18 M179 206 v-50" stroke="#c58bff" strokeWidth="4" strokeLinecap="round" /><path d="M164 160 h30 l-6 -20 h-18z" fill="#ffd36e" /></g> : null}
      {furn?.includes("desk") ? <g><rect x="140" y="178" width="58" height="8" rx="3" fill="#e0a87a" /><path d="M146 186 v20 M192 186 v20" stroke="#c98c5e" strokeWidth="5" /><rect x="152" y="166" width="14" height="12" rx="2" fill="#ff8cc0" /><rect x="168" y="170" width="18" height="8" rx="2" fill="#8fb8ff" /></g> : null}
      {children}
    </svg>
  );
}

export function PetArt({ kind, stage, mood = "ok", equip = {}, anim = true }: { kind: Kind; stage: number; mood?: string; equip?: Equip; anim?: boolean }) {
  const p = PAL[kind];
  if (stage <= 0) {
    return (
      <g className={anim ? "pet-wobble" : undefined} style={{ transformOrigin: "100px 200px" }}>
        <ellipse cx="100" cy="150" rx="46" ry="56" fill={p.egg} stroke={p.stroke} strokeWidth="3" />
        {kind === "bunny" ? <g fill={p.egg2}><ellipse cx="80" cy="130" rx="7" ry="11" /><ellipse cx="118" cy="160" rx="9" ry="7" /><circle cx="96" cy="182" r="5" /></g> : null}
        {kind === "panda" ? <g fill={p.egg2}><circle cx="78" cy="132" r="9" /><circle cx="122" cy="128" r="7" /><circle cx="108" cy="176" r="8" /></g> : null}
        {kind === "kitten" ? <g fill="none" stroke={p.egg2} strokeWidth="6" strokeLinecap="round"><path d="M64 140 q36 -12 72 0" /><path d="M60 162 q40 -12 80 0" /></g> : null}
        <path d="M86 102 l6 8 l-6 6 l8 6" fill="none" stroke={p.stroke} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M84 196 q16 6 32 0" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="6" />
      </g>
    );
  }
  const s = stage === 1 ? 0.66 : stage === 2 ? 0.84 : 1;
  const limb = kind === "panda" ? p.dark : p.body;
  return (
    <g className={anim ? "pet-bounce" : undefined} style={{ transformOrigin: "100px 205px" }}>
      <g transform={`translate(100 205) scale(${s}) translate(-100 -205)`}>
        {kind === "kitten" ? <path d="M134 176 q34 -6 26 -40" fill="none" stroke={p.stroke} strokeWidth="11" strokeLinecap="round" /> : null}
        {kind === "kitten" ? <path d="M134 176 q34 -6 26 -40" fill="none" stroke={p.body} strokeWidth="6" strokeLinecap="round" /> : null}
        {kind === "bunny" ? <circle cx="136" cy="178" r="9" fill="#fff" stroke={p.stroke} strokeWidth="2.5" /> : null}
        <ellipse cx="82" cy="198" rx="13" ry="8" fill={limb} stroke={p.stroke} strokeWidth="2.5" />
        <ellipse cx="118" cy="198" rx="13" ry="8" fill={limb} stroke={p.stroke} strokeWidth="2.5" />
        <ellipse cx="100" cy="164" rx="38" ry="36" fill={p.body} stroke={p.stroke} strokeWidth="3" />
        <ellipse cx="100" cy="172" rx="22" ry="20" fill={kind === "kitten" ? "#fff3e6" : "#fff7fb"} />
        <Outfit id={equip.outfit} stage={stage} />
        <ellipse cx="62" cy="156" rx="10" ry="15" transform="rotate(25 62 156)" fill={limb} stroke={p.stroke} strokeWidth="2.5" />
        <ellipse cx="138" cy="156" rx="10" ry="15" transform="rotate(-25 138 156)" fill={limb} stroke={p.stroke} strokeWidth="2.5" />
        {stage === 4 ? <g transform="translate(140 150) rotate(-20)"><rect x="-6" y="-16" width="12" height="32" rx="5" fill="#fff8e1" stroke="#e2c27a" strokeWidth="2" /><path d="M-6 0 h12" stroke="#ff5fa2" strokeWidth="3" /></g> : null}
        <Ears k={kind} />
        <circle cx="100" cy="94" r="48" fill={p.body} stroke={p.stroke} strokeWidth="3" />
        <Face k={kind} stage={stage} mood={mood} />
        {stage === 2 && !equip.acc ? <g><ellipse cx="100" cy="52" rx="30" ry="9" fill="#ffd36e" /><path d="M76 52 q24 -26 48 0" fill="#ffd36e" /></g> : null}
        {stage === 3 && !equip.acc ? <path d="M93 46 q7 -14 14 0 q-7 6 -14 0z" fill="#ff8cc0" /> : null}
        <Acc id={equip.acc} k={kind} />
        {stage === 4 ? <g><path d="M60 46 L100 30 L140 46 L100 62 Z" fill="#3b2c55" /><rect x="84" y="50" width="32" height="12" rx="3" fill="#3b2c55" /><path d="M138 47 v20" stroke="#ffd36e" strokeWidth="2.5" /><circle cx="138" cy="69" r="4" fill="#ffd36e" /></g> : null}
        {stage === 1 ? <g><path d="M50 196 q50 22 100 0 l-8 -16 l-10 8 l-10 -10 l-12 10 l-10 -10 l-12 10 l-10 -10 l-10 8z" fill={p.egg} stroke={p.stroke} strokeWidth="2.5" strokeLinejoin="round" /></g> : null}
      </g>
      {mood === "miss" ? <g><circle cx="160" cy="48" r="4" fill="#fff" stroke={p.stroke} /><circle cx="170" cy="34" r="6" fill="#fff" stroke={p.stroke} /><ellipse cx="174" cy="16" rx="22" ry="13" fill="#fff" stroke={p.stroke} strokeWidth="2" /><path d="M164 18 q10 8 20 0" fill="#ffd36e" stroke="#e2a840" /><path d="M166 14 h16" stroke="#e2a840" strokeWidth="2" /></g> : null}
    </g>
  );
}
