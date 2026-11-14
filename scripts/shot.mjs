#!/usr/bin/env node
/**
 * Full-size page screenshots through headless Chrome (no dependencies; Node 22+).
 *
 *   node scripts/shot.mjs <url> <out.png> [--width 1440] [--height 900] [--full] [--scroll 1200]
 *                         [--wait 2500] [--click "css selector"] [--eval "js"]
 *
 * --full     capture the whole page (scrolls through it first so scroll-triggered animations play)
 * --scroll   capture one viewport at this scroll position instead of the top
 * --mobile   375x812 touch viewport (same as --width 375 --height 812)
 * Prints console errors and whether the page scrolls sideways.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const args = process.argv.slice(2);
const [url, out] = args;
if (!url || !out) {
  console.error("usage: node scripts/shot.mjs <url> <out.png> [--width n] [--height n] [--full] [--scroll y] [--wait ms] [--mobile]");
  process.exit(1);
}
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const v = args[i + 1];
  return v === undefined || v.startsWith("--") ? true : v;
};
const mobile = opt("mobile", false) === true;
const width = Number(opt("width", mobile ? 375 : 1440));
const height = Number(opt("height", mobile ? 812 : 900));
const full = opt("full", false) === true;
const scrollTo = Number(opt("scroll", 0));
const wait = Number(opt("wait", 2500));
const click = opt("click", null);
const evalJs = opt("eval", null);

const chrome = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].find((p) => p && fs.existsSync(p));
if (!chrome) {
  console.error("Chrome not found; set CHROME_PATH");
  process.exit(1);
}

const port = 9300 + Math.floor(Math.random() * 600);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "tlk-shot-"));
const child = spawn(
  chrome,
  [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "--hide-scrollbars",
    "--no-first-run",
    "--disable-gpu-vsync",
    "--force-device-scale-factor=1",
    `--window-size=${width},${height}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const done = (code) => {
  try {
    child.kill();
  } catch {
    /* already gone */
  }
  setTimeout(() => {
    try {
      fs.rmSync(profile, { recursive: true, force: true });
    } catch {
      /* profile still locked; the OS temp cleaner removes it */
    }
    process.exit(code);
  }, 300);
};

try {
  let target;
  for (let i = 0; i < 60 && !target; i++) {
    await sleep(150);
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      target = list.find((t) => t.type === "page");
    } catch {
      /* Chrome is still starting */
    }
  }
  if (!target) throw new Error("Chrome did not start");

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });
  let id = 0;
  const pending = new Map();
  const errors = [];
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? rej(new Error(msg.error.message)) : res(msg.result);
    } else if (msg.method === "Runtime.exceptionThrown") {
      errors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
    } else if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") {
      errors.push(msg.params.args.map((a) => a.value ?? a.description ?? "").join(" "));
    }
  };
  const send = (method, params = {}) =>
    new Promise((res, rej) => {
      pending.set(++id, { res, rej });
      ws.send(JSON.stringify({ id, method, params }));
    });
  const run = async (expression) => {
    const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
  if (mobile) await send("Emulation.setTouchEmulationEnabled", { enabled: true });
  await send("Page.navigate", { url });
  await sleep(wait);

  if (evalJs) await run(evalJs);
  if (click) {
    await run(`document.querySelector(${JSON.stringify(click)})?.click()`);
    await sleep(900);
  }

  const pageHeight = await run("Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)");
  if (full) {
    // Walk down the page so every scroll-triggered entrance has played, then return to the top.
    for (let y = 0; y < pageHeight; y += Math.round(height * 0.6)) {
      await run(`window.scrollTo(0, ${y})`);
      await sleep(260);
    }
    await run("window.scrollTo(0, 0)");
    await sleep(900);
  } else if (scrollTo) {
    for (let y = 0; y <= scrollTo; y += Math.round(height * 0.6)) {
      await run(`window.scrollTo(0, ${y})`);
      await sleep(200);
    }
    await run(`window.scrollTo(0, ${scrollTo})`);
    await sleep(1400);
  }

  const sideways = await run("document.documentElement.scrollWidth > window.innerWidth + 1");
  const shot = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: full,
    ...(full ? { clip: { x: 0, y: 0, width, height: Math.min(pageHeight, 16000), scale: 1 } } : {}),
  });
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(out, Buffer.from(shot.data, "base64"));
  console.log(`${out}  ${width}x${full ? pageHeight : height}  page height ${pageHeight}px  sideways scroll: ${sideways ? "YES" : "no"}`);
  const real = errors.filter((e) => !/hero_slides|customer_reviews|404|Failed to load resource|botpress/i.test(e));
  // Only the first line of each error: stack traces would flood the output.
  const firstLines = [...new Set(real.map((e) => String(e).split("\n")[0].slice(0, 240)))];
  if (firstLines.length) console.log(["console errors:", ...firstLines.slice(0, 8)].join("\n  "));
  ws.close();
  done(0);
} catch (e) {
  console.error("shot failed:", e.message);
  done(1);
}
