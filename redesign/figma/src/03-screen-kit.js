// ---------- Kit d'écran (320 × 240 : barre d'état 20 · contenu 198 · barre du bas 22) ----------
const SHELL_KEYS = [["1", "Algèbre"], ["2", "Calcul"], ["3", "Tracer"], ["4", "Éditer"], ["5", "2D"], ["6", "Régr."]];
const EDITOR_KEYS = [["1", "Test"], ["2", "Boucle"], ["3", "Annuler"], ["4", "Divers"], ["5", "±"], ["6", "Tortue"]];
const VIEW2D_KEYS = [["1", "Algèbre"], ["2", "Calcul"], ["3", "Annuler"], ["4", "Éditer"], ["5", "±"], ["6", "Approx."]];
const SHEET_KEYS = [["1", "Éditer"], ["2", "Remplir"], ["3", "Trier"], ["4", "Tracer"], ["5", "Config"], ["6", "Menu"]];

function screenFrame(name) { return F(null, { name, fill: "bg/app", clip: true, w: 320, h: 240 }); }
function status(s, props) { const i = I(KH.C.StatusBar, props); s.appendChild(i); i.x = 0; i.y = 0; return i; }
function softbar(s, labels, shift = false) {
  const i = I(KH.C.SoftKeyBar); s.appendChild(i); i.x = 0; i.y = 218;
  labels.forEach((l, ix) => {
    const sk = exp(i, "Raccourci " + (ix + 1));
    setP(sk, { "Libellé": l[1], "État": shift ? "Shift" : "Default" });
    setKey(exp(sk, "Touche"), l[0], shift ? "Shift" : "Plain");
  });
  return i;
}
// items : [touche, libellé, type de touche?]
function hintbar(s, items) {
  const i = I(KH.C.HintBar); s.appendChild(i); i.x = 0; i.y = 218;
  for (let k = 0; k < 4; k++) {
    const a = exp(i, "Action " + (k + 1)); const it = items[k];
    if (!it) { a.visible = false; continue; }
    setP(a, { "Libellé": it[1] }); setKey(exp(a, "Touche"), it[0], it[2]);
  }
  return i;
}
function body(s, o = {}) {
  const b = F(o.dir || "VERTICAL", Object.assign({ name: "Contenu", w: 320, h: 198, align: "MIN", clip: true }, o));
  s.appendChild(b); b.x = 0; b.y = nn(o.y, 20); return b;
}
function scrim(s, y = 20, h = 220) { const r = rect(320, h, "text/primary", { op: 0.32, name: "Voile" }); s.appendChild(r); r.x = 0; r.y = y; return r; }

function menuItem(parent, o) {
  const mi = I(KH.C.MenuItem, { "Sélectionné": o.sel ? "true" : "false", "Libellé": o.label, "Description visible": o.desc != null, "Chevron": !!o.chevron, "Icône visible": !!o.icon });
  if (o.desc != null) setP(mi, { "Description": o.desc });
  if (o.icon) { setP(mi, { "Icône": KH.C["Icon/" + o.icon].id }); const ic = mi.findOne((n) => n.name === "Icône" || n.name.startsWith("Icon/") || n.name.startsWith("Icône")); if (ic) tint(ic, o.sel ? "accent/primary" : "text/secondary"); }
  if (o.i != null) setKey(exp(mi, "Indice"), String(o.i), o.sel ? "Primary" : "Plain"); else exp(mi, "Indice").visible = false;
  parent.appendChild(mi); mi.layoutSizingHorizontal = "FILL";
  return mi;
}
function configRow(parent, o) {
  const r = I(KH.C.ConfigRow, { "Contrôle": o.ctl || "Choix", "Sélectionné": o.sel ? "true" : "false", "Libellé": o.label, "Icône": KH.C["Icon/" + (o.icon || "settings")].id });
  if (o.val != null) setP(r, { "Valeur": o.val });
  const ic = r.findOne((n) => n.name === "Icône" || n.name.startsWith("Icon/")); if (ic) tint(ic, o.sel ? "accent/primary" : "text/secondary");
  parent.appendChild(r); r.layoutSizingHorizontal = "FILL"; return r;
}
function he(parent, o) {
  const h = I(KH.C.HistoryEntry, { "Sélectionné": o.sel ? "true" : "false", "Saisie": o.in, "Résultat texte": !o.frac, "Résultat fraction": !!o.frac });
  if (o.out) setP(h, { "Résultat": o.out });
  if (o.frac) setP(exp(h, "Résultat fraction"), { "Numérateur": o.frac[0], "Dénominateur": o.frac[1] });
  parent.appendChild(h); h.layoutSizingHorizontal = "FILL"; return h;
}
function inputLine(parent, txt, exe = true) { const i = I(KH.C.InputLine, { "Saisie": txt, "Indice EXE": exe }); parent.appendChild(i); i.layoutSizingHorizontal = "FILL"; return i; }
function chip(parent, label, sel) { const c = I(KH.C.Chip, { "Sélectionné": sel ? "true" : "false", "Libellé": label }); parent.appendChild(c); return c; }
function chipsRow(parent, labels, selIdx, o = {}) {
  const r = F("HORIZONTAL", Object.assign({ name: "Onglets", gap: 4, clip: true }, o)); add(parent, r, { fillW: true });
  labels.forEach((l, i) => chip(r, l, i === selIdx)); return r;
}
function action(parent, k, label, type) { const a = I(KH.C.ActionHint, { "Libellé": label }); setKey(exp(a, "Touche"), k, type); parent.appendChild(a); return a; }
function field(parent, label, val, o = {}) {
  const f = I(KH.C.Field, { "Sélectionné": o.sel ? "true" : "false", "Libellé": label, "Valeur": val, "Unité": o.unit || " " });
  parent.appendChild(f); if (o.fill !== false) f.layoutSizingHorizontal = "FILL"; return f;
}
async function sectionLabel(parent, txt) { const t = await T(txt.toUpperCase(), "UI/Micro", "text/tertiary", "Section " + txt); parent.appendChild(t); return t; }
function frac(n, d) { return I(KH.C.Fraction, { "Numérateur": n, "Dénominateur": d }); }
function toast(s, msg, y = 28) { const t = I(KH.C.Toast, { "Message": msg }); s.appendChild(t); t.x = Math.round((320 - t.width) / 2); t.y = y; return t; }
async function dialog(s, o) {
  const d = I(KH.C.Dialog, { "Titre": o.title, "Message": o.msg, "Icône visible": o.icon !== null, "Icône": KH.C["Icon/" + (o.icon || "info")].id });
  const ic = d.findOne((n) => n.name === "Icône"); if (ic) tint(ic, o.danger ? "status/danger" : o.warn ? "accent/shift" : "accent/primary");
  if (o.primary) { const a = exp(d, "Action principale"); setP(a, { "Libellé": o.primary[1] }); setKey(exp(a, "Touche"), o.primary[0], "Primary"); }
  if (o.secondary) { const a = exp(d, "Action secondaire"); setP(a, { "Libellé": o.secondary[1] }); setKey(exp(a, "Touche"), o.secondary[0]); }
  else if (o.secondary === null) exp(d, "Action secondaire").visible = false;
  s.appendChild(d); d.x = Math.round((320 - d.width) / 2); d.y = Math.round(20 + (198 - d.height) / 2); return d;
}

