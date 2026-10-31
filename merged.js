// One cohesive banner: pixel Pranav (hood, curls, green neon rim) stands in falling binary,
// conjures cubes -> they fuse into a pixel football -> keepy-ups -> volley into the goal ->
// net ripples, rain flares -> MERGED! -> PRANAV / GGMU card -> fade, loop (14 s).
// Run: node merged.js  -> assets/banner.svg
const fs = require("fs");
const path = require("path");
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, "profile.json"), "utf8"));

const W = 1200, H = 440, T = 14;
const G = "#39FF14", GD = "#1F8F0A", RED = "#E5202E", GOLD = "#FBE122";
const P = 7;                         // character pixel size
const CX = 110, GROUND = 412;         // character left edge, floor line
const CY = GROUND - 32 * P;           // character top
const k = (s) => +((typeof s === "string" ? t[s] : s) / T * 100).toFixed(2);
const t = { idle: .3, fuse: 3.8, keepy: 4.4, volley: 7.4, impact: 8.2, merged: 8.3, mergedOut: 10.1, card: 10.2, fade: 13.3 };

// ---------- the character (same build as the avatar) ----------
const N = 32;
const COL = { H: "#191919", h: "#5A5A5A", K: "#141414", k: "#262626", B: "#050505", S: "#C98A5C", s: "#8E5A38", E: "#8CFF6A", W: GD };
const grid = Array.from({ length: N }, () => Array(N).fill(""));
const inCircle = (x, y, cx, cy, r) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
const inEllipse = (x, y, cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
  const px = x + .5, py = y + .5 - 2.5;
  if (py >= 17) { const hw = 7 + (py - 17) * .55; if (Math.abs(px - 16) <= Math.min(hw, 15)) grid[y][x] = "K"; }
  if (inEllipse(px, py, 16, 11, 8.6, 7.6)) grid[y][x] = "K";
  if (inEllipse(px, py, 16, 11, 8.6, 7.6) && !inEllipse(px, py, 16, 11, 7.4, 6.6)) grid[y][x] = "k";
  const hair = [[11, 5, 3.2], [15, 3.6, 3.4], [19.5, 4.6, 3.2], [13, 7, 3], [18.5, 7, 3], [16, 6, 3], [9.5, 8, 2], [22.5, 8, 2]];
  if (hair.some(([cx, cy, r]) => inCircle(px, py, cx, cy, r))) {
    let best = 9;
    for (let cy = 1; cy < 11; cy += 2.2) for (let cx = 7 + ((cy * 10) % 2); cx < 26; cx += 2.4) best = Math.min(best, Math.hypot(px - cx, py - cy));
    grid[y][x] = best > .55 && best < 1.05 ? "h" : "H";
  }
  if (inEllipse(px, py, 16, 12.2, 4.6, 3.6)) grid[y][x] = "B";
  if (py >= 18 && Math.abs(px - 16) <= 2.6) grid[y][x] = "B";
  if (py >= 18 && py <= 27 && (Math.abs(px - 16) - 2.6 > 0 && Math.abs(px - 16) - 2.6 < 1.2 + (py - 18) * .12)) grid[y][x] = "k";
}
for (let y = 20; y <= 24; y++) { grid[y][14] = "W"; grid[y][18] = "W"; }
const solid = (x, y) => x >= 0 && y >= 0 && x < N && y < N && grid[y][x];
const rect = (x, y, c, s = P) => `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${c}"/>`;
let body = "", rim = "";
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
  if (grid[y][x]) body += rect(CX + x * P, CY + y * P, COL[grid[y][x]]);
  else if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) rim += rect(CX + x * P, CY + y * P, G);
}
const eyes = rect(CX + 14 * P, CY + 14 * P, COL.E) + rect(CX + 18 * P, CY + 14 * P, COL.E);
const hand = (gx, gy, flip) => ["..SSS.", ".SSSSS", "SSSSSs", "SsSsSs", "S.S.S."].map((r, dy) => [...r].map((c, dx) => c !== "." ? rect(CX + (flip ? gx + 5 - dx : gx + dx) * P, CY + (gy + dy) * P, COL[c]) : "").join("")).join("");
const cube = (gx, gy, s, cls) => `<g class="${cls}"><rect x="${CX + gx * P}" y="${CY + gy * P}" width="${s * P}" height="${s * P}" fill="#111" stroke="${G}" stroke-width="3"/><rect x="${CX + gx * P + 5}" y="${CY + gy * P + 5}" width="${s * P - 10}" height="4" fill="#2c2c2c"/></g>`;

