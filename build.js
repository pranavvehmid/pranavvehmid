// Builds the animated pixel-neon SVGs for the GitHub profile README.  Run: node build.js
const fs = require("fs");
const path = require("path");

// 5x7 pixel font (only the characters we use)
const FONT = {
  A: ["01110","10001","10001","11111","10001","10001","10001"], B: ["11110","10001","10001","11110","10001","10001","11110"],
  C: ["01110","10001","10000","10000","10000","10001","01110"], D: ["11110","10001","10001","10001","10001","10001","11110"],
  E: ["11111","10000","10000","11110","10000","10000","11111"], F: ["11111","10000","10000","11110","10000","10000","10000"],
  G: ["01110","10001","10000","10111","10001","10001","01111"], H: ["10001","10001","10001","11111","10001","10001","10001"],
  I: ["01110","00100","00100","00100","00100","00100","01110"], L: ["10000","10000","10000","10000","10000","10000","11111"],
  M: ["10001","11011","10101","10101","10001","10001","10001"], N: ["10001","11001","10101","10011","10001","10001","10001"],
  O: ["01110","10001","10001","10001","10001","10001","01110"], P: ["11110","10001","10001","11110","10000","10000","10000"],
  R: ["11110","10001","10001","11110","10100","10010","10001"], S: ["01111","10000","10000","01110","00001","00001","11110"],
  T: ["11111","00100","00100","00100","00100","00100","00100"], U: ["10001","10001","10001","10001","10001","10001","01110"],
  V: ["10001","10001","10001","10001","10001","01010","00100"], W: ["10001","10001","10001","10101","10101","10101","01010"],
  Y: ["10001","10001","01010","00100","00100","00100","00100"], K: ["10001","10010","10100","11000","10100","10010","10001"],
  "!": ["00100","00100","00100","00100","00100","00000","00100"], " ": ["00000","00000","00000","00000","00000","00000","00000"],
  "@": ["01110","10001","10111","10101","10111","10000","01110"], "/": ["00001","00010","00010","00100","01000","01000","10000"],
  "-": ["00000","00000","00000","11111","00000","00000","00000"], "<": ["00010","00100","01000","10000","01000","00100","00010"],
  ">": ["01000","00100","00010","00001","00010","00100","01000"], ".": ["00000","00000","00000","00000","00000","00000","00100"],
  "2": ["01110","10001","00001","00110","01000","10000","11111"], "0": ["01110","10011","10101","10101","11001","10001","01110"],
  "6": ["00110","01000","10000","11110","10001","10001","01110"], "7": ["11111","00001","00010","00100","01000","01000","01000"],
  "9": ["01110","10001","10001","01111","00001","00010","01100"],
};
function pixelText(text, x, y, cell, fill, cls = "") {
  let out = "", cx = x;
  for (const ch of text.toUpperCase()) {
    const g = FONT[ch] || FONT[" "];
    g.forEach((row, r) => [...row].forEach((b, c) => { if (b === "1") out += `<rect x="${cx + c * cell}" y="${y + r * cell}" width="${cell - 1}" height="${cell - 1}"/>`; }));
    cx += 6 * cell;
  }
  return { svg: `<g fill="${fill}" class="${cls}">${out}</g>`, width: cx - x - cell };
}
const center = (text, cell, W) => (W - (text.length * 6 * cell - cell)) / 2;

const BG = "#0B0820", NEON = { pink: "#FF2BD6", cyan: "#21F3FF", lime: "#C6FF00", red: "#FF2E3F", gold: "#FFC93C", purple: "#9B5CFF" };
const defs = `
  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <pattern id="grid" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0H0V16" fill="none" stroke="#ffffff" stroke-opacity=".05"/></pattern>`;

