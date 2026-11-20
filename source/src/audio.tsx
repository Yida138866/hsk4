// Background lofi player (CC0 tracks) + Chinese speech playback with music ducking.
import { useState, useEffect } from "./kit";

type Track = { file: string; title: string; artist: string; license: string; collection: string; source: string; dur: number };
declare const HSK_TRACKS: Track[];
const TRACKS: Track[] = typeof HSK_TRACKS !== "undefined" ? HSK_TRACKS : [];
const BASE = typeof location !== "undefined" && /\/en\/?/.test(location.pathname) ? "../" : "";
const KEY = "hsk4-music-v1";

type MState = { on: boolean; loop: boolean; shuffle: boolean; idx: number; vol: number; playing: boolean };
const load = (): MState => {
  const d: MState = { on: false, loop: true, shuffle: false, idx: 0, vol: 0.5, playing: false };
  try { const r = window.localStorage.getItem(KEY); if (r) { const o = JSON.parse(r); return { ...d, loop: o.loop !== false, shuffle: !!o.shuffle, idx: Math.min(TRACKS.length - 1, Math.max(0, Number(o.idx) || 0)), vol: typeof o.vol === "number" ? Math.min(1, Math.max(0, o.vol)) : 0.5, on: false }; } } catch (e) { /* storage unavailable */ }
  return d;
};
let ms: MState = load();
const subs = new Set<() => void>();
const emit = () => { try { window.localStorage.setItem(KEY, JSON.stringify({ on: ms.on, loop: ms.loop, shuffle: ms.shuffle, idx: ms.idx, vol: ms.vol })); } catch (e) { /* storage unavailable */ } subs.forEach((f) => f()); };
let audio: HTMLAudioElement | null = null;
let duck = 1;
let order: number[] = [];
const mkOrder = () => { order = TRACKS.map((_, i) => i); if (ms.shuffle) for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const x = order[i]; order[i] = order[j]; order[j] = x; } };
const applyVol = () => { if (audio) audio.volume = Math.max(0, Math.min(1, ms.vol * duck)); };
function el(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio(); audio.preload = "none";
    audio.addEventListener("ended", () => step(1, true));
    audio.addEventListener("play", () => { ms = { ...ms, playing: true }; emit(); });
    audio.addEventListener("pause", () => { ms = { ...ms, playing: false }; emit(); });
  }
  return audio;
}
function playIdx(i: number) {
  if (!TRACKS.length) return;
  ms = { ...ms, idx: (i + TRACKS.length) % TRACKS.length, on: true }; emit();
  const a = el(); a.src = BASE + "music/" + TRACKS[ms.idx].file; applyVol();
  a.play().catch(() => { ms = { ...ms, playing: false }; emit(); });
}
function step(d: number, auto = false) {
  if (!order.length) mkOrder();
  let p = order.indexOf(ms.idx); if (p < 0) p = 0;
  let np = p + d;
  if (np >= order.length) { if (auto && !ms.loop) { ms = { ...ms, on: false, playing: false }; emit(); return; } if (ms.shuffle) mkOrder(); np = 0; }
  if (np < 0) np = order.length - 1;
  playIdx(order[np]);
}
export const music = {
  toggle() { if (ms.on) { ms = { ...ms, on: false }; emit(); if (audio) audio.pause(); } else { mkOrder(); if (audio && audio.src) { ms = { ...ms, on: true }; emit(); applyVol(); audio.play().catch(() => undefined); } else playIdx(ms.idx); } },
  next() { step(1); }, prev() { step(-1); }, pick(i: number) { playIdx(i); },
  setLoop(v: boolean) { ms = { ...ms, loop: v }; emit(); },
  setShuffle(v: boolean) { ms = { ...ms, shuffle: v }; mkOrder(); emit(); },
  setVol(v: number) { ms = { ...ms, vol: v }; applyVol(); emit(); },
};
function useMusic(): MState { const [, f] = useState(0); useEffect(() => { const g = () => f((x: number) => x + 1); subs.add(g); return () => { subs.delete(g); }; }, []); return ms; }

