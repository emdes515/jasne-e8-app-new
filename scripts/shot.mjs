#!/usr/bin/env node
/**
 * shot.mjs — zrzuty ekranu i pomiary layoutu bez zależności zewnętrznych.
 *
 * Uruchamia lokalnego Chrome/Edge w trybie headless, steruje nim po CDP
 * (Chrome DevTools Protocol) i zapisuje PNG oraz metryki strony: overflow
 * poziomy, elementy wychodzące poza viewport, błędy konsoli.
 *
 * Użycie:
 *   node scripts/shot.mjs <url> [opcje]
 *
 * Opcje:
 *   --size 390x844       rozmiar viewportu (domyślnie 390x844)
 *   --out  plik.png      ścieżka pliku wyjściowego
 *   --full               pełna strona zamiast viewportu
 *   --wait 1500          dodatkowe oczekiwanie po zdarzeniu load [ms]
 *   --mobile / --desktop wymuszenie trybu emulacji
 *   --json               tylko metryki (bez zapisu PNG)
 *   --net                lista żądań zakończonych błędem (4xx/5xx)
 *
 * Przykłady:
 *   node scripts/shot.mjs https://jasne-e8-app-new.vercel.app --size 390x844
 *   node scripts/shot.mjs http://localhost:3000 --size 1440x900 --full --out shot.png
 */

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { tmpdir } from "node:os";

const CANDIDATES = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);

function findBrowser() {
  for (const candidate of CANDIDATES) {
    if (existsSync(candidate)) return candidate;
  }
  throw new Error(
    "Nie znaleziono Chrome/Edge. Ustaw zmienną CHROME_PATH na ścieżkę do przeglądarki.",
  );
}

function parseArgs(argv) {
  const args = { url: null, size: "390x844", out: null, full: false, wait: 1500, json: false, mobile: null, net: false };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--size") args.size = argv[++i];
    else if (token === "--out") args.out = argv[++i];
    else if (token === "--wait") args.wait = Number(argv[++i]);
    else if (token === "--full") args.full = true;
    else if (token === "--json") args.json = true;
    else if (token === "--net") args.net = true;
    else if (token === "--mobile") args.mobile = true;
    else if (token === "--desktop") args.mobile = false;
    else if (!token.startsWith("--")) args.url = token;
  }

  if (!args.url) throw new Error("Brak adresu URL. Przykład: node scripts/shot.mjs https://example.com");

  const [width, height] = args.size.toLowerCase().split("x").map(Number);
  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    throw new Error(`Nieprawidłowy --size "${args.size}". Użyj formatu np. 390x844.`);
  }

  args.width = width;
  args.height = height;
  if (args.mobile === null) args.mobile = width <= 480;

  if (!args.out && !args.json) {
    const host = new URL(args.url).hostname.replace(/[^a-z0-9.-]/gi, "_");
    args.out = resolve(process.cwd(), `${host}-${width}x${height}.png`);
  }

  return args;
}

class Cdp {
  #ws;
  #nextId = 1;
  #pending = new Map();
  #listeners = new Set();

  constructor(ws) {
    this.#ws = ws;
    ws.addEventListener("message", (event) => {
      let message;
      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }

      if (typeof message.id === "number") {
        const entry = this.#pending.get(message.id);
        if (!entry) return;
        this.#pending.delete(message.id);
        if (message.error) entry.reject(new Error(`${message.error.message} (${entry.method})`));
        else entry.resolve(message.result);
        return;
      }

      for (const listener of this.#listeners) listener(message);
    });
  }

  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((resolveOpen, rejectOpen) => {
      ws.addEventListener("open", resolveOpen, { once: true });
      ws.addEventListener("error", () => rejectOpen(new Error("Nie udało się połączyć z CDP.")), {
        once: true,
      });
    });
    return new Cdp(ws);
  }

  send(method, params = {}, sessionId = undefined) {
    const id = this.#nextId++;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;

    return new Promise((resolveCall, rejectCall) => {
      this.#pending.set(id, { resolve: resolveCall, reject: rejectCall, method });
      this.#ws.send(JSON.stringify(payload));
    });
  }

  on(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  close() {
    try {
      this.#ws.close();
    } catch {
      /* ignorowane */
    }
  }
}

