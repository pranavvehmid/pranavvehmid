// One animated pixel banner: name drops in, a Red Devil runs in with a trident and scores, GOAL!, then
// "Glory Glory Man United". 12-second loop. Run: node banner.js
const fs = require("fs");
const path = require("path");
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, "profile.json"), "utf8"));

const FONT = {
  A: ["01110","10001","10001","11111","10001","10001","10001"], C: ["01110","10001","10000","10000","10000","10001","01110"],
  D: ["11110","10001","10001","10001","10001","10001","11110"], E: ["11111","10000","10000","11110","10000","10000","11111"],
  G: ["01110","10001","10000","10111","10001","10001","01111"], H: ["10001","10001","10001","11111","10001","10001","10001"],
  I: ["01110","00100","00100","00100","00100","00100","01110"], K: ["10001","10010","10100","11000","10100","10010","10001"],
  L: ["10000","10000","10000","10000","10000","10000","11111"], M: ["10001","11011","10101","10101","10001","10001","10001"],
  N: ["10001","11001","10101","10011","10001","10001","10001"], O: ["01110","10001","10001","10001","10001","10001","01110"],
  P: ["11110","10001","10001","11110","10000","10000","10000"], R: ["11110","10001","10001","11110","10100","10010","10001"],
  S: ["01111","10000","10000","01110","00001","00001","11110"], T: ["11111","00100","00100","00100","00100","00100","00100"],
  U: ["10001","10001","10001","10001","10001","10001","01110"], V: ["10001","10001","10001","10001","10001","01010","00100"],
  Y: ["10001","10001","01010","00100","00100","00100","00100"], "!": ["00100","00100","00100","00100","00100","00000","00100"],
  " ": ["00000","00000","00000","00000","00000","00000","00000"], ".": ["00000","00000","00000","00000","00000","00000","00100"],
};
const glyph = (ch, x, y, cell) => (FONT[ch] || FONT[" "]).map((row, r) => [...row].map((b, c) => (b === "1" ? `<rect x="${x + c * cell}" y="${y + r * cell}" width="${cell - 1}" height="${cell - 1}"/>` : "")).join("")).join("");
const textW = (t, cell) => t.length * 6 * cell - cell;

const W = 1000, H = 420, T = 12; // seconds per loop
const NEON = { pink: "#FF2BD6", cyan: "#21F3FF", lime: "#C6FF00", red: "#FF2E3F", gold: "#FFC93C" };

// name: each letter drops in one after another
const name = cfg.name.toUpperCase();
const cell = 14, nx = (W - textW(name, cell)) / 2, ny = 54;
const nameSvg = [...name].map((ch, i) =>
  `<g class="drop" style="--d:${i}">${glyph(ch, nx + i * 6 * cell, ny, cell)}</g>`).join("");
const aka = (cfg.aka || "").toUpperCase();
const akaCell = 5, ax = (W - textW(aka, akaCell)) / 2;
const akaSvg = aka ? `<g class="aka" fill="${NEON.lime}">${[...aka].map((ch, i) => glyph(ch, ax + i * 6 * akaCell, 166, akaCell)).join("")}</g>` : "";

