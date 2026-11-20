// 班级成绩卡 (class progress card) + teacher view. No backend: a PNG made with <canvas> and a short signed text code.
import { useState, useRef, ZH_FONT } from "./kit";
import type { ReactNode } from "./kit";

export type CardData = { n: string; c: string; k: string; kz: string; pn: string; st: number; stz: string; l: number; b: number; bn: number; s: number; bd: string; g: number; d: string };
type Row = CardData & { code: string };
const SALT = "hsk4|阿玲&小雪|card";
function fnv(str: string): string { let h = 0x811c9dc5; for (const ch of str) { h ^= ch.codePointAt(0) || 0; h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(36); }
const b64e = (s: string) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const b64d = (s: string) => decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4))));
const FIELDS: (keyof CardData)[] = ["n", "c", "k", "kz", "pn", "st", "stz", "l", "b", "bn", "s", "bd", "g", "d"];
export function makeCode(d: CardData): string { const j = JSON.stringify(FIELDS.map((f) => d[f])); return `HSK4C1.${b64e(j)}.${fnv(SALT + j)}`; }
export function parseCodes(text: string): { ok: boolean; row?: Row; raw: string }[] {
  const out: { ok: boolean; row?: Row; raw: string }[] = []; const re = /HSK4C1\.([A-Za-z0-9_-]+)\.([0-9a-z]+)/g; let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    try { const j = b64d(m[1]); const arr = JSON.parse(j); if (!Array.isArray(arr) || arr.length !== FIELDS.length || fnv(SALT + j) !== m[2]) { out.push({ ok: false, raw: m[0] }); continue; }
      const row = { code: m[0] } as Row; FIELDS.forEach((f, i) => { (row as Record<string, unknown>)[f] = arr[i]; }); out.push({ ok: true, row, raw: m[0] }); } catch (e) { out.push({ ok: false, raw: m[0] }); }
  }
  return out;
}
export function cardText(d: CardData, vi: boolean): string {
  const L = vi
    ? [`🎓 HSK 4 · 班级成绩卡 · Thẻ thành tích`, `👩 ${d.n}${d.c ? ` · Lớp ${d.c}` : ""}`, `🐾 ${d.pn} (${d.kz}) · ${d.stz}`, `📖 Bài đã qua: ${d.l}/20`, `🎯 Kiểm tra ngẫu nhiên tốt nhất: ${d.bn ? `${d.b}/${d.bn}` : "—"}`, `🔥 Chuỗi ${d.s} ngày · 🏅 ${Array.from(d.bd).length ? d.bd : "0"}${d.g ? ` · 🎓×${d.g}` : ""}`, `📅 ${d.d}`]
    : [`🎓 HSK 4 · 班级成绩卡 · Class card`, `👩 ${d.n}${d.c ? ` · Class ${d.c}` : ""}`, `🐾 ${d.pn} (${d.kz}) · ${d.stz}`, `📖 Lessons passed: ${d.l}/20`, `🎯 Best random test: ${d.bn ? `${d.b}/${d.bn}` : "—"}`, `🔥 ${d.s}-day streak · 🏅 ${Array.from(d.bd).length ? d.bd : "0"}${d.g ? ` · 🎓×${d.g}` : ""}`, `📅 ${d.d}`];
  return L.join("\n") + "\n" + makeCode(d);
}

