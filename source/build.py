import re, json, os, shutil, subprocess
os.chdir(os.path.dirname(os.path.abspath(__file__)))
out = "dist"
shutil.rmtree(out, ignore_errors=True)
os.makedirs(out + "/en/assets", exist_ok=True); os.makedirs(out + "/assets", exist_ok=True); os.makedirs(out + "/data", exist_ok=True)
NAMES = ["WRAW", "TRAW", "GRAW", "GQRAW", "CLRAW"]
cfg = {
 "vi": dict(dir=out, lang="vi", other_href="./en/", other_label="English version →", note="Tiếng Việt · 中文", title="HSK 4 系统学习 · Học HSK 4 có hệ thống (中文–Tiếng Việt)", desc="Giáo trình HSK 4 có hệ thống: kế hoạch 10 tuần, 602 từ mới, 100 điểm ngữ pháp, thẻ từ, kiểm tra trình độ và kiểm tra từng bài."),
 "en": dict(dir=out + "/en", lang="en", other_href="../", other_label="Phiên bản tiếng Việt →", note="English · 中文", title="HSK 4 系统学习：10 周计划 · 20 课 · 测试", desc="A structured HSK 4 course: 10-week plan, 602 words, 100 grammar points, flashcards, placement test and lesson quizzes."),
}
for k, c in cfg.items():
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
    open(f"src/entry_{k}.tsx", "w").write(f'import {{ createRoot }} from "react-dom/client";\nimport {{ ThemeRoot }} from "./kit";\nimport App from "./build_{k}";\ncreateRoot(document.getElementById("root")!).render(<ThemeRoot><App /></ThemeRoot>);\n')
    js = "window.HSK_DATA = " + json.dumps(data, ensure_ascii=False, indent=0) + ";\n"
    open(f"{c['dir']}/assets/data.js", "w").write(js)
    subprocess.run(["npx", "esbuild", f"src/entry_{k}.tsx", "--bundle", "--minify", "--jsx=automatic", "--define:process.env.NODE_ENV=\"production\"", "--target=es2018", f"--outfile={c['dir']}/assets/app.js", "--log-level=warning"], check=True)
    html = f"""<!doctype html>
<html lang="{c['lang']}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{c['title']}</title>
<meta name="description" content="{c['desc']}">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22%3E%3Crect width=%2264%22 height=%2264%22 rx=%2214%22 fill=%22%23c8102e%22/%3E%3Ctext x=%2232%22 y=%2244%22 font-size=%2234%22 text-anchor=%22middle%22 fill=%22white%22 font-family=%22sans-serif%22%3E4%3C/text%3E%3C/svg%3E">
<style>
html,body{{margin:0;padding:0;-webkit-text-size-adjust:100%;}}
*{{box-sizing:border-box}}
button,select{{-webkit-tap-highlight-color:transparent;}}
.langbar{{max-width:1280px;margin:0 auto;padding:10px 16px 0;display:flex;justify-content:flex-end;gap:12px;font:13px/18px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;}}
.langbar a{{color:#1d8cf0;text-decoration:none;padding:4px 10px;border-radius:999px;border:1px solid rgba(29,140,240,.35)}}
.langbar span{{opacity:.55;padding:5px 0}}
noscript{{display:block;padding:24px;font-family:sans-serif}}
</style>
</head>
<body>
<nav class="langbar" aria-label="Language"><span>{c['note']}</span><a href="{c['other_href']}" hreflang="{'en' if k=='vi' else 'vi'}">{c['other_label']}</a></nav>
<div id="root"></div>
<noscript>This page needs JavaScript. · Trang này cần bật JavaScript.</noscript>
<script src="assets/data.js"></script>
<script src="assets/app.js"></script>
</body>
</html>
"""
    open(f"{c['dir']}/index.html", "w").write(html)
shutil.copy("../course_vi.json", out + "/data/course_vi.json")
shutil.copy("../course.json", out + "/data/course.json")
open(out + "/.nojekyll", "w").write("")
print("ok")