// pixel football (8x8)
const BALL = ["..wwww..", ".wwbbww.", "wwbbbbww", "wwwbbwww", "wbwwwwbw", "wbbwwbbw", ".wwwwww.", "..wwww.."];
const bp = 4;
const ballSvg = BALL.map((r, y) => [...r].map((c, x) => c === "." ? "" : `<rect x="${x * bp - 16}" y="${y * bp - 16}" width="${bp}" height="${bp}" fill="${c === "b" ? "#111" : "#fff"}"/>`).join("")).join("");
const HANDS_Y = CY + 25 * P;               // top of hands
const BX = CX + 16 * P, BY = HANDS_Y - 14; // ball rest point between the hands

// ---------- binary rain (pixel 0/1 glyphs) ----------
const DIG = { "0": ["111", "101", "101", "101", "111"], "1": ["010", "110", "010", "010", "111"] };
const dg = (d, x, y, s) => DIG[d].map((r, yy) => [...r].map((c, xx) => c === "1" ? `<rect x="${x + xx * s}" y="${y + yy * s}" width="${s}" height="${s}"/>` : "").join("")).join("");
const cols = [];
for (let i = 0; i < 30; i++) {
  const x = 12 + i * 40 + (i % 3) * 4, s = 3, len = 14, gap = 22;
  let g = "";
  for (let j = 0; j < len; j++) g += `<g opacity="${(0.15 + 0.85 * (j / len)).toFixed(2)}">${dg(((i * 7 + j * 3) % 5) > 2 ? "1" : "0", x, j * gap, s)}</g>`;
  const dur = 3.2 + (i % 5) * .7, delay = ((i * 1.37) % dur).toFixed(2);
  cols.push(`<g class="col" style="animation-duration:${dur}s;animation-delay:-${delay}s">${g}</g>`);
}

// ---------- goal ----------
const GX = 980, BAR = 250;
const net = `<g class="net" stroke="${G}" stroke-opacity=".35" stroke-width="2">${Array.from({ length: 8 }, (_, i) => `<line x1="${GX + 14 + i * 16}" y1="${BAR + 8}" x2="${GX + 24 + i * 16}" y2="${GROUND}"/>`).join("")}${Array.from({ length: 8 }, (_, i) => `<line x1="${GX + 8}" y1="${BAR + 22 + i * 18}" x2="${GX + 142}" y2="${BAR + 26 + i * 18}"/>`).join("")}</g>`;
const goal = `<g filter="url(#glow)"><rect x="${GX}" y="${BAR}" width="150" height="7" fill="${G}"/><rect x="${GX}" y="${BAR}" width="7" height="${GROUND - BAR}" fill="${G}"/><rect x="${GX + 143}" y="${BAR}" width="7" height="${GROUND - BAR}" fill="${G}"/></g>${net}`;

