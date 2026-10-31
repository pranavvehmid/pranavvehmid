// Animated pixel banner, one 14-second film that loops:
//   lights up -> a Red Devil dribbles in -> strikes -> top corner, net ripples, camera shake
//   -> GOAL! with flashes and confetti -> he celebrates by the goal -> name card + chant -> fade to black.
// Run: node banner.js   (writes assets/banner.svg)
const fs = require("fs");
const path = require("path");
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, "profile.json"), "utf8"));

const W = 1200, H = 440, T = 14;
const C = { red: "#DA291C", deep: "#7A0A0A", gold: "#FBE122", white: "#FFFFFF", cyan: "#21F3FF", pink: "#FF2BD6", lime: "#C6FF00" };
const pct = (s) => +(s / T * 100).toFixed(2); // seconds -> keyframe %

// ---------- 5x7 pixel font ----------
const F = {
  A:"01110100011000111111100011000110001", C:"01110100011000010000100001000101110", D:"11110100011000110001100011000111110",
  E:"11111100001000011110100001000011111", G:"01110100011000010111100011000101111", I:"01110001000010000100001000010001110",
  L:"10000100001000010000100001000011111", M:"10001110111010110101100011000110001", N:"10001110011010110011100011000110001",
  O:"01110100011000110001100011000101110", P:"11110100011000111110100001000010000", R:"11110100011000111110101001001010001",
  T:"11111001000010000100001000010000100", U:"10001100011000110001100011000101110", V:"10001100011000110001100010101000100",
  Y:"10001100010101000100001000010000100", "!":"00100001000010000100001000000000100", " ":"00000000000000000000000000000000000",
};
const glyph = (ch, x, y, s) => { const g = F[ch] || F[" "]; let o = ""; for (let i = 0; i < 35; i++) if (g[i] === "1") o += `<rect x="${x + (i % 5) * s}" y="${y + Math.floor(i / 5) * s}" width="${s - 1}" height="${s - 1}"/>`; return o; };
const tw = (t, s) => t.length * 6 * s - s;

// ---------- sprites (1 char = 1 pixel) ----------
const PAL = { R: C.red, D: C.deep, K: "#121212", W: C.white, Y: C.gold, H: "#FFE9A8", E: "#111" };
const draw = (rows, s) => rows.map((r, y) => [...r].map((ch, x) => PAL[ch] ? `<rect x="${x * s}" y="${y * s}" width="${s}" height="${s}" fill="${PAL[ch]}"/>` : "").join("")).join("");
const HEAD = [
  "....H......H....",
  "....HH....HH....",
  ".....RRRRRR.....",
  "....RRRRRRRR....",
  "....RRRWERRWE...",
  "....RRRRRRRRR...",
  ".....RRRYYYR....",
  "......RRRRR.....",
];
const BODY = [
  "....RRRRRRRR....",
  "...RRRRWRRRRR...",
  "..RR.RRRRRRR.RR.",
  "..RR.RRRRRRR.RR.",
  ".....KKKKKKK....",
];
const LEGS_A = ["....KK....KK....", "...RR......RR...", "..RR........RR..", ".WW..........WW."];
const LEGS_B = ["......KKKK......", "......RRRR......", "......RRRR......", ".....WW..WW....."];
const LEGS_KICK = ["....KK.....KKK..", "...RR.......RRR.", "..RR..........RW", ".WW............W"];
const BODY_UP = [
  ".RR.RRRRRRRR.RR.",
  ".RR.RRRWRRRR.RR.",
  "..RRRRRRRRRRRR..",
  ".....RRRRRRR....",
  ".....KKKKKKK....",
];
const LEGS_STAND = [".....KK...KK....", ".....RR...RR....", ".....RR...RR....", "....WWW...WWW..."];
const S = 6; // sprite pixel size
const sprite = (body, legs) => draw(HEAD.concat(body, legs), S);
const trident = (x, y) => `<g fill="${C.gold}"><rect x="${x}" y="${y}" width="${S}" height="${S * 18}"/><rect x="${x - S * 2}" y="${y}" width="${S * 5}" height="${S}"/>
  <rect x="${x - S * 2}" y="${y - S * 3}" width="${S}" height="${S * 3}"/><rect x="${x}" y="${y - S * 4}" width="${S}" height="${S * 4}"/><rect x="${x + S * 2}" y="${y - S * 3}" width="${S}" height="${S * 3}"/></g>`;
