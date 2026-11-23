// Original pet artwork (inline SVG): bunny, panda, grey kitten, tiger, dragon, puppy × 5 stages, with outfits, accessories, rooms.
import { useState, useEffect, useRef } from "./kit";
import type { ReactNode } from "./kit";

export type Kind = "bunny" | "panda" | "kitten" | "tiger" | "dragon" | "puppy";
export const KINDS: Kind[] = ["bunny", "panda", "kitten", "tiger", "dragon", "puppy"];
export type Equip = { acc?: string; outfit?: string; room?: string; furn?: string[]; hold?: string };
const INK = "#4a2a52";
type Pal = { body: string; stroke: string; inner: string; dark: string; egg: string; egg2: string; belly: string; nose: string; mark: string };
const PAL: Record<Kind, Pal> = {
  bunny: { body: "#ffffff", stroke: "#f3a7c9", inner: "#ffc2dc", dark: "#ffc2dc", egg: "#ffe3ef", egg2: "#ffb3d1", belly: "#fff7fb", nose: INK, mark: "" },
  panda: { body: "#ffffff", stroke: "#cdbfd6", inner: "#f6c6da", dark: "#4b3b55", egg: "#f6f2fa", egg2: "#4b3b55", belly: "#fff7fb", nose: INK, mark: "" },
  kitten: { body: "#dedce8", stroke: "#a19db8", inner: "#ffc2cf", dark: "#b3afc7", egg: "#efeef6", egg2: "#b3afc7", belly: "#f6f5fa", nose: "#f48ca8", mark: "#a19db8" },
  tiger: { body: "#ffc77e", stroke: "#e89a4c", inner: "#fff3df", dark: "#8a5638", egg: "#fff0d6", egg2: "#f2a65a", belly: "#fff6e8", nose: "#f48ca8", mark: "#8a5638" },
  dragon: { body: "#a6e8cf", stroke: "#5dbf9c", inner: "#fff4c8", dark: "#5dbf9c", egg: "#e4f8ef", egg2: "#7fd4b4", belly: "#fff4c8", nose: INK, mark: "#ff7eb6" },
  puppy: { body: "#fff3e2", stroke: "#dcb487", inner: "#c98c5e", dark: "#c98c5e", egg: "#fff6ea", egg2: "#d9a77a", belly: "#ffffff", nose: INK, mark: "#c98c5e" },
};

