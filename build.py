"""Pixelates assets/photo.jpg into an 80x80 sprite and writes assets/pranav.svg
with a calm idle loop: 1px breathing, cubes bobbing, a slow glow, a few rising sparks.
Run: python build.py"""
import numpy as np
from PIL import Image

N, PX = 80, 6                     # 80x80 grid, 6 px per pixel -> 480 px card
PAL = {'.': '#050505', '1': '#0e0e0e', '2': '#181818', '3': '#262626', '4': '#3a3a3a', '5': '#545454',
       'g': '#39ff14', 'm': '#1eaa14', 'd': '#10500c', 'S': '#d6966c', 's': '#aa6c48', 't': '#6e422a'}
RGB = {k: tuple(int(v[i:i + 2], 16) for i in (1, 3, 5)) for k, v in PAL.items()}


def nearest(rgb, keys):
    return min(keys, key=lambda k: sum((rgb[i] - RGB[k][i]) ** 2 for i in range(3)))


def pixelate():
    a = np.asarray(Image.open('assets/photo.jpg').convert('RGB')).astype(float)
    c = a.shape[0] / N
    g = []
    for y in range(N):
        row = []
        for x in range(N):
            cell = a[int(y * c):int((y + 1) * c), int(x * c):int((x + 1) * c)].reshape(-1, 3)
            r, gr, b = cell.T
            green = (gr > r + 35) & (gr > b + 35) & (gr > 70)
            skin = (r > gr + 20) & (r > b + 40) & (r > 90)
            if green.mean() > .18:                     # neon wins if it's in the cell
                m = cell[green].mean(0)[1]
                row.append('g' if m > 190 else 'm' if m > 110 else 'd')
            elif skin.mean() > .4:
                row.append(nearest(cell[skin].mean(0), 'Sst'))
            else:
                row.append(nearest(np.median(cell, 0), '.12345'))
        g.append(row)
    for y in range(14):                                # stray mark in the photo corner
        for x in range(16):
            g[y][x] = '.'
    return g


def rects(cells):
    """cells: {(x, y): key} -> horizontal runs of one colour as <rect>s."""
    out = []
    for key in PAL:
        pts = sorted((y, x) for (x, y), k in cells.items() if k == key)
        i = 0
        while i < len(pts):
            y, x = pts[i]
            w = 1
            while i + w < len(pts) and pts[i + w] == (y, x + w):
                w += 1
            out.append(f'<rect x="{x * PX}" y="{y * PX}" width="{w * PX}" height="{PX}" fill="{PAL[key]}"/>')
            i += w
    return ''.join(out)


g = pixelate()
HEAD_ROWS = 30                      # rows above the shoulders breathe as one piece
CUBES = [(36, 41, 48, 54), (29, 37, 55, 62), (38, 48, 57, 68), (49, 54, 62, 68)]  # x0, x1, y0, y1
BG = set('.12')

base, head, rim = {}, {}, {}
cubes = [dict() for _ in CUBES]
for y in range(N):
    for x in range(N):
        k = g[y][x]
        ci = next((i for i, (x0, x1, y0, y1) in enumerate(CUBES) if x0 <= x <= x1 and y0 <= y <= y1), None)
        if ci is not None and k not in BG and k not in 'Sst':
            cubes[ci][(x, y)] = k
            base[(x, y)] = '1'
        elif y < HEAD_ROWS:
            head[(x, y)] = k
        else:
            base[(x, y)] = k
        if k == 'm' and ci is None:
            rim[(x, y)] = 'g'          # glow layer: mid-greens brighten to neon

# 5x7 pixel font, only the glyphs we need
FONT = {
    'P': ['1111.', '1...1', '1...1', '1111.', '1....', '1....', '1....'],
    'r': ['.....', '.....', '1.11.', '11..1', '1....', '1....', '1....'],
    'a': ['.....', '.....', '.111.', '....1', '.1111', '1...1', '.1111'],
    'n': ['.....', '.....', '1111.', '1...1', '1...1', '1...1', '1...1'],
    'v': ['.....', '.....', '1...1', '1...1', '1...1', '.1.1.', '..1..'],
    'V': ['1...1', '1...1', '1...1', '1...1', '1...1', '.1.1.', '..1..'],
    'I': ['111', '.1.', '.1.', '.1.', '.1.', '.1.', '111'],
    'T': ['11111', '..1..', '..1..', '..1..', '..1..', '..1..', '..1..'],
    '·': ['.', '.', '.', '1', '.', '.', '.'],
    ' ': ['..'],
}
TEXT, TP = 'Pranav · VIT', 3        # 3 px per text pixel


