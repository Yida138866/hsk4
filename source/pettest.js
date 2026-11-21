const puppeteer = require("puppeteer-core");
const base = process.argv[2]; const shot = process.argv[3] || "";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ds = (off = 0) => { const d = new Date(); d.setDate(d.getDate() + off); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const ALL = ["bow", "glasses", "beret", "crown", "scarf", "hoodie", "dress", "aodai", "sakura", "beach", "night", "plant", "lamp", "desk"];
(async () => {
  const browser = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", headless: "new", args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"] });
  let fail = 0; const ok = (tag, c, extra = "") => { console.log(`${tag}: ${c ? "PASS" : "FAIL"} ${extra}`); if (!c) fail++; };
  for (const path of ["", "en/"]) for (const vp of [{ name: "phone", width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, { name: "desktop", width: 1366, height: 900 }]) {
    const tag = `${path || "vi/"} ${vp.name}`; const L = path ? "en" : "vi"; const EN = !!path; const page = await browser.newPage(); await page.setViewport(vp);
    const errs = []; const reqs = [];
    page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); }); page.on("pageerror", (e) => errs.push("pageerror " + e.message));
    page.on("response", (r) => { if (/\/audio\//.test(r.url())) reqs.push(r.status() + " " + r.url()); if (r.status() >= 400) errs.push("http " + r.status() + " " + r.url()); });
    const click = async (sel, prefix) => { const f = await page.evaluate((sel, prefix) => { const el = [...document.querySelectorAll(sel)].find((b) => b.textContent.trim().includes(prefix)); if (el) { el.click(); return true; } return false; }, sel, prefix); if (!f) throw new Error("not found " + prefix); await sleep(250); };
    const get = () => page.evaluate(() => JSON.parse(localStorage.getItem("hsk4-pet-v1") || "null"));
    const seed = async (o) => { await page.evaluate((o) => { const s = JSON.parse(localStorage.getItem("hsk4-pet-v1")); Object.assign(s, o); localStorage.setItem("hsk4-pet-v1", JSON.stringify(s)); }, o); await page.reload({ waitUntil: "networkidle0" }); await page.click(".pet-widget"); await sleep(600); };
    const scrollTo = async (sel, off = 8) => { await page.evaluate((sel, off) => { const e = document.querySelector(sel); if (e) window.scrollTo(0, e.getBoundingClientRect().top + scrollY - off); }, sel, off); await sleep(450); };
    const snap = async (n) => { if (shot) await page.screenshot({ path: `${shot}_${L}_${vp.name}_${n}.png` }); };
    await page.goto(base + path, { waitUntil: "networkidle0" }); await page.evaluate(() => localStorage.clear());
    await page.evaluate(() => {
      const planKey = /\/en\/?/.test(location.pathname) ? "hsk4-plan-v1" : "hsk4-plan-vi-v1";
      localStorage.setItem(planKey, JSON.stringify({ "0-0": true, "0-1": true, "0-2": true, "1-0": true }));
      localStorage.setItem("hsk4-rtest-history-v1", JSON.stringify([{ t: 1730000000000, score: 18, n: 30, byType: {}, weak: [] }]));
      localStorage.setItem("hsk4-music-v1", JSON.stringify({ loop: true, shuffle: false, idx: 3, vol: 0.4 }));
      localStorage.setItem("hsk4-reader-v1", JSON.stringify({ l: 7, py: false, tr: true, size: 26 }));
    });
    await page.reload({ waitUntil: "networkidle0" });
    ok(tag + " official (no preview badge/title)", await page.evaluate(() => !document.title.includes("预览") && !document.querySelector(".pv-badge")));
    const migrated = await page.evaluate(() => ({
      plan: document.body.innerText.includes("已完成 4 /"),
      music: JSON.parse(localStorage.getItem("hsk4-music-v1") || "null"),
      reader: JSON.parse(localStorage.getItem("hsk4-reader-v1") || "null"),
      hist: JSON.parse(localStorage.getItem("hsk4-rtest-history-v1") || "[]"),
      pet: localStorage.getItem("hsk4-pet-v1"),
      pv: Object.keys(localStorage).some((k) => k.startsWith("hsk4pv-")),
    }));
    ok(tag + " existing main-site save kept (plan/test/music/reader, no pet yet)", migrated.plan && migrated.music && migrated.music.idx === 3 && migrated.music.vol === 0.4 && migrated.reader && migrated.reader.l === 7 && migrated.hist[0] && migrated.hist[0].score === 18 && !migrated.pet && !migrated.pv, JSON.stringify(migrated));
    ok(tag + " widget visible", await page.$(".pet-widget") !== null);
    await page.click(".pet-widget"); await sleep(500);
    const names = await page.evaluate(() => [...document.querySelectorAll(".adopt button")].map((b) => b.textContent));
    ok(tag + " picker has 6 pets", names.length === 6 && ["小兔子", "小熊猫", "小灰猫", "小老虎", "小龙", "小狗"].every((n, i) => names[i].includes(n)), names.join("|"));
    await scrollTo("#pet-top"); await snap("picker");
    await page.evaluate(() => document.querySelectorAll(".adopt button")[1].click()); await sleep(100);
    await page.type("#pet-top input", "Mochi"); await page.click(".adopt-go"); await sleep(600);
    let st = await get(); const raw = await page.evaluate(() => Object.keys(window.localStorage));
    const planKey = EN ? "hsk4-plan-v1" : "hsk4-plan-vi-v1";
    ok(tag + " adopted 小熊猫 + v2 on main hsk4- keys", st.pet === "panda" && st.v === 2 && raw.includes("hsk4-pet-v1") && raw.includes(planKey) && raw.includes("hsk4-music-v1") && raw.includes("hsk4-reader-v1") && raw.includes("hsk4-rtest-history-v1") && !raw.some((k) => k.startsWith("hsk4pv-")), raw.join(","));
    await click("[role=tab]", "学习计划");
    ok(tag + " plan progress still 4/70 after adopt", (await page.evaluate(() => document.body.innerText)).includes("已完成 4 /"));
    await page.click(".pet-widget"); await sleep(400);
    // check-in day 1
    await scrollTo(".checkin", 80); await page.click(".ci-btn"); await sleep(700);
    st = await get(); ok(tag + " check-in day1 +10XP +1⭐", st.xp === 10 && st.stars === 1 && st.ciStreak === 1 && st.ciLast === ds(0), `xp=${st.xp} s=${st.stars}`);
    ok(tag + " check-in once per day", await page.$(".ci-btn") === null);
    await snap("checkin");
    // escalation: yesterday streak 3 -> day 4 = +15/+2
    await seed({ ciLast: ds(-1), ciStreak: 3, xp: 0, stars: 0 }); await page.click(".ci-btn"); await sleep(500); st = await get();
    ok(tag + " check-in day4 +15 +2⭐", st.xp === 15 && st.stars === 2 && st.ciStreak === 4, `xp=${st.xp}`);
    await seed({ ciLast: ds(-1), ciStreak: 6, xp: 0, stars: 0 }); await page.click(".ci-btn"); await sleep(500); st = await get();
    ok(tag + " check-in day7 +20 +3⭐ (+gift 10⭐)", st.xp === 20 && st.stars === 13 && st.gifts.includes("s7") && st.owned.includes("bow"), `xp=${st.xp} s=${st.stars}`);
    await seed({ ciLast: ds(-1), ciStreak: 12, xp: 0, stars: 0 }); await page.click(".ci-btn"); await sleep(500); st = await get();
    ok(tag + " check-in day13 capped at +20", st.xp === 20 && st.stars === 3, `xp=${st.xp}`);
    await seed({ ciLast: ds(-2), ciStreak: 9, xp: 0, stars: 0 }); await page.click(".ci-btn"); await sleep(500); st = await get();
    ok(tag + " missed day resets to day1 (+10)", st.xp === 10 && st.ciStreak === 1, `xp=${st.xp} streak=${st.ciStreak}`);
    // study cap separate: dayXp 60 then check-in still pays
    await seed({ ciLast: ds(-1), ciStreak: 1, xp: 0, stars: 0, day: ds(0), dayXp: 60 }); await page.click(".ci-btn"); await sleep(500); st = await get();
    ok(tag + " check-in outside study cap", st.xp === 10 && st.dayXp === 60, `xp=${st.xp}`);
    // plan task reward & anti-farm (clear any pre-seeded main-site plan days)
    await page.evaluate(() => { localStorage.removeItem("hsk4-plan-vi-v1"); localStorage.removeItem("hsk4-plan-v1"); });
    await seed({ xp: 0, stars: 0, dayXp: 0 });
    await click("[role=tab]", "学习计划"); await click("button", "标记完成"); await sleep(400);
    st = await get(); ok(tag + " plan task reward", st.xp === 10 && st.stars === 1, `xp=${st.xp}`);
    await click("button", EN ? "完成" : "已完成"); await sleep(100); await click("button", "标记完成"); await sleep(300);
    st = await get(); ok(tag + " no farming on re-tick", st.xp === 10, `xp=${st.xp}`);
    await click("[role=tab]", "每课小测"); await click("button", EN ? "交卷" : "交卷 · Nộp bài"); await sleep(300);
    st = await get(); ok(tag + " quiz event recorded", !!st.claims["q:1"]);
    // pet quiz
    await seed({ xp: 0, stars: 0, hearts: 0, pq: null });
    await scrollTo(".pquiz", 60); const n0 = reqs.length; await page.click(".pq-start"); await sleep(1200);
    ok(tag + " pet quiz intro audio", reqs.slice(n0).some((r) => /audio\/pet\/18\.mp3/.test(r)), reqs.slice(n0).join(","));
    await snap("petquiz");
    for (let i = 0; i < 5; i++) {
      const st2 = await get(); const d = st2.pq.items[i]; const want = i === 4 ? d.perm.findIndex((x) => x !== 0) : d.perm.indexOf(0);
      const n1 = reqs.length; await page.evaluate((k) => document.querySelectorAll(".pq-opts button")[k].click(), want); await sleep(700);
      if (i === 0) ok(tag + " answer feedback audio", reqs.slice(n1).some((r) => /audio\/pet\/(19|20)\.mp3/.test(r)), reqs.slice(n1).join(","));
    }
    await page.click(".pq-finish"); await sleep(600); st = await get();
    ok(tag + " pet quiz 4/5 reward (+16XP +4⭐)", st.xp === 16 && st.stars === 4 && st.pq.done, `xp=${st.xp} s=${st.stars}`);
    await scrollTo(".pquiz", 60); await snap("petquiz_result");
    await page.reload({ waitUntil: "networkidle0" }); await page.click(".pet-widget"); await sleep(500);
    ok(tag + " pet quiz once per day", (await page.$(".pq-start")) === null && (await page.$eval(".pq-score", (e) => e.textContent)).includes("4/5"));
    // perfect run via fresh pq
    await seed({ xp: 0, stars: 0, hearts: 0, pq: null }); await page.click(".pq-start"); await sleep(300);
    for (let i = 0; i < 5; i++) { const st2 = await get(); const d = st2.pq.items[i]; await page.evaluate((k) => document.querySelectorAll(".pq-opts button")[k].click(), d.perm.indexOf(0)); await sleep(150); }
    await page.click(".pq-finish"); await sleep(400); st = await get();
    ok(tag + " pet quiz 5/5 (+25XP +5⭐ +1💗)", st.xp === 25 && st.stars === 5 && st.hearts === 1, `xp=${st.xp} s=${st.stars} h=${st.hearts}`);
    // stages + shop
    await seed({ xp: 700, lessons: [1, 2, 3, 4, 5, 6], stage: 2, minStage: 0, equip: { acc: "glasses", outfit: "hoodie", room: "sakura", furn: ["plant"] }, stars: 80, hearts: 10, owned: ["glasses", "hoodie", "sakura", "plant"] });
    let label = await page.evaluate(() => document.querySelector("#pet-top span[style*='linear-gradient']").textContent);
    ok(`${tag} stage 2 at 700XP/6 lessons`, label.includes("小朋友"), label);
    await scrollTo("#pet-top"); await snap("stage2");
    const n2 = reqs.length; await page.evaluate(() => { window.__tts = 0; try { const ss = window.speechSynthesis; const o = ss.speak.bind(ss); ss.speak = (u) => { window.__tts++; try { o(u); } catch (e) {} }; } catch (e) {} });
    let talkMp3 = false, talkTts = 0;
    for (let t = 0; t < 6 && !talkMp3; t++) { await page.click('#pet-top button[aria-label="pet"]'); await sleep(1300); talkMp3 = reqs.slice(n2).some((r) => /^(200|206|304) .*audio\/pet\/\d+\.mp3/.test(r)); }
    talkTts = await page.evaluate(() => window.__tts);
    ok(tag + " pet talks (voice mp3 or TTS for dynamic lines)", talkMp3, `mp3=${talkMp3} tts=${talkTts}`);
    const before = await get();
    await click("#pet-top button", EN ? "Food" : "Đồ ăn"); await click("#pet-top .shop button", EN ? "Feed" : "Cho ăn"); await sleep(300);
    await click("#pet-top button", EN ? "Accessories" : "Phụ kiện"); await click("#pet-top .shop button", EN ? "Buy" : "Mua"); await sleep(300);
    const after = await get();
    ok(tag + " shop feed + buy", after.stats.fed === before.stats.fed + 1 && after.owned.length === before.owned.length + 1 && after.stars < before.stars);
    // graduation via check-in crossing 1200
    await seed({ xp: 1190, lessons: Array.from({ length: 15 }, (_, i) => i + 1), stage: 3, minStage: 0, gradDone: false, ciLast: ds(-1), ciStreak: 2, equip: { outfit: "aodai", room: "night", furn: ["lamp", "desk"] } });
    label = await page.evaluate(() => document.querySelector("#pet-top span[style*='linear-gradient']").textContent);
    ok(`${tag} 1190XP still teen`, label.includes("少女"), label);
    await scrollTo(".checkin", 80); await page.click(".ci-btn"); await sleep(900);
    st = await get();
    ok(tag + " graduation: stage4 + all items + badge", st.stage === 4 && st.gradDone && ALL.every((x) => st.owned.includes(x)) && st.earned.includes("grad"), `stage=${st.stage} owned=${st.owned.length}`);
    ok(tag + " level-up celebration", await page.evaluate(() => !!document.querySelector(".levelup")));
    await snap("graduation_popup");
    await scrollTo("#pet-top"); await sleep(300); await snap("stage4");
    await scrollTo(".gradcard", 60); await snap("achievement");
    // adopt next
    const keep = await get();
    await page.click(".adopt-next"); await sleep(400);
    ok(tag + " next-pet picker", (await page.$$(".adopt button")).length === 6);
    await page.evaluate(() => document.querySelectorAll(".adopt button")[4].click()); await page.type("#pet-top input", "Lulu"); await page.click(".adopt-go"); await sleep(700);
    st = await get();
    ok(tag + " new pet from egg, keeps stars/badges/items", st.pet === "dragon" && st.name === "Lulu" && st.xp === 0 && st.lessons.length === 0 && st.grads.length === 1 && st.grads[0].name === "Mochi" && st.stars === keep.stars && st.hearts === keep.hearts && st.owned.length === keep.owned.length && st.earned.includes("grad"), `xp=${st.xp} grads=${st.grads.length}`);
    label = await page.evaluate(() => document.querySelector("#pet-top span[style*='linear-gradient']").textContent);
    ok(tag + " new pet is an egg", label.includes("蛋"), label);
    await page.evaluate(() => document.querySelector(".collection button").click()); await sleep(400);
    ok(tag + " collection view", await page.$(".coll-view") !== null);
    await scrollTo(".collection", 60); await snap("collection");
    // export/import
    await click("#pet-top button", EN ? "Export code" : "Xuất mã"); await sleep(200);
    const code = await page.evaluate(() => [...document.querySelectorAll("#pet-top textarea")].map((t) => t.value).find((v) => v.startsWith("HSK4PET1:")));
    ok(tag + " export code", !!code && code.length > 50);
    // level-up (child) via task
    await seed({ xp: 295, lessons: [1, 2, 3, 4, 5, 6], stage: 1, dayXp: 0, day: ds(0), claims: {} });
    await page.evaluate(() => { localStorage.removeItem("hsk4-plan-vi-v1"); localStorage.removeItem("hsk4-plan-v1"); });
    await page.reload({ waitUntil: "networkidle0" }); await click("[role=tab]", "学习计划"); await click("button", "标记完成"); await sleep(900);
    ok(tag + " level-up to child", await page.evaluate(() => !!document.querySelector(".levelup")) && (await get()).stage === 2);
    // v1 migration
    await page.evaluate((y) => { localStorage.setItem("hsk4-pet-v1", JSON.stringify({ v: 1, pet: "kitten", name: "Mimi", xp: 900, stars: 7, hearts: 2, happy: 70, owned: [], equip: { furn: [] }, lessons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], ready: false, best: -1, day: y, dayXp: 0, claims: {}, streak: 5, maxStreak: 5, lastDay: y, stats: { cards: 0, listen: 0, quiz100: 0, quiz: 0, rtest: 0, fed: 0, tasks: 0 }, gifts: [], stage: 3, born: 1 })); }, ds(-1));
    await page.reload({ waitUntil: "networkidle0" }); await page.click(".pet-widget"); await sleep(500);
    label = await page.evaluate(() => document.querySelector("#pet-top span[style*='linear-gradient']").textContent);
    const cs = await page.$eval(".ci-streak", (e) => e.textContent);
    ok(tag + " v1 save migrates (no demotion, streak kept)", label.includes("少女") && cs === "5", `${label} streak=${cs}`);
    // import into fresh state
    await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: "networkidle0" }); await page.click(".pet-widget"); await sleep(400);
    await page.evaluate((c) => { const ta = document.querySelector("#pet-top textarea"); const set = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set; set.call(ta, c); ta.dispatchEvent(new Event("input", { bubbles: true })); }, code);
    await click("#pet-top button", EN ? "Import code" : "Nhập mã"); await sleep(1500);
    const imp = await get();
    ok(tag + " import restores", imp && imp.name === "Lulu" && imp.grads.length === 1, imp ? `name=${imp.name}` : "null");
    const ow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth); ok(tag + " no overflow", ow <= 0, String(ow));
    ok(tag + " console clean", errs.length === 0, errs.join(" | "));
    await page.close();
  }
  await browser.close(); console.log(fail ? `FAILURES ${fail}` : "ALL PASS"); process.exit(fail ? 1 : 0);
})();