const F = `"Nunito", ${ZH_FONT}, "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji"`;
function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function fit(c: CanvasRenderingContext2D, t: string, max: number, size: number, weight = 800) { let s = size; do { c.font = `${weight} ${s}px ${F}`; s -= 2; } while (c.measureText(t).width > max && s > 18); }
export async function drawCard(d: CardData, svg: SVGSVGElement | null, vi: boolean): Promise<HTMLCanvasElement> {
  const W = 1080, H = 1350; const cv = document.createElement("canvas"); cv.width = W; cv.height = H; const c = cv.getContext("2d")!;
  try { await (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready; } catch (e) { /* ignore */ }
  const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#ffd9ea"); g.addColorStop(0.55, "#fbe7ff"); g.addColorStop(1, "#e3d6ff"); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.fillStyle = "rgba(255,255,255,0.45)"; [[90, 120, 60], [990, 210, 80], [140, 1240, 90], [1000, 1180, 55]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); });
  c.save(); c.shadowColor = "rgba(143,33,96,0.18)"; c.shadowBlur = 40; c.shadowOffsetY = 12; rr(c, 60, 70, 960, 1210, 56); c.fillStyle = "#ffffff"; c.fill(); c.restore();
  c.textAlign = "center"; c.fillStyle = "#c0447f"; c.font = `800 30px ${F}`; c.fillText("✿ HSK 4 · 班级成绩卡 ✿", W / 2, 150);
  c.fillStyle = "#a0507f"; c.font = `600 26px ${F}`; c.fillText(vi ? "Thẻ thành tích lớp học" : "Class progress card", W / 2, 192);
  c.fillStyle = "#8f2160"; fit(c, d.n || "—", 860, 76); c.fillText(d.n || "—", W / 2, 290);
  if (d.c) { c.font = `800 30px ${F}`; const t = (vi ? "Lớp · 班级 " : "Class · 班级 ") + d.c; const w = c.measureText(t).width + 56; const gg = c.createLinearGradient(W / 2 - w / 2, 0, W / 2 + w / 2, 0); gg.addColorStop(0, "#ff8cc0"); gg.addColorStop(1, "#c58bff"); c.fillStyle = gg; rr(c, W / 2 - w / 2, 318, w, 54, 27); c.fill(); c.fillStyle = "#fff"; c.fillText(t, W / 2, 356); }
  // pet
  const px = 100, py = 410, pw = 420, ph = 462;
  c.save(); rr(c, px, py, pw, ph, 40); c.clip(); c.fillStyle = "#fff3f9"; c.fillRect(px, py, pw, ph);
  if (svg) { try { const cl = svg.cloneNode(true) as SVGSVGElement; cl.setAttribute("width", String(pw)); cl.setAttribute("height", String(ph)); cl.setAttribute("xmlns", "http://www.w3.org/2000/svg"); cl.querySelectorAll("[class]").forEach((e) => e.removeAttribute("class"));
      const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(cl));
      const img = new Image(); await new Promise<void>((res) => { img.onload = () => res(); img.onerror = () => res(); img.src = url; }); if (img.width) c.drawImage(img, px, py, pw, ph); } catch (e) { /* ignore */ } }
  c.restore();
  c.fillStyle = "#8f2160"; c.textAlign = "center"; fit(c, d.pn, pw, 40); c.fillText(d.pn, px + pw / 2, py + ph + 56);
  c.fillStyle = "#a0507f"; c.font = `700 28px ${F}`; c.fillText(`${d.kz} · ${d.stz}`, px + pw / 2, py + ph + 98);
  // stats
  const rows: [string, string, string][] = [
    ["📖", vi ? "Bài đã qua" : "Lessons passed", `${d.l} / 20`],
    ["🎯", vi ? "Test ngẫu nhiên tốt nhất" : "Best random test", d.bn ? `${d.b} / ${d.bn}` : "—"],
    ["🔥", vi ? "Chuỗi điểm danh" : "Check-in streak", vi ? `${d.s} ngày` : `${d.s} days`],
    ["🏅", vi ? "Huy hiệu" : "Badges", String(Array.from(d.bd).length)],
    ["🎓", vi ? "Thú cưng tốt nghiệp" : "Pets graduated", String(d.g)],
  ];
  c.textAlign = "left"; let y = 430;
  rows.forEach(([ic, lab, val]) => { rr(c, 560, y, 420, 118, 28); c.fillStyle = "#fff5fa"; c.fill(); c.strokeStyle = "#ffd1e6"; c.lineWidth = 3; c.stroke();
    c.font = `400 44px ${F}`; c.fillText(ic, 584, y + 76); c.fillStyle = "#a0507f"; fit(c, lab, 320, 26, 700); c.fillText(lab, 648, y + 46); c.fillStyle = "#8f2160"; c.font = `800 40px ${F}`; c.fillText(val, 648, y + 94); y += 134; });
  // badges
  const icons = Array.from(d.bd);
  if (icons.length) { c.textAlign = "center"; c.font = `400 46px ${F}`; const per = Math.min(icons.length, 14); const sp = 64; const x0 = W / 2 - ((per - 1) * sp) / 2; icons.slice(0, 14).forEach((ic, i) => c.fillText(ic, x0 + i * sp, 1110)); }
  c.textAlign = "center"; c.fillStyle = "#a0507f"; c.font = `700 28px ${F}`; c.fillText(`📅 ${d.d}`, W / 2, 1190);
  c.fillStyle = "#c79ab8"; c.font = `600 22px ${F}`; c.fillText("yida138866.github.io/hsk4", W / 2, 1240);
  return cv;
}

const box = { borderRadius: 22, padding: "14px", background: "#fff", border: "1.5px solid rgba(248,190,220,0.7)", boxShadow: "0 6px 18px rgba(214,90,160,0.08)" } as const;
const btn = (on = false) => ({ cursor: "pointer", border: on ? "none" : "1.5px solid rgba(232,85,154,0.3)", borderRadius: 9999, padding: "8px 14px", fontFamily: "inherit", fontSize: 14, fontWeight: 800, background: on ? "linear-gradient(135deg,#ff7eb6,#c58bff)" : "#fff", color: on ? "#fff" : "#8f2160" } as const);
const inp = { padding: "9px 12px", borderRadius: 14, border: "1.5px solid rgba(232,85,154,0.3)", fontSize: 16, fontFamily: "inherit", minWidth: 0 } as const;