def text_rects(s):
    out, x = [], 0
    for ch in s:
        rows = FONT[ch]
        for dy, r in enumerate(rows):
            for dx, c in enumerate(r):
                if c == '1':
                    out.append(f'<rect x="{x + dx * TP}" y="{dy * TP}" width="{TP}" height="{TP}"/>')
        x += (len(rows[0]) + 1) * TP
    return ''.join(out), x - TP


txt, tw = text_rects(TEXT)
W, H = N * PX, N * PX + 60
tx = (W - tw - 4 * TP) // 2         # centred, with room for the cursor
ty = N * PX + 24

sparks = ''
for x, y, dur, delay in [(40, 47, 6, 0), (46, 55, 7, 2.3), (34, 54, 6.5, 4.1)]:
    sparks += (f'<rect class="spark" style="animation-duration:{dur}s;animation-delay:{delay}s" '
               f'x="{x * PX}" y="{y * PX}" width="{PX}" height="{PX}" fill="{PAL["g"]}"/>')

cube_svg = ''
for c, (dur, delay) in zip(cubes, [(2.6, 0), (3.0, .7), (3.4, 1.5), (2.8, 2.1)]):
    cube_svg += f'<g class="cube" style="animation-duration:{dur}s;animation-delay:-{delay}s">{rects(c)}</g>'

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" shape-rendering="crispEdges" role="img" aria-label="Pixel portrait of Pranav, VIT">
<title>Pranav · VIT</title>
<style>
.head{{animation:breathe 3.6s infinite}}
@keyframes breathe{{0%,100%{{transform:translateY(0)}}50%{{transform:translateY({PX}px)}}}}
.cube{{animation-name:bob;animation-iteration-count:infinite}}
@keyframes bob{{0%,100%{{transform:translateY(0)}}50%{{transform:translateY(-{PX}px)}}}}
.head,.cube,.spark,.cur{{animation-timing-function:steps(1,end)}}
.glow{{opacity:0;animation:glow 5s ease-in-out infinite}}
@keyframes glow{{0%,100%{{opacity:0}}50%{{opacity:.55}}}}
.spark{{opacity:0;animation-name:rise;animation-iteration-count:infinite}}
@keyframes rise{{0%{{opacity:0;transform:translateY(0)}}8%{{opacity:1}}25%{{transform:translateY(-{PX}px)}}42%{{transform:translateY(-{2 * PX}px);opacity:.7}}58%{{transform:translateY(-{3 * PX}px);opacity:0}}100%{{opacity:0}}}}
.cur{{animation:blink 1.2s infinite}}
@keyframes blink{{0%,100%{{opacity:1}}50%{{opacity:0}}}}
.txt{{fill:#7d8590}}
@media (prefers-reduced-motion:reduce){{*{{animation:none!important}}}}
</style>
<defs><clipPath id="card"><rect width="{W}" height="{N * PX}" rx="24"/></clipPath></defs>
<g clip-path="url(#card)">
<rect width="{W}" height="{N * PX}" fill="{PAL['.']}"/>
<g>{rects(base)}</g>
<g class="glow">{rects({p: k for p, k in rim.items() if p[1] >= HEAD_ROWS})}</g>
<g class="head">{rects(head)}<g class="glow">{rects({p: k for p, k in rim.items() if p[1] < HEAD_ROWS})}</g></g>
{cube_svg}
{sparks}
</g>
<g class="txt" transform="translate({tx} {ty})">{txt}<rect class="cur" x="{tw + 2 * TP}" y="0" width="{2 * TP}" height="{7 * TP}"/></g>
</svg>'''
open('assets/pranav.svg', 'w', encoding='utf-8').write(svg)
print('wrote assets/pranav.svg', len(svg) // 1024, 'KB')