// Red Devil pixel sprite (12 x 16), two running frames
const DEVIL_TOP = [
  "1..........1",
  "11........11",
  ".1.RRRRRR.1.",
  "..RRRRRRRR..",
  "..RRWRRWRR..",
  "..RRKRRKRR..",
  "..RRRRRRRR..",
  "...RRYYRR...",
  "..RRRRRRRR..",
  ".RRRRRRRRRR.",
  ".RR.RRRR.RR.",
  ".RR.RRRR.RR.",
];
const LEGS_A = ["....R..R....", "...RR..RR...", "..RR....RR..", "..KK....KK.."];
const LEGS_B = ["....RRRR....", ".....RR.....", "....RRRR....", "....KKKK...."];
const COL = { "1": "#FFD7DA", R: NEON.red, W: "#FFFFFF", K: "#111111", Y: NEON.gold };
const sprite = (rows, x0, y0, s) => rows.map((row, r) => [...row].map((ch, c) => (COL[ch] ? `<rect x="${x0 + c * s}" y="${y0 + r * s}" width="${s}" height="${s}" fill="${COL[ch]}"/>` : "")).join("")).join("");
const S = 7; // pixel size of the devil
const devil = `
  <g class="devil">
    ${sprite(DEVIL_TOP, 0, 0, S)}
    <g class="legA">${sprite(LEGS_A, 0, 12 * S, S)}</g>
    <g class="legB">${sprite(LEGS_B, 0, 12 * S, S)}</g>
    <!-- trident -->
    <g fill="${NEON.gold}"><rect x="${12 * S}" y="${-2 * S}" width="${S}" height="${15 * S}"/>
      <rect x="${10 * S}" y="${-2 * S}" width="${5 * S}" height="${S}"/>
      <rect x="${10 * S}" y="${-5 * S}" width="${S}" height="${3 * S}"/><rect x="${12 * S}" y="${-6 * S}" width="${S}" height="${4 * S}"/><rect x="${14 * S}" y="${-5 * S}" width="${S}" height="${3 * S}"/></g>
    <!-- tail -->
    <g fill="${NEON.red}"><rect x="${-2 * S}" y="${10 * S}" width="${2 * S}" height="${S}"/><rect x="${-3 * S}" y="${9 * S}" width="${S}" height="${S}"/><rect x="${-4 * S}" y="${8 * S}" width="${2 * S}" height="${S}"/></g>
  </g>`;

// goal on the right
const goal = `
  <g class="goal" transform="translate(830 236)">
    <rect x="0" y="0" width="120" height="8" fill="#fff"/><rect x="0" y="0" width="8" height="120" fill="#fff"/><rect x="112" y="0" width="8" height="120" fill="#fff"/>
    <g class="net" stroke="#ffffff" stroke-opacity=".35" stroke-width="2">${Array.from({ length: 6 }, (_, i) => `<line x1="${16 + i * 18}" y1="8" x2="${16 + i * 18}" y2="120"/>`).join("")}${Array.from({ length: 6 }, (_, i) => `<line x1="8" y1="${24 + i * 18}" x2="112" y2="${24 + i * 18}"/>`).join("")}</g>
  </g>`;
const ball = `<g class="ball"><g class="spin"><rect x="0" y="4" width="20" height="12" fill="#fff"/><rect x="4" y="0" width="12" height="20" fill="#fff"/><rect x="8" y="8" width="4" height="4" fill="#111"/></g></g>`;

