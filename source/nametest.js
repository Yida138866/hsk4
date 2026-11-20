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
    await page.click(".adopt-go"); await sleep(500);
    let st = await get(); let n = await names();
    ok(tag + " blank name -> 宠物成长", st.name === "宠物成长" && n[0] === "宠物成长" && n[1].includes("宠物成长"), JSON.stringify(n));
    await page.evaluate(() => { const s = JSON.parse(localStorage.getItem("hsk4-pet-v1")); s.name = "经济建设"; s.grads = [{ pet: "bunny", name: "经济建设", equip: {}, date: "2026-11-01", xp: 2400, born: 1 }]; localStorage.setItem("hsk4-pet-v1", JSON.stringify(s)); });
    await page.reload({ waitUntil: "networkidle0" }); await page.click(".pet-widget"); await sleep(500);
    n = await names(); await sleep(200); st = await get();
    ok(tag + " existing 经济建设 save corrected", n[0] === "宠物成长" && n[1].includes("宠物成长") && !n[1].includes("经济建设"), JSON.stringify(n));
    if (shot) { await page.evaluate(() => { const e = document.getElementById("pet-top"); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 8); }); await sleep(500); await page.screenshot({ path: `${shot}_${path ? "en" : "vi"}_phone_name.png` }); }
    await page.click(".rename"); await sleep(200); await page.evaluate(() => { const i = document.querySelector(".rename-in"); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; set.call(i, ""); i.dispatchEvent(new Event("input", { bubbles: true })); });
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
