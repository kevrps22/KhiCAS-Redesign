// =====================================================================
//  KhiCAS — Redesign · générateur Figma
//  Construit : variables (clair / sombre), styles, composants, écrans.
//  Ré-exécutable : supprime d'abord ce qu'il a généré lors d'un run précédent.
// =====================================================================

const KH = { V: {}, VD: {}, TS: {}, ES: {}, C: {}, font: {}, keyP: null };

// ---------- Polices (avec repli si une famille manque) ----------
const FONT_PREFS = {
  ui: [
    ["Geist", { Regular: "Regular", Medium: "Medium", SemiBold: "SemiBold", Italic: "Regular" }],
    ["Inter", { Regular: "Regular", Medium: "Medium", SemiBold: "Semi Bold", Italic: "Italic" }],
  ],
  mono: [
    ["JetBrains Mono", { Regular: "Regular", Medium: "Medium" }],
    ["Roboto Mono", { Regular: "Regular", Medium: "Medium" }],
    ["Inter", { Regular: "Regular", Medium: "Medium" }],
  ],
  math: [
    ["STIX Two Text", { Regular: "Regular", Italic: "Italic" }],
    ["Source Serif 4", { Regular: "Regular", Italic: "Italic" }],
    ["Inter", { Regular: "Regular", Italic: "Italic" }],
  ],
};

async function resolveFonts() {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  for (const [k, list] of Object.entries(FONT_PREFS)) {
    for (const [fam, map] of list) {
      try {
        for (const st of new Set(Object.values(map))) await figma.loadFontAsync({ family: fam, style: st });
        KH.font[k] = { family: fam, map };
        break;
      } catch (e) { /* essaie la suivante */ }
    }
    if (!KH.font[k]) throw new Error("Aucune police disponible pour " + k);
  }
}
const fontOf = (k, w) => ({ family: KH.font[k].family, style: KH.font[k].map[w] });

// ---------- Tokens ----------
const COLORS = {
  "bg/app": ["#F5F6FA", "#0D1017"], "bg/surface": ["#FFFFFF", "#161A23"], "bg/surface-2": ["#EEF0F5", "#1E232E"], "bg/sunken": ["#E7EAF1", "#0A0C12"],
  "border/default": ["#E0E3EC", "#272D3A"], "border/strong": ["#C9CEDA", "#363D4D"],
  "text/primary": ["#141824", "#ECEEF4"], "text/secondary": ["#5A6174", "#A3AABB"], "text/tertiary": ["#8E94A6", "#6C7487"], "text/on-accent": ["#FFFFFF", "#0D1017"],
  "accent/primary": ["#4A57E3", "#8C97FF"], "accent/primary-soft": ["#E9ECFF", "#232A4E"], "accent/primary-strong": ["#3440C2", "#B3BAFF"],
  "accent/shift": ["#E8930C", "#F7B23B"], "accent/shift-soft": ["#FFF3DC", "#3A2D14"], "accent/alpha": ["#0E9F77", "#3DD6A6"], "accent/alpha-soft": ["#DDF6EE", "#12352B"],
  "status/danger": ["#DC3E42", "#FF6B6E"], "status/danger-soft": ["#FDECEC", "#3B1C1E"], "status/success": ["#1F9D55", "#4ADE80"],
  "syntax/function": ["#4A57E3", "#8C97FF"], "syntax/keyword": ["#A23AA0", "#E58BE3"], "syntax/string": ["#0E8A66", "#3DD6A6"], "syntax/number": ["#B45309", "#F7B23B"], "syntax/comment": ["#8E94A6", "#6C7487"],
  "plot/curve-1": ["#4A57E3", "#8C97FF"], "plot/curve-2": ["#E8930C", "#F7B23B"], "plot/curve-3": ["#0E9F77", "#3DD6A6"], "plot/grid": ["#ECEEF4", "#1C212B"], "plot/axis": ["#9AA0B1", "#4E5668"],
  "periodic/alkali": ["#FDE2E1", "#4A2224"], "periodic/alkaline": ["#FFEBD2", "#46321A"], "periodic/transition": ["#E3E8FF", "#252D52"], "periodic/post": ["#DDF2EC", "#173A30"],
  "periodic/metalloid": ["#F1E7FB", "#352446"], "periodic/nonmetal": ["#E2F4FB", "#173543"], "periodic/halogen": ["#FFF6CC", "#40391A"], "periodic/noble": ["#FBE4F3", "#43213A"], "periodic/lanthanide": ["#E9F7D9", "#26391A"],
};
const DIMS = { "space/2": 2, "space/4": 4, "space/6": 6, "space/8": 8, "space/12": 12, "space/16": 16, "radius/sm": 4, "radius/md": 6, "radius/lg": 10, "radius/full": 999 };

