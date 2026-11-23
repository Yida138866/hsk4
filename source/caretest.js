const puppeteer = require("puppeteer-core");
const fs = require("fs");
const base = process.argv[2];
const shotDir = process.argv[3] || "";
const petSrc = fs.readFileSync(__dirname + "/pet_src/lines.txt", "utf8").trim().split("\n").filter(Boolean);
const petAu = (k) => petSrc.map((l, i) => [l.split("|")[0], i]).filter((x) => x[0] === k).map((x) => x[1]);
const FED_AU = new RegExp("audio/pet/(" + [...petAu("fed"), ...petAu("full")].join("|") + ")\\.mp3");
const CLEAN_AU = new RegExp("audio/pet/(" + petAu("clean").join("|") + ")\\.mp3");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ds = (off = 0) => { const d = new Date(); d.setDate(d.getDate() + off); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

(async () => {
  const browser = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", headless: "new", args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"] });
  let fail = 0;
  const ok = (tag, c, extra = "") => { console.log(`${tag}: ${c ? "PASS" : "FAIL"} ${extra}`); if (!c) fail++; };

  for (const path of ["", "en/"]) for (const vp of [{ name: "phone", width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, { name: "desktop", width: 1366, height: 900 }]) {
    const tag = `${path || "vi/"} ${vp.name}`;
    const EN = !!path;
    const page = await browser.newPage();
    await page.setViewport(vp); await page.setCacheEnabled(false);
    const errs = [];
    const reqs = [];
    page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
    page.on("pageerror", (e) => errs.push("pageerror " + e.message));
    page.on("response", (r) => { if (/\/audio\//.test(r.url())) reqs.push(r.status() + " " + r.url()); if (r.status() >= 400) errs.push("http " + r.status() + " " + r.url()); });

    const get = () => page.evaluate(() => JSON.parse(localStorage.getItem("hsk4-pet-v1") || "null"));
    const click = async (sel, prefix) => {
      const f = await page.evaluate((sel, prefix) => {
        const el = [...document.querySelectorAll(sel)].find((b) => b.textContent.trim().includes(prefix));
        if (el) { el.click(); return true; }
        return false;
      }, sel, prefix);
      if (!f) throw new Error("not found " + prefix);
      await sleep(250);
    };
    const scrollTo = async (sel, off = 8) => { await page.evaluate((sel, off) => { const e = document.querySelector(sel); if (e) window.scrollTo(0, e.getBoundingClientRect().top + scrollY - off); }, sel, off); await sleep(400); };

    // 1. Pre-care save migration -> starts full and clean
    await page.goto(base + path, { waitUntil: "networkidle0" });
    await page.evaluate((d0) => {
      localStorage.clear();
      localStorage.setItem("hsk4-pet-v1", JSON.stringify({
        v: 2, pet: "bunny", name: "Bông", xp: 350, stars: 20, hearts: 5, happy: 75,
        owned: [], equip: { furn: [] }, lessons: [1, 2], ready: false, best: -1,
        day: d0, dayXp: 0, claims: {}, streak: 2, maxStreak: 2, lastDay: d0,
        stats: { cards: 0, listen: 0, quiz100: 0, quiz: 0, rtest: 0, fed: 0, tasks: 0, checkins: 0, pq: 0, pq5: 0 },
        gifts: [], stage: 2, born: 1000, minStage: 0, ciLast: "", ciStreak: 0, ciMax: 0, ciDays: [], pq: null, grads: [], gradDone: false, gradDate: "", earned: [], wb: {}, wbCleared: 0, lastPass: null, evXp: {}, cardName: "", cardClass: ""
      }));
    }, ds(0));
    await page.reload({ waitUntil: "networkidle0" });
    await page.click(".pet-widget");
    await sleep(500);
    let st = await get();
    ok(tag + " existing pet migrates full & clean", st.hunger === 100 && st.clean === 100 && st.poop === 0 && st.dirty === false && st.bag && st.bag.rice >= 1, JSON.stringify({ h: st.hunger, c: st.clean, p: st.poop, d: st.dirty, b: st.bag }));

    // Status bars rendered (饱食 / 清洁 / 心情)
    const barsTxt = await page.$eval(".care-bars", (e) => e.textContent);
    ok(tag + " status bars visible", /饱食/.test(barsTxt) && /清洁/.test(barsTxt) && /心情/.test(barsTxt), barsTxt);
    ok(tag + " overfeeding blocked at 100 (bag buttons disabled)", await page.$eval(".care-feed-rice", (b) => b.disabled));

    // Screenshot 1: status bars (on vi phone)
    if (!EN && vp.name === "phone" && shotDir) {
      await scrollTo(".care-bars", 70);
      await page.screenshot({ path: `${shotDir}/pt92u_bars_390.png` });
    }

    // 2. Egg immunity: stage 0 with 30h old timestamp does NOT decay
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem("hsk4-pet-v1"));
      s.xp = 0; s.stage = 0; s.minStage = 0; s.careAt = Date.now() - 30 * 3600 * 1000;
      localStorage.setItem("hsk4-pet-v1", JSON.stringify(s));
    });
    await page.reload({ waitUntil: "networkidle0" });
    st = await get();
    ok(tag + " egg does not decay hunger/clean/poop", st.hunger === 100 && st.clean === 100 && st.poop === 0 && !st.dirty);

    // 3. Time-skip test (hatched stage 2): 14h -> -28 hunger, >=2 poop, clean drops
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem("hsk4-pet-v1"));
      s.xp = 350; s.stage = 2; s.hunger = 100; s.clean = 100; s.poop = 0; s.dirty = false;
      s.poopIn = 360; s.careAt = Date.now() - 14 * 3600 * 1000;
      localStorage.setItem("hsk4-pet-v1", JSON.stringify(s));
    });
    await page.reload({ waitUntil: "networkidle0" });
    st = await get();
    ok(tag + " 14h time-skip decays hunger (-2/hr = 72) & spawns poop", st.hunger === 72 && st.poop === 2 && st.clean < 85 && st.stage === 2, `h=${st.hunger} p=${st.poop} c=${st.clean}`);

    // Time-skip 200h cap: clamped at 0..100, poop max 3, dirty true, never drops stage or dies
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem("hsk4-pet-v1"));
      s.careAt = Date.now() - 200 * 3600 * 1000;
      localStorage.setItem("hsk4-pet-v1", JSON.stringify(s));
    });
    await page.reload({ waitUntil: "networkidle0" });
    st = await get();
    ok(tag + " 200h time-skip capped & safe (no death/demotion)", st.hunger === 0 && st.clean >= 0 && st.poop === 3 && st.dirty === true && st.stage === 2, `h=${st.hunger} c=${st.clean} p=${st.poop} d=${st.dirty}`);

    // Mini pet attention badge visible before cleaning/feeding
    const badge = await page.$eval(".pet-widget .widget-care", (e) => e.textContent);
    ok(tag + " mini pet attention badge shown", badge === "💩", badge);
    if (!EN && vp.name === "phone" && shotDir) {
      await page.screenshot({ path: `${shotDir}/pt92u_mini_badge_390.png` });
    }

    // 4. Soft XP multiplier when neglected (task normally +10 -> +9 at 0.85x)
    await page.evaluate(() => {
      localStorage.removeItem("hsk4-plan-vi-v1");
      localStorage.removeItem("hsk4-plan-v1");
      const s = JSON.parse(localStorage.getItem("hsk4-pet-v1"));
      s.xp = 350; s.dayXp = 0; s.claims = {}; s.bag = { rice: 1, milk: 1, cake: 1 };
      localStorage.setItem("hsk4-pet-v1", JSON.stringify(s));
    });
    await page.reload({ waitUntil: "networkidle0" });
    await click("[role=tab]", "学习计划");
    await click("button", "标记完成");
    await sleep(400);
    st = await get();
    ok(tag + " neglect gives mild 0.85x XP & still awards food", st.xp === 359 && st.bag.rice === 2, `xp=${st.xp} rice=${st.bag.rice}`);

    // 5. Open pet page: poop on screen, mud spots, feed, clean poop, bath
    await page.click(".pet-widget");
    await sleep(500);
    await scrollTo("#pet-top");
    const poopBtns = await page.$$(".pet-poop");
    ok(tag + " 3 cartoon poops rendered on screen", poopBtns.length === 3, String(poopBtns.length));
    ok(tag + " mud spots rendered when dirty", (await page.$(".pet-mud")) !== null);

    if (!EN && vp.name === "phone" && shotDir) {
      await page.screenshot({ path: `${shotDir}/pt92u_poop_390.png` });
    }

    // Feed rice (+15%), milk (+25%), cake (+40%) -> 0 -> 15 -> 40 -> 80, crumbs + eat anim + audio
    const nEat0 = reqs.length;
    await scrollTo("#pet-top");
    await page.evaluate(() => document.querySelector(".care-feed-rice").click());
    await sleep(260);
    const eatAnim = await page.evaluate(() => {
      const m = document.querySelector(".pet-stage-box .pet-move");
      return { act: m && m.getAttribute("data-pet-act"), crumbs: document.querySelectorAll(".pet-stage-box .pet-fx-crumbs .pet-fx-bit").length };
    });
    if (!EN && vp.name === "phone" && shotDir) {
      await page.screenshot({ path: `${shotDir}/pt92u_feeding_390.png` });
    }
    await sleep(500);
    await page.click(".care-feed-milk");
    await sleep(300);
    await page.click(".care-feed-cake");
    await sleep(400);
    st = await get();
    ok(tag + " feeding rice+milk+cake updates hunger & bag + eat anim + audio",
      st.hunger === 80 && st.bag.rice === 1 && st.bag.milk === 0 && st.bag.cake === 0 && eatAnim.act === "eat" && eatAnim.crumbs === 4 && reqs.slice(nEat0).some((r) => FED_AU.test(r)),
      `h=${st.hunger} act=${eatAnim.act} au=${reqs.slice(nEat0).join(",")}`);

    // Tap 1 poop to clean -> poop 3->2 + clean audio
    const nClean0 = reqs.length;
    await page.click(".pet-poop");
    await sleep(450);
    st = await get();
    ok(tag + " tapping poop cleans 1 + plays clean audio", st.poop === 2 && reqs.slice(nClean0).some((r) => CLEAN_AU.test(r)), `poop=${st.poop}`);

    // Broom button cleans remaining poops
    await page.click(".care-clean");
    await sleep(450);
    st = await get();
    ok(tag + " broom button cleans all remaining poops", st.poop === 0 && (await page.$$(".pet-poop")).length === 0, `poop=${st.poop}`);

    // Bath button washes mud spots + bubble anim + clean audio
    const nBath0 = reqs.length;
    await scrollTo("#pet-top");
    await page.evaluate(() => document.querySelector(".care-bath").click());
    await sleep(280);
    const bathAnim = await page.evaluate(() => {
      const m = document.querySelector(".pet-stage-box .pet-move");
      return { act: m && m.getAttribute("data-pet-act"), bubs: document.querySelectorAll(".pet-stage-box .pet-fx-bubbles .pet-fx-bit").length };
    });
    if (!EN && vp.name === "phone" && shotDir) {
      await page.screenshot({ path: `${shotDir}/pt92u_dirty_bath_390.png` });
    }
    await sleep(450);
    st = await get();
    ok(tag + " bath cleans mud, sets clean=100, plays bubbles & audio",
      !st.dirty && st.clean === 100 && bathAnim.act === "bath" && bathAnim.bubs === 5 && reqs.slice(nBath0).some((r) => CLEAN_AU.test(r)),
      `dirty=${st.dirty} clean=${st.clean} act=${bathAnim.act}`);

    // Mini pet badge gone after care (feed to 100 first)
    await page.evaluate(() => { const s = JSON.parse(localStorage.getItem("hsk4-pet-v1")); s.hunger = 100; localStorage.setItem("hsk4-pet-v1", JSON.stringify(s)); });
    await page.reload({ waitUntil: "networkidle0" });
    ok(tag + " mini pet attention badge clears when cared for", (await page.$(".pet-widget .widget-care")) === null);

    // 6. HSK4PET1 export/import with care state + backward compatibility with old code
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem("hsk4-pet-v1"));
      s.hunger = 55; s.clean = 80; s.poop = 1; s.dirty = true; s.bag = { rice: 3, milk: 2, cake: 1 };
      localStorage.setItem("hsk4-pet-v1", JSON.stringify(s));
    });
    await page.reload({ waitUntil: "networkidle0" });
    await page.click(".pet-widget");
    await sleep(400);
    await click("#pet-top button", EN ? "Export code" : "Xuất mã");
    await sleep(200);
    const code = await page.evaluate(() => [...document.querySelectorAll("#pet-top textarea")].map((t) => t.value).find((v) => v.startsWith("HSK4PET1:")));
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle0" });
    await page.click(".pet-widget");
    await sleep(300);
    await page.evaluate((c) => { const ta = document.querySelector("#pet-top textarea"); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set.call(ta, c); ta.dispatchEvent(new Event("input", { bubbles: true })); }, code);
    await click("#pet-top button", EN ? "Import code" : "Nhập mã");
    await sleep(1400);
    st = await get();
    ok(tag + " HSK4PET1 preserves care state", st.hunger === 55 && st.poop === 1 && st.dirty === true && st.bag.cake === 1, JSON.stringify({ h: st.hunger, p: st.poop, d: st.dirty, b: st.bag }));

    // Backward-compatible old HSK4PET1 code (without care fields)
    const oldCode = "HSK4PET1:" + Buffer.from(JSON.stringify({ "hsk4-pet-v1": JSON.stringify({ v: 2, pet: "kitten", name: "Mimi", xp: 100, stars: 5, hearts: 1, happy: 80, owned: [], equip: { furn: [] }, lessons: [], ready: false, best: -1, day: ds(0), dayXp: 0, claims: {}, streak: 1, maxStreak: 1, lastDay: ds(0), stats: { cards: 0, listen: 0, quiz100: 0, quiz: 0, rtest: 0, fed: 0, tasks: 0, checkins: 0, pq: 0, pq5: 0 }, gifts: [], stage: 1, born: 1, minStage: 0, ciLast: "", ciStreak: 0, ciMax: 0, ciDays: [], pq: null, grads: [], gradDone: false, gradDate: "", earned: [], wb: {}, wbCleared: 0, lastPass: null, evXp: {}, cardName: "", cardClass: "" }) })).toString("base64");
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle0" });
    await page.click(".pet-widget");
    await sleep(300);
    await page.evaluate((c) => { const ta = document.querySelector("#pet-top textarea"); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set.call(ta, c); ta.dispatchEvent(new Event("input", { bubbles: true })); }, oldCode);
    await click("#pet-top button", EN ? "Import code" : "Nhập mã");
    await sleep(1400);
    st = await get();
    ok(tag + " old HSK4PET1 code imports full & clean", st.name === "Mimi" && st.hunger === 100 && st.clean === 100 && st.poop === 0 && !st.dirty);

    // 7. Reduced motion respected
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    await page.evaluate(() => { const s = JSON.parse(localStorage.getItem("hsk4-pet-v1")); s.hunger = 60; s.bag = { rice: 2, milk: 0, cake: 0 }; localStorage.setItem("hsk4-pet-v1", JSON.stringify(s)); });
    await page.reload({ waitUntil: "networkidle0" });
    await page.click(".pet-widget");
    await sleep(300);
    await page.click(".care-feed-rice");
    await sleep(200);
    const rmAnim = await page.evaluate(() => {
      const m = document.querySelector(".pet-move");
      const cs = getComputedStyle(document.querySelector(".pet-bounce") || m);
      return { act: m && m.getAttribute("data-pet-act"), animName: cs.animationName };
    });
    ok(tag + " prefers-reduced-motion disables animations", rmAnim.act === "idle" && rmAnim.animName === "none", JSON.stringify(rmAnim));

    const ow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    ok(tag + " no horizontal overflow", ow <= 0, String(ow));
    ok(tag + " console clean", errs.length === 0, errs.join(" | "));
    await page.close();
  }

  await browser.close();
  console.log(fail ? `FAILURES ${fail}` : "ALL PASS");
  process.exit(fail ? 1 : 0);
})();
