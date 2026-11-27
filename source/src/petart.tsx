// Upgraded kawaii chibi sticker-style pet artwork (inline SVG): bunny, panda, kitten, tiger, dragon, puppy × 5 stages, with outfits, accessories, rooms.
import { useState, useEffect, useRef } from "./kit";
import type { ReactNode } from "./kit";

export type Kind = "bunny" | "panda" | "kitten" | "tiger" | "dragon" | "puppy";
export const KINDS: Kind[] = ["bunny", "panda", "kitten", "tiger", "dragon", "puppy"];
export type Equip = { acc?: string; outfit?: string; room?: string; furn?: string[]; hold?: string };
const INK = "#3e2249";
type Pal = {
  body: string; bodyHi: string; bodyLo: string; stroke: string;
  inner: string; innerLo: string; dark: string; darkHi: string;
  egg: string; egg2: string; belly: string; bellyLo: string;
  nose: string; mark: string; irisLo: string; blush: string; shadow: string;
};
const PAL: Record<Kind, Pal> = {
  bunny: {
    body: "#fff8fb", bodyHi: "#ffffff", bodyLo: "#ffe4ef", stroke: "#b87490",
    inner: "#ffc8df", innerLo: "#ff9fc6", dark: "#ffd2e6", darkHi: "#ffeaf3",
    egg: "#ffe8f2", egg2: "#ff9ec8", belly: "#ffffff", bellyLo: "#ffeef6",
    nose: "#ff74a4", mark: "#ffb6d2", irisLo: "#a85c88", blush: "#ff8fb8", shadow: "#b86d8f",
  },
  panda: {
    body: "#fcfbfe", bodyHi: "#ffffff", bodyLo: "#ebe6f3", stroke: "#5c4f6b",
    inner: "#ffc7dc", innerLo: "#ffa5c6", dark: "#43344f", darkHi: "#5e4c6d",
    egg: "#f7f3fc", egg2: "#4d3c5c", belly: "#ffffff", bellyLo: "#f2edf8",
    nose: "#43344f", mark: "#43344f", irisLo: "#7e5da8", blush: "#ff93bb", shadow: "#625374",
  },
  kitten: {
    body: "#eceaf4", bodyHi: "#fbfaff", bodyLo: "#cfccde", stroke: "#6f6985",
    inner: "#ffc4d4", innerLo: "#ff98b7", dark: "#b6b1ca", darkHi: "#dcd9ea",
    egg: "#f1eff8", egg2: "#a8a2c2", belly: "#fffaf7", bellyLo: "#f3edf6",
    nose: "#ff7da4", mark: "#9a94b4", irisLo: "#8e63ad", blush: "#ff90b5", shadow: "#746c8e",
  },
  tiger: {
    body: "#ffc878", bodyHi: "#ffe5ad", bodyLo: "#f19b42", stroke: "#8f4e22",
    inner: "#fff5df", innerLo: "#ffd8a8", dark: "#965224", darkHi: "#b86b35",
    egg: "#fff1d8", egg2: "#f09f4e", belly: "#fffaf0", bellyLo: "#ffe9c7",
    nose: "#ff7e9d", mark: "#8f4e22", irisLo: "#b8683a", blush: "#ff8888", shadow: "#a15826",
  },
  dragon: {
    body: "#9aeccf", bodyHi: "#d4fded", bodyLo: "#5ec9a4", stroke: "#2b7362",
    inner: "#ffd4e4", innerLo: "#ff9ec0", dark: "#47ab8c", darkHi: "#7be0be",
    egg: "#e5fbf1", egg2: "#67cda9", belly: "#fff8cf", bellyLo: "#ffe99e",
    nose: "#2b7362", mark: "#ff7eb6", irisLo: "#3ca694", blush: "#ff8cb8", shadow: "#2d7c6b",
  },
  puppy: {
    body: "#fff5e4", bodyHi: "#fffdf9", bodyLo: "#ecd0ac", stroke: "#885e40",
    inner: "#d29663", innerLo: "#ab6d3e", dark: "#c88958", darkHi: "#dfa677",
    egg: "#fff7ec", egg2: "#d69d6c", belly: "#ffffff", bellyLo: "#faecda",
    nose: "#4e2f24", mark: "#c88958", irisLo: "#a86b4c", blush: "#ff93a6", shadow: "#966948",
  },
};

function Ears({ k, g }: { k: Kind; g: string }) {
  const p = PAL[k];
  if (k === "bunny") {
    return (
      <g>
        <path d="M77 62 C66 42, 65 14, 77 12 C88 10, 93 34, 90 58 Z" fill={`url(#${g}body)`} stroke={p.stroke} strokeWidth="2.3" strokeLinejoin="round" />
        <path d="M78 55 C71 40, 71 21, 78 19 C84 18, 86 35, 85 53 Z" fill={`url(#${g}inner)`} />
        <path d="M73 28 Q75 20 80 18" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M110 58 C108 35, 114 13, 126 14 C135 15, 141 28, 134 39 C130 45, 125 52, 123 62 Z" fill={`url(#${g}body)`} stroke={p.stroke} strokeWidth="2.3" strokeLinejoin="round" />
        <path d="M114 53 C114 36, 118 21, 125 22 C130 22, 132 30, 127 38 C124 43, 121 48, 120 55 Z" fill={`url(#${g}inner)`} />
      </g>
    );
  }
  if (k === "panda") {
    return (
      <g>
        <circle cx="62" cy="59" r="14.5" fill={`url(#${g}dark)`} stroke={p.stroke} strokeWidth="2.1" />
        <path d="M53 52 A10 10 0 0 1 67 48" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="138" cy="59" r="14.5" fill={`url(#${g}dark)`} stroke={p.stroke} strokeWidth="2.1" />
        <path d="M133 48 A10 10 0 0 1 147 52" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeLinecap="round" />
      </g>
    );
  }
  if (k === "tiger") {
    return (
      <g>
        <circle cx="62" cy="60" r="15" fill={`url(#${g}body)`} stroke={p.stroke} strokeWidth="2.3" />
        <circle cx="63" cy="62" r="8.2" fill={`url(#${g}inner)`} />
        <path d="M54 51 q4 -3 8 -2" stroke={p.mark} strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <circle cx="138" cy="60" r="15" fill={`url(#${g}body)`} stroke={p.stroke} strokeWidth="2.3" />
        <circle cx="137" cy="62" r="8.2" fill={`url(#${g}inner)`} />
        <path d="M146 51 q-4 -3 -8 -2" stroke={p.mark} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      </g>
    );
  }
  if (k === "dragon") {
    return (
      <g>
        <path d="M77 59 C72 44, 67 30, 72 22 C76 21, 80 30, 82 40 L67 32 C64 30, 62 34, 66 37 L77 45 L84 56 Z" fill={`url(#${g}horn)`} stroke="#c88522" strokeWidth="1.9" strokeLinejoin="round" />
        <path d="M123 59 C128 44, 133 30, 128 22 C124 21, 120 30, 118 40 L133 32 C136 30, 138 34, 134 37 L123 45 L116 56 Z" fill={`url(#${g}horn)`} stroke="#c88522" strokeWidth="1.9" strokeLinejoin="round" />
        <path d="M55 86 C40 83, 33 70, 38 64 C44 62, 53 69, 59 76 Z" fill={`url(#${g}body)`} stroke={p.stroke} strokeWidth="2.1" strokeLinejoin="round" />
        <path d="M54 82 C44 79, 40 72, 43 69 C47 68, 52 72, 56 77 Z" fill={`url(#${g}inner)`} />
        <path d="M145 86 C160 83, 167 70, 162 64 C156 62, 147 69, 141 76 Z" fill={`url(#${g}body)`} stroke={p.stroke} strokeWidth="2.1" strokeLinejoin="round" />
        <path d="M146 82 C156 79, 160 72, 157 69 C153 68, 148 72, 144 77 Z" fill={`url(#${g}inner)`} />
      </g>
    );
  }
  if (k === "puppy") return null;
  return (
    <g>
      <path d="M56 78 C51 54, 58 34, 69 36 C78 38, 86 48, 91 56 Z" fill={`url(#${g}body)`} stroke={p.stroke} strokeWidth="2.3" strokeLinejoin="round" />
      <path d="M62 70 C59 54, 63 43, 70 44 C76 45, 81 51, 84 57 Z" fill={`url(#${g}inner)`} />
      <path d="M144 78 C149 54, 142 34, 131 36 C122 38, 114 48, 109 56 Z" fill={`url(#${g}body)`} stroke={p.stroke} strokeWidth="2.3" strokeLinejoin="round" />
      <path d="M138 70 C141 54, 137 43, 130 44 C124 45, 119 51, 116 57 Z" fill={`url(#${g}inner)`} />
    </g>
  );
}

function EarsFront({ k, g }: { k: Kind; g: string }) {
  const p = PAL[k];
  if (k === "puppy") {
    return (
      <g>
        <path d="M58 63 C42 68, 39 98, 48 112 C54 119, 64 114, 66 96 C68 82, 65 69, 58 63 Z" fill={`url(#${g}dark)`} stroke={p.stroke} strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M55 71 C49 77, 47 96, 52 104" fill="none" stroke="rgba(255,240,220,0.35)" strokeWidth="2" strokeLinecap="round" />
        <path d="M142 63 C158 68, 161 98, 152 112 C146 119, 136 114, 134 96 C132 82, 135 69, 142 63 Z" fill={`url(#${g}dark)`} stroke={p.stroke} strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M145 71 C151 77, 153 96, 148 104" fill="none" stroke="rgba(255,240,220,0.35)" strokeWidth="2" strokeLinecap="round" />
      </g>
    );
  }
  if (k === "dragon") {
    return (
      <g>
        <path d="M87 55 C83 45, 86 38, 92 41 C93 33, 102 31, 105 40 C110 35, 117 40, 113 52 Q100 49 87 55 Z" fill={`url(#${g}crest)`} stroke="#d4568a" strokeWidth="1.6" strokeLinejoin="round" />
      </g>
    );
  }
  return null;
}

