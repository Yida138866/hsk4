// Study pet + rewards (preview feature). All data in localStorage; no backend.
import { useState, useEffect, ZH_FONT } from "./kit";
import type { ReactNode } from "./kit";
import { PetArt, Room } from "./petart";
import type { Kind, Equip } from "./petart";
import { speakSeq, SpeakBtn } from "./audio";
import { LINES } from "./pet_lines";

declare const __PET__: boolean;
export const PET_ON = typeof __PET__ !== "undefined" && __PET__;
const KEY = "hsk4-pet-v1";
const LANG: "vi" | "en" = typeof location !== "undefined" && /\/en\/?/.test(location.pathname) ? "en" : "vi";
const VI = LANG === "vi";

export const STAGES = [
  { zh: "蛋", vi: "Trứng", en: "Egg", xp: 0, lessons: 0 },
  { zh: "宝宝", vi: "Em bé", en: "Baby", xp: 150, lessons: 2 },
  { zh: "小朋友", vi: "Bạn nhỏ", en: "Child", xp: 600, lessons: 6 },
  { zh: "少女", vi: "Thiếu nữ", en: "Teen", xp: 1300, lessons: 10 },
  { zh: "毕业", vi: "Tốt nghiệp", en: "Graduate", xp: 2400, lessons: 15 },
];
export const DAILY_CAP = 60; // study XP per day; check-in and the pet quiz are outside this cap
export const XP_RULES = { task: 10, cards: 8, listen: 6, quizPerPoint: 2, rtestPerPoint: 1 };
export const PQ_RULES = { perRight: 4, perRightStars: 1, perfectXp: 5, perfectHearts: 1, n: 5 };
export function ciReward(day: number) { return day <= 3 ? { xp: 10, s: 1 } : day <= 6 ? { xp: 15, s: 2 } : { xp: 20, s: 3 }; }
export const PETS: [Kind, string, string, string][] = [["bunny", "小兔子", "Thỏ con", "Bunny"], ["panda", "小熊猫", "Gấu trúc nhỏ", "Little panda"], ["kitten", "小灰猫", "Mèo xám", "Grey kitten"], ["tiger", "小老虎", "Hổ con", "Little tiger"], ["dragon", "小龙", "Rồng con", "Little dragon"], ["puppy", "小狗", "Cún con", "Puppy"]];