export function ClassCard({ data, pet, onChange, vi }: { data: CardData; pet: ReactNode; onChange: (n: string, c: string) => void; vi: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [img, setImg] = useState(""); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState("");
  const blobRef = useRef<Blob | null>(null);
  const text = cardText(data, vi);
  const gen = async () => { setBusy(true); const cv = await drawCard(data, ref.current ? ref.current.querySelector("svg") : null, vi); setImg(cv.toDataURL("image/png")); await new Promise<void>((r) => cv.toBlob((b) => { blobRef.current = b; r(); }, "image/png")); setBusy(false); };
  const fname = `hsk4-card-${(data.n || "me").replace(/[^\p{L}\p{N}]+/gu, "_")}.png`;
  const download = () => { if (!img) return; const a = document.createElement("a"); a.href = img; a.download = fname; a.click(); };
  const share = async () => { const b = blobRef.current; if (!b) return; const f = new File([b], fname, { type: "image/png" }); const nav = navigator as Navigator & { canShare?: (d: unknown) => boolean };
    try { if (nav.canShare && nav.canShare({ files: [f] })) await nav.share({ files: [f], title: "HSK 4", text: text.split("\n").slice(0, 2).join(" ") }); else { download(); setMsg(vi ? "Máy này chưa hỗ trợ chia sẻ ảnh, đã tải ảnh xuống." : "Sharing images isn't supported here, downloaded instead."); } } catch (e) { /* cancelled */ } };
  const copy = () => { try { navigator.clipboard && navigator.clipboard.writeText(text); setMsg(vi ? "Đã sao chép! Dán vào Zalo / Messenger." : "Copied! Paste it into Zalo / Messenger."); } catch (e) { /* ignore */ } };
  return (
    <div className="classcard" style={{ ...box }}>
      <div style={{ fontWeight: 800, color: "#8f2160", marginBottom: 6 }}>🎴 {vi ? "班级成绩卡 · Thẻ thành tích lớp" : "班级成绩卡 · Class card"}</div>
      <div style={{ fontSize: 12.5, color: "#7a4f78", marginBottom: 8, lineHeight: "18px" }}>{vi ? "Không bắt buộc. Tạo một tấm thẻ dễ thương để gửi cho thầy/cô hoặc bạn bè. Dữ liệu chỉ nằm trên máy cậu." : "Optional. Make a cute card to send to your teacher or friends. Nothing leaves your device unless you share it."}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <input className="card-name" value={data.n} maxLength={24} autoComplete="off" onChange={(e) => onChange(e.target.value, data.c)} placeholder={vi ? "Tên của cậu" : "Your name"} style={{ ...inp, flex: "2 1 160px" }} />
        <input className="card-class" value={data.c} maxLength={16} autoComplete="off" onChange={(e) => onChange(data.n, e.target.value)} placeholder={vi ? "Mã lớp (không bắt buộc)" : "Class code (optional)"} style={{ ...inp, flex: "1 1 120px" }} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
        <button className="card-gen" disabled={!data.n.trim() || busy} onClick={gen} style={{ ...btn(true), opacity: data.n.trim() ? 1 : 0.5 }}>🖼️ {vi ? "Tạo ảnh thẻ" : "Make card image"}</button>
        {img ? <button className="card-dl" onClick={download} style={btn()}>⬇️ {vi ? "Tải PNG" : "Download PNG"}</button> : null}
        {img ? <button className="card-share" onClick={share} style={btn()}>📤 {vi ? "Chia sẻ" : "Share"}</button> : null}
        <button className="card-copy" disabled={!data.n.trim()} onClick={copy} style={{ ...btn(), opacity: data.n.trim() ? 1 : 0.5 }}>📋 {vi ? "Sao chép bản chữ" : "Copy text version"}</button>
      </div>
      {msg ? <div style={{ fontSize: 12, color: "#8f2160", marginTop: 6 }}>{msg}</div> : null}
      {img ? <img className="card-img" src={img} alt="HSK 4 class card" style={{ display: "block", width: "100%", maxWidth: 360, borderRadius: 18, marginTop: 10, boxShadow: "0 6px 18px rgba(143,33,96,0.15)" }} /> : null}
      {data.n.trim() ? <textarea className="card-text" readOnly value={text} rows={8} style={{ width: "100%", marginTop: 10, borderRadius: 14, border: "1.5px solid rgba(232,85,154,0.25)", padding: 8, fontSize: 12.5, fontFamily: "inherit", color: "#5a3a5f", background: "#fff9fc" }} /> : null}
      <div style={{ marginTop: 8, fontSize: 12 }}><a href="?teacher=1" style={{ color: "#a0507f" }}>👩‍🏫 {vi ? "Trang cho giáo viên (so sánh nhiều thẻ)" : "Teacher view (compare several cards)"}</a></div>
      <div ref={ref} aria-hidden style={{ position: "absolute", left: -10000, top: 0, width: 420 }}>{pet}</div>
    </div>
  );
}

export function TeacherView({ vi }: { vi: boolean }) {
  const [txt, setTxt] = useState("");
  const res = parseCodes(txt);
  const best: Record<string, Row> = {};
  res.forEach((r) => { if (!r.ok || !r.row) return; const k = (r.row.n + "|" + r.row.c).toLowerCase(); if (!best[k] || r.row.d >= best[k].d) best[k] = r.row; });
  const rows = Object.values(best).sort((a, b) => a.c.localeCompare(b.c) || b.l - a.l || a.n.localeCompare(b.n));
  const bad = res.filter((r) => !r.ok);
  void vi; const H = ["姓名", "班级", "宠物", "成长阶段", "已过课数", "随机测试最高分", "连续打卡", "徽章", "已毕业宠物", "日期"];
  const csv = () => { const lines = [H.join(","), ...rows.map((r) => [r.n, r.c, `${r.pn} (${r.kz})`, r.stz, r.l, r.bn ? `${r.b}/${r.bn}` : "", r.s, Array.from(r.bd).length, r.g, r.d].map((x) => `"${String(x).replace(/"/g, '""')}"`).join(","))]; const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv" })); a.download = "HSK4班级成绩.csv"; a.click(); };
  const td = { padding: "6px 8px", borderBottom: "1px solid #fde8f3", whiteSpace: "nowrap" } as const;
  return (
    <section id="teacher-top" className="teacher" lang="zh-Hans" style={{ ...box, fontFamily: ZH_FONT, display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#8f2160" }}>👩‍🏫 教师视图 · 班级成绩汇总</h2>
      <div style={{ fontSize: 13, color: "#6b3a63", lineHeight: "20px" }}>请把学生发来的消息或成绩卡代码粘贴到下面（每个代码以 HSK4C1. 开头）。可以一次粘贴多个，整段 Zalo / Messenger 消息也可以。系统会自动识别、去重（同一姓名+班级只保留最新一张），并按班级排序。被修改过的代码会标记 ⚠ 。</div>
      <textarea className="teacher-in" value={txt} onChange={(e) => setTxt(e.target.value)} rows={5} placeholder="在这里粘贴学生的成绩卡代码 HSK4C1.…" style={{ width: "100%", borderRadius: 14, border: "1.5px solid rgba(232,85,154,0.3)", padding: 8, fontSize: 12.5, fontFamily: "ui-monospace, monospace" }} />
      <div style={{ fontSize: 13, color: "#8f2160" }}>{`有效学生：${rows.length} 人`}{bad.length ? ` · ⚠ 无效或被修改的代码：${bad.length} 个` : ""}{rows.length ? <button onClick={csv} style={{ ...btn(), marginLeft: 8, padding: "4px 10px", fontSize: 12 }}>下载 CSV 表格</button> : null}</div>
      {rows.length ? <div style={{ overflowX: "auto" }}><table className="teacher-table" style={{ borderCollapse: "collapse", fontSize: 13, color: "#5a3a5f", minWidth: "100%" }}>
        <thead><tr>{H.map((h) => <th key={h} style={{ ...td, textAlign: "left", color: "#8f2160", background: "#fff3f9" }}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}><td style={{ ...td, fontWeight: 800 }}>{r.n}</td><td style={td}>{r.c || "（无）"}</td><td style={td}><span lang="zh-Hans" style={{ fontFamily: ZH_FONT }}>{r.pn} · {r.kz}</span></td><td style={td}><span lang="zh-Hans" style={{ fontFamily: ZH_FONT }}>{r.stz}</span></td><td style={td}>{r.l} / 20 课</td><td style={td}>{r.bn ? `${r.b}/${r.bn}` : "—"}</td><td style={td}>🔥{r.s} 天</td><td style={td}>{Array.from(r.bd).length}</td><td style={td}>{r.g}</td><td style={td}>{r.d}</td></tr>)}</tbody>
      </table></div> : null}
      {bad.length ? <div className="teacher-bad" style={{ fontSize: 12, color: "#b0306a" }}>{bad.map((b) => <div key={b.raw}>⚠ 无效或被修改：{b.raw.slice(0, 40)}…</div>)}</div> : null}
      <a href="?" style={{ fontSize: 12, color: "#a0507f" }}>← 返回宠物页面（关闭教师视图）</a>
    </section>
  );
}
