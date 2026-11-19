#!/usr/bin/env node
/**
 * Deterministyczny generator ikon aplikacji JASNE E8 bez zewnętrznych zależności npm.
 * Wykorzystuje lokalnego Chrome/Edge przez CDP do rasteryzacji SVG -> PNG oraz czysty enkoder ICO.
 *
 * Generuje:
 * - app/favicon.ico (wielorozmiarowy ICO: 16x16, 32x32, 48x48 z przezroczystością)
 * - app/apple-icon.png (180x180 z pełnym tłem #080C16)
 * - public/icons/icon-192.png (192x192 z przezroczystością)
 * - public/icons/icon-512.png (512x512 z przezroczystością)
 * - public/icons/icon-maskable-512.png (512x512, pełne tło #080C16 + 20% bezpieczny margines maski)
 */

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const ROOT = resolve(import.meta.dirname, '..');

const BROWSER_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

function findBrowser() {
  for (const candidate of BROWSER_CANDIDATES) {
    if (existsSync(candidate)) return candidate;
  }
  throw new Error('Nie znaleziono Chrome ani Edge. Ustaw zmienną CHROME_PATH.');
}

// Wariant 16x16 zoptymalizowany pod mały rozmiar (grubsze linie, 3 wyraźne promienie)
const SVG_16 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <defs>
    <radialGradient id="b16" cx="38%" cy="32%" r="68%">
      <stop offset="0%" stop-color="#FFFBEB"/>
      <stop offset="42%" stop-color="#FFCA28"/>
      <stop offset="100%" stop-color="#D97706"/>
    </radialGradient>
  </defs>
  <rect x="2" y="2" width="60" height="60" rx="16" fill="#080C16" stroke="#FFB800" stroke-width="4"/>
  <g stroke="#FFC933" stroke-width="4.5" stroke-linecap="round">
    <line x1="32" y1="8" x2="32" y2="12"/>
    <line x1="12" y1="18" x2="16" y2="21"/>
    <line x1="52" y1="18" x2="48" y2="21"/>
  </g>
  <path d="M32 14 C22 14 16 21 16 30 C16 36 19 40 22 43 C23.5 44.5 24 46 24 48 H40 C40 46 40.5 44.5 42 43 C45 40 48 36 48 30 C48 21 42 14 32 14 Z" fill="url(#b16)" stroke="#92400E" stroke-width="3"/>
  <path d="M32 23 L33.5 27.5 L38 29 L33.5 30.5 L32 35 L30.5 30.5 L26 29 L30.5 27.5 Z" fill="#FFFBEB"/>
  <rect x="23" y="48" width="18" height="6" rx="3" fill="#475569" stroke="#0F172A" stroke-width="2.5"/>
  <path d="M27 54 H37 C36.5 57.5 34.5 59 32 59 C29.5 59 27.5 57.5 27 54 Z" fill="#1E293B"/>
</svg>`;

function buildOpaqueSquareSvg(innerSvg, safeScale = 0.86) {
  const innerClean = innerSvg
    .replace(/^<svg[^>]*>/i, '')
    .replace(/<\/svg>\s*$/i, '')
    .replace(/<rect x="2" y="2"[^>]*\/>/, '');
  const offset = ((1 - safeScale) * 64) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" fill="#080C16"/>
    <g transform="translate(${offset.toFixed(2)}, ${offset.toFixed(2)}) scale(${safeScale})">
      ${innerClean}
    </g>
  </svg>`;
}

class Cdp {
  #ws;
  #nextId = 1;
  #pending = new Map();

  constructor(ws) {
    this.#ws = ws;
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (typeof msg.id === 'number' && this.#pending.has(msg.id)) {
        const { resolve: res, reject: rej, method } = this.#pending.get(msg.id);
        this.#pending.delete(msg.id);
        if (msg.error) rej(new Error(`${msg.error.message} (${method})`));
        else res(msg.result);
      }
    });
  }

  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((res, rej) => {
      ws.addEventListener('open', res, { once: true });
      ws.addEventListener('error', () => rej(new Error('Nie udało się połączyć z CDP.')), { once: true });
    });
    return new Cdp(ws);
  }

  send(method, params = {}, sessionId = undefined) {
    const id = this.#nextId++;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((res, rej) => {
      this.#pending.set(id, { resolve: res, reject: rej, method });
      this.#ws.send(JSON.stringify(payload));
    });
  }

  close() {
    try {
      this.#ws.close();
    } catch {
      /* ignore */
    }
  }
}

async function waitForPort(port, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (r.ok) return await r.json();
    } catch {
      /* wait */
    }
    await new Promise((r) => setTimeout(r, 120));
  }
  throw new Error('Przeglądarka nie uruchomiła portu CDP.');
}

