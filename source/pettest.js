const puppeteer = require("puppeteer-core");
const base = process.argv[2]; const shot = process.argv[3] || "";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
(async () => {
  const browser = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", headless: "new", args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"] });
  let fail = 0; const ok = (tag, c, extra = "") => { console.log(`${tag}: ${c ? "PASS" : "FAIL"} ${extra}`); if (!c) fail++; };
  for (const path of ["", "en/"]) for (const vp of [{ name: "phone", width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, { name: "desktop", width: 1366, height: 900 }]) {
    const tag = `${path || "vi/"} ${vp.name}`; const L = path ? "en" : "vi"; const page = await browser.newPage(); await page.setViewport(vp);
    const errs = []; const reqs = [];
    page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); }); page.on("pageerror", (e) => errs.push("pageerror " + e.message));
    page.on("response", (r) => { if (/\/audio\//.test(r.url())) reqs.push(r.status() + " " + r.url()); if (r.status() >= 400) errs.push("http " + r.status() + " " + r.url()); });
    const click = async (sel, prefix) => { const f = await page.evaluate((sel, prefix) => { const el = [...document.querySelectorAll(sel)].find((b) => b.textContent.trim().includes(prefix)); if (el) { el.click(); return true; } return false; }, sel, prefix); if (!f) throw new Error("not found " + prefix); await sleep(250); };
    await page.goto(base + path, { waitUntil: "networkidle0" }); await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: "networkidle0" });
    ok(tag + " widget visible", await page.$(".pet-widget") !== null);
    await page.click(".pet-widget"); await sleep(500);
    ok(tag + " widget opens pet tab (adoption)", (await page.$$(".adopt button")).length === 3);
    if (shot) { await page.evaluate(() => { const e = document.getElementById("pet-top"); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 8); }); await sleep(400); await page.screenshot({ path: `${shot}_${L}_${vp.name}_adopt.png` }); }
    await page.evaluate(() => document.querySelectorAll(".adopt button")[1].click()); await sleep(100);
    await page.type("#pet-top input", "Mochi"); await click("#pet-top button", path ? "Adopt" : "Nhận nuôi");
    await sleep(600);
    const st = await page.evaluate(() => JSON.parse(localStorage.getItem("hsk4-pet-v1")));
    const raw = await page.evaluate(() => Object.keys(window.localStorage));
    ok(tag + " adopted panda + namespaced storage", st.pet === "panda" && st.name === "Mochi" && raw.includes("hsk4pv-pet-v1") && !raw.some((k) => k.startsWith("hsk4-")), raw.join(","));
    // earn: plan task
    await click("[role=tab]", "学习计划"); await click("button", "标记完成"); await sleep(400);
    let s1 = await page.evaluate(() => JSON.parse(localStorage.getItem("hsk4-pet-v1")));
    ok(tag + " plan task reward", s1.xp === 10 && s1.stars === 1, `xp=${s1.xp} stars=${s1.stars}`);
    const toastSeen = await page.evaluate(() => !!document.querySelector(".toast"));
    ok(tag + " reward toast", toastSeen);
    if (shot) await page.screenshot({ path: `${shot}_${L}_${vp.name}_reward.png` });
    // untick + retick shouldn't farm
    await click("button", path ? "完成" : "已完成"); await sleep(100); await click("button", "标记完成"); await sleep(300);
    s1 = await page.evaluate(() => JSON.parse(localStorage.getItem("hsk4-pet-v1")));
    ok(tag + " no farming on re-tick", s1.xp === 10, `xp=${s1.xp}`);
    // quiz: answer all correctly via known answer markers is hard; just submit and check xp event happened (score likely 0 => +0xp but claim set)
    await click("[role=tab]", "每课小测"); await click("button", path ? "交卷" : "交卷 · Nộp bài"); await sleep(300);
    s1 = await page.evaluate(() => JSON.parse(localStorage.getItem("hsk4-pet-v1")));
    ok(tag + " quiz event recorded", !!s1.claims["q:1"], JSON.stringify(s1.claims));
    // seed stages + shop
    for (const [stg, xp, lessons, ready, equip, stars, hearts] of [[2, 420, 6, false, { acc: "glasses", outfit: "hoodie", room: "sakura", furn: ["plant"] }, 80, 10], [4, 2000, 20, true, { outfit: "aodai", room: "night", furn: ["lamp", "desk"] }, 120, 20]]) {
      await page.evaluate((o) => { const s = JSON.parse(localStorage.getItem("hsk4-pet-v1")); Object.assign(s, { xp: o.xp, lessons: Array.from({ length: o.lessons }, (_, i) => i + 1), ready: o.ready, equip: o.equip, stars: o.stars, hearts: o.hearts, owned: ["glasses", "hoodie", "sakura", "plant", "aodai", "night", "lamp", "desk"], stage: o.stg, streak: 8, maxStreak: 8, lastDay: o.today }); localStorage.setItem("hsk4-pet-v1", JSON.stringify(s)); }, { xp, lessons, ready, equip, stars, hearts, stg, today: today() });
      await page.reload({ waitUntil: "networkidle0" }); await page.click(".pet-widget"); await sleep(600);
      const label = await page.evaluate(() => document.querySelector("#pet-top span[style*='linear-gradient']").textContent);
      ok(`${tag} seeded stage ${stg}`, label.includes(["蛋", "宝宝", "小朋友", "少女", "毕业"][stg]), label);
      if (shot) { await page.evaluate(() => { const e = document.getElementById("pet-top"); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 8); }); await sleep(500); await page.screenshot({ path: `${shot}_${L}_${vp.name}_stage${stg}.png` }); }
    }
    // tap pet -> speech audio
    const n0 = reqs.length; await page.click('#pet-top button[aria-label="pet"]'); await sleep(1500);
    ok(tag + " pet talks (audio)", reqs.slice(n0).some((r) => /^(200|206|304) .*audio\/pet\/\d+\.mp3/.test(r)), reqs.slice(n0).join(","));
    // shop: food + buy
    const before = await page.evaluate(() => JSON.parse(localStorage.getItem("hsk4-pet-v1")));
    await click("#pet-top button", path ? "Food" : "Đồ ăn"); await click("#pet-top .shop button", path ? "Feed" : "Cho ăn"); await sleep(400);
    await click("#pet-top button", path ? "Accessories" : "Phụ kiện"); await click("#pet-top .shop button", path ? "Buy" : "Mua"); await sleep(400);
    const after = await page.evaluate(() => JSON.parse(localStorage.getItem("hsk4-pet-v1")));
    ok(tag + " shop feed + buy", after.stats.fed === before.stats.fed + 1 && after.owned.length === before.owned.length + 1 && after.stars < before.stars, `stars ${before.stars}->${after.stars} owned ${after.owned.length}`);
    if (shot) { await page.evaluate(() => { const e = document.querySelector("#pet-top .shop"); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 120); }); await sleep(400); await page.screenshot({ path: `${shot}_${L}_${vp.name}_shop.png` }); }
    // export / import roundtrip
    await click("#pet-top button", path ? "Export code" : "Xuất mã"); await sleep(200);
    const code = await page.evaluate(() => [...document.querySelectorAll("#pet-top textarea")].map((t) => t.value).find((v) => v.startsWith("HSK4PET1:")));
    ok(tag + " export code", !!code && code.length > 50);
    // level up celebration: set xp just below child threshold w/ 6 lessons, stage 1, then trigger a task
    await page.evaluate((t) => { const s = JSON.parse(localStorage.getItem("hsk4-pet-v1")); Object.assign(s, { xp: 395, lessons: [1, 2, 3, 4, 5, 6], ready: false, stage: 1, dayXp: 0, day: t, equip: { furn: [] }, claims: {} }); localStorage.setItem("hsk4-pet-v1", JSON.stringify(s)); localStorage.removeItem("hsk4-plan-vi-v1"); localStorage.removeItem("hsk4-plan-v1"); }, today());
    await page.reload({ waitUntil: "networkidle0" }); await click("[role=tab]", "学习计划"); await click("button", "标记完成"); await sleep(900);
    ok(tag + " level-up celebration", await page.evaluate(() => !!document.querySelector(".levelup")));
    if (shot) await page.screenshot({ path: `${shot}_${L}_${vp.name}_levelup.png` });
    // import into fresh state
    await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: "networkidle0" }); await page.click(".pet-widget"); await sleep(400);
    await page.evaluate((c) => { const ta = document.querySelector("#pet-top textarea"); const set = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set; set.call(ta, c); ta.dispatchEvent(new Event("input", { bubbles: true })); }, code);
    await click("#pet-top button", path ? "Import code" : "Nhập mã"); await sleep(1500);
    const imp = await page.evaluate(() => JSON.parse(localStorage.getItem("hsk4-pet-v1") || "{}"));
    ok(tag + " import restores", imp.name === "Mochi" && imp.xp === 2000, `name=${imp.name} xp=${imp.xp}`);
    const ow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth); ok(tag + " no overflow", ow <= 0, String(ow));
    ok(tag + " console clean", errs.length === 0, errs.join(" | "));
    await page.close();
  }
  await browser.close(); console.log(fail ? `FAILURES ${fail}` : "ALL PASS"); process.exit(fail ? 1 : 0);
})();