// ---------- 1. header ----------
function header(name, tagline) {
  const W = 1000, H = 320;
  const t = pixelText(name, center(name, 14, W), 70, 14, NEON.cyan, "title");
  const s = pixelText(tagline, center(tagline, 4, W), 200, 4, NEON.lime, "sub");
  const bubbles = [[90, 260, 18, NEON.pink, 0], [930, 80, 24, NEON.cyan, 1.2], [160, 70, 12, NEON.lime, .6], [860, 250, 14, NEON.purple, 1.8], [500, 285, 10, NEON.gold, 2.4]]
    .map(([x, y, r, c, d]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${c}" stroke-width="3" class="bub" style="animation-delay:${d}s"/>`).join("");
  const stars = Array.from({ length: 28 }, (_, i) => { const x = (i * 137) % W, y = (i * 71) % H; return `<rect x="${x}" y="${y}" width="3" height="3" fill="#fff" class="tw" style="animation-delay:${(i % 7) * .4}s"/>`; }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${name}: ${tagline}">
  <defs>${defs}
  <style>
    .title { filter: url(#glow); animation: flick 5s infinite; }
    .sub { animation: hue 8s linear infinite; }
    .bub { animation: float 6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
    .tw { animation: tw 2.8s steps(2) infinite; }
    .ball { animation: bounce 1.6s cubic-bezier(.3,0,.7,1) infinite; }
    .roll { animation: roll 7s linear infinite; }
    .cur { animation: blink 1s steps(2) infinite; }
    @keyframes flick { 0%,18%,22%,62%,64%,100% { opacity: 1 } 20%,63% { opacity: .55 } }
    @keyframes hue { to { filter: hue-rotate(360deg) } }
    @keyframes float { 0%,100% { transform: translateY(0) scale(1) } 50% { transform: translateY(-14px) scale(1.08) } }
    @keyframes tw { 50% { opacity: .1 } }
    @keyframes bounce { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-34px) } }
    @keyframes roll { from { transform: translateX(-60px) } to { transform: translateX(1060px) } }
    @keyframes blink { 50% { opacity: 0 } }
  </style></defs>
  <rect width="${W}" height="${H}" rx="26" fill="${BG}"/>
  <rect width="${W}" height="${H}" rx="26" fill="url(#grid)"/>
  ${stars}${bubbles}
  <rect x="24" y="24" width="${W - 48}" height="${H - 48}" rx="20" fill="none" stroke="${NEON.pink}" stroke-width="3" filter="url(#glow)" opacity=".8"/>
  ${t.svg}
  ${s.svg}
  <rect x="${center(tagline, 4, W) + s.width + 10}" y="200" width="12" height="28" fill="${NEON.lime}" class="cur"/>
  <g class="roll"><g class="ball" transform="translate(0 0)">
    <g transform="translate(0 262)" fill="#fff"><rect x="6" y="0" width="18" height="6"/><rect x="0" y="6" width="30" height="18"/><rect x="6" y="24" width="18" height="6"/>
    <rect x="12" y="10" width="6" height="6" fill="#111"/><rect x="4" y="16" width="5" height="5" fill="#111"/><rect x="21" y="16" width="5" height="5" fill="#111"/></g></g></g>
</svg>`;
}

// ---------- 2. Man United box ----------
function united() {
  const W = 1000, H = 220;
  const big = pixelText("GLORY GLORY", 60, 46, 7, NEON.red, "neon");
  const big2 = pixelText("MAN UNITED", 60, 116, 7, NEON.gold, "neon2");
  const ticker = "  GGMU  *  RED DEVILS  *  THEATRE OF DREAMS  *  OLD TRAFFORD  *  UNITED TILL I DIE  *  ";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Manchester United fan: Glory Glory Man United">
  <defs>${defs}
  <style>
    .neon { filter: url(#glow); animation: pulse 2.4s ease-in-out infinite; }
    .neon2 { filter: url(#glow); animation: pulse 2.4s ease-in-out infinite .6s; }
    .tick { animation: tick 18s linear infinite; font: 700 20px "Courier New", monospace; letter-spacing: 3px; }
    .flame { animation: flame .5s steps(2) infinite; transform-box: fill-box; transform-origin: bottom; }
    .crowd rect { animation: jump 1.2s ease-in-out infinite; }
    @keyframes pulse { 50% { opacity: .65 } }
    @keyframes tick { from { transform: translateX(0) } to { transform: translateX(-960px) } }
    @keyframes flame { 50% { transform: scaleY(.75) } }
    @keyframes jump { 50% { transform: translateY(-6px) } }
  </style></defs>
  <rect width="${W}" height="${H}" rx="24" fill="#14060B"/>
  <rect width="${W}" height="${H}" rx="24" fill="url(#grid)"/>
  <rect x="14" y="14" width="${W - 28}" height="${H - 28}" rx="18" fill="none" stroke="${NEON.red}" stroke-width="3" filter="url(#glow)"/>
  ${big.svg}${big2.svg}
  <!-- pixel pitchfork + flame -->
  <g transform="translate(830 40)" fill="${NEON.red}" filter="url(#glow)">
    <rect x="30" y="20" width="8" height="100"/><rect x="6" y="20" width="56" height="8"/>
    <rect x="6" y="0" width="8" height="28"/><rect x="30" y="0" width="8" height="28"/><rect x="54" y="0" width="8" height="28"/>
    <g class="flame" fill="${NEON.gold}"><rect x="24" y="122" width="20" height="10"/><rect x="28" y="132" width="12" height="8"/></g>
  </g>
  <g class="crowd" fill="${NEON.red}" opacity=".7">${Array.from({ length: 14 }, (_, i) => `<rect x="${560 + i * 18}" y="${150 + (i % 2) * 4}" width="12" height="12" rx="3" style="animation-delay:${(i % 5) * .15}s"/>`).join("")}</g>
  <clipPath id="tc"><rect x="30" y="176" width="940" height="30"/></clipPath>
  <g clip-path="url(#tc)"><text class="tick" x="30" y="198" fill="${NEON.gold}">${ticker.repeat(3)}</text></g>
</svg>`;
}

// ---------- 3. bubbles box ----------
function bubbles(items) {
  const W = 1000, H = 250;
  const cols = [NEON.cyan, NEON.pink, NEON.lime, NEON.gold, NEON.purple, NEON.red];
  const pos = [[40, 34], [520, 34], [40, 104], [520, 104], [40, 174], [520, 174]];
  const boxes = items.slice(0, 6).map(([icon, text], i) => {
    const [x, y] = pos[i], c = cols[i];
    return `<g class="b" style="animation-delay:${i * .35}s">
      <rect x="${x + 5}" y="${y + 5}" width="440" height="52" rx="26" fill="#000"/>
      <rect x="${x}" y="${y}" width="440" height="52" rx="26" fill="#120F2A" stroke="${c}" stroke-width="3"/>
      <rect x="${x + 10}" y="${y + 10}" width="32" height="32" rx="8" fill="${c}"/>
      <text x="${x + 26}" y="${y + 33}" text-anchor="middle" font-size="18">${icon}</text>
      <text x="${x + 56}" y="${y + 33}" fill="#fff" font-family="Segoe UI, Arial, sans-serif" font-weight="700" font-size="18">${text}</text></g>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="About me">
  <defs>${defs}<style>.b { animation: in 7s ease-in-out infinite; } @keyframes in { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }</style></defs>
  <rect width="${W}" height="${H}" rx="24" fill="${BG}"/>
  <rect width="${W}" height="${H}" rx="24" fill="url(#grid)"/>
  ${boxes}
</svg>`;
}

const out = path.join(__dirname, "assets");
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, "profile.json"), "utf8"));
fs.writeFileSync(path.join(out, "header.svg"), header(cfg.name, cfg.tagline));
fs.writeFileSync(path.join(out, "united.svg"), united());
fs.writeFileSync(path.join(out, "about.svg"), bubbles(cfg.about));
console.log("built", fs.readdirSync(out));
