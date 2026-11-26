import { useEffect } from "./kit";

export type FxKind = "fireworks" | "hearts" | "stars";
const KINDS: FxKind[] = ["fireworks", "hearts", "stars"];
const COLORS = ["#ff4d94", "#ff7eb6", "#a864ff", "#ffb830", "#49b6ff", "#45c486"];

export function pickFx(): FxKind {
  try {
    if (typeof location !== "undefined") {
      const p = new URLSearchParams(location.search).get("fx");
      if (p === "fireworks" || p === "hearts" || p === "stars") return p;
    }
  } catch (e) { /* ignore */ }
  return KINDS[Math.floor(Math.random() * KINDS.length)];
}

const BURSTS = [
  { x: 24, y: 24, d: 0.0, s: 1.05 },
  { x: 76, y: 22, d: 0.25, s: 1.0 },
  { x: 50, y: 38, d: 0.45, s: 1.2 },
  { x: 22, y: 58, d: 0.8, s: 1.0 },
  { x: 78, y: 55, d: 1.05, s: 1.05 },
  { x: 46, y: 70, d: 1.4, s: 1.1 },
  { x: 60, y: 25, d: 1.75, s: 1.0 },
];

const RAYS = Array.from({ length: 12 }, (_, i) => ({
  deg: i * 30,
  dist: i % 2 === 0 ? 78 : 54,
  c: COLORS[i % COLORS.length],
}));

const HEARTS = Array.from({ length: 34 }, (_, i) => ({
  left: 4 + ((i * 31) % 90),
  size: 20 + ((i * 11) % 22),
  delay: ((i * 0.13) % 0.95).toFixed(2),
  dur: (2.2 + (i % 5) * 0.24).toFixed(2),
  sway: (i % 2 === 0 ? 1 : -1) * (14 + (i % 4) * 7),
  rot: (i % 2 === 0 ? 1 : -1) * (10 + (i % 3) * 6),
  c: COLORS[i % 4],
  topStatic: 14 + ((i * 23) % 72),
}));

const STARS = Array.from({ length: 34 }, (_, i) => ({
  left: 5 + ((i * 29) % 90),
  top: 8 + ((i * 19) % 82),
  size: 16 + ((i * 11) % 24),
  delay: ((i * 0.14) % 1.2).toFixed(2),
  dur: (1.2 + (i % 4) * 0.25).toFixed(2),
  c: COLORS[i % COLORS.length],
  four: i % 2 === 0,
}));

export function QuizCelebrate({ fx, seq, vi, onDone }: { fx: FxKind; seq: number; vi?: boolean; onDone: () => void }) {
  useEffect(() => {
    const reduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(onDone, reduced ? 2400 : 3700);
    return () => window.clearTimeout(t);
  }, [seq]);

  return (
    <div key={seq} className={`celeb-overlay celeb-${fx}`} data-fx={fx} aria-hidden="true">
      <div className="celeb-pill">
        <span>🎉 10/10</span>
        <span>·</span>
        <span lang="zh-Hans">{vi ? "满分！Tuyệt vời!" : "满分！Perfect!"}</span>
      </div>

      {fx === "fireworks" ? BURSTS.map((b, bi) => (
        <div key={bi} className="celeb-burst" style={{ left: `${b.x}%`, top: `${b.y}%`, transform: `scale(${b.s})` }}>
          <div className="celeb-ring" style={{ borderColor: COLORS[bi % COLORS.length], animationDelay: `${b.d}s` }} />
          <div className="celeb-core" style={{ background: COLORS[bi % COLORS.length], animationDelay: `${b.d}s` }} />
          {RAYS.map((r, ri) => (
            <span
              key={ri}
              className="celeb-ray"
              style={{
                color: COLORS[(ri + bi) % COLORS.length],
                background: COLORS[(ri + bi) % COLORS.length],
                animationDelay: `${b.d}s`,
                ["--deg" as string]: `${r.deg}deg`,
                ["--dist" as string]: `${r.dist}px`,
              }}
            />
          ))}
        </div>
      )) : null}

      {fx === "hearts" ? HEARTS.map((h, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className="celeb-heart"
          style={{
            left: `${h.left}%`,
            width: h.size,
            height: h.size,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.dur}s`,
            ["--sx" as string]: `${h.sway}px`,
            ["--rot" as string]: `${h.rot}deg`,
            ["--st" as string]: `${h.topStatic}%`,
          }}
        >
          <path d="M12 21.2 C12 21.2 3 15.2 3 8.8 A5 5 0 0 1 12 5.9 A5 5 0 0 1 21 8.8 C21 15.2 12 21.2 12 21.2 Z" fill={h.c} stroke="#fff" strokeWidth="1.2" />
        </svg>
      )) : null}

      {fx === "stars" ? STARS.map((st, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className="celeb-star"
          style={{
            left: `${st.left}%`,
            top: `${st.top}%`,
            width: st.size,
            height: st.size,
            animationDelay: `${st.delay}s`,
            animationDuration: `${st.dur}s`,
          }}
        >
          {st.four
            ? <path d="M12 1.5 L14.8 9.2 L22.5 12 L14.8 14.8 L12 22.5 L9.2 14.8 L1.5 12 L9.2 9.2 Z" fill={st.c} stroke="#fff" strokeWidth="1.1" strokeLinejoin="round" />
            : <path d="M12 2 L14.9 8.2 L21.7 9.1 L16.7 13.8 L18 20.6 L12 17.3 L6 20.6 L7.3 13.8 L2.3 9.1 L9.1 8.2 Z" fill={st.c} stroke="#fff" strokeWidth="1.1" strokeLinejoin="round" />}
        </svg>
      )) : null}
    </div>
  );
}
