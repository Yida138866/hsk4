// 课文 reader: original practice texts (written for this site) with toggleable pinyin and translation.
import { useState, useEffect, ZH_FONT, Sparkle } from "./kit";
import type { ReactNode } from "./kit";
import { SpeakBtn, useSpeaking } from "./audio";
import { petEvent } from "./pet";

type Line = { s: string; sp: string[]; t: string; p: string[]; vi: string; en: string };
type Txt = { n: number; zh: string; vi: string; en: string; lines: Line[] };
type Lesson = { l: number; texts: Txt[] };
declare const HSK_TEXTS: Lesson[];
const DATA: Lesson[] = typeof HSK_TEXTS !== "undefined" ? HSK_TEXTS : [];
const KEY = "hsk4-reader-v1";

function Ruby({ text, py, show, size }: { text: string; py: string[]; show: boolean; size: number }) {
  if (!show) return <span>{text}</span>;
  const out: ReactNode[] = [];
  Array.from(text).forEach((ch, i) => {
    const p = py[i] ?? "";
    out.push(p ? <ruby key={i}>{ch}<rt style={{ fontSize: Math.max(11, Math.round(size * 0.5)), color: "#c0447f", fontFamily: "ui-rounded, system-ui, sans-serif", fontWeight: 500, letterSpacing: 0 }}>{p}</rt></ruby> : <span key={i}>{ch}</span>);
  });
  return <>{out}</>;
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
  useEffect(() => { try { const r = window.localStorage.getItem(KEY); if (r) { const o = JSON.parse(r); setSt({ l: Math.min(20, Math.max(1, Number(o.l) || 1)), py: o.py !== false, tr: o.tr !== false }); if (o.size) setSize(Number(o.size)); } } catch (e) { /* storage unavailable */ } }, []);
  const save = (n: { l: number; py: boolean; tr: boolean }, sz = size) => { setSt(n); try { window.localStorage.setItem(KEY, JSON.stringify({ ...n, size: sz })); } catch (e) { /* storage unavailable */ } };
  const go = (l: number) => { save({ ...st, l }); const el = document.getElementById("reader-top"); if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const les = DATA.find((x) => x.l === st.l);
  const vi = lang === "vi";
  const T = {
    head: vi ? "课文 · Bài khoá" : "课文 · Texts",
    note: vi
      ? "Đây là các bài khoá luyện tập do trang này tự soạn, dùng từ mới và ngữ pháp của từng bài trong giáo trình HSK 4 (nhân vật: A Linh – cô gái Việt Nam du học ở Trung Quốc, và bạn cùng phòng Tiểu Tuyết). Bài khoá gốc trong sách thuộc bản quyền của nhà xuất bản nên không đăng lại ở đây – hãy đọc trong sách giáo khoa."
      : "These are original practice texts written for this site, using each lesson's HSK 4 vocabulary and grammar (characters: A Linh, a Vietnamese student in China, and her roommate Xiaoxue). The textbook's own texts are copyrighted by the publisher and are not reproduced here — read them in your book.",
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
                    <p lang="zh-Hans" style={{ margin: 0, fontFamily: ZH_FONT, fontSize: size, lineHeight: st.py ? `${Math.round(size * 2.15)}px` : `${Math.round(size * 1.65)}px`, color: "#2f1b37", textIndent: ln.s ? 0 : "2em", wordBreak: "break-all" }}><Ruby text={ln.t} py={ln.p} show={st.py} size={size} /></p>
                    {st.tr ? <p style={{ margin: "4px 0 0", fontSize: 15, lineHeight: "23px", color: "#7a4a72" }}>{vi ? ln.vi : ln.en}</p> : null}
                  </div>
                  <span style={{ marginTop: st.py ? Math.round(size * 0.5) : 2 }}><SpeakBtn items={[lineItem(tx, i)]} k={`t:${st.l}_${tx.n}_${i}`} size={30} label={vi ? "Nghe câu này" : "Play sentence"} /></span>
                </div>
              ))}
            </div>
          </article>
        );
      }) : <div>—</div>}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <button disabled={st.l <= 1} onClick={() => go(st.l - 1)} style={{ cursor: st.l <= 1 ? "default" : "pointer", opacity: st.l <= 1 ? 0.45 : 1, border: "1.5px solid rgba(232,85,154,0.3)", background: "#fff", color: "#8f2160", fontWeight: 800, borderRadius: 9999, padding: "10px 16px", fontFamily: "inherit", fontSize: 14 }}>{T.prev}</button>
        <button disabled={st.l >= 20} onClick={() => go(st.l + 1)} style={{ cursor: st.l >= 20 ? "default" : "pointer", opacity: st.l >= 20 ? 0.45 : 1, border: "none", background: "linear-gradient(135deg,#ff7eb6,#e8559a)", color: "#fff", fontWeight: 800, borderRadius: 9999, padding: "10px 16px", fontFamily: "inherit", fontSize: 14, boxShadow: "0 4px 12px rgba(232,85,154,0.28)" }}>{T.next}</button>
      </div>
    </section>
  );
}
