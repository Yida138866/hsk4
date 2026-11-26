const puppeteer = require("puppeteer-core");
const base = process.argv[2] || "http://127.0.0.1:8765/";
const shotDir = "/workspace/hsk4/shots";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const FXS = ["fireworks", "hearts", "stars"];

(async () => {
  const browser = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", headless: "new", args: ["--no-sandbox"] });
  let fail = 0;
  const ok = (tag, c, extra = "") => { console.log(`${tag}: ${c ? "PASS" : "FAIL"} ${extra}`); if (!c) fail++; };

  const solve10 = async (page) => {
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find((b) => b.textContent.trim().startsWith("交卷"));
      if (btn) btn.click();
    });
    await sleep(150);
    const nonPerf = await page.evaluate(() => !!document.querySelector(".celeb-overlay"));
    const picks = await page.evaluate(() => {
      const btns = [...document.querySelectorAll("button")].filter((b) => b.textContent.includes("← 正确答案"));
      return btns.map((b) => [...b.parentElement.querySelectorAll("button")].indexOf(b));
    });
    if (picks.length !== 10 || picks.some((i) => i < 0)) throw new Error("Expected 10 right indices, got " + JSON.stringify(picks));
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find((b) => b.textContent.trim().startsWith("重做本套"));
      if (btn) btn.click();
    });
    await sleep(150);
    await page.evaluate((picks) => {
      const grids = [...document.querySelectorAll("button")]
        .filter((b) => /^[A-D]\s{2}/.test(b.textContent.trim()))
        .reduce((acc, b) => {
          const g = b.parentElement;
          if (!acc.includes(g)) acc.push(g);
          return acc;
        }, []);
      if (grids.length !== 10) throw new Error("Expected 10 question option grids, got " + grids.length);
      grids.forEach((g, qi) => g.querySelectorAll("button")[picks[qi]].click());
    }, picks);
    await sleep(150);
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find((b) => b.textContent.trim().startsWith("交卷"));
      if (btn) btn.click();
    });
    return { nonPerf };
  };

  for (const path of ["", "en/"]) {
    const EN = !!path;
    const L = EN ? "en" : "vi";
    for (const fx of FXS) {
      const page = await browser.newPage();
      await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
      const errs = [];
      page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
      page.on("pageerror", (e) => errs.push("pageerror " + e.message));
      await page.goto(`${base}${path}?fx=${fx}`, { waitUntil: "networkidle0" });
      await page.evaluate(() => {
        const seg = [...document.querySelectorAll("button")].find((b) => b.textContent.includes("每课小测"));
        if (seg) seg.click();
      });
      await sleep(250);

      const { nonPerf } = await solve10(page, EN);
      ok(`${L} ${fx} no celebration on 0/10`, !nonPerf);

      await sleep(fx === "fireworks" ? 720 : 1000);
      const info = await page.evaluate(() => {
        const el = document.querySelector(".celeb-overlay");
        if (!el) return null;
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          fx: el.getAttribute("data-fx"),
          pe: cs.pointerEvents,
          pos: cs.position,
          w: Math.round(r.width),
          h: Math.round(r.height),
          ow: document.documentElement.scrollWidth - window.innerWidth,
          scoreTxt: document.body.innerText.includes("10 / 10"),
        };
      });
      ok(`${L} ${fx} overlay active 10/10`, !!info && info.fx === fx && info.pe === "none" && info.pos === "fixed" && info.w === 390 && info.h === 844 && info.ow === 0 && info.scoreTxt, JSON.stringify(info));
      if (!EN) await page.screenshot({ path: `${shotDir}/celeb_${fx}.png` });

      // Wait for auto-fade unmount (~3.7s total)
      await sleep(3100);
      const gone = await page.evaluate(() => !document.querySelector(".celeb-overlay"));
      ok(`${L} ${fx} auto-fades & unmounts`, gone);

      // Re-trigger via 换一套题
      if (!EN && fx === "fireworks") {
        await page.evaluate(() => {
          const btn = [...document.querySelectorAll("button")].find((b) => b.textContent.trim().startsWith("换一套题"));
          if (btn) btn.click();
        });
        await sleep(200);
        await solve10(page, EN);
        await sleep(500);
        const re = await page.evaluate(() => ({ has: !!document.querySelector(".celeb-overlay"), txt: document.body.innerText.match(/得分[^\n]*/)?.[0] || "" }));
        ok(`${L} re-triggers after 换一套题`, re.has, re.txt);
      }

      ok(`${L} ${fx} console clean`, errs.length === 0, errs.join(" | "));
      await page.close();
    }
  }

  // Test random mode (no ?fx=) and prefers-reduced-motion
  const p2 = await browser.newPage();
  await p2.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p2.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await p2.goto(base, { waitUntil: "networkidle0" });
  await p2.evaluate(() => {
    const seg = [...document.querySelectorAll("button")].find((b) => b.textContent.includes("每课小测"));
    if (seg) seg.click();
  });
  await sleep(250);
  await solve10(p2, false);
  await sleep(400);
  const red = await p2.evaluate(() => {
    const el = document.querySelector(".celeb-overlay");
    if (!el) return null;
    return { fx: el.getAttribute("data-fx"), anim: getComputedStyle(el).animationName };
  });
  ok("random fx & reduced-motion gentle", !!red && ["fireworks", "hearts", "stars"].includes(red.fx) && red.anim === "none", JSON.stringify(red));
  await sleep(2400);
  ok("reduced-motion unmounts", await p2.evaluate(() => !document.querySelector(".celeb-overlay")));
  await p2.close();

  await browser.close();
  console.log(fail ? `FAIL=${fail}` : "ALL PASS");
  process.exit(fail ? 1 : 0);
})();