type PQ = { day: string; items: { id: string; perm: number[] }[]; ans: number[]; done: boolean; got?: string };
type Grad = { pet: Kind; name: string; equip: Equip; date: string; xp: number; born: number };
type St = {
  v: 2; pet: Kind | null; name: string; xp: number; stars: number; hearts: number; happy: number;
  owned: string[]; equip: Equip; lessons: number[]; ready: boolean; best: number;
  day: string; dayXp: number; claims: Record<string, string>; streak: number; maxStreak: number; lastDay: string;
  stats: { cards: number; listen: number; quiz100: number; quiz: number; rtest: number; fed: number; tasks: number; checkins: number; pq: number; pq5: number };
  gifts: string[]; stage: number; born: number;
  minStage: number; ciLast: string; ciStreak: number; ciMax: number; ciDays: string[]; pq: PQ | null;
  grads: Grad[]; gradDone: boolean; gradDate: string; earned: string[];
};
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const dayStr = (off: number) => { const d = new Date(); d.setDate(d.getDate() + off); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const dayDiff = (a: string, b: string) => Math.round((Date.parse(b + "T00:00:00") - Date.parse(a + "T00:00:00")) / 86400000);
const fresh = (): St => ({ v: 2, pet: null, name: "", xp: 0, stars: 0, hearts: 0, happy: 70, owned: [], equip: { furn: [] }, lessons: [], ready: false, best: -1, day: today(), dayXp: 0, claims: {}, streak: 0, maxStreak: 0, lastDay: "", stats: { cards: 0, listen: 0, quiz100: 0, quiz: 0, rtest: 0, fed: 0, tasks: 0, checkins: 0, pq: 0, pq5: 0 }, gifts: [], stage: 0, born: Date.now(), minStage: 0, ciLast: "", ciStreak: 0, ciMax: 0, ciDays: [], pq: null, grads: [], gradDone: false, gradDate: "", earned: [] });
// Pet name: blank names fall back to 宠物成长; known auto-inserted values (phone keyboard prediction / autofill, not typed on purpose) are corrected.
export const DEFAULT_NAME = "宠物成长";
const BAD_NAMES = ["经济建设"];
export function petName(n: string | undefined | null): string { const t = String(n || "").replace(/\s+/g, " ").trim().slice(0, 12); return !t || BAD_NAMES.includes(t) ? DEFAULT_NAME : t; }
// v1 → v2 migration: never demote a pet (minStage = old stage); carry the old activity streak into the check-in streak.
function migrate(o: Record<string, unknown>): St {
  const base = fresh();
  const m = { ...base, ...o, stats: { ...base.stats, ...((o.stats as object) || {}) }, equip: { furn: [], ...((o.equip as object) || {}) } } as St;
  if (o.v !== 2) {
    m.v = 2; m.minStage = Number(o.stage || 0);
    const t = today(); const ld = String(o.lastDay || "");
    if (ld && dayDiff(ld, t) <= 1 && Number(o.streak || 0) > 0) { m.ciStreak = Number(o.streak); m.ciLast = ld === t ? dayStr(-1) : ld; m.ciMax = Math.max(Number(o.maxStreak || 0), m.ciStreak); }
    else m.ciMax = Number(o.maxStreak || 0);
  }
  if (m.pet) m.name = petName(m.name);
  m.grads = (m.grads || []).map((g) => ({ ...g, name: petName(g.name) }));
  return m;
}
function load(): St { try { const r = window.localStorage.getItem(KEY); if (r) return migrate(JSON.parse(r)); } catch (e) { /* storage unavailable */ } return fresh(); }
let S: St = typeof window !== "undefined" ? load() : fresh();
const subs = new Set<() => void>();
function save() { try { window.localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable */ } subs.forEach((f) => f()); }
export function usePet(): St { const [, f] = useState(0); useEffect(() => { const g = () => f((x: number) => x + 1); subs.add(g); return () => { subs.delete(g); }; }, []); return S; }

export function stageOf(s: St): number {
  let st = 0;
  for (let i = 1; i <= 4; i++) if (s.xp >= STAGES[i].xp && s.lessons.length >= STAGES[i].lessons) st = i;
  return Math.max(st, s.minStage || 0);
}
export function moodOf(s: St): string { return s.lastDay && dayDiff(s.lastDay, today()) >= 3 ? "miss" : "ok"; }
export function ciCur(s: St): number { if (!s.ciLast) return 0; return dayDiff(s.ciLast, today()) <= 1 ? s.ciStreak : 0; }

// ---------- toasts / celebrations ----------
type Toast = { id: number; text: string; kind: "reward" | "level" | "gift" | "info"; sub?: string; snap?: { pet: Kind; stage: number; equip: Equip } };
let toasts: Toast[] = []; let tid = 0;
const tsubs = new Set<() => void>();
function toast(text: string, kind: Toast["kind"] = "reward", sub?: string) { const t: Toast = { id: ++tid, text, kind, sub, snap: kind === "level" && S.pet ? { pet: S.pet, stage: S.stage, equip: { ...S.equip } } : undefined }; toasts = [...toasts, t]; tsubs.forEach((f) => f()); setTimeout(() => { toasts = toasts.filter((x) => x.id !== t.id); tsubs.forEach((f) => f()); }, kind === "level" ? 6000 : 3200); }
function useToasts(): Toast[] { const [, f] = useState(0); useEffect(() => { const g = () => f((x: number) => x + 1); tsubs.add(g); return () => { tsubs.delete(g); }; }, []); return toasts; }
export function say(k: string, then?: [string, string, string][]) { const pool = LINES.filter((l) => l.k === k); const l = pool[Math.floor(Math.random() * pool.length)]; if (!l) return null; speakSeq([[l.au, l.zh, "pet:" + l.au], ...(then || [])]); return l; }

// ---------- earning ----------
function touchDay() {
  const t = today();
  if (S.day !== t) { S.day = t; S.dayXp = 0; }
  if (S.lastDay !== t) { const gap = S.lastDay ? dayDiff(S.lastDay, t) : 99; S.streak = gap === 1 ? S.streak + 1 : 1; S.lastDay = t; S.maxStreak = Math.max(S.maxStreak, S.streak); }
}
function gainXp(n: number): number {
  const bonus = ciCur(S) >= 7 ? 1.1 : 1;
  const room = Math.max(0, DAILY_CAP - S.dayXp);
  const base = Math.min(room, n); S.dayXp += base;
  const got = Math.round(base * bonus); S.xp += got; return got;
}
function claim(k: string, perDay: boolean): boolean { const t = today(); const prev = S.claims[k]; if (prev && (!perDay || prev === t)) return false; S.claims[k] = t; return true; }
function graduate() {
  if (S.gradDone) return;
  S.gradDone = true; S.gradDate = today();
  SHOP.forEach((i) => { if (i.cat !== "food" && !S.owned.includes(i.id)) S.owned.push(i.id); });
  toast(VI ? "🎓 Tốt nghiệp! Mở khoá TẤT CẢ phụ kiện, trang phục, phòng và nội thất 🎁" : "🎓 Graduated! ALL accessories, outfits, rooms and furniture unlocked 🎁", "gift");
}
function finish(parts: string[]) {
  const before = S.stage; const now = stageOf(S);
  S.happy = Math.min(100, S.happy + 3);
  if (parts.length) toast(parts.join("  "), "reward");
  if (now > before) { S.stage = now; const l = say(now === 4 ? "gradall" : "level"); toast(`🎉 ${STAGES[now].zh} · ${VI ? STAGES[now].vi : STAGES[now].en}${l ? " — " + l.zh : ""}`, "level", l ? (VI ? l.vi : l.en) : undefined); }
  if (now >= 4) graduate();
  const nb: string[] = [];
  BADGES.forEach((b) => { if (!S.earned.includes(b.id) && b.ok(S)) { S.earned.push(b.id); if (b.id !== "first") nb.push(`${b.icon} ${b.zh}`); } });
  if (nb.length) toast(`🏅 ${VI ? "Huy hiệu mới" : "New badge"}: ${nb.join(" · ")}`, "gift");
  save();
}
export function petEvent(type: "task" | "cards" | "listen" | "quiz" | "rtest", d: { key?: string; lesson?: number; score?: number; n?: number; level?: number } = {}) {
  if (!PET_ON || !S.pet) return;
  touchDay();
  const parts: string[] = []; let xp = 0;
  const capNote = () => (S.dayXp >= DAILY_CAP ? (VI ? " (đủ XP học hôm nay)" : " (daily study XP cap reached)") : "");
  if (type === "task") { if (!claim("t:" + d.key, false)) return; xp = gainXp(XP_RULES.task); S.stars += 1; S.stats.tasks++; parts.push(`+${xp} XP`, "+1⭐"); }
  if (type === "cards") { if (!claim("c:" + d.lesson, true)) return; xp = gainXp(XP_RULES.cards); S.stars += 1; S.stats.cards++; parts.push(`+${xp} XP`, "+1⭐", VI ? `Thẻ từ bài ${d.lesson}` : `Flashcards L${d.lesson}`); }
  if (type === "listen") { if (!claim("l:" + d.key, true)) return; xp = gainXp(XP_RULES.listen); S.stars += 1; S.stats.listen++; parts.push(`+${xp} XP`, "+1⭐", VI ? "Nghe bài khoá" : "Listened to a text"); }
  if (type === "quiz") {
    const sc = d.score ?? 0; const L = d.lesson ?? 0;
    if (sc >= 8 && !S.lessons.includes(L)) S.lessons = [...S.lessons, L].sort((a, b) => a - b);
    if (!claim("q:" + L, true)) { finish([]); return; }
    xp = gainXp(sc * XP_RULES.quizPerPoint); S.stats.quiz++; parts.push(`+${xp} XP`);
    if (sc >= 8) { const h = sc === 10 ? 2 : 1; S.hearts += h; parts.push(`+${h}💗`); }
    if (sc === 10) S.stats.quiz100++;
  }
  if (type === "rtest") {
    const sc = d.score ?? 0; const k = "r:" + today(); const used = Number(S.claims[k] || 0);
    if ((d.level ?? 0) >= 3) S.ready = true;
    if (used >= 2) { finish([]); return; }
    S.claims[k] = String(used + 1);
    xp = gainXp(sc * XP_RULES.rtestPerPoint); let h = Math.floor(sc / 10); if (S.best >= 0 && sc > S.best) h += 2; S.best = Math.max(S.best, sc); S.hearts += h; S.stats.rtest++;
    parts.push(`+${xp} XP`); if (h) parts.push(`+${h}💗`); if (d.level === 3) parts.push(VI ? "Sẵn sàng! 🎓" : "Ready! 🎓");
  }
  if (S.dayXp >= DAILY_CAP) parts.push(capNote());
  finish(parts);
}

// ---------- daily check-in (outside the study cap) ----------
export function checkIn(): boolean {
  if (!PET_ON || !S.pet) return false;
  const t = today(); if (S.ciLast === t) return false;
  touchDay();
  const gap = S.ciLast ? dayDiff(S.ciLast, t) : 99;
  S.ciStreak = gap === 1 ? S.ciStreak + 1 : 1; S.ciLast = t; S.ciMax = Math.max(S.ciMax, S.ciStreak);
  S.ciDays = [...S.ciDays.filter((x) => dayDiff(x, t) < 60), t]; S.stats.checkins++;
  const r = ciReward(S.ciStreak); S.xp += r.xp; S.stars += r.s;
  if (S.ciStreak >= 7 && !S.gifts.includes("s7")) { S.gifts.push("s7"); if (!S.owned.includes("bow")) S.owned.push("bow"); S.stars += 10; toast(VI ? "🔥 Chuỗi 7 ngày! Quà: nơ xinh 🎀 + 10⭐" : "🔥 7-day streak! Gift: cute bow 🎀 + 10⭐", "gift"); }
  if (S.ciStreak >= 30 && !S.gifts.includes("s30")) { S.gifts.push("s30"); if (!S.owned.includes("crown")) S.owned.push("crown"); S.hearts += 5; toast(VI ? "🔥 Chuỗi 30 ngày! Quà: vòng hoa 🌸 + 5💗" : "🔥 30-day streak! Gift: flower crown 🌸 + 5💗", "gift"); }
  say("checkin");
  finish([`📅 ${VI ? "Ngày" : "Day"} ${S.ciStreak}`, `+${r.xp} XP`, `+${r.s}⭐`]);
  return true;
}

// ---------- daily pet quiz (5 questions from the random-test bank, once per day) ----------
type BItem = { id: string; l: number; ty: string; stem: string; opts: string[]; ex: string; au?: [string, string]; passage?: string };
declare const HSK_BANK: BItem[];
const bank = (): BItem[] => (typeof HSK_BANK !== "undefined" ? HSK_BANK : []);
const rnd = (n: number) => Math.floor(Math.random() * n);
function shuf<T>(a: T[]): T[] { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = rnd(i + 1); const x = b[i]; b[i] = b[j]; b[j] = x; } return b; }
export function bankItem(id: string): BItem | undefined { return bank().find((x) => x.id === id); }
function pqDraw(): PQ["items"] {
  const top = Math.min(20, Math.max(4, (S.lessons.length ? Math.max(...S.lessons) : 0) + 2));
  const out: PQ["items"] = [];
  shuf(["meaning", "hanzi", "pinyin", "fill", "grammar"]).forEach((ty) => {
    let pool = bank().filter((x) => (ty === "grammar" ? x.ty === "grammar" || x.ty === "order" : x.ty === ty) && !x.passage && x.l <= top);
    if (!pool.length) pool = bank().filter((x) => x.ty === ty);
    const it = pool[rnd(pool.length)]; if (it) out.push({ id: it.id, perm: shuf([0, 1, 2, 3]) });
  });
  return out;
}
export function pqStart() { if (!PET_ON || !S.pet) return; const t = today(); if (S.pq && S.pq.day === t) return; S.pq = { day: t, items: pqDraw(), ans: [], done: false }; touchDay(); save(); say("pq"); }
export function pqAnswer(k: number) {
  const q = S.pq; if (!q || q.done || q.day !== today()) return;
  const i = q.ans.length; const d = q.items[i]; if (!d) return;
  q.ans = [...q.ans, k]; const ok = d.perm[k] === 0; const it = bankItem(d.id);
  say(ok ? "right" : "wrong", it && it.au ? [[it.au[0], it.au[1], "pq:" + d.id]] : undefined);
  save();
}
export function pqFinish() {
  const q = S.pq; if (!q || q.done || q.ans.length < q.items.length) return;
  q.done = true; const right = q.items.filter((d, i) => d.perm[q.ans[i]] === 0).length;
  let xp = right * PQ_RULES.perRight; let st = right * PQ_RULES.perRightStars; let h = 0;
  if (right === q.items.length) { xp += PQ_RULES.perfectXp; h = PQ_RULES.perfectHearts; S.stats.pq5++; }
  S.xp += xp; S.stars += st; S.hearts += h; S.stats.pq++;
  q.got = `+${xp} XP · +${st}⭐${h ? ` · +${h}💗` : ""}`;
  say("pqdone");
  finish([`🧠 ${right}/${q.items.length}`, `+${xp} XP`, `+${st}⭐`, ...(h ? [`+${h}💗`] : [])]);
}

