import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import manifest from '../../app/manifest';

const ROOT = resolve(import.meta.dirname, '..', '..');

test('favicon.ico istnieje i jest poprawnym wielorozmiarowym plikiem ICO (>= 3 rozmiary)', () => {
  const icoPath = resolve(ROOT, 'app', 'favicon.ico');
  assert.equal(existsSync(icoPath), true, 'Brak pliku app/favicon.ico');

  const buf = readFileSync(icoPath);
  assert.ok(buf.length > 100, 'Plik favicon.ico jest zbyt mały');
  assert.equal(buf.readUInt16LE(0), 0, 'Niepoprawne pole reserved w nagłówku ICO');
  assert.equal(buf.readUInt16LE(2), 1, 'Niepoprawny typ zasobu ICO (oczekiwano 1)');

  const count = buf.readUInt16LE(4);
  assert.ok(count >= 3, `Oczekiwano >= 3 rozmiarów w ICO, otrzymano ${count}`);

  const widths = [];
  for (let i = 0; i < count; i += 1) {
    const entryOffset = 6 + i * 16;
    const rawW = buf.readUInt8(entryOffset);
    widths.push(rawW === 0 ? 256 : rawW);
  }
  assert.ok(widths.includes(16), 'Brak wariantu 16x16 w favicon.ico');
  assert.ok(widths.includes(32), 'Brak wariantu 32x32 w favicon.ico');
  assert.ok(widths.includes(48), 'Brak wariantu 48x48 w favicon.ico');
});

test('app/icon.svg jest poprawnym wektorowym SVG z żarówką bez zewnętrznych URL', () => {
  const svgPath = resolve(ROOT, 'app', 'icon.svg');
  assert.equal(existsSync(svgPath), true, 'Brak pliku app/icon.svg');

  const svg = readFileSync(svgPath, 'utf8');
  assert.ok(svg.includes('<svg') && svg.includes('</svg>'), 'Niepoprawna struktura XML SVG');
  assert.ok(svg.includes('viewBox="0 0 64 64"'), 'Oczekiwano viewBox 0 0 64 64');
  const svgWithoutXmlns = svg.replace(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, '');
  assert.equal(/https?:\/\//i.test(svgWithoutXmlns), false, 'Ikona SVG nie może odwoływać się do zewnętrznych URL');
});

test('app/apple-icon.png i public/icons/*.png istnieją z poprawną sygnaturą PNG', () => {
  const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const paths = [
    resolve(ROOT, 'app', 'apple-icon.png'),
    resolve(ROOT, 'public', 'icons', 'icon-192.png'),
    resolve(ROOT, 'public', 'icons', 'icon-512.png'),
    resolve(ROOT, 'public', 'icons', 'icon-maskable-512.png'),
  ];

  for (const filePath of paths) {
    assert.equal(existsSync(filePath), true, `Brak pliku ikony: ${filePath}`);
    const data = readFileSync(filePath);
    assert.ok(data.subarray(0, 8).equals(PNG_SIG), `Niepoprawna sygnatura PNG: ${filePath}`);
  }
});

test('app/manifest.ts zwraca poprawny manifest PWA JASNE E8 z ikonami any i maskable', () => {
  const data = manifest();
  assert.equal(data.short_name, 'JASNE E8');
  assert.equal(data.lang, 'pl');
  assert.equal(data.display, 'standalone');
  assert.ok(Array.isArray(data.icons) && data.icons.length >= 3);

  const purposes = data.icons.map((icon) => icon.purpose);
  assert.ok(purposes.includes('any'));
  assert.ok(purposes.includes('maskable'));
});
