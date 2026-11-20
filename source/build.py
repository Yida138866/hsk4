import re, json, os, shutil, subprocess
os.chdir(os.path.dirname(os.path.abspath(__file__)))
PREVIEW = os.environ.get("PREVIEW") == "1"
out = "dist_preview" if PREVIEW else "dist"
shutil.rmtree(out, ignore_errors=True)
os.makedirs(out + "/en/assets", exist_ok=True); os.makedirs(out + "/assets", exist_ok=True); os.makedirs(out + "/data", exist_ok=True)
NAMES = ["WRAW", "TRAW", "GRAW", "GQRAW", "CLRAW"]
cfg = {
 "vi": dict(dir=out, lang="vi", other_href="./en/", other_label="English version →", note="Tiếng Việt · 中文", title="HSK 4 系统学习 · Học HSK 4 có hệ thống (中文–Tiếng Việt)", desc="Giáo trình HSK 4 có hệ thống: kế hoạch 10 tuần, 602 từ mới, 100 điểm ngữ pháp, thẻ từ, kiểm tra trình độ và kiểm tra từng bài."),
 "en": dict(dir=out + "/en", lang="en", other_href="../", other_label="Phiên bản tiếng Việt →", note="English · 中文", title="HSK 4 系统学习：10 周计划 · 20 课 · 测试", desc="A structured HSK 4 course: 10-week plan, 602 words, 100 grammar points, flashcards, placement test and lesson quizzes."),
}
PV_CSS = """
.pet-bounce{animation:pb 2.4s ease-in-out infinite}
@keyframes pb{0%,100%{transform:translateY(0) scale(1,1)}45%{transform:translateY(-6px) scale(1.01,.99)}55%{transform:translateY(-6px)}80%{transform:translateY(0) scale(1.03,.97)}}
.pet-wobble{animation:pw 3s ease-in-out infinite}
@keyframes pw{0%,80%,100%{transform:rotate(0)}85%{transform:rotate(-6deg)}90%{transform:rotate(6deg)}95%{transform:rotate(-3deg)}}
.hearts-pop{position:absolute;left:50%;top:40%;pointer-events:none;font-size:22px;animation:hp 1.2s ease-out forwards}
.hearts-pop span{position:absolute;left:-26px;top:10px;animation:hp 1.3s .1s ease-out forwards}
.hearts-pop span+span{left:24px;top:4px;animation-delay:.2s}
@keyframes hp{0%{opacity:0;transform:translateY(0) scale(.6)}20%{opacity:1}100%{opacity:0;transform:translateY(-70px) scale(1.2)}}
.toast{animation:tin .35s ease-out}
.levelup{animation:lin .5s cubic-bezier(.2,1.4,.4,1)}
@keyframes tin{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes lin{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:none}}
.confetti{position:relative;height:0}
.confetti span{position:absolute;top:-120px;font-size:18px;animation:cf 1.8s ease-in infinite}
@keyframes cf{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(140px) rotate(200deg);opacity:0}}
.pulse{animation:pu 1.6s ease-in-out infinite}
@keyframes pu{0%,100%{transform:scale(1);box-shadow:0 4px 12px rgba(232,85,154,.28)}50%{transform:scale(1.05);box-shadow:0 6px 22px rgba(232,85,154,.5)}}
.flame{animation:fl 1.2s ease-in-out infinite;transform-origin:50% 90%}
@keyframes fl{0%,100%{transform:scale(1) rotate(-3deg)}50%{transform:scale(1.12) rotate(3deg)}}
.ci-pop{animation:cip .6s cubic-bezier(.2,1.5,.4,1)}
@keyframes cip{0%{transform:scale(.94)}100%{transform:none}}
.pv-badge{background:#ffd36e;color:#7a4300;font-weight:800;border-radius:999px;padding:4px 10px}
@media (prefers-reduced-motion: reduce){.pet-bounce,.pet-wobble,.confetti span,.pulse,.flame,.ci-pop{animation:none}}
""" if PREVIEW else ""
PV_STORE = "<script>(function(){try{var P=Storage.prototype,g=P.getItem,s=P.setItem,r=P.removeItem;var k=function(x){return typeof x==='string'&&x.indexOf('hsk4-')===0?'hsk4pv-'+x.slice(5):x};P.getItem=function(x){return g.call(this,k(x))};P.setItem=function(x,v){return s.call(this,k(x),v)};P.removeItem=function(x){return r.call(this,k(x))}}catch(e){}})();</script>"
for k, c in cfg.items():
    PV_HEAD = "\n" + PV_STORE + "<script>window.HSK_BASE=" + ('"../../"' if k == "en" else '"../"') + ";</script>"
    src = open(f"src/{k}.tsx").read()
    data = {}
    for n in NAMES:
        m = re.search(r"^const " + n + r" = `(.*?)`;", src, re.S | re.M)
        if not m: continue
        data[n] = m.group(1)
        src = src[:m.start()] + f"const {n}: string = HSK_DATA.{n};" + src[m.end():]
    src = re.sub(r'^import \{([^}]*)\} from "grok/canvas";', r'import {\1} from "./kit";', src, flags=re.M)
    src = re.sub(r'^import type \{([^}]*)\} from "grok/canvas";', r'import type {\1} from "./kit";', src, flags=re.M)
    src = src.replace('import("grok/canvas")', 'import("./kit")')
    src = 'declare const HSK_DATA: Record<string, string>;\n' + src
    open(f"src/build_{k}.tsx", "w").write(src)
    open(f"src/entry_{k}.tsx", "w").write(f'import {{ createRoot }} from "react-dom/client";\nimport {{ ThemeRoot }} from "./kit";\nimport App from "./build_{k}";\nimport {{ MusicBar }} from "./audio";\ncreateRoot(document.getElementById("root")!).render(<ThemeRoot><App /></ThemeRoot>);\nconst mr = document.getElementById("music-root"); if (mr) createRoot(mr).render(<MusicBar lang="{k}" />);\n' + ('import { PetWidget } from "./pet";\nconst pr = document.createElement("div"); pr.id = "pet-root"; document.body.appendChild(pr); createRoot(pr).render(<PetWidget />);\n' if PREVIEW else '') + f'')
    open(f"{c['dir']}/assets/texts.js", "w").write("window.HSK_TEXTS = " + open("texts.json").read() + ";\n")
    if k == "vi": open(f"{out}/assets/tracks.js", "w").write("window.HSK_TRACKS = " + open("tracks.json").read() + ";\n")
    open(f"{c['dir']}/assets/bank.js", "w").write("window.HSK_BANK = " + open(f"bank_{k}.json").read() + ";\n")
    js = "window.HSK_DATA = " + json.dumps(data, ensure_ascii=False, indent=0) + ";\n"
    open(f"{c['dir']}/assets/data.js", "w").write(js)
    subprocess.run(["npx", "esbuild", f"src/entry_{k}.tsx", "--bundle", "--minify", "--jsx=automatic", "--define:process.env.NODE_ENV=\"production\"", "--target=es2018", f"--define:__PET__={'true' if PREVIEW else 'false'}", f"--outfile={c['dir']}/assets/app.js", "--log-level=warning"], check=True)
    html = f"""<!doctype html>
<html lang="{c['lang']}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{('[预览] ' if PREVIEW else '') + c['title']}</title>
<meta name="description" content="{c['desc']}">
<meta name="color-scheme" content="light">{PV_HEAD if PREVIEW else ''}
<meta name="theme-color" content="#ffd6e8">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22%3E%3Cdefs%3E%3ClinearGradient id=%22g%22 x1=%220%22 y1=%220%22 x2=%221%22 y2=%221%22%3E%3Cstop offset=%220%22 stop-color=%22%23ff8cc0%22/%3E%3Cstop offset=%221%22 stop-color=%22%23c58bff%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d=%22M32 58C14 45 4 36 4 22A14 14 0 0 1 32 14A14 14 0 0 1 60 22C60 36 50 45 32 58Z%22 fill=%22url(%23g)%22/%3E%3Ctext x=%2232%22 y=%2240%22 font-size=%2224%22 font-weight=%22800%22 text-anchor=%22middle%22 fill=%22white%22 font-family=%22sans-serif%22%3E4%3C/text%3E%3C/svg%3E">
<style>
html,body{{margin:0;padding:0;-webkit-text-size-adjust:100%;}}
html{{background:#fff4f9;}}
body{{min-height:100vh;background-color:#fff4f9;background-image:radial-gradient(rgba(240,122,179,.16) 1.4px,transparent 1.6px),radial-gradient(rgba(197,139,255,.14) 1.4px,transparent 1.6px),linear-gradient(160deg,#ffe8f2 0%,#f6ecff 45%,#fff0e6 100%);background-size:26px 26px,26px 26px,100% 100%;background-position:0 0,13px 13px,0 0;background-attachment:scroll,scroll,fixed;}}
*{{box-sizing:border-box}}
button,select{{-webkit-tap-highlight-color:transparent;transition:transform .12s ease, box-shadow .16s ease;}}
button:not(:disabled):active{{transform:scale(.97)}}
::selection{{background:#ffc6e0}}
rt{{user-select:none}}
.langbar{{max-width:1280px;margin:0 auto;padding:12px 14px 0;display:flex;justify-content:flex-end;align-items:center;gap:10px;font:13px/18px ui-rounded,"SF Pro Rounded","Nunito",system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;}}
.langbar a{{color:#fff;text-decoration:none;padding:6px 14px;border-radius:999px;background:linear-gradient(135deg,#ff8cc0,#c58bff);box-shadow:0 3px 10px rgba(232,85,154,.25);font-weight:700}}
.langbar span{{color:#a0507f;padding:5px 0}}
#music-root{{margin-right:auto;min-width:0}}
.note-bounce{{display:inline-block;animation:nb 1s ease-in-out infinite}}
@keyframes nb{{0%,100%{{transform:translateY(0)}}50%{{transform:translateY(-3px) rotate(-8deg)}}}}
@media (max-width:520px){{.langbar{{flex-wrap:wrap}} .lnote{{display:none}} .mtitle{{max-width:90px}} .mpanel{{position:fixed!important;left:10px;right:10px!important;top:58px!important;width:auto!important}}}}
.deco{{position:fixed;pointer-events:none;z-index:0;opacity:.55}}
#root{{position:relative;z-index:1}}
@media (max-width:520px){{.deco{{display:none}} .hero-deco{{display:none}}}}
{PV_CSS}
noscript{{display:block;padding:24px;font-family:sans-serif}}
</style>
</head>
<body>
<nav class="langbar" aria-label="Language"><div id="music-root"></div>{'<span class="pv-badge">预览 · ' + ('Preview' if k=='en' else 'Bản xem thử') + '</span>' if PREVIEW else ''}<span class="lnote">{c['note']}</span><a href="{c['other_href']}" hreflang="{'en' if k=='vi' else 'vi'}">{c['other_label']}</a></nav>
<svg class="deco" aria-hidden="true" style="left:2%;top:140px" width="46" height="46" viewBox="0 0 20 20"><path d="M10 0l2.4 7.6 7.6 2.4-7.6 2.4L10 20l-2.4-7.6L0 10l7.6-2.4z" fill="#ffc46b"/></svg>
<svg class="deco" aria-hidden="true" style="right:3%;top:320px" width="40" height="40" viewBox="0 0 32 32"><path d="M16 29C7 22 2 17 2 11a7 7 0 0 1 14-3 7 7 0 0 1 14 3c0 6-5 11-14 18z" fill="#f9a8cf"/></svg>
<svg class="deco" aria-hidden="true" style="left:3%;bottom:80px" width="44" height="44" viewBox="0 0 40 40"><g fill="#d9c2ff"><circle cx="20" cy="9" r="7"/><circle cx="31" cy="17" r="7"/><circle cx="27" cy="30" r="7"/><circle cx="13" cy="30" r="7"/><circle cx="9" cy="17" r="7"/></g><circle cx="20" cy="21" r="5" fill="#ffd27a"/></svg>
<svg class="deco" aria-hidden="true" style="right:4%;bottom:140px" width="30" height="30" viewBox="0 0 20 20"><path d="M10 0l2.4 7.6 7.6 2.4-7.6 2.4L10 20l-2.4-7.6L0 10l7.6-2.4z" fill="#c58bff"/></svg>
<div id="root"></div>
<noscript>This page needs JavaScript. · Trang này cần bật JavaScript.</noscript>
<script src="{c.get('texts_src','assets/texts.js')}"></script>
<script src="{'../' if k=='en' else ''}assets/tracks.js"></script>
<script src="assets/bank.js"></script>
<script src="assets/data.js"></script>
<script src="assets/app.js"></script>
</body>
</html>
"""
    open(f"{c['dir']}/index.html", "w").write(html)
os.path.exists("../course_vi.json") and shutil.copy("../course_vi.json", out + "/data/course_vi.json")
os.path.exists("../course.json") and shutil.copy("../course.json", out + "/data/course.json")
open(out + "/.nojekyll", "w").write("")
print("ok")
