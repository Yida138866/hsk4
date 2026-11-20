// Minimal standalone re-implementation of the page kit used by the HSK 4 pages.
import React, { createContext, useContext, useEffect, useState, useMemo, useRef, useCallback, useReducer, Fragment } from "react";
import type { ReactNode, CSSProperties } from "react";
export { useState, useMemo, useEffect, useRef, useCallback, useReducer, Fragment };
export type { ReactNode, CSSProperties };

type TS = { fontSize: string; lineHeight: string; letterSpacing: string };
const ts = (s: number, l: number): TS => ({ fontSize: `${s}px`, lineHeight: `${l}px`, letterSpacing: "0px" });
const FONT = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", "Noto Sans CJK SC", sans-serif`;
function mk(dark: boolean) {
  const ink = dark ? "255,255,255" : "15,20,25";
  const a = (p: number) => `rgba(${ink},${p})`;
  return {
    kind: dark ? "dark" : "light",
    bg: { base: dark ? "#141414" : "#ffffff", subtle: dark ? "#1c1c1c" : "#f7f7f8", elevated: dark ? "#1f1f1f" : "#ffffff" },
    text: { primary: a(dark ? 0.95 : 1), secondary: a(0.6), tertiary: a(0.42), onColor: "#ffffff", onPrimary: dark ? "#0f1419" : "#ffffff", accent: "#1d8cf0", success: dark ? "#3ccf91" : "#00875a", warning: dark ? "#ffb84d" : "#b26b00", danger: dark ? "#ff6b6b" : "#d1242f", accentDeep: dark ? "#9fd0ff" : "#0b4f8a", successDeep: dark ? "#9be8c4" : "#00553a", warningDeep: dark ? "#ffd99a" : "#6b4100", dangerDeep: dark ? "#ffb3b3" : "#8a1820" },
    fill: { primary: a(dark ? 0.95 : 1), primaryHover: a(0.8), secondary: a(dark ? 0.17 : 0.07), secondaryHover: a(dark ? 0.28 : 0.13), hover: a(dark ? 0.08 : 0.05), pressed: a(dark ? 0.12 : 0.09), accent: "#1d8cf0", controlChecked: "#1d8cf0", accentSubtle: dark ? "rgba(29,140,240,0.2)" : "rgba(29,140,240,0.1)", successSubtle: dark ? "rgba(0,186,124,0.2)" : "rgba(0,186,124,0.11)", warningSubtle: dark ? "rgba(255,173,31,0.2)" : "rgba(255,173,31,0.14)", dangerSubtle: dark ? "rgba(244,33,46,0.2)" : "rgba(244,33,46,0.1)" },
    border: { subtle: a(0.07), weak: a(0.1), default: a(0.15), strong: a(0.3), focus: a(0.45) },
    font: { family: FONT, mono: "ui-monospace, SFMono-Regular, Menlo, monospace", heading1: ts(28, 36), heading2: ts(20, 28), heading3: ts(17, 24), body1: ts(16, 24), subtext: ts(16, 24), table: ts(14, 20), metric: ts(28, 34), body2: ts(15, 22), label: ts(13, 18), caption: ts(12, 16), code: ts(13, 20) },
    weight: { regular: 400, medium: 500, semibold: 600 },
    radius: { sm: 4, md: 8, lg: 12, xl: 16, full: 9999 },
    motion: { hover: "120ms", easing: "ease" },
    dataviz: { categorical: ["#1d8cf0", "#f5b324", "#22b8c8"], other: "#9aa0a6", negative: "#e5484d", singleSeriesRest: dark ? "#1f4f7a" : "#bcdcfb", areaAlpha: "29", bandAlpha: "40", blueTint: "#1d8cf029", blue5: "#0b4f8a", sequential: ["#dbeefe", "#9fd0ff", "#4fa8f5", "#1d8cf0", "#0b5fae"], diverging: ["#e5484d", "#e6e6e6", "#1d8cf0"] },
    chart: ["#1d8cf0", "#f5b324", "#22b8c8", "#9aa0a6"],
  };
}
export type GrokTheme = ReturnType<typeof mk>;
const mq = typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
const ThemeCtx = createContext<GrokTheme>(mk(!!mq?.matches));
export function ThemeRoot({ children }: { children?: ReactNode }) {
  const [dark, setDark] = useState<boolean>(!!mq?.matches);
  useEffect(() => { if (!mq) return; const f = (e: MediaQueryListEvent) => setDark(e.matches); mq.addEventListener("change", f); return () => mq.removeEventListener("change", f); }, []);
  const t = useMemo(() => mk(dark), [dark]);
  useEffect(() => { document.body.style.background = t.bg.base; document.body.style.color = t.text.primary; }, [t]);
  return <ThemeCtx.Provider value={t}>{children}</ThemeCtx.Provider>;
}
export function useGrokTheme(): GrokTheme { return useContext(ThemeCtx); }

const Depth = createContext<number>(0);
const GAP = 20;
const stack: CSSProperties = { display: "flex", flexDirection: "column", gap: GAP, minWidth: 0 };

