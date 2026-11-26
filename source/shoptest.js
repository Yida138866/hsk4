const puppeteer = require("puppeteer-core");
const base = process.argv[2] || "http://127.0.0.1:8765/";
const shotDir = "/workspace/hsk4/shots";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const KINDS = ["bunny", "panda", "kitten", "tiger", "dragon", "puppy"];

(async () => {
  const browser = await puppeteer.launch({ executablePath: "/usr/bin/google-chrome", headless: "new", args: ["--no-sandbox"] });
  let fail = 0;
  const ok = (tag, c, extra = "") => { console.log(`${tag}: ${c ? "PASS" : "FAIL"} ${extra}`); if (!c) fail++; };

  for (const path of ["", "en/"]) {
    const EN = !!path;
    const L = EN ? "en" : "vi";
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const errs = [];
    page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
    page.on("pageerror", (e) => errs.push("pageerror " + e.message));
    page.on("response", (r) => { if (r.status() >= 400) errs.push("http " + r.status() + " " + r.url()); });

    await page.goto(base + path, { waitUntil: "networkidle0" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle0" });

    // Adopt panda first
    await page.click(".pet-widget"); await sleep(400);
    await page.evaluate(() => {
      const inp = document.querySelector("#pet-top input[placeholder]");
      if (inp) {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
        setter.call(inp, "Mochi");
        inp.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
    await sleep(150);
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll("#pet-top button")].find((b) => /Nhận nuôi|Adopt/.test(b.textContent));
      if (btn) btn.click();
    });
    await sleep(400);

    const clickTab = async (label) => {
      const clicked = await page.evaluate((label) => {
        const b = [...document.querySelectorAll("#pet-top button")].find((x) => x.textContent.includes(label));
        if (b) { b.click(); return true; }
        return false;
      }, label);
      if (!clicked) throw new Error("Tab not found: " + label);
      await sleep(250);
    };

    // Check every pet kind for 8 acc (5 common + 3 exclusive), 8 outfit (5 common + 3 exclusive), 8 food, 6 room, 6 furn
    for (const k of KINDS) {
      await page.evaluate((k) => {
        const s = JSON.parse(localStorage.getItem("hsk4-pet-v1"));
        s.pet = k; s.xp = 800; s.stage = 3; s.stars = 500; s.hearts = 50; s.hunger = 50; s.clean = 100; s.poop = 0; s.dirty = false;
        s.equip = { furn: [] };
        localStorage.setItem("hsk4-pet-v1", JSON.stringify(s));
      }, k);
      await page.reload({ waitUntil: "networkidle0" });
      await page.click(".pet-widget"); await sleep(400);

      // Accessories tab
      await clickTab(EN ? "Accessories" : "Phụ kiện");
      const accInfo = await page.evaluate((EN) => {
        const cards = [...document.querySelectorAll("#pet-top .shop > div")];
        const rows = [];
        for (const c of cards) {
          const r = c.getBoundingClientRect();
          rows.push({ x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), txt: c.innerText.replace(/\s+/g, " ") });
        }
        const excl = cards.filter((c) => c.innerText.includes(EN ? "exclusive" : "riêng")).length;
        const ow = document.documentElement.scrollWidth - window.innerWidth;
        return { count: cards.length, excl, ow, rows };
      }, EN);
      const twoPerRowAcc = accInfo.rows.length === 8 &&
        accInfo.rows[0].y === accInfo.rows[1].y && accInfo.rows[0].x < accInfo.rows[1].x &&
        accInfo.rows[2].y === accInfo.rows[3].y && accInfo.rows[2].y > accInfo.rows[0].y &&
        accInfo.rows[4].y === accInfo.rows[5].y && accInfo.rows[6].y === accInfo.rows[7].y;
      ok(`${L} ${k} acc=8 (5 common + 3 excl) & 2-col`, accInfo.count === 8 && accInfo.excl === 3 && twoPerRowAcc && accInfo.ow === 0, `cnt=${accInfo.count} excl=${accInfo.excl} ow=${accInfo.ow}`);

      // Buy last item (exclusive) and confirm equipped
      await page.evaluate(() => {
        const btns = [...document.querySelectorAll("#pet-top .shop button")];
        btns[btns.length - 1].click();
      });
      await sleep(250);
      const equippedAcc = await page.evaluate(() => JSON.parse(localStorage.getItem("hsk4-pet-v1")).equip.acc);
      ok(`${L} ${k} exclusive acc equipped`, typeof equippedAcc === "string" && equippedAcc.startsWith(k + "_"), equippedAcc);

      // Outfits tab
      await clickTab(EN ? "Outfits" : "Trang phục");
      const outInfo = await page.evaluate((EN) => {
        const cards = [...document.querySelectorAll("#pet-top .shop > div")];
        const rows = cards.map((c) => { const r = c.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top) }; });
        const excl = cards.filter((c) => c.innerText.includes(EN ? "exclusive" : "riêng")).length;
        return { count: cards.length, excl, twoCol: rows.length === 8 && rows[0].y === rows[1].y && rows[2].y === rows[3].y && rows[4].y === rows[5].y && rows[6].y === rows[7].y };
      }, EN);
      ok(`${L} ${k} outfit=8 (5 common + 3 excl) & 2-col`, outInfo.count === 8 && outInfo.excl === 3 && outInfo.twoCol, `cnt=${outInfo.count} excl=${outInfo.excl}`);

      // Buy first exclusive outfit (index 5)
      await page.evaluate(() => {
        const btns = [...document.querySelectorAll("#pet-top .shop button")];
        btns[5].click();
      });
      await sleep(250);
      const equippedOut = await page.evaluate(() => JSON.parse(localStorage.getItem("hsk4-pet-v1")).equip.outfit);
      ok(`${L} ${k} exclusive outfit equipped`, typeof equippedOut === "string" && equippedOut.startsWith(k + "_"), equippedOut);

      // Capture mobile shots on vi/ for visual review
      if (!EN) {
        if (k === "dragon") {
          // Put dragon in cloud room + equip halo & wingcape + furniture
          await clickTab("Phòng");
          await page.evaluate(() => {
            const btns = [...document.querySelectorAll("#pet-top .shop button")];
            btns[btns.length - 1].click(); // cloud room
          });
          await sleep(200);
          await clickTab("Nội thất");
          await page.evaluate(() => {
            [...document.querySelectorAll("#pet-top .shop button")].forEach((b) => b.click());
          });
          await sleep(250);
          await page.evaluate(() => window.scrollTo(0, 0));
          await sleep(300);
          await page.screenshot({ path: `${shotDir}/shop_dragon_wing.png` });
        } else if (k === "bunny") {
          await clickTab("Phòng");
          await page.evaluate(() => {
            const btns = [...document.querySelectorAll("#pet-top .shop button")];
            btns[4].click(); // cafe room
          });
          await sleep(200);
          await page.evaluate(() => window.scrollTo(0, 0));
          await sleep(300);
          await page.screenshot({ path: `${shotDir}/shop_bunny_tutu.png` });
        } else if (k === "panda") {
          await clickTab("Phòng");
          await page.evaluate(() => {
            const btns = [...document.querySelectorAll("#pet-top .shop button")];
            btns[3].click(); // bamboo room
          });
          await sleep(200);
          await page.evaluate(() => window.scrollTo(0, 0));
          await sleep(300);
          await page.screenshot({ path: `${shotDir}/shop_panda_hanfu.png` });
        } else if (k === "kitten") {
          // Also equip sailor + bell for screenshot
          await page.evaluate(() => {
            const s = JSON.parse(localStorage.getItem("hsk4-pet-v1"));
            s.equip.acc = "kitten_bell"; s.equip.outfit = "kitten_sailor";
            localStorage.setItem("hsk4-pet-v1", JSON.stringify(s));
          });
          await page.reload({ waitUntil: "networkidle0" });
          await page.click(".pet-widget"); await sleep(400);
          await page.evaluate(() => window.scrollTo(0, 0));
          await sleep(300);
          await page.screenshot({ path: `${shotDir}/shop_kitten_sailor.png` });
        } else if (k === "tiger") {
          await page.evaluate(() => {
            const s = JSON.parse(localStorage.getItem("hsk4-pet-v1"));
            s.equip.acc = "tiger_wang"; s.equip.outfit = "tiger_kungfu";
            localStorage.setItem("hsk4-pet-v1", JSON.stringify(s));
          });
          await page.reload({ waitUntil: "networkidle0" });
          await page.click(".pet-widget"); await sleep(400);
          await page.evaluate(() => window.scrollTo(0, 0));
          await sleep(300);
          await page.screenshot({ path: `${shotDir}/shop_tiger_kungfu.png` });
        } else if (k === "puppy") {
          await page.evaluate(() => {
            const s = JSON.parse(localStorage.getItem("hsk4-pet-v1"));
            s.equip.acc = "puppy_sunhat"; s.equip.outfit = "puppy_picnic";
            localStorage.setItem("hsk4-pet-v1", JSON.stringify(s));
          });
          await page.reload({ waitUntil: "networkidle0" });
          await page.click(".pet-widget"); await sleep(400);
          await page.evaluate(() => window.scrollTo(0, 0));
          await sleep(300);
          await page.screenshot({ path: `${shotDir}/shop_puppy_picnic.png` });
        }
      }
    }

    // Check Food (8), Room (6), Furn (6), and take 2-column shop grid screenshots
    await clickTab(EN ? "Accessories" : "Phụ kiện");
    if (!EN) {
      await page.evaluate(() => {
        const s = document.querySelector("#pet-top .shop");
        if (s) window.scrollTo(0, s.getBoundingClientRect().top + scrollY - 90);
      });
      await sleep(300);
      await page.screenshot({ path: `${shotDir}/shop_mobile_acc.png` });
    }

    await clickTab(EN ? "Food" : "Đồ ăn");
    const foodInfo = await page.evaluate(() => {
      const cards = [...document.querySelectorAll("#pet-top .shop > div")];
      const rows = cards.map((c) => ({ x: Math.round(c.getBoundingClientRect().left), y: Math.round(c.getBoundingClientRect().top) }));
      return { count: cards.length, twoCol: rows.length === 8 && rows[0].y === rows[1].y && rows[6].y === rows[7].y };
    });
    ok(`${L} food=8 & 2-col`, foodInfo.count === 8 && foodInfo.twoCol, `cnt=${foodInfo.count}`);
    if (!EN) {
      await page.evaluate(() => {
        const s = document.querySelector("#pet-top .shop");
        if (s) window.scrollTo(0, s.getBoundingClientRect().top + scrollY - 90);
      });
      await sleep(300);
      await page.screenshot({ path: `${shotDir}/shop_mobile_food.png` });
    }
    // Feed last food item (strawberry sundae)
    const hBefore = await page.evaluate(() => JSON.parse(localStorage.getItem("hsk4-pet-v1")).hunger);
    await page.evaluate(() => { const b = [...document.querySelectorAll("#pet-top .shop button")]; b[b.length - 1].click(); });
    await sleep(250);
    const hAfter = await page.evaluate(() => JSON.parse(localStorage.getItem("hsk4-pet-v1")).hunger);
    ok(`${L} feeding new food increases hunger`, hAfter > hBefore, `${hBefore}->${hAfter}`);

    await clickTab(EN ? "Rooms" : "Phòng");
    const roomInfo = await page.evaluate(() => {
      const cards = [...document.querySelectorAll("#pet-top .shop > div")];
      const rows = cards.map((c) => ({ x: Math.round(c.getBoundingClientRect().left), y: Math.round(c.getBoundingClientRect().top) }));
      return { count: cards.length, twoCol: rows.length === 6 && rows[0].y === rows[1].y && rows[4].y === rows[5].y };
    });
    ok(`${L} room=6 & 2-col`, roomInfo.count === 6 && roomInfo.twoCol, `cnt=${roomInfo.count}`);

    await clickTab(EN ? "Furniture" : "Nội thất");
    const furnInfo = await page.evaluate(() => {
      const cards = [...document.querySelectorAll("#pet-top .shop > div")];
      const rows = cards.map((c) => ({ x: Math.round(c.getBoundingClientRect().left), y: Math.round(c.getBoundingClientRect().top) }));
      return { count: cards.length, twoCol: rows.length === 6 && rows[0].y === rows[1].y && rows[4].y === rows[5].y };
    });
    ok(`${L} furn=6 & 2-col`, furnInfo.count === 6 && furnInfo.twoCol, `cnt=${furnInfo.count}`);

    // Graduation + Collection snapshot test with exclusive equipped
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem("hsk4-pet-v1"));
      s.pet = "dragon"; s.xp = 1300; s.stage = 4; s.gradDone = true;
      s.grads = [{ pet: "dragon", name: "Long", date: "2026-11-26", xp: 1300, born: "2026-11-20", equip: { acc: "dragon_halo", outfit: "dragon_wingcape", room: "cloud" } }];
      localStorage.setItem("hsk4-pet-v1", JSON.stringify(s));
    });
    await page.reload({ waitUntil: "networkidle0" });
    await page.click(".pet-widget"); await sleep(400);
    const colOk = await page.evaluate(() => {
      const svgs = [...document.querySelectorAll("#pet-top svg")];
      return svgs.some((sv) => sv.innerHTML.includes("#6a4ca3") || sv.innerHTML.includes("#9cf0da"));
    });
    ok(`${L} graduated exclusive snapshot renders`, colOk);

    // Desktop 4-col check
    await page.setViewport({ width: 1366, height: 900 });
    await page.reload({ waitUntil: "networkidle0" });
    await page.click(".pet-widget"); await sleep(400);
    await clickTab(EN ? "Accessories" : "Phụ kiện");
    const deskCols = await page.evaluate(() => {
      const rows = [...document.querySelectorAll("#pet-top .shop > div")].map((c) => Math.round(c.getBoundingClientRect().top));
      return rows.length === 8 && rows[0] === rows[1] && rows[1] === rows[2] && rows[2] === rows[3] && rows[4] > rows[0];
    });
    ok(`${L} desktop 4-col grid`, deskCols);

    ok(`${L} console clean`, errs.length === 0, errs.join(" | "));
    await page.close();
  }

  await browser.close();
  console.log(fail ? `FAIL=${fail}` : "ALL PASS");
  process.exit(fail ? 1 : 0);
})();