// ---------- graduation → adopt the next pet ----------
export function adopt(kind: Kind, rawName: string) {
  const name = petName(rawName);
  if (!S.pet) { S = { ...fresh(), ...(S.grads.length ? keepAcross() : {}), pet: kind, name, born: Date.now() }; save(); return; }
  if (!S.gradDone) return;
  S.grads = [...S.grads, { pet: S.pet, name: S.name, equip: S.equip, date: S.gradDate || today(), xp: S.xp, born: S.born }];
  S = { ...S, pet: kind, name, xp: 0, lessons: [], ready: false, stage: 0, minStage: 0, gradDone: false, gradDate: "", happy: 75, born: Date.now(), equip: { furn: [] } };
  say("newpet"); toast(VI ? `🥚 Chào mừng ${name}! Sao, tim, huy hiệu và bộ sưu tập vẫn được giữ.` : `🥚 Welcome, ${name}! Stars, hearts, badges and the collection are kept.`, "gift");
  save();
}
function keepAcross(): Partial<St> { return { stars: S.stars, hearts: S.hearts, owned: S.owned, earned: S.earned, grads: S.grads, stats: S.stats, gifts: S.gifts, ciLast: S.ciLast, ciStreak: S.ciStreak, ciMax: S.ciMax, ciDays: S.ciDays, pq: S.pq, claims: S.claims, day: S.day, dayXp: S.dayXp, best: S.best }; }

// ---------- shop & badges ----------
type Item = { id: string; cat: "acc" | "outfit" | "food" | "room" | "furn"; zh: string; vi: string; en: string; s?: number; h?: number; happy?: number; icon: string };
export const SHOP: Item[] = [
  { id: "bow", cat: "acc", zh: "蝴蝶结", vi: "Nơ xinh", en: "Bow", s: 15, icon: "🎀" },
  { id: "glasses", cat: "acc", zh: "眼镜", vi: "Kính", en: "Glasses", s: 20, icon: "👓" },
  { id: "beret", cat: "acc", zh: "贝雷帽", vi: "Mũ nồi", en: "Beret", s: 25, icon: "🧢" },
  { id: "crown", cat: "acc", zh: "花环", vi: "Vòng hoa", en: "Flower crown", s: 30, icon: "🌸" },
  { id: "scarf", cat: "outfit", zh: "围巾", vi: "Khăn quàng", en: "Scarf", s: 15, icon: "🧣" },
  { id: "hoodie", cat: "outfit", zh: "卫衣", vi: "Áo hoodie", en: "Hoodie", s: 25, icon: "👕" },
  { id: "dress", cat: "outfit", zh: "连衣裙", vi: "Váy liền", en: "Dress", h: 4, icon: "👗" },
  { id: "aodai", cat: "outfit", zh: "奥黛", vi: "Áo dài", en: "Áo dài", h: 5, icon: "🌺" },
  { id: "boba", cat: "food", zh: "珍珠奶茶", vi: "Trà sữa trân châu", en: "Bubble tea", s: 5, happy: 25, icon: "🧋" },
  { id: "baozi", cat: "food", zh: "包子", vi: "Bánh bao", en: "Baozi", s: 3, happy: 15, icon: "🥟" },
  { id: "banhmi", cat: "food", zh: "越南面包", vi: "Bánh mì", en: "Bánh mì", s: 4, happy: 20, icon: "🥖" },
  { id: "mooncake", cat: "food", zh: "月饼", vi: "Bánh trung thu", en: "Mooncake", h: 2, happy: 40, icon: "🥮" },
  { id: "sakura", cat: "room", zh: "樱花房间", vi: "Phòng hoa anh đào", en: "Sakura room", s: 20, icon: "🌸" },
  { id: "beach", cat: "room", zh: "海边", vi: "Bờ biển", en: "Beach", s: 30, icon: "🏖️" },
  { id: "night", cat: "room", zh: "星空", vi: "Trời sao", en: "Starry night", h: 3, icon: "🌙" },
  { id: "plant", cat: "furn", zh: "盆栽", vi: "Chậu cây", en: "Plant", s: 10, icon: "🪴" },
  { id: "lamp", cat: "furn", zh: "台灯", vi: "Đèn bàn", en: "Lamp", s: 10, icon: "💡" },
  { id: "desk", cat: "furn", zh: "小书桌", vi: "Bàn học", en: "Study desk", s: 15, icon: "📚" },
];
const BADGES: { id: string; icon: string; zh: string; vi: string; en: string; ok: (s: St) => boolean }[] = [
  { id: "first", icon: "🌱", zh: "第一步", vi: "Bước đầu tiên", en: "First step", ok: (s) => s.xp > 0 },
  { id: "vocab", icon: "📇", zh: "词汇达人", vi: "Cao thủ từ vựng (10 lượt thẻ từ)", en: "Vocab star (10 flashcard sets)", ok: (s) => s.stats.cards >= 10 },
  { id: "gram", icon: "✏️", zh: "语法小能手", vi: "Giỏi ngữ pháp (5 bài kiểm tra 10/10)", en: "Grammar whiz (5 perfect quizzes)", ok: (s) => s.stats.quiz100 >= 5 },
  { id: "ear", icon: "🎧", zh: "听力小耳朵", vi: "Đôi tai nhỏ (nghe 20 bài khoá)", en: "Little ears (20 texts heard)", ok: (s) => s.stats.listen >= 20 },
  { id: "half", icon: "📖", zh: "半程达人", vi: "Nửa chặng (10 bài)", en: "Halfway (10 lessons)", ok: (s) => s.lessons.length >= 10 },
  { id: "s7", icon: "🔥", zh: "坚持7天", vi: "Điểm danh 7 ngày liền", en: "7-day check-in streak", ok: (s) => s.ciMax >= 7 },
  { id: "s30", icon: "🏅", zh: "坚持30天", vi: "Điểm danh 30 ngày liền", en: "30-day check-in streak", ok: (s) => s.ciMax >= 30 },
  { id: "food", icon: "🍡", zh: "小吃货", vi: "Tín đồ ăn uống (cho ăn 10 lần)", en: "Foodie (fed 10 times)", ok: (s) => s.stats.fed >= 10 },
  { id: "fashion", icon: "👗", zh: "时尚达人", vi: "Fashionista (5 món đồ)", en: "Fashionista (5 items)", ok: (s) => s.owned.filter((x) => SHOP.find((i) => i.id === x && (i.cat === "acc" || i.cat === "outfit"))).length >= 5 },
  { id: "ready", icon: "🎯", zh: "测验高手", vi: "Sẵn sàng HSK 4", en: "HSK 4 ready", ok: (s) => s.ready },
  { id: "pq5", icon: "🧠", zh: "小测验王", vi: "Vua đố vui (5 lần đúng 5/5)", en: "Quiz champ (5 perfect pet quizzes)", ok: (s) => s.stats.pq5 >= 5 },
  { id: "grad", icon: "🎓", zh: "毕业生", vi: "Tốt nghiệp (mở khoá mọi món đồ)", en: "Graduate (all items unlocked)", ok: (s) => s.gradDone || s.grads.length > 0 },
  { id: "collector", icon: "🏆", zh: "宠物收藏家", vi: "Nhà sưu tầm (3 bạn tốt nghiệp)", en: "Collector (3 graduates)", ok: (s) => s.grads.length + (s.gradDone ? 1 : 0) >= 3 },
];
function buy(it: Item) {
  if (it.cat !== "food" && S.owned.includes(it.id)) return;
  if (it.s && S.stars < it.s) return; if (it.h && S.hearts < it.h) return;
  S.stars -= it.s || 0; S.hearts -= it.h || 0;
  if (it.cat === "food") { S.happy = Math.min(100, S.happy + (it.happy || 10)); S.stats.fed++; const l = say("fed"); toast(`${it.icon} ${l ? l.zh : ""} 💗💗💗`, "info"); }
  else { S.owned.push(it.id); wear(it); toast(`${it.icon} ${VI ? it.vi : it.en} ✓`, "info"); }
  save();
}
function wear(it: Item) {
  if (it.cat === "furn") { const f = S.equip.furn || []; S.equip = { ...S.equip, furn: f.includes(it.id) ? f.filter((x) => x !== it.id) : [...f, it.id] }; }
  else if (it.cat === "acc" || it.cat === "outfit" || it.cat === "room") { S.equip = { ...S.equip, [it.cat]: S.equip[it.cat] === it.id ? undefined : it.id }; }
  save();
}

