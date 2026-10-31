// Pixel version of the profile picture (curly hair, hood, green neon rim, hands conjuring cubes),
// animated: matrix rain, blinking eyes, floating cubes that turn into a football for keepy-ups,
// and a speech bubble that says HI then GGMU. Run: node avatar.js -> assets/avatar.svg
const fs = require("fs");
const path = require("path");

const N = 32, P = 15, SZ = N * P; // 32x32 grid, 15 px per pixel -> 480 px
const COL = { H: "#191919", h: "#5A5A5A", K: "#141414", k: "#262626", B: "#050505", G: "#39FF14", S: "#C98A5C", s: "#8E5A38", E: "#8CFF6A", W: "#1F8F0A" };

const grid = Array.from({ length: N }, () => Array(N).fill(""));
const inCircle = (x, y, cx, cy, r) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
const inEllipse = (x, y, cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
  const px = x + .5, py = y + .5 - 2.5;
  // body: widening trapezoid from the shoulders down
  if (py >= 17) { const hw = 7 + (py - 17) * .55; if (Math.abs(px - 16) <= Math.min(hw, 15)) grid[y][x] = "K"; }
  // hood
  if (inEllipse(px, py, 16, 11, 8.6, 7.6)) grid[y][x] = "K";
  if (inEllipse(px, py, 16, 11, 8.6, 7.6) && !inEllipse(px, py, 16, 11, 7.4, 6.6)) grid[y][x] = "k";
  // curly hair spilling over the top of the hood
  const hair = [[11, 5, 3.2], [15, 3.6, 3.4], [19.5, 4.6, 3.2], [13, 7, 3], [18.5, 7, 3], [16, 6, 3], [9.5, 8, 2], [22.5, 8, 2]];
  if (hair.some(([cx, cy, r]) => inCircle(px, py, cx, cy, r))) {
    // curls: lighter rings around a lattice of curl centres
    let best = 9;
    for (let cy = 1; cy < 11; cy += 2.2) for (let cx = 7 + ((cy * 10) % 2); cx < 26; cx += 2.4) best = Math.min(best, Math.hypot(px - cx, py - cy));
    grid[y][x] = best > .55 && best < 1.05 ? "h" : "H";
  }
  // face in shadow
  if (inEllipse(px, py, 16, 12.2, 4.6, 3.6)) grid[y][x] = "B";
  // shirt and lapels
  if (py >= 18 && Math.abs(px - 16) <= 2.6) grid[y][x] = "B";
  if (py >= 18 && py <= 27 && (Math.abs(px - 16) - 2.6 > 0 && Math.abs(px - 16) - 2.6 < 1.2 + (py - 18) * .12)) grid[y][x] = "k";
}
// eyes
grid[14][14] = "E"; grid[14][18] = "E";
// green hoodie strings
for (let y = 20; y <= 24; y++) { grid[y][14] = "W"; grid[y][18] = "W"; }
// hands
const hand = (x0, y0, flip) => {
  const rows = ["..SSS.", ".SSSSS", "SSSSSs", "SsSsSs", "S.S.S."];
  rows.forEach((r, dy) => [...r].forEach((c, dx) => { if (c !== ".") grid[y0 + dy][flip ? x0 + 5 - dx : x0 + dx] = c; }));
};
// neon rim: empty pixels touching the silhouette
const solid = (x, y) => x >= 0 && y >= 0 && x < N && y < N && grid[y][x] && grid[y][x] !== "S" && grid[y][x] !== "s";
const rim = [];
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!grid[y][x] && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) rim.push([x, y]);

const px = (x, y, c) => `<rect x="${x * P}" y="${y * P}" width="${P}" height="${P}" fill="${c}"/>`;
let body = "";
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (grid[y][x] && grid[y][x] !== "E") body += px(x, y, COL[grid[y][x]]);
const rimSvg = rim.map(([x, y]) => px(x, y, COL.G)).join("");
const eyes = [px(14, 14, COL.E), px(18, 14, COL.E)].join("");

// hands drawn separately so they can move
const handSvg = (x0, y0, flip) => ["..SSS.", ".SSSSS", "SSSSSs", "SsSsSs", "S.S.S."].map((r, dy) => [...r].map((c, dx) => c !== "." ? px(flip ? x0 + 5 - dx : x0 + dx, y0 + dy, COL[c]) : "").join("")).join("");

// floating cubes (green-edged dark boxes)
const cube = (x, y, s, cls, d) => `<g class="${cls}" style="animation-delay:${d}s"><rect x="${x * P}" y="${y * P}" width="${s * P}" height="${s * P}" fill="#111" stroke="${COL.G}" stroke-width="3"/><rect x="${x * P + 6}" y="${y * P + 6}" width="${s * P - 12}" height="${P / 2}" fill="#2a2a2a"/></g>`;
const ballPx = ["..WWW..".replace(/W/g, "w"), ".wwwww.", "wwbbwww", "wwbbwww", "wwwwwbw", ".wwwww.", "..www.."];
const football = `<g class="ball">${ballPx.map((r, dy) => [...r].map((c, dx) => c === "." ? "" : `<rect x="${(20.5 + dx) * P / 1.5}" y="${(30 + dy) * P / 1.5}" width="${P / 1.5}" height="${P / 1.5}" fill="${c === "b" ? "#111" : "#fff"}"/>`).join("")).join("")}</g>`;