// ---------- pixel text ----------
const F = {
  A:"01110100011000111111100011000110001", D:"11110100011000110001100011000111110", E:"11111100001000011110100001000011111",
  G:"01110100011000010111100011000101111", M:"10001110111010110101100011000110001", N:"10001110011010110011100011000110001",
  P:"11110100011000111110100001000010000", R:"11110100011000111110101001001010001", U:"10001100011000110001100011000101110",
  V:"10001100011000110001100010101000100", H:"10001100011111110001100011000110001", I:"01110001000010000100001000010001110",
  "!":"00100001000010000100001000000000100", " ":"00000000000000000000000000000000000",
};
const word = (w, x, y, s, cls) => [...w].map((ch, i) => { let o = ""; const g = F[ch] || F[" "]; for (let q = 0; q < 35; q++) if (g[q] === "1") o += `<rect x="${x + i * 6 * s + (q % 5) * s}" y="${y + Math.floor(q / 5) * s}" width="${s - 1}" height="${s - 1}"/>`; return `<g class="${cls}" style="--i:${i}">${o}</g>`; }).join("");
const tw = (w, s) => w.length * 6 * s - s;
const MW = (cfg.goalWord || "MERGED!").toUpperCase(), mS = 16, mX = 380 + (560 - tw(MW, mS)) / 2;
const NAME = (cfg.name || "PRANAV").toUpperCase(), nS = 15, nX = 440, nY = 92;
const CH = (cfg.chant || "GGMU").toUpperCase(), cS = 13, cX = nX, cY = nY + 7 * nS + 30;

