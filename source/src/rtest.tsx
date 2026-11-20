// 随机水平测验: random 30-question level test drawn from a ~2,100-item bank (lessons 1–20).
import { useState, useEffect, ZH_FONT, Sparkle } from "./kit";
import { SpeakBtn } from "./audio";
import { petEvent } from "./pet";

type Item = { id: string; l: number; ty: string; stem: string; opts: string[]; ex: string; au?: [string, string]; passage?: string; q?: string };
declare const HSK_BANK: Item[];
const BANK: Item[] = typeof HSK_BANK !== "undefined" ? HSK_BANK : [];
const HKEY = "hsk4-rtest-history-v1";
type Drawn = { id: string; perm: number[] };
type Hist = { t: number; score: number; n: number; byType: Record<string, [number, number]>; weak: number[] };

const QUOTA: [string, number][] = [["meaning", 6], ["hanzi", 5], ["pinyin", 5], ["fill", 5], ["grammar", 5], ["reading", 4]];
const group = (it: Item) => (it.ty === "order" ? "grammar" : it.ty);
const rnd = (n: number) => Math.floor(Math.random() * n);
function shuffle<T>(a: T[]): T[] { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = rnd(i + 1); const x = b[i]; b[i] = b[j]; b[j] = x; } return b; }
const byId: Record<string, Item> = {}; BANK.forEach((x) => { byId[x.id] = x; });

export function draw(): Drawn[] {
  const lessons = [...shuffle(Array.from({ length: 20 }, (_, i) => i + 1)), ...shuffle(Array.from({ length: 20 }, (_, i) => i + 1))];
  const slots: string[] = []; QUOTA.forEach(([ty, n]) => { for (let i = 0; i < n; i++) slots.push(ty); });
  const order = shuffle(slots);
  const used = new Set<string>(); const out: Drawn[] = [];
  let rq = 0;
  order.forEach((ty, k) => {
    const l = lessons[k];
    let pool = BANK.filter((x) => group(x) === ty && !used.has(x.id));
    if (ty === "reading") { const wantComp = rq < 2; const p2 = pool.filter((x) => (wantComp ? x.id.startsWith("r") : x.id.startsWith("s"))); if (p2.length) pool = p2; rq++; }
    const same = pool.filter((x) => x.l === l);
    const pick = (same.length ? same : pool)[rnd((same.length ? same : pool).length)];
    if (!pick) return;
    used.add(pick.id); out.push({ id: pick.id, perm: shuffle([0, 1, 2, 3]) });
  });
  return shuffle(out);
}

const TYL: Record<string, [string, string, string]> = {
  meaning: ["看汉字选意思", "Chọn nghĩa đúng", "Pick the meaning"],
  hanzi: ["看意思选词语", "Chọn từ đúng", "Pick the word"],
  pinyin: ["选出正确的拼音（声调）", "Chọn pinyin/thanh điệu đúng", "Pick the right pinyin/tones"],
  fill: ["选词填空", "Chọn từ điền vào chỗ trống", "Fill in the blank"],
  grammar: ["语法 · 句子", "Ngữ pháp / chọn câu đúng", "Grammar / correct sentence"],
  reading: ["阅读理解", "Đọc hiểu", "Reading"],
};
const card = { borderRadius: 22, padding: "16px 14px", background: "#fff", border: "1.5px solid rgba(248,190,220,0.7)", boxShadow: "0 6px 18px rgba(214,90,160,0.08)" } as const;