const goalText = "GOAL!";
const gCell = 12, gx = (W - textW(goalText, gCell)) / 2;
const goalSvg = `<g class="goaltxt" fill="${NEON.gold}">${[...goalText].map((ch, i) => glyph(ch, gx + i * 6 * gCell, 150, gCell)).join("")}</g>`;
const chant = (cfg.chant || "GLORY GLORY MAN UNITED").toUpperCase();
const cCell = 6, cx = (W - textW(chant, cCell)) / 2;
const chantSvg = `<g class="chant" fill="${NEON.red}">${[...chant].map((ch, i) => glyph(ch, cx + i * 6 * cCell, 230, cCell)).join("")}</g>`;
const stars = Array.from({ length: 34 }, (_, i) => `<rect x="${(i * 149) % W}" y="${(i * 83) % H}" width="3" height="3" fill="#fff" class="tw" style="animation-delay:${(i % 6) * .45}s"/>`).join("");
const confetti = Array.from({ length: 26 }, (_, i) => {
  const c = [NEON.red, NEON.gold, NEON.cyan, NEON.pink, NEON.lime, "#fff"][i % 6];
  return `<rect x="${60 + ((i * 37) % 880)}" y="-20" width="8" height="8" fill="${c}" class="conf" style="--dx:${((i * 53) % 120) - 60}px;--dl:${(i % 9) * .06}s"/>`;
}).join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${cfg.name}${aka ? " aka " + cfg.aka : ""}. A Red Devil scores: Glory Glory Man United">
<defs>
  <filter id="glow" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#fff" stroke-opacity=".045"/></pattern>
  <linearGradient id="pitch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0B0820" stop-opacity="0"/><stop offset="1" stop-color="#1B0A14"/></linearGradient>
  <style>
    .name { fill: ${NEON.cyan}; filter: url(#glow); }
    .drop { animation: drop ${T}s cubic-bezier(.2,1.4,.4,1) infinite; animation-delay: calc(var(--d) * .12s); }
    @keyframes drop { 0% { transform: translateY(-260px); opacity: 0 } 8% { transform: translateY(0); opacity: 1 } 92% { opacity: 1 } 100% { opacity: 0 } }
    .aka { animation: aka ${T}s ease infinite; }
    @keyframes aka { 0%,12% { opacity: 0 } 18%,92% { opacity: 1 } 100% { opacity: 0 } }
    .devil { animation: run ${T}s linear infinite; }
    @keyframes run { 0%,22% { transform: translate(-160px, 244px) } 46% { transform: translate(560px, 244px) } 50% { transform: translate(560px, 234px) } 54%,100% { transform: translate(560px, 244px) } }
    .legA { animation: legA .3s steps(1) infinite; } .legB { animation: legB .3s steps(1) infinite; }
    @keyframes legA { 0% { opacity: 1 } 50% { opacity: 0 } } @keyframes legB { 0% { opacity: 0 } 50% { opacity: 1 } }
    .ball { animation: ball ${T}s cubic-bezier(.3,.6,.4,1) infinite; }
    @keyframes ball { 0%,46% { transform: translate(676px, 336px) } 58% { transform: translate(890px, 276px) } 64%,100% { transform: translate(900px, 330px) } }
    .spin { animation: spin .6s linear infinite; transform-box: fill-box; transform-origin: center; }
    @keyframes spin { to { transform: rotate(360deg) } }
    .net { animation: net ${T}s ease infinite; transform-box: fill-box; transform-origin: center; }
    @keyframes net { 0%,57% { transform: scale(1) } 60% { transform: scale(1.08, 1.04) } 63%,100% { transform: scale(1) } }
    .goaltxt { filter: url(#glow); animation: goal ${T}s ease infinite; transform-box: fill-box; transform-origin: center; }
    @keyframes goal { 0%,57% { opacity: 0; transform: scale(.3) } 61% { opacity: 1; transform: scale(1.15) } 64%,74% { opacity: 1; transform: scale(1) } 70% { opacity: .5 } 78%,100% { opacity: 0; transform: scale(1) } }
    .conf { animation: conf ${T}s linear infinite; }
    @keyframes conf { 0%,58% { transform: translate(0, 0); opacity: 0 } 60% { opacity: 1 } 80% { transform: translate(var(--dx), 380px) rotate(200deg); opacity: 1 } 81%,100% { opacity: 0 } }
    .chant { filter: url(#glow); animation: chant ${T}s ease infinite; }
    @keyframes chant { 0%,70% { opacity: 0; transform: translateY(14px) } 76% { opacity: 1; transform: translateY(0) } 80% { opacity: .6 } 84%,94% { opacity: 1 } 100% { opacity: 0 } }
    .tw { animation: tw 2.6s steps(2) infinite; } @keyframes tw { 50% { opacity: .08 } }
    .frame { animation: frame ${T}s ease infinite; } @keyframes frame { 0%,58% { stroke: ${NEON.pink} } 61%,80% { stroke: ${NEON.gold} } 100% { stroke: ${NEON.pink} } }
  </style>
</defs>
  <rect width="${W}" height="${H}" rx="26" fill="#0B0820"/>
  <rect width="${W}" height="${H}" rx="26" fill="url(#grid)"/>
  <rect y="240" width="${W}" height="${H - 240}" rx="26" fill="url(#pitch)"/>
  ${stars}
  <rect class="frame" x="16" y="16" width="${W - 32}" height="${H - 32}" rx="20" fill="none" stroke-width="3" filter="url(#glow)"/>
  <g class="name">${nameSvg}</g>
  ${akaSvg}
  ${goal}
  ${devil}
  ${ball}
  ${confetti}
  ${goalSvg}
  ${chantSvg}
</svg>`;
fs.writeFileSync(path.join(__dirname, "assets", "banner.svg"), svg);
console.log("banner.svg", svg.length, "bytes");