function Ears({ k }: { k: Kind }) {
  const p = PAL[k];
  if (k === "bunny") return (<g>
    <ellipse cx="80" cy="38" rx="12" ry="32" transform="rotate(-12 80 38)" fill={p.body} stroke={p.stroke} strokeWidth="3" />
    <ellipse cx="80" cy="40" rx="5.5" ry="21" transform="rotate(-12 80 40)" fill={p.inner} />
    <ellipse cx="120" cy="38" rx="12" ry="32" transform="rotate(12 120 38)" fill={p.body} stroke={p.stroke} strokeWidth="3" />
    <ellipse cx="120" cy="40" rx="5.5" ry="21" transform="rotate(12 120 40)" fill={p.inner} /></g>);
  if (k === "panda") return (<g><circle cx="62" cy="56" r="15" fill={p.dark} /><circle cx="138" cy="56" r="15" fill={p.dark} /></g>);
  if (k === "tiger") return (<g>
    <circle cx="64" cy="58" r="16" fill={p.body} stroke={p.stroke} strokeWidth="3" /><circle cx="64" cy="60" r="8" fill={p.inner} />
    <circle cx="136" cy="58" r="16" fill={p.body} stroke={p.stroke} strokeWidth="3" /><circle cx="136" cy="60" r="8" fill={p.inner} /></g>);
  if (k === "dragon") return (<g>
    <g fill="none" stroke="#f2b84b" strokeWidth="6" strokeLinecap="round"><path d="M80 56 L72 22" /><path d="M75 36 L64 30" /><path d="M120 56 L128 22" /><path d="M125 36 L136 30" /></g>
    <g fill="#ffd36e"><circle cx="72" cy="22" r="4" /><circle cx="128" cy="22" r="4" /></g>
    <path d="M56 84 q-16 -6 -18 -20 q14 0 22 10z" fill={p.body} stroke={p.stroke} strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M144 84 q16 -6 18 -20 q-14 0 -22 10z" fill={p.body} stroke={p.stroke} strokeWidth="2.5" strokeLinejoin="round" /></g>);
  if (k === "puppy") return null; // floppy ears are drawn in front of the head
  return (<g>
    <path d="M58 76 L66 32 L96 54 Z" fill={p.body} stroke={p.stroke} strokeWidth="3" strokeLinejoin="round" /><path d="M66 66 L69 44 L86 56 Z" fill={p.inner} />
    <path d="M142 76 L134 32 L104 54 Z" fill={p.body} stroke={p.stroke} strokeWidth="3" strokeLinejoin="round" /><path d="M134 66 L131 44 L114 56 Z" fill={p.inner} /></g>);
}
function EarsFront({ k }: { k: Kind }) {
  const p = PAL[k];
  if (k === "puppy") return (<g fill={p.dark} stroke="#b07548" strokeWidth="2.5">
    <path d="M60 60 q-14 6 -12 40 q2 14 12 10 q8 -4 10 -22 q2 -18 -2 -26z" /><path d="M140 60 q14 6 12 40 q-2 14 -12 10 q-8 -4 -10 -22 q-2 -18 2 -26z" /></g>);
  if (k === "dragon") return (<g fill={p.mark}><path d="M88 50 q4 -14 12 -16 q-2 8 0 16z" /><path d="M100 48 q6 -14 14 -14 q-4 8 -4 16z" /><path d="M84 54 q-6 -10 -2 -18 q4 8 10 12z" /></g>);
  return null;
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
  const whisk = k === "kitten" || k === "tiger";
  return (
    <g className="pet-face">
      {k === "panda" ? <g fill={p.dark}><ellipse cx="81" cy="97" rx="12" ry="14" transform="rotate(20 81 97)" /><ellipse cx="119" cy="97" rx="12" ry="14" transform="rotate(-20 119 97)" /></g> : null}
      {k === "puppy" ? <ellipse cx="119" cy="95" rx="14" ry="13" fill={p.dark} opacity="0.55" /> : null}
      {k === "kitten" ? <g fill="none" stroke={p.mark} strokeWidth="4" strokeLinecap="round"><path d="M92 50 v10" /><path d="M100 48 v12" /><path d="M108 50 v10" /></g> : null}
      {k === "tiger" ? <g fill="none" stroke={p.mark} strokeWidth="3.2" strokeLinecap="round"><path d="M90 56 h20" /><path d="M92 63 h16" /><path d="M100 54 v16" /><path d="M90 70 h20" /><path d="M54 92 l10 3" /><path d="M54 100 l9 1" /><path d="M146 92 l-10 3" /><path d="M146 100 l-9 1" /></g> : null}
      {k === "dragon" || k === "puppy" || k === "tiger" ? <ellipse cx="100" cy="110" rx="17" ry="11" fill={k === "dragon" ? p.belly : "#ffffff"} opacity="0.9" /> : null}
      <g className="pet-eyes">{eyes}</g>
      {sad ? <g stroke={INK} strokeWidth="2.2" strokeLinecap="round" fill="none"><path d="M74 84 l12 4" /><path d="M126 84 l-12 4" /></g> : null}
      <ellipse cx="68" cy="110" rx="8" ry="4.5" fill="#ffb3d1" opacity="0.85" /><ellipse cx="132" cy="110" rx="8" ry="4.5" fill="#ffb3d1" opacity="0.85" />
      {k === "dragon" ? <g fill={INK}><circle cx="96" cy="105" r="1.6" /><circle cx="104" cy="105" r="1.6" /></g>
        : k === "puppy" ? <ellipse cx="100" cy="105" rx="5" ry="3.6" fill={INK} />
        : <path d="M97 104 l3 3 l3 -3z" fill={p.nose} />}
      {sad ? <path d="M93 116 q7 -5 14 0" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
        : <path d="M92 110 q4 5 8 0 q4 5 8 0" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />}
      {k === "puppy" && !sad ? <path d="M101 113 q3 7 7 1z" fill="#ff8fb0" /> : null}
      {sad ? <path d="M128 104 q3 6 0 9 q-3 -3 0 -9z" fill="#9fd0ff" /> : null}
      {whisk ? <g stroke={k === "tiger" ? "#c98b5a" : "#8f8aa8"} strokeWidth="1.6" strokeLinecap="round"><path d="M60 104 h-16" /><path d="M60 110 l-15 4" /><path d="M140 104 h16" /><path d="M140 110 l15 4" /></g> : null}
      {k === "dragon" ? <g fill="none" stroke="#f2b84b" strokeWidth="2.2" strokeLinecap="round"><path d="M92 106 q-22 -2 -34 8 q-8 8 2 10" /><path d="M108 106 q22 -2 34 8 q8 8 -2 10" /></g> : null}
      <ellipse className="pet-blush-x" cx="68" cy="112" rx="11" ry="7" fill="#ff7eae" />
      <ellipse className="pet-blush-x" cx="132" cy="112" rx="11" ry="7" fill="#ff7eae" />
      <ellipse className="pet-yawn" cx="100" cy="118" rx="6.5" ry="8" fill="#4a2a52" />
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
  if (id === "aodai_red") return <g><path d="M74 132 Q100 124 126 132 L132 200 L108 200 L100 168 L92 200 L68 200 Z" fill="#e8384f" /><path d="M92 128 h16 v8 h-16z" fill="#ffd36e" /><g fill="#ffd36e"><circle cx="90" cy="150" r="3.2" /><circle cx="112" cy="158" r="2.6" /><circle cx="98" cy="176" r="2.2" /><path d="M106 144 l2 4 l4 0 l-3 3 l1 4 l-4 -2 l-4 2 l1 -4 l-3 -3 l4 0z" /></g><path d="M78 200 l6 -24 M122 200 l-6 -24" stroke="#ffd36e" strokeWidth="2" /></g>;
  if (id === "aodai_white") return <g><path d="M74 132 Q100 124 126 132 L132 200 L108 200 L100 168 L92 200 L68 200 Z" fill="#ffffff" stroke="#bfe0ff" strokeWidth="2" /><path d="M92 128 h16 v8 h-16z" fill="#e3f1ff" /><g fill="#9cc8f5" opacity="0.8"><circle cx="90" cy="152" r="3" /><circle cx="110" cy="164" r="2.5" /><circle cx="96" cy="182" r="2" /></g><path d="M78 200 l6 -24 M122 200 l-6 -24" stroke="#bfe0ff" strokeWidth="2" /></g>;
  if (id === "aodai") return <g><path d="M74 132 Q100 124 126 132 L132 200 L108 200 L100 168 L92 200 L68 200 Z" fill="#ff8cc0" /><path d="M92 128 h16 v8 h-16z" fill="#ffd1e6" /><g fill="#fff" opacity="0.8"><circle cx="90" cy="150" r="3" /><circle cx="112" cy="160" r="2.5" /><circle cx="98" cy="176" r="2" /></g><path d="M78 200 l6 -24 M122 200 l-6 -24" stroke="#ffd1e6" strokeWidth="2" /></g>;
  if (id === "dress") return <g><path d="M78 134 h44 l14 56 q-36 12 -72 0z" fill="#c58bff" /><path d="M66 186 q34 12 68 0" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="4 4" /><circle cx="100" cy="146" r="4" fill="#ffd36e" /></g>;
  if (id === "hoodie") return <g><path d="M66 140 Q100 126 134 140 L136 186 Q100 196 64 186 Z" fill="#7ad8c8" /><path d="M86 160 h28 v12 h-28z" fill="#5cc0b0" /><path d="M92 136 v14 M108 136 v14" stroke="#fff" strokeWidth="2.5" /></g>;
  if (id === "scarf") return <g><path d="M70 132 Q100 146 130 132 L130 142 Q100 156 70 142 Z" fill="#ff6f91" /><path d="M116 142 l8 30 l-12 2 l-4 -28z" fill="#ff6f91" /><path d="M114 172 l10 0" stroke="#fff" strokeWidth="2" /></g>;
  return null;
}

function Acc({ id, k }: { id?: string; k: Kind }) {
  const top = k === "panda" ? 46 : k === "dragon" ? 44 : 50;
  if (id === "bow") return <g transform="translate(100 140)"><path d="M0 0 l-18 -11 v22z M0 0 l18 -11 v22z" fill="#ff5fa2" /><circle r="5.5" fill="#ff8cc0" /></g>;
  if (id === "glasses") return <g fill="rgba(255,255,255,0.25)" stroke="#8f2160" strokeWidth="3"><circle cx="82" cy="96" r="13" /><circle cx="118" cy="96" r="13" /><path d="M95 96 h10" /></g>;
  if (id === "crown") return <g>{[66, 82, 100, 118, 134].map((x, i) => <g key={x}><circle cx={x} cy={top + (i % 2 ? -2 : 2)} r="7" fill={["#ff8cc0", "#ffd36e", "#c58bff", "#7ad8c8", "#ff8cc0"][i]} /><circle cx={x} cy={top + (i % 2 ? -2 : 2)} r="2.5" fill="#fff" /></g>)}</g>;
  if (id === "heartglasses") return <g fill="rgba(255,120,170,0.35)" stroke="#e8385f" strokeWidth="3" strokeLinejoin="round"><path d="M82 108 l-12 -12 a7 7 0 0 1 12 -7 a7 7 0 0 1 12 7z" /><path d="M118 108 l-12 -12 a7 7 0 0 1 12 -7 a7 7 0 0 1 12 7z" /><path d="M94 96 h12" /></g>;
  if (id === "bunnyears") return <g><path d={`M64 ${top + 4} q36 -16 72 0`} fill="none" stroke="#f2b84b" strokeWidth="4" /><ellipse cx="84" cy={top - 16} rx="7" ry="18" transform={`rotate(-14 84 ${top - 16})`} fill="#fff" stroke="#e7d6ef" strokeWidth="2" /><ellipse cx="116" cy={top - 16} rx="7" ry="18" transform={`rotate(14 116 ${top - 16})`} fill="#fff" stroke="#e7d6ef" strokeWidth="2" /><ellipse cx="84" cy={top - 15} rx="3" ry="11" transform={`rotate(-14 84 ${top - 15})`} fill="#ffc2dc" /><ellipse cx="116" cy={top - 15} rx="3" ry="11" transform={`rotate(14 116 ${top - 15})`} fill="#ffc2dc" /></g>;
  if (id === "hairpin") return <g transform={`translate(128 ${top + 10}) rotate(-30)`}><rect x="-2" y="-2" width="34" height="4" rx="2" fill="#e2b04a" /><g fill="#ff8cc0">{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy="-5" rx="3.6" ry="5.5" transform={`rotate(${a})`} />)}</g><circle r="2.6" fill="#ffd36e" /><path d="M8 2 v10 M14 2 v7" stroke="#c58bff" strokeWidth="1.6" /></g>;
  if (id === "tiara") return <g><path d={`M74 ${top + 4} L80 ${top - 12} L90 ${top - 2} L100 ${top - 18} L110 ${top - 2} L120 ${top - 12} L126 ${top + 4} Z`} fill="#ffd36e" stroke="#e2a840" strokeWidth="2" strokeLinejoin="round" /><circle cx="100" cy={top - 6} r="3.5" fill="#ff5fa2" /><circle cx="84" cy={top - 2} r="2.4" fill="#8fb8ff" /><circle cx="116" cy={top - 2} r="2.4" fill="#8fb8ff" /></g>;
  if (id === "nonla") return <g><path d={`M46 ${top + 6} L100 ${top - 32} L154 ${top + 6} Q100 ${top + 16} 46 ${top + 6} Z`} fill="#f6dfa4" stroke="#d8b46a" strokeWidth="2.5" strokeLinejoin="round" /><path d={`M70 ${top - 10} L130 ${top - 10} M60 ${top - 2} L140 ${top - 2}`} stroke="#e6c27e" strokeWidth="1.6" /><path d={`M58 ${top + 8} q42 10 84 0`} fill="none" stroke="#ff8cc0" strokeWidth="3" /></g>;
  if (id === "santahat") return <g><path d={`M64 ${top + 4} Q90 ${top - 40} 138 ${top - 30} Q120 ${top - 14} 136 ${top + 4} Z`} fill="#e8384f" /><circle cx="140" cy={top - 30} r="7" fill="#fff" /><rect x="60" y={top - 2} width="80" height="12" rx="6" fill="#fff" /></g>;
  if (id === "beret") return <g><ellipse cx="96" cy={top - 2} rx="38" ry="13" fill="#e8559a" /><circle cx="96" cy={top - 15} r="4" fill="#e8559a" /></g>;
  return null;
}

export function Hold({ id }: { id?: string }) {
  if (!id) return null;
  const g = (c: ReactNode) => <g transform="translate(50 150)">{c}</g>;
  if (id === "lixi") return g(<g transform="rotate(-12)"><rect x="-11" y="-16" width="22" height="30" rx="3" fill="#e8384f" stroke="#c22a3f" strokeWidth="1.5" /><path d="M-11 -10 q11 9 22 0" fill="none" stroke="#ffd36e" strokeWidth="2" /><circle cx="0" cy="2" r="5" fill="#ffd36e" /><circle cx="0" cy="2" r="2" fill="#e8384f" /></g>);
  if (id === "lantern") return g(<g><path d="M0 -34 v8" stroke="#a0507f" strokeWidth="2" /><rect x="-7" y="-27" width="14" height="5" rx="2" fill="#ffd36e" /><ellipse cx="0" cy="-10" rx="15" ry="14" fill="#ff5a5a" /><path d="M-9 -22 q-4 12 0 24 M9 -22 q4 12 0 24 M0 -24 v28" stroke="#ffb0a0" strokeWidth="1.4" fill="none" /><rect x="-7" y="3" width="14" height="5" rx="2" fill="#ffd36e" /><path d="M0 8 v12 M-3 10 v9 M3 10 v9" stroke="#ffd36e" strokeWidth="1.6" /></g>);
  if (id === "fan") return g(<g transform="rotate(-15)"><path d="M0 4 v24" stroke="#c98c5e" strokeWidth="3" strokeLinecap="round" /><circle r="15" fill="#fff4fb" stroke="#ff8cc0" strokeWidth="2.5" /><circle cx="-4" cy="-3" r="4" fill="#ffb3d1" /><circle cx="5" cy="2" r="3" fill="#c58bff" opacity="0.7" /><path d="M-8 7 q8 -4 14 2" stroke="#7ad8c8" strokeWidth="1.8" fill="none" /></g>);
  if (id === "rose") return g(<g transform="rotate(-10)"><path d="M0 0 v30" stroke="#5cb874" strokeWidth="3" strokeLinecap="round" /><path d="M0 14 q-10 -4 -12 4 q8 2 12 -4" fill="#6ccf9a" /><circle cx="0" cy="-4" r="9" fill="#e8384f" /><path d="M-5 -6 q5 -6 10 0 q-5 5 -10 0" fill="#ff6f7f" /><path d="M-3 -3 q3 3 6 0" stroke="#b8213a" strokeWidth="1.4" fill="none" /></g>);
  if (id === "bouquet") return g(<g><path d="M-14 4 L0 32 L14 4 Z" fill="#c58bff" /><path d="M-14 4 L0 32 L14 4" fill="none" stroke="#a46be0" strokeWidth="1.5" /><path d="M-4 22 l4 4 l4 -4" fill="#ffd36e" />{[[-8, -6, "#ff8cc0"], [0, -12, "#ffd36e"], [8, -6, "#ff6f91"]].map(([x, y, c], i) => <g key={i}><path d={`M${x} ${Number(y) + 6} V6`} stroke="#5cb874" strokeWidth="2" /><path d={`M${Number(x) - 5} ${y} q0 8 5 8 q5 0 5 -8 l-2.5 3 l-2.5 -4 l-2.5 4z`} fill={String(c)} /></g>)}</g>);
  if (id === "gift") return g(<g><rect x="-13" y="-8" width="26" height="22" rx="3" fill="#7ad8c8" /><rect x="-15" y="-13" width="30" height="7" rx="2" fill="#5cc0b0" /><rect x="-3" y="-13" width="6" height="27" fill="#ff5fa2" /><path d="M0 -13 q-10 -12 -12 -2 q4 4 12 2 q8 2 12 -2 q-2 -10 -12 2" fill="#ff8cc0" /></g>);
  return null;
}


export function usePetAct(opts: { anim?: boolean; lite?: boolean; mood?: string; egg?: boolean; tap?: number; care?: { seq: number; act: string } }) {
  const [act, setAct] = useState("");
  const busy = useRef(false);
  const endT = useRef(0);
  const idleT = useRef(0);
  const reduce = () => typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const play = (name: string, ms: number) => {
    if (!opts.anim || reduce()) return;
    if (endT.current) clearTimeout(endT.current);
    busy.current = true;
    setAct(name);
    endT.current = window.setTimeout(() => { setAct(""); busy.current = false; endT.current = 0; }, ms) as unknown as number;
  };
  useEffect(() => {
    if (!opts.tap || !opts.anim || reduce()) return;
    const pool = opts.egg ? ["eggshake", "eggbounce"]
      : opts.mood === "miss" ? ["shy", "heart", "wiggle", "sway"]
      : opts.lite ? ["hop", "wiggle", "heart"]
      : ["jump", "spin", "wave", "heart", "wiggle", "shy", "roll", "dance", "sparkle"];
    play(pool[Math.floor(Math.random() * pool.length)], opts.egg ? 700 : 950);
  }, [opts.tap]);
  useEffect(() => {
    if (!opts.care?.seq || !opts.anim || reduce()) return;
    play(opts.care.act, 1050);
  }, [opts.care?.seq]);
  useEffect(() => {
    if (!opts.anim || reduce()) return;
    let stop = false;
    const loop = (first: boolean) => {
      const wait = first ? 1000 + Math.random() * 1600
        : (opts.mood === "miss" || opts.lite ? 6500 + Math.random() * 4500 : 3000 + Math.random() * 4000);
      idleT.current = window.setTimeout(() => {
        if (stop) return;
        if (!busy.current) {
          const h = new Date().getHours();
          const night = h >= 21 || h < 6;
          let pool: string[];
          if (opts.egg) pool = ["eggshake", "eggbounce"];
          else if (opts.mood === "miss") pool = ["blink", "look", "sway"];
          else if (opts.lite) pool = ["blink", "sway", "hop"];
          else {
            pool = ["blink", "look", "ears", "hop", "stretch", "sway"];
            if (night) pool.push("yawn");
          }
          play(pool[Math.floor(Math.random() * pool.length)], 900);
        }
        loop(false);
      }, wait) as unknown as number;
    };
    loop(true);
    return () => { stop = true; if (idleT.current) clearTimeout(idleT.current); if (endT.current) clearTimeout(endT.current); };
  }, [opts.anim, opts.lite, opts.mood, opts.egg]);
  return act;
}

export function Room({ id, furn, children }: { id?: string; furn?: string[]; children?: ReactNode }) {
  const bg: Record<string, ReactNode> = {
    sakura: <g><rect width="200" height="220" fill="#ffe8f1" />{[[30, 30], [160, 50], [90, 18], [40, 120], [170, 140]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`} fill="#ffb3d1">{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy="-5" rx="3.5" ry="6" transform={`rotate(${a})`} />)}<circle r="2" fill="#fff" /></g>)}</g>,
    night: <g><rect width="200" height="220" fill="#4b3b78" />{[[20, 20], [60, 50], [150, 25], [180, 70], [100, 15], [30, 90]].map(([x, y], i) => <path key={i} d={`M${x} ${y - 5} l1.6 3.4 l3.4 1.6 l-3.4 1.6 l-1.6 3.4 l-1.6 -3.4 l-3.4 -1.6 l3.4 -1.6z`} fill="#ffe28a" />)}<circle cx="165" cy="40" r="14" fill="#fff6c8" /><circle cx="171" cy="35" r="12" fill="#4b3b78" /></g>,
    tetroom: <g><rect width="200" height="220" fill="#fff1e6" /><rect width="200" height="12" fill="#e8384f" />{[[30, 12], [100, 12], [170, 12]].map(([x, y], i) => <g key={i}><path d={`M${x} ${y} v10`} stroke="#c22a3f" strokeWidth="2" /><ellipse cx={x} cy={y + 22} rx="11" ry="12" fill="#e8384f" /><rect x={x - 5} y={y + 32} width="10" height="4" fill="#ffd36e" /><path d={`M${x} ${y + 36} v8`} stroke="#ffd36e" strokeWidth="2" /></g>)}{[[22, 90], [48, 70], [176, 96], [158, 74], [34, 132], [168, 140]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`} fill="#ffd23f">{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy="-4.5" rx="3.2" ry="5" transform={`rotate(${a})`} />)}<circle r="2" fill="#e8384f" /></g>)}<path d="M10 120 q20 -30 40 -50 M190 120 q-20 -30 -40 -46" stroke="#8a5638" strokeWidth="2.5" fill="none" /></g>,
    moonroom: <g><rect width="200" height="220" fill="#2f3a6b" /><circle cx="140" cy="54" r="30" fill="#fff3c0" /><circle cx="130" cy="46" r="5" fill="#f3e1a0" /><circle cx="150" cy="64" r="4" fill="#f3e1a0" />{[[20, 30], [60, 18], [96, 40], [184, 110], [16, 100]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.8" fill="#fff" />)}{[[36, 70, "#ff8a5a"], [74, 92, "#ffd36e"], [178, 150, "#ff6f91"]].map(([x, y, c], i) => <g key={i}><path d={`M${x} ${Number(y) - 14} v6`} stroke="#ffd36e" strokeWidth="1.5" /><ellipse cx={x} cy={y} rx="9" ry="8" fill={String(c)} /><rect x={Number(x) - 4} y={Number(y) + 7} width="8" height="3" fill="#ffd36e" /></g>)}</g>,
    qixiroom: <g><rect width="200" height="220" fill="#3d2f6b" /><path d="M-10 120 Q100 20 210 70" stroke="rgba(255,255,255,0.25)" strokeWidth="26" fill="none" />{[[20, 22], [70, 50], [120, 30], [170, 18], [40, 110], [160, 110], [100, 80]].map(([x, y], i) => <path key={i} d={`M${x} ${y - 4} l1.3 2.7 l2.7 1.3 l-2.7 1.3 l-1.3 2.7 l-1.3 -2.7 l-2.7 -1.3 l2.7 -1.3z`} fill="#ffe28a" />)}{[[44, 64], [156, 52]].map(([x, y], i) => <path key={i} d={`M${x} ${y + 6} l-8 -8 a5 5 0 0 1 8 -5 a5 5 0 0 1 8 5z`} fill="#ff8cc0" />)}</g>,
    valroom: <g><rect width="200" height="220" fill="#ffe3ee" />{[[24, 30, 10], [160, 40, 14], [92, 18, 8], [36, 120, 12], [176, 128, 9], [130, 90, 7]].map(([x, y, r], i) => <path key={i} d={`M${x} ${y + r} l-${r} -${r} a${r / 2} ${r / 2} 0 0 1 ${r} -${r * 0.7} a${r / 2} ${r / 2} 0 0 1 ${r} ${r * 0.7}z`} fill={i % 2 ? "#ff8cc0" : "#ff5f8f"} opacity="0.8" />)}</g>,
    w38room: <g><rect width="200" height="220" fill="#fff0f6" />{[[26, 60, "#ff8cc0"], [56, 40, "#ffd36e"], [150, 46, "#c58bff"], [178, 80, "#ff6f91"], [30, 140, "#ffb3d1"], [172, 150, "#ffd36e"]].map(([x, y, c], i) => <g key={i}><path d={`M${x} ${Number(y) + 6} v20`} stroke="#6ccf9a" strokeWidth="2.5" /><path d={`M${Number(x) - 6} ${y} q0 10 6 10 q6 0 6 -10 l-3 3 l-3 -5 l-3 5z`} fill={String(c)} /></g>)}<text x="12" y="26" fontSize="16" fontWeight="800" fill="#ff5fa2" opacity="0.7">8/3</text></g>,
    w2010room: <g><rect width="200" height="220" fill="#fff6ec" /><rect y="150" width="200" height="70" fill="#d9f2ea" />{[[40, 160], [150, 170], [100, 186]].map(([x, y], i) => <g key={i}><ellipse cx={x} cy={y + 6} rx="16" ry="5" fill="#7fc9a8" /><path d={`M${x - 9} ${y} q9 -20 9 -20 q0 0 9 20 q-9 6 -18 0z`} fill="#ff9cc6" /><path d={`M${x - 4} ${y} q4 -14 4 -14 q0 0 4 14z`} fill="#ffd1e6" /></g>)}<text x="12" y="26" fontSize="16" fontWeight="800" fill="#ff8cc0" opacity="0.75">20/10</text></g>,
    snowroom: <g><rect width="200" height="220" fill="#dff0ff" /><rect y="170" width="200" height="50" fill="#fff" /><g transform="translate(34 172)"><path d="M0 -70 L22 -20 L-22 -20Z M0 -48 L26 0 L-26 0Z" fill="#5cb874" /><rect x="-4" y="0" width="8" height="8" fill="#a0704a" /><circle cx="0" cy="-72" r="4" fill="#ffd36e" /><circle cx="-8" cy="-30" r="2.5" fill="#ff5f8f" /><circle cx="10" cy="-12" r="2.5" fill="#ffd36e" /></g>{[[70, 30], [120, 60], [170, 24], [150, 110], [90, 120], [190, 150], [60, 90]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill="#fff" />)}</g>,
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

export function PoopSvg({ size = 34 }: { size?: number | string }) {
  return (
    <svg viewBox="0 0 44 46" width={size} height={size} aria-hidden="true" style={{ display: "block" }}>
      <g className="pet-stink" fill="none" stroke="#b987a8" strokeWidth="1.8" strokeLinecap="round">
        <path d="M13 13 q-3 -4 0 -8 q3 -3 0 -6" />
        <path d="M22 11 q-3 -4 0 -8 q3 -3 0 -5" />
        <path d="M31 13 q-3 -4 0 -8 q3 -3 0 -6" />
      </g>
      <path d="M22 14 c3 0 5 2 4 4 c4 0 7 3 6 6 c5 1 8 4 7 9 c-1 4 -6 7 -17 7 c-11 0 -16 -3 -17 -7 c-1 -5 2 -8 7 -9 c-1 -3 2 -6 6 -6 c-1 -2 1 -4 4 -4z" fill="#9e6b47" stroke="#6f462b" strokeWidth="2" strokeLinejoin="round" />
      <path d="M15 27 q6 -2 14 0" fill="none" stroke="#c7956d" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <circle cx="17.5" cy="30" r="1.8" fill="#4a2a52" />
      <circle cx="26.5" cy="30" r="1.8" fill="#4a2a52" />
      <ellipse cx="14.5" cy="32.5" rx="2.2" ry="1.2" fill="#ff9cc6" opacity="0.75" />
      <ellipse cx="29.5" cy="32.5" rx="2.2" ry="1.2" fill="#ff9cc6" opacity="0.75" />
      <path d="M20 33 q2 2 4 0" fill="none" stroke="#4a2a52" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function PetArt({ kind, stage, mood = "ok", equip = {}, anim = true, act = "", lite = false, dirty = false }: { kind: Kind; stage: number; mood?: string; equip?: Equip; anim?: boolean; act?: string; lite?: boolean; dirty?: boolean }) {
  const p = PAL[kind];
  const moveCls = [lite ? "pet-lite" : "", mood === "miss" ? "pet-sad" : "", act ? "pet-act-" + act + " pet-busy" : "", "pet-move"].filter(Boolean).join(" ");
  const fx = (
    <g className="pet-fx" aria-hidden>
      <g className="pet-fx-heart" fill="#ff6b9d">
        <path className="pet-fx-bit" d="M72 70 c0-6 8-8 11-3 c3-5 11-3 11 3 c0 8-11 14-11 14 s-11-6-11-14z" />
        <path className="pet-fx-bit" d="M102 54 c0-7 9-9 13-3 c4-6 13-4 13 3 c0 9-13 16-13 16 s-13-7-13-16z" />
        <path className="pet-fx-bit" d="M128 74 c0-5 7-7 9-3 c2-4 9-2 9 3 c0 7-9 12-9 12 s-9-5-9-12z" />
      </g>
      <g className="pet-fx-spark" fill="#ffd36e" stroke="#f0b84a" strokeWidth="0.8">
        <path className="pet-fx-bit" d="M64 62 l2 6 l6 2 l-6 2 l-2 6 l-2-6 l-6-2 l6-2z" />
        <path className="pet-fx-bit" d="M108 46 l3 8 l8 3 l-8 3 l-3 8 l-3-8 l-8-3 l8-3z" />
        <path className="pet-fx-bit" d="M140 66 l2 6 l6 2 l-6 2 l-2 6 l-2-6 l-6-2 l6-2z" />
      </g>
      <g className="pet-fx-crumbs">
        <circle className="pet-fx-bit" cx="84" cy="120" r="3.4" fill="#ffb86c" />
        <circle className="pet-fx-bit" cx="116" cy="118" r="3.8" fill="#ff8cc0" />
        <rect className="pet-fx-bit" x="92" y="126" width="5" height="5" rx="1.5" fill="#ffd36e" />
        <circle className="pet-fx-bit" cx="106" cy="128" r="3" fill="#f7a072" />
      </g>
      <g className="pet-fx-bubbles">
        <g className="pet-fx-bit"><circle cx="66" cy="116" r="8" fill="rgba(180,238,255,0.65)" stroke="#88d8f5" strokeWidth="1.6" /><path d="M63 112 a3 3 0 0 1 4 -1" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" fill="none" /></g>
        <g className="pet-fx-bit"><circle cx="136" cy="108" r="9.5" fill="rgba(195,244,255,0.65)" stroke="#88d8f5" strokeWidth="1.6" /><path d="M132 103 a3.5 3.5 0 0 1 5 -1" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" fill="none" /></g>
        <g className="pet-fx-bit"><circle cx="96" cy="84" r="6.5" fill="rgba(210,248,255,0.7)" stroke="#9ae2fa" strokeWidth="1.4" /></g>
        <g className="pet-fx-bit"><circle cx="122" cy="146" r="7" fill="rgba(190,240,255,0.65)" stroke="#88d8f5" strokeWidth="1.4" /></g>
        <g className="pet-fx-bit"><circle cx="76" cy="152" r="5.5" fill="rgba(210,248,255,0.7)" stroke="#9ae2fa" strokeWidth="1.4" /></g>
      </g>
    </g>
  );
  if (stage <= 0) {
    return (
      <g className={moveCls} data-pet-act={act || "idle"}>
      <g className={anim && !act ? "pet-wobble" : undefined} style={{ transformOrigin: "100px 200px" }}>
        <ellipse cx="100" cy="150" rx="46" ry="56" fill={p.egg} stroke={p.stroke} strokeWidth="3" />
        {kind === "bunny" ? <g fill={p.egg2}><ellipse cx="80" cy="130" rx="7" ry="11" /><ellipse cx="118" cy="160" rx="9" ry="7" /><circle cx="96" cy="182" r="5" /></g> : null}
        {kind === "panda" ? <g fill={p.egg2}><circle cx="78" cy="132" r="9" /><circle cx="122" cy="128" r="7" /><circle cx="108" cy="176" r="8" /></g> : null}
        {kind === "kitten" ? <g fill="none" stroke={p.egg2} strokeWidth="6" strokeLinecap="round"><path d="M64 140 q36 -12 72 0" /><path d="M60 162 q40 -12 80 0" /></g> : null}
        {kind === "tiger" ? <g fill="none" stroke={p.egg2} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"><path d="M58 138 l12 6 l-10 6" /><path d="M142 138 l-12 6 l10 6" /><path d="M62 170 l14 4 l-12 6" /><path d="M138 170 l-14 4 l12 6" /><path d="M92 126 h16 M100 120 v14" /></g> : null}
        {kind === "dragon" ? <g fill="none" stroke={p.egg2} strokeWidth="3.5" strokeLinecap="round">{[[76, 132], [100, 132], [124, 132], [64, 154], [88, 154], [112, 154], [136, 154], [76, 176], [100, 176], [124, 176]].map(([x, y], i) => <path key={i} d={`M${x - 10} ${y} q10 10 20 0`} />)}<circle cx="100" cy="112" r="5" fill="#ffd36e" stroke="none" /></g> : null}
        {kind === "puppy" ? <g fill={p.egg2}><ellipse cx="100" cy="160" rx="11" ry="9" /><circle cx="86" cy="146" r="4.5" /><circle cx="96" cy="140" r="4.5" /><circle cx="106" cy="140" r="4.5" /><circle cx="115" cy="146" r="4.5" /><circle cx="72" cy="124" r="6" opacity="0.6" /><circle cx="128" cy="184" r="7" opacity="0.6" /></g> : null}
        <path d="M86 102 l6 8 l-6 6 l8 6" fill="none" stroke={p.stroke} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M84 196 q16 6 32 0" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="6" />
      </g>
      {fx}
      </g>
    );
  }
  const s = stage === 1 ? 0.66 : stage === 2 ? 0.84 : 1;
  const limb = kind === "panda" ? p.dark : p.body;
  return (
    <g className={moveCls} data-pet-act={act || "idle"}>
    <g className={anim && !act ? "pet-bounce" : undefined} style={{ transformOrigin: "100px 205px" }}>
      <g transform={`translate(100 205) scale(${s}) translate(-100 -205)`}>
        {kind === "kitten" ? <g className="pet-tail"><path d="M134 176 q34 -6 26 -40" fill="none" stroke={p.stroke} strokeWidth="11" strokeLinecap="round" /><path d="M134 176 q34 -6 26 -40" fill="none" stroke={p.body} strokeWidth="6" strokeLinecap="round" /></g> : null}
        {kind === "tiger" ? <g className="pet-tail" fill="none" strokeLinecap="round"><path d="M134 176 q34 -6 26 -40" stroke={p.stroke} strokeWidth="11" /><path d="M134 176 q34 -6 26 -40" stroke={p.body} strokeWidth="6" /><path d="M134 176 q34 -6 26 -40" stroke={p.mark} strokeWidth="6" strokeDasharray="4 8" strokeLinecap="butt" /></g> : null}
        {kind === "puppy" ? <g className="pet-tail" fill="none" strokeLinecap="round"><path d="M134 178 q24 -2 22 -26" stroke={p.stroke} strokeWidth="11" /><path d="M134 178 q24 -2 22 -26" stroke={p.body} strokeWidth="6" /></g> : null}
        {kind === "dragon" ? <g className="pet-tail"><path d="M130 184 q44 8 42 -34" fill="none" stroke={p.stroke} strokeWidth="13" strokeLinecap="round" /><path d="M130 184 q44 8 42 -34" fill="none" stroke={p.body} strokeWidth="8" strokeLinecap="round" /><path d="M172 152 q-12 -10 -4 -24 q4 8 10 4 q2 12 -6 20z" fill={p.mark} /></g> : null}
        {kind === "bunny" ? <g className="pet-tail"><circle cx="136" cy="178" r="9" fill="#fff" stroke={p.stroke} strokeWidth="2.5" /></g> : null}
        <ellipse cx="82" cy="198" rx="13" ry="8" fill={limb} stroke={p.stroke} strokeWidth="2.5" />
        <ellipse cx="118" cy="198" rx="13" ry="8" fill={limb} stroke={p.stroke} strokeWidth="2.5" />
        <ellipse cx="100" cy="164" rx="38" ry="36" fill={p.body} stroke={p.stroke} strokeWidth="3" />
        <ellipse cx="100" cy="172" rx="22" ry="20" fill={p.belly} />
        {kind === "tiger" ? <g stroke={p.mark} strokeWidth="3.5" strokeLinecap="round" fill="none"><path d="M64 160 l10 2" /><path d="M66 172 l10 0" /><path d="M136 160 l-10 2" /><path d="M134 172 l-10 0" /></g> : null}
        {kind === "dragon" ? <g fill="none" stroke="#f0d98a" strokeWidth="2"><path d="M82 160 h36" /><path d="M80 172 h40" /><path d="M84 184 h32" /></g> : null}
        <Outfit id={equip.outfit} stage={stage} />
        <g className="pet-arm-l"><ellipse cx="62" cy="156" rx="10" ry="15" transform="rotate(25 62 156)" fill={limb} stroke={p.stroke} strokeWidth="2.5" /></g>
        <g className="pet-arm-r"><ellipse cx="138" cy="156" rx="10" ry="15" transform="rotate(-25 138 156)" fill={limb} stroke={p.stroke} strokeWidth="2.5" /></g>
        <Hold id={equip.hold} />
        {stage === 4 ? <g transform="translate(140 150) rotate(-20)"><rect x="-6" y="-16" width="12" height="32" rx="5" fill="#fff8e1" stroke="#e2c27a" strokeWidth="2" /><path d="M-6 0 h12" stroke="#ff5fa2" strokeWidth="3" /></g> : null}
        <g className="pet-ears"><Ears k={kind} /></g>
        <circle cx="100" cy="94" r="48" fill={p.body} stroke={p.stroke} strokeWidth="3" />
        <Face k={kind} stage={stage} mood={mood} />
        <g className="pet-ears-front"><EarsFront k={kind} /></g>
        {stage === 2 && !equip.acc ? <g><ellipse cx="100" cy="52" rx="30" ry="9" fill="#ffd36e" /><path d="M76 52 q24 -26 48 0" fill="#ffd36e" /></g> : null}
        {stage === 3 && !equip.acc ? <path d="M93 46 q7 -14 14 0 q-7 6 -14 0z" fill="#ff8cc0" /> : null}
        <Acc id={equip.acc} k={kind} />
        {stage === 4 ? <g><path d="M60 46 L100 30 L140 46 L100 62 Z" fill="#3b2c55" /><rect x="84" y="50" width="32" height="12" rx="3" fill="#3b2c55" /><path d="M138 47 v20" stroke="#ffd36e" strokeWidth="2.5" /><circle cx="138" cy="69" r="4" fill="#ffd36e" /></g> : null}
        {stage === 1 ? <g><path d="M50 196 q50 22 100 0 l-8 -16 l-10 8 l-10 -10 l-12 10 l-10 -10 l-12 10 l-10 -10 l-10 8z" fill={p.egg} stroke={p.stroke} strokeWidth="2.5" strokeLinejoin="round" /></g> : null}
        {dirty ? <g className="pet-mud" opacity="0.84">
          <ellipse cx="64" cy="116" rx="7" ry="4.5" transform="rotate(-14 64 116)" fill="#b57f50" />
          <circle cx="62" cy="115" r="1.4" fill="#8f5c34" />
          <circle cx="123" cy="68" r="4.5" fill="#b57f50" />
          <ellipse cx="86" cy="176" rx="8.5" ry="5" transform="rotate(10 86 176)" fill="#b57f50" />
          <circle cx="89" cy="176" r="1.6" fill="#8f5c34" />
          <circle cx="114" cy="184" r="4.2" fill="#b57f50" />
        </g> : null}
      </g>
      {mood === "miss" ? <g><circle cx="160" cy="48" r="4" fill="#fff" stroke={p.stroke} /><circle cx="170" cy="34" r="6" fill="#fff" stroke={p.stroke} /><ellipse cx="174" cy="16" rx="22" ry="13" fill="#fff" stroke={p.stroke} strokeWidth="2" /><path d="M164 18 q10 8 20 0" fill="#ffd36e" stroke="#e2a840" /><path d="M166 14 h16" stroke="#e2a840" strokeWidth="2" /></g> : null}
    </g>
    {fx}
    </g>
  );
}
