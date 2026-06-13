#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const sharp = require('../backend/node_modules/sharp');
const heicConvert = require('../backend/node_modules/heic-convert');
const { Pool } = require('../backend/node_modules/pg');

const ACCOUNT = process.env.GOG_ACCOUNT || 'hphomesatl@gmail.com';
const DRIVE_ROOT = '1nKoiVAIoyDdWsZzNg7Gj16FrKSOsc05U';
const ROOT = path.resolve(__dirname, '..');
const OUT_ROOT = path.join(ROOT, 'backend', 'uploads', 'inspirations');
const TMP_ROOT = path.join(ROOT, '.tmp', 'drive-inspirations');

const categories = {
  'New builds': 'New Builds',
  'Kitchens': 'Kitchens',
  'Flooring': 'Flooring',
  'Fireplaces': 'Fireplaces',
  'Drywall': 'Drywall',
  'Decks': 'Decks',
  'Closets': 'Closets',
  'Beams': 'Beams',
  'Bathrooms': 'Bathrooms',
  'Basements': 'Basements'
};

function slug(value) {
  return String(value).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function safeName(value) {
  return String(value).replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-|-$/g, '') || 'image';
}

function gog(args) {
  return execFileSync('gog', args, {
    env: { ...process.env, GOG_ACCOUNT: ACCOUNT },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
}

function driveList(parentId, max = 500) {
  const out = gog(['drive', 'ls', '--parent', parentId, '--max', String(max), '--json']);
  return JSON.parse(out).files || [];
}

async function convertToJpeg(source, dest, mimeType) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });

  const isHeic = /hei[cf]/i.test(mimeType) || /\.hei[cf]$/i.test(source);
  const input = isHeic
    ? Buffer.from(await heicConvert({ buffer: fs.readFileSync(source), format: 'JPEG', quality: 0.88 }))
    : source;

  await sharp(input)
    .rotate()
    .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 72, mozjpeg: true })
    .toFile(dest);

  const relativePath = path.relative(OUT_ROOT, dest);
  const thumbPath = path.join(OUT_ROOT, 'thumbs', relativePath);
  fs.mkdirSync(path.dirname(thumbPath), { recursive: true });
  await sharp(dest)
    .resize({ width: 360, height: 360, fit: 'cover', position: 'attention' })
    .jpeg({ quality: 66, mozjpeg: true })
    .toFile(thumbPath);
}

async function main() {
  fs.mkdirSync(OUT_ROOT, { recursive: true });
  fs.mkdirSync(TMP_ROOT, { recursive: true });

  const folders = driveList(DRIVE_ROOT).filter(f => f.mimeType === 'application/vnd.google-apps.folder');
  const wanted = folders.filter(f => categories[f.name]);

  const imported = [];
  const failures = [];

  for (const folder of wanted) {
    const category = categories[folder.name];
    const categorySlug = slug(category);
    const files = driveList(folder.id).filter(file => /^image\//.test(file.mimeType));
    console.log(`\n${category}: ${files.length} image(s)`);

    fs.mkdirSync(path.join(OUT_ROOT, categorySlug), { recursive: true });

    let index = 0;
    for (const file of files) {
      index += 1;
      const base = `${String(index).padStart(3, '0')}-${safeName(file.name)}`;
      const sourceExt = path.extname(file.name) || (file.mimeType === 'image/jpeg' ? '.jpg' : '');
      const tmpPath = path.join(TMP_ROOT, `${folder.id}-${file.id}${sourceExt}`);
      const outName = `${base}.jpg`;
      const outPath = path.join(OUT_ROOT, categorySlug, outName);

      try {
        if (!fs.existsSync(tmpPath)) {
          execFileSync('gog', ['drive', 'download', file.id, '--out', tmpPath, '--no-input'], {
            env: { ...process.env, GOG_ACCOUNT: ACCOUNT },
            stdio: ['ignore', 'ignore', 'pipe']
          });
        }

        if (!fs.existsSync(outPath)) {
          await convertToJpeg(tmpPath, outPath, file.mimeType);
        }

        imported.push({
          category,
          title: path.basename(file.name, path.extname(file.name)),
          description: `Imported from Google Drive Inspirations/${folder.name}`,
          image_url: `/uploads/inspirations/${categorySlug}/${outName}`,
          drive_id: file.id
        });

        if (index % 10 === 0 || index === files.length) {
          console.log(`  ${index}/${files.length}`);
        }
      } catch (err) {
        failures.push({ category, name: file.name, id: file.id, error: err.message });
        console.error(`  failed: ${file.name}: ${err.message}`);
      }
    }
  }

  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || 'hp_home_improvements'
  });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const categoryNames = [...new Set(Object.values(categories))];
    await client.query('DELETE FROM inspirations WHERE category = ANY($1::text[])', [categoryNames]);

    for (const item of imported) {
      await client.query(
        `INSERT INTO inspirations (id, category, title, description, image_url, active, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, true, NOW())`,
        [item.category, item.title, item.description, item.image_url]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }

  const summary = imported.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  fs.writeFileSync(path.join(ROOT, 'backend', 'uploads', 'inspirations', 'import-summary.json'), JSON.stringify({
    importedAt: new Date().toISOString(),
    account: ACCOUNT,
    summary,
    total: imported.length,
    failures
  }, null, 2));

  console.log('\nImport complete');
  console.table(summary);
  console.log(`Total imported: ${imported.length}`);
  if (failures.length) {
    console.log(`Failures: ${failures.length}`);
    console.table(failures.slice(0, 20));
    process.exitCode = 2;
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
