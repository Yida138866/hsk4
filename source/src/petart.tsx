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
  if (id === "cardigan") return <g><path d="M68 136 Q100 128 132 136 L136 188 Q100 196 64 188 Z" fill="#fff3e2" stroke="#d8b8e8" strokeWidth="2.5" /><path d="M98 134 V192" stroke="#c58bff" strokeWidth="2.5" /><circle cx="100" cy="148" r="2.4" fill="#ff8cc0" /><circle cx="100" cy="162" r="2.4" fill="#ff8cc0" /><circle cx="100" cy="176" r="2.4" fill="#ff8cc0" /><rect x="112" y="164" width="13" height="11" rx="2.5" fill="#f7dff5" stroke="#d8b8e8" strokeWidth="1.4" /></g>;
  if (id === "bunny_tutu") return <g><path d="M78 134 h44 l4 24 h-52z" fill="#ff9cc6" /><path d="M62 158 Q80 150 100 158 Q120 150 138 158 L146 184 Q124 192 100 184 Q76 192 54 184 Z" fill="#ffc8e2" stroke="#ff8cc0" strokeWidth="1.8" /><path d="M68 164 Q100 176 132 164" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="3 3" /><path d="M92 156 l8 4 l8 -4 l-2 6 l-6 -2 l-6 2z" fill="#ff5fa2" /></g>;
  if (id === "bunny_berry") return <g><path d="M74 134 h52 l10 56 q-36 10 -72 0z" fill="#fff8f2" /><path d="M78 144 h44 l12 46 q-34 9 -68 0z" fill="#ff6f91" /><path d="M82 134 v16 M118 134 v16" stroke="#ff6f91" strokeWidth="5.5" strokeLinecap="round" /><g transform="translate(100 166)"><path d="M0 -5 c5 0 7 4 5 9 c-2 4 -5 6 -5 6 s-3-2-5-6 c-2-5 0-9 5-9z" fill="#e8384f" /><path d="M-4 -6 l4 3 l4 -3 l-2 -2 l-2 1 l-2 -1z" fill="#6ccf9a" /><circle cx="-1.5" cy="1" r="0.8" fill="#ffd36e" /><circle cx="1.8" cy="3" r="0.8" fill="#ffd36e" /></g></g>;
  if (id === "bunny_pajama") return <g><path d="M66 138 Q100 128 134 138 L136 188 Q100 198 64 188 Z" fill="#d9c6ff" stroke="#b99df5" strokeWidth="2" /><path d="M78 134 q11 10 22 0 q11 10 22 0" fill="#fff" /><path d="M100 156 a7 7 0 1 0 7 7 a5.5 5.5 0 1 1 -7 -7z" fill="#ffd36e" /><circle cx="80" cy="172" r="2.2" fill="#fff" /><circle cx="122" cy="166" r="2.4" fill="#ffd36e" /></g>;
  if (id === "panda_hanfu") return <g><path d="M72 134 Q100 126 128 134 L138 194 Q100 202 62 194 Z" fill="#bff0dc" /><path d="M82 134 L104 156 L118 134" fill="#fff" stroke="#7fd6b3" strokeWidth="2" /><path d="M72 154 h56 v8 h-56z" fill="#ff8cc0" /><path d="M96 162 l-4 20 M104 162 l4 20" stroke="#ff5fa2" strokeWidth="2.5" strokeLinecap="round" /></g>;
  if (id === "panda_bamboodress") return <g><path d="M70 136 Q100 128 130 136 L132 184 Q100 192 68 184 Z" fill="#fffdf5" /><path d="M76 150 h48 l4 38 q-28 8 -56 0z" fill="#6ccf9a" /><path d="M82 134 v18 M118 134 v18" stroke="#6ccf9a" strokeWidth="5.5" /><circle cx="82" cy="153" r="2.5" fill="#ffd36e" /><circle cx="118" cy="153" r="2.5" fill="#ffd36e" /><rect x="91" y="162" width="18" height="14" rx="3" fill="#4eb67f" /><path d="M100 164 v10 M96 168 l4 -3 l4 3" stroke="#e9fff2" strokeWidth="1.6" fill="none" /></g>;
  if (id === "panda_tea") return <g><path d="M68 136 Q100 128 132 136 L134 188 Q100 196 66 188 Z" fill="#bfe8cb" /><path d="M78 144 h44 l8 44 q-30 8 -60 0z" fill="#fffaf2" stroke="#e8d8c4" strokeWidth="1.6" /><path d="M84 134 v12 M116 134 v12" stroke="#fffaf2" strokeWidth="4.5" /><path d="M92 158 h16 v10 a8 6 0 0 1 -16 0z" fill="#7ad8a8" /><path d="M108 160 q4 0 4 4 q0 4 -4 4" fill="none" stroke="#7ad8a8" strokeWidth="2" /></g>;
  if (id === "kitten_maid") return <g><path d="M74 134 h52 l12 56 q-38 10 -76 0z" fill="#c5a3ff" /><path d="M82 142 h36 l8 44 q-26 8 -52 0z" fill="#fff" /><path d="M74 184 q6 6 13 0 q6 6 13 0 q6 6 13 0 q6 6 13 0" fill="none" stroke="#fff" strokeWidth="3" /><path d="M92 146 l8 4 l8 -4 v7 l-8 -3 l-8 3z" fill="#ff7eb6" /></g>;
  if (id === "kitten_sailor") return <g><path d="M70 134 h60 l10 56 q-40 10 -80 0z" fill="#fff" /><path d="M72 166 h56 l10 24 q-38 10 -76 0z" fill="#4f6fa8" /><path d="M70 134 L100 160 L130 134 L124 130 L100 150 L76 130 Z" fill="#4f6fa8" /><path d="M75 135 L100 156 L125 135" fill="none" stroke="#fff" strokeWidth="1.8" /><path d="M93 152 l7 4 l7 -4 v7 l-7 -3 l-7 3z" fill="#ff6f91" /></g>;
  if (id === "kitten_cape") return <g><path d="M70 134 Q100 124 130 134 L144 172 Q100 186 56 172 Z" fill="#ff8ea8" /><path d="M62 170 q38 14 76 0" fill="none" stroke="#fff5f8" strokeWidth="5" strokeLinecap="round" /><circle cx="94" cy="148" r="4" fill="#fff" /><circle cx="106" cy="148" r="4" fill="#fff" /><path d="M94 148 h12" stroke="#ffd36e" strokeWidth="2" /></g>;
  if (id === "tiger_kungfu") return <g><path d="M68 136 Q100 126 132 136 L136 188 Q100 196 64 188 Z" fill="#e84a5f" stroke="#ffd36e" strokeWidth="2" /><path d="M90 132 h20 v7 h-20z" fill="#ffd36e" /><path d="M100 139 v48" stroke="#ffd36e" strokeWidth="2.2" /><path d="M94 149 h12 M94 162 h12 M94 175 h12" stroke="#ffd36e" strokeWidth="2.4" strokeLinecap="round" /></g>;
  if (id === "tiger_sport") return <g><path d="M66 138 Q100 126 134 138 L136 188 Q100 196 64 188 Z" fill="#63c7a7" /><path d="M84 134 h32 l4 56 h-40z" fill="#fff8ec" /><path d="M78 134 Q100 144 122 134" fill="none" stroke="#ffd36e" strokeWidth="4" /><path d="M112 152 l2.5 5 l5.5 0.8 l-4 3.8 l1 5.4 l-5 -2.6 l-5 2.6 l1 -5.4 l-4 -3.8 l5.5 -0.8z" fill="#ffd36e" /></g>;
  if (id === "tiger_royal") return <g><path d="M66 134 Q100 124 134 134 L146 188 Q100 200 54 188 Z" fill="#c8375a" stroke="#ffd36e" strokeWidth="2.5" /><path d="M72 134 q28 16 56 0" fill="none" stroke="#fff6e6" strokeWidth="8" strokeLinecap="round" /><circle cx="100" cy="146" r="5" fill="#ffd36e" /><circle cx="100" cy="146" r="2.4" fill="#ff5fa2" /></g>;
  if (id === "dragon_wingcape") return <g><path d="M68 140 Q42 126 34 150 Q42 162 46 174 Q58 166 68 172 Z" fill="#9cf0da" stroke="#5cc4aa" strokeWidth="2" /><path d="M132 140 Q158 126 166 150 Q158 162 154 174 Q142 166 132 172 Z" fill="#9cf0da" stroke="#5cc4aa" strokeWidth="2" /><path d="M70 136 Q100 126 130 136 L142 186 Q100 198 58 186 Z" fill="#6a4ca3" /><circle cx="86" cy="162" r="2.2" fill="#ffd36e" /><circle cx="116" cy="172" r="2.4" fill="#ffd36e" /><circle cx="100" cy="144" r="4.5" fill="#ffd36e" /></g>;
  if (id === "dragon_cloud") return <g><path d="M70 134 Q100 126 130 134 L138 192 Q100 200 62 192 Z" fill="#46b5a5" stroke="#ffd36e" strokeWidth="2" /><path d="M84 134 L102 156 L118 134" fill="#e9fff9" stroke="#ffd36e" strokeWidth="2" /><path d="M78 172 q6 -6 12 0 q6 -4 10 2 q-10 4 -22 -2z M106 160 q6 -6 12 0 q6 -4 8 2 q-10 4 -20 -2z" fill="#ffd36e" opacity="0.9" /></g>;
  if (id === "dragon_star") return <g><path d="M74 134 h52 l14 56 q-40 12 -80 0z" fill="#5e479c" /><path d="M76 136 q24 10 48 0" fill="none" stroke="#ffd36e" strokeWidth="3" /><g fill="#ffe28a"><path d="M88 158 l2 4 l4 0.5 l-3 2.8 l0.8 4 l-3.8 -2 l-3.8 2 l0.8 -4 l-3 -2.8 l4 -0.5z" /><path d="M114 170 l2 4 l4 0.5 l-3 2.8 l0.8 4 l-3.8 -2 l-3.8 2 l0.8 -4 l-3 -2.8 l4 -0.5z" /><circle cx="96" cy="178" r="2" /></g></g>;
  if (id === "puppy_raincoat") return <g><path d="M66 136 Q100 124 134 136 L140 188 Q100 198 60 188 Z" fill="#ffd54f" stroke="#e5a922" strokeWidth="2" /><path d="M100 136 V190" stroke="#e5a922" strokeWidth="2" /><circle cx="95" cy="150" r="2.6" fill="#fff" /><circle cx="95" cy="166" r="2.6" fill="#fff" /><rect x="110" y="164" width="16" height="12" rx="3" fill="#ffeb99" stroke="#e5a922" strokeWidth="1.5" /></g>;
  if (id === "puppy_overalls") return <g><path d="M68 136 Q100 128 132 136 L134 186 Q100 194 66 186 Z" fill="#fff" /><path d="M72 148 h56" stroke="#ff8a7a" strokeWidth="4" /><path d="M76 152 h48 l6 36 q-30 8 -60 0z" fill="#6ea8e5" /><path d="M82 134 v20 M118 134 v20" stroke="#6ea8e5" strokeWidth="5.5" /><rect x="91" y="162" width="18" height="14" rx="3" fill="#528fd1" /><circle cx="100" cy="170" r="2.5" fill="#ffd36e" /></g>;
  if (id === "puppy_picnic") return <g><path d="M74 134 h52 l14 56 q-40 12 -80 0z" fill="#ff9ec2" /><path d="M84 134 L76 188 M100 134 L100 192 M116 134 L124 188" stroke="rgba(255,255,255,0.45)" strokeWidth="5" /><path d="M72 158 h56 M66 174 h68" stroke="rgba(255,255,255,0.45)" strokeWidth="5" /><path d="M80 134 q10 12 20 0 q10 12 20 0" fill="#fff" stroke="#ff82b2" strokeWidth="1.5" /></g>;
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
  if (id === "starclip") return <g transform={`translate(126 ${top + 12}) rotate(14)`}><rect x="-12" y="-2.2" width="20" height="4.4" rx="2.2" fill="#ffd36e" /><path d="M6 -10 l2.6 5.4 l6 0.8 l-4.4 4.2 l1 6 l-5.2 -2.8 l-5.2 2.8 l1 -6 l-4.4 -4.2 l6 -0.8z" fill="#ffda44" stroke="#e5a922" strokeWidth="1.4" /><circle cx="6" cy="-1.5" r="2" fill="#ff7eb6" /></g>;
  if (id === "bunny_carrot") return <g transform="translate(72 46) rotate(-18)"><path d="M0 -8 c4 0 5 16 0 22 c-5 -6 -4 -22 0 -22z" fill="#ff8f3f" stroke="#e26e1d" strokeWidth="1.4" /><path d="M-2 -8 q-4 -6 -1 -10 q3 3 1 10 q3 -8 6 -7 q-1 6 -6 7" fill="#5ec97e" /><path d="M-2 2 h4 M-1 8 h3" stroke="#ffd2a6" strokeWidth="1.3" strokeLinecap="round" /></g>;
  if (id === "bunny_earbow") return <g><g transform="translate(76 54) rotate(-12)"><path d="M0 0 l-10 -6 v12z M0 0 l10 -6 v12z" fill="#ff6ca8" /><circle r="3.4" fill="#ffc2dc" /></g><g transform="translate(124 54) rotate(12)"><path d="M0 0 l-10 -6 v12z M0 0 l10 -6 v12z" fill="#ff6ca8" /><circle r="3.4" fill="#ffc2dc" /></g></g>;
  if (id === "bunny_pearl") return <g><path d="M68 58 Q100 42 132 58" fill="none" stroke="#ffe5f1" strokeWidth="3.5" />{[70, 80, 90, 100, 110, 120, 130].map((x, i) => <circle key={x} cx={x} cy={56 - Math.sin((i / 6) * Math.PI) * 10} r={i === 3 ? 4.4 : 3.5} fill="#fffdf8" stroke="#f0c8dc" strokeWidth="1.2" />)}</g>;
  if (id === "panda_bamboo") return <g transform="translate(128 50) rotate(-25)"><rect x="-15" y="-2.5" width="32" height="5" rx="2.5" fill="#5ec97e" stroke="#3da35d" strokeWidth="1.3" /><path d="M-5 -2.5 v5 M5 -2.5 v5" stroke="#a6f0be" strokeWidth="1.4" /><path d="M12 -2 q10 -10 18 -4 q-8 8 -18 4z M12 1 q12 2 16 10 q-10 -2 -16 -10z" fill="#4eb67f" stroke="#348f5f" strokeWidth="1.1" /></g>;
  if (id === "panda_leaf") return <g transform="translate(100 46)"><path d="M0 0 q0 -10 -1 -14" stroke="#4eb67f" strokeWidth="2.8" strokeLinecap="round" fill="none" /><path d="M-1 -12 q-11 -9 -16 -1 q8 7 16 1z" fill="#6ccf9a" stroke="#429e6c" strokeWidth="1.2" /><path d="M0 -13 q11 -10 16 -2 q-8 7 -16 2z" fill="#82e0ae" stroke="#429e6c" strokeWidth="1.2" /></g>;
  if (id === "panda_beret") return <g><ellipse cx="98" cy="43" rx="34" ry="12" fill="#7ad8a8" stroke="#4eb67f" strokeWidth="2" /><circle cx="98" cy="30" r="4" fill="#4eb67f" /><circle cx="114" cy="43" r="4.5" fill="#fff" /><circle cx="114" cy="43" r="2.2" fill="#4eb67f" /></g>;
  if (id === "kitten_bell") return <g><path d="M74 134 Q100 145 126 134" fill="none" stroke="#ff6f91" strokeWidth="5.5" strokeLinecap="round" /><circle cx="100" cy="144" r="7.5" fill="#ffd36e" stroke="#d99f26" strokeWidth="1.8" /><path d="M95 144 h10" stroke="#b87b14" strokeWidth="1.8" strokeLinecap="round" /><circle cx="100" cy="147" r="1.8" fill="#b87b14" /></g>;
  if (id === "kitten_yarn") return <g transform="translate(68 58)"><circle r="9" fill="#ff9cc6" stroke="#e56ea0" strokeWidth="1.5" /><path d="M-7 -3 q7 5 14 0 M-6 3 q6 -4 12 0 M-2 -8 q3 8 -1 16" fill="none" stroke="#ffd8ea" strokeWidth="1.4" /><path d="M-12 -10 L11 10" stroke="#d9b282" strokeWidth="2" strokeLinecap="round" /></g>;
  if (id === "kitten_fish") return <g transform="translate(128 58) rotate(18)"><ellipse cx="0" cy="0" rx="10" ry="6" fill="#7cc6f7" stroke="#4b98d1" strokeWidth="1.5" /><path d="M8 0 l8 -5 v10z" fill="#7cc6f7" stroke="#4b98d1" strokeWidth="1.4" strokeLinejoin="round" /><circle cx="-4" cy="-1.5" r="1.5" fill="#fff" /></g>;
  if (id === "tiger_wang") return <g><path d="M84 50 L88 35 L95 43 L100 31 L105 43 L112 35 L116 50 Z" fill="#ffd36e" stroke="#d99f26" strokeWidth="2" strokeLinejoin="round" /><circle cx="100" cy="43" r="3" fill="#e8384f" /></g>;
  if (id === "tiger_bandana") return <g><path d="M56 64 Q100 50 144 64 L142 73 Q100 60 58 73 Z" fill="#ff665a" /><path d="M142 66 l16 -7 l-4 9 z M142 70 l16 7 l-11 2 z" fill="#e54b40" /><circle cx="100" cy="61" r="3" fill="#ffd36e" /></g>;
  if (id === "tiger_star") return <g transform="translate(62 50) rotate(-14)"><path d="M0 -9 l2.5 5.2 l5.8 0.8 l-4.2 4 l1 5.8 l-5.1 -2.7 l-5.1 2.7 l1 -5.8 l-4.2 -4 l5.8 -0.8z" fill="#ffd36e" stroke="#d99f26" strokeWidth="1.4" /><circle r="2.2" fill="#ff6f91" /></g>;
  if (id === "dragon_gem") return <g><path d="M100 54 L108 66 L100 76 L92 66 Z" fill="#ff6ca8" stroke="#ffd36e" strokeWidth="2" strokeLinejoin="round" /><path d="M100 57 L104 65 L100 72 L96 65 Z" fill="#ffc8e2" opacity="0.65" /><circle cx="84" cy="64" r="1.8" fill="#ffd36e" /><circle cx="116" cy="64" r="1.8" fill="#ffd36e" /></g>;
  if (id === "dragon_hornflow") return <g>{[[76, 35], [124, 35]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`} fill="#ffb3d1">{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy="-4.2" rx="3" ry="4.5" transform={`rotate(${a})`} />)}<circle r="2.2" fill="#ffd36e" /></g>)}</g>;
  if (id === "dragon_halo") return <g><ellipse cx="100" cy="21" rx="26" ry="6.5" fill="none" stroke="#ffd36e" strokeWidth="4" /><ellipse cx="100" cy="21" rx="26" ry="6.5" fill="none" stroke="#fff6b8" strokeWidth="1.5" /><circle cx="72" cy="19" r="2.2" fill="#ffd36e" /><circle cx="128" cy="19" r="2.2" fill="#ffd36e" /></g>;
  if (id === "puppy_bone") return <g transform="translate(56 72) rotate(-20)"><rect x="-10" y="-3.5" width="20" height="7" rx="2" fill="#fffaf0" stroke="#d49f6a" strokeWidth="1.4" /><circle cx="-10" cy="-3.5" r="3.4" fill="#fffaf0" stroke="#d49f6a" strokeWidth="1.3" /><circle cx="-10" cy="3.5" r="3.4" fill="#fffaf0" stroke="#d49f6a" strokeWidth="1.3" /><circle cx="10" cy="-3.5" r="3.4" fill="#fffaf0" stroke="#d49f6a" strokeWidth="1.3" /><circle cx="10" cy="3.5" r="3.4" fill="#fffaf0" stroke="#d49f6a" strokeWidth="1.3" /></g>;
  if (id === "puppy_sunhat") return <g><ellipse cx="100" cy="52" rx="48" ry="11" fill="#f7dc88" stroke="#d9b452" strokeWidth="2" /><path d="M68 50 Q74 26 100 26 Q126 26 132 50 Z" fill="#fae49c" stroke="#d9b452" strokeWidth="2" /><path d="M69 47 Q100 53 131 47" fill="none" stroke="#ff7eb6" strokeWidth="4.5" /></g>;
  if (id === "puppy_bell") return <g><path d="M74 134 Q100 145 126 134" fill="none" stroke="#6ea8e5" strokeWidth="5.5" strokeLinecap="round" /><circle cx="100" cy="144" r="7.5" fill="#ffd36e" stroke="#d99f26" strokeWidth="1.8" /><circle cx="100" cy="145.5" r="2.2" fill="#b87b14" /><circle cx="97.2" cy="142" r="1.2" fill="#b87b14" /><circle cx="100" cy="141" r="1.2" fill="#b87b14" /><circle cx="102.8" cy="142" r="1.2" fill="#b87b14" /></g>;
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
    bamboo: <g><rect width="200" height="164" fill="#e6f9ed" /><rect y="164" width="200" height="56" fill="#cdeed7" />{[18, 36, 168, 184].map((x, i) => <g key={i}><rect x={x} y="0" width="7" height="190" fill={i % 2 ? "#75cc94" : "#5eb980"} />{[32, 68, 104, 140].map((y) => <path key={y} d={`M${x - 1} ${y} h9`} stroke="#d8ffe6" strokeWidth="2" />)}</g>)}<path d="M24 44 q14 -10 24 0 q-10 8 -24 0z M156 58 q14 -10 24 0 q-10 8 -24 0z" fill="#5eb980" /><ellipse cx="100" cy="200" rx="52" ry="7" fill="#b7e2c4" /></g>,
    cafe: <g><rect width="200" height="162" fill="#fff5ea" /><rect y="162" width="200" height="58" fill="#f7dfca" /><rect y="160" width="200" height="4" fill="#e9c4a6" />{[0, 25, 50, 75, 100, 125, 150, 175].map((x, i) => <path key={x} d={`M${x} 0 h25 v20 a12.5 9 0 0 1 -25 0z`} fill={i % 2 ? "#ff9ec2" : "#fff"} />)}<rect x="70" y="34" width="60" height="44" rx="8" fill="#bfe8ff" stroke="#e4b898" strokeWidth="4" /><path d="M100 34 v44 M70 56 h60" stroke="#e4b898" strokeWidth="2.5" /><rect x="16" y="106" width="28" height="22" rx="4" fill="#ffe6f0" stroke="#e4b898" strokeWidth="2.5" /><path d="M30 121 l-5 -5 a3 3 0 0 1 5 -3 a3 3 0 0 1 5 3z" fill="#ff7eb6" /></g>,
    cloud: <g><defs><linearGradient id="csky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#cbe8ff" /><stop offset="1" stopColor="#f9dff7" /></linearGradient></defs><rect width="200" height="220" fill="url(#csky)" /><path d="M26 110 a74 68 0 0 1 148 0" fill="none" stroke="#ffb3d1" strokeWidth="5" opacity="0.55" /><path d="M32 110 a68 62 0 0 1 136 0" fill="none" stroke="#ffe699" strokeWidth="5" opacity="0.55" /><path d="M38 110 a62 56 0 0 1 124 0" fill="none" stroke="#aee8d8" strokeWidth="5" opacity="0.55" /><g fill="#fff" opacity="0.92"><ellipse cx="44" cy="46" rx="22" ry="12" /><ellipse cx="58" cy="42" rx="14" ry="10" /><ellipse cx="154" cy="60" rx="24" ry="12" /><ellipse cx="140" cy="56" rx="14" ry="10" /><ellipse cx="48" cy="186" rx="34" ry="14" /><ellipse cx="152" cy="188" rx="34" ry="14" /></g></g>,
  };
  return (
    <svg viewBox="0 0 200 220" width="100%" height="100%" aria-hidden="true" style={{ display: "block" }}>
      <defs><linearGradient id="rbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff3f9" /><stop offset="1" stopColor="#f3e8ff" /></linearGradient></defs>
      {id && bg[id] ? bg[id] : <rect width="200" height="220" fill="url(#rbg)" />}
      <ellipse cx="100" cy="206" rx="80" ry="10" fill="rgba(143,33,96,0.08)" />
      {furn?.includes("rug") ? <g><ellipse cx="100" cy="206" rx="68" ry="10" fill="#ffd4e8" stroke="#ff9ec2" strokeWidth="1.8" /><ellipse cx="100" cy="206" rx="54" ry="7" fill="#fff2f8" stroke="#ffc2dc" strokeWidth="1.2" /></g> : null}
      {furn?.includes("clock") ? <g transform="translate(30 56)"><circle cx="-9" cy="-12" r="5" fill="#ffb8d6" /><circle cx="9" cy="-12" r="5" fill="#ffb8d6" /><circle r="13" fill="#fffaf5" stroke="#ff8cc0" strokeWidth="2.5" /><path d="M0 -7 v7 l5 3" fill="none" stroke="#8f2160" strokeWidth="2" strokeLinecap="round" /></g> : null}
      {furn?.includes("plushie") ? <g><rect x="152" y="88" width="38" height="5" rx="2.5" fill="#e0a87a" /><g transform="translate(172 78)"><circle cx="-7" cy="-9" r="3.5" fill="#d49a6a" /><circle cx="7" cy="-9" r="3.5" fill="#d49a6a" /><circle cy="-3" r="8" fill="#e3ad7e" /><ellipse cy="6" rx="7" ry="6" fill="#d49a6a" /><circle cx="-2.5" cy="-4" r="1.1" fill="#3a2330" /><circle cx="2.5" cy="-4" r="1.1" fill="#3a2330" /><ellipse cy="-1.5" rx="2.8" ry="2" fill="#fff0e0" /></g></g> : null}
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

export const CUSTOM_ICONS = new Set(["matcha", "pho", "baozi", "banhmi", "strawberry"]);
export function ItemIcon({ id, fallback, size = 24 }: { id?: string; fallback: string; size?: number }) {
  if (id === "matcha") {
    return (
      <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" style={{ display: "inline-block", verticalAlign: "middle" }}>
        <path d="M16.8 13 L21.8 2.2" stroke="#399a54" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M17.2 11.8 L21.5 2.5" stroke="#7ce092" strokeWidth="0.7" strokeLinecap="round" />
        <path d="M8.5 13.5 C8.5 6.6 23.5 6.6 23.5 13.5 Z" fill="rgba(232,248,238,0.55)" stroke="#92c2a8" strokeWidth="0.9" />
        <path d="M9.4 13.5 C9.2 11.1 11.4 10.2 16 10.2 C20.6 10.2 22.8 11.1 22.6 13.5 Z" fill="#ffffff" stroke="#d8e6dd" strokeWidth="0.6" />
        <path d="M11 10.9 C11 8.8 13.1 8.1 16 8.1 C18.9 8.1 21 8.8 21 10.9 Z" fill="#fffdf9" stroke="#d8e6dd" strokeWidth="0.55" />
        <path d="M13.2 8.6 C13.5 6.4 16 5.2 17.5 5.4 C16.7 6.8 18.7 7.4 18.7 8.6 Z" fill="#ffffff" stroke="#d8e6dd" strokeWidth="0.5" />
        <g fill="#459a42" opacity="0.9">
          <circle cx="13.6" cy="9.9" r="0.48" />
          <circle cx="16.1" cy="9.0" r="0.45" />
          <circle cx="18.3" cy="10.2" r="0.45" />
          <circle cx="12.1" cy="12.2" r="0.45" />
          <circle cx="14.9" cy="11.9" r="0.5" />
          <circle cx="17.2" cy="12.4" r="0.4" />
          <circle cx="19.6" cy="12.0" r="0.45" />
        </g>
        <path d="M8.2 14.6 L23.8 14.6 L21.4 28.4 Q16 29.7 10.6 28.4 Z" fill="#78cc6b" />
        <path d="M9.2 22.8 L22.4 22.8 L21.4 28.4 Q16 29.7 10.6 28.4 Z" fill="#63b856" opacity="0.7" />
        <path d="M9.2 18.4 Q13 16.8 16.5 18.8 T22.8 17.9" fill="none" stroke="#baf0ab" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
        <path d="M10.1 23.6 Q13.8 22 17.4 24.1 T22 23.1" fill="none" stroke="#d4f7c9" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
        <circle cx="13.5" cy="21" r="0.75" fill="#ebfde8" opacity="0.85" />
        <circle cx="18.6" cy="25.8" r="0.65" fill="#ebfde8" opacity="0.8" />
        <path d="M7.5 14 L24.5 14 L21.9 28.9 Q16 30.3 10.1 28.9 Z" fill="none" stroke="#6aa687" strokeWidth="1" strokeLinejoin="round" />
        <path d="M9.8 16.4 L11.5 27.2" stroke="rgba(255,255,255,0.6)" strokeWidth="1.3" strokeLinecap="round" />
        <rect x="6.7" y="12.9" width="18.6" height="2" rx="1" fill="#effaf2" stroke="#7cb496" strokeWidth="0.75" />
      </svg>
    );
  }
  if (id === "pho") {
    return (
      <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" style={{ display: "inline-block", verticalAlign: "middle" }}>
        <path d="M11.6 25.8 L20.4 25.8 L19.7 28.3 Q16 28.9 12.3 28.3 Z" fill="#dfe8f2" stroke="#7692b2" strokeWidth="0.85" strokeLinejoin="round" />
        <path d="M3.2 14.2 Q3.5 26.2 16 26.5 Q28.5 26.2 28.8 14.2 Z" fill="#ffffff" stroke="#7692b2" strokeWidth="0.95" strokeLinejoin="round" />
        <path d="M4.6 17.8 Q16 20.4 27.4 17.8" fill="none" stroke="#5b90cc" strokeWidth="1.25" strokeLinecap="round" />
        <path d="M6.4 21.8 Q16 24.4 25.6 21.8" fill="none" stroke="#a6c4e6" strokeWidth="0.8" strokeLinecap="round" />
        <ellipse cx="16" cy="14" rx="12.8" ry="5.6" fill="#ffffff" stroke="#7692b2" strokeWidth="0.95" />
        <ellipse cx="16" cy="14.2" rx="11.4" ry="4.5" fill="#f3cb7a" />
        <path d="M7.2 14.1 Q11.4 16.1 15.6 13.7" fill="none" stroke="#fffdf7" strokeWidth="1.65" strokeLinecap="round" />
        <path d="M8.0 16.1 Q12.8 17.8 18.2 15.5" fill="none" stroke="#fff8ea" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M9.8 12.1 Q13.4 13.5 16.8 11.9" fill="none" stroke="#fffdf7" strokeWidth="1.45" strokeLinecap="round" />
        <g>
          <ellipse cx="20.4" cy="13.6" rx="3.4" ry="1.8" transform="rotate(-14 20.4 13.6)" fill="#c96f6b" stroke="#9e4c49" strokeWidth="0.6" />
          <path d="M18.4 13.4 Q20.4 12.8 22.3 13.6" fill="none" stroke="#f2b8b2" strokeWidth="0.7" strokeLinecap="round" />
          <ellipse cx="17.2" cy="15.3" rx="3.2" ry="1.6" transform="rotate(10 17.2 15.3)" fill="#d67f78" stroke="#9e4c49" strokeWidth="0.6" />
          <path d="M15.4 15.2 Q17.2 14.7 19.0 15.4" fill="none" stroke="#f5c3bd" strokeWidth="0.65" strokeLinecap="round" />
        </g>
        <g>
          <path d="M7.8 11.8 Q9.8 9.2 12.6 10.6 Q10.6 13.0 7.8 11.8 Z" fill="#3c9449" stroke="#2c7036" strokeWidth="0.5" />
          <path d="M8.4 11.5 L11.6 10.7" stroke="#85de8f" strokeWidth="0.55" strokeLinecap="round" />
          <path d="M10.4 10.0 Q12.8 7.8 15.2 9.4 Q12.8 11.4 10.4 10.0 Z" fill="#49a856" stroke="#2c7036" strokeWidth="0.5" />
        </g>
        <g fill="none" stroke="#47a64f" strokeWidth="0.9">
          <circle cx="11.2" cy="14.5" r="1.05" />
          <circle cx="15.2" cy="12.5" r="0.95" />
          <circle cx="13.5" cy="16.4" r="1.0" />
        </g>
        <g transform="translate(25.2 11.8) rotate(18)">
          <path d="M-2.8 0.8 A3.0 3.0 0 0 1 2.8 0.8 Z" fill="#48ab45" stroke="#2f7d2d" strokeWidth="0.55" />
          <path d="M-2.1 0.6 A2.2 2.2 0 0 1 2.1 0.6 Z" fill="#cef48e" />
        </g>
        <path d="M19.8 4.4 L28.4 9.5" stroke="#c8965c" strokeWidth="1.35" strokeLinecap="round" />
        <path d="M18.4 5.7 L27.6 11.0" stroke="#dfb078" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    );
  }
  if (id === "baozi") {
    return (
      <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" style={{ display: "inline-block", verticalAlign: "middle" }}>
        <path d="M11.5 5.6 Q10.5 4.2 11.7 2.8 M16 4.8 Q15 3.4 16.2 2 M20.5 5.6 Q19.5 4.2 20.7 2.8" fill="none" stroke="#c8b6c4" strokeWidth="1.15" strokeLinecap="round" opacity="0.85" />
        <rect x="4.2" y="20.4" width="23.6" height="6.2" rx="2.2" fill="#e2b073" stroke="#996836" strokeWidth="0.95" />
        <path d="M4.6 23.4 H27.4" stroke="#bd8649" strokeWidth="1.05" />
        <path d="M9.5 20.6 V26.4 M16 20.6 V26.4 M22.5 20.6 V26.4" stroke="#c99357" strokeWidth="0.7" opacity="0.6" />
        <path d="M6.2 20.4 C5.4 11.6 10.6 7.4 16 7.4 C21.4 7.4 26.6 11.6 25.8 20.4 Q16 22.4 6.2 20.4 Z" fill="#fffcf7" stroke="#ad927d" strokeWidth="0.95" strokeLinejoin="round" />
        <path d="M7.1 18.8 Q16 21.4 24.9 18.8 Q25.2 20.3 24.7 20.6 Q16 22.3 7.3 20.6 Z" fill="#f3e7d8" />
        <path d="M16 9.3 Q11.8 11.4 10.2 15.2 M16 9.3 Q14.0 12.2 13.7 15.8 M16 9.3 Q18.0 12.2 18.3 15.8 M16 9.3 Q20.2 11.4 21.8 15.2" fill="none" stroke="#c4aa94" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M14.3 8.8 Q16 7.5 17.7 8.8 Q16 10.1 14.3 8.8 Z" fill="#f7ecdf" stroke="#ad927d" strokeWidth="0.75" strokeLinejoin="round" />
      </svg>
    );
  }
  if (id === "banhmi") {
    return (
      <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" style={{ display: "inline-block", verticalAlign: "middle" }}>
        <g transform="rotate(-14 16 16)">
          <path d="M3.4 17.2 Q3.6 23.4 10.8 23.6 L24.6 23.2 Q29.4 22.6 29.2 17.2 Z" fill="#df9b48" stroke="#8f5522" strokeWidth="0.95" strokeLinejoin="round" />
          <path d="M5.8 16.2 H27.4 Q27.6 18.8 24.4 19.0 L8.8 19.2 Q5.6 18.6 5.8 16.2 Z" fill="#fff1d2" />
          <path d="M3.4 13.8 Q4.0 8.2 11.4 7.8 L22.6 7.8 Q28.6 8.2 28.8 13.2 Q22.5 11.6 16 11.6 Q9.5 11.6 3.4 13.8 Z" fill="#ebb05b" stroke="#8f5522" strokeWidth="0.95" strokeLinejoin="round" />
          <path d="M9.6 9.0 L11.8 10.8 M15.2 8.6 L17.4 10.5 M20.8 9.0 L22.8 10.7" stroke="#b57029" strokeWidth="1.0" strokeLinecap="round" />
          <g>
            <ellipse cx="14.2" cy="15.8" rx="4.2" ry="2.2" fill="#eb8b8e" stroke="#b8585c" strokeWidth="0.65" />
            <ellipse cx="21.0" cy="15.6" rx="3.8" ry="2.0" fill="#c77656" stroke="#8f4c32" strokeWidth="0.65" />
            <path d="M8.6 14.6 L15.6 13.8 L15.4 15.8 L8.4 16.2 Z" fill="#63c76c" stroke="#36853e" strokeWidth="0.6" />
            <path d="M16.2 13.6 Q21.2 11.8 26.8 13.8" fill="none" stroke="#ff8d38" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M10.4 13.2 Q14.0 11.6 17.6 13.4" fill="none" stroke="#ff9d47" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M12.6 12.2 Q14.8 9.8 17.0 12.2 Q14.8 14.0 12.6 12.2 Z" fill="#3da34a" stroke="#287031" strokeWidth="0.55" />
            <path d="M21.4 11.9 Q23.6 9.8 25.6 12.1 Q23.6 13.8 21.4 11.9 Z" fill="#4cb559" stroke="#287031" strokeWidth="0.55" />
            <circle cx="19.2" cy="13.8" r="1.2" fill="#e8384f" stroke="#a61e30" strokeWidth="0.5" />
          </g>
          <path d="M2.6 15.2 L8.8 13.8 L9.8 23.6 L3.6 22.8 Q2.2 19.2 2.6 15.2 Z" fill="#fffaf0" stroke="#c7b299" strokeWidth="0.85" strokeLinejoin="round" />
          <path d="M3.8 17.5 L7.8 16.7 M4.2 20.2 L8.2 19.4" stroke="#f09bb8" strokeWidth="0.85" strokeLinecap="round" />
        </g>
      </svg>
    );
  }
  if (id === "strawberry") {
    return (
      <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" style={{ display: "inline-block", verticalAlign: "middle" }}>
        <path d="M20.2 10.6 L25.2 3.2 L27.0 4.4 L22.0 11.8 Z" fill="#e5a756" stroke="#a86d28" strokeWidth="0.7" strokeLinejoin="round" />
        <path d="M22.2 7.6 L24.0 8.9 M24.0 5.0 L25.8 6.2" stroke="#b87b32" strokeWidth="0.65" />
        <ellipse cx="16" cy="28.3" rx="6.2" ry="1.6" fill="#ffd9e8" stroke="#c96e94" strokeWidth="0.85" />
        <rect x="14.4" y="24.5" width="3.2" height="3.6" fill="#ffe6f0" stroke="#c96e94" strokeWidth="0.8" />
        <path d="M7.6 15.0 H24.4 L21.6 24.4 Q16 26.2 10.4 24.4 Z" fill="#ffeaf2" stroke="#c96e94" strokeWidth="0.95" strokeLinejoin="round" />
        <path d="M8.8 19.0 Q16 20.6 23.2 19.0 L21.2 24.1 Q16 25.7 10.8 24.1 Z" fill="#ff9ac0" />
        <path d="M9.0 15.4 H23.0 L22.2 19.4 Q16 20.8 9.8 19.4 Z" fill="#fffdf8" />
        <path d="M10.4 15.6 Q12.2 18.8 13.2 16.4 Q14.6 15.2 15.8 18.6 Q17.2 15.4 18.6 17.6 Q19.8 15.6 21.8 16.6 L22.4 15.4 H9.6 Z" fill="#e83a60" />
        <path d="M10.2 16.2 L11.4 22.8" stroke="rgba(255,255,255,0.65)" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="12.6" cy="14.2" r="4.3" fill="#ffb3cf" stroke="#e07aa0" strokeWidth="0.7" />
        <circle cx="19.4" cy="14.2" r="4.2" fill="#fffdf9" stroke="#d9c6cf" strokeWidth="0.7" />
        <path d="M10.2 13.8 C10.2 11.2 12.5 10.2 16 10.2 C19.5 10.2 21.8 11.2 21.8 13.8 Z" fill="#ffffff" stroke="#d8c8d0" strokeWidth="0.65" />
        <path d="M11.8 11.0 C12.0 8.9 13.9 8.2 16 8.2 C18.1 8.2 20.0 8.9 20.2 11.0 Z" fill="#fffdf9" stroke="#d8c8d0" strokeWidth="0.6" />
        <path d="M13.8 8.7 C14.1 6.8 16 5.7 17.4 6.0 C16.7 7.2 18.4 7.8 18.4 8.7 Z" fill="#ffffff" stroke="#d8c8d0" strokeWidth="0.55" />
        <path d="M11.0 13.0 Q12.4 14.6 13.6 12.8 Q15.2 11.4 16.6 14.2 Q18.0 11.6 19.6 13.4 L21.0 12.6" fill="none" stroke="#e83a60" strokeWidth="1.25" strokeLinecap="round" />
        <g transform="translate(13.6 6.2) rotate(-14)">
          <path d="M0 -3.0 C2.3 -3.0 3.1 -1.0 2.1 1.4 C1.3 3.2 0 3.9 0 3.9 C0 3.9 -1.3 3.2 -2.1 1.4 C-3.1 -1.0 -2.3 -3.0 0 -3.0 Z" fill="#e8354e" stroke="#a81d31" strokeWidth="0.6" />
          <path d="M-1.9 -2.9 L0 -1.9 L1.9 -2.9 L1.1 -3.8 L0 -3.3 L-1.1 -3.8 Z" fill="#49ad52" />
          <circle cx="-0.8" cy="-0.4" r="0.4" fill="#ffe178" />
          <circle cx="0.9" cy="0.2" r="0.4" fill="#ffe178" />
          <circle cx="-0.1" cy="1.6" r="0.4" fill="#ffe178" />
        </g>
        <g transform="translate(20.6 11.2) rotate(22)">
          <path d="M-2.1 -1.1 C-2.1 -2.5 2.1 -2.5 2.1 -1.1 C2.1 0.8 0 2.5 0 2.5 C0 2.5 -2.1 0.8 -2.1 -1.1 Z" fill="#ff4d6d" stroke="#a81d31" strokeWidth="0.55" />
          <path d="M-1.1 -0.9 C-1.1 -1.7 1.1 -1.7 1.1 -0.9 C1.1 0.2 0 1.3 0 1.3 C0 1.3 -1.1 0.2 -1.1 -0.9 Z" fill="#ffb8c6" />
        </g>
        <rect x="6.8" y="14.1" width="18.4" height="1.8" rx="0.9" fill="#fff4f8" stroke="#c96e94" strokeWidth="0.8" />
      </svg>
    );
  }
  return <>{fallback}</>;
}
