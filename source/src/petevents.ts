// Festival limited events (device date). Lunar dates for 2026–2030 precomputed (lunardate), Vietnam/China agree for these years.
export type EvId = "tet" | "mid" | "qixi" | "val" | "w38" | "w2010" | "xmas";
export type Ev = { id: EvId; zh: string; vi: string; en: string; icon: string; bg: string; items: string[]; line: string; deco: string };
export const EV_STEPS = [15, 50, 100]; // event XP (any normal study during the event) needed for item 1, 2, 3
export const EVENTS: Ev[] = [
  { id: "tet", zh: "春节 · 新年快乐", vi: "Tết Nguyên Đán", en: "Lunar New Year (Tết)", icon: "🧧", bg: "linear-gradient(135deg,#ffe0d6,#ffd36e 55%,#ff9a8a)", items: ["lixi", "aodai_red", "tetroom"], line: "ev_tet", deco: "🧧🏮🌼" },
  { id: "mid", zh: "中秋节", vi: "Tết Trung Thu", en: "Mid-Autumn Festival", icon: "🥮", bg: "linear-gradient(135deg,#2f3a6b,#5b5fa8 60%,#ffd88a)", items: ["lantern", "bunnyears", "moonroom"], line: "ev_mid", deco: "🌕🏮🥮" },
  { id: "qixi", zh: "七夕", vi: "Lễ Thất Tịch", en: "Qixi Festival", icon: "🌌", bg: "linear-gradient(135deg,#3d2f6b,#8a6ad8 60%,#ffb3d1)", items: ["hairpin", "fan", "qixiroom"], line: "ev_qixi", deco: "🌌💞✨" },
  { id: "val", zh: "情人节", vi: "Lễ Tình nhân 14/2", en: "Valentine's Day", icon: "💝", bg: "linear-gradient(135deg,#ffd1e1,#ff8cb0)", items: ["rose", "heartglasses", "valroom"], line: "ev_val", deco: "💝🌹💕" },
  { id: "w38", zh: "三八妇女节", vi: "Quốc tế Phụ nữ 8/3", en: "International Women's Day (8/3)", icon: "💐", bg: "linear-gradient(135deg,#ffe6f1,#ffc2dc 50%,#e7d4ff)", items: ["bouquet", "tiara", "w38room"], line: "ev_w38", deco: "💐🌷👑" },
  { id: "w2010", zh: "越南妇女节", vi: "Phụ nữ Việt Nam 20/10", en: "Vietnamese Women's Day (20/10)", icon: "🌸", bg: "linear-gradient(135deg,#fff3e6,#ffd1e6 55%,#c9eedd)", items: ["aodai_white", "nonla", "w2010room"], line: "ev_w2010", deco: "🌸👒🪷" },
  { id: "xmas", zh: "圣诞节", vi: "Giáng sinh", en: "Christmas", icon: "🎄", bg: "linear-gradient(135deg,#dff0ff,#bfe3d0 55%,#ffd1d6)", items: ["santahat", "gift", "snowroom"], line: "ev_xmas", deco: "🎄🎁❄️" },
];
const TET = ["2026-02-17", "2027-02-06", "2028-01-26", "2029-02-13", "2030-02-03"];
const MID = ["2026-09-25", "2027-09-15", "2028-10-03", "2029-09-22", "2030-09-12"];
const QIXI = ["2026-08-19", "2027-08-08", "2028-08-26", "2029-08-16", "2030-08-05"];
const ms = (d: string) => Date.parse(d + "T00:00:00");
const near = (list: string[], day: string, before: number, after: number) => list.some((x) => { const k = Math.round((ms(day) - ms(x)) / 86400000); return k >= -before && k <= after; });
const md = (day: string) => day.slice(5);
export function eventOn(day: string): EvId | null {
  if (near(TET, day, 7, 7)) return "tet";
  if (near(MID, day, 7, 2)) return "mid";
  if (near(QIXI, day, 3, 1)) return "qixi";
  const m = md(day);
  if (m >= "02-10" && m <= "02-14") return "val";
  if (m >= "03-05" && m <= "03-08") return "w38";
  if (m >= "10-17" && m <= "10-20") return "w2010";
  if (m >= "12-18" && m <= "12-26") return "xmas";
  return null;
}
// Hidden preview switch: ?event=tet|mid|qixi|val|w38|w2010|xmas (or ?event=off)
export function activeEvent(day: string): Ev | null {
  let p: string | null = null;
  try { p = new URLSearchParams(location.search).get("event"); } catch (e) { /* no location */ }
  if (p === "off") return null;
  const id = (p && EVENTS.some((e) => e.id === p) ? p : eventOn(day)) as EvId | null;
  return id ? EVENTS.find((e) => e.id === id) || null : null;
}