const TEXT_STYLES = [
  // nom, police, graisse, taille, interligne, interlettrage
  ["UI/Hero", "ui", "SemiBold", 20, 24, -0.3], ["UI/Title", "ui", "SemiBold", 13, 16, -0.1],
  ["UI/Body", "ui", "Regular", 12, 16, 0], ["UI/Body Strong", "ui", "Medium", 12, 16, 0],
  ["UI/Label", "ui", "Medium", 11, 14, 0], ["UI/Caption", "ui", "Regular", 10, 13, 0], ["UI/Micro", "ui", "SemiBold", 9, 11, 0.2],
  ["Code/Input", "mono", "Regular", 12, 16, 0], ["Code/Small", "mono", "Regular", 10, 14, 0], ["Code/Strong", "mono", "Medium", 12, 16, 0],
  ["Math/Display", "math", "Regular", 17, 22, 0], ["Math/Italic", "math", "Italic", 17, 22, 0],
  ["Math/Small", "math", "Regular", 13, 16, 0], ["Math/Small Italic", "math", "Italic", 13, 16, 0],
  // Documentation (planches Figma, pas l'écran de la calculatrice)
  ["Doc/Display", "ui", "SemiBold", 56, 60, -1.5], ["Doc/H1", "ui", "SemiBold", 28, 34, -0.6], ["Doc/H2", "ui", "SemiBold", 16, 20, -0.2],
  ["Doc/Body", "ui", "Regular", 13, 19, 0], ["Doc/Label", "ui", "Medium", 12, 16, 0], ["Doc/Mono", "mono", "Regular", 12, 16, 0],
];

const hex = (h) => { h = h.replace("#", ""); return { r: parseInt(h.slice(0, 2), 16) / 255, g: parseInt(h.slice(2, 4), 16) / 255, b: parseInt(h.slice(4, 6), 16) / 255 }; };

async function getOrCreateCollection(name, aliases = []) {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  let c = cols.find((x) => x.name === name) || cols.find((x) => aliases.includes(x.name));
  if (!c) c = figma.variables.createVariableCollection(name);
  c.name = name;
  return c;
}

