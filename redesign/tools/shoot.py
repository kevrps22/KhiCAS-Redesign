#!/usr/bin/env python3
"""Rejoue une séquence de touches dans le simulateur (sans fenêtre) et capture l'écran à chaque touche.

  tools/shoot.py <nom> "Down Down OK S:2 ..."   → shots/<nom>/000.png … + planche.png
Préfixes : S: = ⇧ (shift), A: = alpha, T:texte = tape le texte (minuscules, chiffres, ( ) ^ * / + - , .). Les 5 premières touches (Down×4 OK) ouvrent KhiCAS.
"""
import os, sys, subprocess, glob
from PIL import Image, ImageDraw
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
K = dict(Left=0, Up=1, Down=2, Right=3, OK=4, Back=5, Home=6, Shift=12, Alpha=13, XNT=14, Var=15, Toolbox=16, Backspace=17,
         Exp=18, Ln=19, Log=20, Imaginary=21, Comma=22, Power=23, Sine=24, Cosine=25, Tangent=26, Pi=27, Sqrt=28, Square=29,
         LPar=33, RPar=34, Mul=39, Div=40, Plus=45, Minus=46, Dot=49, EE=50, Ans=51, EXE=52)
for i, d in enumerate("789"): K[d] = 30 + i
for i, d in enumerate("456"): K[d] = 36 + i
for i, d in enumerate("123"): K[d] = 42 + i
K["0"] = 48
name, keys = sys.argv[1], sys.argv[2]
out = os.path.join(ROOT, "shots", name); os.makedirs(out, exist_ok=True)
for f in glob.glob(os.path.join(out, "*.png")): os.remove(f)
ALPHA = dict(zip("abcdefghijklmnopqrstuvwxyz", ["Exp","Ln","Log","Imaginary","Comma","Power","Sine","Cosine","Tangent","Pi","Sqrt","Square","7","8","9","LPar","RPar","4","5","6","Mul","Div","1","2","3","Plus"]))
PLAIN = {"(": "LPar", ")": "RPar", "^": "Power", "*": "Mul", "/": "Div", "+": "Plus", "-": "Minus", ",": "Comma", ".": "Dot"}
def expand(tok):
    """T:texte → suite de touches (lettres via α, chiffres et opérateurs directs)."""
    if not tok.startswith("T:"): return [tok]
    out = []
    for ch in tok[2:]:
        if ch in ALPHA: out.append("A:" + ALPHA[ch])
        elif ch.isdigit(): out.append(ch)
        elif ch in PLAIN: out.append(PLAIN[ch])
        elif ch == "_": out.append("S:Comma")
        else: raise SystemExit("caractère non pris en charge : " + ch)
    return out
data = bytearray(b"NWSF**.**.**")
for tok in [t for raw in ("Down Down Down Down OK " + keys).split() for t in expand(raw)]:
    pg = 0
    if tok.startswith("S:"): pg, tok = 1, tok[2:]
    elif tok.startswith("A:"): pg, tok = 2, tok[2:]
    data.append(pg * 54 + K[tok])
state = os.path.join(out, "keys.nws"); open(state, "wb").write(data)
env = dict(os.environ, NW_SHOT=os.path.join(out, "s"))
subprocess.run([os.path.join(ROOT, "Upsilon/output/release/simulator/linux/epsilon.bin"), "--headless", "-v", "--load-state-file", state], env=env, timeout=300, check=False)
fs = sorted(glob.glob(os.path.join(out, "s_*.png")))[5:]
cols = 4; rows = (len(fs) + cols - 1) // cols
sheet = Image.new("RGB", (cols * 330, max(1, rows) * 254), "#888")
d = ImageDraw.Draw(sheet)
for i, f in enumerate(fs):
    x, y = (i % cols) * 330 + 5, (i // cols) * 254 + 12
    sheet.paste(Image.open(f), (x, y)); d.text((x, y - 11), os.path.basename(f), fill="white")
sheet.save(os.path.join(out, "planche.png"))
print(f"{len(fs)} captures → shots/{name}/planche.png")