// speech bubble above the character
const bubble = (w, cls) => `<g class="${cls}"><rect x="${CX + 150}" y="${CY - 10}" width="${w.length * 30 + 22}" height="56" rx="10" fill="#fff"/><rect x="${CX + 160}" y="${CY + 44}" width="12" height="12" fill="#fff"/><g fill="#111">${word(w, CX + 162, CY + 2, 5, "")}</g></g>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Pixel ${NAME} in falling binary: cubes become a football, keepy-ups, volley into the goal. ${MW} ${CH}.">
<defs>
  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <radialGradient id="vig" cx=".5" cy=".55" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></radialGradient>
  <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${G}" stop-opacity=".22"/><stop offset="1" stop-color="${G}" stop-opacity="0"/></linearGradient>
  <clipPath id="c"><rect width="${W}" height="${H}" rx="24"/></clipPath>
  <style>
    .col { fill: ${G}; animation: fall 4s linear infinite; } @keyframes fall { from { transform: translateY(-310px) } to { transform: translateY(${H}px) } }
    .rain { opacity: .55; animation: rain ${T}s linear infinite; }
    @keyframes rain { 0%, ${k("impact")}% { opacity: .5 } ${k("impact") + 1}% { opacity: 1 } ${k("impact") + 8}% { opacity: .9 } ${k("card")}%, 100% { opacity: .45 } }
    .scene { animation: scene ${T}s linear infinite; } @keyframes scene { 0% { opacity: 0 } ${k("idle")}% { opacity: 1 } ${k("fade")}% { opacity: 1 } 100% { opacity: 0 } }
    .rim { filter: url(#glow); animation: pulse 2.2s ease-in-out infinite; } @keyframes pulse { 50% { opacity: .55 } }
    .me { animation: breathe 3s ease-in-out infinite; } @keyframes breathe { 50% { transform: translateY(3px) } }
    .eyes { transform-box: fill-box; transform-origin: center; animation: blink 4s steps(1) infinite; } @keyframes blink { 0%, 92%, 100% { transform: scaleY(1) } 94% { transform: scaleY(.1) } }
    .hl { animation: hl 1.6s ease-in-out infinite; } .hr { animation: hl 1.6s ease-in-out infinite .8s; } @keyframes hl { 50% { transform: translateY(-6px) } }
    .cubes { filter: url(#glow); animation: cubes ${T}s ease-in infinite; transform-box: fill-box; transform-origin: center; }
    @keyframes cubes { 0%, ${k("fuse") - 3}% { opacity: 1; transform: scale(1) } ${k("fuse")}% { opacity: 1; transform: scale(.35) rotate(90deg) } ${k("fuse") + .6}%, 100% { opacity: 0; transform: scale(.2) } }
    .c1 { animation: f1 2.4s ease-in-out infinite; } .c2 { animation: f2 2.8s ease-in-out infinite; } .c3 { animation: f1 2s ease-in-out infinite; }
    @keyframes f1 { 50% { transform: translate(4px, -14px) } } @keyframes f2 { 50% { transform: translate(-6px, -10px) } }
    .spark { opacity: 0; animation: spark ${T}s linear infinite; transform-box: fill-box; transform-origin: center; }
    @keyframes spark { 0%, ${k("fuse") - .3}% { opacity: 0; transform: scale(.2) } ${k("fuse") + .4}% { opacity: 1; transform: scale(1.6) } ${k("fuse") + 2}%, 100% { opacity: 0; transform: scale(2.4) } }
    .ball { opacity: 0; animation: ball ${T}s linear infinite; }
    @keyframes ball {
      0%, ${k("fuse")}% { opacity: 0; transform: translate(${BX}px, ${BY}px) }
      ${k("fuse") + .4}% { opacity: 1; transform: translate(${BX}px, ${BY}px) }
      ${k("volley") - .1}% { opacity: 1; transform: translate(${BX}px, ${BY}px) }
      ${k("volley")}% { transform: translate(${BX + 30}px, ${BY - 20}px); animation-timing-function: ease-out }
      ${(k("volley") + k("impact")) / 2}% { transform: translate(760px, ${BAR - 70}px); animation-timing-function: ease-in }
      ${k("impact")}% { opacity: 1; transform: translate(${GX + 112}px, ${BAR + 40}px) }
      ${k("impact") + 3}% { transform: translate(${GX + 100}px, ${GROUND - 16}px) }
      ${k("fade")}% { opacity: 1; transform: translate(${GX + 100}px, ${GROUND - 16}px) }
      100% { opacity: 0; transform: translate(${GX + 100}px, ${GROUND - 16}px) } }
    .keepy { animation: keepy ${T}s infinite; }
    @keyframes keepy { 0%, ${k("keepy")}% { transform: translateY(0) }
      ${k("keepy") + 2.5}% { transform: translateY(-120px); animation-timing-function: ease-in } ${k("keepy") + 5}% { transform: translateY(0); animation-timing-function: ease-out }
      ${k("keepy") + 7.5}% { transform: translateY(-150px); animation-timing-function: ease-in } ${k("keepy") + 10}% { transform: translateY(0); animation-timing-function: ease-out }
      ${k("keepy") + 12.5}% { transform: translateY(-110px); animation-timing-function: ease-in } ${k("keepy") + 15}% { transform: translateY(0); animation-timing-function: ease-out }
      ${k("keepy") + 17.5}% { transform: translateY(-60px); animation-timing-function: ease-in } ${k("volley") - .2}%, 100% { transform: translateY(0) } }
    .spin { animation: spin .6s linear infinite; } @keyframes spin { to { transform: rotate(360deg) } }
    .trail { opacity: 0; animation: trail ${T}s linear infinite; } @keyframes trail { 0%, ${k("volley")}% { opacity: 0 } ${k("volley") + .5}% { opacity: .9 } ${k("impact")}% { opacity: .6 } ${k("impact") + 1}%, 100% { opacity: 0 } }
    .net { transform-box: fill-box; transform-origin: left center; animation: net ${T}s ease-out infinite; }
    @keyframes net { 0%, ${k("impact")}% { transform: scale(1) } ${k("impact") + 1}% { transform: scale(1.14, 1.06) } ${k("impact") + 3}% { transform: scale(.97) } ${k("impact") + 5}%, 100% { transform: scale(1) } }
    .flash { opacity: 0; animation: flash ${T}s linear infinite; } @keyframes flash { 0%, ${k("impact")}% { opacity: 0 } ${k("impact") + .3}% { opacity: .55 } ${k("impact") + 1.6}%, 100% { opacity: 0 } }
    .shake { animation: shake ${T}s linear infinite; }
    @keyframes shake { 0%, ${k("impact")}% { transform: translate(0,0) } ${k("impact") + .4}% { transform: translate(-7px, 4px) } ${k("impact") + .8}% { transform: translate(6px, -3px) } ${k("impact") + 1.2}% { transform: translate(-3px, 2px) } ${k("impact") + 1.6}%, 100% { transform: translate(0,0) } }
    .mg { opacity: 0; fill: ${G}; filter: url(#glow); transform-box: fill-box; transform-origin: center bottom; animation: mg ${T}s ease-out infinite; animation-delay: calc(var(--i) * .06s); }
    @keyframes mg { 0%, ${k("merged")}% { opacity: 0; transform: translateY(-30px) scale(.4) } ${k("merged") + 2.5}% { opacity: 1; transform: translateY(0) scale(1.15) } ${k("merged") + 4}% { opacity: 1; transform: scale(1) }
      ${k("mergedOut") - 1.5}% { opacity: 1; transform: scale(1) } ${k("mergedOut")}%, 100% { opacity: 0; transform: translateY(-40px) scale(1) } }
    .nm { opacity: 0; fill: #fff; filter: url(#glow); animation: nm ${T}s ease-out infinite; animation-delay: calc(var(--i) * .08s); }
    @keyframes nm { 0%, ${k("card")}% { opacity: 0; transform: translateX(-24px) } ${k("card") + 3}%, 100% { opacity: 1; transform: translateX(0) } }
    .gg { opacity: 0; fill: ${RED}; filter: url(#glow); animation: gg ${T}s steps(1) infinite; animation-delay: calc(var(--i) * .12s); }
    @keyframes gg { 0%, ${k("card") + 5}% { opacity: 0 } ${k("card") + 5.3}%, 100% { opacity: 1 } }
    .ul { transform-box: fill-box; transform-origin: left; animation: ul ${T}s ease-out infinite; } @keyframes ul { 0%, ${k("card") + 2}% { transform: scaleX(0) } ${k("card") + 6}%, 100% { transform: scaleX(1) } }
    .hi { opacity: 0; animation: hi ${T}s steps(1) infinite; } @keyframes hi { 0%, 4% { opacity: 0 } 5%, 22% { opacity: 1 } 23%, 100% { opacity: 0 } }
  </style>
</defs>
<g clip-path="url(#c)">
  <rect width="${W}" height="${H}" fill="#020403"/>
  <g class="scene">
    <g class="shake">
      <g class="rain">${cols.join("")}</g>
      <rect y="${GROUND}" width="${W}" height="${H - GROUND}" fill="url(#floor)"/>
      <rect y="${GROUND}" width="${W}" height="3" fill="${G}" filter="url(#glow)"/>
      ${goal}
      <g class="me"><g class="rim">${rim}</g>${body}<g class="eyes">${eyes}</g></g>
      <g class="hl">${hand(4, 25, false)}</g>
      <g class="hr">${hand(22, 25, true)}</g>
      <g class="cubes">${cube(11, 22, 3, "c1")}${cube(17, 23, 3, "c2")}${cube(14, 26, 2, "c3")}</g>
      <circle class="spark" cx="${BX}" cy="${BY}" r="26" fill="none" stroke="${G}" stroke-width="5"/>
      <path class="trail" d="M${BX + 30} ${BY - 20} Q 760 ${BAR - 140} ${GX + 112} ${BAR + 40}" fill="none" stroke="${G}" stroke-width="4" stroke-dasharray="3 9"/>
      <g class="ball"><g class="keepy"><g class="spin">${ballSvg}</g></g></g>
      ${bubble("HI!", "hi")}
      <g>${word(MW, mX, 120, mS, "mg")}</g>
      <g>${word(NAME, nX, nY, nS, "nm")}</g>
      <rect class="ul" x="${nX}" y="${nY + 7 * nS + 10}" width="${tw(NAME, nS)}" height="6" fill="${G}"/>
      <g>${word(CH, cX, cY, cS, "gg")}</g>
    </g>
    <rect class="flash" width="${W}" height="${H}" fill="${G}"/>
    <rect width="${W}" height="${H}" fill="url(#vig)"/>
  </g>
</g>
<rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="23" fill="none" stroke="${G}" stroke-opacity=".7" stroke-width="3"/>
</svg>`;
fs.writeFileSync(path.join(__dirname, "assets", "banner.svg"), svg);
console.log("banner.svg", (svg.length / 1024).toFixed(1), "KB");
