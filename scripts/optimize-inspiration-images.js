#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const sharp = require('../backend/node_modules/sharp');

const ROOT = path.resolve(__dirname, '..');
const IMG_ROOT = path.join(ROOT, 'backend', 'uploads', 'inspirations');
const THUMB_ROOT = path.join(IMG_ROOT, 'thumbs');

async function optimize(file) {
  const rel = path.relative(IMG_ROOT, file);
  if (rel.startsWith(`thumbs${path.sep}`)) return null;

  const tmp = `${file}.tmp`;
  const thumb = path.join(THUMB_ROOT, rel);
  fs.mkdirSync(path.dirname(thumb), { recursive: true });

  const before = fs.statSync(file).size;

  await sharp(file)
    .rotate()
    .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 72, mozjpeg: true })
    .toFile(tmp);
  fs.renameSync(tmp, file);

  await sharp(file)
    .resize({ width: 280, height: 280, fit: 'cover', position: 'attention' })
    .jpeg({ quality: 58, mozjpeg: true })
    .toFile(thumb);

  const after = fs.statSync(file).size;
  const thumbSize = fs.statSync(thumb).size;
  return { file, before, after, thumbSize };
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (/\.jpe?g$/i.test(entry.name)) out.push(p);
  }
  return out;
}

(async () => {
  const files = walk(IMG_ROOT).filter(file => !path.relative(IMG_ROOT, file).startsWith(`thumbs${path.sep}`));
  let totalBefore = 0;
  let totalAfter = 0;
  let totalThumbs = 0;
  let count = 0;

  for (const file of files) {
    const result = await optimize(file);
    if (!result) continue;
    count += 1;
    totalBefore += result.before;
    totalAfter += result.after;
    totalThumbs += result.thumbSize;
    if (count % 25 === 0 || count === files.length) {
      console.log(`${count}/${files.length}`);
    }
  }

  const summary = {
    optimizedAt: new Date().toISOString(),
    count,
    originalMb: +(totalBefore / 1024 / 1024).toFixed(2),
    optimizedFullMb: +(totalAfter / 1024 / 1024).toFixed(2),
    thumbnailsMb: +(totalThumbs / 1024 / 1024).toFixed(2),
    totalServedMb: +((totalAfter + totalThumbs) / 1024 / 1024).toFixed(2),
    fullReductionPercent: +((1 - totalAfter / totalBefore) * 100).toFixed(1)
  };

  fs.writeFileSync(path.join(IMG_ROOT, 'optimization-summary.json'), JSON.stringify(summary, null, 2));
  console.log(summary);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
