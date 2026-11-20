const puppeteer = require("puppeteer-core");
const base = process.argv[2]; const shotPrefix = process.argv[3] || "";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function clickText(page, sel, prefix) {
  const ok = await page.evaluate((sel, prefix) => { const el = [...document.querySelectorAll(sel)].find((b) => b.textContent.trim().startsWith(prefix)); if (el) { el.click(); return true; } return false; }, sel, prefix);
  if (!ok) throw new Error(`not found: ${sel} ${prefix}`); await sleep(150);
}
const body = (page) => page.evaluate(() => document.body.innerText);
(async () => {
  const browser = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", headless: "new", args: ["--no-sandbox", "--lang=vi"] });
  const results = [];
  for (const path of ["", "en/"]) for (const vp of [{ name: "phone", width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, { name: "desktop", width: 1366, height: 900 }]) {
    const page = await browser.newPage(); await page.setViewport(vp);
    const errs = [];
    page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errs.push(m.type() + ": " + m.text()); });
    page.on("pageerror", (e) => errs.push("pageerror: " + e.message));
    page.on("requestfailed", (r) => errs.push("reqfail: " + r.url()));
    page.on("response", (r) => { if (r.status() >= 400) errs.push("http " + r.status() + " " + r.url()); });
    const url = base + path; const tag = `${path || "vi/"} ${vp.name}`;
    const log = (s) => results.push(`${tag}: ${s}`);
    await page.evaluateOnNewDocument(() => {});
    await page.goto(url, { waitUntil: "networkidle0" });
    await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: "networkidle0" });
    if (shotPrefix) await page.screenshot({ path: `${shotPrefix}_${path ? "en" : "vi"}_${vp.name}_home.png` });
    // overflow check
    const ow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); log(`horizontal overflow px=${ow}`);
    // plan
    let t = await body(page); if (!t.includes("已完成 0 /")) throw new Error(tag + " plan progress missing");
    await clickText(page, "button", "标记完成"); await clickText(page, "button", "标记完成");
    await page.reload({ waitUntil: "networkidle0" }); t = await body(page);
    log(`plan persisted after reload: ${t.includes("已完成 2 /")}`);
    // lessons
    await clickText(page, "[role=tab]", "课程"); t = await body(page); log(`lessons words table: ${t.includes("爱情")}`);
    await clickText(page, "[role=tab]", "闪卡");
    const before = await body(page);
    await clickText(page, "button", "翻面"); const after = await body(page);
    log(`flashcard flips: ${before.includes("点卡片") && !after.includes("点卡片") && after.includes("àiqíng") || after.includes("ài")}`);
    if (shotPrefix && vp.name === "phone" && !path) await page.screenshot({ path: shotPrefix + "_card.png" });
    await clickText(page, "button", "下一张");
    await clickText(page, "[role=tab]", "语言点"); t = await body(page); log(`grammar: ${t.includes("不仅")}`);
    await clickText(page, "[role=tab]", "课文文章"); t = await body(page); log(`reader tab: ${t.includes("课文文章") && t.includes("阿玲")}`);
    const rb = await page.evaluate(() => document.querySelectorAll("ruby").length);
    await clickText(page, "button", "✓ 拼音"); const rb2 = await page.evaluate(() => document.querySelectorAll("ruby").length);
    await clickText(page, "button", "拼音"); log(`reader pinyin toggle: ${rb > 0 && rb2 === 0} (${rb}->${rb2})`);
    await clickText(page, "button", "✓ 翻译"); const trOff = !(await body(page)).includes(path ? "A Linh and Xiaoxue" : "A Linh và Tiểu Tuyết nói chuyện"); await clickText(page, "button", "翻译"); log(`reader translation toggle: ${trOff}`);
    await clickText(page, "#reader-top button", path ? "Next" : "Bài sau"); await sleep(300); t = await body(page); log(`reader next lesson: ${t.includes("第2课")}`);
    await clickText(page, "#reader-top button", "1"); await sleep(400);
    if (shotPrefix) { await page.evaluate(() => { const e = document.getElementById("reader-top"); window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - 8); }); await sleep(500); await page.screenshot({ path: `${shotPrefix}_${path ? "en" : "vi"}_${vp.name}_texts.png`, fullPage: vp.name === "phone" ? false : false }); }
    const ow2 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); log(`reader overflow px=${ow2}`);
    // random level test
    const navOk = await page.evaluate(() => { const tabs = [...document.querySelectorAll("[role=tablist]")[0].querySelectorAll("[role=tab]")].map((b) => b.textContent); const qi = tabs.findIndex((x) => x.startsWith("每课小测")); return tabs[qi + 1] && tabs[qi + 1].startsWith("随机水平测验") && !tabs.some((x) => x.startsWith("水平测试")); });
    log(`rtest nav after 每课小测: ${navOk}`);
    await clickText(page, "[role=tab]", "随机水平测验");
    await clickText(page, "button", "🎲"); await sleep(300);
    const ids1 = await page.evaluate(() => [...document.querySelectorAll(".rq")].map((q) => q.textContent).join("|"));
    const nq = await page.evaluate(() => document.querySelectorAll(".rq").length);
    await clickText(page, "button", "🎲"); await sleep(300);
    const ids2 = await page.evaluate(() => [...document.querySelectorAll(".rq")].map((q) => q.textContent).join("|"));
    log(`rtest 30 questions & fresh set: ${nq === 30 && ids1 !== ids2} (${nq})`);
    const types = await page.evaluate(() => { const c = {}; document.querySelectorAll(".rq").forEach((q) => { const k = q.querySelectorAll("span")[1].textContent.split(" · ")[0]; c[k] = (c[k] || 0) + 1; }); return JSON.stringify(c); });
    log(`rtest type mix: ${Object.keys(JSON.parse(types)).length === 6} ${types}`);
    if (shotPrefix) await page.screenshot({ path: `${shotPrefix}_${path ? "en" : "vi"}_${vp.name}_rtest.png` });
    const nClicked = await page.evaluate(() => { let n = 0; document.querySelectorAll(".rq").forEach((q) => { const bs = q.querySelectorAll("div[style*=grid] > button"); if (bs.length === 4) { bs[Math.floor(Math.random() * 4)].click(); n++; } }); return n; }); log(`rtest answered: ${nClicked === 30} (${nClicked})`);
    await sleep(200);
    await clickText(page, "button", path ? "交卷" : "交卷看成绩"); await sleep(400); t = await body(page);
    const hist = await page.evaluate(() => JSON.parse(localStorage.getItem("hsk4-rtest-history-v1") || "[]").length);
    const nrv = await page.evaluate(() => document.querySelectorAll(".rv").length);
    const nrvAudio = await page.evaluate(() => document.querySelectorAll(".rv button").length);
    log(`rtest graded: ${/\d+ \/ 30/.test(t) && hist === 1 && nrv > 0 && nrvAudio === nrv} (history ${hist}, wrong ${nrv}, audio btns ${nrvAudio})`);
    if (shotPrefix) { await page.evaluate(() => { const e = document.getElementById("rtest-result"); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 8); }); await sleep(500); await page.screenshot({ path: `${shotPrefix}_${path ? "en" : "vi"}_${vp.name}_rtest_result.png` }); }
    const ow3 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); log(`rtest overflow px=${ow3}`);
    // quiz
    await clickText(page, "[role=tab]", "每课小测");
    await page.evaluate(() => { document.querySelectorAll("main button").forEach((b) => { const s = b.getAttribute("style") || ""; if (s.includes("text-align: left") && !b.getAttribute("role")) b.click(); }); });
    await sleep(150); await clickText(page, "button", "交卷"); t = await body(page);
    const m = t.match(/得分[^0-9]*(\d+) \/ 10/); log(`quiz graded: ${!!m} score=${m && m[1]}`);
    // exam
    await clickText(page, "[role=tab]", "考试须知"); t = await body(page); log(`exam: ${t.includes("3.0")}`);
    // language link
    const href = await page.$eval(".langbar a", (a) => a.href); log(`lang link -> ${href}`);
    log(`console errors: ${errs.length ? errs.join(" | ") : "none"}`);
    await page.close();
  }
  console.log(results.join("\n")); await browser.close();
})().catch((e) => { console.error("FAIL", e); process.exit(1); });
