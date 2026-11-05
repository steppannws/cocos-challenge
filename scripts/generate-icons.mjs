// Renders src/assets/brand/icon.svg into the app icons: pnpm assets:icons
// iOS takes one 1024 px PNG (Xcode scales it). Android gets the legacy PNGs for API < 26;
// API 26+ uses the adaptive icon XML in res/mipmap-anydpi-v26 instead.
// sharp is a dependency of react-native-bootsplash, so it is already installed.
import { mkdirSync, readFileSync } from 'node:fs';
import sharp from 'sharp';

const svg = readFileSync('src/assets/brand/icon.svg');
const iosDir = 'ios/CocosChallenge/Images.xcassets/AppIcon.appiconset';
const resDir = 'android/app/src/main/res';
const densities = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };

const mask = (size, shape) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">${shape}</svg>`,
  );
const rounded = (size) =>
  mask(size, `<rect width="${size}" height="${size}" rx="${size * 0.18}"/>`);
const circle = (size) => mask(size, `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/>`);

const render = (size, shape) =>
  sharp(svg)
    .resize(size, size)
    .composite([{ input: shape(size), blend: 'dest-in' }])
    .png();

// App Store Connect rejects a marketing icon with an alpha channel.
await sharp(svg).resize(1024, 1024).removeAlpha().png().toFile(`${iosDir}/AppIcon.png`);

for (const [density, size] of Object.entries(densities)) {
  const dir = `${resDir}/mipmap-${density}`;
  mkdirSync(dir, { recursive: true });
  await render(size, rounded).toFile(`${dir}/ic_launcher.png`);
  await render(size, circle).toFile(`${dir}/ic_launcher_round.png`);
}