function Face({ k, stage, mood, g }: { k: Kind; stage: number; mood: string; g: string }) {
  const p = PAL[k];
  const sad = mood === "miss";
  const great = mood === "great";
  const exL = 82, exR = 118, ey = 95;
  const rx = stage >= 3 ? 7.6 : 6.8;
  const ry = stage >= 3 ? 9.0 : 8.0;

  const drawEye = (cx: number, left: boolean) => (
    <g>
      {k === "panda" ? <ellipse cx={cx} cy={ey} rx={rx + 2} ry={ry + 1.8} fill="#ffffff" /> : null}
      <ellipse cx={cx} cy={ey} rx={rx} ry={ry} fill={`url(#${g}eye)`} />
      <path d={`M${cx - rx * 0.72} ${ey + ry * 0.28} A${rx * 0.78} ${ry * 0.65} 0 0 0 ${cx + rx * 0.72} ${ey + ry * 0.28} A${rx * 0.9} ${ry * 0.45} 0 0 1 ${cx - rx * 0.72} ${ey + ry * 0.28} Z`} fill={p.irisLo} opacity="0.65" />
      <circle cx={cx - 2.3} cy={ey - 3.2} r={stage >= 3 ? 3.1 : 2.6} fill="#ffffff" />
      <circle cx={cx + 2.5} cy={ey + 2.6} r={stage >= 3 ? 1.45 : 1.2} fill="#ffffff" opacity="0.95" />
      <circle cx={cx + 2.7} cy={ey - 2.8} r="0.95" fill="#ffffff" opacity="0.9" />
      {stage >= 2 && k !== "panda" ? (
        <g stroke={INK} strokeWidth="1.6" strokeLinecap="round" fill="none">
          <path d={left ? `M${cx - rx + 0.5} ${ey - 2} q-2.2 -2 -4.2 -3.2` : `M${cx + rx - 0.5} ${ey - 2} q2.2 -2 4.2 -3.2`} />
          {stage >= 3 ? <path d={left ? `M${cx - rx + 2} ${ey - 5.2} q-1.6 -2 -2.6 -3.5` : `M${cx + rx - 2} ${ey - 5.2} q1.6 -2 2.6 -3.5`} /> : null}
        </g>
      ) : null}
    </g>
  );

  const eyes = stage === 1 && !sad ? (
    <g fill="none" stroke={k === "panda" ? "#ffffff" : INK} strokeWidth="2.8" strokeLinecap="round">
      <path d="M74 96 q8 -9 16 0" />
      <path d="M110 96 q8 -9 16 0" />
    </g>
  ) : (
    <g>{drawEye(exL, true)}{drawEye(exR, false)}</g>
  );

  const whisk = k === "kitten" || k === "tiger";
  return (
    <g className="pet-face">
      {k === "panda" ? (
        <g fill={`url(#${g}dark)`}>
          <ellipse cx="80" cy="96" rx="13.5" ry="16" transform="rotate(20 80 96)" />
          <ellipse cx="120" cy="96" rx="13.5" ry="16" transform="rotate(-20 120 96)" />
        </g>
      ) : null}
      {k === "puppy" ? <ellipse cx="118" cy="94" rx="14.5" ry="13.5" fill={p.dark} opacity="0.48" /> : null}
      {k === "kitten" ? (
        <g fill="none" stroke={p.mark} strokeWidth="3.2" strokeLinecap="round" opacity="0.85">
          <path d="M93 56 q0 6 1 9" /><path d="M100 54 v12" /><path d="M107 56 q0 6 -1 9" />
        </g>
      ) : null}
      {k === "tiger" ? (
        <g fill="none" stroke={p.mark} strokeWidth="2.8" strokeLinecap="round">
          <path d="M91 59 q9 -2 18 0" /><path d="M93 65 q7 -1 14 0" /><path d="M100 57 v14" /><path d="M90 71 q10 -1 20 0" />
          <path d="M54 91 l10 3" /><path d="M53 99 l9 1.5" /><path d="M146 91 l-10 3" /><path d="M147 99 l-9 1.5" />
        </g>
      ) : null}
      {k === "kitten" || k === "tiger" || k === "puppy" || k === "dragon" ? (
        <ellipse cx="100" cy="111" rx={k === "kitten" ? 16 : 18} ry="11.5" fill={k === "dragon" ? p.belly : "#ffffff"} opacity="0.92" />
      ) : null}
      <g className="pet-eyes">{eyes}</g>
      {sad ? (
        <g stroke={k === "panda" ? "#8b72a8" : INK} strokeWidth="2.2" strokeLinecap="round" fill="none">
          <path d="M73 82 q6 2 11 4.5" /><path d="M127 82 q-6 2 -11 4.5" />
        </g>
      ) : null}
      <ellipse cx="66" cy="108" rx={great ? 10 : 8.5} ry={great ? 5.5 : 4.8} fill={`url(#${g}cheek)`} />
      <ellipse cx="134" cy="108" rx={great ? 10 : 8.5} ry={great ? 5.5 : 4.8} fill={`url(#${g}cheek)`} />
      {great && !sad ? (
        <g stroke="#ff6b9d" strokeWidth="1.2" strokeLinecap="round" opacity="0.7">
          <path d="M63 109 l2 -3 M67 109 l2 -3 M131 109 l2 -3 M135 109 l2 -3" />
        </g>
      ) : null}
      {k === "dragon" ? (
        <g fill={INK} opacity="0.85"><circle cx="95.5" cy="105" r="1.6" /><circle cx="104.5" cy="105" r="1.6" /></g>
      ) : k === "puppy" ? (
        <g><ellipse cx="100" cy="104.5" rx="5.2" ry="3.7" fill={p.nose} /><ellipse cx="98.4" cy="103.3" rx="1.6" ry="0.9" fill="rgba(255,255,255,0.65)" /></g>
      ) : (
        <path d="M96.5 103.5 Q100 101.8 103.5 103.5 Q102.5 107 100 107.6 Q97.5 107 96.5 103.5 Z" fill={p.nose} />
      )}
      {sad ? (
        <path d="M93 116 q7 -5.5 14 0" fill="none" stroke={INK} strokeWidth="2.3" strokeLinecap="round" />
      ) : great ? (
        <g>
          <path d="M91.5 109.5 q4.2 4.5 8.5 0 q4.3 4.5 8.5 0" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M95 112.2 q5 8 10 0 z" fill="#ff7ca3" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
        </g>
      ) : (
        <path d="M92 110 q4 5 8 0 q4 5 8 0" fill="none" stroke={INK} strokeWidth="2.3" strokeLinecap="round" />
      )}
      {k === "puppy" && !sad && !great ? (
        <path d="M100.5 112.5 q3.2 7.5 6.8 1.2 z" fill="#ff89ad" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
      ) : null}
      {sad ? (
        <g><path d="M128 102 q4 7 0 11 q-4 -4 0 -11z" fill="#8fd0ff" stroke="#5aa9e8" strokeWidth="1" /><circle cx="127" cy="108" r="1.1" fill="#ffffff" /></g>
      ) : null}
      {whisk ? (
        <g stroke={k === "tiger" ? "#b67442" : "#8e88a8"} strokeWidth="1.6" strokeLinecap="round" opacity="0.85">
          <path d="M58 102 q-9 -1 -16 -2" /><path d="M58 108 q-9 2 -15 5" />
          <path d="M142 102 q9 -1 16 -2" /><path d="M142 108 q9 2 15 5" />
        </g>
      ) : null}
      {k === "dragon" ? (
        <g fill="none" stroke="#e5a638" strokeWidth="2.1" strokeLinecap="round">
          <path d="M91 106 q-21 -3 -33 7 q-7 7 2 10" /><path d="M109 106 q21 -3 33 7 q7 7 -2 10" />
        </g>
      ) : null}
      <ellipse className="pet-blush-x" cx="66" cy="109" rx="11" ry="6.5" fill="#ff76aa" />
      <ellipse className="pet-blush-x" cx="134" cy="109" rx="11" ry="6.5" fill="#ff76aa" />
      <ellipse className="pet-yawn" cx="100" cy="117" rx="6" ry="7.5" fill="#4a2a52" />
    </g>
  );
}

function AoDai({ main, hi, lo, trim, pants, pantsLo, stroke, flower, flowerCenter }: {
  main: string; hi: string; lo: string; trim: string; pants: string; pantsLo: string; stroke: string; flower: string; flowerCenter: string;
}) {
  return (
    <g>
      {/* Flowing wide-leg silk trousers (quan lua) peeking along both side slits */}
      <path d="M74 166 L65 196 Q77 199 88 195 L90 172 Z" fill={pants} stroke={pantsLo} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M126 166 L135 196 Q123 199 112 195 L110 172 Z" fill={pants} stroke={pantsLo} strokeWidth="1.5" strokeLinejoin="round" />
      {/* Back flap (ta sau) peeking softly behind */}
      <path d="M76 156 L70 191 Q100 197 130 191 L124 156 Z" fill={lo} stroke={stroke} strokeWidth="1.35" strokeLinejoin="round" />
      {/* Raglan sleeves */}
      <path d="M76 132 C68 139, 67 150, 74 155 L82 149 Z" fill={main} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M124 132 C132 139, 133 150, 126 155 L118 149 Z" fill={main} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
      {/* Seamless fitted bodice flowing continuously into long front flap (ta truoc) */}
      <path d="M84 131 L77 148 C80 153, 80 167, 75 196 Q100 202 125 196 C120 167, 120 153, 123 148 L116 131 Q100 137 84 131 Z" fill={main} stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
      {/* Subtle silk drape highlight */}
      <path d="M88 152 C87 168, 85 182, 84 193" fill="none" stroke={hi} strokeWidth="3.2" strokeLinecap="round" opacity="0.38" />
      {/* Traditional diagonal side-button closure (khuy ao dai) */}
      <path d="M101 135 Q114 141 118.5 154" fill="none" stroke={trim} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="109" cy="139" r="1.4" fill={trim} />
      <circle cx="114.5" cy="145" r="1.4" fill={trim} />
      <circle cx="117.5" cy="151" r="1.4" fill={trim} />
      {/* High Mandarin stand collar (co ao dai) */}
      <path d="M87 128 Q100 133 113 128 L114 135 Q100 140 86 135 Z" fill={main} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M88 129.5 Q100 134 112 129.5" fill="none" stroke={trim} strokeWidth="1.6" strokeLinecap="round" />
      {/* Delicate lotus / mai blossom embroidery */}
      <g transform="translate(95 166)">
        {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy="-3.4" rx="2.1" ry="3.4" transform={`rotate(${a})`} fill={flower} />)}
        <circle r="1.8" fill={flowerCenter} />
      </g>
      <g transform="translate(107 179) scale(0.76)">
        {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy="-3.4" rx="2.1" ry="3.4" transform={`rotate(${a})`} fill={flower} />)}
        <circle r="1.8" fill={flowerCenter} />
      </g>
      <path d="M98 170 q5 4 7 8" fill="none" stroke={trim} strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
    </g>
  );
}

