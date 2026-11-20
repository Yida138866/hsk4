const puppeteer = require("puppeteer-core");
const base = process.argv[2]; const shot = process.argv[3] || "";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", headless: "new", args: ["--no-sandbox"] });
  let fail = 0; const ok = (t, c, x = "") => { console.log(`${t}: ${c ? "PASS" : "FAIL"} ${x}`); if (!c) fail++; };
  for (const path of ["", "en/"]) {
    const tag = path || "vi/"; const page = await browser.newPage(); await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const errs = []; page.on("pageerror", (e) => errs.push(e.message)); page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
    const get = () => page.evaluate(() => JSON.parse(localStorage.getItem("hsk4-pet-v1") || "null"));
    const names = () => page.evaluate(() => [document.querySelector(".pet-name")?.textContent, document.querySelector(".pet-widget")?.textContent]);
    await page.goto(base + path, { waitUntil: "networkidle0" }); await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: "networkidle0" });
    await page.click(".pet-widget"); await sleep(400);
    ok(tag + " adopt needs a name", await page.$eval(".adopt-go", (b) => b.disabled));
    const ph = await page.$eval("#pet-top input", (i) => i.placeholder); ok(tag + " hint asks for a name", !ph.includes("宠物成长"), ph);
    await page.type("#pet-top input", "经济建设"); await page.click(".adopt-go"); await sleep(500);
    await page.reload({ waitUntil: "networkidle0" }); await page.click(".pet-widget"); await sleep(500);
    let st = await get(); let n = await names();
    ok(tag + " custom name 经济建设 kept as typed", st.name === "经济建设" && n[0] === "经济建设" && n[1].includes("经济建设"), JSON.stringify(n));
    await page.click(".rename"); await sleep(200); await page.evaluate(() => { const i = document.querySelector(".rename-in"); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; set.call(i, ""); i.dispatchEvent(new Event("input", { bubbles: true })); });
    ok(tag + " rename blocks empty", await page.$eval(".rename-ok", (b) => b.disabled));
    await page.type(".rename-in", "小美"); await page.click(".rename-ok"); await sleep(400);
    st = await get(); n = await names();
    ok(tag + " student's own name kept", st.name === "小美" && n[0] === "小美" && n[1].includes("小美"));
    await page.reload({ waitUntil: "networkidle0" }); st = await get();
    ok(tag + " own name survives reload", st.name === "小美");
    ok(tag + " console clean", errs.length === 0, errs.join("|"));
    await page.close();
  }
  await browser.close(); console.log(fail ? "FAILURES " + fail : "ALL PASS"); process.exit(fail ? 1 : 0);
})();