async function renderSvgToPngBuffer(cdp, sessionId, svgContent, size, transparentBg) {
  await cdp.send(
    'Emulation.setDeviceMetricsOverride',
    { width: size, height: size, deviceScaleFactor: 1, mobile: false },
    sessionId,
  );
  await cdp.send(
    'Emulation.setDefaultBackgroundColorOverride',
    { color: transparentBg ? { r: 0, g: 0, b: 0, a: 0 } : { r: 8, g: 12, b: 22, a: 1 } },
    sessionId,
  );

  const html = `<!doctype html>
<html>
<head><meta charset="utf-8"><style>
  html, body { margin: 0; padding: 0; width: ${size}px; height: ${size}px; overflow: hidden; background: transparent; }
  svg { display: block; width: ${size}px; height: ${size}px; }
</style></head>
<body>${svgContent}</body>
</html>`;

  const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
  await cdp.send('Page.navigate', { url: dataUrl }, sessionId);
  await new Promise((r) => setTimeout(r, 80));

  const shot = await cdp.send(
    'Page.captureScreenshot',
    { format: 'png', fromSurface: true, omitBackground: transparentBg },
    sessionId,
  );
  return Buffer.from(shot.data, 'base64');
}

/**
 * Pakuje bufor PNG w wielorozmiarowy plik .ico (standard Vista+ PNG-in-ICO).
 */
function encodeMultiSizeIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = icon
  header.writeUInt16LE(entries.length, 4);

  const dirSize = 16 * entries.length;
  let offset = 6 + dirSize;
  const dirEntries = [];

  for (const { size, png } of entries) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2); // palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    dirEntries.push(entry);
    offset += png.length;
  }

  return Buffer.concat([header, ...dirEntries, ...entries.map((e) => e.png)]);
}

async function main() {
  const iconSvgPath = resolve(ROOT, 'app', 'icon.svg');
  const iconSvg = readFileSync(iconSvgPath, 'utf8');
  const appleSvg = buildOpaqueSquareSvg(iconSvg, 0.90);
  const maskableSvg = buildOpaqueSquareSvg(iconSvg, 0.72); // bezpieczny 20% margines maski Android Adaptive

  const browserPath = findBrowser();
  const port = 9400 + Math.floor(Math.random() * 500);
  const profileDir = resolve(tmpdir(), `icon-gen-${Date.now()}`);

  const child = spawn(
    browserPath,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      `--user-data-dir=${profileDir}`,
      `--remote-debugging-port=${port}`,
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] },
  );

  let cdp;
  try {
    const version = await waitForPort(port);
    cdp = await Cdp.connect(version.webSocketDebuggerUrl);
    const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
    await cdp.send('Page.enable', {}, sessionId);

    const png16 = await renderSvgToPngBuffer(cdp, sessionId, SVG_16, 16, true);
    const png32 = await renderSvgToPngBuffer(cdp, sessionId, iconSvg, 32, true);
    const png48 = await renderSvgToPngBuffer(cdp, sessionId, iconSvg, 48, true);
    const png180 = await renderSvgToPngBuffer(cdp, sessionId, appleSvg, 180, false);
    const png192 = await renderSvgToPngBuffer(cdp, sessionId, iconSvg, 192, true);
    const png512 = await renderSvgToPngBuffer(cdp, sessionId, iconSvg, 512, true);
    const pngMaskable512 = await renderSvgToPngBuffer(cdp, sessionId, maskableSvg, 512, false);

    const icoBuffer = encodeMultiSizeIco([
      { size: 16, png: png16 },
      { size: 32, png: png32 },
      { size: 48, png: png48 },
    ]);

    const targets = [
      { path: resolve(ROOT, 'app', 'favicon.ico'), data: icoBuffer },
      { path: resolve(ROOT, 'app', 'apple-icon.png'), data: png180 },
      { path: resolve(ROOT, 'public', 'icons', 'icon-192.png'), data: png192 },
      { path: resolve(ROOT, 'public', 'icons', 'icon-512.png'), data: png512 },
      { path: resolve(ROOT, 'public', 'icons', 'icon-maskable-512.png'), data: pngMaskable512 },
    ];

    for (const target of targets) {
      mkdirSync(dirname(target.path), { recursive: true });
      writeFileSync(target.path, target.data);
      console.log(`Wygenerowano: ${target.path} (${target.data.length} B)`);
    }
  } finally {
    cdp?.close();
    child.kill();
  }
}

main().catch((err) => {
  console.error(`Błąd generatora ikon: ${err.message}`);
  process.exitCode = 1;
});