// ---------- speech ----------
let sp: HTMLAudioElement | null = null;
let spToken = 0;
const speechSubs = new Set<() => void>();
export let speaking = "";
const setSpeaking = (k: string) => { speaking = k; speechSubs.forEach((f) => f()); };
export function useSpeaking(): string { const [, f] = useState(0); useEffect(() => { const g = () => f((x: number) => x + 1); speechSubs.add(g); return () => { speechSubs.delete(g); }; }, []); return speaking; }
const duckOn = () => { duck = 0.12; applyVol(); };
const duckOff = () => { duck = 1; applyVol(); };
function tts(text: string): Promise<void> {
  return new Promise((res) => {
    try {
      const s = window.speechSynthesis; if (!s) { res(); return; }
      const u = new SpeechSynthesisUtterance(text); u.lang = "zh-CN"; u.rate = 0.9;
      const v = s.getVoices().find((x) => /zh[-_]CN/i.test(x.lang)); if (v) u.voice = v;
      u.onend = () => res(); u.onerror = () => res(); s.cancel(); s.speak(u);
    } catch (e) { res(); }
  });
}
function playFile(path: string, text: string, tok: number): Promise<void> {
  return new Promise((res) => {
    if (!sp) sp = new Audio();
    const a = sp; a.onended = null; a.onerror = null;
    let done = false; const fin = () => { if (!done) { done = true; res(); } };
    a.onended = fin;
    a.onerror = () => { if (tok === spToken) tts(text).then(fin); else fin(); };
    a.src = BASE + "audio/" + path;
    a.play().catch(() => { if (tok === spToken) tts(text).then(fin); else fin(); });
  });
}
export function stopSpeech() { spToken++; if (sp) { sp.pause(); } try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) { /* ignore */ } duckOff(); setSpeaking(""); }
/** Play a list of [audioPath, text, key] items in order. */
export async function speakSeq(items: [string, string, string][]) {
  stopSpeech(); const tok = ++spToken; duckOn();
  for (const [p, t, k] of items) { if (tok !== spToken) return; setSpeaking(k); await playFile(p, t, tok); if (tok !== spToken) return; await new Promise((r) => setTimeout(r, 250)); }
  if (tok === spToken) { duckOff(); setSpeaking(""); }
}
export const wordAudio = (w: string): [string, string, string][] => [["w/" + encodeURIComponent(w) + ".mp3", w, "w:" + w]];

export function SpeakBtn({ items, k, size = 34, label }: { items: [string, string, string][]; k: string; size?: number; label?: string }) {
  const cur = useSpeaking();
  const on = cur !== "" && (cur === k || items.some((x) => x[2] === cur));
  return (
    <button aria-label={label || "播放 · play"} title={label || "播放"} onClick={(e) => { e.stopPropagation(); if (on) stopSpeech(); else speakSeq(items); }}
      style={{ cursor: "pointer", flex: "0 0 auto", width: size, height: size, borderRadius: 9999, border: on ? "none" : "1.5px solid rgba(232,85,154,0.35)", background: on ? "linear-gradient(135deg,#ff8cc0,#c58bff)" : "#fff", color: on ? "#fff" : "#d63f8c", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0, verticalAlign: "middle", boxShadow: on ? "0 3px 10px rgba(232,85,154,0.35)" : "none" }}>
      {on ? <svg width={size * 0.42} height={size * 0.42} viewBox="0 0 10 10" aria-hidden><rect x="1" y="1" width="8" height="8" rx="2" fill="currentColor" /></svg>
        : <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" aria-hidden><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" /><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>}
    </button>
  );
}

