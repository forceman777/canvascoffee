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
const WIDTHS = [640, 1024, 1600, 2400];
const TEXTURE_WIDTHS = [512, 1024];

async function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (/\.(jpe?g|png|webp|svg)$/i.test(entry.name)) out.push(full);
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
    if (/\.svg$/i.test(file)) {
      // Vector files (the logo) are copied as they are.
      await mkdir(path.join(OUT, path.dirname(rel)), { recursive: true });
      await copyFile(file, path.join(OUT, rel));
      manifest[key] = { width: 0, height: 0, widths: [], fallback: rel };
      continue;
    }
    const isPng = /\.png$/i.test(file);
    const fallbackExt = isPng ? 'png' : 'jpg';
    const outDir = path.join(OUT, path.dirname(rel));
    const base = path.basename(key);
    const srcTime = (await stat(file)).mtimeMs;

    const meta = await sharp(file).metadata();
    const width = meta.width ?? 0;
    const height = meta.height ?? 0;
    const candidates = key.startsWith('textures/') ? TEXTURE_WIDTHS : WIDTHS;
    let widths = candidates.filter((w) => w <= width);
    if (widths.length === 0) widths = [width];
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
        await pipeline.clone().webp({ quality: isPng ? 90 : 80, alphaQuality: 90 }).toFile(path.join(outDir, `${base}-${w}.webp`));
      }
      const fb = sharp(file).rotate().resize({ width: largest, withoutEnlargement: true });
      if (isPng) await fb.png({ compressionLevel: 9 }).toFile(fallbackPath);
      else await fb.jpeg({ quality: 82, mozjpeg: true }).toFile(fallbackPath);
      console.log(`[images] ${rel} → ${widths.join(', ')}px`);
    }
    manifest[key] = { width, height, widths, fallback };
  }

  // Social share image from the desktop hero, if supplied.
  const hero = files.find((f) => f.includes('hero/hero-coffee-desktop'));
  if (hero) {
    await sharp(hero).resize(1200, 630, { fit: 'cover', position: 'right' }).jpeg({ quality: 82 }).toFile(path.join(root, 'public/og-image.jpg'));
  }

  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`[images] ${Object.keys(manifest).length} image(s) ready.`);
}

main().catch((err) => {
  console.error('[images] Failed:', err.message);
  process.exit(1);
});