const tail = `<g fill="${C.red}"><rect x="${-S * 2}" y="${S * 12}" width="${S * 2}" height="${S}"/><rect x="${-S * 3}" y="${S * 11}" width="${S}" height="${S}"/><rect x="${-S * 4}" y="${S * 10}" width="${S * 2}" height="${S}"/><rect x="${-S * 5}" y="${S * 9}" width="${S * 2}" height="${S * 2}" fill="${C.deep}"/></g>`;

// ---------- layout ----------
const GROUND = 372;               // feet line
const SPR_H = 17 * S;             // sprite height
const DEV_Y = GROUND - SPR_H;     // devil top
const GOAL_X = 1010, BAR_Y = 226; // goal mouth
const ballSvg = `<g class="bspin"><rect x="-8" y="-4" width="16" height="8" fill="#fff"/><rect x="-4" y="-8" width="8" height="16" fill="#fff"/><rect x="-6" y="-6" width="12" height="12" fill="#fff"/><rect x="-2" y="-2" width="4" height="4" fill="#111"/><rect x="-7" y="1" width="3" height="3" fill="#111"/><rect x="4" y="-6" width="3" height="3" fill="#111"/></g>`;

// timeline (seconds)
const t = { lights: 0.2, runIn: 1.0, kick: 4.6, impact: 5.35, goalIn: 5.5, goalOut: 8.0, cardIn: 8.4, chantIn: 9.3, fade: 12.9 };
const K = (s) => pct(t[s]);

// ---------- pieces ----------
const beams = [0, 1, 2, 3].map((i) => `<rect x="${150 + i * 300}" y="-200" width="70" height="900" fill="url(#beam)" class="beam" style="--r:${i % 2 ? -18 : 18}deg;animation-delay:-${i * 1.3}s"/>`).join("");
const stars = Array.from({ length: 40 }, (_, i) => `<rect x="${(i * 157) % W}" y="${(i * 61) % 200}" width="2" height="2" fill="#fff" opacity=".7" class="tw" style="animation-delay:${(i % 7) * .37}s"/>`).join("");
const crowd = Array.from({ length: 60 }, (_, i) => `<rect x="${i * 20 + (i % 3) * 3}" y="${196 + (i % 4) * 5}" width="14" height="${30 - (i % 4) * 5}" rx="5" fill="${i % 5 ? "#1A1426" : "#26103A"}"/>`).join("");
const flashes = Array.from({ length: 18 }, (_, i) => `<circle cx="${30 + (i * 67) % 1140}" cy="${200 + (i * 13) % 26}" r="3" fill="#fff" class="flash" style="animation-delay:${(i % 6) * .11}s"/>`).join("");
const stripes = Array.from({ length: 24 }, (_, i) => `<rect x="${i * 80 - 80}" y="${GROUND - 2}" width="40" height="${H - GROUND + 2}" fill="#0E2A1E"/>`).join("");
const net = `<g class="net" stroke="#fff" stroke-opacity=".28" stroke-width="2">${Array.from({ length: 8 }, (_, i) => `<line x1="${GOAL_X + 14 + i * 16}" y1="${BAR_Y + 8}" x2="${GOAL_X + 26 + i * 16}" y2="${GROUND}"/>`).join("")}${Array.from({ length: 8 }, (_, i) => `<line x1="${GOAL_X + 8}" y1="${BAR_Y + 22 + i * 18}" x2="${GOAL_X + 140}" y2="${BAR_Y + 26 + i * 18}"/>`).join("")}</g>`;
const goalFrame = `<g><rect x="${GOAL_X}" y="${BAR_Y}" width="150" height="8" fill="#fff"/><rect x="${GOAL_X}" y="${BAR_Y}" width="8" height="${GROUND - BAR_Y}" fill="#fff"/><rect x="${GOAL_X + 142}" y="${BAR_Y}" width="8" height="${GROUND - BAR_Y}" fill="#ddd"/>${net}</g>`;

const goalWord = (cfg.goalWord || "MERGED!").toUpperCase();
const gS = 20, gX = (W - tw(goalWord, gS)) / 2, gY = 50;
const goalText = [...goalWord].map((ch, i) => `<g class="gl" style="--i:${i}" fill="${C.gold}">${glyph(ch, gX + i * 6 * gS, gY, gS)}</g>`).join("");