// ---------- music bar UI ----------
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
function Tog({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return <button aria-pressed={on} onClick={onClick} style={{ cursor: "pointer", border: on ? "none" : "1.5px solid rgba(232,85,154,0.3)", borderRadius: 9999, padding: "6px 12px", fontFamily: "inherit", fontSize: 13, fontWeight: 700, background: on ? "linear-gradient(135deg,#ff8cc0,#c58bff)" : "#fff", color: on ? "#fff" : "#8f2160" }}>{label}</button>;
}
const ib: Record<string, string | number> = { cursor: "pointer", width: 32, height: 32, borderRadius: 9999, border: "1.5px solid rgba(232,85,154,0.3)", background: "#fff", color: "#c0447f", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0, fontSize: 14, fontWeight: 800, flex: "0 0 auto" };
export function MusicBar({ lang }: { lang: "vi" | "en" }) {
  const m = useMusic();
  const [open, setOpen] = useState(false);
  const [credits, setCredits] = useState(false);
  const vi = lang === "vi";
  const tr = TRACKS[m.idx];
  const L = {
    music: vi ? "音乐" : "音乐 Music", on: vi ? "开 · Bật" : "On", off: vi ? "关 · Tắt" : "Off",
    loop: vi ? "循环 · Lặp" : "循环 · Loop", seq: vi ? "顺序 · Tuần tự" : "顺序 · In order", shuf: vi ? "随机 · Ngẫu nhiên" : "随机 · Shuffle",
    list: vi ? "歌单 · Danh sách nhạc" : "歌单 · Playlist", vol: vi ? "音量 · Âm lượng" : "音量 · Volume",
    cred: vi ? "Nguồn & giấy phép (CC0)" : "Credits & licences (CC0)",
    credNote: vi ? "Tất cả 30 bản nhạc là của Holizna, phát hành theo CC0 1.0 (phạm vi công cộng) trên OpenGameArt.org; đã nén lại 64 kbps để trang nhẹ hơn. Nhạc chỉ tải khi bạn bấm phát." : "All 30 tracks are by Holizna, released under CC0 1.0 (public domain) on OpenGameArt.org; re-encoded at 64 kbps to keep the site light. A track is only downloaded when it plays.",
  };
  return (
    <div className="mbar" style={{ position: "relative", display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
      <button aria-pressed={m.on} onClick={() => music.toggle()} title={L.music} style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, border: m.on ? "none" : "1.5px solid rgba(232,85,154,0.35)", borderRadius: 9999, padding: "6px 12px", fontFamily: "inherit", fontSize: 13, fontWeight: 800, background: m.on ? "linear-gradient(135deg,#ff8cc0,#c58bff)" : "#fff", color: m.on ? "#fff" : "#c0447f", boxShadow: m.on ? "0 3px 10px rgba(232,85,154,0.3)" : "none", flex: "0 0 auto" }}>
        <span aria-hidden className={m.on && m.playing ? "note-bounce" : ""}>♫</span>{L.music} {m.on ? L.on : L.off}
      </button>
      <button aria-label="playlist" aria-expanded={open} onClick={() => setOpen(!open)} style={{ ...ib, width: "auto", padding: "0 10px", gap: 4, maxWidth: 190, overflow: "hidden" }}>
        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: 12 }} className="mtitle">{tr ? tr.title : ""}</span><span aria-hidden>{open ? "▴" : "▾"}</span>
      </button>
      {open ? (
        <div className="mpanel" role="dialog" aria-label={L.list} style={{ position: "absolute", right: 0, top: 42, zIndex: 50, width: 340, maxWidth: "calc(100vw - 20px)", background: "#fff", borderRadius: 22, boxShadow: "0 14px 40px rgba(143,33,96,0.22)", border: "1.5px solid rgba(248,190,220,0.8)", padding: 14, textAlign: "left", fontSize: 13 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <button aria-label="previous" style={ib} onClick={() => music.prev()}>⏮</button>
            <button aria-label={m.on && m.playing ? "pause" : "play"} style={{ ...ib, width: 40, height: 40, border: "none", background: "linear-gradient(135deg,#ff8cc0,#c58bff)", color: "#fff", fontSize: 16 }} onClick={() => music.toggle()}>{m.on && m.playing ? "❚❚" : "▶"}</button>
            <button aria-label="next" style={ib} onClick={() => music.next()}>⏭</button>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 800, color: "#8f2160", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tr ? `${m.idx + 1}. ${tr.title}` : ""}</div>
              <div style={{ color: "#a0507f", fontSize: 12 }}>Holizna · CC0</div>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            <Tog on={m.loop} label={`${L.loop} ${m.loop ? "✓" : "✗"}`} onClick={() => music.setLoop(!m.loop)} />
            <Tog on={!m.shuffle} label={L.seq} onClick={() => music.setShuffle(false)} />
            <Tog on={m.shuffle} label={L.shuf} onClick={() => music.setShuffle(true)} />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#8f2160", marginBottom: 8 }}>{L.vol}<input type="range" min={0} max={1} step={0.05} value={m.vol} onChange={(e) => music.setVol(Number(e.target.value))} style={{ flex: 1, accentColor: "#e8559a" }} /></label>
          <div style={{ fontWeight: 800, color: "#8f2160", margin: "4px 0 6px" }}>{L.list}</div>
          <ol style={{ listStyle: "none", margin: 0, padding: 0, maxHeight: 230, overflowY: "auto", borderRadius: 14, background: "#fff7fb" }}>
            {TRACKS.map((x, i) => (
              <li key={x.file}><button onClick={() => music.pick(i)} style={{ cursor: "pointer", width: "100%", display: "flex", gap: 8, alignItems: "center", border: "none", background: i === m.idx ? "rgba(232,85,154,0.12)" : "transparent", padding: "7px 10px", fontFamily: "inherit", fontSize: 13, color: i === m.idx ? "#8f2160" : "#5a3a5f", fontWeight: i === m.idx ? 800 : 500, textAlign: "left" }}>
                <span style={{ width: 22, color: "#d07aa8" }}>{i === m.idx && m.on && m.playing ? "♪" : i + 1}</span><span style={{ flex: 1 }}>{x.title}</span><span style={{ color: "#b98aac", fontSize: 12 }}>{fmt(x.dur)}</span>
              </button></li>
            ))}
          </ol>
          <button onClick={() => setCredits(!credits)} style={{ cursor: "pointer", marginTop: 10, border: "none", background: "transparent", color: "#c0447f", fontFamily: "inherit", fontSize: 12, fontWeight: 700, padding: 0, textDecoration: "underline" }}>{credits ? "▴ " : "▸ "}{L.cred}</button>
          {credits ? (
            <div style={{ marginTop: 6, fontSize: 12, lineHeight: "18px", color: "#6b4a66" }}>
              <p style={{ margin: "0 0 6px" }}>{L.credNote}</p>
              <ul style={{ margin: 0, paddingLeft: 16, maxHeight: 160, overflowY: "auto" }}>
                {TRACKS.map((x) => <li key={x.file}>“{x.title}” — {x.artist} · {x.license} · <a href={x.source} target="_blank" rel="noopener noreferrer" style={{ color: "#c0447f" }}>{x.collection}</a></li>)}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