// ---------- export / import ----------
const KEYS = ["hsk4-pet-v1", "hsk4-plan-vi-v1", "hsk4-plan-v1", "hsk4-reader-v1", "hsk4-music-v1", "hsk4-rtest-history-v1"];
function exportCode(): string { const o: Record<string, string> = {}; KEYS.forEach((k) => { try { const v = window.localStorage.getItem(k); if (v !== null) o[k] = v; } catch (e) { /* ignore */ } }); return "HSK4PET1:" + btoa(unescape(encodeURIComponent(JSON.stringify(o)))); }
function importCode(c: string): boolean {
  try { const m = c.trim().match(/^HSK4PET1:([A-Za-z0-9+/=]+)$/); if (!m) return false; const o = JSON.parse(decodeURIComponent(escape(atob(m[1])))); if (typeof o !== "object") return false; Object.keys(o).forEach((k) => { if (KEYS.includes(k) && typeof o[k] === "string") window.localStorage.setItem(k, o[k]); }); return true; } catch (e) { return false; }
}

// ---------- UI ----------
const box = { borderRadius: 22, padding: "14px", background: "#fff", border: "1.5px solid rgba(248,190,220,0.7)", boxShadow: "0 6px 18px rgba(214,90,160,0.08)" } as const;
const btn = (on = false) => ({ cursor: "pointer", border: on ? "none" : "1.5px solid rgba(232,85,154,0.3)", borderRadius: 9999, padding: "8px 14px", fontFamily: "inherit", fontSize: 14, fontWeight: 800, background: on ? "linear-gradient(135deg,#ff7eb6,#c58bff)" : "#fff", color: on ? "#fff" : "#8f2160", boxShadow: on ? "0 4px 12px rgba(232,85,154,0.28)" : "none" } as const);
function Bar({ v, max, color }: { v: number; max: number; color?: string }) { const p = max > 0 ? Math.min(1, v / max) : 1; return <span style={{ display: "block", height: 10, borderRadius: 9999, background: "#fde8f3", overflow: "hidden" }}><span style={{ display: "block", height: "100%", width: `${p * 100}%`, background: color || "linear-gradient(90deg,#ff9cc6,#c58bff)", transition: "width .6s" }} /></span>; }
export function PetSvg({ kind, stage, mood, equip, size, room, anim = true }: { kind: Kind; stage: number; mood?: string; equip?: Equip; size: number | string; room?: boolean; anim?: boolean }) {
  return room
    ? <div style={{ width: size, aspectRatio: "200 / 220", borderRadius: 24, overflow: "hidden" }}><Room id={equip?.room} furn={equip?.furn}><PetArt kind={kind} stage={stage} mood={mood} equip={equip} anim={anim} /></Room></div>
    : <svg viewBox="0 0 200 220" width={size} height={typeof size === "number" ? size * 1.1 : undefined} aria-hidden="true" style={{ display: "block", overflow: "visible" }}><PetArt kind={kind} stage={stage} mood={mood} equip={equip} anim={anim} /></svg>;
}
const L3 = (zh: string, vi: string, en: string) => `${zh} · ${VI ? vi : en}`;