function Outfit({ id, stage }: { id?: string; stage: number }) {
  if (!id) {
    if (stage === 2) {
      return (
        <g>
          <path d="M80 138 Q100 146 120 138 L122 154 Q100 166 78 154 Z" fill="#ffd970" stroke="#dfa528" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M82 140 Q100 147 118 140" fill="none" stroke="#fff6cf" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="100" cy="147" r="2.8" fill="#ffffff" />
        </g>
      );
    }
    if (stage === 3) {
      return (
        <g>
          <path d="M74 133 L100 156 L126 133 L121 129 L100 146 L79 129 Z" fill="#78a8ff" stroke="#5384df" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M78 134 L100 152 L122 134" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M94 148 l6 4 l6 -4 v6 l-6 -2.5 l-6 2.5 z" fill="#ff78ad" />
          <circle cx="100" cy="151" r="2.2" fill="#ffc4dd" />
        </g>
      );
    }
    if (stage === 4) {
      return (
        <g>
          <path d="M72 134 Q100 126 128 134 L135 192 Q100 200 65 192 Z" fill="#68489c" stroke="#4b3178" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M84 132 L100 150 L116 132" fill="#ffffff" stroke="#e4d2ff" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M88 133 L100 146 L112 133" fill="none" stroke="#ffd46b" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      );
    }
    return null;
  }
  if (id === "aodai") return <AoDai main="#ff84ba" hi="#ffc6e0" lo="#e8589a" trim="#fff0f7" pants="#fffafd" pantsLo="#eccfe0" stroke="#c8437f" flower="#ffffff" flowerCenter="#ffd86b" />;
  if (id === "aodai_red") return <AoDai main="#ed3e56" hi="#ff8a99" lo="#c22339" trim="#ffe07d" pants="#fff7e8" pantsLo="#e8cfa8" stroke="#a61d31" flower="#ffe07d" flowerCenter="#ff7eb6" />;
  if (id === "aodai_white") return <AoDai main="#ffffff" hi="#ffffff" lo="#e2eefc" trim="#95c2f5" pants="#f7fbff" pantsLo="#c2dbf5" stroke="#85b2e3" flower="#a7d0fa" flowerCenter="#ffd86b" />;
  if (id === "dress") {
    return (
      <g>
        <path d="M76 134 Q100 129 124 134 L136 188 Q100 198 64 188 Z" fill="#c78eff" stroke="#975fd6" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M79 149 Q100 155 121 149" fill="none" stroke="#ff99cb" strokeWidth="4" strokeLinecap="round" />
        <path d="M68 184 q8 5 16 0 q8 5 16 0 q8 5 16 0 q8 5 16 0" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M93 148 l7 3.5 l7 -3.5 v6 l-7 -2.5 l-7 2.5 z" fill="#ffd86b" />
      </g>
    );
  }
  if (id === "hoodie") {
    return (
      <g>
        <path d="M70 135 Q100 126 130 135 L133 186 Q100 194 67 186 Z" fill="#76dac8" stroke="#48a898" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M76 133 Q100 144 124 133" fill="none" stroke="#53bba9" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M84 159 h32 l3 16 q-19 5 -38 0 z" fill="#58bfa9" stroke="#48a898" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M93 136 v15 M107 136 v15" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="93" cy="151" r="2" fill="#ffd86b" /><circle cx="107" cy="151" r="2" fill="#ffd86b" />
      </g>
    );
  }
  if (id === "scarf") {
    return (
      <g>
        <path d="M73 130 Q100 143 127 130 L127 141 Q100 153 73 141 Z" fill="#ff6e93" stroke="#d4456c" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M111 140 l7 28 l-11 2 l-4 -26 z" fill="#ff84a4" stroke="#d4456c" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M107 166 h10" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        <path d="M78 135 Q100 144 122 135" fill="none" stroke="#ffb3c8" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    );
  }
  if (id === "cardigan") {
    return (
      <g>
        <path d="M72 134 Q100 127 128 134 L132 187 Q100 194 68 187 Z" fill="#fff4e3" stroke="#cfa9df" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M99 133 V190" stroke="#b987e5" strokeWidth="2.2" />
        <circle cx="99" cy="146" r="2.2" fill="#ff89be" /><circle cx="99" cy="159" r="2.2" fill="#ff89be" /><circle cx="99" cy="172" r="2.2" fill="#ff89be" />
        <rect x="109" y="162" width="13" height="11" rx="2.8" fill="#f7def7" stroke="#cfa9df" strokeWidth="1.3" />
      </g>
    );
  }
  if (id === "bunny_tutu") {
    return (
      <g>
        <path d="M76 133 Q100 129 124 133 L125 156 H75 Z" fill="#ff9ac6" stroke="#dd689c" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M66 156 Q83 148 100 156 Q117 148 134 156 L142 183 Q122 191 100 183 Q78 191 58 183 Z" fill="#ffcde5" stroke="#ff82ba" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M68 164 Q100 175 132 164" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="3 3" />
        <path d="M92 154 l8 4 l8 -4 l-2 6 l-6 -2 l-6 2 z" fill="#ff589e" />
      </g>
    );
  }
  if (id === "bunny_berry") {
    return (
      <g>
        <path d="M74 134 Q100 128 126 134 L132 187 Q100 194 68 187 Z" fill="#fff9f4" stroke="#e4b4c6" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M77 145 H123 L130 187 Q100 194 70 187 Z" fill="#ff7094" stroke="#d9486d" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M83 133 v15 M117 133 v15" stroke="#ff7094" strokeWidth="4.8" strokeLinecap="round" />
        <g transform="translate(100 166)">
          <path d="M0 -5 c5 0 7 4 5 9 c-2 4 -5 6 -5 6 s-3-2-5-6 c-2-5 0-9 5-9z" fill="#e8384f" />
          <path d="M-4 -6 l4 3 l4 -3 l-2 -2 l-2 1 l-2 -1z" fill="#6ccf9a" />
          <circle cx="-1.5" cy="1" r="0.8" fill="#ffd36e" /><circle cx="1.8" cy="3" r="0.8" fill="#ffd36e" />
        </g>
      </g>
    );
  }
  if (id === "bunny_pajama") {
    return (
      <g>
        <path d="M70 135 Q100 127 130 135 L132 187 Q100 195 68 187 Z" fill="#d9c6ff" stroke="#a687e5" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M78 133 q11 9 22 0 q11 9 22 0" fill="#ffffff" stroke="#b597ee" strokeWidth="1.2" />
        <path d="M100 156 a6.5 6.5 0 1 0 6.5 6.5 a5 5 0 1 1 -6.5 -6.5z" fill="#ffd86b" />
        <circle cx="81" cy="171" r="2.1" fill="#ffffff" /><circle cx="119" cy="166" r="2.2" fill="#ffd86b" />
      </g>
    );
  }
  if (id === "panda_hanfu") {
    return (
      <g>
        <path d="M73 133 Q100 127 127 133 L135 192 Q100 199 65 192 Z" fill="#bdf0dc" stroke="#66be9b" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M82 133 L103 153 L118 133" fill="#ffffff" stroke="#78d0ae" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M74 152 h52 v7 h-52z" fill="#ff8bc0" />
        <path d="M96 159 l-4 19 M104 159 l4 19" stroke="#ff5c9f" strokeWidth="2.3" strokeLinecap="round" />
      </g>
    );
  }
  if (id === "panda_bamboodress") {
    return (
      <g>
        <path d="M72 134 Q100 128 128 134 L130 185 Q100 192 70 185 Z" fill="#fffdf6" stroke="#c8dfd0" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M76 148 h48 l4 38 q-28 7 -56 0z" fill="#67cd97" stroke="#42a370" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M83 133 v17 M117 133 v17" stroke="#67cd97" strokeWidth="4.8" strokeLinecap="round" />
        <circle cx="83" cy="151" r="2.4" fill="#ffd86b" /><circle cx="117" cy="151" r="2.4" fill="#ffd86b" />
        <rect x="91" y="160" width="18" height="13" rx="3" fill="#4ab37d" />
        <path d="M100 162 v9 M96 166 l4 -3 l4 3" stroke="#eafff3" strokeWidth="1.5" fill="none" />
      </g>
    );
  }
  if (id === "panda_tea") {
    return (
      <g>
        <path d="M71 134 Q100 127 129 134 L131 187 Q100 194 69 187 Z" fill="#bee9cb" stroke="#74b88a" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M78 144 h44 l6 43 q-28 7 -56 0z" fill="#fffaf2" stroke="#dfd0bd" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M84 133 v12 M116 133 v12" stroke="#fffaf2" strokeWidth="4" strokeLinecap="round" />
        <path d="M92 157 h16 v10 a8 6 0 0 1 -16 0z" fill="#77d6a7" />
        <path d="M108 159 q4 0 4 4 q0 4 -4 4" fill="none" stroke="#77d6a7" strokeWidth="2" />
      </g>
    );
  }
  if (id === "kitten_maid") {
    return (
      <g>
        <path d="M75 133 Q100 128 125 133 L134 188 Q100 197 66 188 Z" fill="#c3a0ff" stroke="#8f67d9" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M82 141 h36 l7 43 q-25 7 -50 0z" fill="#ffffff" stroke="#e4d6ff" strokeWidth="1.2" />
        <path d="M72 184 q7 6 14 0 q7 6 14 0 q7 6 14 0 q7 6 14 0" fill="none" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M92 144 l8 4 l8 -4 v7 l-8 -3 l-8 3z" fill="#ff7cb4" />
      </g>
    );
  }
  if (id === "kitten_sailor") {
    return (
      <g>
        <path d="M73 133 Q100 128 127 133 L133 187 Q100 195 67 187 Z" fill="#ffffff" stroke="#a6b9db" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M72 164 h56 l7 23 q-35 8 -70 0z" fill="#4f6fa8" />
        <path d="M73 133 L100 156 L127 133 L122 129 L100 147 L78 129 Z" fill="#4f6fa8" />
        <path d="M78 134 L100 152 L122 134" fill="none" stroke="#ffffff" strokeWidth="1.6" />
        <path d="M93 149 l7 4 l7 -4 v7 l-7 -3 l-7 3z" fill="#ff6e91" />
      </g>
    );
  }
  if (id === "kitten_cape") {
    return (
      <g>
        <path d="M72 133 Q100 125 128 133 L140 172 Q100 184 60 172 Z" fill="#ff8da8" stroke="#d85c7b" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M64 170 q36 12 72 0" fill="none" stroke="#fff6f9" strokeWidth="4.6" strokeLinecap="round" />
        <circle cx="94" cy="147" r="3.6" fill="#ffffff" /><circle cx="106" cy="147" r="3.6" fill="#ffffff" />
        <path d="M94 147 h12" stroke="#ffd86b" strokeWidth="2" />
      </g>
    );
  }
  if (id === "tiger_kungfu") {
    return (
      <g>
        <path d="M71 134 Q100 126 129 134 L133 187 Q100 194 67 187 Z" fill="#e8485e" stroke="#ffd56e" strokeWidth="1.9" strokeLinejoin="round" />
        <path d="M89 130 h22 v7 h-22z" fill="#ffd56e" />
        <path d="M100 137 v48" stroke="#ffd56e" strokeWidth="2" />
        <path d="M94 147 h12 M94 160 h12 M94 173 h12" stroke="#ffd56e" strokeWidth="2.2" strokeLinecap="round" />
      </g>
    );
  }
  if (id === "tiger_sport") {
    return (
      <g>
        <path d="M70 135 Q100 126 130 135 L132 187 Q100 194 68 187 Z" fill="#61c7a6" stroke="#3c9e7f" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M84 132 h32 l3 56 h-38z" fill="#fff8ec" />
        <path d="M80 133 Q100 142 120 133" fill="none" stroke="#ffd56e" strokeWidth="3.6" strokeLinecap="round" />
        <path d="M110 150 l2.4 4.8 l5.2 0.8 l-3.8 3.6 l1 5.2 l-4.8 -2.5 l-4.8 2.5 l1 -5.2 l-3.8 -3.6 l5.2 -0.8z" fill="#ffd56e" />
      </g>
    );
  }
  if (id === "tiger_royal") {
    return (
      <g>
        <path d="M70 133 Q100 125 130 133 L140 186 Q100 197 60 186 Z" fill="#c8375a" stroke="#ffd56e" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M75 133 q25 14 50 0" fill="none" stroke="#fff6e6" strokeWidth="7" strokeLinecap="round" />
        <circle cx="100" cy="145" r="4.6" fill="#ffd56e" /><circle cx="100" cy="145" r="2.2" fill="#ff5fa2" />
      </g>
    );
  }
  if (id === "dragon_wingcape") {
    return (
      <g>
        <path d="M71 139 Q46 125 38 148 Q45 160 49 172 Q60 164 71 170 Z" fill="#9cf0da" stroke="#5cc4aa" strokeWidth="1.9" strokeLinejoin="round" />
        <path d="M129 139 Q154 125 162 148 Q155 160 151 172 Q140 164 129 170 Z" fill="#9cf0da" stroke="#5cc4aa" strokeWidth="1.9" strokeLinejoin="round" />
        <path d="M72 134 Q100 126 128 134 L138 185 Q100 195 62 185 Z" fill="#6a4ca3" stroke="#4c337d" strokeWidth="1.7" strokeLinejoin="round" />
        <circle cx="87" cy="160" r="2.1" fill="#ffd36e" /><circle cx="115" cy="170" r="2.2" fill="#ffd36e" /><circle cx="100" cy="143" r="4.2" fill="#ffd36e" />
      </g>
    );
  }
  if (id === "dragon_cloud") {
    return (
      <g>
        <path d="M72 133 Q100 126 128 133 L134 190 Q100 197 66 190 Z" fill="#46b5a5" stroke="#ffd36e" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M84 133 L101 153 L117 133" fill="#e9fff9" stroke="#ffd36e" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M78 169 q6 -6 12 0 q6 -4 10 2 q-10 4 -22 -2z M106 158 q6 -6 12 0 q6 -4 8 2 q-10 4 -20 -2z" fill="#ffd36e" opacity="0.9" />
      </g>
    );
  }
  if (id === "dragon_star") {
    return (
      <g>
        <path d="M75 133 Q100 128 125 133 L136 188 Q100 198 64 188 Z" fill="#5e479c" stroke="#422f78" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M77 135 q23 9 46 0" fill="none" stroke="#ffd36e" strokeWidth="2.8" strokeLinecap="round" />
        <g fill="#ffe28a">
          <path d="M88 156 l2 4 l4 0.5 l-3 2.8 l0.8 4 l-3.8 -2 l-3.8 2 l0.8 -4 l-3 -2.8 l4 -0.5z" />
          <path d="M113 168 l2 4 l4 0.5 l-3 2.8 l0.8 4 l-3.8 -2 l-3.8 2 l0.8 -4 l-3 -2.8 l4 -0.5z" />
          <circle cx="96" cy="176" r="2" />
        </g>
      </g>
    );
  }
  if (id === "puppy_raincoat") {
    return (
      <g>
        <path d="M70 134 Q100 125 130 134 L135 186 Q100 195 65 186 Z" fill="#ffd54f" stroke="#df9f18" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M100 134 V188" stroke="#df9f18" strokeWidth="1.8" />
        <circle cx="95" cy="148" r="2.4" fill="#ffffff" /><circle cx="95" cy="164" r="2.4" fill="#ffffff" />
        <rect x="108" y="162" width="14" height="11" rx="2.8" fill="#ffeb99" stroke="#df9f18" strokeWidth="1.4" />
      </g>
    );
  }
  if (id === "puppy_overalls") {
    return (
      <g>
        <path d="M72 134 Q100 127 128 134 L130 185 Q100 192 70 185 Z" fill="#ffffff" stroke="#cfd8e6" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M74 146 h52" stroke="#ff8a7a" strokeWidth="3.5" />
        <path d="M77 150 h46 l5 35 q-28 7 -56 0z" fill="#6ea8e5" stroke="#477fc0" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M83 133 v18 M117 133 v18" stroke="#6ea8e5" strokeWidth="4.8" strokeLinecap="round" />
        <rect x="91" y="160" width="18" height="13" rx="3" fill="#528fd1" />
        <circle cx="100" cy="167" r="2.3" fill="#ffd36e" />
      </g>
    );
  }
  if (id === "puppy_picnic") {
    return (
      <g>
        <path d="M75 133 Q100 128 125 133 L135 188 Q100 198 65 188 Z" fill="#ff9ec2" stroke="#df6896" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M84 133 L77 187 M100 133 L100 191 M116 133 L123 187" stroke="rgba(255,255,255,0.48)" strokeWidth="4.5" />
        <path d="M74 156 h52 M69 172 h62" stroke="rgba(255,255,255,0.48)" strokeWidth="4.5" />
        <path d="M81 133 q9.5 11 19 0 q9.5 11 19 0" fill="#ffffff" stroke="#ff82b2" strokeWidth="1.4" />
      </g>
    );
  }
  return null;
}

function Acc({ id, k }: { id?: string; k: Kind }) {
  const top = k === "dragon" ? 50 : k === "panda" ? 51 : 52;
  if (id === "bow") {
    return (
      <g transform="translate(100 137)">
        <path d="M0 0 l-16 -9.5 v19 z M0 0 l16 -9.5 v19 z" fill="#ff5fa2" stroke="#c93675" strokeWidth="1.5" strokeLinejoin="round" />
        <circle r="5" fill="#ff94c4" stroke="#c93675" strokeWidth="1.4" />
      </g>
    );
  }
  if (id === "glasses") {
    return (
      <g fill="rgba(255,255,255,0.22)" stroke="#8f2160" strokeWidth="2.6" strokeLinecap="round">
        <circle cx="82" cy="95" r="13.5" /><circle cx="118" cy="95" r="13.5" /><path d="M95.5 95 h9" />
        <path d="M74 89 l4 -3" stroke="rgba(255,255,255,0.75)" strokeWidth="1.8" />
        <path d="M110 89 l4 -3" stroke="rgba(255,255,255,0.75)" strokeWidth="1.8" />
      </g>
    );
  }
  if (id === "crown") {
    const pts: [number, number, string][] = [
      [72, top + 9, "#ff8cc0"], [85, top + 3, "#ffd56b"], [100, top + 0.5, "#ff6f9f"], [115, top + 3, "#c58bff"], [128, top + 9, "#7ad8c8"],
    ];
    return (
      <g>
        <path d={`M69 ${top + 11} Q100 ${top - 2} 131 ${top + 11}`} fill="none" stroke="#5ec282" strokeWidth="4" strokeLinecap="round" />
        <path d={`M76 ${top + 8} l-4 -5 M92 ${top + 2} l-3 -5 M108 ${top + 2} l3 -5 M124 ${top + 8} l4 -5`} stroke="#6fd191" strokeWidth="3.2" strokeLinecap="round" />
        {pts.map(([cx, cy, col], i) => (
          <g key={i} transform={`translate(${cx} ${cy})`}>
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx="0" cy="-4.2" rx="3" ry="4.4" transform={`rotate(${a})`} fill={col} stroke="rgba(120,60,90,0.28)" strokeWidth="0.7" />
            ))}
            <circle r="2.5" fill="#fff5b8" stroke="#e5a935" strokeWidth="0.7" />
          </g>
        ))}
      </g>
    );
  }
  if (id === "heartglasses") {
    return (
      <g fill="rgba(255,120,170,0.34)" stroke="#e2385f" strokeWidth="2.6" strokeLinejoin="round">
        <path d="M82 106 l-11.5 -11.5 a6.8 6.8 0 0 1 11.5 -6.8 a6.8 6.8 0 0 1 11.5 6.8z" />
        <path d="M118 106 l-11.5 -11.5 a6.8 6.8 0 0 1 11.5 -6.8 a6.8 6.8 0 0 1 11.5 6.8z" />
        <path d="M93.5 94 h13" />
      </g>
    );
  }
  if (id === "bunnyears") {
    return (
      <g>
        <path d={`M66 ${top + 9} q34 -16 68 0`} fill="none" stroke="#f2b84b" strokeWidth="3.8" strokeLinecap="round" />
        <ellipse cx="84" cy={top - 13} rx="7" ry="17" transform={`rotate(-14 84 ${top - 13})`} fill="#fff" stroke="#d8b8e6" strokeWidth="2" />
        <ellipse cx="116" cy={top - 13} rx="7" ry="17" transform={`rotate(14 116 ${top - 13})`} fill="#fff" stroke="#d8b8e6" strokeWidth="2" />
        <ellipse cx="84" cy={top - 12} rx="3.2" ry="10.5" transform={`rotate(-14 84 ${top - 12})`} fill="#ffc2dc" />
        <ellipse cx="116" cy={top - 12} rx="3.2" ry="10.5" transform={`rotate(14 116 ${top - 12})`} fill="#ffc2dc" />
      </g>
    );
  }
  if (id === "hairpin") {
    return (
      <g transform={`translate(126 ${top + 11}) rotate(-28)`}>
        <rect x="-2" y="-2" width="30" height="4" rx="2" fill="#e2b04a" />
        <g fill="#ff8cc0">{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy="-4.8" rx="3.4" ry="5.2" transform={`rotate(${a})`} />)}</g>
        <circle r="2.4" fill="#ffd36e" />
        <path d="M8 2 v9 M14 2 v7" stroke="#c58bff" strokeWidth="1.6" strokeLinecap="round" />
      </g>
    );
  }
  if (id === "tiara") {
    return (
      <g>
        <path d={`M75 ${top + 6} L81 ${top - 10} L91 ${top - 1} L100 ${top - 15} L109 ${top - 1} L119 ${top - 10} L125 ${top + 6} Q100 ${top + 2} 75 ${top + 6} Z`} fill="#ffd86b" stroke="#d99a28" strokeWidth="1.8" strokeLinejoin="round" />
        <circle cx="100" cy={top - 5} r="3.4" fill="#ff5fa2" /><circle cx="84" cy={top - 1} r="2.3" fill="#8fb8ff" /><circle cx="116" cy={top - 1} r="2.3" fill="#8fb8ff" />
      </g>
    );
  }
  if (id === "nonla") {
    return (
      <g>
        <path d={`M48 ${top + 9} L100 ${top - 29} L152 ${top + 9} Q100 ${top + 19} 48 ${top + 9} Z`} fill="#f7e2a8" stroke="#c99f52" strokeWidth="2.2" strokeLinejoin="round" />
        <path d={`M70 ${top - 8} L130 ${top - 8} M60 ${top + 1} L140 ${top + 1}`} stroke="#e0b870" strokeWidth="1.5" />
        <path d={`M59 ${top + 11} q41 9 82 0`} fill="none" stroke="#ff82b6" strokeWidth="2.8" strokeLinecap="round" />
      </g>
    );
  }
  if (id === "santahat") {
    return (
      <g>
        <path d={`M66 ${top + 8} Q90 ${top - 36} 136 ${top - 25} Q120 ${top - 10} 134 ${top + 8} Z`} fill="#e8384f" stroke="#b82237" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="138" cy={top - 25} r="6.5" fill="#ffffff" stroke="#e4d6df" strokeWidth="1.3" />
        <rect x="63" y={top + 1} width="74" height="11" rx="5.5" fill="#ffffff" stroke="#e4d6df" strokeWidth="1.3" />
      </g>
    );
  }
  if (id === "beret") {
    return (
      <g>
        <ellipse cx="97" cy={top + 1} rx="35" ry="12" fill="#e8559a" stroke="#b93373" strokeWidth="1.8" />
        <path d={`M72 ${top - 4} q25 -8 48 -1`} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="97" cy={top - 11} r="3.8" fill="#e8559a" stroke="#b93373" strokeWidth="1.4" />
      </g>
    );
  }
  if (id === "starclip") {
    return (
      <g transform={`translate(125 ${top + 12}) rotate(14)`}>
        <rect x="-11" y="-2.2" width="18" height="4.4" rx="2.2" fill="#ffd36e" />
        <path d="M6 -10 l2.6 5.4 l6 0.8 l-4.4 4.2 l1 6 l-5.2 -2.8 l-5.2 2.8 l1 -6 l-4.4 -4.2 l6 -0.8z" fill="#ffda44" stroke="#d99a1e" strokeWidth="1.4" />
        <circle cx="6" cy="-1.5" r="2" fill="#ff7eb6" />
      </g>
    );
  }
  if (id === "bunny_carrot") {
    return (
      <g transform="translate(73 48) rotate(-18)">
        <path d="M0 -8 c4 0 5 16 0 22 c-5 -6 -4 -22 0 -22z" fill="#ff8f3f" stroke="#d46318" strokeWidth="1.4" />
        <path d="M-2 -8 q-4 -6 -1 -10 q3 3 1 10 q3 -8 6 -7 q-1 6 -6 7" fill="#5ec97e" />
        <path d="M-2 2 h4 M-1 8 h3" stroke="#ffd2a6" strokeWidth="1.3" strokeLinecap="round" />
      </g>
    );
  }
  if (id === "bunny_earbow") {
    return (
      <g>
        <g transform="translate(77 54) rotate(-12)"><path d="M0 0 l-10 -6 v12z M0 0 l10 -6 v12z" fill="#ff6ca8" stroke="#c93e77" strokeWidth="1.1" /><circle r="3.2" fill="#ffc2dc" /></g>
        <g transform="translate(123 54) rotate(12)"><path d="M0 0 l-10 -6 v12z M0 0 l10 -6 v12z" fill="#ff6ca8" stroke="#c93e77" strokeWidth="1.1" /><circle r="3.2" fill="#ffc2dc" /></g>
      </g>
    );
  }
  if (id === "bunny_pearl") {
    return (
      <g>
        <path d={`M69 ${top + 10} Q100 ${top - 5} 131 ${top + 10}`} fill="none" stroke="#ffe5f1" strokeWidth="3.2" />
        {[71, 80, 90, 100, 110, 120, 129].map((x, i) => (
          <circle key={x} cx={x} cy={top + 9 - Math.sin((i / 6) * Math.PI) * 10} r={i === 3 ? 4.2 : 3.4} fill="#fffdf8" stroke="#e8b8d0" strokeWidth="1.2" />
        ))}
      </g>
    );
  }
  if (id === "panda_bamboo") {
    return (
      <g transform="translate(126 53) rotate(-22)">
        <rect x="-14" y="-2.5" width="30" height="5" rx="2.5" fill="#5ec97e" stroke="#379455" strokeWidth="1.3" />
        <path d="M-5 -2.5 v5 M5 -2.5 v5" stroke="#a6f0be" strokeWidth="1.4" />
        <path d="M11 -2 q10 -10 18 -4 q-8 8 -18 4z M11 1 q12 2 16 10 q-10 -2 -16 -10z" fill="#4eb67f" stroke="#318657" strokeWidth="1.1" />
      </g>
    );
  }
  if (id === "panda_leaf") {
    return (
      <g transform={`translate(100 ${top + 2})`}>
        <path d="M0 0 q0 -10 -1 -14" stroke="#4eb67f" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        <path d="M-1 -12 q-11 -9 -16 -1 q8 7 16 1z" fill="#6ccf9a" stroke="#3f9465" strokeWidth="1.2" />
        <path d="M0 -13 q11 -10 16 -2 q-8 7 -16 2z" fill="#82e0ae" stroke="#3f9465" strokeWidth="1.2" />
      </g>
    );
  }
  if (id === "panda_beret") {
    return (
      <g>
        <ellipse cx="98" cy={top - 1} rx="33" ry="11.5" fill="#7ad8a8" stroke="#45a875" strokeWidth="1.9" />
        <circle cx="98" cy={top - 13} r="3.8" fill="#45a875" /><circle cx="114" cy={top - 1} r="4.2" fill="#ffffff" /><circle cx="114" cy={top - 1} r="2" fill="#45a875" />
      </g>
    );
  }
  if (id === "kitten_bell") {
    return (
      <g>
        <path d="M76 132 Q100 142 124 132" fill="none" stroke="#ff6e91" strokeWidth="5" strokeLinecap="round" />
        <circle cx="100" cy="142" r="7" fill="#ffd86b" stroke="#c88d1e" strokeWidth="1.7" />
        <path d="M95.5 142 h9" stroke="#9e6710" strokeWidth="1.6" strokeLinecap="round" /><circle cx="100" cy="144.8" r="1.7" fill="#9e6710" />
      </g>
    );
  }
  if (id === "kitten_yarn") {
    return (
      <g transform="translate(69 60)">
        <circle r="8.5" fill="#ff9cc6" stroke="#d95f94" strokeWidth="1.5" />
        <path d="M-6 -3 q6 5 12 0 M-5 3 q5 -4 10 0 M-2 -7 q3 7 -1 14" fill="none" stroke="#ffd8ea" strokeWidth="1.4" />
        <path d="M-11 -9 L10 9" stroke="#d4a672" strokeWidth="1.9" strokeLinecap="round" />
      </g>
    );
  }
  if (id === "kitten_fish") {
    return (
      <g transform="translate(127 60) rotate(18)">
        <ellipse cx="0" cy="0" rx="9.5" ry="5.5" fill="#7cc6f7" stroke="#448fc8" strokeWidth="1.5" />
        <path d="M7.5 0 l7.5 -4.8 v9.6z" fill="#7cc6f7" stroke="#448fc8" strokeWidth="1.4" strokeLinejoin="round" />
        <circle cx="-3.8" cy="-1.3" r="1.4" fill="#ffffff" />
      </g>
    );
  }
  if (id === "tiger_wang") {
    return (
      <g>
        <path d={`M84 ${top + 4} L88 ${top - 11} L95 ${top - 3} L100 ${top - 15} L105 ${top - 3} L112 ${top - 11} L116 ${top + 4} Z`} fill="#ffd86b" stroke="#c98e1e" strokeWidth="1.9" strokeLinejoin="round" />
        <circle cx="100" cy={top - 3} r="2.8" fill="#e8384f" />
      </g>
    );
  }
  if (id === "tiger_bandana") {
    return (
      <g>
        <path d="M56 67 Q100 54 144 67 L142 75 Q100 63 58 75 Z" fill="#ff665a" stroke="#cc3b30" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M142 69 l15 -7 l-4 8 z M142 73 l15 6 l-10 2 z" fill="#e54b40" />
        <circle cx="100" cy="64" r="2.8" fill="#ffd86b" />
      </g>
    );
  }
  if (id === "tiger_star") {
    return (
      <g transform="translate(63 54) rotate(-14)">
        <path d="M0 -8.5 l2.4 5 l5.6 0.8 l-4 3.8 l1 5.6 l-5 -2.6 l-5 2.6 l1 -5.6 l-4 -3.8 l5.6 -0.8z" fill="#ffd86b" stroke="#c98e1e" strokeWidth="1.4" />
        <circle r="2.1" fill="#ff6f91" />
      </g>
    );
  }
  if (id === "dragon_gem") {
    return (
      <g>
        <path d="M100 56 L108 67 L100 77 L92 67 Z" fill="#ff6ca8" stroke="#ffd36e" strokeWidth="1.9" strokeLinejoin="round" />
        <path d="M100 59 L104 66 L100 73 L96 66 Z" fill="#ffc8e2" opacity="0.7" />
        <circle cx="85" cy="66" r="1.7" fill="#ffd36e" /><circle cx="115" cy="66" r="1.7" fill="#ffd36e" />
      </g>
    );
  }
  if (id === "dragon_hornflow") {
    return (
      <g>
        {[[75, 36], [125, 36]].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`} fill="#ffb3d1">
            {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy="-4" rx="2.8" ry="4.3" transform={`rotate(${a})`} />)}
            <circle r="2.1" fill="#ffd36e" />
          </g>
        ))}
      </g>
    );
  }
  if (id === "dragon_halo") {
    return (
      <g>
        <ellipse cx="100" cy="13" rx="23" ry="5.5" fill="none" stroke="#ffd36e" strokeWidth="3.8" />
        <ellipse cx="100" cy="13" rx="23" ry="5.5" fill="none" stroke="#fff7c2" strokeWidth="1.4" />
        <circle cx="75" cy="11" r="2" fill="#ffd36e" /><circle cx="125" cy="11" r="2" fill="#ffd36e" />
      </g>
    );
  }
  if (id === "puppy_bone") {
    return (
      <g transform="translate(57 74) rotate(-20)">
        <rect x="-9" y="-3.2" width="18" height="6.4" rx="2" fill="#fffaf0" stroke="#c8925c" strokeWidth="1.4" />
        <circle cx="-9" cy="-3.2" r="3.2" fill="#fffaf0" stroke="#c8925c" strokeWidth="1.3" /><circle cx="-9" cy="3.2" r="3.2" fill="#fffaf0" stroke="#c8925c" strokeWidth="1.3" />
        <circle cx="9" cy="-3.2" r="3.2" fill="#fffaf0" stroke="#c8925c" strokeWidth="1.3" /><circle cx="9" cy="3.2" r="3.2" fill="#fffaf0" stroke="#c8925c" strokeWidth="1.3" />
      </g>
    );
  }
  if (id === "puppy_sunhat") {
    return (
      <g>
        <ellipse cx="100" cy="57" rx="46" ry="10.5" fill="#f7dc88" stroke="#c9a23f" strokeWidth="1.9" />
        <path d="M69 55 Q75 31 100 31 Q125 31 131 55 Z" fill="#fae49c" stroke="#c9a23f" strokeWidth="1.9" />
        <path d="M70 52 Q100 58 130 52" fill="none" stroke="#ff7eb6" strokeWidth="4.2" strokeLinecap="round" />
      </g>
    );
  }
  if (id === "puppy_bell") {
    return (
      <g>
        <path d="M76 132 Q100 142 124 132" fill="none" stroke="#6ea8e5" strokeWidth="5" strokeLinecap="round" />
        <circle cx="100" cy="142" r="7" fill="#ffd86b" stroke="#c88d1e" strokeWidth="1.7" />
        <circle cx="100" cy="143.5" r="2.1" fill="#9e6710" />
        <circle cx="97.3" cy="140.2" r="1.1" fill="#9e6710" /><circle cx="100" cy="139.2" r="1.1" fill="#9e6710" /><circle cx="102.7" cy="140.2" r="1.1" fill="#9e6710" />
      </g>
    );
  }
  return null;
}

export function Hold({ id }: { id?: string }) {
  if (!id) return null;
  const g = (c: ReactNode) => <g transform="translate(58 155)">{c}</g>;
  if (id === "lixi") return g(<g transform="rotate(-12)"><rect x="-10" y="-15" width="20" height="28" rx="3" fill="#e8384f" stroke="#b52035" strokeWidth="1.5" /><path d="M-10 -9 q10 8 20 0" fill="none" stroke="#ffd36e" strokeWidth="2" /><circle cx="0" cy="2" r="4.8" fill="#ffd36e" /><circle cx="0" cy="2" r="1.8" fill="#e8384f" /></g>);
  if (id === "lantern") return g(<g><path d="M0 -32 v7" stroke="#a0507f" strokeWidth="2" /><rect x="-6.5" y="-26" width="13" height="4.5" rx="2" fill="#ffd36e" /><ellipse cx="0" cy="-10" rx="14" ry="13" fill="#ff5a5a" stroke="#cc2f36" strokeWidth="1.3" /><path d="M-8 -21 q-4 11 0 22 M8 -21 q4 11 0 22 M0 -23 v26" stroke="#ffb8aa" strokeWidth="1.3" fill="none" /><rect x="-6.5" y="2.5" width="13" height="4.5" rx="2" fill="#ffd36e" /><path d="M0 7 v11 M-3 9 v8 M3 9 v8" stroke="#ffd36e" strokeWidth="1.5" strokeLinecap="round" /></g>);
  if (id === "fan") return g(<g transform="rotate(-14)"><path d="M0 4 v22" stroke="#b97b4b" strokeWidth="2.8" strokeLinecap="round" /><circle r="14.5" fill="#fff5fb" stroke="#ff82b8" strokeWidth="2.2" /><circle cx="-4" cy="-3" r="3.8" fill="#ffb3d1" /><circle cx="5" cy="2" r="2.8" fill="#c58bff" opacity="0.7" /><path d="M-7 6 q7 -4 13 2" stroke="#7ad8c8" strokeWidth="1.7" fill="none" /></g>);
  if (id === "rose") return g(<g transform="rotate(-10)"><path d="M0 0 v28" stroke="#53b06b" strokeWidth="2.8" strokeLinecap="round" /><path d="M0 13 q-9 -4 -11 4 q7 2 11 -4" fill="#6ccf9a" /><circle cx="0" cy="-4" r="8.5" fill="#e8384f" stroke="#b8213a" strokeWidth="1.2" /><path d="M-4.5 -6 q4.5 -5.5 9 0 q-4.5 4.5 -9 0" fill="#ff7383" /><path d="M-3 -3 q3 3 6 0" stroke="#b8213a" strokeWidth="1.3" fill="none" /></g>);
  if (id === "bouquet") return g(<g><path d="M-13 4 L0 30 L13 4 Z" fill="#c58bff" stroke="#9960d6" strokeWidth="1.4" strokeLinejoin="round" /><path d="M-4 20 l4 4 l4 -4" fill="#ffd36e" />{[[-7.5, -6, "#ff8cc0"], [0, -11.5, "#ffd36e"], [7.5, -6, "#ff6f91"]].map(([x, y, c], i) => <g key={i}><path d={`M${x} ${Number(y) + 6} V6`} stroke="#5cb874" strokeWidth="1.9" /><path d={`M${Number(x) - 4.8} ${y} q0 7.5 4.8 7.5 q4.8 0 4.8 -7.5 l-2.4 2.8 l-2.4 -3.8 l-2.4 3.8z`} fill={String(c)} /></g>)}</g>);
  if (id === "gift") return g(<g><rect x="-12" y="-7" width="24" height="20" rx="3" fill="#7ad8c8" stroke="#4ba898" strokeWidth="1.3" /><rect x="-14" y="-12" width="28" height="6.5" rx="2" fill="#5cc0b0" stroke="#4ba898" strokeWidth="1.2" /><rect x="-2.8" y="-12" width="5.6" height="25" fill="#ff5fa2" /><path d="M0 -12 q-9 -11 -11 -2 q4 4 11 2 q7 2 11 -2 q-2 -9 -11 2" fill="#ff8cc0" stroke="#d44583" strokeWidth="1" /></g>);
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
      {furn?.includes("rug") ? <ellipse cx="100" cy="202" rx="70" ry="12" fill="#ffc2dc" opacity="0.7" /> : null}
      {furn?.includes("bed") ? <g><rect x="8" y="168" width="54" height="36" rx="8" fill="#ffb3d1" /><rect x="12" y="164" width="22" height="14" rx="5" fill="#fff" /><path d="M8 184 h54" stroke="#ff8cc0" strokeWidth="3" /></g> : null}
      {furn?.includes("plant") ? <g><path d="M168 184 h20 l-3 22 h-14z" fill="#e89a6c" /><path d="M178 184 q-12 -18 -4 -30 q10 8 4 30z M178 184 q12 -16 12 -26 q-14 4 -12 26z" fill="#6ccf9a" /></g> : null}
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
        <path d="M13 13 q-3 -4 0 -8 q3 -3 0 -6" /><path d="M22 11 q-3 -4 0 -8 q3 -3 0 -5" /><path d="M31 13 q-3 -4 0 -8 q3 -3 0 -6" />
      </g>
      <path d="M22 14 c3 0 5 2 4 4 c4 0 7 3 6 6 c5 1 8 4 7 9 c-1 4 -6 7 -17 7 c-11 0 -16 -3 -17 -7 c-1 -5 2 -8 7 -9 c-1 -3 2 -6 6 -6 c-1 -2 1 -4 4 -4z" fill="#9e6b47" stroke="#6f462b" strokeWidth="2" strokeLinejoin="round" />
      <path d="M15 27 q6 -2 14 0" fill="none" stroke="#c7956d" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <circle cx="17.5" cy="30" r="1.8" fill="#4a2a52" /><circle cx="26.5" cy="30" r="1.8" fill="#4a2a52" />
      <ellipse cx="14.5" cy="32.5" rx="2.2" ry="1.2" fill="#ff9cc6" opacity="0.75" /><ellipse cx="29.5" cy="32.5" rx="2.2" ry="1.2" fill="#ff9cc6" opacity="0.75" />
      <path d="M20 33 q2 2 4 0" fill="none" stroke="#4a2a52" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function PetArt({ kind, stage, mood = "ok", equip = {}, anim = true, act = "", lite = false, dirty = false }: { kind: Kind; stage: number; mood?: string; equip?: Equip; anim?: boolean; act?: string; lite?: boolean; dirty?: boolean }) {
  const p = PAL[kind];
  const g = useRef("p" + Math.random().toString(36).slice(2, 8)).current;
  const moveCls = [lite ? "pet-lite" : "", mood === "miss" ? "pet-sad" : "", act ? "pet-act-" + act + " pet-busy" : "", "pet-move"].filter(Boolean).join(" ");

  const defs = (
    <defs>
      <radialGradient id={`${g}body`} cx="36%" cy="28%" r="72%">
        <stop offset="0%" stopColor={p.bodyHi} /><stop offset="58%" stopColor={p.body} /><stop offset="100%" stopColor={p.bodyLo} />
      </radialGradient>
      <radialGradient id={`${g}belly`} cx="45%" cy="35%" r="65%">
        <stop offset="0%" stopColor={p.belly} /><stop offset="100%" stopColor={p.bellyLo} />
      </radialGradient>
      <linearGradient id={`${g}inner`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={p.inner} /><stop offset="100%" stopColor={p.innerLo} />
      </linearGradient>
      <radialGradient id={`${g}dark`} cx="38%" cy="30%" r="70%">
        <stop offset="0%" stopColor={p.darkHi} /><stop offset="100%" stopColor={p.dark} />
      </radialGradient>
      <linearGradient id={`${g}eye`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#261433" /><stop offset="68%" stopColor="#452757" /><stop offset="100%" stopColor={p.irisLo} />
      </linearGradient>
      <radialGradient id={`${g}cheek`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={p.blush} stopOpacity="0.82" /><stop offset="100%" stopColor={p.blush} stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${g}shadow`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={p.shadow} stopOpacity="0.24" /><stop offset="70%" stopColor={p.shadow} stopOpacity="0.08" /><stop offset="100%" stopColor={p.shadow} stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${g}horn`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffe794" /><stop offset="100%" stopColor="#eca130" />
      </linearGradient>
      <linearGradient id={`${g}crest`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ff9ec4" /><stop offset="100%" stopColor="#ff68a2" />
      </linearGradient>
      <radialGradient id={`${g}egg`} cx="36%" cy="28%" r="70%">
        <stop offset="0%" stopColor="#ffffff" /><stop offset="55%" stopColor={p.egg} /><stop offset="100%" stopColor={p.egg2} stopOpacity="0.55" />
      </radialGradient>
    </defs>
  );

  const fx = anim ? (
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
        <circle className="pet-fx-bit" cx="84" cy="120" r="3.4" fill="#ffb86c" /><circle className="pet-fx-bit" cx="116" cy="118" r="3.8" fill="#ff8cc0" />
        <rect className="pet-fx-bit" x="92" y="126" width="5" height="5" rx="1.5" fill="#ffd36e" /><circle className="pet-fx-bit" cx="106" cy="128" r="3" fill="#f7a072" />
      </g>
      <g className="pet-fx-bubbles">
        <g className="pet-fx-bit"><circle cx="66" cy="116" r="8" fill="rgba(180,238,255,0.65)" stroke="#88d8f5" strokeWidth="1.6" /><path d="M63 112 a3 3 0 0 1 4 -1" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" fill="none" /></g>
        <g className="pet-fx-bit"><circle cx="136" cy="108" r="9.5" fill="rgba(195,244,255,0.65)" stroke="#88d8f5" strokeWidth="1.6" /><path d="M132 103 a3.5 3.5 0 0 1 5 -1" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" fill="none" /></g>
        <g className="pet-fx-bit"><circle cx="96" cy="84" r="6.5" fill="rgba(210,248,255,0.7)" stroke="#9ae2fa" strokeWidth="1.4" /></g>
        <g className="pet-fx-bit"><circle cx="122" cy="146" r="7" fill="rgba(190,240,255,0.65)" stroke="#88d8f5" strokeWidth="1.4" /></g>
        <g className="pet-fx-bit"><circle cx="76" cy="152" r="5.5" fill="rgba(210,248,255,0.7)" stroke="#9ae2fa" strokeWidth="1.4" /></g>
      </g>
    </g>
  ) : null;

  if (stage <= 0) {
    return (
      <g className={moveCls} data-pet-act={act || "idle"}>
        {defs}
        <ellipse cx="100" cy="202" rx="44" ry="9" fill={`url(#${g}shadow)`} />
        <g className={anim && !act ? "pet-wobble" : undefined} style={{ transformOrigin: "100px 200px" }}>
          <path d="M100 84 C128 84, 146 122, 142 158 C139 186, 122 200, 100 200 C78 200, 61 186, 58 158 C54 122, 72 84, 100 84 Z" fill={`url(#${g}egg)`} stroke={p.stroke} strokeWidth="2.5" strokeLinejoin="round" />
          <ellipse cx="82" cy="112" rx="10" ry="18" transform="rotate(20 82 112)" fill="rgba(255,255,255,0.65)" />
          {kind === "bunny" ? <g fill={p.egg2} opacity="0.82"><ellipse cx="78" cy="136" rx="7" ry="10" transform="rotate(-12 78 136)" /><ellipse cx="118" cy="162" rx="8.5" ry="6.5" transform="rotate(14 118 162)" /><circle cx="96" cy="182" r="5" /></g> : null}
          {kind === "panda" ? <g fill={p.egg2} opacity="0.82"><circle cx="77" cy="134" r="8.5" /><circle cx="122" cy="132" r="6.8" /><circle cx="108" cy="178" r="7.5" /></g> : null}
          {kind === "kitten" ? <g fill="none" stroke={p.egg2} strokeWidth="5" strokeLinecap="round" opacity="0.82"><path d="M64 142 q36 -11 72 0" /><path d="M61 164 q39 -11 78 0" /></g> : null}
          {kind === "tiger" ? <g fill="none" stroke={p.egg2} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"><path d="M61 140 l11 5 l-9 5" /><path d="M139 140 l-11 5 l9 5" /><path d="M64 170 l13 4 l-11 5" /><path d="M136 170 l-13 4 l11 5" /><path d="M92 126 h16 M100 120 v14" /></g> : null}
          {kind === "dragon" ? <g fill="none" stroke={p.egg2} strokeWidth="3.2" strokeLinecap="round">{[[77, 134], [100, 134], [123, 134], [66, 155], [89, 155], [111, 155], [134, 155], [77, 176], [100, 176], [123, 176]].map(([x, y], i) => <path key={i} d={`M${x - 9} ${y} q9 9 18 0`} />)}<circle cx="100" cy="113" r="5" fill="#ffd36e" stroke="none" /></g> : null}
          {kind === "puppy" ? <g fill={p.egg2} opacity="0.85"><ellipse cx="100" cy="162" rx="10" ry="8" /><circle cx="87" cy="148" r="4" /><circle cx="96" cy="143" r="4" /><circle cx="105" cy="143" r="4" /><circle cx="114" cy="148" r="4" /><circle cx="74" cy="126" r="5.5" opacity="0.65" /><circle cx="126" cy="182" r="6.5" opacity="0.65" /></g> : null}
          <path d="M86 105 l7 7 l-6 6 l8 5" fill="none" stroke={p.stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        {fx}
      </g>
    );
  }

  const s = stage === 1 ? 0.68 : stage === 2 ? 0.85 : 1;
  const limb = kind === "panda" ? `url(#${g}dark)` : `url(#${g}body)`;
  const hasOutfit = Boolean(equip.outfit) || stage === 4;

  return (
    <g className={moveCls} data-pet-act={act || "idle"}>
      {defs}
      <ellipse cx="100" cy="202" rx={46 * s} ry={8.5 * s} fill={`url(#${g}shadow)`} />
      <g className={anim && !act ? "pet-bounce" : undefined} style={{ transformOrigin: "100px 205px" }}>
        <g transform={`translate(100 202) scale(${s}) translate(-100 -202)`}>
          {kind === "kitten" ? (
            <g className="pet-tail">
              <path d="M127 178 C153 180, 168 159, 159 138 C156 132, 149 134, 152 141 C157 156, 146 170, 128 170 Z" fill={`url(#${g}body)`} stroke={p.stroke} strokeWidth="2.1" strokeLinejoin="round" />
              <circle cx="155.5" cy="138" r="4.2" fill="#fffaf7" />
            </g>
          ) : null}
          {kind === "tiger" ? (
            <g className="pet-tail">
              <path d="M127 178 C153 180, 168 159, 159 138 C156 132, 149 134, 152 141 C157 156, 146 170, 128 170 Z" fill={`url(#${g}body)`} stroke={p.stroke} strokeWidth="2.1" strokeLinejoin="round" />
              <path d="M141 171 l4 5 M151 161 l5 3 M155 149 l5 1" stroke={p.mark} strokeWidth="2.8" strokeLinecap="round" />
              <circle cx="155.5" cy="138" r="4.2" fill={p.mark} />
            </g>
          ) : null}
          {kind === "puppy" ? (
            <g className="pet-tail">
              <path d="M126 176 C146 176, 155 160, 151 148 C149 144, 143 145, 144 150 C146 159, 139 169, 126 168 Z" fill={`url(#${g}body)`} stroke={p.stroke} strokeWidth="2.1" strokeLinejoin="round" />
            </g>
          ) : null}
          {kind === "dragon" ? (
            <g className="pet-tail">
              <path d="M126 181 C152 184, 171 169, 169 145 C169 140, 162 140, 162 146 C161 162, 148 172, 127 171 Z" fill={`url(#${g}body)`} stroke={p.stroke} strokeWidth="2.1" strokeLinejoin="round" />
              <path d="M166 146 q-11 -9 -4 -21 q4 7 9 3 q2 11 -5 18 z" fill={`url(#${g}crest)`} stroke="#d4568a" strokeWidth="1.4" strokeLinejoin="round" />
            </g>
          ) : null}
          {kind === "bunny" ? (
            <g className="pet-tail">
              <path d="M126 174 a7.5 7.5 0 1 1 8 8 a6.5 6.5 0 0 1 -8 -8z" fill="#ffffff" stroke={p.stroke} strokeWidth="2" />
            </g>
          ) : null}
          {kind === "panda" ? (
            <g className="pet-tail">
              <circle cx="131" cy="178" r="7.5" fill={`url(#${g}dark)`} stroke={p.stroke} strokeWidth="1.9" />
            </g>
          ) : null}

          <g>
            <ellipse cx="83" cy="195" rx="11.5" ry="7.2" transform="rotate(-6 83 195)" fill={limb} stroke={p.stroke} strokeWidth="2.1" />
            <ellipse cx="117" cy="195" rx="11.5" ry="7.2" transform="rotate(6 117 195)" fill={limb} stroke={p.stroke} strokeWidth="2.1" />
            {kind !== "panda" ? (
              <g fill={p.inner} opacity="0.65">
                <ellipse cx="82" cy="195.5" rx="4.5" ry="2.6" /><ellipse cx="118" cy="195.5" rx="4.5" ry="2.6" />
              </g>
            ) : null}
          </g>

          <path d="M76 131 C68 142, 66 164, 70 179 C74 189, 86 193, 100 193 C114 193, 126 189, 130 179 C134 164, 132 142, 124 131 Q100 137 76 131 Z" fill={`url(#${g}body)`} stroke={p.stroke} strokeWidth="2.3" strokeLinejoin="round" />
          <ellipse cx="100" cy="166" rx="19" ry="18" fill={`url(#${g}belly)`} />
          {kind === "panda" && !hasOutfit ? (
            <path d="M75 133 C72 140, 74 146, 84 145 C92 144, 96 140, 100 140 C104 140, 108 144, 116 145 C126 146, 128 140, 125 133 Q100 138 75 133 Z" fill={`url(#${g}dark)`} />
          ) : null}
          {kind === "tiger" ? (
            <g stroke={p.mark} strokeWidth="2.8" strokeLinecap="round" fill="none">
              <path d="M69 156 l9 2" /><path d="M70 168 l9 0.5" /><path d="M131 156 l-9 2" /><path d="M130 168 l-9 0.5" />
            </g>
          ) : null}
          {kind === "dragon" ? (
            <g fill="none" stroke="#ecd17a" strokeWidth="1.8" strokeLinecap="round">
              <path d="M84 157 q16 3 32 0" /><path d="M82 167 q18 3 36 0" /><path d="M85 177 q15 3 30 0" />
            </g>
          ) : null}
          <ellipse cx="100" cy="136.5" rx="22" ry="5.5" fill={p.shadow} opacity="0.22" />

          <Outfit id={equip.outfit} stage={stage} />

          <g className="pet-arm-l">
            <path d="M74 139 C61 143, 55 155, 60 163 C64 169, 73 166, 76 155 Z" fill={limb} stroke={p.stroke} strokeWidth="2.1" strokeLinejoin="round" />
          </g>
          <g className="pet-arm-r">
            <path d="M126 139 C139 143, 145 155, 140 163 C136 169, 127 166, 124 155 Z" fill={limb} stroke={p.stroke} strokeWidth="2.1" strokeLinejoin="round" />
          </g>

          <Hold id={equip.hold} />

          {stage === 4 ? (
            <g transform="translate(142 152) rotate(-18)">
              <rect x="-5.5" y="-15" width="11" height="30" rx="5" fill="#fff8e4" stroke="#d8b464" strokeWidth="1.8" />
              <path d="M-5.5 0 h11" stroke="#ff5fa2" strokeWidth="3.2" />
            </g>
          ) : null}

          <g className="pet-ears"><Ears k={kind} g={g} /></g>

          <path d="M100 52 C127 52, 146 67, 148 91 C150 115, 132 135, 100 135 C68 135, 50 115, 52 91 C54 67, 73 52, 100 52 Z" fill={`url(#${g}body)`} stroke={p.stroke} strokeWidth="2.3" strokeLinejoin="round" />
          <ellipse cx="83" cy="67" rx="14" ry="5" transform="rotate(-16 83 67)" fill="rgba(255,255,255,0.24)" />

          <Face k={kind} stage={stage} mood={mood} g={g} />
          <g className="pet-ears-front"><EarsFront k={kind} g={g} /></g>

          {stage === 2 && !equip.acc ? (
            <g>
              <ellipse cx="100" cy="56" rx="28" ry="8.5" fill="#ffd86b" stroke="#d99f26" strokeWidth="1.7" />
              <path d="M77 55 q23 -25 46 0 Z" fill="#ffe184" stroke="#d99f26" strokeWidth="1.7" strokeLinejoin="round" />
              <circle cx="100" cy="43" r="2.5" fill="#ffffff" />
            </g>
          ) : null}
          {stage === 3 && !equip.acc ? (
            <g transform={kind === "dragon" ? "translate(131 64) rotate(28)" : "translate(125 57) rotate(24)"}>
              <path d="M0 0 l-10.5 -6 v12 z M0 0 l10.5 -6 v12 z" fill="#ff84ba" stroke="#c8437f" strokeWidth="1.4" strokeLinejoin="round" />
              <circle r="3.3" fill="#ffc2de" stroke="#c8437f" strokeWidth="1.3" />
            </g>
          ) : null}

          <Acc id={equip.acc} k={kind} />

          {stage === 4 ? (
            <g>
              <path d="M62 49 L100 34 L138 49 L100 64 Z" fill="#3d2d58" stroke="#281c3d" strokeWidth="1.7" strokeLinejoin="round" />
              <rect x="85" y="53" width="30" height="11" rx="3" fill="#3d2d58" stroke="#281c3d" strokeWidth="1.5" />
              <path d="M136 50 v19" stroke="#ffd86b" strokeWidth="2.4" strokeLinecap="round" />
              <circle cx="136" cy="70" r="3.8" fill="#ffd86b" />
            </g>
          ) : null}

          {stage === 1 ? (
            <g>
              <path d="M52 192 q48 22 96 0 l-7 -15 l-10 8 l-10 -10 l-11 10 l-10 -10 l-11 10 l-10 -10 l-10 8 z" fill={`url(#${g}egg)`} stroke={p.stroke} strokeWidth="2.2" strokeLinejoin="round" />
            </g>
          ) : null}

          {dirty ? (
            <g className="pet-mud" opacity="0.82">
              <ellipse cx="64" cy="114" rx="6.8" ry="4.2" transform="rotate(-14 64 114)" fill="#b57f50" />
              <circle cx="62" cy="113" r="1.4" fill="#8f5c34" />
              <circle cx="122" cy="69" r="4.3" fill="#b57f50" />
              <ellipse cx="86" cy="175" rx="8" ry="4.8" transform="rotate(10 86 175)" fill="#b57f50" />
              <circle cx="89" cy="175" r="1.5" fill="#8f5c34" />
              <circle cx="114" cy="182" r="4" fill="#b57f50" />
            </g>
          ) : null}
        </g>

        {mood === "miss" ? (
          <g>
            <circle cx="160" cy="48" r="4" fill="#fff" stroke={p.stroke} strokeWidth="1.5" />
            <circle cx="170" cy="34" r="6" fill="#fff" stroke={p.stroke} strokeWidth="1.5" />
            <ellipse cx="174" cy="16" rx="22" ry="13" fill="#fff" stroke={p.stroke} strokeWidth="1.8" />
            <path d="M164 18 q10 8 20 0" fill="#ffd36e" stroke="#e2a840" />
            <path d="M166 14 h16" stroke="#e2a840" strokeWidth="2" />
          </g>
        ) : null}
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