export function Page({ title, summary, width, lang, children }: { title: string; summary?: string; width?: "column" | "wide" | "full"; lang?: string; children?: ReactNode }) {
  const t = useGrokTheme();
  useEffect(() => { document.title = title; if (lang) document.documentElement.lang = lang; }, [title, lang]);
  const max = width === "full" ? 1600 : width === "wide" ? 1280 : 700;
  return (
    <main lang={lang} style={{ maxWidth: max, margin: "0 auto", padding: "28px 16px 64px", fontFamily: t.font.family, color: t.text.primary }}>
      <header style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: t.font.heading1.fontSize, lineHeight: t.font.heading1.lineHeight, fontWeight: t.weight.semibold, color: t.text.primary }}>{title}</h1>
        {summary ? <p style={{ margin: "10px 0 0", fontSize: t.font.subtext.fontSize, lineHeight: t.font.subtext.lineHeight, color: t.text.secondary }}>{summary}</p> : null}
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
    <section id={id} style={{ ...stack, gap: 14, marginTop: d === 0 ? 12 : 6 }}>
      {heading || caption ? (
        <div>
          {heading ? <H style={{ margin: 0, fontSize: hs.fontSize, lineHeight: hs.lineHeight, fontWeight: t.weight.semibold, color: t.text.primary }}>{heading}</H> : null}
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
    <div role="tablist" style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: 4, borderRadius: 12, background: t.fill.secondary, alignSelf: "flex-start", maxWidth: "100%" }}>
      {options.map((o) => {
        const v = (typeof o === "string" ? o : o.value) as T;
        const label = typeof o === "string" ? o : o.label;
        const count = typeof o === "string" ? undefined : o.count;
        const on = v === value;
        return (
          <button key={v} role="tab" aria-selected={on} onClick={() => onChange(v)} style={{ border: "none", cursor: "pointer", padding: "7px 12px", borderRadius: 9, background: on ? t.bg.elevated : "transparent", boxShadow: on ? `0 0 0 1px ${t.border.default}` : "none", color: on ? t.text.primary : t.text.secondary, fontFamily: t.font.family, fontSize: t.font.label.fontSize, lineHeight: t.font.label.lineHeight, fontWeight: on ? t.weight.semibold : t.weight.medium, textAlign: "left" }}>
            {label}{count !== undefined ? <span style={{ marginLeft: 6, color: t.text.tertiary }}>{count}</span> : null}
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
      <select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value as T)} style={{ padding: "9px 12px", borderRadius: 8, border: `1px solid ${t.border.default}`, background: t.fill.secondary, color: t.text.primary, fontFamily: t.font.family, fontSize: t.font.body2.fontSize, maxWidth: "100%" }}>
        {options.map((o) => { const v = typeof o === "string" ? o : o.value; const l = typeof o === "string" ? o : o.label; return <option key={v} value={v}>{l}</option>; })}
      </select>
    </label>
  );
}

export function Button({ label, onClick, variant, disabled }: { label: string; onClick: () => void; variant?: "primary" | "quiet"; disabled?: boolean }) {
  const t = useGrokTheme();
  const p = variant === "primary";
  return (
    <button onClick={onClick} disabled={disabled} style={{ cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1, padding: "8px 14px", borderRadius: 9999, border: "none", background: p ? t.fill.primary : t.fill.secondary, color: p ? t.text.onPrimary : t.text.primary, fontFamily: t.font.family, fontSize: t.font.label.fontSize, lineHeight: t.font.label.lineHeight, fontWeight: t.weight.semibold, maxWidth: "100%", textAlign: "center" }}>{label}</button>
  );
}

export function Callout({ lead, tone, children }: { lead?: string; tone?: "info" | "success" | "warning" | "danger"; children?: ReactNode }) {
  const t = useGrokTheme();
  const map = { info: [t.fill.accentSubtle, t.text.accent, t.text.accentDeep, "ℹ"], success: [t.fill.successSubtle, t.text.success, t.text.successDeep, "✓"], warning: [t.fill.warningSubtle, t.text.warning, t.text.warningDeep, "!"], danger: [t.fill.dangerSubtle, t.text.danger, t.text.dangerDeep, "!"] } as const;
  const m = tone ? map[tone] : null;
  return (
    <div style={{ display: "flex", gap: 10, padding: "14px 16px", borderRadius: 12, background: m ? m[0] : t.fill.secondary }}>
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
    <div style={{ border: `1px solid ${t.border.default}`, borderRadius: 16, overflow: "hidden" }}>
      {links.map((l, i) => (
        <a key={i} href={l.href} target="_blank" rel="noopener noreferrer" style={{ display: "block", padding: "12px 16px", textDecoration: "none", borderTop: i ? `1px solid ${t.border.subtle}` : "none", color: t.text.primary }}>
          <div style={{ fontSize: t.font.body2.fontSize, lineHeight: t.font.body2.lineHeight, fontWeight: t.weight.medium, wordBreak: "break-word" }}>{l.title} <span aria-hidden style={{ color: t.text.tertiary }}>↗</span></div>
          {l.site ? <div style={{ fontSize: t.font.label.fontSize, color: t.text.tertiary }}>{l.site}{l.date ? ` · ${l.date}` : ""}</div> : null}
        </a>
      ))}
    </div>
  );
}
