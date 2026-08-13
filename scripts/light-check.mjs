import puppeteer from "puppeteer-core";
import { spawn } from "node:child_process";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const server = spawn("npx", ["vite", "preview", "--port", "4173"], { stdio: "ignore", detached: true });
await new Promise((r) => setTimeout(r, 2500));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--window-size=1440,2200"] });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

await page.goto("http://localhost:4173", { waitUntil: "networkidle0", timeout: 30000 });

// basic: no emojis present in body text
const emojis = await page.evaluate(() => {
  const t = document.body.innerText;
  const found = t.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
  return found ? found[0] : null;
});
console.log("emoji found in body:", emojis);

// parallax sections exist
const sections = await page.evaluate(() =>
  [...document.querySelectorAll("section[id]")].map((s) => s.id)
);
console.log("sections:", sections.join(", "));

const navBg = await page.evaluate(() => {
  window.scrollBy(0, 400);
  return "nav-scrolled";
});
console.log(navBg);

const cropCards = await page.evaluate(() =>
  document.querySelectorAll("section#catalog .card").length
);
console.log("crop catalog cards:", cropCards);

// light background
const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
console.log("body bg:", bg);

// run optimizer
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) => x.textContent?.includes("Compute rotation"));
  b?.click();
});
await page.waitForSelector("section#results", { timeout: 15000 });
await new Promise((r) => setTimeout(r, 1500));

const audit = await page.evaluate(() => {
  const s = document.querySelector("section#results");
  return {
    cards: s?.querySelectorAll(".card").length ?? 0,
    tiles: s?.querySelectorAll(".timeline-scroll > div > div").length ?? 0,
    winners: [...s.querySelectorAll("div")].filter((d) => d.textContent?.trim() === "recommended").length,
    strategyH3: [...s.querySelectorAll("h3")].map((h) => h.textContent).filter(Boolean).slice(0, 8),
    svgs: s?.querySelectorAll("svg.recharts-surface").length ?? 0,
    secretAILabels: s?.innerHTML.match(/AI/g)?.length ?? 0,
  };
});
console.log("results cards:", audit.cards, "| tiles:", audit.tiles, "| winner badge:", audit.winners);
console.log("strategy names:", audit.strategyH3.join(" | "));
console.log("charts svgs:", audit.svgs);
console.log("'AI' occurrences in results html:", audit.secretAILabels);

await page.screenshot({ path: "/tmp/rotato-light.png", fullPage: true });
console.log("errors:", errors.length ? errors.slice(0, 5) : "none");

await browser.close();
server.kill();
process.exit(0);