// ----- Tracés -----
function vectorPath(parent, segments, color, w = 1.75, name = "Courbe") {
  // segments : liste de listes de points [x, y] (coordonnées du parent)
  let minX = Infinity, minY = Infinity;
  for (const seg of segments) for (const [x, y] of seg) { minX = Math.min(minX, x); minY = Math.min(minY, y); }
  const d = segments.filter((s) => s.length > 1).map((seg) => seg.map((p, i) => (i ? "L " : "M ") + (p[0] - minX).toFixed(2) + " " + (p[1] - minY).toFixed(2)).join(" ")).join(" ");
  const v = figma.createVector(); v.name = name;
  v.vectorPaths = [{ windingRule: "NONE", data: d }];
  v.fills = []; v.strokes = [paint(color)]; v.strokeWeight = w; v.strokeCap = "ROUND"; v.strokeJoin = "ROUND";
  parent.appendChild(v); v.x = minX; v.y = minY; return v;
}
async function plotArea(parent, o) {
  const fr = F(null, { name: "Zone de tracé", fill: "bg/surface", clip: true, w: o.w, h: o.h });
  parent.appendChild(fr); fr.x = o.x || 0; fr.y = o.y || 0;
  const X = (x) => (x - o.xmin) / (o.xmax - o.xmin) * o.w;
  const Y = (y) => o.h - (y - o.ymin) / (o.ymax - o.ymin) * o.h;
  const grid = figma.createFrame(); grid.name = "Grille"; grid.fills = []; grid.resize(o.w, o.h); grid.clipsContent = true; fr.appendChild(grid); grid.x = 0; grid.y = 0;
  for (let gx = Math.ceil(o.xmin); gx <= o.xmax; gx++) { const r = rect(1, o.h, gx === 0 ? "plot/axis" : "plot/grid", { name: "x=" + gx }); grid.appendChild(r); r.x = Math.round(X(gx)); r.y = 0; }
  for (let gy = Math.ceil(o.ymin * 2) / 2; gy <= o.ymax; gy += 0.5) { const r = rect(o.w, 1, Math.abs(gy) < 1e-9 ? "plot/axis" : "plot/grid", { name: "y=" + gy }); grid.appendChild(r); r.x = 0; r.y = Math.round(Y(gy)); }
  for (let gx = Math.ceil(o.xmin / 2) * 2; gx <= o.xmax; gx += 2) { if (gx === 0) continue; const t = await T(String(gx).replace("-", "−"), "UI/Micro", "text/tertiary", "Graduation x"); fr.appendChild(t); t.x = Math.round(X(gx) - t.width / 2); t.y = Math.round(Y(0) + 3); }
  for (const gy of [-2, -1, 1, 2]) { if (gy < o.ymin || gy > o.ymax) continue; const t = await T(String(gy).replace("-", "−"), "UI/Micro", "text/tertiary", "Graduation y"); fr.appendChild(t); t.x = Math.round(X(0) + 4); t.y = Math.round(Y(gy) - 6); }
  for (const c of o.curves || []) {
    const segs = []; let cur = [];
    for (let k = 0; k <= 240; k++) {
      const x = o.xmin + (o.xmax - o.xmin) * k / 240; const y = c.f(x); const py = Y(y);
      if (!isFinite(py) || py < -40 || py > o.h + 40) { if (cur.length) segs.push(cur); cur = []; continue; }
      cur.push([X(x), py]);
    }
    if (cur.length) segs.push(cur);
    vectorPath(fr, segs, c.color, 1.75, "Courbe " + c.label);
  }
  return { fr, X, Y };
}

