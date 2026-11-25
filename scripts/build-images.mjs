#!/usr/bin/env node
/**
 * Converts supplied master images (assets-src/images/**) into responsive WebP files plus a
 * fallback in public/images/**, and writes src/data/image-manifest.json.
 *
 * Skips files whose outputs are already newer than the source, so it is fast to re-run.
 * Usage: npm run images
 */
import { readdir, stat, mkdir, writeFile, readFile, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(root, 'assets-src/images');
const OUT = path.join(root, 'public/images');
const MANIFEST = path.join(root, 'src/data/image-manifest.json');
const WIDTHS = [320, 640, 1024, 1600, 2400];
const TEXTURE_WIDTHS = [512, 1024];

async function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (/\.(jpe?g|png|webp|svg|mp4|webm)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

async function main() {
  const files = await walk(SRC);
  const previous = existsSync(MANIFEST) ? JSON.parse(await readFile(MANIFEST, 'utf8')) : {};
  const manifest = {};

  if (files.length === 0) {
    await writeFile(MANIFEST, '{}\n');
    console.log('[images] No masters in assets-src/images yet. Placeholders will be shown.');
    return;
  }

  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.error('[images] sharp is not installed. Run `npm install`.');
    process.exit(1);
  }

  for (const file of files) {
    const rel = path.relative(SRC, file).replace(/\\/g, '/');
    const key = rel.replace(/\.[^.]+$/, '');
    if (/\.(svg|mp4|webm)$/i.test(file)) {
      // Vector files (the logo) and videos are copied as they are (videos are pre-compressed).
      await mkdir(path.join(OUT, path.dirname(rel)), { recursive: true });
      await copyFile(file, path.join(OUT, rel));
      if (/\.svg$/i.test(file)) {
        manifest[key] = { width: 0, height: 0, widths: [], fallback: rel };
      } else {
        // One entry per video; WebM listed first (smaller), MP4 as the universal fallback.
        const entry = manifest[key] ?? { width: 0, height: 0, widths: [], fallback: '', sources: [] };
        const type = /\.webm$/i.test(file) ? 'video/webm' : 'video/mp4';
        entry.sources.push({ src: rel, type });
        entry.sources.sort((a, b) => (a.type === 'video/webm' ? -1 : 1) - (b.type === 'video/webm' ? -1 : 1));
        if (type === 'video/mp4' || !entry.fallback) entry.fallback = rel;
        manifest[key] = entry;
      }
      continue;
    }
    const meta0 = await sharp(file).metadata();
    // Transparent images keep their transparency: WebP with alpha + PNG fallback.
    const isPng = /\.png$/i.test(file) || Boolean(meta0.hasAlpha);
    const fallbackExt = isPng ? 'png' : 'jpg';
    const outDir = path.join(OUT, path.dirname(rel));
    const base = path.basename(key);
    const srcTime = (await stat(file)).mtimeMs;

    const meta = meta0;
    const width = meta.width ?? 0;
    const height = meta.height ?? 0;
    const candidates = key.startsWith('textures/') ? TEXTURE_WIDTHS : WIDTHS;
    let widths = candidates.filter((w) => w <= width);
    // Always offer the native width too, so nothing is capped below the master's quality.
    if (widths.length === 0 || width > widths[widths.length - 1] * 1.08) widths.push(width);
    const largest = widths[widths.length - 1];
    const fallback = `${key}-${largest}.${fallbackExt}`;

    const fallbackPath = path.join(OUT, fallback);
    const prev = previous[key];
    const upToDate =
      prev && existsSync(fallbackPath) && (await stat(fallbackPath)).mtimeMs > srcTime &&
      prev.width === width && prev.height === height;

    if (!upToDate) {
      await mkdir(outDir, { recursive: true });
      for (const w of widths) {
        const pipeline = sharp(file).rotate().resize({ width: w, withoutEnlargement: true });
        await pipeline.clone().webp({ quality: 80, alphaQuality: 82, effort: 5 }).toFile(path.join(outDir, `${base}-${w}.webp`));
      }
      const fb = sharp(file).rotate().resize({ width: largest, withoutEnlargement: true });
      // Fallback for browsers without WebP: palette PNG keeps transparency at a fraction of the size.
      if (isPng) await fb.png({ compressionLevel: 9, palette: true, quality: 85, effort: 8 }).toFile(fallbackPath);
      else await fb.jpeg({ quality: 82, mozjpeg: true }).toFile(fallbackPath);
      console.log(`[images] ${rel} → ${widths.join(', ')}px`);
    }
    manifest[key] = { width, height, widths, fallback, ...(isPng ? { alpha: true } : {}) };
  }

  // Social share image from the desktop hero, if supplied.
  const hero = files.find((f) => f.includes('hero/hero-coffee-desktop')) ?? files.find((f) => f.includes('hero/hero-pour-still'));
  if (hero) {
    await sharp(hero).resize(1200, 630, { fit: 'cover', position: 'centre' }).jpeg({ quality: 82 }).toFile(path.join(root, 'public/og-image.jpg'));
  }

  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`[images] ${Object.keys(manifest).length} image(s) ready.`);
}

main().catch((err) => {
  console.error('[images] Failed:', err.message);
  process.exit(1);
});
