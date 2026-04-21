// public/apple-touch-icon.svg を iOS が要求する PNG に変換するスクリプト。
// `npm run icons` で再生成できます。sharp (devDependency) に依存。

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '..', 'public');

async function render(srcSvg, dstPng, size) {
  const svg = await readFile(resolve(publicDir, srcSvg));
  const buffer = await sharp(svg, { density: 320 })
    .resize(size, size, { fit: 'contain' })
    .png()
    .toBuffer();
  await writeFile(resolve(publicDir, dstPng), buffer);
  console.log(`wrote ${dstPng} (${size}x${size})`);
}

await render('apple-touch-icon.svg', 'apple-touch-icon.png', 180);