// ----- Code coloré (Python / Xcas) -----
const KW = new Set(["def", "while", "if", "else", "elif", "return", "for", "in", "import", "from", "and", "or", "not", "True", "False", "None", "local", "pour", "de", "jusque", "faire", "fpour", "si", "alors", "sinon", "fsi", "tantque", "ftantque", "retourne"]);
async function codeLine(parent, src, name) {
  const t = await T(src.length ? src : " ", "Code/Input", "text/primary", name || "Ligne");
  const re = /("""[^"]*"""|"[^"]*"|'[^']*')|(#.*$)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)(?=\s*\()|(\b[A-Za-z_]\w*\b)/g;
  let m;
  while ((m = re.exec(src))) {
    const s = m.index, e = s + m[0].length;
    let col = null;
    if (m[1]) col = "syntax/string"; else if (m[2]) col = "syntax/comment"; else if (m[3]) col = "syntax/number";
    else if (m[4]) col = KW.has(m[4]) ? "syntax/keyword" : "syntax/function";
    else if (m[5] && KW.has(m[5])) col = "syntax/keyword";
    if (col) t.setRangeFills(s, e, [paint(col)]);
  }
  parent.appendChild(t); return t;
}
async function editorBody(s, lines, curLine, o = {}) {
  const b = body(s, { gap: 0 });
  const area = F("HORIZONTAL", { name: "Code", align: "MIN" }); add(b, area, { fillW: true, grow: true });
  const gutter = F("VERTICAL", { name: "Numéros", fill: "bg/surface-2", px: 4, pt: 4, align: "MAX", w: 26 }); add(area, gutter, { fillH: true });
  const code = F("VERTICAL", { name: "Lignes", fill: "bg/surface", pl: 6, pt: 4, align: "MIN" }); add(area, code, { grow: true, fillH: true });
  for (let i = 0; i < lines.length; i++) {
    const n = await T(String(i + 1), "Code/Input", i + 1 === curLine ? "accent/primary" : "text/tertiary", "N° " + (i + 1)); gutter.appendChild(n);
    const row = F("HORIZONTAL", { name: "Ligne " + (i + 1), fill: i + 1 === curLine ? "accent/primary-soft" : null }); add(code, row, { fillW: true });
    await codeLine(row, lines[i], "Code " + (i + 1));
    if (i + 1 === curLine && o.caret !== false) row.appendChild(rect(1.5, 14, "accent/primary", { name: "Curseur" }));
  }
  const st = F("HORIZONTAL", { name: "Barre éditeur", gap: 8, px: 8, py: 3, fill: "bg/surface" }); add(b, st, { fillW: true });
  st.strokes = [paint("border/default")]; st.strokeTopWeight = 1; st.strokeBottomWeight = 0; st.strokeLeftWeight = 0; st.strokeRightWeight = 0; st.strokeAlign = "INSIDE";
  st.appendChild(await T(o.pos || "Ln " + curLine + ", Col 18", "Code/Small", "text/secondary", "Position"));
  spacer(st);
  st.appendChild(await T(o.lang || "MicroPython", "UI/Micro", "text/tertiary", "Langage"));
  st.appendChild(await T("· 12 px", "UI/Micro", "text/tertiary", "Taille"));
  return b;
}
const SYRACUSE = [
  "def syracuse(n):",
  "    \"\"\"Suite de Syracuse\"\"\"",
  "    L = [n]",
  "    while n != 1:",
  "        if n % 2 == 0:",
  "            n = n // 2",
  "        else:",
  "            n = 3*n + 1",
  "        L.append(n)",
  "    return L",
];

// Fond « shell » réutilisé derrière les menus
async function shellBackground(s, o = {}) {
  status(s, Object.assign({ "Titre": "Calcul", "Session": "· session.xw" }, o.status || {}));
  const b = body(s, { px: 8, py: 6, gap: 2, justify: "MAX" });
  he(b, { in: "sqrt(8)", out: "2√2" });
  he(b, { in: "integrate(x^2, x)", frac: ["x³", "3"] });
  he(b, { in: "factor(x^4-1)", out: "(x−1)(x+1)(x²+1)" });
  inputLine(b, o.input || " ", o.exe !== false);
  softbar(s, SHELL_KEYS, !!o.shift);
  return b;
}