async function buildTokens() {
  const existing = await figma.variables.getLocalVariablesAsync();
  // Une collection par thème (le plan Starter n'autorise qu'un mode par collection).
  for (const [cname, idx, mname, store] of [["KhiCAS / Couleurs (clair)", 0, "Clair", KH.V], ["KhiCAS / Couleurs (sombre)", 1, "Sombre", KH.VD]]) {
    const col = await getOrCreateCollection(cname, idx === 0 ? ["KhiCAS / Couleurs"] : []);
    col.renameMode(col.modes[0].modeId, mname);
    const m = col.modes[0].modeId;
    for (const [n, vals] of Object.entries(COLORS)) {
      let v = existing.find((x) => x.name === n && x.variableCollectionId === col.id);
      if (!v) v = figma.variables.createVariable(n, col, "COLOR");
      v.setValueForMode(m, hex(vals[idx]));
      v.scopes = n.startsWith("text/") || n.startsWith("syntax/") ? ["TEXT_FILL"] : n.startsWith("border/") ? ["STROKE_COLOR"] : ["FRAME_FILL", "SHAPE_FILL", "STROKE_COLOR", "TEXT_FILL"];
      store[n] = v;
    }
  }
  const dcol = await getOrCreateCollection("KhiCAS / Dimensions");
  dcol.renameMode(dcol.modes[0].modeId, "Défaut");
  for (const [n, val] of Object.entries(DIMS)) {
    let v = existing.find((x) => x.name === n && x.variableCollectionId === dcol.id);
    if (!v) v = figma.variables.createVariable(n, dcol, "FLOAT");
    v.setValueForMode(dcol.modes[0].modeId, val);
    v.scopes = n.startsWith("radius") ? ["CORNER_RADIUS"] : ["GAP", "WIDTH_HEIGHT"];
  }
  // Styles de texte
  const ts = await figma.getLocalTextStylesAsync();
  for (const [n, kind, w, sz, lh, ls] of TEXT_STYLES) {
    let s = ts.find((x) => x.name === n);
    if (!s) { s = figma.createTextStyle(); s.name = n; }
    s.fontName = fontOf(kind, w);
    s.fontSize = sz; s.lineHeight = { unit: "PIXELS", value: lh }; s.letterSpacing = { unit: "PIXELS", value: ls };
    KH.TS[n] = s;
  }
  // Styles d'effet
  const es = await figma.getLocalEffectStylesAsync();
  const shadow = (name, effects) => { let s = es.find((x) => x.name === name); if (!s) { s = figma.createEffectStyle(); s.name = name; } s.effects = effects; KH.ES[name] = s; };
  const ds = (a, y, r, sp) => ({ type: "DROP_SHADOW", color: { r: 0.08, g: 0.1, b: 0.16, a }, offset: { x: 0, y }, radius: r, spread: sp, visible: true, blendMode: "NORMAL" });
  shadow("Élévation/1", [ds(0.08, 1, 2, 0)]);
  shadow("Élévation/2", [ds(0.1, 4, 12, -2), ds(0.06, 1, 3, 0)]);
  shadow("Élévation/Doc", [ds(0.1, 12, 32, -8), ds(0.05, 2, 6, 0)]);
}

// ---------- Helpers de construction ----------
const paint = (n, opacity) => {
  const v = KH.V[n]; if (!v) throw new Error("Variable inconnue : " + n);
  const p = { type: "SOLID", color: { r: 0, g: 0, b: 0 } };
  if (opacity != null) p.opacity = opacity;
  return figma.variables.setBoundVariableForPaint(p, "color", v);
};

async function T(str, style, color, name) {
  const t = figma.createText();
  const s = KH.TS[style]; if (!s) throw new Error("Style inconnu : " + style);
  await t.setTextStyleIdAsync(s.id);
  t.characters = str;
  t.fills = [paint(color)];
  t.name = name || str.slice(0, 32);
  return t;
}

// Premier argument ni null ni undefined (remplace « ?? », non supporté par Scripter)
function nn() { for (let i = 0; i < arguments.length; i++) if (arguments[i] !== undefined && arguments[i] !== null) return arguments[i]; return undefined; }

function setupFrame(f, dir, o) {
  f.name = o.name || "Frame";
  f.fills = o.fill ? [paint(o.fill, o.op)] : [];
  f.clipsContent = !!o.clip;
  if (dir) {
    f.layoutMode = dir;
    f.itemSpacing = o.gap || 0;
    f.paddingLeft = nn(o.pl, o.px, o.p, 0); f.paddingRight = nn(o.pr, o.px, o.p, 0);
    f.paddingTop = nn(o.pt, o.py, o.p, 0); f.paddingBottom = nn(o.pb, o.py, o.p, 0);
    f.counterAxisAlignItems = o.align || "CENTER";
    if (o.justify) f.primaryAxisAlignItems = o.justify;
    if (o.wrap) { f.layoutWrap = "WRAP"; f.counterAxisSpacing = nn(o.wrapGap, o.gap, 0); }
  }
  if (o.radius != null) f.cornerRadius = o.radius;
  if (o.stroke) { f.strokes = [paint(o.stroke)]; f.strokeWeight = o.sw || 1; f.strokeAlign = "INSIDE"; }
  if (o.w != null || o.h != null) f.resize(nn(o.w, 100), nn(o.h, 100));
  if (dir) {
    const wF = o.w != null, hF = o.h != null;
    if (dir === "HORIZONTAL") { f.primaryAxisSizingMode = wF ? "FIXED" : "AUTO"; f.counterAxisSizingMode = hF ? "FIXED" : "AUTO"; }
    else { f.primaryAxisSizingMode = hF ? "FIXED" : "AUTO"; f.counterAxisSizingMode = wF ? "FIXED" : "AUTO"; }
  }
  return f;
}
const F = (dir, o = {}) => setupFrame(figma.createFrame(), dir, o);
const COMP = (name, dir, o = {}) => setupFrame(figma.createComponent(), dir, Object.assign({}, o, { name }));

