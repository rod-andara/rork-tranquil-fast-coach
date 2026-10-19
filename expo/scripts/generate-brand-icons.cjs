/**
 * Rasterize the website's existing vector mark for Expo, without changing its geometry.
 * Requires sharp; SHARP_MODULE_PATH can point at a shared tooling installation.
 * Generated PNGs are checked in, so EAS builds do not need sharp or this script.
 */
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require(process.env.SHARP_MODULE_PATH || 'sharp');

async function main() {
  const root = path.resolve(__dirname, '..');
  const source = await fs.readFile(path.join(root, 'assets/branding/app-icon.svg'), 'utf8');
  const images = path.join(root, 'assets/images');
  const render = (svg, size, file, opaque = false) => {
    let pipeline = sharp(Buffer.from(svg)).resize(size, size);
    if (opaque) pipeline = pipeline.removeAlpha();
    return pipeline.png().toFile(path.join(images, file));
  };
  await render(source, 1024, 'icon.png', true);
  // Android masks this layer; the white symbol stays inside its central safe area.
  await render(source, 1024, 'adaptive-icon.png', true);
  const glyph = source.replace(/<rect[^>]*\/>/, '');
  await render(glyph, 1024, 'splash-icon.png');
  const favicon = source.replace(/<rect[^>]*\/>/, '<circle cx="14" cy="14" r="14" fill="url(#brand)"/>');
  await render(favicon, 64, 'favicon.png');
  for (const file of ['icon.png', 'adaptive-icon.png', 'splash-icon.png', 'favicon.png']) {
    const metadata = await sharp(path.join(images, file)).metadata();
    console.log(`${file}: ${metadata.width}x${metadata.height}, ${metadata.hasAlpha ? 'alpha' : 'opaque'}`);
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