/** Lista elementów, które faktycznie wychodzą poza szerokość viewportu. */
const OVERFLOW_PROBE = `(() => {
  const doc = document.documentElement;
  const vw = window.innerWidth;
  const offenders = [];
  for (const el of document.querySelectorAll("body *")) {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;
    const style = getComputedStyle(el);
    if (style.visibility === "hidden" || style.display === "none") continue;
    if (rect.right > vw + 1 || rect.left < -1) {
      offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.getAttribute("class") || "").slice(0, 120),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
        overflow: Math.round(Math.max(rect.right - vw, -rect.left)),
      });
    }
  }
  offenders.sort((a, b) => b.overflow - a.overflow);
  return {
    title: document.title,
    viewport: { width: vw, height: window.innerHeight },
    scrollWidth: doc.scrollWidth,
    scrollHeight: doc.scrollHeight,
    horizontalOverflow: Math.max(doc.scrollWidth - vw, 0),
    bodyText: (document.body?.innerText || "").trim().slice(0, 300),
    offenders: offenders.slice(0, 12),
  };
})()`;

async function waitForPort(port, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return await response.json();
    } catch {
      /* przeglądarka jeszcze nie wystartowała */
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error("Przeglądarka nie uruchomiła portu diagnostycznego CDP.");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const browserPath = findBrowser();
  const port = 9300 + Math.floor(Math.random() * 600);
  const profileDir = resolve(tmpdir(), `shot-profile-${Date.now()}`);

  const child = spawn(
    browserPath,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "--disable-background-networking",
      `--user-data-dir=${profileDir}`,
      `--remote-debugging-port=${port}`,
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );

  let cdp;
  try {
    const version = await waitForPort(port);
    cdp = await Cdp.connect(version.webSocketDebuggerUrl);

    const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });

    const consoleErrors = [];
    cdp.on((message) => {
      if (message.method === "Runtime.exceptionThrown") {
        consoleErrors.push(message.params?.exceptionDetails?.text || "Wyjątek w JS");
      }
      if (message.method === "Log.entryAdded" && message.params?.entry?.level === "error") {
        consoleErrors.push(message.params.entry.text);
      }
    });

    await cdp.send("Page.enable", {}, sessionId);
    await cdp.send("Runtime.enable", {}, sessionId);
    await cdp.send("Log.enable", {}, sessionId);

    const failedRequests = [];
    if (args.net) {
      await cdp.send("Network.enable", {}, sessionId);
      cdp.on((message) => {
        if (message.method === "Network.responseReceived") {
          const { response } = message.params;
          if (response.status >= 400) {
            failedRequests.push({ status: response.status, url: response.url });
          }
        }
        if (message.method === "Network.loadingFailed") {
          failedRequests.push({ status: 0, url: message.params?.requestId, error: message.params?.errorText });
        }
      });
    }
    await cdp.send(
      "Emulation.setDeviceMetricsOverride",
      {
        width: args.width,
        height: args.height,
        deviceScaleFactor: 1,
        mobile: args.mobile,
      },
      sessionId,
    );

    const loaded = new Promise((resolveLoad) => {
      const off = cdp.on((message) => {
        if (message.method === "Page.loadEventFired") {
          off();
          resolveLoad();
        }
      });
      setTimeout(() => {
        off();
        resolveLoad();
      }, 20000);
    });

    await cdp.send("Page.navigate", { url: args.url }, sessionId);
    await loaded;
    await new Promise((r) => setTimeout(r, args.wait));

    const evaluated = await cdp.send(
      "Runtime.evaluate",
      { expression: OVERFLOW_PROBE, returnByValue: true, awaitPromise: false },
      sessionId,
    );
    const metrics = evaluated.result?.value ?? null;

    let savedPath = null;
    if (!args.json) {
      const shot = await cdp.send(
        "Page.captureScreenshot",
        { format: "png", captureBeyondViewport: args.full, fromSurface: true },
        sessionId,
      );
      savedPath = args.out;
      mkdirSync(dirname(savedPath), { recursive: true });
      writeFileSync(savedPath, Buffer.from(shot.data, "base64"));
    }

    const result = {
      url: args.url,
      browser: browserPath,
      size: `${args.width}x${args.height}`,
      mobileEmulation: args.mobile,
      screenshot: savedPath,
      metrics,
      consoleErrors,
      failedRequests,
    };

    console.log(JSON.stringify(result, null, 2));
  } finally {
    cdp?.close();
    child.kill();
  }
}

main().catch((error) => {
  console.error(`Błąd: ${error.message}`);
  process.exitCode = 1;
});