function QView({ it, d, idx, chosen, done, onPick, vi }: { it: Item; d: Drawn; idx: number; chosen?: number; done: boolean; onPick: (k: number) => void; vi: boolean }) {
  const ty = group(it); const lab = TYL[ty];
  const big = it.ty === "meaning" || it.ty === "pinyin";
  const zhStem = it.ty !== "hanzi";
  const qline = it.q === "meaning" ? (vi ? "这句话是什么意思？· Câu này nghĩa là gì?" : "这句话是什么意思？· What does this sentence mean?") : null;
  const [showP, setShowP] = useState(false);
  return (
    <div className="rq" style={{ ...card }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: "#fff", background: "linear-gradient(135deg,#ff8cc0,#c58bff)", borderRadius: 9999, padding: "3px 10px" }}>{idx}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#a0507f" }}>{lab[0]} · {vi ? lab[1] : lab[2]}</span>
        <span style={{ fontSize: 11, color: "#b98aac", marginLeft: "auto" }}>{vi ? `Bài ${it.l}` : `L${it.l}`}</span>
      </div>
      {it.passage ? (
        <div style={{ marginBottom: 8 }}>
          <button onClick={() => setShowP(!showP)} style={{ cursor: "pointer", border: "1.5px dashed rgba(232,85,154,0.4)", background: "#fff7fb", color: "#8f2160", borderRadius: 9999, padding: "5px 12px", fontFamily: "inherit", fontSize: 12, fontWeight: 700 }}>{showP ? "▴ " : "▸ "}{vi ? "Đọc đoạn văn (bài khoá luyện tập)" : "Read the passage (practice text)"}</button>
          {showP ? <div lang="zh-Hans" style={{ marginTop: 8, padding: "10px 12px", borderRadius: 14, background: "#fff7fb", fontFamily: ZH_FONT, fontSize: 17, lineHeight: "30px", color: "#43284d" }}>{it.passage}</div> : null}
        </div>
      ) : null}
      {qline ? <div style={{ fontSize: 13, color: "#a0507f", marginBottom: 4 }}>{qline}</div> : null}
      <div lang={zhStem ? "zh-Hans" : undefined} style={{ fontFamily: zhStem ? ZH_FONT : "inherit", fontSize: big ? 34 : zhStem ? 21 : 18, lineHeight: big ? "44px" : "32px", fontWeight: big ? 600 : 500, color: "#2f1b37", marginBottom: 12, textAlign: big ? "center" : "left" }}>{it.stem}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
        {d.perm.map((oi, k) => {
          const isA = oi === 0; const sel = chosen === k;
          let bg = sel ? "rgba(232,85,154,0.12)" : "#fffafd"; let bd = sel ? "#e8559a" : "rgba(232,85,154,0.22)"; let mark = "";
          if (done) { if (isA) { bg = "rgba(64,190,150,0.16)"; bd = "#1f9d74"; mark = " ✓"; } else if (sel) { bg = "rgba(232,70,110,0.12)"; bd = "#d1305a"; mark = " ✗"; } }
          const zhOpt = it.ty === "hanzi" || it.ty === "fill" || it.ty === "grammar" || it.ty === "order";
          return (
            <button key={k} onClick={() => { if (!done) onPick(k); }} style={{ cursor: done ? "default" : "pointer", textAlign: "left", padding: "10px 12px", borderRadius: 16, border: `1.5px solid ${bd}`, background: bg, color: "#43284d", fontFamily: zhOpt ? ZH_FONT : "inherit", fontSize: zhOpt ? 18 : 15, lineHeight: "24px", fontWeight: sel ? 700 : 500 }}>
              <span style={{ color: "#d07aa8", fontWeight: 800, marginRight: 6, fontFamily: "ui-rounded, system-ui, sans-serif", fontSize: 13 }}>{"ABCD"[k]}</span>{it.opts[oi]}{mark}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function RandomTest({ lang }: { lang: "vi" | "en" }) {
  const vi = lang === "vi";
  const [set, setSet] = useState<Drawn[]>([]);
  const [ans, setAns] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);
  const [hist, setHist] = useState<Hist[]>([]);
  useEffect(() => { try { const r = window.localStorage.getItem(HKEY); if (r) setHist(JSON.parse(r)); } catch (e) { /* storage unavailable */ } }, []);
  const start = () => { setSet(draw()); setAns({}); setDone(false); setTimeout(() => { const e = document.getElementById("rtest-top"); if (e && e.scrollIntoView) e.scrollIntoView({ behavior: "smooth", block: "start" }); }, 30); };
  const items = set.map((d) => byId[d.id]).filter(Boolean);
  const right = (d: Drawn) => ans[d.id] !== undefined && d.perm[ans[d.id]] === 0;
  const score = set.filter(right).length;
  const answered = Object.keys(ans).length;
  const byType: Record<string, [number, number]> = {}; const byLesson: Record<number, [number, number]> = {};
  set.forEach((d) => { const it = byId[d.id]; if (!it) return; const g = group(it); const ok = right(d) ? 1 : 0; byType[g] = [(byType[g]?.[0] ?? 0) + ok, (byType[g]?.[1] ?? 0) + 1]; byLesson[it.l] = [(byLesson[it.l]?.[0] ?? 0) + ok, (byLesson[it.l]?.[1] ?? 0) + 1]; });
  const weak = Object.keys(byLesson).map(Number).filter((l) => byLesson[l][0] < byLesson[l][1]).sort((a, b) => (byLesson[a][0] / byLesson[a][1]) - (byLesson[b][0] / byLesson[b][1]) || a - b);
  const submit = () => {
    setDone(true);
    petEvent("rtest", { score, n: set.length, level });
    const h: Hist = { t: Date.now(), score, n: set.length, byType, weak };
    const nh = [h, ...hist].slice(0, 30); setHist(nh);
    try { window.localStorage.setItem(HKEY, JSON.stringify(nh)); } catch (e) { /* storage unavailable */ }
    setTimeout(() => { const e = document.getElementById("rtest-result"); if (e && e.scrollIntoView) e.scrollIntoView({ behavior: "smooth", block: "start" }); }, 30);
  };
  const pct = set.length ? Math.round((score / set.length) * 100) : 0;
  const level = pct >= 85 ? 3 : pct >= 70 ? 2 : pct >= 55 ? 1 : 0;
  const LV = vi
    ? [["Chưa sẵn sàng", "Kiến thức HSK 4 còn yếu. Hãy học lại các bài yếu bên dưới (từ mới + ngữ pháp), rồi làm lại bài kiểm tra."], ["Ở ngưỡng", "Bạn đã nắm được một phần, nhưng chưa chắc đậu HSK 4. Ôn kỹ các bài yếu và luyện thêm đề."], ["Gần đạt", "Khá tốt! Bạn có khả năng đậu HSK 4 (≈180–240/300). Ôn lại các câu sai để chắc chắn hơn."], ["Sẵn sàng", "Rất tốt! Kiến thức giáo trình HSK 4 đã vững (≈240+/300). Hãy luyện thêm đề thi thật có nghe."]]
    : [["Not ready yet", "HSK 4 knowledge is still weak. Re-study the weak lessons below (words + grammar), then try again."], ["Borderline", "You know part of it, but passing HSK 4 isn't safe yet. Review the weak lessons and practise more."], ["Nearly there", "Good! You would likely pass HSK 4 (≈180–240/300). Review your mistakes to be safe."], ["Ready", "Excellent! Your HSK 4 course knowledge is solid (≈240+/300). Move on to full mock exams with listening."]];
  const counts: Record<string, number> = {}; BANK.forEach((x) => { const g = group(x); counts[g] = (counts[g] ?? 0) + 1; });
  const fmtT = (t: number) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
  const pill = (on: boolean) => ({ cursor: "pointer", border: on ? "none" : "1.5px solid rgba(232,85,154,0.3)", borderRadius: 9999, padding: "11px 20px", fontFamily: "inherit", fontSize: 15, fontWeight: 800, background: on ? "linear-gradient(135deg,#ff7eb6,#c58bff)" : "#fff", color: on ? "#fff" : "#8f2160", boxShadow: on ? "0 5px 14px rgba(232,85,154,0.3)" : "none" } as const);
  return (
    <section id="rtest-top" className="card" style={{ display: "flex", flexDirection: "column", gap: 14, padding: "20px 16px", borderRadius: 24, background: "rgba(255,255,255,0.92)", boxShadow: "0 8px 26px rgba(214,90,160,0.12)", border: "1.5px solid rgba(248,190,220,0.55)", minWidth: 0 }}>
      <h2 style={{ margin: 0, fontSize: 21, lineHeight: "28px", fontWeight: 800, color: "#8f2160" }}><span aria-hidden style={{ color: "#f07ab3", marginRight: 6 }}>✿</span>{vi ? "随机水平测验 · Kiểm tra ngẫu nhiên" : "随机水平测验 · Random Level Test"}</h2>
      <div style={{ padding: "12px 14px", borderRadius: 18, background: "linear-gradient(135deg,#fff0f7,#f5ecff)", color: "#6b3a63", fontSize: 14, lineHeight: "21px" }}>
        <Sparkle color="#c58bff" /> {vi
          ? `Ngân hàng ${BANK.length} câu hỏi phủ bài 1–20: nghĩa từ (${counts.meaning}), chọn từ (${counts.hanzi}), pinyin/thanh điệu (${counts.pinyin}), điền từ (${counts.fill}), ngữ pháp & chọn câu đúng (${counts.grammar}), đọc hiểu (${counts.reading}). Mỗi lần bấm sẽ rút ngẫu nhiên 30 câu, chia đều các bài và các dạng. Câu đọc hiểu/điền từ lấy từ bài khoá luyện tập của trang này.`
          : `A bank of ${BANK.length} questions covering lessons 1–20: word meaning (${counts.meaning}), pick the word (${counts.hanzi}), pinyin/tones (${counts.pinyin}), fill in the blank (${counts.fill}), grammar & correct sentence (${counts.grammar}), reading (${counts.reading}). Each click draws a fresh random set of 30, balanced across lessons and types. Reading/fill-in items use this site's own practice texts.`}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <button onClick={start} style={pill(true)}>🎲 {vi ? "随机生成 30 题 · Tạo 30 câu ngẫu nhiên" : "随机生成 30 题 · Generate 30 random questions"}</button>
        {set.length ? <span style={{ fontSize: 13, color: "#a0507f" }}>{vi ? "Đã trả lời" : "Answered"} {answered} / {set.length}</span> : null}
      </div>
      {items.length ? items.map((it, i) => <QView key={set[i].id + i} it={it} d={set[i]} idx={i + 1} chosen={ans[set[i].id]} done={done} vi={vi} onPick={(k) => { const id = set[i].id; setAns((a: Record<string, number>) => ({ ...a, [id]: k })); }} />) : null}
      {set.length && !done ? (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={submit} style={pill(true)}>{vi ? "交卷看成绩 · Nộp bài xem điểm" : "交卷 · Submit"}</button>
          {answered < set.length ? <span style={{ fontSize: 13, color: "#b0508a" }}>{vi ? `Còn ${set.length - answered} câu chưa trả lời (tính là sai).` : `${set.length - answered} unanswered (counted as wrong).`}</span> : null}
        </div>
      ) : null}
      {done ? (
        <div id="rtest-result" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ ...card, textAlign: "center", background: "linear-gradient(135deg,#ffe1ee,#f3e6ff 60%,#ffe9dc)" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#a0507f", letterSpacing: 1 }}>♡ {vi ? "Kết quả" : "Result"} ♡</div>
            <div style={{ fontSize: 44, lineHeight: "52px", fontWeight: 900, color: "#8f2160" }}>{score} / {set.length}</div>
            <div style={{ fontSize: 15, color: "#6b3a63" }}>{pct}% · <b>{LV[level][0]}</b></div>
            <div style={{ fontSize: 14, color: "#6b3a63", marginTop: 6, lineHeight: "21px" }}>{LV[level][1]}</div>
            <div style={{ fontSize: 12, color: "#9a6a90", marginTop: 6 }}>{vi ? "Đây là ước tính theo mức nắm giáo trình (không có phần nghe), không phải điểm chính thức." : "A rough estimate of course mastery (no listening section), not an official score."}</div>
          </div>
          <div style={{ ...card }}>
            <div style={{ fontWeight: 800, color: "#8f2160", marginBottom: 8 }}>{vi ? "Theo dạng câu hỏi" : "By question type"}</div>
            {QUOTA.map(([ty]) => { const v = byType[ty] ?? [0, 0]; const p = v[1] ? v[0] / v[1] : 0; return (
              <div key={ty} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0", fontSize: 14 }}>
                <span style={{ flex: "0 0 46%", color: "#5a3a5f" }}>{TYL[ty][0]} · {vi ? TYL[ty][1] : TYL[ty][2]}</span>
                <span style={{ flex: 1, height: 10, borderRadius: 9999, background: "#fde8f3", overflow: "hidden" }}><span style={{ display: "block", height: "100%", width: `${p * 100}%`, background: p >= 0.7 ? "linear-gradient(90deg,#7ad8b5,#40be96)" : "linear-gradient(90deg,#ff9cc6,#e8559a)" }} /></span>
                <span style={{ width: 42, textAlign: "right", fontWeight: 700, color: "#8f2160" }}>{v[0]}/{v[1]}</span>
              </div>); })}
          </div>
          <div style={{ ...card }}>
            <div style={{ fontWeight: 800, color: "#8f2160", marginBottom: 8 }}>{vi ? "Theo bài" : "By lesson"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))", gap: 6 }}>
              {Array.from({ length: 20 }, (_, i) => i + 1).map((l) => { const v = byLesson[l]; const bad = v && v[0] < v[1]; return (
                <div key={l} style={{ textAlign: "center", borderRadius: 14, padding: "6px 0", fontSize: 12, fontWeight: 700, background: !v ? "#f7f2f6" : bad ? "rgba(232,70,110,0.12)" : "rgba(64,190,150,0.15)", color: !v ? "#b9a6b5" : bad ? "#b0284f" : "#167a59" }}>{vi ? "Bài" : "L"} {l}<br />{v ? `${v[0]}/${v[1]}` : "—"}</div>); })}
            </div>
            <div style={{ marginTop: 10, fontSize: 14, color: "#6b3a63", lineHeight: "21px" }}>{weak.length ? (vi ? `Bài cần ôn: ${weak.map((l) => "Bài " + l).join(", ")}. Vào «课程 · Bài học» để ôn từ mới và ngữ pháp, hoặc làm «每课小测» của bài đó.` : `Lessons to review: ${weak.map((l) => "L" + l).join(", ")}. Open «课程» to review the words and grammar, or take that lesson's «每课小测».`) : (vi ? "Không có bài nào sai — tuyệt vời!" : "No weak lessons this time — great!")}</div>
          </div>
          <div style={{ ...card }}>
            <div style={{ fontWeight: 800, color: "#8f2160", marginBottom: 8 }}>{vi ? "Xem lại câu sai" : "Review your mistakes"} ({set.length - score})</div>
            {set.filter((d) => !right(d)).map((d) => { const it = byId[d.id]; const ch = ans[d.id]; const n = set.indexOf(d) + 1; return (
              <div key={d.id} className="rv" style={{ padding: "10px 0", borderTop: "1px dashed rgba(232,85,154,0.25)", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ minWidth: 0, flex: 1, fontSize: 14, lineHeight: "22px", color: "#43284d" }}>
                  <div style={{ fontSize: 12, color: "#a0507f", fontWeight: 700 }}>{n}. {TYL[group(it)][0]} · {vi ? `Bài ${it.l}` : `L${it.l}`}</div>
                  <div lang="zh-Hans" style={{ fontFamily: it.ty === "hanzi" ? "inherit" : ZH_FONT, fontSize: 17 }}>{it.stem}</div>
                  <div style={{ color: "#b0284f" }}>✗ {ch === undefined ? (vi ? "(chưa trả lời)" : "(no answer)") : it.opts[d.perm[ch]]}</div>
                  <div style={{ color: "#167a59", fontWeight: 700 }}>✓ {it.opts[0]}</div>
                  <div style={{ color: "#6b4a66", marginTop: 2 }}>💡 {it.ex}</div>
                </div>
                {it.au ? <SpeakBtn items={[[it.au[0], it.au[1], "rv:" + d.id]]} k={"rv:" + d.id} size={34} label={vi ? "Nghe phát âm" : "Play audio"} /> : null}
              </div>); })}
          </div>
          <button onClick={start} style={{ ...pill(true), alignSelf: "flex-start" }}>🎲 {vi ? "Làm bộ 30 câu mới" : "New set of 30"}</button>
        </div>
      ) : null}
      <div style={{ ...card }}>
        <div style={{ fontWeight: 800, color: "#8f2160", marginBottom: 6 }}>{vi ? "Lịch sử làm bài (lưu trên thiết bị này)" : "Past attempts (saved on this device)"}</div>
        {hist.length ? (
          <div className="hist" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {hist.slice(0, 10).map((h, i) => (
              <div key={h.t + "-" + i} style={{ display: "flex", gap: 10, fontSize: 13, color: "#5a3a5f", alignItems: "center" }}>
                <span style={{ width: 128, color: "#9a6a90" }}>{fmtT(h.t)}</span>
                <span style={{ fontWeight: 800, color: "#8f2160", width: 52 }}>{h.score}/{h.n}</span>
                <span style={{ flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.weak && h.weak.length ? (vi ? "Ôn: " : "Review: ") + h.weak.slice(0, 6).map((l) => (vi ? "B" : "L") + l).join(" ") : "✓"}</span>
              </div>
            ))}
            <button onClick={() => { setHist([]); try { window.localStorage.removeItem(HKEY); } catch (e) { /* ignore */ } }} style={{ alignSelf: "flex-start", marginTop: 6, cursor: "pointer", border: "none", background: "transparent", color: "#c0447f", textDecoration: "underline", fontFamily: "inherit", fontSize: 12 }}>{vi ? "Xoá lịch sử" : "Clear history"}</button>
          </div>
        ) : <div style={{ fontSize: 13, color: "#9a6a90" }}>{vi ? "Chưa có lần làm bài nào." : "No attempts yet."}</div>}
      </div>
    </section>
  );
}
