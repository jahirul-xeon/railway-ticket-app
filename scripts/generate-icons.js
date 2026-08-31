/* Generates the app icon set from an SVG train emblem.
   Run: node scripts/generate-icons.js */
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const GREEN = '#0B6E4F';
const GREEN_DARK = '#095C42';
const WHITE = '#FFFFFF';
const AMBER = '#F4A300';

const OUT = path.join(__dirname, '..', 'assets', 'images');

// The train emblem, drawn in a 1024x1024 space. `detail` colours the windows
// (null = solid white silhouette for the monochrome icon).
function trainMark({ detail = GREEN, body = WHITE } = {}) {
  const windows =
    detail === null
      ? ''
      : `
    <rect x="372" y="330" width="280" height="150" rx="46" fill="${detail}"/>
    <rect x="500" y="330" width="24" height="150" fill="${body}"/>
    <rect x="392" y="620" width="240" height="26" rx="13" fill="${detail}"/>
    <circle cx="410" cy="560" r="30" fill="${AMBER}"/>
    <circle cx="614" cy="560" r="30" fill="${AMBER}"/>`;
  const wheelHub = detail === null ? '' : `
    <circle cx="392" cy="742" r="22" fill="${detail}"/>
    <circle cx="632" cy="742" r="22" fill="${detail}"/>`;
  return `
    <rect x="312" y="250" width="400" height="470" rx="150" fill="${body}"/>
    <rect x="292" y="560" width="440" height="120" rx="34" fill="${body}"/>
    ${windows}
    <circle cx="392" cy="742" r="52" fill="${body}"/>
    <circle cx="632" cy="742" r="52" fill="${body}"/>
    ${wheelHub}
    <rect x="150" y="700" width="150" height="26" rx="13" fill="${body}"/>
    <rect x="724" y="700" width="150" height="26" rx="13" fill="${body}"/>
    <rect x="196" y="628" width="104" height="22" rx="11" fill="${body}" opacity="0.85"/>
    <rect x="724" y="628" width="104" height="22" rx="11" fill="${body}" opacity="0.85"/>`;
}

function centered(inner, scale) {
  return `<g transform="translate(512,512) scale(${scale}) translate(-512,-512)">${inner}</g>`;
}

// full-bleed rounded-green app icon
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${GREEN}"/><stop offset="1" stop-color="${GREEN_DARK}"/>
  </linearGradient></defs>
  <rect width="1024" height="1024" fill="url(#g)"/>
  ${centered(trainMark(), 0.78)}
</svg>`;

// adaptive foreground (transparent, content in central safe zone)
const foregroundSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${centered(trainMark(), 0.6)}
</svg>`;

// adaptive background (solid green)
const backgroundSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="${GREEN}"/>
</svg>`;

// adaptive monochrome (white silhouette, transparent)
const monochromeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${centered(trainMark({ detail: null }), 0.6)}
</svg>`;

// splash mark (white train, transparent — shown on the green splash bg)
const splashSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  ${centered(trainMark(), 0.9)}
</svg>`;

function render(svg, width, file) {
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng();
  fs.writeFileSync(path.join(OUT, file), png);
  console.log('wrote', file, `(${width}px)`);
}

render(iconSvg, 1024, 'icon.png');
render(foregroundSvg, 1024, 'android-icon-foreground.png');
render(backgroundSvg, 1024, 'android-icon-background.png');
render(monochromeSvg, 1024, 'android-icon-monochrome.png');
render(splashSvg, 1024, 'splash-icon.png');
render(iconSvg, 96, 'favicon.png');
console.log('Done.');
