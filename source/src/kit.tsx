// Minimal standalone re-implementation of the page kit used by the HSK 4 pages.
import React, { createContext, useContext, useEffect, useLayoutEffect, useState, useMemo, useRef, useCallback, useReducer, Fragment } from "react";
import type { ReactNode, CSSProperties } from "react";
export { useState, useMemo, useEffect, useLayoutEffect, useRef, useCallback, useReducer, Fragment };
export type { ReactNode, CSSProperties };

type TS = { fontSize: string; lineHeight: string; letterSpacing: string };
const ts = (s: number, l: number): TS => ({ fontSize: `${s}px`, lineHeight: `${l}px`, letterSpacing: "0px" });
const FONT = `ui-rounded, "SF Pro Rounded", "Nunito", "Quicksand", "Varela Round", "Segoe UI", system-ui, -apple-system, Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", "Noto Sans CJK SC", sans-serif`;
export const ZH_FONT = `"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", "Noto Sans CJK SC", "Source Han Sans SC", "Heiti SC", sans-serif`;
function mk(_dark: boolean) {
  const ink = "74,42,82";
  const a = (p: number) => `rgba(${ink},${p})`;
  return {
    kind: "light",
    bg: { base: "#fff7fb", subtle: "#fdeef6", elevated: "#ffffff" },
    text: { primary: "#43284d", secondary: "rgba(74,42,82,0.72)", tertiary: "rgba(74,42,82,0.52)", onColor: "#ffffff", onPrimary: "#ffffff", accent: "#d63f8c", success: "#1f9d74", warning: "#b8660a", danger: "#d1305a", accentDeep: "#8f2160", successDeep: "#0f6b4d", warningDeep: "#7a4300", dangerDeep: "#8a1838" },
    fill: { primary: "#e8559a", primaryHover: "#d63f8c", secondary: "rgba(232,85,154,0.10)", secondaryHover: "rgba(232,85,154,0.18)", hover: "rgba(232,85,154,0.06)", pressed: "rgba(232,85,154,0.14)", accent: "#e8559a", controlChecked: "#e8559a", accentSubtle: "rgba(232,85,154,0.10)", successSubtle: "rgba(64,190,150,0.14)", warningSubtle: "rgba(255,170,90,0.18)", dangerSubtle: "rgba(232,70,110,0.12)" },
    border: { subtle: a(0.07), weak: a(0.1), default: "rgba(214,120,170,0.28)", strong: "rgba(214,90,160,0.5)", focus: "rgba(214,63,140,0.6)" },
    font: { family: FONT, mono: "ui-monospace, SFMono-Regular, Menlo, monospace", heading1: ts(28, 36), heading2: ts(21, 28), heading3: ts(17, 24), body1: ts(16, 25), subtext: ts(15, 23), table: ts(14, 20), metric: ts(28, 34), body2: ts(15, 22), label: ts(13, 18), caption: ts(12, 16), code: ts(13, 20) },
    weight: { regular: 400, medium: 500, semibold: 700 },
    radius: { sm: 8, md: 12, lg: 18, xl: 24, full: 9999 },
    motion: { hover: "160ms", easing: "ease" },
    dataviz: { categorical: ["#e8559a", "#a78bfa", "#ffa877"], other: "#c4b5c9", negative: "#e5484d", singleSeriesRest: "#f8c6dd", areaAlpha: "29", bandAlpha: "40", blueTint: "#e8559a29", blue5: "#8f2160", sequential: ["#fde3ef", "#f8b8d6", "#f087ba", "#e8559a", "#b8306f"], diverging: ["#e5484d", "#eee", "#a78bfa"] },
    chart: ["#e8559a", "#a78bfa", "#ffa877", "#c4b5c9"],
  };
}
export type GrokTheme = ReturnType<typeof mk>;
const mq = typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
const ThemeCtx = createContext<GrokTheme>(mk(false));
export function ThemeRoot({ children }: { children?: ReactNode }) {
  const t = useMemo(() => mk(false), []);
  useEffect(() => { void mq; document.body.style.color = t.text.primary; }, [t]);
  return <ThemeCtx.Provider value={t}>{children}</ThemeCtx.Provider>;
}
export function useGrokTheme(): GrokTheme { return useContext(ThemeCtx); }