export function PetTab() {
  const s = usePet();
  const [name, setName] = useState("");
  const [pick, setPick] = useState<Kind>("bunny");
  const [line, setLine] = useState<{ zh: string; vi: string; en: string } | null>(null);
  const [cat, setCat] = useState<Item["cat"]>("acc");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [pop, setPop] = useState(0);
  const [adopting, setAdopting] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [rn, setRn] = useState("");
  const st = stageOf(s); const mood = moodOf(s);
  useEffect(() => { if (s.pet && st !== s.stage) { S.stage = st; save(); } if (s.pet && st >= 4 && !s.gradDone) { graduate(); save(); } }, [st]);
  if (!s.pet || adopting) {
    const pets = PETS; const next = !!s.pet;
    const doneKinds = [...s.grads.map((g) => g.pet), ...(s.gradDone && s.pet ? [s.pet] : [])];
    return (
      <section id="pet-top" className="card" style={{ display: "flex", flexDirection: "column", gap: 14, padding: "20px 16px", borderRadius: 24, background: "rgba(255,255,255,0.92)", boxShadow: "0 8px 26px rgba(214,90,160,0.12)", border: "1.5px solid rgba(248,190,220,0.55)" }}>
        <h2 style={{ margin: 0, fontSize: 21, fontWeight: 800, color: "#8f2160" }}>✿ {next ? L3("领养新宠物", "Nhận nuôi bạn mới", "Adopt a new pet") : L3("领养宠物", "Nhận nuôi thú cưng", "Adopt a pet")}</h2>
        {next ? <p style={{ margin: 0, fontSize: 13, lineHeight: "20px", color: "#167a59", background: "#eafaf3", borderRadius: 14, padding: "8px 12px" }}>{VI ? `🎓 ${s.name} đã tốt nghiệp và sẽ vào «Bộ sưu tập». Bạn mới bắt đầu lại từ quả trứng (XP và số bài đã qua tính lại từ 0), nhưng ⭐, 💗, huy hiệu, đồ đã mở khoá và bộ sưu tập đều được giữ nguyên.` : `🎓 ${s.name} has graduated and moves to your collection. The new pet starts from an egg (XP and lessons passed restart at 0), but ⭐, 💗, badges, unlocked items and the collection are all kept.`}</p> : null}
        <p style={{ margin: 0, fontSize: 14, lineHeight: "21px", color: "#6b3a63" }}>{VI ? "Chọn một bạn nhỏ và đặt tên. Bạn ấy sẽ lớn lên nhờ việc học của cậu: trứng → em bé → bạn nhỏ → thiếu nữ → tốt nghiệp 🎓. Không bao giờ bị phạt, chỉ có phần thưởng!" : "Choose a little friend and give it a name. It grows as you study: egg → baby → child → teen → graduate 🎓. No penalties, only rewards!"}</p>
        <div className="adopt" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px,1fr))", gap: 10 }}>
          {pets.map(([k, zh, v, e]) => (
            <button key={k} aria-pressed={pick === k} onClick={() => setPick(k)} style={{ cursor: "pointer", borderRadius: 22, padding: "10px 6px", background: pick === k ? "linear-gradient(160deg,#ffe1ee,#f3e6ff)" : "#fff", border: pick === k ? "2.5px solid #e8559a" : "1.5px solid rgba(232,85,154,0.25)", fontFamily: "inherit", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <PetSvg kind={k} stage={2} size={"100%"} />
              <span lang="zh-Hans" style={{ fontFamily: ZH_FONT, fontWeight: 800, color: "#8f2160", fontSize: 16 }}>{zh}</span>
              <span style={{ fontSize: 12, color: "#a0507f" }}>{VI ? v : e}{doneKinds.includes(k) ? " 🎓" : ""}</span>
            </button>
          ))}
        </div>
        <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "#8f2160", fontWeight: 700 }}>{L3("名字", "Tên", "Name")}
          <input value={name} maxLength={12} name="hsk4-pet-nickname" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} onChange={(e) => setName(e.target.value)} placeholder={VI ? `Để trống = «${DEFAULT_NAME}» · ví dụ: 小美, Bông, Mochi…` : `Leave blank for «${DEFAULT_NAME}» · e.g. 小美, Mochi…`} style={{ padding: "10px 14px", borderRadius: 16, border: "1.5px solid rgba(232,85,154,0.3)", fontSize: 16, fontFamily: "inherit" }} />
        </label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="adopt-go" onClick={() => { const first = !s.pet; adopt(pick, name.trim()); setAdopting(false); setName(""); if (first) { const l = say("egg"); if (l) setLine(l); } }} style={{ ...btn(true), padding: "11px 20px", fontSize: 15 }}>💗 {L3("领养", "Nhận nuôi", "Adopt")}</button>
          {next ? <button onClick={() => setAdopting(false)} style={btn()}>{VI ? "Để sau" : "Later"}</button> : null}
        </div>
        {next ? null : <ImportBox code={code} setCode={setCode} msg={msg} setMsg={setMsg} />}
      </section>
    );
  }
  const next = STAGES[Math.min(4, st + 1)];
  const talk = () => { const l = say(st === 0 ? "egg" : mood === "miss" ? "miss" : Math.random() < 0.3 ? "hi" : "cheer"); if (l) setLine(l); setPop((x: number) => x + 1); };
  const happyNow = Math.max(0, s.happy - (mood === "miss" ? 20 : 0));
  return (
    <section id="pet-top" className="card" style={{ display: "flex", flexDirection: "column", gap: 14, padding: "20px 16px", borderRadius: 24, background: "rgba(255,255,255,0.92)", boxShadow: "0 8px 26px rgba(214,90,160,0.12)", border: "1.5px solid rgba(248,190,220,0.55)", minWidth: 0 }}>
      <h2 style={{ margin: 0, fontSize: 21, fontWeight: 800, color: "#8f2160" }}>✿ {L3("我的宠物", "Thú cưng", "My Pet")}</h2>
      <div className="pet-main" style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 260px", maxWidth: 360, position: "relative" }}>
          <button aria-label="pet" onClick={talk} style={{ cursor: "pointer", border: "none", padding: 0, background: "transparent", width: "100%", display: "block", borderRadius: 24, boxShadow: "0 8px 24px rgba(143,33,96,0.15)" }}>
            <PetSvg kind={s.pet} stage={st} mood={mood} equip={s.equip} size={"100%"} room />
          </button>
          {pop ? <div key={pop} className="hearts-pop" aria-hidden>💗<span>💗</span><span>💗</span></div> : null}
          {line ? <div className="bubble" style={{ position: "absolute", left: 10, right: 10, top: 10, background: "rgba(255,255,255,0.95)", borderRadius: 18, padding: "8px 12px", boxShadow: "0 4px 14px rgba(143,33,96,0.15)", fontSize: 13, lineHeight: "19px", color: "#5a3a5f" }}>
            <div lang="zh-Hans" style={{ fontFamily: ZH_FONT, fontSize: 16, color: "#8f2160", fontWeight: 700 }}>🔊 {line.zh}</div>{VI ? line.vi : line.en}</div> : null}
          <div style={{ textAlign: "center", fontSize: 12, color: "#a0507f", marginTop: 6 }}>{VI ? "Chạm vào bạn ấy để nghe nói chuyện 🔊" : "Tap your pet to hear it talk 🔊"}</div>
        </div>
        <div style={{ flex: "1 1 240px", minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ ...box }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
              {renaming
                ? <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><input className="rename-in" value={rn} maxLength={12} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} onChange={(e) => setRn(e.target.value)} placeholder={DEFAULT_NAME} style={{ width: 130, padding: "6px 10px", borderRadius: 12, border: "1.5px solid rgba(232,85,154,0.35)", fontSize: 16, fontFamily: "inherit" }} /><button className="rename-ok" onClick={() => { S.name = petName(rn); save(); setRenaming(false); }} style={{ ...btn(true), padding: "6px 12px", fontSize: 13 }}>OK</button></span>
                : <span className="pet-name" lang="zh-Hans" style={{ fontFamily: ZH_FONT, fontSize: 22, fontWeight: 800, color: "#8f2160" }}>{s.name}</span>}
              {renaming ? null : <button className="rename" aria-label={VI ? "Đổi tên" : "Rename"} title={VI ? "Đổi tên" : "Rename"} onClick={() => { setRn(s.name); setRenaming(true); }} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 15, padding: 2 }}>✏️</button>}
              <span style={{ fontSize: 12, fontWeight: 800, color: "#fff", background: "linear-gradient(135deg,#ff8cc0,#c58bff)", borderRadius: 9999, padding: "3px 10px" }}>{STAGES[st].zh} · {VI ? STAGES[st].vi : STAGES[st].en}</span>
            </div>
            <div style={{ fontSize: 13, color: "#6b3a63", marginTop: 8 }}>XP {s.xp}{st < 4 ? ` / ${next.xp}` : ""}</div>
            <Bar v={s.xp} max={st < 4 ? next.xp : s.xp} />
            {st < 4 ? (
              <div style={{ fontSize: 12, color: "#8a5a82", marginTop: 6, lineHeight: "18px" }}>
                {VI ? "Để lớn lên: " : "To grow: "}{`XP ${Math.min(s.xp, next.xp)}/${next.xp} ${s.xp >= next.xp ? "✓" : ""} · `}{VI ? "bài đã qua (kiểm tra ≥8/10)" : "lessons passed (quiz ≥8/10)"} {`${s.lessons.length}/${next.lessons} ${s.lessons.length >= next.lessons ? "✓" : ""}`}
              </div>
            ) : <div style={{ fontSize: 13, color: "#167a59", marginTop: 6 }}>🎓 {VI ? "Đã tốt nghiệp! Giỏi quá!" : "Graduated! Amazing!"}</div>}
            <div style={{ fontSize: 12, color: "#8a5a82", marginTop: 4 }}>{VI ? "XP học hôm nay" : "Study XP today"}: {s.day === today() ? s.dayXp : 0}/{DAILY_CAP}{ciCur(s) >= 7 ? (VI ? " · thưởng chuỗi +10%" : " · streak bonus +10%") : ""}</div>
          </div>
          <div style={{ ...box, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, textAlign: "center" }}>
            <div><div style={{ fontSize: 22 }}>⭐</div><b className="cur-stars" style={{ color: "#8f2160" }}>{s.stars}</b></div>
            <div><div style={{ fontSize: 22 }}>💗</div><b className="cur-hearts" style={{ color: "#8f2160" }}>{s.hearts}</b></div>
            <div><div style={{ fontSize: 22 }}>🔥</div><b className="cur-streak" style={{ color: "#8f2160" }}>{ciCur(s)}</b> <span style={{ fontSize: 11, color: "#a0507f" }}>{VI ? "ngày" : "days"}</span></div>
          </div>
          <div style={{ ...box }}>
            <div style={{ fontSize: 13, color: "#6b3a63", marginBottom: 4 }}>{VI ? "Vui vẻ" : "Happiness"} {happyNow}%</div>
            <Bar v={happyNow} max={100} color="linear-gradient(90deg,#ffd36e,#ff9cc6)" />
            {mood === "miss" ? <div style={{ fontSize: 12, color: "#b0508a", marginTop: 6 }}>{VI ? `${s.name} nhớ cậu lắm… Học một chút hoặc cho ăn để bạn ấy vui lại nhé! (Không bị trừ gì đâu 💗)` : `${s.name} misses you… Study a little or have a snack together! (Nothing is ever lost 💗)`}</div> : null}
          </div>
        </div>
      </div>
      {s.gradDone ? <GradCard s={s} onNext={() => { setAdopting(true); setTimeout(() => { const e = document.getElementById("pet-top"); if (e && e.scrollIntoView) e.scrollIntoView({ block: "start" }); }, 30); }} /> : null}
      <CheckIn s={s} />
      <PetQuiz s={s} />
      <div style={{ ...box }}>
        <div style={{ fontWeight: 800, color: "#8f2160", marginBottom: 8 }}>🛍️ {L3("商店", "Cửa hàng", "Shop")}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {([["acc", "饰品", "Phụ kiện", "Accessories"], ["outfit", "衣服", "Trang phục", "Outfits"], ["food", "美食", "Đồ ăn", "Food"], ["room", "房间", "Phòng", "Rooms"], ["furn", "家具", "Nội thất", "Furniture"]] as [Item["cat"], string, string, string][]).map(([c, zh, v, e]) => <button key={c} onClick={() => setCat(c)} style={btn(cat === c)}>{zh} · {VI ? v : e}</button>)}
        </div>
        <div className="shop" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))", gap: 8 }}>
          {SHOP.filter((i) => i.cat === cat).map((it) => {
            const own = it.cat !== "food" && s.owned.includes(it.id);
            const on = own && (it.cat === "furn" ? (s.equip.furn || []).includes(it.id) : (s.equip as Record<string, unknown>)[it.cat] === it.id);
            const afford = (it.s ? s.stars >= it.s : true) && (it.h ? s.hearts >= it.h : true);
            return (
              <div key={it.id} style={{ borderRadius: 18, padding: 10, background: on ? "linear-gradient(160deg,#ffe1ee,#f3e6ff)" : "#fff7fb", border: on ? "2px solid #e8559a" : "1.5px solid rgba(232,85,154,0.18)", textAlign: "center" }}>
                <div style={{ fontSize: 30 }}>{it.icon}</div>
                <div lang="zh-Hans" style={{ fontFamily: ZH_FONT, fontWeight: 800, color: "#8f2160" }}>{it.zh}</div>
                <div style={{ fontSize: 12, color: "#8a5a82", minHeight: 18 }}>{VI ? it.vi : it.en}{it.happy ? ` · +${it.happy}♡` : ""}</div>
                {own ? <button onClick={() => wear(it)} style={{ ...btn(on), marginTop: 6, padding: "6px 12px", fontSize: 12 }}>{on ? (VI ? "Đang dùng ✓" : "On ✓") : VI ? "Dùng" : "Use"}</button>
                  : <button disabled={!afford} onClick={() => buy(it)} style={{ ...btn(afford), marginTop: 6, padding: "6px 12px", fontSize: 12, opacity: afford ? 1 : 0.45 }}>{it.s ? `${it.s}⭐` : `${it.h}💗`} {it.cat === "food" ? (VI ? "Cho ăn" : "Feed") : VI ? "Mua" : "Buy"}</button>}
              </div>
            );
          })}
        </div>
      </div>
      <Collection s={s} />
      <div style={{ ...box }}>
        <div style={{ fontWeight: 800, color: "#8f2160", marginBottom: 8 }}>🏅 {L3("徽章", "Huy hiệu", "Badges")}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px,1fr))", gap: 8 }}>
          {BADGES.map((b) => { const ok = s.earned.includes(b.id) || b.ok(s); return <div key={b.id} title={VI ? b.vi : b.en} style={{ textAlign: "center", borderRadius: 16, padding: "8px 4px", background: ok ? "linear-gradient(160deg,#fff3c4,#ffe1ee)" : "#f7f2f6", opacity: ok ? 1 : 0.55, filter: ok ? "none" : "grayscale(1)" }}><div style={{ fontSize: 26 }}>{b.icon}</div><div lang="zh-Hans" style={{ fontFamily: ZH_FONT, fontSize: 13, fontWeight: 800, color: "#8f2160" }}>{b.zh}</div><div style={{ fontSize: 10.5, color: "#8a5a82", lineHeight: "14px" }}>{VI ? b.vi : b.en}</div></div>; })}
        </div>
      </div>
      <div style={{ ...box, fontSize: 13, lineHeight: "20px", color: "#5a3a5f" }}>
        <div style={{ fontWeight: 800, color: "#8f2160", marginBottom: 6 }}>⭐ {L3("怎么获得奖励", "Cách nhận thưởng", "How to earn")}</div>
        {VI ? <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Đánh dấu xong một nhiệm vụ trong «Kế hoạch học tập»: +10 XP, +1⭐</li>
          <li>Xem hết một lượt thẻ từ của một bài: +8 XP, +1⭐ (mỗi bài 1 lần/ngày)</li>
          <li>Nghe hết một bài khoá («Nghe cả bài»): +6 XP, +1⭐ (mỗi bài 1 lần/ngày)</li>
          <li>Kiểm tra từng bài: +2 XP mỗi câu đúng; ≥8/10 được +1💗, 10/10 được +2💗 (mỗi bài 1 lần/ngày). ≥8/10 = bài đó được tính là «đã qua».</li>
          <li>Kiểm tra ngẫu nhiên: +1 XP mỗi câu đúng, +1💗 mỗi 10 câu đúng, phá kỷ lục cũ +2💗 (tối đa 2 lần/ngày)</li>
          <li>Tối đa {DAILY_CAP} XP học/ngày (học đều quan trọng hơn học dồn).</li>
          <li>📅 Điểm danh mỗi ngày (ngoài giới hạn trên): ngày 1–3 +10 XP +1⭐, ngày 4–6 +15 XP +2⭐, từ ngày 7 +20 XP +3⭐ (tối đa). Lỡ một ngày thì quay lại ngày 1. Chuỗi ≥7 ngày: XP học +10%; quà ở 7 và 30 ngày.</li>
          <li>🧠 Đố vui của thú cưng (1 lần/ngày, ngoài giới hạn): 5 câu, mỗi câu đúng +4 XP +1⭐; đúng cả 5 thêm +5 XP +1💗.</li>
          <li>🎓 Tốt nghiệp = mở khoá tất cả phụ kiện, trang phục, phòng, nội thất + huy hiệu, rồi nhận nuôi bạn mới.</li>
        </ul> : <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Tick off a study-plan task: +10 XP, +1⭐</li>
          <li>Go through a lesson's flashcards once: +8 XP, +1⭐ (once per lesson per day)</li>
          <li>Listen to a whole text («Play all»): +6 XP, +1⭐ (once per text per day)</li>
          <li>Lesson quiz: +2 XP per correct answer; ≥8/10 gives +1💗, 10/10 gives +2💗 (once per lesson per day). ≥8/10 marks the lesson as passed.</li>
          <li>Random level test: +1 XP per correct answer, +1💗 per 10 correct, +2💗 for beating your best (max 2 rewarded per day)</li>
          <li>Up to {DAILY_CAP} study XP per day (steady beats cramming).</li>
          <li>📅 Daily check-in (outside that cap): days 1–3 +10 XP +1⭐, days 4–6 +15 XP +2⭐, day 7 on +20 XP +3⭐ (max). Miss a day and it restarts at day 1. Streak ≥7 days: +10% study XP; gifts at 7 and 30 days.</li>
          <li>🧠 Pet quiz (once a day, outside the cap): 5 questions, +4 XP +1⭐ each correct; all 5 right adds +5 XP +1💗.</li>
          <li>🎓 Graduating unlocks every accessory, outfit, room and furniture item plus a badge, then you can adopt another pet.</li>
        </ul>}
        <div style={{ marginTop: 6 }}>{VI ? "Lớn lên" : "Growth"}: {STAGES.slice(1).map((g) => `${g.zh} ${g.xp} XP + ${g.lessons} ${VI ? "bài đã qua" : "lessons passed"}`).join(" → ")}</div>
      </div>
      <div style={{ ...box }}>
        <div style={{ fontWeight: 800, color: "#8f2160", marginBottom: 6 }}>💾 {L3("转移进度", "Chuyển tiến độ sang máy khác", "Move progress to another device")}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button style={btn(true)} onClick={() => { const c = exportCode(); setCode(c); try { navigator.clipboard && navigator.clipboard.writeText(c); } catch (e) { /* ignore */ } setMsg(VI ? "Đã tạo mã (và sao chép nếu trình duyệt cho phép). Dán mã này ở máy mới." : "Code created (and copied if allowed). Paste it on the new device."); }}>{VI ? "Xuất mã" : "Export code"}</button>
          <button style={btn()} onClick={() => { const c = exportCode(); const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([c], { type: "text/plain" })); a.download = "hsk4-progress.txt"; a.click(); }}>{VI ? "Tải file" : "Download file"}</button>
        </div>
        <ImportBox code={code} setCode={setCode} msg={msg} setMsg={setMsg} />
      </div>
    </section>
  );
}

