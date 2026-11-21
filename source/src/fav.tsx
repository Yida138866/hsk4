// Saved-word list (生词收藏). Stored in localStorage and included in HSK4PET1 export/import.
import { useState, useEffect } from "./kit";
import type { CSSProperties } from "./kit";

export const FAV_KEY = "hsk4-fav-v1";
const MAX = 400;
const EXTRA: Record<string, { p: string; pos: string; vi: string; en: string; hv: string; l: number }> = {
  星星: { p: "xīngxing", pos: "n.", vi: "ngôi sao", en: "star", hv: "tinh tinh", l: 1 },
  亮: { p: "liàng", pos: "adj.", vi: "sáng, sáng tỏ", en: "bright", hv: "lượng", l: 1 },
};

function load(): string[] {
  try {
    const r = window.localStorage.getItem(FAV_KEY);
    if (!r) return [];
    const a = JSON.parse(r);
    if (!Array.isArray(a)) return [];
    const out: string[] = [];
    a.forEach((x) => { if (typeof x === "string" && x && !out.includes(x)) out.push(x); });
    return out.slice(0, MAX);
  } catch (e) { return []; }
}
const subs = new Set<() => void>();
let cur = load();
function emit() { try { window.localStorage.setItem(FAV_KEY, JSON.stringify(cur)); } catch (e) { /* ignore */ } subs.forEach((f) => f()); }
export function favList(): string[] { return cur.slice(); }
export function favHas(w: string): boolean { return cur.includes(w); }
export function favToggle(w: string): boolean {
  if (!w) return false;
  if (cur.includes(w)) cur = cur.filter((x) => x !== w);
  else if (cur.length < MAX) cur = [...cur, w];
  emit();
  return cur.includes(w);
}
export function useFavs(): string[] {
  const [, f] = useState(0);
  useEffect(() => { const g = () => f((n) => n + 1); subs.add(g); cur = load(); f((n) => n + 1); return () => { subs.delete(g); }; }, []);
  return cur;
}
export function extraGloss(h: string) { return EXTRA[h] || null; }

export function FavStar({ word, lang, size = 32 }: { word: string; lang: "vi" | "en"; size?: number }) {
  const favs = useFavs();
  const on = favs.includes(word);
  const label = on ? (lang === "vi" ? "Bỏ lưu từ này" : "Unsave this word") : (lang === "vi" ? "Lưu từ này vào 收藏" : "Save this word");
  const st: CSSProperties = {
    cursor: "pointer", flex: "0 0 auto", width: size, height: size, borderRadius: 9999,
    border: on ? "none" : "1.5px solid rgba(232,85,154,0.35)",
    background: on ? "linear-gradient(135deg,#ffd36e,#ff8cc0)" : "#fff",
    color: on ? "#fff" : "#e0a000", display: "inline-flex", alignItems: "center", justifyContent: "center",
    padding: 0, fontSize: Math.round(size * 0.58), lineHeight: 1, boxShadow: on ? "0 3px 10px rgba(232,85,154,0.35)" : "none",
  };
  return (
    <button type="button" className="fav-star" data-on={on ? "1" : "0"} aria-pressed={on} aria-label={label} title={label}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); favToggle(word); }}
      style={st}>{on ? "★" : "☆"}</button>
  );
}
