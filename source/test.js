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
    if (shotPrefix && vp.name === "phone" && !path) await page.screenshot({ path: shotPrefix + "_plan.png" });
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
    await clickText(page, "[role=tab]", "课文"); t = await body(page); log(`texts: ${t.includes("孙月")}`);
    // placement test
    await clickText(page, "[role=tab]", "水平测试");
    const nOpts = await page.evaluate(() => { let n = 0; document.querySelectorAll("main button").forEach((b) => { const s = b.getAttribute("style") || ""; if (s.includes("text-align: left") && !b.getAttribute("role")) { b.click(); n++; } }); return n; });
    await sleep(200);
    const nTiles = await page.evaluate(() => { let n = 0; for (let k = 0; k < 60; k++) { const b = [...document.querySelectorAll("main button")].find((b) => (b.getAttribute("style") || "").includes("padding: 8px 12px") && !b.disabled); if (!b) break; b.click(); n++; } return n; });
    await sleep(200);
    await clickText(page, "button", "交卷看成绩"); t = await body(page);
    log(`placement graded: ${t.includes("估计成绩")} (clicked ${nOpts} options, ${nTiles} tiles)`);
    if (shotPrefix && vp.name === "phone" && !path) await page.screenshot({ path: shotPrefix + "_test.png" });
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