const SAY_BUBBLE = { position: "relative", background: "#fff", borderRadius: 18, padding: "10px 12px", border: "1.5px solid #ffc2dc", boxShadow: "0 4px 14px rgba(143,33,96,0.1)", flex: 1, minWidth: 0 } as const;
function CheckIn({ s }: { s: St }) {
  const [burst, setBurst] = useState(0);
  const t = today(); const done = s.ciLast === t; const cur = ciCur(s);
  const nextDay = cur + 1; const r = ciReward(done ? cur : nextDay); const tomorrow = ciReward(done ? cur + 1 : nextDay + 1);
  const base = Math.max(1, (done ? cur : nextDay) - 3);
  const days = Array.from({ length: 7 }, (_, i) => base + i);
  const last14 = Array.from({ length: 14 }, (_, i) => dayStr(i - 13));
  return (
    <div className={`checkin${burst ? " ci-pop" : ""}`} key={burst} style={{ ...box, background: "linear-gradient(160deg,#fff8e6,#ffe9f3)", position: "relative", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div className="flame" style={{ fontSize: 40, lineHeight: "44px" }} aria-hidden>🔥</div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontWeight: 800, color: "#8f2160" }}>📅 {L3("每日打卡", "Điểm danh mỗi ngày", "Daily check-in")}</div>
          <div style={{ fontSize: 13, color: "#6b3a63" }}>{VI ? <>Chuỗi hiện tại: <b className="ci-streak">{cur}</b> ngày · kỷ lục {s.ciMax}</> : <>Current streak: <b className="ci-streak">{cur}</b> days · best {s.ciMax}</>}</div>
        </div>
        {done
          ? <div style={{ ...btn(), cursor: "default", color: "#167a59", borderColor: "#9fe0c4" }}>✓ {VI ? "Đã điểm danh" : "Checked in"}</div>
          : <button className="ci-btn pulse" onClick={() => { if (checkIn()) setBurst((x: number) => x + 1); }} style={{ ...btn(true), padding: "11px 18px", fontSize: 15 }}>✋ {L3("打卡", "Điểm danh", "Check in")} +{r.xp} XP +{r.s}⭐</button>}
      </div>
      <div className="ci-track" style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0,1fr))", gap: 5, marginTop: 12 }}>
        {days.map((d) => { const got = d <= cur && (done || d < nextDay); const isNext = !done && d === nextDay; const isTom = done && d === cur + 1; const rr = ciReward(d);
          return <div key={d} style={{ textAlign: "center", borderRadius: 14, padding: "6px 2px", background: got ? "linear-gradient(160deg,#ffb3d1,#c58bff)" : isNext || isTom ? "#fff" : "rgba(255,255,255,0.6)", border: isNext || isTom ? "2px dashed #e8559a" : "1.5px solid rgba(232,85,154,0.15)", color: got ? "#fff" : "#8f2160" }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, opacity: 0.85 }}>{VI ? `Ngày ${d}` : `Day ${d}`}</div>
            <div style={{ fontSize: 14, fontWeight: 800 }}>{got ? "✓" : `+${rr.xp}`}</div>
            <div style={{ fontSize: 10 }}>{"⭐".repeat(rr.s)}</div>
          </div>; })}
      </div>
      <div style={{ fontSize: 12.5, color: "#7a4f78", marginTop: 8, lineHeight: "18px" }}>
        {done ? (VI ? `🎁 Ngày mai (ngày ${cur + 1}): +${tomorrow.xp} XP +${tomorrow.s}⭐${cur + 1 === 4 || cur + 1 === 7 ? " — lên mức thưởng mới!" : ""}` : `🎁 ${cur + 1 === 4 || cur + 1 === 7 ? "Hôm nay lên mức thưởng mới! " : ""}`)
          : (done ? `🎁 Tomorrow (day ${cur + 1}): +${tomorrow.xp} XP +${tomorrow.s}⭐${cur + 1 === 4 || cur + 1 === 7 ? " — next reward tier!" : ""}` : `🎁 ${cur + 1 === 4 || cur + 1 === 7 ? "New reward tier today! " : ""}`)}
        {VI ? " Lỡ một ngày sẽ quay về ngày 1 (+10)." : " Miss a day and it restarts at day 1 (+10)."}
      </div>
      <div aria-label={VI ? "14 ngày gần nhất" : "Last 14 days"} style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
        {last14.map((d) => { const on = s.ciDays.includes(d); return <span key={d} title={d} style={{ width: 16, height: 16, borderRadius: 6, background: on ? "#ff8cc0" : "rgba(232,85,154,0.12)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", outline: d === t ? "2px solid #c58bff" : "none" }}>{on ? "✓" : ""}</span>; })}
      </div>
      {burst ? <div className="confetti" aria-hidden style={{ position: "absolute", left: 0, right: 0, top: 120 }}>{["💗", "⭐", "🔥", "✨", "🌸", "⭐"].map((c, i) => <span key={i} style={{ left: `${8 + i * 15}%`, animationDelay: `${i * 0.1}s`, animationIterationCount: 2 }}>{c}</span>)}</div> : null}
    </div>
  );
}