const name = (cfg.name || "PRANAV").toUpperCase();
const nS = 16, nX = 90, nY = 70;
const nameText = [...name].map((ch, i) => `<g class="nl" style="--i:${i}">${glyph(ch, nX + i * 6 * nS, nY, nS)}</g>`).join("");
const chant = (cfg.chant || "GLORY GLORY MAN UNITED").toUpperCase();
const cS = 10, cX = nX, cY = nY + 7 * nS + 34;
const chantText = [...chant].map((ch, i) => `<g class="cl" style="--i:${i}">${glyph(ch, cX + i * 6 * cS, cY, cS)}</g>`).join("");
// tagline after the chant

const underline = `<rect class="ul" x="${nX}" y="${nY + 7 * nS + 12}" width="${tw(name, nS)}" height="8" fill="${C.red}"/>`;

const confetti = Array.from({ length: 40 }, (_, i) => {
  const col = [C.red, C.gold, C.white, C.cyan, C.pink, C.lime][i % 6];
  return `<rect x="${(i * 29) % W}" y="-16" width="${6 + (i % 3) * 3}" height="${6 + (i % 2) * 4}" fill="${col}" class="cf" style="--dx:${((i * 47) % 160) - 80}px;--rot:${(i * 67) % 720 - 360}deg;animation-delay:${(i % 10) * .05}s"/>`;
}).join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${name}: a Red Devil dribbles in and scores top corner. ${goalWord} ${chant}.">
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05040C"/><stop offset=".55" stop-color="#140820"/><stop offset="1" stop-color="#2A0611"/></linearGradient>
  <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".7" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <radialGradient id="spot" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${C.red}" stop-opacity=".45"/><stop offset="1" stop-color="${C.red}" stop-opacity="0"/></radialGradient>
  <filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="soft"><feGaussianBlur stdDeviation="6"/></filter>
  <clipPath id="frame"><rect width="${W}" height="${H}" rx="24"/></clipPath>
  <style>
    .beam { transform-box: fill-box; transform-origin: top center; animation: beam 6s ease-in-out infinite alternate; }
    @keyframes beam { from { transform: rotate(var(--r)) } to { transform: rotate(calc(var(--r) * -1)) } }
    .tw { animation: tw 3s steps(2) infinite; } @keyframes tw { 50% { opacity: .1 } }
    .flash { opacity: 0; animation: flash ${T}s linear infinite; }
    @keyframes flash { 0%, ${K("impact")}% { opacity: 0 } ${K("impact") + .6}% { opacity: 1 } ${K("impact") + 1.4}% { opacity: 0 } ${K("impact") + 2.2}% { opacity: 1 } ${K("impact") + 3}% { opacity: 0 } ${K("impact") + 5}% { opacity: .9 } ${K("impact") + 6}%, 100% { opacity: 0 } }

    .scene { animation: scene ${T}s linear infinite; }
    @keyframes scene { 0% { opacity: 0 } ${K("lights")}% { opacity: 1 } ${K("fade")}% { opacity: 1 } 100% { opacity: 0 } }
    .shake { animation: shake ${T}s linear infinite; }
    @keyframes shake { 0%, ${K("impact")}% { transform: translate(0,0) } ${K("impact") + .4}% { transform: translate(-8px, 5px) } ${K("impact") + .8}% { transform: translate(7px, -4px) } ${K("impact") + 1.2}% { transform: translate(-5px, 3px) } ${K("impact") + 1.6}% { transform: translate(3px, -2px) } ${K("impact") + 2}%, 100% { transform: translate(0,0) } }
    .whiteout { opacity: 0; animation: whiteout ${T}s linear infinite; }
    @keyframes whiteout { 0%, ${K("impact")}% { opacity: 0 } ${K("impact") + .3}% { opacity: .75 } ${K("impact") + 1.6}%, 100% { opacity: 0 } }

    .pitch { animation: pitch ${T}s linear infinite; }
    @keyframes pitch { 0%, ${K("runIn")}% { transform: translateX(0) } ${K("kick")}% { transform: translateX(-240px) } 100% { transform: translateX(-240px) } }

    .devil { animation: devil ${T}s ease-in-out infinite; }
    @keyframes devil {
      0%, ${K("runIn")}% { transform: translate(-180px, ${DEV_Y}px); animation-timing-function: linear }
      ${K("kick") - 1}% { transform: translate(560px, ${DEV_Y}px) }
      ${K("kick")}% { transform: translate(584px, ${DEV_Y}px) }
      ${K("goalIn") + 3}% { transform: translate(584px, ${DEV_Y}px) }
      ${K("goalIn") + 9}% { transform: translate(860px, ${DEV_Y - 24}px) }
      ${K("goalIn") + 11}% { transform: translate(880px, ${DEV_Y}px) }
      100% { transform: translate(880px, ${DEV_Y}px) } }
    .run { animation: show-run ${T}s steps(1) infinite; } @keyframes show-run { 0% { opacity: 1 } ${K("kick")}% { opacity: 0 } ${K("goalIn") + 3}% { opacity: 1 } ${K("goalIn") + 11}%, 100% { opacity: 0 } }
    .kick { animation: show-kick ${T}s steps(1) infinite; } @keyframes show-kick { 0% { opacity: 0 } ${K("kick")}% { opacity: 1 } ${K("goalIn") + 3}%, 100% { opacity: 0 } }
    .party { animation: show-party ${T}s steps(1) infinite; } @keyframes show-party { 0% { opacity: 0 } ${K("goalIn") + 11}% { opacity: 1 } 100% { opacity: 1 } }
    .la { animation: la .28s steps(1) infinite; } .lb { animation: lb .28s steps(1) infinite; }
    @keyframes la { 0% { opacity: 1 } 50% { opacity: 0 } } @keyframes lb { 0% { opacity: 0 } 50% { opacity: 1 } }
    .pump { animation: pump .5s ease-in-out infinite alternate; } @keyframes pump { to { transform: translateY(-10px) } }
    .halo { opacity: 0; animation: halo ${T}s linear infinite; } @keyframes halo { 0%, ${K("goalIn") + 11}% { opacity: 0 } ${K("goalIn") + 14}% { opacity: 1 } 100% { opacity: 1 } }

    .ball { animation: ball ${T}s linear infinite; }
    @keyframes ball {
      0%, ${K("runIn")}% { transform: translate(-60px, ${GROUND - 10}px) }
      ${K("kick") - 1}% { transform: translate(690px, ${GROUND - 10}px) }
      ${K("kick")}% { transform: translate(700px, ${GROUND - 12}px); animation-timing-function: ease-out }
      ${pct((t.kick + t.impact) / 2)}% { transform: translate(900px, ${BAR_Y - 34}px); animation-timing-function: ease-in }
      ${K("impact")}% { transform: translate(${GOAL_X + 120}px, ${BAR_Y + 26}px); animation-timing-function: ease-in }
      ${K("impact") + 4}% { transform: translate(${GOAL_X + 112}px, ${GROUND - 10}px) }
      100% { transform: translate(${GOAL_X + 112}px, ${GROUND - 10}px) } }
    .bob { animation: bob .28s ease-in-out infinite alternate; } @keyframes bob { to { transform: translateY(-6px) } }
    .bspin { animation: spin .5s linear infinite; } @keyframes spin { to { transform: rotate(360deg) } }
    .trail { opacity: 0; animation: trail ${T}s linear infinite; } @keyframes trail { 0%, ${K("kick")}% { opacity: 0 } ${K("kick") + .5}% { opacity: .8 } ${K("impact")}% { opacity: .5 } ${K("impact") + 1}%, 100% { opacity: 0 } }
    .net { transform-box: fill-box; transform-origin: left center; animation: net ${T}s ease-out infinite; }
    @keyframes net { 0%, ${K("impact")}% { transform: scale(1) } ${K("impact") + 1}% { transform: scale(1.12, 1.06) } ${K("impact") + 3}% { transform: scale(.97) } ${K("impact") + 5}%, 100% { transform: scale(1) } }

    .gl { opacity: 0; transform-box: fill-box; transform-origin: center bottom; filter: url(#glow); animation: gl ${T}s ease-out infinite; animation-delay: calc(var(--i) * .07s); }
    @keyframes gl { 0%, ${K("goalIn")}% { opacity: 0; transform: translateY(-40px) scale(.4) } ${K("goalIn") + 3}% { opacity: 1; transform: translateY(0) scale(1.15) } ${K("goalIn") + 5}% { opacity: 1; transform: translateY(0) scale(1) }
      ${K("goalOut") - 2}% { opacity: 1; transform: translateY(0) scale(1) } ${K("goalOut")}%, 100% { opacity: 0; transform: translateY(-60px) scale(1) } }
    .cf { opacity: 0; animation: cf ${T}s linear infinite; }
    @keyframes cf { 0%, ${K("impact") + 1}% { opacity: 0; transform: translate(0,0) rotate(0) } ${K("impact") + 2}% { opacity: 1; transform: translate(0, 20px) rotate(20deg) } ${K("chantIn") + 4}% { opacity: 0; transform: translate(var(--dx), 470px) rotate(var(--rot)) } 100% { opacity: 0; transform: translate(var(--dx), 470px) } }

    .nl { opacity: 0; fill: #fff; filter: url(#glow); animation: nl ${T}s ease-out infinite; animation-delay: calc(var(--i) * .09s); }
    @keyframes nl { 0%, ${K("cardIn")}% { opacity: 0; transform: translateX(-30px) } ${K("cardIn") + 3}% { opacity: 1; transform: translateX(0) } 100% { opacity: 1; transform: translateX(0) } }
    .ul { transform-box: fill-box; transform-origin: left; animation: ul ${T}s ease-out infinite; }
    @keyframes ul { 0%, ${K("cardIn") + 3}% { transform: scaleX(0) } ${K("chantIn")}%, 100% { transform: scaleX(1) } }
    .cl { opacity: 0; fill: ${C.gold}; animation: cl ${T}s steps(1) infinite; animation-delay: calc(var(--i) * .05s); }
    @keyframes cl { 0%, ${K("chantIn")}% { opacity: 0 } ${K("chantIn") + .3}%, 100% { opacity: 1 } }
    .spot { opacity: 0; animation: spot ${T}s ease-out infinite; } @keyframes spot { 0%, ${K("cardIn")}% { opacity: 0 } ${K("cardIn") + 4}%, 100% { opacity: 1 } }
  </style>
</defs>
<g clip-path="url(#frame)">
  <rect width="${W}" height="${H}" fill="#000"/>
  <g class="scene">
    <g class="shake">
      <rect width="${W}" height="${H}" fill="url(#sky)"/>
      ${beams}
      ${stars}
      <g opacity=".95">${crowd}</g>
      ${flashes}
      <rect y="${GROUND}" width="${W}" height="${H - GROUND}" fill="#0B1F16"/>
      <g class="pitch">${stripes}</g>
      <rect y="${GROUND - 2}" width="${W}" height="3" fill="#fff" opacity=".55"/>
      <ellipse class="spot" cx="320" cy="150" rx="330" ry="150" fill="url(#spot)"/>
      ${goalFrame}
      <g class="devil">
        <ellipse class="halo" cx="${8 * S}" cy="${17 * S}" rx="${10 * S}" ry="${2 * S}" fill="${C.red}" opacity=".5" filter="url(#soft)"/>
        <g class="run"><g class="la">${sprite(BODY, LEGS_A)}</g><g class="lb">${sprite(BODY, LEGS_B)}</g>${trident(-S * 2, S * 2)}${tail}</g>
        <g class="kick">${sprite(BODY, LEGS_KICK)}${trident(-S * 2, S * 2)}${tail}</g>
        <g class="party"><g class="pump">${sprite(BODY_UP, LEGS_STAND)}${trident(S * 15, -S * 9)}${tail}</g></g>
      </g>
      <g class="ball"><g class="bob">${ballSvg}</g></g>
      <path class="trail" d="M700 ${GROUND - 12} Q 900 ${BAR_Y - 70} ${GOAL_X + 120} ${BAR_Y + 26}" fill="none" stroke="${C.gold}" stroke-width="4" stroke-dasharray="2 10" stroke-linecap="square"/>
      ${confetti}
      <g>${goalText}</g>
      <g>${nameText}</g>
      ${underline}
      <g>${chantText}</g>
    </g>
    <rect class="whiteout" width="${W}" height="${H}" fill="#fff"/>
  </g>
</g>
<rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="23" fill="none" stroke="${C.red}" stroke-width="3" opacity=".9"/>
</svg>`;
fs.writeFileSync(path.join(__dirname, "assets", "banner.svg"), svg);
console.log("banner.svg", (svg.length / 1024).toFixed(1), "KB");
