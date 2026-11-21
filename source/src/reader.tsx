// 课文 reader: original practice texts (written for this site) with toggleable pinyin and translation.
import { useState, useEffect, useLayoutEffect, useRef, ZH_FONT, Sparkle } from "./kit";
import type { ReactNode, CSSProperties } from "./kit";
import { SpeakBtn, useSpeaking, wordAudio } from "./audio";
import { petEvent } from "./pet";

type Line = { s: string; sp: string[]; t: string; p: string[]; vi: string; en: string };
type Txt = { n: number; zh: string; vi: string; en: string; kw?: string[]; lines: Line[] };
type Lesson = { l: number; texts: Txt[] };
type Gloss = { h: string; p: string; pos: string; m: string };
type Tip = { id: string; w: string; el: HTMLElement };
declare const HSK_TEXTS: Lesson[];
declare const HSK_DATA: { WRAW?: string };
const DATA: Lesson[] = typeof HSK_TEXTS !== "undefined" ? HSK_TEXTS : [];
const KEY = "hsk4-reader-v1";

// Two highlighted words in lesson 1 are used in the practice text but are not in the official 601-word list.
const EXTRA: Record<"vi" | "en", Record<string, Gloss>> = {
  vi: {
    星星: { h: "星星", p: "xīngxing", pos: "n.", m: "ngôi sao" },
    亮: { h: "亮", p: "liàng", pos: "adj.", m: "sáng, sáng tỏ" },
  },
  en: {
    星星: { h: "星星", p: "xīngxing", pos: "n.", m: "star" },
    亮: { h: "亮", p: "liàng", pos: "adj.", m: "bright" },
  },
};

function loadGloss(lang: "vi" | "en"): Map<string, Gloss> {
  const map = new Map<string, Gloss>();
  const raw = typeof HSK_DATA !== "undefined" && HSK_DATA && HSK_DATA.WRAW ? HSK_DATA.WRAW : "";
  for (const line of raw.trim().split("\n")) {
    if (!line) continue;
    const f = line.split("|");
    const h = f[0] ?? "";
    if (!h) continue;
    map.set(h, { h, p: f[1] ?? "", pos: f[2] ?? "", m: f[3] ?? "" });
  }
  for (const [h, g] of Object.entries(EXTRA[lang])) if (!map.has(h)) map.set(h, g);
  return map;
}

function markAt(text: string, words: string[]): (string | null)[] {
  const tags: (string | null)[] = new Array(Array.from(text).length).fill(null);
  const list = [...words].filter((w) => w).sort((a, b) => b.length - a.length);
  for (const w of list) {
    let from = 0;
    while (from <= text.length - w.length) {
      const k = text.indexOf(w, from);
      if (k < 0) break;
      const chars = Array.from(text.slice(0, k)).length;
      const n = Array.from(w).length;
      if (tags.slice(chars, chars + n).every((x) => !x)) for (let i = 0; i < n; i++) tags[chars + i] = w;
      from = k + Math.max(1, w.length);
    }
  }
  return tags;
}

const KW_STYLE: CSSProperties = { fontWeight: 800, color: "#6a1848", background: "linear-gradient(180deg, #fff3a8 0%, #ffd2e8 100%)", borderRadius: 5, padding: "0 2px", boxShadow: "inset 0 -2px 0 rgba(232,85,154,0.28)", boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", lineHeight: "inherit", border: "none", display: "inline", textAlign: "inherit", appearance: "none", WebkitAppearance: "none", margin: 0, verticalAlign: "baseline" };

function Ruby({ text, py, show, size, marks, lineId, openId, onKw }: { text: string; py: string[]; show: boolean; size: number; marks?: string[]; lineId: string; openId: string; onKw: (id: string, w: string, el: HTMLElement) => void }) {
  const chars = Array.from(text);
  const tags = marks && marks.length ? markAt(text, marks) : chars.map(() => null);
  const glyph = (ch: string, i: number) => {
    const p = py[i] ?? "";
    return show && p ? <ruby key={i}>{ch}<rt style={{ fontSize: Math.max(11, Math.round(size * 0.5)), color: "#c0447f", fontFamily: "ui-rounded, system-ui, sans-serif", fontWeight: 500, letterSpacing: 0 }}>{p}</rt></ruby> : <span key={i}>{ch}</span>;
  };
  const out: ReactNode[] = [];
  let i = 0;
  while (i < chars.length) {
    if (tags[i]) {
      const w = tags[i] as string;
      let j = i + 1; while (j < chars.length && tags[j] === w) j++;
      const id = `${lineId}:${i}:${w}`;
      const on = openId === id;
      out.push(
        <strong
          key={i}
          role="button"
          tabIndex={0}
          data-kw={w}
          data-kwid={id}
          aria-expanded={on}
          aria-haspopup="dialog"
          title={w}
          style={{ ...KW_STYLE, boxShadow: on ? "inset 0 -2px 0 rgba(232,85,154,0.28), 0 0 0 2px rgba(232,85,154,0.45)" : KW_STYLE.boxShadow }}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onKw(id, w, e.currentTarget); }}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onKw(id, w, e.currentTarget); } }}
        >{chars.slice(i, j).map((ch, k) => glyph(ch, i + k))}</strong>
      );
      i = j;
    } else { out.push(glyph(chars[i], i)); i++; }
  }
  return <>{out}</>;
}