const PQT: Record<string, [string, string, string]> = {
  meaning: ["这个词是什么意思？", "Từ này nghĩa là gì?", "What does this word mean?"],
  hanzi: ["哪个词是这个意思？", "Từ nào có nghĩa này?", "Which word means this?"],
  pinyin: ["拼音是哪个？", "Pinyin đúng là?", "Which pinyin is right?"],
  fill: ["选词填空", "Chọn từ điền vào chỗ trống", "Fill in the blank"],
  grammar: ["语法", "Ngữ pháp", "Grammar"],
  order: ["选出正确的句子", "Chọn câu đúng", "Pick the correct sentence"],
};
function PetQuiz({ s }: { s: St }) {
  const t = today(); const q = s.pq && s.pq.day === t ? s.pq : null;
  const st = stageOf(s);
  const head = <div style={{ fontWeight: 800, color: "#8f2160", marginBottom: 8 }}>🧠 {L3("宠物小测验", "Thú cưng đố vui", "Pet quiz")} <span style={{ fontWeight: 600, fontSize: 12, color: "#a0507f" }}>· {VI ? "5 câu mỗi ngày" : "5 questions a day"}</span></div>;
  const avatar = s.pet ? <div style={{ width: 64, flex: "0 0 64px" }}><PetSvg kind={s.pet} stage={st} equip={s.equip} size={64} /></div> : null;
  if (!q) return (
    <div className="pquiz" style={{ ...box }}>{head}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>{avatar}
        <div style={SAY_BUBBLE}><div lang="zh-Hans" style={{ fontFamily: ZH_FONT, fontWeight: 700, color: "#8f2160" }}>我来考考你，准备好了吗？</div><div style={{ fontSize: 13, color: "#6b3a63" }}>{VI ? `${s.name} có 5 câu đố cho cậu. Mỗi câu đúng +4 XP +1⭐, đúng hết +5 XP +1💗.` : `${s.name} has 5 questions for you. +4 XP +1⭐ per correct answer, all 5 right: +5 XP +1💗.`}</div></div>
      </div>
      <button className="pq-start" onClick={() => pqStart()} style={{ ...btn(true), marginTop: 10 }}>▶ {L3("开始", "Bắt đầu", "Start")}</button>
    </div>
  );
  const n = q.items.length; const i = q.ans.length;
  if (q.done || i >= n) {
    const right = q.items.filter((d, k) => d.perm[q.ans[k]] === 0).length;
    return (
      <div className="pquiz" style={{ ...box }}>{head}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>{avatar}
          <div style={SAY_BUBBLE}><div className="pq-score" style={{ fontSize: 22, fontWeight: 800, color: "#8f2160" }}>{right}/{n} {right === n ? "🎉" : right >= 3 ? "👏" : "💪"}</div>
            <div style={{ fontSize: 13, color: "#6b3a63" }}>{q.done ? q.got : ""}{q.done ? (VI ? " · Mai quay lại có câu đố mới nhé!" : " · Come back tomorrow for new questions!") : ""}</div></div>
        </div>
        {!q.done ? <button className="pq-finish" onClick={() => pqFinish()} style={{ ...btn(true), marginTop: 10 }}>🎁 {VI ? "Nhận thưởng" : "Claim reward"}</button> : null}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
          {q.items.map((d, k) => { const it = bankItem(d.id); if (!it) return null; const ok = d.perm[q.ans[k]] === 0; return (
            <div key={d.id} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, background: ok ? "#eafaf3" : "#fff0f4", borderRadius: 12, padding: "6px 10px" }}>
              <span>{ok ? "✅" : "❌"}</span><span style={{ flex: 1, minWidth: 0 }}><b lang="zh-Hans" style={{ fontFamily: ZH_FONT }}>{it.stem}</b> → {it.opts[0]}</span>
              {it.au ? <SpeakBtn items={[[it.au[0], it.au[1], "pqr:" + d.id]]} k={"pqr:" + d.id} size={28} /> : null}
            </div>); })}
        </div>
      </div>
    );
  }
  const d = q.items[i]; const it = bankItem(d.id);
  if (!it) return null;
  const lab = PQT[it.ty] || PQT.grammar;
  const zhStem = it.ty !== "hanzi";
  return (
    <div className="pquiz" style={{ ...box }}>{head}
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>{q.items.map((_, k) => <span key={k} style={{ flex: 1, height: 6, borderRadius: 9999, background: k < i ? "#ff8cc0" : k === i ? "#c58bff" : "#fde8f3" }} />)}</div>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>{avatar}
        <div className="pq-q" style={SAY_BUBBLE}>
          <div style={{ fontSize: 12, color: "#a0507f", fontWeight: 700 }}>{i + 1}/{n} · {lab[0]} · {VI ? lab[1] : lab[2]}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <div lang={zhStem ? "zh-Hans" : undefined} style={{ fontFamily: zhStem ? ZH_FONT : "inherit", fontSize: it.ty === "meaning" || it.ty === "pinyin" ? 26 : 17, fontWeight: 700, color: "#5a3a5f", lineHeight: 1.4 }}>{it.stem}</div>
            {it.au && it.ty === "meaning" ? <SpeakBtn items={[[it.au[0], it.au[1], "pqs:" + d.id]]} k={"pqs:" + d.id} size={30} /> : null}
          </div>
        </div>
      </div>
      <div className="pq-opts" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))", gap: 8, marginTop: 10 }}>
        {d.perm.map((oi, k) => <button key={k} onClick={() => pqAnswer(k)} style={{ ...btn(), textAlign: "left", borderRadius: 16, padding: "10px 12px", fontFamily: /[\u4e00-\u9fff]/.test(it.opts[oi]) ? ZH_FONT : "inherit", fontWeight: 700 }}>{"ABCD"[k]}. {it.opts[oi]}</button>)}
      </div>
      {i > 0 ? (() => { const pd = q.items[i - 1]; const pit = bankItem(pd.id); const ok = pd.perm[q.ans[i - 1]] === 0; return pit ? <div className="pq-fb" style={{ marginTop: 8, fontSize: 13, color: ok ? "#167a59" : "#b0306a" }}>{ok ? (VI ? "✅ Câu trước đúng rồi!" : "✅ Last one was right!") : (VI ? `❌ Câu trước: đáp án là ${pit.opts[0]}` : `❌ Last one: the answer was ${pit.opts[0]}`)}</div> : null; })() : null}
    </div>
  );
}