// matrix rain
const rain = Array.from({ length: 16 }, (_, i) => {
  const x = i * 30 + 6, h = 60 + (i * 37) % 120;
  return `<rect x="${x}" y="-${h}" width="6" height="${h}" fill="url(#drop)" class="rain" style="animation-duration:${2.4 + (i % 5) * .5}s;animation-delay:-${(i * .37) % 3}s"/>`;
}).join("");

// speech bubble (pixel font)
const F = { H: "10001100011111110001100011000110001", I: "01110001000010000100001000010001110", G: "01110100011000010111100011000101111", M: "10001110111010110101100011000110001", U: "10001100011000110001100011000101110", "!": "00100001000010000100001000000000100" };
const word = (w, x, y, s) => [...w].map((ch, i) => { let o = ""; for (let k = 0; k < 35; k++) if (F[ch][k] === "1") o += `<rect x="${x + i * 6 * s + (k % 5) * s}" y="${y + Math.floor(k / 5) * s}" width="${s}" height="${s}"/>`; return o; }).join("");
const bubble = (w, cls) => `<g class="${cls}"><rect x="300" y="18" width="${w.length * 30 + 22}" height="58" rx="10" fill="#fff"/><rect x="316" y="74" width="14" height="12" fill="#fff"/><rect x="306" y="84" width="10" height="8" fill="#fff"/><g fill="#111">${word(w, 312, 30, 5)}</g></g>`;

const T = 12;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SZ} ${SZ}" width="${SZ}" height="${SZ}" role="img" aria-label="Pixel Pranav: hooded, curly hair, green neon glow, juggling cubes and a football">
<defs>
  <linearGradient id="drop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${COL.G}" stop-opacity="0"/><stop offset="1" stop-color="${COL.G}" stop-opacity=".35"/></linearGradient>
  <filter id="glow" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <clipPath id="c"><rect width="${SZ}" height="${SZ}" rx="40"/></clipPath>
  <style>
    .rain { animation: rain 3s linear infinite; } @keyframes rain { to { transform: translateY(${SZ + 200}px) } }
    .rim { filter: url(#glow); animation: rim 2.2s ease-in-out infinite; } @keyframes rim { 50% { opacity: .55 } }
    .me { animation: breathe 3s ease-in-out infinite; } @keyframes breathe { 50% { transform: translateY(3px) } }
    .eyes { transform-box: fill-box; transform-origin: center; animation: blink 4s steps(1) infinite; } @keyframes blink { 0%, 92%, 100% { transform: scaleY(1) } 94% { transform: scaleY(.1) } }
    .hl { animation: hl 1.6s ease-in-out infinite; } .hr { animation: hl 1.6s ease-in-out infinite .8s; } @keyframes hl { 50% { transform: translateY(-6px) } }
    .cubes { animation: cubes ${T}s linear infinite; } @keyframes cubes { 0%, 40% { opacity: 1 } 43%, 82% { opacity: 0 } 86%, 100% { opacity: 1 } }
    .c1 { animation: f1 2.4s ease-in-out infinite; } .c2 { animation: f2 2.8s ease-in-out infinite; } .c3 { animation: f1 2s ease-in-out infinite; }
    @keyframes f1 { 50% { transform: translate(4px, -14px) rotate(8deg) } } @keyframes f2 { 50% { transform: translate(-6px, -10px) } }
    .ballwrap { opacity: 0; animation: ballwrap ${T}s linear infinite; } @keyframes ballwrap { 0%, 42% { opacity: 0 } 44%, 82% { opacity: 1 } 84%, 100% { opacity: 0 } }
    .ball { animation: keepy .8s cubic-bezier(.3,0,.7,1) infinite alternate; } @keyframes keepy { from { transform: translate(0, 0) } to { transform: translate(0, -110px) } }
    .b1 { opacity: 0; animation: b1 ${T}s steps(1) infinite; } @keyframes b1 { 0%, 4% { opacity: 0 } 6%, 30% { opacity: 1 } 32%, 100% { opacity: 0 } }
    .b2 { opacity: 0; animation: b2 ${T}s steps(1) infinite; } @keyframes b2 { 0%, 52% { opacity: 0 } 54%, 80% { opacity: 1 } 82%, 100% { opacity: 0 } }
  </style>
</defs>
<g clip-path="url(#c)">
  <rect width="${SZ}" height="${SZ}" fill="#000"/>
  ${rain}
  <g class="me">
    <g class="rim">${rimSvg}</g>
    ${body}
    <g class="eyes">${eyes}</g>
  </g>
  <g class="hl">${handSvg(4, 25, false)}</g>
  <g class="hr">${handSvg(22, 25, true)}</g>
  <g class="cubes" filter="url(#glow)">${cube(11, 25, 3, "c1", 0)}${cube(17, 26, 3, "c2", .4)}${cube(14, 29, 2, "c3", .9)}</g>
  <g class="ballwrap">${football}</g>
  ${bubble("HI!", "b1")}
  ${bubble("GGMU", "b2")}
</g>
</svg>`;
fs.writeFileSync(path.join(__dirname, "assets", "avatar.svg"), svg);
console.log("avatar.svg", (svg.length / 1024).toFixed(1), "KB");
