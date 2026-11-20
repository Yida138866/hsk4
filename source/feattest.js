const puppeteer = require("puppeteer-core"); const fs = require("fs");
const base = process.argv[2]; const shot = process.argv[3] || "";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ds = (off = 0) => { const d = new Date(); d.setDate(d.getDate() + off); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const EVS = ["tet", "mid", "qixi", "val", "w38", "w2010", "xmas"];
(async () => {
  const browser = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", headless: "new", args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"] });
  let fail = 0; const ok = (t, c, x = "") => { console.log(`${t}: ${c ? "PASS" : "FAIL"} ${x}`); if (!c) fail++; };
  for (const path of ["", "en/"]) for (const vp of [{ name: "phone", width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, { name: "desktop", width: 1366, height: 900 }]) {
    const tag = `${path || "vi/"} ${vp.name}`; const L = path ? "en" : "vi"; const EN = !!path; const page = await browser.newPage(); await page.setViewport(vp);
    const errs = []; const reqs = [];
    page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); }); page.on("pageerror", (e) => errs.push("pageerror " + e.message));
    page.on("response", (r) => { if (/\/audio\//.test(r.url())) reqs.push(r.status() + " " + r.url()); if (r.status() >= 400) errs.push("http " + r.status() + " " + r.url()); });
    const get = () => page.evaluate(() => JSON.parse(localStorage.getItem("hsk4-pet-v1") || "null"));
    const click = async (sel, prefix) => { const f = await page.evaluate((sel, prefix) => { const el = [...document.querySelectorAll(sel)].find((b) => b.textContent.trim().includes(prefix)); if (el) { el.click(); return true; } return false; }, sel, prefix); if (!f) throw new Error("not found " + prefix); await sleep(250); };
    const open = async (q = "") => { await page.goto(base + path + q, { waitUntil: "networkidle0" }); await page.click(".pet-widget"); await sleep(600); };
    const seed = async (o, q = "") => { await page.evaluate((o) => { const s = JSON.parse(localStorage.getItem("hsk4-pet-v1")); Object.assign(s, o); localStorage.setItem("hsk4-pet-v1", JSON.stringify(s)); }, o); await open(q); };
    const scrollTo = async (sel, off = 8) => { await page.evaluate((sel, off) => { const e = document.querySelector(sel); if (e) window.scrollTo(0, e.getBoundingClientRect().top + scrollY - off); }, sel, off); await sleep(450); };
    const snap = async (n) => { if (shot) await page.screenshot({ path: `${shot}_${L}_${vp.name}_${n}.png` }); };
    await page.goto(base + path, { waitUntil: "networkidle0" }); await page.evaluate(() => localStorage.clear()); await open();
    await page.evaluate(() => document.querySelectorAll(".adopt button")[0].click()); await page.type("#pet-top input", "Bông"); await page.click(".adopt-go"); await sleep(500);
    await seed({ xp: 700, lessons: [1, 2, 3, 4, 5, 6], stage: 2 });
    // ---- 错题本: collect from lesson quiz, random test, pet quiz ----
    await click("[role=tab]", "每课小测"); await sleep(300);
    await page.evaluate(() => { const blocks = [...document.querySelectorAll("button")].filter((b) => /^[A-D][.、]/.test(b.textContent.trim())); }); 
    const picked = await page.evaluate(() => { let n = 0; document.querySelectorAll(".qblock, [data-q]").forEach(() => n++); return n; });
    // answer every lesson-quiz question with its first option
    await page.evaluate(() => { const groups = {}; [...document.querySelectorAll("button[aria-pressed]")].forEach((b) => { const k = b.parentElement; if (!groups.has) {} }); });
    const nq = await page.evaluate(() => { let n = 0; const seen = new Set(); [...document.querySelectorAll("button")].forEach((b) => { const p = b.parentElement; if (p && !seen.has(p) && p.children.length === 4 && [...p.children].every((c) => c.tagName === "BUTTON")) { seen.add(p); p.children[0].click(); n++; } }); return n; });
    await sleep(200); await click("button", EN ? "交卷" : "交卷 · Nộp bài"); await sleep(400);
    let st = await get(); const wb1 = Object.keys(st.wb).length;
    ok(tag + " lesson quiz wrong answers collected", wb1 > 0, `answered=${nq} wb=${wb1}`);
    await click("[role=tab]", "随机水平测验"); await sleep(200);
    await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => /生成|Tạo|Generate|开始/.test(x.textContent)); if (b) b.click(); }); await sleep(600);
    await page.evaluate(() => { document.querySelectorAll(".rq").forEach((q) => { const bs = q.querySelectorAll("div[style*=grid] > button"); if (bs.length === 4) bs[0].click(); }); }); await sleep(300);
    await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => /交卷/.test(x.textContent)); if (b) b.click(); }); await sleep(600);
    st = await get(); const wb2 = Object.keys(st.wb).length;
    ok(tag + " random test wrong answers collected (dedup)", wb2 > wb1 && new Set(Object.keys(st.wb)).size === wb2, `wb=${wb2}`);
    await open(); await scrollTo(".pquiz", 60); await page.click(".pq-start"); await sleep(300);
    for (let i = 0; i < 5; i++) { const s2 = await get(); const d = s2.pq.items[i]; await page.evaluate((k) => document.querySelectorAll(".pq-opts button")[k].click(), d.perm.findIndex((x) => x !== 0)); await sleep(150); }
    await page.click(".pq-finish"); await sleep(300); st = await get(); const wb3 = Object.keys(st.wb).length;
    ok(tag + " pet quiz wrong answers collected", wb3 >= wb2 + 3, `wb=${wb3}`);
    const cnt = await page.$eval(".wb-count", (e) => e.textContent); ok(tag + " count badge shown", cnt === String(wb3), cnt);
    await scrollTo(".wrongbook", 60); await snap("wrongbook");
    // rescue session: first right, second wrong
    const s0 = await get(); const n0 = reqs.length;
    await page.click(".wb-start"); await sleep(1200);
    ok(tag + " rescue line audio", reqs.slice(n0).some((r) => /audio\/pet\/(25|26)\.mp3/.test(r)), reqs.slice(n0).join(","));
    const sessIds = await page.evaluate(() => null);
    // find the right option by matching text of the correct opt (bank opts[0]) via the explanation after click: brute force — click the option whose text matches bank opts[0]
    const pickRight = async (right) => page.evaluate((right) => { const bs = [...document.querySelectorAll(".wb-opts button")]; const b = bs.find((x) => x.textContent.replace(/^[A-D]\.\s*/, "") === right) || bs[0]; b.click(); }, right);
    const curStem = async () => page.$eval(".wb-q", (e) => e.textContent);
    const bankRight = async () => page.evaluate(() => { const id = document.querySelector(".wb-q").getAttribute("data-id"); const it = (window.HSK_BANK || []).find((x) => x.id === id); return it ? it.opts[0] : null; });
    const r1 = await bankRight(); await pickRight(r1); await sleep(500);
    let s1 = await get();
    ok(tag + " rescue clears item + reward", Object.keys(s1.wb).length === Object.keys(s0.wb).length - 1 && s1.stars === s0.stars + 1 && s1.wbCleared === 1, `wb ${Object.keys(s0.wb).length}->${Object.keys(s1.wb).length} stars ${s0.stars}->${s1.stars}`);
    ok(tag + " explanation shown", await page.$(".wb-ex") !== null);
    await scrollTo(".wrongbook", 60); await snap("wrongbook_rescue");
    await page.click(".wb-next"); await sleep(300);
    const r2 = await bankRight(); await page.evaluate((right) => { const bs = [...document.querySelectorAll(".wb-opts button")]; const b = bs.find((x) => x.textContent.replace(/^[A-D]\.\s*/, "") !== right); b.click(); }, r2); await sleep(400);
    const s2 = await get(); ok(tag + " wrong answer keeps item (no penalty)", Object.keys(s2.wb).length === Object.keys(s1.wb).length && s2.stars === s1.stars);
    for (let k = 0; k < 4; k++) { if (await page.$(".wb-next")) { await page.click(".wb-next"); await sleep(200); } if (await page.$(".wb-opts button:not([disabled])")) { await page.evaluate(() => document.querySelector(".wb-opts button").click()); await sleep(200); } }
    if (await page.$(".wb-next")) { await page.click(".wb-next"); await sleep(200); }
    ok(tag + " rescue summary", await page.$(".wb-result") !== null);
    // ---- dialogue ----
    await seed({ lastPass: { l: 8, day: ds(0) }, ciLast: ds(0), ciStreak: 5, lastDay: ds(-5), wb: { f1815: { src: "rtest", l: 8, ty: "fill", t: 1 }, f1816: { src: "rtest", l: 8, ty: "fill", t: 2 } } });
    const seen = new Set(); const n1 = reqs.length;
    const first = await page.$eval("#pet-top .bubble", (e) => e.textContent).catch(() => "");
    ok(tag + " greeting bubble on open", first.length > 3, first.slice(0, 30));
    for (let k = 0; k < 18; k++) { await page.click('#pet-top button[aria-label="pet"]'); await sleep(250); seen.add(await page.$eval("#pet-top .bubble", (e) => e.textContent)); }
    const all = [...seen].join(" | ");
    ok(tag + " context lines (lesson / break / streak / wb)", /第8课/.test(all) && /欢迎回来|你回来啦/.test(all) && /(连续打卡5天|每天见到你)/.test(all), all.slice(0, 300));
    ok(tag + " fixed context lines have audio", reqs.slice(n1).some((r) => /audio\/pet\/(\d+)\.mp3/.test(r) && Number(r.match(/pet\/(\d+)/)[1]) >= 25));
    await page.evaluate(() => { const b = document.querySelector("#pet-top .bubble"); }); 
    // make the shot show a lesson line
    for (let k = 0; k < 30; k++) { const t = await page.$eval("#pet-top .bubble", (e) => e.textContent); if (/第8课/.test(t)) break; await page.click('#pet-top button[aria-label="pet"]'); await sleep(150); }
    await scrollTo("#pet-top"); await snap("dialogue");
    // ---- festivals ----
    await seed({ lastDay: ds(0), equip: { furn: [] } });
    for (const ev of EVS) {
      await open(`?event=${ev}`);
      const has = await page.$(`.evbanner[data-ev="${ev}"]`); ok(`${tag} event ${ev} banner`, !!has);
      if (vp.name === "phone" || ev === "tet" || ev === "w2010") { await scrollTo("#pet-top"); await snap(`event_${ev}`); }
    }
    await open(); ok(tag + " no event today (Nov) without param", (await page.$(".evbanner")) === null);
    // event gifts from normal study (tet)
    await seed({ ciLast: ds(-1), evXp: {}, owned: [] }, "?event=tet");
    await page.click(".ci-btn"); await sleep(400); await click("[role=tab]", "学习计划"); await page.evaluate(() => localStorage.removeItem("hsk4-plan-vi-v1") || localStorage.removeItem("hsk4-plan-v1"));
    await open("?event=tet"); await click("[role=tab]", "学习计划"); await click("button", "标记完成"); await sleep(500);
    st = await get(); ok(tag + " festival gift via normal study", st.owned.includes("lixi"), JSON.stringify(st.evXp));
    await open("?event=tet"); await click("#pet-top button", EN ? "Festival gifts" : "Quà dịp lễ"); await click("#pet-top .shop button", EN ? "Use" : "Dùng"); await sleep(300);
    st = await get(); ok(tag + " wear festival item", st.equip.hold === "lixi");
    // ---- class card ----
    await open(); await scrollTo(".classcard", 60);
    await page.type(".card-name", "Lan"); await page.type(".card-class", "A1"); await page.click(".card-gen"); await sleep(2500);
    const src = await page.$eval(".card-img", (e) => e.src).catch(() => "");
    const dims = await page.$eval(".card-img", (e) => [e.naturalWidth, e.naturalHeight]).catch(() => [0, 0]);
    ok(tag + " card PNG generated 1080x1350", src.startsWith("data:image/png") && dims[0] === 1080 && dims[1] === 1350, String(dims));
    if (shot && src) fs.writeFileSync(`${shot}_${L}_${vp.name}_classcard.png`, Buffer.from(src.split(",")[1], "base64"));
    const text = await page.$eval(".card-text", (e) => e.value); const code1 = (text.match(/HSK4C1\.[A-Za-z0-9_-]+\.[0-9a-z]+/) || [""])[0];
    ok(tag + " text version + code", /Lan/.test(text) && /A1/.test(text) && !!code1, text.split("\n")[0]);
    await scrollTo(".classcard", 60); await snap("classcard_section");
    await page.evaluate(() => { const i = document.querySelector(".card-name"); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; set.call(i, ""); i.dispatchEvent(new Event("input", { bubbles: true })); });
    await page.type(".card-name", "Hoa"); await sleep(200);
    const code2 = await page.$eval(".card-text", (e) => (e.value.match(/HSK4C1\.[A-Za-z0-9_-]+\.[0-9a-z]+/) || [""])[0]);
    const parts = code2.split("."); const tampered = parts[0] + "." + parts[1].slice(0, -3) + (parts[1].slice(-3) === "AAA" ? "BBB" : "AAA") + "." + parts[2];
    await page.goto(base + path + "?teacher=1", { waitUntil: "networkidle0" }); await sleep(800);
    ok(tag + " teacher view opens", await page.$(".teacher") !== null);
    const paste = `Lan gửi: ${code1}\nHoa: ${code2}\nfake: ${tampered}\nLan again ${code1}`;
    await page.evaluate((c) => { const ta = document.querySelector(".teacher-in"); const set = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set; set.call(ta, c); ta.dispatchEvent(new Event("input", { bubbles: true })); }, paste); await sleep(300);
    const rows = await page.$$eval(".teacher-table tbody tr", (r) => r.map((x) => x.textContent));
    const bad = await page.$$eval(".teacher-bad div", (r) => r.length).catch(() => 0);
    ok(tag + " teacher table (2 valid, dedup, 1 tampered flagged)", rows.length === 2 && rows.some((r) => r.includes("Lan")) && rows.some((r) => r.includes("Hoa")) && bad === 1, `${rows.length} rows, bad ${bad}`);
    await scrollTo("#teacher-top"); await snap("teacher");
    const ow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth); ok(tag + " no overflow", ow <= 0, String(ow));
    ok(tag + " console clean", errs.length === 0, errs.join(" | "));
    await page.close();
  }
  await browser.close(); console.log(fail ? `FAILURES ${fail}` : "ALL PASS"); process.exit(fail ? 1 : 0);
})();