function GradCard({ s, onNext }: { s: St; onNext: () => void }) {
  return (
    <div className="gradcard" style={{ ...box, background: "linear-gradient(160deg,#fff3c4,#ffe1ee 60%,#efe3ff)", textAlign: "center", border: "2px solid #ffd36e" }}>
      <div style={{ fontSize: 34 }}>🎓🏅</div>
      <div lang="zh-Hans" style={{ fontFamily: ZH_FONT, fontSize: 20, fontWeight: 800, color: "#8f2160" }}>{L3("毕业成就达成！", "Đạt thành tựu tốt nghiệp!", "Graduation achievement!")}</div>
      <div style={{ fontSize: 13, color: "#6b3a63", margin: "6px 0 10px", lineHeight: "20px" }}>{VI ? `${s.name} đã tốt nghiệp ngày ${s.gradDate}. Tất cả phụ kiện, trang phục, phòng và nội thất đã được mở khoá. Cậu có thể nhận nuôi một bạn mới — ${s.name} sẽ ở trong «Bộ sưu tập».` : `${s.name} graduated on ${s.gradDate}. Every accessory, outfit, room and furniture item is unlocked. You can adopt a new pet — ${s.name} stays in your collection.`}</div>
      <button className="adopt-next" onClick={onNext} style={{ ...btn(true), padding: "11px 20px", fontSize: 15 }}>🥚 {L3("领养下一只", "Nhận nuôi bạn mới", "Adopt another pet")}</button>
    </div>
  );
}

function Collection({ s }: { s: St }) {
  const [sel, setSel] = useState(-1);
  const list: (Grad & { cur?: boolean })[] = [...s.grads, ...(s.pet ? [{ pet: s.pet, name: s.name, equip: s.equip, date: s.gradDate, xp: s.xp, born: s.born, cur: true }] : [])];
  if (!s.grads.length && !s.gradDone) return null;
  const v = sel >= 0 && sel < list.length ? list[sel] : null;
  const vst = v ? (v.cur ? stageOf(s) : 4) : 0;
  return (
    <div className="collection" style={{ ...box }}>
      <div style={{ fontWeight: 800, color: "#8f2160", marginBottom: 8 }}>🏆 {L3("毕业相册", "Bộ sưu tập tốt nghiệp", "Graduates gallery")} <span style={{ fontWeight: 600, fontSize: 12, color: "#a0507f" }}>· {s.grads.length + (s.gradDone ? 1 : 0)} 🎓</span></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(92px,1fr))", gap: 8 }}>
        {list.map((g, k) => { const gs = g.cur ? stageOf(s) : 4; const kind = PETS.find((p) => p[0] === g.pet);
          return <button key={k} aria-pressed={sel === k} onClick={() => setSel(sel === k ? -1 : k)} style={{ cursor: "pointer", borderRadius: 18, padding: 6, background: sel === k ? "linear-gradient(160deg,#ffe1ee,#f3e6ff)" : "#fff7fb", border: sel === k ? "2px solid #e8559a" : "1.5px solid rgba(232,85,154,0.18)", fontFamily: "inherit", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <PetSvg kind={g.pet} stage={gs} equip={g.equip} size={"100%"} anim={false} />
            <span lang="zh-Hans" style={{ fontFamily: ZH_FONT, fontWeight: 800, color: "#8f2160", fontSize: 13, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.name}</span>
            <span style={{ fontSize: 10.5, color: "#a0507f" }}>{kind ? kind[1] : ""}{g.cur ? (VI ? " · hiện tại" : " · current") : " 🎓"}</span>
          </button>; })}
      </div>
      {v ? <div className="coll-view" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginTop: 10 }}>
        <div style={{ width: 180, maxWidth: "50%" }}><PetSvg kind={v.pet} stage={vst} equip={v.equip} size={"100%"} room /></div>
        <div style={{ fontSize: 13, color: "#6b3a63", lineHeight: "20px" }}>
          <div lang="zh-Hans" style={{ fontFamily: ZH_FONT, fontSize: 18, fontWeight: 800, color: "#8f2160" }}>{v.name}</div>
          <div>{(PETS.find((p) => p[0] === v.pet) || [])[1]} · {VI ? (PETS.find((p) => p[0] === v.pet) || [])[2] : (PETS.find((p) => p[0] === v.pet) || [])[3]}</div>
          <div>XP {v.xp}</div>
          {v.date ? <div>🎓 {v.date}</div> : null}
        </div>
      </div> : <div style={{ fontSize: 12, color: "#a0507f", marginTop: 6 }}>{VI ? "Chạm vào một bạn để xem." : "Tap a pet to view it."}</div>}
    </div>
  );
}

function ImportBox({ code, setCode, msg, setMsg }: { code: string; setCode: (s: string) => void; msg: string; setMsg: (s: string) => void }) {
  return (
    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
      <textarea value={code} onChange={(e) => setCode(e.target.value)} rows={3} placeholder={VI ? "Dán mã tiến độ (HSK4PET1:…) để nhập" : "Paste a progress code (HSK4PET1:…) to import"} style={{ width: "100%", borderRadius: 14, border: "1.5px solid rgba(232,85,154,0.3)", padding: 8, fontSize: 12, fontFamily: "ui-monospace, monospace" }} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <button style={btn()} onClick={() => { if (importCode(code)) { setMsg(VI ? "Đã nhập! Đang tải lại…" : "Imported! Reloading…"); setTimeout(() => location.reload(), 600); } else setMsg(VI ? "Mã không hợp lệ." : "Invalid code."); }}>{VI ? "Nhập mã" : "Import code"}</button>
        <label style={{ ...btn(), display: "inline-block" }}>{VI ? "Chọn file…" : "Choose file…"}<input type="file" accept=".txt,text/plain" style={{ display: "none" }} onChange={(e) => { const f = e.target.files && e.target.files[0]; if (f) f.text().then((t) => setCode(t.trim())); }} /></label>
        {msg ? <span style={{ fontSize: 12, color: "#8f2160" }}>{msg}</span> : null}
      </div>
    </div>
  );
}

export function PetWidget() {
  const s = usePet(); const ts = useToasts();
  if (!PET_ON) return null;
  const st = stageOf(s); const next = STAGES[Math.min(4, st + 1)];
  const go = () => window.dispatchEvent(new CustomEvent("hsk4-goto", { detail: "pet" }));
  return (
    <>
      <div className="toasts" aria-live="polite" style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 96, zIndex: 80, display: "flex", flexDirection: "column", gap: 8, alignItems: "center", pointerEvents: "none", width: "min(92vw, 420px)" }}>
        {ts.slice(-3).map((t) => t.kind === "level"
          ? <div key={t.id} className="levelup" style={{ pointerEvents: "none", background: "linear-gradient(135deg,#fff,#ffe1ee)", borderRadius: 26, padding: "16px 18px", boxShadow: "0 14px 40px rgba(143,33,96,0.3)", textAlign: "center", border: "2px solid #ff8cc0", width: "100%" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#c0447f", letterSpacing: 2 }}>✨ LEVEL UP ✨</div>
            {t.snap ? <div style={{ width: 110, margin: "4px auto" }}><PetSvg kind={t.snap.pet} stage={t.snap.stage} equip={t.snap.equip} size={110} /></div> : null}
            <div lang="zh-Hans" style={{ fontFamily: ZH_FONT, fontSize: 16, fontWeight: 800, color: "#8f2160" }}>{t.text}</div>
            {t.sub ? <div style={{ fontSize: 13, color: "#7a4f78", marginTop: 2 }}>{t.sub}</div> : null}
            <div className="confetti" aria-hidden>{["💗", "⭐", "🌸", "✨", "💗", "⭐"].map((c, i) => <span key={i} style={{ left: `${10 + i * 15}%`, animationDelay: `${i * 0.12}s` }}>{c}</span>)}</div>
          </div>
          : <div key={t.id} className="toast" style={{ background: t.kind === "gift" ? "linear-gradient(135deg,#fff3c4,#ffe1ee)" : "#fff", borderRadius: 9999, padding: "9px 16px", boxShadow: "0 8px 24px rgba(143,33,96,0.22)", fontSize: 14, fontWeight: 800, color: "#8f2160", border: "1.5px solid #ffc2dc" }}>{t.text}</div>)}
      </div>
      <button className="pet-widget" aria-label={VI ? "Thú cưng của tôi" : "My pet"} onClick={go} style={{ position: "fixed", right: 12, bottom: 12, zIndex: 70, cursor: "pointer", border: "2px solid #ffc2dc", background: "rgba(255,255,255,0.95)", borderRadius: 24, padding: "6px 10px 8px", boxShadow: "0 8px 22px rgba(143,33,96,0.2)", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, width: 84 }}>
        {s.pet ? <PetSvg kind={s.pet} stage={st} mood={moodOf(s)} equip={s.equip} size={58} /> : <span style={{ fontSize: 34, lineHeight: "50px" }}>🥚</span>}
        <span style={{ fontSize: 10.5, fontWeight: 800, color: "#8f2160", maxWidth: 70, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.pet ? s.name : VI ? "Nhận nuôi!" : "Adopt!"}</span>
        {s.pet ? <span style={{ width: 64 }}><Bar v={st >= 4 ? 1 : s.xp} max={st >= 4 ? 1 : next.xp} /></span> : null}
      </button>
    </>
  );
}