function KwPopup({ tip, gloss, lang, onClose }: { tip: Tip; gloss: Gloss | undefined; lang: "vi" | "en"; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width: number; arrow: number; above: boolean }>({ top: 0, left: 0, width: 260, arrow: 24, above: false });
  const place = () => {
    const el = tip.el;
    if (!el || !el.isConnected) { onClose(); return; }
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 10;
    const width = Math.min(280, Math.max(200, vw - margin * 2));
    const bh = box.current ? box.current.offsetHeight : 130;
    let left = r.left + r.width / 2 - width / 2;
    left = Math.max(margin, Math.min(left, vw - width - margin));
    const below = r.bottom + 8;
    let above = false;
    let top = below;
    if (top + bh > vh - margin) {
      const topAbove = r.top - 8 - bh;
      if (topAbove >= margin) { top = topAbove; above = true; }
      else top = Math.max(margin, vh - bh - margin);
    }
    top = Math.max(margin, Math.min(top, Math.max(margin, vh - bh - margin)));
    left = Math.max(margin, Math.min(left, Math.max(margin, vw - width - margin)));
    const arrow = Math.max(14, Math.min(width - 22, r.left + r.width / 2 - left - 7));
    setPos({ top, left, width, arrow, above });
  };
  useLayoutEffect(() => { place(); }, [tip.id, tip.w, gloss]);
  useEffect(() => {
    const ev = () => place();
    window.addEventListener("scroll", ev, true);
    window.addEventListener("resize", ev);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    const onPtr = (e: PointerEvent) => {
      const t = e.target as Node | null;
      if (box.current && t && box.current.contains(t)) return;
      if (tip.el && t && tip.el.contains(t)) return;
      onClose();
    };
    document.addEventListener("pointerdown", onPtr);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", ev, true);
      window.removeEventListener("resize", ev);
      document.removeEventListener("pointerdown", onPtr);
      document.removeEventListener("keydown", onKey);
    };
  }, [tip.id]);
  const vi = lang === "vi";
  const g = gloss || { h: tip.w, p: "", pos: "", m: vi ? "Chưa có nghĩa trong danh sách từ." : "No meaning in the word list." };
  return (
    <div
      ref={box}
      role="dialog"
      aria-label={vi ? `Nghĩa của ${g.h}` : `Meaning of ${g.h}`}
      onPointerDown={(e) => e.stopPropagation()}
      style={{ position: "fixed", top: pos.top, left: pos.left, width: pos.width, zIndex: 120, boxSizing: "border-box", padding: "12px 14px 14px", borderRadius: 20, background: "linear-gradient(180deg,#fffafd 0%,#fff 55%)", border: "1.5px solid rgba(248,190,220,0.95)", boxShadow: "0 14px 32px rgba(143,33,96,0.22)", fontFamily: "ui-rounded, system-ui, sans-serif", color: "#43284d" }}
    >
      <div aria-hidden style={{ position: "absolute", zIndex: 2, width: 14, height: 14, left: pos.arrow, background: "#fffafd", border: "1.5px solid rgba(248,190,220,0.95)", transform: "rotate(45deg)", top: pos.above ? undefined : -7, bottom: pos.above ? -7 : undefined, borderBottom: pos.above ? undefined : "none", borderRight: pos.above ? undefined : "none", borderTop: pos.above ? "none" : undefined, borderLeft: pos.above ? "none" : undefined, boxShadow: "none", pointerEvents: "none" }} />
      <div style={{ position: "relative" }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.6, color: "#c0447f", marginBottom: 4 }}>{vi ? "✿ TỪ MỚI" : "✿ NEW WORD"}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <div lang="zh-Hans" style={{ fontFamily: ZH_FONT, fontSize: 26, lineHeight: "32px", fontWeight: 800, color: "#6a1848", minWidth: 0 }}>{g.h}</div>
          <SpeakBtn items={wordAudio(g.h)} k={"w:" + g.h} size={32} label={vi ? "Nghe từ này" : "Play this word"} />
          <button type="button" aria-label={vi ? "Đóng" : "Close"} onClick={onClose} style={{ marginLeft: "auto", cursor: "pointer", width: 28, height: 28, borderRadius: 9999, border: "1.5px solid rgba(232,85,154,0.3)", background: "#fff", color: "#8f2160", fontWeight: 800, fontSize: 16, lineHeight: "26px", padding: 0, flex: "0 0 auto" }}>×</button>
        </div>
        {g.p ? <div style={{ marginTop: 2, fontSize: 15, fontWeight: 600, color: "#c0447f" }}>{g.p}{g.pos ? <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 700, color: "#b07090" }}>· {g.pos}</span> : null}</div> : null}
        <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: 12, background: "linear-gradient(135deg,#fff0f7,#f5ecff)", fontSize: 16, lineHeight: "23px", fontWeight: 600, color: "#5a2a58" }}>{g.m}</div>
      </div>
    </div>
  );
}