const Depth = createContext<number>(0);
const GAP = 20;
const stack: CSSProperties = { display: "flex", flexDirection: "column", gap: GAP, minWidth: 0 };

export function Mascot({ size = 92 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" style={{ flex: "0 0 auto", display: "block" }}>
      <defs>
        <radialGradient id="mBody" cx="50%" cy="40%" r="60%"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#ffe6f1" /></radialGradient>
        <linearGradient id="mHeart" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ff8cc0" /><stop offset="1" stopColor="#e8559a" /></linearGradient>
      </defs>
      <ellipse cx="60" cy="112" rx="30" ry="5" fill="#e8559a" opacity="0.12" />
      <ellipse cx="43" cy="30" rx="10" ry="26" transform="rotate(-12 43 30)" fill="url(#mBody)" stroke="#f3a7c9" strokeWidth="2.5" />
      <ellipse cx="43" cy="32" rx="4.5" ry="17" transform="rotate(-12 43 32)" fill="#ffc2dc" />
      <ellipse cx="77" cy="30" rx="10" ry="26" transform="rotate(12 77 30)" fill="url(#mBody)" stroke="#f3a7c9" strokeWidth="2.5" />
      <ellipse cx="77" cy="32" rx="4.5" ry="17" transform="rotate(12 77 32)" fill="#ffc2dc" />
      <path d="M86 26 l4 -7 l4 7 l-4 7z" fill="#c4a7ff" />
      <circle cx="90" cy="26" r="2" fill="#fff" />
      <ellipse cx="60" cy="76" rx="36" ry="33" fill="url(#mBody)" stroke="#f3a7c9" strokeWidth="2.5" />
      <ellipse cx="46" cy="72" rx="4" ry="5" fill="#4a2a52" />
      <ellipse cx="74" cy="72" rx="4" ry="5" fill="#4a2a52" />
      <circle cx="47.5" cy="70" r="1.5" fill="#fff" /><circle cx="75.5" cy="70" r="1.5" fill="#fff" />
      <ellipse cx="38" cy="82" rx="6" ry="3.5" fill="#ffb3d1" opacity="0.8" />
      <ellipse cx="82" cy="82" rx="6" ry="3.5" fill="#ffb3d1" opacity="0.8" />
      <path d="M55 81 q5 5 10 0" fill="none" stroke="#4a2a52" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M60 104 c-9 -7 -15 -11 -15 -17 a6.5 6.5 0 0 1 15 -3 a6.5 6.5 0 0 1 15 3 c0 6 -6 10 -15 17z" fill="url(#mHeart)" />
      <text x="60" y="97" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff" fontFamily="ui-rounded, sans-serif">4</text>
      <path d="M14 46 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2z" fill="#ffc46b" />
      <path d="M104 58 l1.5 3.5 l3.5 1.5 l-3.5 1.5 l-1.5 3.5 l-1.5 -3.5 l-3.5 -1.5 l3.5 -1.5z" fill="#c4a7ff" />
    </svg>
  );
}

export function Sparkle({ color = "#ffb84d", size = 14 }: { color?: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" style={{ display: "inline-block", verticalAlign: "-2px" }}><path d="M10 0 l2.4 7.6 l7.6 2.4 l-7.6 2.4 l-2.4 7.6 l-2.4 -7.6 l-7.6 -2.4 l7.6 -2.4z" fill={color} /></svg>;
}

export function Page({ title, summary, width, lang, children }: { title: string; summary?: string; width?: "column" | "wide" | "full"; lang?: string; children?: ReactNode }) {
  const t = useGrokTheme();
  useEffect(() => { document.title = title; if (lang) document.documentElement.lang = lang; }, [title, lang]);
  const max = width === "full" ? 1600 : width === "wide" ? 1280 : 700;
  return (
    <main lang={lang} style={{ maxWidth: max, margin: "0 auto", padding: "14px 14px 64px", fontFamily: t.font.family, color: t.text.primary }}>
      <header className="hero" style={{ position: "relative", marginBottom: 22, padding: "22px 20px", borderRadius: 28, background: "linear-gradient(135deg, #ffe1ee 0%, #f3e6ff 55%, #ffe9dc 100%)", boxShadow: "0 10px 30px rgba(232,85,154,0.16), inset 0 0 0 2px rgba(255,255,255,0.7)", overflow: "hidden" }}>
        <span aria-hidden className="hero-deco" style={{ position: "absolute", right: 14, top: 10, fontSize: 18, color: "#f48fbf", letterSpacing: 6 }}>♡ ✿ ♡</span>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <Mascot />
          <div style={{ flex: "1 1 260px", minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: t.font.heading1.fontSize, lineHeight: t.font.heading1.lineHeight, fontWeight: 800, color: "#8f2160", letterSpacing: "0.3px" }}><Sparkle color="#ffb84d" size={18} /> {title}</h1>
            {summary ? <p style={{ margin: "10px 0 0", fontSize: t.font.subtext.fontSize, lineHeight: t.font.subtext.lineHeight, color: t.text.secondary }}>{summary}</p> : null}
          </div>
        </div>
      </header>
      <div style={stack}>{children}</div>
    </main>
  );
}

export function Section({ heading, caption, id, children }: { heading?: string; caption?: string; id?: string; children?: ReactNode }) {
  const t = useGrokTheme();
  const d = useContext(Depth);
  const hs = d === 0 ? t.font.heading2 : t.font.heading3;
  const H = (d === 0 ? "h2" : "h3") as "h2" | "h3";
  return (
    <section id={id} className={d === 0 ? "card" : undefined} style={d === 0 ? { ...stack, gap: 14, padding: "20px 18px", borderRadius: 24, background: "rgba(255,255,255,0.92)", boxShadow: "0 8px 26px rgba(214,90,160,0.12), 0 1px 0 rgba(255,255,255,0.9) inset", border: "1.5px solid rgba(248,190,220,0.55)" } : { ...stack, gap: 14, marginTop: 6 }}>
      {heading || caption ? (
        <div>
          {heading ? <H style={{ margin: 0, fontSize: hs.fontSize, lineHeight: hs.lineHeight, fontWeight: 800, color: d === 0 ? "#8f2160" : t.text.primary }}>{d === 0 ? <span aria-hidden style={{ color: "#f07ab3", marginRight: 6 }}>✿</span> : null}{heading}</H> : null}
          {caption ? <div style={{ marginTop: 4, fontSize: t.font.label.fontSize, lineHeight: t.font.label.lineHeight, color: t.text.secondary }}>{caption}</div> : null}
        </div>
      ) : null}
      <Depth.Provider value={d + 1}>{children}</Depth.Provider>
    </section>
  );
}

export function Text({ children }: { children?: ReactNode }) {
  const t = useGrokTheme();
  return <p style={{ margin: 0, fontSize: t.font.body1.fontSize, lineHeight: t.font.body1.lineHeight, color: t.text.primary }}>{children}</p>;
}

type SegOpt<T extends string> = T | { value: T; label: string; count?: number };
export function Segmented<T extends string = string>({ options, value, onChange }: { options: SegOpt<T>[]; value: T; onChange: (v: T) => void }) {
  const t = useGrokTheme();
  return (
    <div role="tablist" style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: 6, borderRadius: 22, background: "rgba(255,255,255,0.75)", boxShadow: "0 4px 16px rgba(214,90,160,0.12)", border: "1.5px solid rgba(248,190,220,0.6)", alignSelf: "flex-start", maxWidth: "100%" }}>
      {options.map((o) => {
        const v = (typeof o === "string" ? o : o.value) as T;
        const label = typeof o === "string" ? o : o.label;
        const count = typeof o === "string" ? undefined : o.count;
        const on = v === value;
        return (
          <button key={v} role="tab" aria-selected={on} onClick={() => onChange(v)} style={{ border: "none", cursor: "pointer", padding: "8px 14px", borderRadius: 9999, background: on ? "linear-gradient(135deg, #ff8cc0, #c58bff)" : "rgba(253,232,243,0.7)", boxShadow: on ? "0 4px 12px rgba(232,85,154,0.3)" : "none", color: on ? "#ffffff" : "#7a3a66", fontFamily: t.font.family, fontSize: t.font.label.fontSize, lineHeight: t.font.label.lineHeight, fontWeight: on ? t.weight.semibold : t.weight.medium, textAlign: "left" }}>
            {label}{count !== undefined ? <span style={{ marginLeft: 6, opacity: 0.75 }}>{count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

type SelOpt<T extends string> = T | { value: T; label: string };
export function Select<T extends string = string>({ label, options, value, onChange, disabled }: { label?: string; options: SelOpt<T>[]; value: T; onChange: (v: T) => void; placeholder?: string; disabled?: boolean }) {
  const t = useGrokTheme();
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 420 }}>
      {label ? <span style={{ fontSize: t.font.label.fontSize, color: t.text.secondary }}>{label}</span> : null}
      <select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value as T)} style={{ padding: "10px 14px", borderRadius: 16, border: `1.5px solid ${t.border.default}`, background: "#fff", color: t.text.primary, fontFamily: t.font.family, fontSize: t.font.body2.fontSize, maxWidth: "100%" }}>
        {options.map((o) => { const v = typeof o === "string" ? o : o.value; const l = typeof o === "string" ? o : o.label; return <option key={v} value={v}>{l}</option>; })}
      </select>
    </label>
  );
}

export function Button({ label, onClick, variant, disabled }: { label: string; onClick: () => void; variant?: "primary" | "quiet"; disabled?: boolean }) {
  const t = useGrokTheme();
  const p = variant === "primary";
  return (
    <button onClick={onClick} disabled={disabled} style={{ cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1, padding: "9px 16px", borderRadius: 9999, border: p ? "none" : "1.5px solid rgba(232,85,154,0.25)", background: p ? "linear-gradient(135deg, #ff7eb6, #e8559a)" : "#fff3f9", boxShadow: p ? "0 4px 12px rgba(232,85,154,0.28)" : "none", color: p ? "#ffffff" : "#8f2160", fontFamily: t.font.family, fontSize: t.font.label.fontSize, lineHeight: t.font.label.lineHeight, fontWeight: t.weight.semibold, maxWidth: "100%", textAlign: "center" }}>{label}</button>
  );
}

export function Callout({ lead, tone, children }: { lead?: string; tone?: "info" | "success" | "warning" | "danger"; children?: ReactNode }) {
  const t = useGrokTheme();
  const map = { info: [t.fill.accentSubtle, t.text.accent, t.text.accentDeep, "ℹ"], success: [t.fill.successSubtle, t.text.success, t.text.successDeep, "✓"], warning: [t.fill.warningSubtle, t.text.warning, t.text.warningDeep, "!"], danger: [t.fill.dangerSubtle, t.text.danger, t.text.dangerDeep, "!"] } as const;
  const m = tone ? map[tone] : null;
  return (
    <div style={{ display: "flex", gap: 10, padding: "14px 16px", borderRadius: 18, background: m ? m[0] : t.fill.secondary }}>
      {m ? <span aria-hidden style={{ flex: "0 0 auto", width: 20, height: 20, borderRadius: 9999, border: `1.5px solid ${m[1]}`, color: m[1], fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>{m[3]}</span> : null}
      <div style={{ minWidth: 0 }}>
        {lead ? <div style={{ fontWeight: t.weight.semibold, color: m ? m[1] : t.text.primary, fontSize: t.font.body2.fontSize, lineHeight: t.font.body2.lineHeight, marginBottom: 4 }}>{lead}</div> : null}
        <div style={{ color: m ? m[2] : t.text.primary, fontSize: t.font.body2.fontSize, lineHeight: t.font.body2.lineHeight }}>{children}</div>
      </div>
    </div>
  );
}

type Cell = string | { text: string; tone?: "success" | "warning" | "danger" } | ReactNode;
export function Table({ columns, rows, align }: { columns: string[]; rows: Cell[][]; emphasis?: number; align?: ("auto" | "start" | "end")[] }) {
  const t = useGrokTheme();
  const isNum = (c: Cell) => typeof c === "string" && /^[\d\s.,/%+\-—约]+$/.test(c) && c.trim() !== "";
  const colNum = columns.map((_, j) => rows.length > 0 && rows.every((r) => r[j] === "" || r[j] === undefined || isNum(r[j])) && rows.some((r) => isNum(r[j])));
  const al = (j: number) => { const a = align?.[j]; if (a === "start") return "left"; if (a === "end") return "right"; return j > 0 && colNum[j] ? "right" : "left"; };
  const show = (c: Cell): ReactNode => { if (c && typeof c === "object" && "text" in (c as object) && !React.isValidElement(c)) { const o = c as { text: string; tone?: "success" | "warning" | "danger" }; return <span style={{ color: o.tone ? t.text[o.tone] : undefined }}>{o.text}</span>; } return c as ReactNode; };
  return (
    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", maxWidth: "100%" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: t.font.table.fontSize, lineHeight: t.font.table.lineHeight }}>
        <thead><tr>{columns.map((c, j) => <th key={j} style={{ textAlign: al(j) as "left" | "right", padding: "8px 10px", color: t.text.secondary, fontWeight: t.weight.medium, borderBottom: `1px solid ${t.border.default}`, verticalAlign: "bottom" }}>{c}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} style={{ textAlign: al(j) as "left" | "right", padding: "8px 10px", borderBottom: `1px solid ${t.border.subtle}`, color: j === 0 ? t.text.primary : t.text.primary, verticalAlign: "top" }}>{show(c)}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export function Properties({ items }: { items: { label: string; value: ReactNode }[] }) {
  const t = useGrokTheme();
  return (
    <div>
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", padding: "10px 0", borderTop: i ? `1px solid ${t.border.subtle}` : "none" }}>
          <div style={{ flex: "0 0 180px", maxWidth: "100%", color: t.text.secondary, fontSize: t.font.body2.fontSize, lineHeight: t.font.body2.lineHeight }}>{it.label}</div>
          <div style={{ flex: "1 1 240px", minWidth: 0, color: t.text.primary, fontSize: t.font.body2.fontSize, lineHeight: t.font.body2.lineHeight }}>{it.value}</div>
        </div>
      ))}
    </div>
  );
}

export function Rows({ rows }: { rows: { lead?: string; title: string; detail?: string; meta?: string }[] }) {
  const t = useGrokTheme();
  return (
    <div>
      {rows.map((r, i) => (
        <div key={i} style={{ padding: "12px 0", borderTop: i ? `1px solid ${t.border.subtle}` : "none" }}>
          {r.lead ? <div style={{ color: t.text.tertiary, fontSize: t.font.label.fontSize, lineHeight: t.font.label.lineHeight }}>{r.lead}</div> : null}
          <div style={{ color: t.text.primary, fontSize: t.font.body1.fontSize, lineHeight: t.font.body1.lineHeight, fontWeight: t.weight.medium }}>{r.title}</div>
          {r.detail ? <div style={{ color: t.text.secondary, fontSize: t.font.body2.fontSize, lineHeight: t.font.body2.lineHeight, marginTop: 2 }}>{r.detail}</div> : null}
          {r.meta ? <div style={{ color: t.text.tertiary, fontSize: t.font.label.fontSize, marginTop: 2 }}>{r.meta}</div> : null}
        </div>
      ))}
    </div>
  );
}

export function LinkCards({ links }: { links: { title: string; site?: string; date?: string; href: string }[]; numbered?: boolean }) {
  const t = useGrokTheme();
  return (
    <div style={{ border: `1.5px solid ${t.border.default}`, borderRadius: 20, overflow: "hidden", background: "#fff" }}>
      {links.map((l, i) => (
        <a key={i} href={l.href} target="_blank" rel="noopener noreferrer" style={{ display: "block", padding: "12px 16px", textDecoration: "none", borderTop: i ? `1px solid ${t.border.subtle}` : "none", color: t.text.primary }}>
          <div style={{ fontSize: t.font.body2.fontSize, lineHeight: t.font.body2.lineHeight, fontWeight: t.weight.medium, wordBreak: "break-word" }}>{l.title} <span aria-hidden style={{ color: t.text.tertiary }}>↗</span></div>
          {l.site ? <div style={{ fontSize: t.font.label.fontSize, color: t.text.tertiary }}>{l.site}{l.date ? ` · ${l.date}` : ""}</div> : null}
        </a>
      ))}
    </div>
  );
}