function add(parent, child, o = {}) {
  parent.appendChild(child);
  if (o.abs) child.layoutPositioning = "ABSOLUTE";
  if (o.fillW) child.layoutSizingHorizontal = "FILL";
  if (o.fillH) child.layoutSizingVertical = "FILL";
  if (o.grow) child.layoutGrow = 1;
  if (o.x != null) child.x = o.x;
  if (o.y != null) child.y = o.y;
  return child;
}
// Texte qui passe à la ligne dans un parent auto-layout
function addWrap(parent, t) { parent.appendChild(t); t.layoutSizingHorizontal = "FILL"; t.textAutoResize = "HEIGHT"; return t; }
function spacer(p) { const s = figma.createFrame(); s.name = "Espace"; s.fills = []; s.resize(1, 1); p.appendChild(s); s.layoutGrow = 1; return s; }
function rect(w, h, fill, o = {}) { const r = figma.createRectangle(); r.resize(w, h); r.fills = fill ? [paint(fill, o.op)] : []; if (o.radius != null) r.cornerRadius = o.radius; if (o.name) r.name = o.name; return r; }
function divider(parent, color = "border/default") { const r = rect(10, 1, color, { name: "Séparateur" }); parent.appendChild(r); r.layoutSizingHorizontal = "FILL"; return r; }
const effect = async (node, name) => node.setEffectStyleIdAsync(KH.ES[name].id);

// Propriétés de composant (par nom lisible, sans le suffixe #id)
function propKey(node, name) {
  const k = Object.keys(node.componentProperties).find((k) => k.split("#")[0] === name);
  if (!k) throw new Error(`Propriété « ${name} » absente sur ${node.name}`);
  return k;
}
function setP(inst, props) { const o = {}; for (const [n, v] of Object.entries(props)) o[propKey(inst, n)] = v; inst.setProperties(o); return inst; }
function I(c, props) { const base = c.type === "COMPONENT_SET" ? c.defaultVariant : c; const i = base.createInstance(); if (props) setP(i, props); return i; }
const exp = (inst, name) => { const e = inst.exposedInstances.find((n) => n.name === name); if (!e) throw new Error(`Instance exposée « ${name} » absente sur ${inst.name}`); return e; };
function defProp(comp, name, type, def) { return comp.addComponentProperty(name, type, def); }
function ref(node, refs) { node.componentPropertyReferences = Object.assign({}, node.componentPropertyReferences || {}, refs); }

const SHAPES = ["VECTOR", "ELLIPSE", "RECTANGLE", "LINE", "POLYGON", "STAR", "BOOLEAN_OPERATION"];
function tint(node, color) {
  for (const v of node.findAll((n) => SHAPES.includes(n.type))) {
    if (v.strokes && v.strokes.length) v.strokes = [paint(color)];
  }
  return node;
}
function icon(name, color = "text/secondary", size = 16) {
  const c = KH.C["Icon/" + name]; if (!c) throw new Error("Icône inconnue : " + name);
  const i = c.createInstance(); i.name = "Icône " + name;
  if (size !== 16) i.resize(size, size);
  return tint(i, color);
}
function keyType(label) { if (label.startsWith("⇧")) return "Shift"; if (label.startsWith("α")) return "Alpha"; return "Plain"; }
function key(label, type) { return I(KH.C.Key, { Type: type || keyType(label), Label: label }); }
function setKey(keyInst, label, type) { setP(keyInst, { Type: type || keyType(label), Label: label }); return keyInst; }

function markRoot(n) { n.setPluginData("khicas", "1"); return n; }
