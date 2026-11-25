#!/usr/bin/env python3
"""Génère kfonts.h : polices anti-aliasées (alpha 4 bits) pour l'interface KhiCAS.

Chaque police = liste de glyphes triés par point de code :
  avance, décalages x/y (par rapport à l'origine sur la ligne de base), largeur, hauteur, offset des données.
Les données sont des nibbles (0–15) packés deux par octet, ligne après ligne.

Polices « cellule » (mono) : la largeur d'avance est forcée (10 ou 7 px) pour rester
compatible avec la mise en page caractère par caractère de KhiCAS.
"""
import sys, os
from PIL import ImageFont
from fontTools.ttLib import TTFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, "..", "fonts")  # redesign/fonts

GEIST = os.path.join(FONTS, "Geist[wght].ttf")
MONO = os.path.join(FONTS, "JetBrainsMono[wght].ttf")
STIX = os.path.join(FONTS, "STIXTwoText[wght].ttf")
STIXI = os.path.join(FONTS, "STIXTwoText-Italic[wght].ttf")

ASCII = [chr(c) for c in range(32, 127)]
LATIN1 = [chr(c) for c in range(160, 256)]
EXTRA = list("ˣʸ⁻′″–—‘’“”…•·−×÷±≈≠≤≥√∑∫∞πθαβγδελμσφωχΔΣΩ→←↑↓↔⇒⇧›‹▸▾▴✓✗²³⁴ⁿ₀₁₂⌫°")
FULL = ASCII + LATIN1 + EXTRA

# nom C, fichier, graisse, taille px, cellule (w, h, ligne de base) ou None, jeu de caractères, repli
SPECS = [
    ("kf_mono_l", MONO, 400, 15.0, (10, 18, 14), FULL, STIX),
    ("kf_mono_s", MONO, 400, 11.0, (7, 14, 11), FULL, STIX),
    ("kf_mono_sm", MONO, 500, 11.0, (7, 14, 11), ASCII, None),
    ("kf_ui_9sb", GEIST, 600, 9.0, None, FULL, STIX),
    ("kf_ui_10", GEIST, 400, 10.0, None, FULL, STIX),
    ("kf_ui_11m", GEIST, 500, 11.0, None, FULL, STIX),
    ("kf_ui_12", GEIST, 400, 12.0, None, FULL, STIX),
    ("kf_ui_12m", GEIST, 500, 12.0, None, FULL, STIX),
    ("kf_ui_13sb", GEIST, 600, 13.0, None, FULL, STIX),
    ("kf_ui_20sb", GEIST, 600, 20.0, None, ASCII + LATIN1, None),
    ("kf_math_11i", STIXI, 400, 12.0, None, ASCII + list("χαβγθπσφω"), None),
    ("kf_math_17", STIX, 400, 17.0, None, FULL, MONO),
    ("kf_math_17i", STIXI, 400, 17.0, None, ASCII + list("αβγδεθλμσφωπχ"), None),
    ("kf_math_13", STIX, 400, 13.0, None, FULL, MONO),
    ("kf_math_13i", STIXI, 400, 13.0, None, ASCII + list("αβγδεθλμσφωπ"), None),
]

def cmap_of(path):
    return set(TTFont(path, lazy=True).getBestCmap().keys())

def load(path, wght, size):
    f = ImageFont.truetype(path, size=round(size * 64) / 64, layout_engine=ImageFont.Layout.BASIC)
    try:
        f.set_variation_by_axes([wght])
    except Exception:
        pass
    return f

def glyph(font, ch, gamma=0.85):
    mask, (ox, oy) = font.getmask2(ch, mode="L", anchor="ls")
    w, h = mask.size
    px = [mask.getpixel((x, y)) for y in range(h) for x in range(w)]
    nib = [min(15, round(((v / 255.0) ** gamma) * 15)) for v in px]
    # rogne les lignes / colonnes vides
    rows = [nib[y * w:(y + 1) * w] for y in range(h)]
    while rows and not any(rows[0]): rows.pop(0); oy += 1
    while rows and not any(rows[-1]): rows.pop()
    if rows:
        cols = list(zip(*rows))
        l = 0
        while l < len(cols) and not any(cols[l]): l += 1
        r = len(cols)
        while r > l and not any(cols[r - 1]): r -= 1
        rows = [row[l:r] for row in rows]; ox += l
    h = len(rows); w = len(rows[0]) if rows else 0
    flat = [v for row in rows for v in row]
    return w, h, ox, oy, flat

def main(out):
    lines = ["// Généré par tools/fontgen.py — ne pas modifier.", "// Polices : Geist, JetBrains Mono, STIX Two (SIL Open Font License 1.1).",
             "#pragma once", '#include "kui.h"', ""]
    total = 0
    for name, path, wght, size, cell, chars, fallback in SPECS:
        font = load(path, wght, size)
        fb = load(fallback, 400, size) if fallback else None
        have = cmap_of(path); have_fb = cmap_of(fallback) if fallback else set()
        asc, desc = font.getmetrics()
        data = bytearray(); recs = []
        for ch in sorted(set(chars), key=ord):
            cp = ord(ch)
            f = font if cp in have else (fb if cp in have_fb else None)
            if f is None: continue
            w, h, ox, oy, flat = glyph(f, ch)
            adv = round(f.getlength(ch))
            if cell:
                cw = cell[0]
                ox += (cw - adv) // 2  # centre le glyphe dans la cellule
                adv = cw
            if len(flat) % 2: flat.append(0)
            off = len(data)
            for i in range(0, len(flat), 2):
                data.append((flat[i] << 4) | flat[i + 1])
            recs.append((cp, adv, ox, oy, w, h, off))
        height = cell[1] if cell else asc + desc
        base = cell[2] if cell else asc
        lines.append(f"static const uint8_t {name}_data[{len(data)}] = {{")
        for i in range(0, len(data), 24):
            lines.append("  " + ",".join(str(b) for b in data[i:i + 24]) + ",")
        lines.append("};")
        lines.append(f"static const kglyph {name}_glyphs[{len(recs)}] = {{")
        for cp, adv, ox, oy, w, h, off in recs:
            lines.append(f"  {{{cp},{adv},{ox},{oy},{w},{h},{off}}},")
        lines.append("};")
        lines.append(f"const kfont {name} = {{ {height}, {base}, {cell[0] if cell else 0}, {len(recs)}, {name}_glyphs, {name}_data }};")
        lines.append("")
        total += len(data) + len(recs) * 12
        print(f"{name:14s} {len(recs):4d} glyphes  {len(data):6d} o  hauteur {height} base {base}", file=sys.stderr)
    print(f"total ≈ {total // 1024} Ko", file=sys.stderr)
    open(out, "w").write("\n".join(lines) + "\n")

if __name__ == "__main__":
    main(sys.argv[1])
