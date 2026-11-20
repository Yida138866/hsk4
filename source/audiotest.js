const puppeteer = require("puppeteer-core");
const base = process.argv[2]; const shot = process.argv[3] || "";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", headless: "new", args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"] });
  let fail = 0; const ok = (tag, c, extra = "") => { console.log(`${tag}: ${c ? "PASS" : "FAIL"} ${extra}`); if (!c) fail++; };
  for (const path of ["", "en/"]) for (const vp of [{ name: "phone", width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, { name: "desktop", width: 1366, height: 900 }]) {
    const tag = `${path || "vi/"} ${vp.name}`; const page = await browser.newPage(); await page.setViewport(vp);
    const errs = []; const reqs = [];
    page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errs.push(m.text()); });
    page.on("pageerror", (e) => errs.push("pageerror " + e.message));
    page.on("response", (r) => { const u = r.url(); if (/\/(music|audio)\//.test(u)) reqs.push(r.status() + " " + decodeURIComponent(u)); if (r.status() >= 400) errs.push("http " + r.status() + " " + u); });
    await page.goto(base + path, { waitUntil: "networkidle0" }); await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: "networkidle0" });
    const label = await page.$eval(".mbar button", (b) => b.textContent);
    ok(tag + " music off by default", /关|Off/.test(label) && reqs.filter((r) => r.includes("/music/")).length === 0, label);
    await page.click(".mbar button"); await sleep(2500);
    const playing = await page.evaluate(() => [...document.querySelectorAll(".mbar button")][0].textContent);
    ok(tag + " music on + track fetched", reqs.some((r) => /^(20[06]|304) .*music\/01\.mp3/.test(r)), playing + " | " + reqs.filter((r) => r.includes("music")).join(","));
    await page.click('.mbar button[aria-label="playlist"]'); await sleep(300);
    const items = await page.$$eval(".mpanel li", (l) => l.length); ok(tag + " playlist 30", items === 30, String(items));
    await page.evaluate(() => [...document.querySelectorAll(".mpanel button")].find((b) => b.textContent.includes("随机")).click()); await sleep(200);
    await page.click('.mpanel button[aria-label="next"]'); await sleep(1500);
    const st = await page.evaluate(() => JSON.parse(localStorage.getItem("hsk4-music-v1")));
    ok(tag + " shuffle+next saved", st.shuffle === true && typeof st.idx === "number", JSON.stringify(st));
    if (shot) await page.screenshot({ path: `${shot}_${path ? "en" : "vi"}_${vp.name}_player.png` });
    await page.click('.mbar button[aria-label="playlist"]'); await sleep(200);
    // flashcard speaker
    await page.evaluate(() => [...document.querySelectorAll("[role=tab]")].find((b) => b.textContent.startsWith("课程")).click()); await sleep(300);
    await page.evaluate(() => [...document.querySelectorAll("[role=tab]")].find((b) => b.textContent.startsWith("闪卡")).click()); await sleep(300);
    const n0 = reqs.length; await page.click('button[aria-label^="播放"]'); await sleep(1800);
    ok(tag + " flashcard audio", reqs.slice(n0).some((r) => /^(20[06]|304) .*audio\/w\/爱情\.mp3/.test(r)), reqs.slice(n0).join(","));
    if (shot) await page.screenshot({ path: `${shot}_${path ? "en" : "vi"}_${vp.name}_card.png` });
    // reader
    await page.evaluate(() => [...document.querySelectorAll("[role=tab]")].find((b) => b.textContent.startsWith("课文")).click()); await sleep(400);
    const n1 = reqs.length; await page.click('#reader-top article button[aria-label="Nghe cả bài"], #reader-top article button[aria-label="Play whole text"]'); await sleep(7000);
    const got = reqs.slice(n1).filter((r) => /audio\/t\/1_1_/.test(r));
    ok(tag + " reader play-all (sequential)", got.length >= 2, got.join(","));
    const n2 = reqs.length; await page.evaluate(() => document.querySelectorAll('#reader-top article button[aria-label="Nghe câu này"], #reader-top article button[aria-label="Play sentence"]')[2].click()); await sleep(1500);
    ok(tag + " reader sentence", reqs.slice(n2).some((r) => /audio\/t\/1_1_2\.mp3/.test(r)), reqs.slice(n2).join(","));
    if (shot) { await page.evaluate(() => { const e = document.querySelector("#reader-top article"); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 10); }); await sleep(400); await page.screenshot({ path: `${shot}_${path ? "en" : "vi"}_${vp.name}_reader_audio.png` }); }
    const ow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth); ok(tag + " no overflow", ow <= 0, String(ow));
    ok(tag + " console clean", errs.length === 0, errs.join(" | "));
    await page.close();
  }
  await browser.close(); console.log(fail ? `FAILURES ${fail}` : "ALL PASS"); process.exit(fail ? 1 : 0);
})();