function Pill({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-pressed={on} style={{ cursor: "pointer", border: on ? "none" : "1.5px solid rgba(232,85,154,0.3)", borderRadius: 9999, padding: "8px 14px", fontFamily: "inherit", fontSize: 14, fontWeight: 700, background: on ? "linear-gradient(135deg,#ff8cc0,#c58bff)" : "#fff", color: on ? "#fff" : "#8f2160", boxShadow: on ? "0 4px 12px rgba(232,85,154,0.28)" : "none" }}>
      {on ? "✓ " : ""}{label}
    </button>
  );
}

export function Reader({ lang, titles }: { lang: "vi" | "en"; titles: [string, string][] }) {
  const [st, setSt] = useState<{ l: number; py: boolean; tr: boolean }>({ l: 1, py: true, tr: true });
  const [size, setSize] = useState<number>(24);
  const [tip, setTip] = useState<Tip | null>(null);
  const gloss = loadGloss(lang);
  useEffect(() => { try { const r = window.localStorage.getItem(KEY); if (r) { const o = JSON.parse(r); setSt({ l: Math.min(20, Math.max(1, Number(o.l) || 1)), py: o.py !== false, tr: o.tr !== false }); if (o.size) setSize(Number(o.size)); } } catch (e) { /* storage unavailable */ } }, []);
  const save = (n: { l: number; py: boolean; tr: boolean }, sz = size) => { setSt(n); setTip(null); try { window.localStorage.setItem(KEY, JSON.stringify({ ...n, size: sz })); } catch (e) { /* storage unavailable */ } };
  const go = (l: number) => { save({ ...st, l }); const el = document.getElementById("reader-top"); if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const onKw = (id: string, w: string, el: HTMLElement) => { setTip((cur) => (cur && cur.id === id ? null : { id, w, el })); };
  const les = DATA.find((x) => x.l === st.l);
  const vi = lang === "vi";
  const T = {
    head: vi ? "课文文章 · Bài khoá" : "课文文章 · Texts",
    note: vi
      ? "Đây là các bài khoá luyện tập do trang này tự soạn, dùng từ mới và ngữ pháp của từng bài trong giáo trình HSK 4 (nhân vật: A Linh – cô gái Việt Nam du học ở Trung Quốc, và bạn cùng phòng Tiểu Tuyết). Bài khoá gốc trong sách thuộc bản quyền của nhà xuất bản nên không đăng lại ở đây – hãy đọc trong sách giáo khoa."
      : "These are original practice texts written for this site, using each lesson's HSK 4 vocabulary and grammar (characters: A Linh, a Vietnamese student in China, and her roommate Xiaoxue). The textbook's own texts are copyrighted by the publisher and are not reproduced here — read them in your book.",
    hint: vi ? "Bấm vào từ được tô sáng để xem nghĩa tiếng Việt và nghe phát âm." : "Tap a highlighted word to see its meaning and hear it.",
    py: vi ? "拼音 · Pinyin" : "拼音 · Pinyin",
    tr: vi ? "翻译 · Bản dịch" : "翻译 · Translation",
    prev: vi ? "‹ Bài trước" : "‹ Previous",
    next: vi ? "Bài sau ›" : "Next ›",
    lesson: (l: number) => (vi ? `第${l}课 · Bài ${l}` : `第${l}课 · Lesson ${l}`),
    text: (n: number) => (vi ? `课文${n} · Bài khoá ${n}` : `课文${n} · Text ${n}`),
    size: vi ? "Cỡ chữ" : "Text size",
  };
  const ttl = titles[st.l - 1] ?? ["", ""];
  const cur = useSpeaking();
  const lineItem = (tx: Txt, i: number): [string, string, string] => [`t/${st.l}_${tx.n}_${i}.mp3`, tx.lines[i].t, `t:${st.l}_${tx.n}_${i}`];
  return (
    <section id="reader-top" className="card" style={{ display: "flex", flexDirection: "column", gap: 16, padding: "20px 16px", borderRadius: 24, background: "rgba(255,255,255,0.92)", boxShadow: "0 8px 26px rgba(214,90,160,0.12)", border: "1.5px solid rgba(248,190,220,0.55)", minWidth: 0 }}>
      <h2 style={{ margin: 0, fontSize: 21, lineHeight: "28px", fontWeight: 800, color: "#8f2160" }}><span aria-hidden style={{ color: "#f07ab3", marginRight: 6 }}>✿</span>{T.head}</h2>
      <div style={{ padding: "12px 14px", borderRadius: 18, background: "linear-gradient(135deg,#fff0f7,#f5ecff)", color: "#6b3a63", fontSize: 14, lineHeight: "21px" }}><Sparkle color="#c58bff" /> {T.note}</div>
      <div style={{ padding: "8px 12px", borderRadius: 14, background: "linear-gradient(135deg,#fff8d8,#ffe6f2)", color: "#8f2160", fontSize: 13, lineHeight: "19px", fontWeight: 600 }}>✎ {T.hint}</div>
      <div role="tablist" aria-label="lessons" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(44px, 1fr))", gap: 8 }}>
        {DATA.map((x) => {
          const on = x.l === st.l;
          return <button key={x.l} role="tab" aria-selected={on} title={`${titles[x.l - 1]?.[0] ?? ""}`} onClick={() => go(x.l)} style={{ cursor: "pointer", height: 44, borderRadius: 16, border: on ? "none" : "1.5px solid rgba(232,85,154,0.25)", background: on ? "linear-gradient(135deg,#ff8cc0,#c58bff)" : x.l <= 10 ? "#fff5fa" : "#f8f2ff", color: on ? "#fff" : "#8f2160", fontWeight: 800, fontSize: 16, fontFamily: "inherit", boxShadow: on ? "0 4px 12px rgba(232,85,154,0.3)" : "none" }}>{x.l}</button>;
        })}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <Pill on={st.py} label={T.py} onClick={() => save({ ...st, py: !st.py })} />
        <Pill on={st.tr} label={T.tr} onClick={() => save({ ...st, tr: !st.tr })} />
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, marginLeft: "auto", fontSize: 13, color: "#8f2160" }}>
          {T.size}
          <button aria-label="smaller" onClick={() => { const z = Math.max(18, size - 2); setSize(z); save(st, z); }} style={{ cursor: "pointer", width: 34, height: 34, borderRadius: 9999, border: "1.5px solid rgba(232,85,154,0.3)", background: "#fff", color: "#8f2160", fontWeight: 800 }}>A−</button>
          <button aria-label="larger" onClick={() => { const z = Math.min(34, size + 2); setSize(z); save(st, z); }} style={{ cursor: "pointer", width: 34, height: 34, borderRadius: 9999, border: "1.5px solid rgba(232,85,154,0.3)", background: "#fff", color: "#8f2160", fontWeight: 800 }}>A+</button>
        </span>
      </div>
      <div style={{ textAlign: "center", padding: "6px 0 0" }}>
        <div style={{ fontSize: 13, color: "#b0508a", fontWeight: 700, letterSpacing: 1 }}>♡ {T.lesson(st.l)} · {st.l <= 10 ? (vi ? "4上 · Quyển Thượng" : "4A") : vi ? "4下 · Quyển Hạ" : "4B"} ♡</div>
        <div lang="zh-Hans" style={{ fontFamily: ZH_FONT, fontSize: 26, lineHeight: "36px", fontWeight: 700, color: "#43284d", marginTop: 4 }}>{ttl[0]}</div>
        <div style={{ fontSize: 15, color: "rgba(74,42,82,0.7)" }}>{vi ? ttl[1] : ttl[1]}</div>
      </div>
      {les ? les.texts.map((tx) => {
        const dlg = tx.lines.some((ln) => ln.s);
        return (
          <article key={tx.n} style={{ borderRadius: 22, padding: "16px 14px", background: tx.n % 2 ? "linear-gradient(180deg,#fff7fb,#ffffff)" : "linear-gradient(180deg,#f9f4ff,#ffffff)", border: "1.5px dashed rgba(232,85,154,0.28)" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#fff", background: "linear-gradient(135deg,#ff8cc0,#ffa877)", borderRadius: 9999, padding: "3px 10px" }}>{T.text(tx.n)}</span>
              <span lang="zh-Hans" style={{ fontFamily: ZH_FONT, fontSize: 19, fontWeight: 700, color: "#43284d", flex: "1 1 auto" }}>{tx.zh}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 800, color: "#c0447f" }}>{vi ? "Nghe cả bài" : "Play all"}<SpeakBtn items={tx.lines.map((_, i) => lineItem(tx, i))} k={`all:${st.l}_${tx.n}`} size={36} onDone={() => petEvent("listen", { key: `${st.l}_${tx.n}` })} label={vi ? "Nghe cả bài" : "Play whole text"} /></span>
            </div>
            {st.tr ? <div style={{ fontSize: 14, color: "rgba(74,42,82,0.7)", marginTop: -4, marginBottom: 10 }}>{vi ? tx.vi : tx.en}</div> : null}
            <div style={{ display: "flex", flexDirection: "column", gap: dlg ? 14 : 12 }}>
              {tx.lines.map((ln, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", borderRadius: 14, padding: "4px 6px", margin: "0 -6px", background: cur === `t:${st.l}_${tx.n}_${i}` ? "rgba(255,200,225,0.45)" : "transparent", transition: "background .2s" }}>
                  {ln.s ? <span lang="zh-Hans" style={{ flex: "0 0 auto", marginTop: st.py ? Math.round(size * 0.55) : 4, fontFamily: ZH_FONT, fontSize: 14, fontWeight: 700, color: "#fff", background: ln.s === "阿玲" ? "#f07ab3" : ln.s === "小雪" ? "#a98bf0" : "#ffa877", borderRadius: 12, padding: "3px 8px", whiteSpace: "nowrap" }}>{ln.s}</span> : null}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p lang="zh-Hans" style={{ margin: 0, fontFamily: ZH_FONT, fontSize: size, lineHeight: st.py ? `${Math.round(size * 2.15)}px` : `${Math.round(size * 1.65)}px`, color: "#2f1b37", textIndent: ln.s ? 0 : "2em", wordBreak: "break-all" }}><Ruby text={ln.t} py={ln.p} show={st.py} size={size} marks={tx.kw} lineId={`${st.l}_${tx.n}_${i}`} openId={tip ? tip.id : ""} onKw={onKw} /></p>
                    {st.tr ? <p style={{ margin: "4px 0 0", fontSize: 15, lineHeight: "23px", color: "#7a4a72" }}>{vi ? ln.vi : ln.en}</p> : null}
                  </div>
                  <span style={{ marginTop: st.py ? Math.round(size * 0.5) : 2 }}><SpeakBtn items={[lineItem(tx, i)]} k={`t:${st.l}_${tx.n}_${i}`} size={30} label={vi ? "Nghe câu này" : "Play sentence"} /></span>
                </div>
              ))}
            </div>
          </article>
        );
      }) : <div>—</div>}
      {tip ? <KwPopup tip={tip} gloss={gloss.get(tip.w)} lang={lang} onClose={() => setTip(null)} /> : null}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <button disabled={st.l <= 1} onClick={() => go(st.l - 1)} style={{ cursor: st.l <= 1 ? "default" : "pointer", opacity: st.l <= 1 ? 0.45 : 1, border: "1.5px solid rgba(232,85,154,0.3)", background: "#fff", color: "#8f2160", fontWeight: 800, borderRadius: 9999, padding: "10px 16px", fontFamily: "inherit", fontSize: 14 }}>{T.prev}</button>
        <button disabled={st.l >= 20} onClick={() => go(st.l + 1)} style={{ cursor: st.l >= 20 ? "default" : "pointer", opacity: st.l >= 20 ? 0.45 : 1, border: "none", background: "linear-gradient(135deg,#ff7eb6,#e8559a)", color: "#fff", fontWeight: 800, borderRadius: 9999, padding: "10px 16px", fontFamily: "inherit", fontSize: 14, boxShadow: "0 4px 12px rgba(232,85,154,0.28)" }}>{T.next}</button>
      </div>
    </section>
  );
}
