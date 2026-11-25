// KhiCAS Redesign — version Scripter (coller dans le plugin « Scripter » et lancer)
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
// ---------- Icônes (traits 1.5, style Lucide, 16px) ----------
const ICONS = {
  "chevron-right": '<path d="m9 18 6-6-6-6"/>', "chevron-left": '<path d="m15 18-6-6 6-6"/>',
  "chevron-down": '<path d="m6 9 6 6 6-6"/>',
  settings: '<path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4"/>',
  chart: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
  table: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
  code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
  save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
  folder: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>',
  "file-plus": '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6M12 18v-6M9 15h6"/>',
  play: '<path d="M6 3l14 9-14 9z"/>',
  trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
  keyboard: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/>',
  matrix: '<path d="M8 3H5v18h3M16 3h3v18h-3M10 9h.01M14 9h.01M10 15h.01M14 15h.01"/>',
  slider: '<path d="M3 12h18"/><circle cx="14" cy="12" r="3"/>',
  "log-out": '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  record: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  apps: '<rect width="7" height="7" x="3" y="3" rx="1.5"/><rect width="7" height="7" x="14" y="3" rx="1.5"/><rect width="7" height="7" x="14" y="14" rx="1.5"/><rect width="7" height="7" x="3" y="14" rx="1.5"/>',
  atom: '<circle cx="12" cy="12" r="1"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/>',
  coins: '<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18M7 6h1v4M16.71 13.88l.7.71-2.82 2.82"/>',
  "trending-up": '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
  type: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
  sparkles: '<path d="M12 3l1.9 5.8L20 10.7l-5.8 1.9L12 18.4l-1.9-5.8L4 10.7l5.8-1.9z"/>',
  "hard-drive": '<path d="M22 12H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11zM6 16h.01M10 16h.01"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  turtle: '<path d="M3 11 22 2l-9 19-2-8z"/>',
  "zoom-in": '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3M11 8v6M8 11h6"/>',
  "zoom-out": '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3M8 11h6"/>',
  maximize: '<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>',
  move: '<path d="m5 9-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/>',
  crosshair: '<circle cx="12" cy="12" r="10"/><path d="M22 12h-4M6 12H2M12 6V2M12 22v-4"/>',
  cpu: '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M8 16H3v5"/>',
  sigma: '<path d="M18 7V4H6l6 8-6 8h12v-3"/>',
  undo: '<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>', plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
  variable: '<path d="M8 21s-4-3-4-9 4-9 4-9M16 3s4 3 4 9-4 9-4 9M15 9l-6 6M9 9l6 6"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
  replace: '<path d="M14 4a2 2 0 0 1 2-2M16 10a2 2 0 0 1-2-2M20 2a2 2 0 0 1 2 2M22 8a2 2 0 0 1-2 2M3 7l3 3 3-3M6 10V5a3 3 0 0 1 3-3h1"/><rect x="2" y="14" width="8" height="8" rx="2"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  cube: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
  "corner-down-left": '<path d="M9 10l-5 5 5 5"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/>',
  "arrow-right": '<path d="M5 12h14M12 5l7 7-7 7"/>', hash: '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
  grid: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',
  function: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 17c2 0 2.8-1 2.8-2.8V10c0-2 1-3.3 3.2-3M9 11.2h5.7"/>',
  pencil: '<path d="M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z"/>',
};

async function buildIcons(board) {
  for (const [name, body] of Object.entries(ICONS)) {
    const svg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
    const node = figma.createNodeFromSvg(svg);
    node.resize(16, 16);
    const comp = figma.createComponentFromNode(node);
    comp.name = "Icon/" + name; comp.fills = [];
    for (const v of comp.findAll((n) => SHAPES.includes(n.type))) {
      if (v.strokes && v.strokes.length) { v.strokes = [paint("text/secondary")]; v.strokeWeight = 1.5; }
      v.fills = [];
    }
    comp.description = "Icône 16 px, trait 1,5. Couleur surchargeable sur l'instance.";
    board.appendChild(comp);
    KH.C["Icon/" + name] = comp;
  }
}

// ---------- Composants ----------
async function buildComponents(board) {
  const sets = [];
  const combine = (comps, name, dir, desc) => {
    const s = figma.combineAsVariants(comps, board);
    s.name = name; s.layoutMode = dir; s.itemSpacing = 12;
    s.paddingLeft = s.paddingRight = s.paddingTop = s.paddingBottom = 16;
    s.primaryAxisSizingMode = "AUTO"; s.counterAxisSizingMode = "AUTO";
    s.fills = [paint("bg/surface")]; s.cornerRadius = 12;
    s.strokes = [paint("border/default")]; s.strokeWeight = 1; s.dashPattern = [4, 4];
    s.description = desc; sets.push(s); return s;
  };

  // Key — touche du clavier
  {
    const variants = [["Plain", "bg/surface-2", "text/secondary", "border/strong"], ["Shift", "accent/shift-soft", "accent/shift", null], ["Alpha", "accent/alpha-soft", "accent/alpha", null], ["Primary", "accent/primary", "text/on-accent", null], ["Dark", "text/primary", "bg/surface", null]];
    const comps = [];
    for (const [v, bg, fg, br] of variants) {
      const c = COMP("Type=" + v, "HORIZONTAL", { px: 4, py: 1, radius: 4, fill: bg, justify: "CENTER" });
      c.minWidth = 15; c.minHeight = 14;
      if (br) { c.strokes = [paint(br)]; c.strokeWeight = 1; c.strokeAlign = "INSIDE"; c.strokeBottomWeight = 1.5; }
      c.appendChild(await T("OK", "UI/Micro", fg, "Label"));
      comps.push(c);
    }
    const s = combine(comps, "Key", "HORIZONTAL", "Touche du clavier NumWorks. Plain = touche normale, Shift = ⇧ (ambre, comme le clavier), Alpha = α (vert), Primary = action principale (OK / EXE), Dark = touche système.");
    const p = defProp(s, "Label", "TEXT", "OK");
    for (const c of s.children) ref(c.findOne((n) => n.name === "Label"), { characters: p });
    KH.C.Key = s;
  }

  // StatusBar
  {
    const c = COMP("StatusBar", "HORIZONTAL", { gap: 6, px: 8, fill: "bg/surface", w: 320, h: 20 });
    c.strokes = [paint("border/default")]; c.strokeAlign = "INSIDE"; c.strokeTopWeight = 0; c.strokeLeftWeight = 0; c.strokeRightWeight = 0; c.strokeBottomWeight = 1;
    const logo = F("HORIZONTAL", { name: "Logo", fill: "accent/primary", radius: 3, w: 13, h: 13, justify: "CENTER" });
    const chi = await T("χ", "Math/Small Italic", "text/on-accent", "χ"); chi.fontSize = 11; chi.lineHeight = { unit: "PIXELS", value: 12 };
    logo.appendChild(chi); c.appendChild(logo);
    const title = await T("Calcul", "UI/Label", "text/primary", "Titre"); c.appendChild(title);
    const sess = await T("· session", "UI/Caption", "text/tertiary", "Session"); c.appendChild(sess);
    spacer(c);
    const sh = key("⇧", "Shift"); sh.name = "Shift"; c.appendChild(sh);
    const al = key("α", "Alpha"); al.name = "Alpha"; c.appendChild(al);
    const m1 = F("HORIZONTAL", { name: "Interpréteur", px: 4, py: 1, fill: "bg/surface-2", radius: 3 });
    const m1t = await T("Xcas", "UI/Micro", "text/secondary", "Interpréteur texte"); m1.appendChild(m1t); c.appendChild(m1);
    const m2 = F("HORIZONTAL", { name: "Angle", px: 4, py: 1, fill: "bg/surface-2", radius: 3 });
    const m2t = await T("RAD", "UI/Micro", "text/secondary", "Angle texte"); m2.appendChild(m2t); c.appendChild(m2);
    const time = await T("22:29", "UI/Micro", "text/secondary", "Heure"); c.appendChild(time);
    const bat = F("HORIZONTAL", { name: "Batterie", px: 1, py: 1, radius: 2, stroke: "text/secondary", w: 15, h: 8 });
    const lvl = rect(9, 4, "text/secondary", { radius: 1, name: "Niveau" }); bat.appendChild(lvl); c.appendChild(bat);
    ref(title, { characters: defProp(c, "Titre", "TEXT", "Calcul") });
    ref(sess, { characters: defProp(c, "Session", "TEXT", "· session") });
    ref(m1t, { characters: defProp(c, "Interpréteur", "TEXT", "Xcas") });
    ref(m2t, { characters: defProp(c, "Angle", "TEXT", "RAD") });
    ref(time, { characters: defProp(c, "Heure", "TEXT", "22:29") });
    ref(sh, { visible: defProp(c, "Shift actif", "BOOLEAN", false) });
    ref(al, { visible: defProp(c, "Alpha actif", "BOOLEAN", false) });
    c.description = "Barre d'état (20 px). Remplace le bandeau bleu « shell Py ^=** RAD session » : app, fichier, indicateurs ⇧ / α, interpréteur, unité d'angle, heure, batterie.";
    board.appendChild(c); KH.C.StatusBar = c;
  }

  // SoftKey (variante Default / Shift)
  {
    const comps = [];
    for (const st of ["Default", "Shift"]) {
      const c = COMP("État=" + st, "HORIZONTAL", { gap: 3, justify: "CENTER" });
      const k = key("1", st === "Shift" ? "Shift" : "Plain"); k.name = "Touche"; c.appendChild(k); k.isExposedInstance = true;
      c.appendChild(await T("Algèbre", "UI/Micro", st === "Shift" ? "text/primary" : "text/secondary", "Libellé"));
      comps.push(c);
    }
    const s = combine(comps, "SoftKey", "HORIZONTAL", "Raccourci de la barre du bas : touche chiffre + libellé en clair. État=Shift quand ⇧ est enfoncé (les menus ⇧1…⇧6 deviennent actifs).");
    const p = defProp(s, "Libellé", "TEXT", "Algèbre");
    for (const c of s.children) ref(c.findOne((n) => n.name === "Libellé"), { characters: p });
    KH.C.SoftKey = s;
  }

  // SoftKeyBar
  {
    const c = COMP("SoftKeyBar", "HORIZONTAL", { px: 2, fill: "bg/surface", w: 320, h: 22 });
    c.strokes = [paint("border/default")]; c.strokeAlign = "INSIDE"; c.strokeTopWeight = 1; c.strokeLeftWeight = 0; c.strokeRightWeight = 0; c.strokeBottomWeight = 0;
    const labels = [["1", "Algèbre"], ["2", "Calcul"], ["3", "Tracer"], ["4", "Éditer"], ["5", "2D"], ["6", "Régr."]];
    for (const [n, l] of labels) {
      const i = I(KH.C.SoftKey, { "Libellé": l }); i.name = "Raccourci " + n;
      c.appendChild(i); i.layoutGrow = 1; i.isExposedInstance = true;
      setKey(exp(i, "Touche"), n, "Plain");
    }
    c.description = "Barre des raccourcis ⇧1…⇧6 (22 px). Libellés en clair au lieu de « shift-1 algb|2 calc|3 plot… ». Changer chaque raccourci via ses instances exposées.";
    board.appendChild(c); KH.C.SoftKeyBar = c;
  }

  // ActionHint
  {
    const c = COMP("ActionHint", "HORIZONTAL", { gap: 4 });
    const k = key("OK", "Plain"); k.name = "Touche"; c.appendChild(k); k.isExposedInstance = true;
    const l = await T("Valider", "UI/Caption", "text/secondary", "Libellé"); c.appendChild(l);
    ref(l, { characters: defProp(c, "Libellé", "TEXT", "Valider") });
    c.description = "Indication d'action clavier : [touche] + verbe.";
    board.appendChild(c); KH.C.ActionHint = c;
  }

  // HintBar (barre d'aide contextuelle, alternative à la SoftKeyBar)
  {
    const c = COMP("HintBar", "HORIZONTAL", { gap: 12, px: 8, fill: "bg/surface", w: 320, h: 22 });
    c.strokes = [paint("border/default")]; c.strokeAlign = "INSIDE"; c.strokeTopWeight = 1; c.strokeLeftWeight = 0; c.strokeRightWeight = 0; c.strokeBottomWeight = 0;
    const defs = [["OK", "Valider"], ["←→", "Onglet"], ["⇧1", "Exemple"], ["Back", "Retour"]];
    defs.forEach(([k, l], i) => {
      if (i === 2) spacer(c);
      const a = I(KH.C.ActionHint, { "Libellé": l }); a.name = "Action " + (i + 1);
      c.appendChild(a); a.isExposedInstance = true; setKey(exp(a, "Touche"), k);
    });
    c.description = "Barre d'aide (22 px) : jusqu'à 4 actions clavier. Les 2 dernières sont alignées à droite.";
    board.appendChild(c); KH.C.HintBar = c;
  }

  // MenuItem
  {
    const comps = [];
    for (const sel of [false, true]) {
      const c = COMP("Sélectionné=" + sel, "HORIZONTAL", { gap: 7, px: 7, py: 4, radius: 6, fill: sel ? "accent/primary-soft" : null, w: 280 });
      const k = key("1", sel ? "Primary" : "Plain"); k.name = "Indice"; c.appendChild(k); k.isExposedInstance = true;
      c.appendChild(icon("sigma", sel ? "accent/primary" : "text/secondary", 14));
      c.children[c.children.length - 1].name = "Icône";
      c.appendChild(await T("simplify(", "UI/Body", sel ? "accent/primary-strong" : "text/primary", "Libellé"));
      spacer(c);
      c.appendChild(await T("Simplifier", "UI/Caption", sel ? "accent/primary" : "text/tertiary", "Description"));
      const ch = icon("chevron-right", sel ? "accent/primary" : "text/tertiary", 12); ch.name = "Chevron"; c.appendChild(ch);
      comps.push(c);
    }
    const s = combine(comps, "MenuItem", "VERTICAL", "Ligne de menu navigable au clavier : indice (la touche 1–9 ouvre directement), icône optionnelle, libellé, description (ou raccourci d'origine), chevron si sous-menu.");
    const pL = defProp(s, "Libellé", "TEXT", "simplify(");
    const pD = defProp(s, "Description", "TEXT", "Simplifier");
    const bI = defProp(s, "Icône visible", "BOOLEAN", false);
    const bD = defProp(s, "Description visible", "BOOLEAN", true);
    const bC = defProp(s, "Chevron", "BOOLEAN", false);
    const pI = defProp(s, "Icône", "INSTANCE_SWAP", KH.C["Icon/sigma"].id);
    for (const c of s.children) {
      ref(c.findOne((n) => n.name === "Libellé"), { characters: pL });
      ref(c.findOne((n) => n.name === "Description"), { characters: pD, visible: bD });
      ref(c.findOne((n) => n.name === "Icône"), { visible: bI, mainComponent: pI });
      ref(c.findOne((n) => n.name === "Chevron"), { visible: bC });
    }
    KH.C.MenuItem = s;
  }

  // Fraction
  {
    const c = COMP("Math/Fraction", "VERTICAL", { gap: 1, px: 1 });
    const n = await T("x³", "Math/Small", "text/primary", "Numérateur"); c.appendChild(n);
    const bar = rect(10, 1, "text/primary", { name: "Barre" }); c.appendChild(bar); bar.layoutSizingHorizontal = "FILL";
    const d = await T("3", "Math/Small", "text/primary", "Dénominateur"); c.appendChild(d);
    ref(n, { characters: defProp(c, "Numérateur", "TEXT", "x³") });
    ref(d, { characters: defProp(c, "Dénominateur", "TEXT", "3") });
    c.description = "Fraction en rendu 2D (STIX Two, style LaTeX).";
    board.appendChild(c); KH.C.Fraction = c;
  }

  // HistoryEntry
  {
    const comps = [];
    for (const sel of [false, true]) {
      const c = COMP("Sélectionné=" + sel, "VERTICAL", { gap: 1, px: 10, py: 5, radius: 8, fill: sel ? "accent/primary-soft" : null, align: "MIN", w: 304 });
      if (sel) { c.strokes = [paint("accent/primary")]; c.strokeWeight = 1; c.strokeAlign = "INSIDE"; }
      const inRow = F("HORIZONTAL", { name: "Entrée", gap: 6 });
      inRow.appendChild(await T("›", "Code/Input", "text/tertiary", "Invite"));
      inRow.appendChild(await T("integrate(x^2, x)", "Code/Input", "text/secondary", "Saisie"));
      c.appendChild(inRow);
      const outRow = F("HORIZONTAL", { name: "Résultat", gap: 4, justify: "MAX" });
      add(c, outRow, { fillW: true });
      outRow.appendChild(await T("1/2", "Math/Display", "text/primary", "Résultat texte"));
      const fr = I(KH.C.Fraction); fr.name = "Résultat fraction"; outRow.appendChild(fr); fr.isExposedInstance = true;
      comps.push(c);
    }
    const s = combine(comps, "HistoryEntry", "VERTICAL", "Entrée d'historique du shell : saisie (mono) à gauche, résultat formaté (STIX) à droite. Sélectionné = navigation ↑↓ dans l'historique (OK recopie, EXE ouvre en 2D).");
    const pS = defProp(s, "Saisie", "TEXT", "integrate(x^2, x)");
    const pR = defProp(s, "Résultat", "TEXT", "1/2");
    const bT = defProp(s, "Résultat texte", "BOOLEAN", true);
    const bF = defProp(s, "Résultat fraction", "BOOLEAN", false);
    for (const c of s.children) {
      ref(c.findOne((n) => n.name === "Saisie"), { characters: pS });
      ref(c.findOne((n) => n.name === "Résultat texte"), { characters: pR, visible: bT });
      ref(c.findOne((n) => n.name === "Résultat fraction"), { visible: bF });
    }
    KH.C.HistoryEntry = s;
  }

  // InputLine
  {
    const c = COMP("InputLine", "HORIZONTAL", { gap: 6, px: 8, py: 5, radius: 8, fill: "bg/surface", stroke: "accent/primary", sw: 1.5, w: 304 });
    c.appendChild(await T("›", "Code/Strong", "accent/primary", "Invite"));
    const t = await T("factor(x^4-1)", "Code/Input", "text/primary", "Saisie"); c.appendChild(t);
    c.appendChild(rect(1.5, 14, "accent/primary", { name: "Curseur" }));
    spacer(c);
    const h = key("EXE", "Plain"); h.name = "Indice EXE"; c.appendChild(h);
    ref(t, { characters: defProp(c, "Saisie", "TEXT", "factor(x^4-1)") });
    ref(h, { visible: defProp(c, "Indice EXE", "BOOLEAN", true) });
    c.description = "Ligne de saisie active : focus indigo, curseur, rappel EXE.";
    board.appendChild(c); KH.C.InputLine = c;
  }

  // Field (champ de formulaire)
  {
    const comps = [];
    for (const sel of [false, true]) {
      const c = COMP("Sélectionné=" + sel, "HORIZONTAL", { gap: 6, px: 8, py: 4, radius: 6, fill: "bg/surface", stroke: sel ? "accent/primary" : "border/default", sw: sel ? 1.5 : 1, w: 140 });
      c.appendChild(await T("x min", "UI/Caption", "text/tertiary", "Libellé"));
      spacer(c);
      c.appendChild(await T("−7", "Code/Input", "text/primary", "Valeur"));
      const u = await T(" ", "UI/Caption", "text/tertiary", "Unité"); c.appendChild(u);
      comps.push(c);
    }
    const s = combine(comps, "Field", "VERTICAL", "Champ de saisie numérique (formulaires : fenêtre graphique, finance, paramètre).");
    const pL = defProp(s, "Libellé", "TEXT", "x min"), pV = defProp(s, "Valeur", "TEXT", "−7"), pU = defProp(s, "Unité", "TEXT", " ");
    for (const c of s.children) {
      ref(c.findOne((n) => n.name === "Libellé"), { characters: pL });
      ref(c.findOne((n) => n.name === "Valeur"), { characters: pV });
      ref(c.findOne((n) => n.name === "Unité"), { characters: pU });
    }
    KH.C.Field = s;
  }

  // Chip
  {
    const comps = [];
    for (const sel of [false, true]) {
      const c = COMP("Sélectionné=" + sel, "HORIZONTAL", { gap: 4, px: 7, py: 2, radius: 999, fill: sel ? "text/primary" : "bg/surface-2" });
      c.appendChild(await T("Analyse", "UI/Label", sel ? "bg/surface" : "text/secondary", "Libellé"));
      comps.push(c);
    }
    const s = combine(comps, "Chip", "HORIZONTAL", "Onglet / catégorie. ← → pour changer.");
    const p = defProp(s, "Libellé", "TEXT", "Analyse");
    for (const c of s.children) ref(c.findOne((n) => n.name === "Libellé"), { characters: p });
    KH.C.Chip = s;
  }

  // Toast
  {
    const c = COMP("Toast", "HORIZONTAL", { gap: 6, px: 10, py: 5, radius: 999, fill: "text/primary" });
    await effect(c, "Élévation/2");
    c.appendChild(icon("check", "bg/surface", 12));
    const l = await T("Session enregistrée", "UI/Label", "bg/surface", "Message"); c.appendChild(l);
    ref(l, { characters: defProp(c, "Message", "TEXT", "Session enregistrée") });
    c.description = "Confirmation éphémère (2 s). Remplace les messages affichés dans la barre de titre.";
    board.appendChild(c); KH.C.Toast = c;
  }

  // HelpCard
  {
    const c = COMP("HelpCard", "VERTICAL", { gap: 5, px: 10, py: 8, radius: 10, fill: "bg/surface", stroke: "border/default", align: "MIN", w: 236 });
    await effect(c, "Élévation/2");
    const head = F("HORIZONTAL", { name: "En-tête", gap: 6 }); add(c, head, { fillW: true });
    const fn = await T("integrate", "Code/Strong", "syntax/function", "Fonction"); head.appendChild(fn);
    spacer(head);
    const cat = await T("Analyse", "UI/Caption", "text/tertiary", "Catégorie"); head.appendChild(cat);
    const d = await T("Primitive d'une expression, ou intégrale définie entre deux bornes.", "UI/Caption", "text/secondary", "Description"); addWrap(c, d);
    const syn = F("HORIZONTAL", { name: "Syntaxe", px: 6, py: 3, radius: 4, fill: "bg/surface-2" }); add(c, syn, { fillW: true });
    const synT = await T("integrate(expr, x, [a, b])", "Code/Small", "text/primary", "Syntaxe texte"); syn.appendChild(synT);
    const ex = F("VERTICAL", { name: "Exemples", gap: 3, align: "MIN" }); c.appendChild(ex);
    const exT = [];
    for (const [i, e] of [["1", "integrate(1/x, x)"], ["2", "integrate(sin(x), x, 0, pi)"]]) {
      const r = F("HORIZONTAL", { name: "Exemple " + i, gap: 6 }); r.appendChild(key("⇧" + i)); const t = await T(e, "Code/Small", "text/secondary", "Exemple " + i + " texte"); r.appendChild(t); ex.appendChild(r); exT.push(t);
    }
    ref(fn, { characters: defProp(c, "Fonction", "TEXT", "integrate") });
    ref(cat, { characters: defProp(c, "Catégorie", "TEXT", "Analyse") });
    ref(d, { characters: defProp(c, "Description", "TEXT", d.characters) });
    ref(synT, { characters: defProp(c, "Syntaxe", "TEXT", synT.characters) });
    ref(exT[0], { characters: defProp(c, "Exemple 1", "TEXT", exT[0].characters) });
    ref(exT[1], { characters: defProp(c, "Exemple 2", "TEXT", exT[1].characters) });
    c.description = "Aide contextuelle d'une commande, affichée pendant la saisie (remplace la bulle jaune). ⇧1 / ⇧2 insèrent l'exemple.";
    board.appendChild(c); KH.C.HelpCard = c;
  }

  // Dialog
  {
    const c = COMP("Dialog", "VERTICAL", { gap: 7, px: 14, py: 12, radius: 12, fill: "bg/surface", stroke: "border/default", align: "MIN", w: 248 });
    await effect(c, "Élévation/2");
    const ic = icon("info", "accent/primary", 18); ic.name = "Icône"; c.appendChild(ic);
    const t = await T("Choisir l'interpréteur", "UI/Title", "text/primary", "Titre"); c.appendChild(t);
    const b = await T("Modifiable à tout moment dans Configuration.", "UI/Body", "text/secondary", "Message"); addWrap(c, b);
    const act = F("HORIZONTAL", { name: "Actions", gap: 10, justify: "MAX", pt: 2 }); add(c, act, { fillW: true });
    const a1 = I(KH.C.ActionHint, { "Libellé": "Annuler" }); a1.name = "Action secondaire"; act.appendChild(a1); a1.isExposedInstance = true; setKey(exp(a1, "Touche"), "Back");
    const a2 = I(KH.C.ActionHint, { "Libellé": "Valider" }); a2.name = "Action principale"; act.appendChild(a2); a2.isExposedInstance = true; setKey(exp(a2, "Touche"), "OK", "Primary");
    ref(t, { characters: defProp(c, "Titre", "TEXT", t.characters) });
    ref(b, { characters: defProp(c, "Message", "TEXT", b.characters) });
    ref(ic, { visible: defProp(c, "Icône visible", "BOOLEAN", true), mainComponent: defProp(c, "Icône", "INSTANCE_SWAP", KH.C["Icon/info"].id) });
    c.description = "Boîte de dialogue modale. Les actions sont toujours mappées sur des touches (OK / Back).";
    board.appendChild(c); KH.C.Dialog = c;
  }

  // ConfigRow (Contrôle × Sélectionné)
  {
    const comps = [];
    for (const ctl of ["Interrupteur on", "Interrupteur off", "Choix"]) for (const sel of [false, true]) {
      const c = COMP(`Contrôle=${ctl}, Sélectionné=${sel}`, "HORIZONTAL", { gap: 8, px: 8, py: 5, radius: 6, fill: sel ? "accent/primary-soft" : null, w: 288 });
      const ic = icon("globe", sel ? "accent/primary" : "text/secondary", 14); ic.name = "Icône"; c.appendChild(ic);
      c.appendChild(await T("Langue", "UI/Body", sel ? "accent/primary-strong" : "text/primary", "Libellé"));
      spacer(c);
      if (ctl === "Choix") {
        c.appendChild(await T("Français", "UI/Label", sel ? "accent/primary" : "text/secondary", "Valeur"));
        const ch = icon("chevron-right", sel ? "accent/primary" : "text/tertiary", 12); ch.name = "Chevron"; c.appendChild(ch);
      } else {
        const on = ctl.endsWith("on");
        const tr = F("HORIZONTAL", { name: "Interrupteur", px: 2, radius: 999, fill: on ? "accent/primary" : "border/strong", w: 24, h: 14, justify: on ? "MAX" : "MIN" });
        const kn = figma.createEllipse(); kn.name = "Bouton"; kn.resize(10, 10); kn.fills = [paint("bg/surface")]; tr.appendChild(kn);
        c.appendChild(tr);
      }
      comps.push(c);
    }
    const s = combine(comps, "ConfigRow", "VERTICAL", "Ligne de réglage. OK bascule l'interrupteur ou ouvre le choix ; ← → change directement la valeur.");
    const pL = defProp(s, "Libellé", "TEXT", "Langue"), pV = defProp(s, "Valeur", "TEXT", "Français"), pI = defProp(s, "Icône", "INSTANCE_SWAP", KH.C["Icon/globe"].id);
    for (const c of s.children) {
      ref(c.findOne((n) => n.name === "Libellé"), { characters: pL });
      const v = c.findOne((n) => n.name === "Valeur"); if (v) ref(v, { characters: pV });
      ref(c.findOne((n) => n.name === "Icône"), { mainComponent: pI });
    }
    KH.C.ConfigRow = s;
  }

  // ProgressBar (mémoire)
  {
    const c = COMP("Gauge", "VERTICAL", { gap: 3, align: "MIN", w: 288 });
    const top = F("HORIZONTAL", { name: "Ligne", gap: 6 }); add(c, top, { fillW: true });
    const l = await T("Stockage", "UI/Label", "text/primary", "Libellé"); top.appendChild(l);
    spacer(top);
    const v = await T("24 / 64 Ko", "Code/Small", "text/secondary", "Valeur"); top.appendChild(v);
    const track = F(null, { name: "Piste", fill: "bg/surface-2", radius: 999, w: 288, h: 5 }); add(c, track, { fillW: true });
    const fillR = rect(108, 5, "accent/primary", { radius: 999, name: "Remplissage" }); track.appendChild(fillR);
    ref(l, { characters: defProp(c, "Libellé", "TEXT", "Stockage") });
    ref(v, { characters: defProp(c, "Valeur", "TEXT", "24 / 64 Ko") });
    c.description = "Jauge (mémoire). Ajuster la largeur du calque « Remplissage » sur l'instance.";
    board.appendChild(c); KH.C.Gauge = c;
  }
  return sets;
}
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
// =====================================================================
//  Écrans. Chaque entrée : [id, titre, note (touches + fonctionnalités couvertes), builder]
// =====================================================================
const FLOWS = [];
const flow = (title, desc, screens) => FLOWS.push({ title, desc, screens });

// ------------------------------------------------------------ Démarrage
flow("1 · Démarrage", "Langue, avertissement examen et choix de l'interpréteur, réunis en deux écrans clairs au lieu de trois pop-ups successifs.", [
  ["01", "Bienvenue · langue", "← → choisit la langue (Français, English, Español, Ελληνικά, Deutsch). OK continue. Crédits et licence visibles dès l'accueil.", async (s) => {
    status(s, { "Titre": "KhiCAS", "Session": " " });
    const b = body(s, { h: 220, p: 16, gap: 10 });
    const head = F("HORIZONTAL", { name: "Marque", gap: 12 }); b.appendChild(head);
    const logo = F("HORIZONTAL", { name: "Logo", fill: "accent/primary", radius: 10, w: 40, h: 40, justify: "CENTER" }); head.appendChild(logo);
    const chi = await T("χ", "Math/Italic", "text/on-accent", "χ"); chi.fontSize = 28; chi.lineHeight = { unit: "PIXELS", value: 30 }; logo.appendChild(chi);
    const tt = F("VERTICAL", { name: "Titres", gap: 1, align: "MIN" }); head.appendChild(tt);
    tt.appendChild(await T("KhiCAS", "UI/Hero", "text/primary"));
    tt.appendChild(await T("Calcul formel · Giac / Xcas 1.6", "UI/Caption", "text/tertiary"));
    await sectionLabel(b, "Langue");
    const langs = F("HORIZONTAL", { name: "Langues", gap: 5, wrap: true, wrapGap: 5, w: 288 }); b.appendChild(langs);
    ["Français", "English", "Español", "Ελληνικά", "Deutsch"].forEach((l, i) => chip(langs, l, i === 0));
    spacer(b);
    const foot = F("HORIZONTAL", { name: "Pied", gap: 8 }); add(b, foot, { fillW: true });
    foot.appendChild(await T("© 2020 B. Parisse et al. · GPL 2", "UI/Caption", "text/tertiary"));
    spacer(foot);
    action(foot, "OK", "Continuer", "Primary");
  }],
  ["02", "Interpréteur & examen", "← → choisit Xcas ou MicroPython (modifiable ensuite dans Configuration). L'avertissement examen est une bannière lisible, plus du texte rouge. OK démarre.", async (s) => {
    status(s, { "Titre": "KhiCAS", "Session": " " });
    const b = body(s, { h: 220, p: 12, gap: 8 });
    b.appendChild(await T("Choisissez l'interpréteur", "UI/Title", "text/primary"));
    const cards = F("HORIZONTAL", { name: "Choix", gap: 8, align: "MIN" }); add(b, cards, { fillW: true });
    for (const [ic, name, desc, sel] of [["sigma", "Xcas", "Calcul formel, syntaxe compatible Python (^ = **).", true], ["code", "MicroPython", "Scripts, tortue, matplotlib, numpy.", false]]) {
      const c = F("VERTICAL", { name: "Carte " + name, gap: 3, p: 10, radius: 10, fill: sel ? "accent/primary-soft" : "bg/surface", stroke: sel ? "accent/primary" : "border/default", sw: sel ? 1.5 : 1, align: "MIN" });
      add(cards, c, { grow: true, fillH: true });
      c.appendChild(icon(ic, sel ? "accent/primary" : "text/secondary", 18));
      c.appendChild(await T(name, "UI/Title", sel ? "accent/primary-strong" : "text/primary"));
      addWrap(c, await T(desc, "UI/Caption", "text/secondary"));
    }
    const warn = F("HORIZONTAL", { name: "Avertissement examen", gap: 8, p: 8, radius: 8, fill: "accent/shift-soft", align: "MIN" }); add(b, warn, { fillW: true });
    warn.appendChild(icon("shield", "accent/shift", 14));
    addWrap(warn, await T("Calcul formel interdit en examen ? Quittez KhiCAS avec HOME ×3.", "UI/Caption", "text/primary"));
    spacer(b);
    const foot = F("HORIZONTAL", { name: "Pied", gap: 10 }); add(b, foot, { fillW: true });
    action(foot, "←→", "Choisir");
    spacer(foot);
    action(foot, "OK", "Démarrer", "Primary");
  }],
]);

// ------------------------------------------------------------ Shell
flow("2 · Shell & calcul", "Le cœur de l'app. Historique aéré, saisie mono, résultats en vrai rendu mathématique, menus de fonctions en panneau.", [
  ["03", "Shell · historique", "EXE évalue. ↑↓ parcourt l'historique (OK recopie la ligne, EXE l'ouvre en 2D). Résultats exacts en 2D (fractions, racines, puissances). Barre ⇧1…⇧6 en clair.", async (s) => {
    status(s, { "Titre": "Calcul", "Session": "· session.xw" });
    const b = body(s, { px: 8, py: 6, gap: 2, justify: "MAX" });
    he(b, { in: "1/3 + 1/6", frac: ["1", "2"] });
    he(b, { in: "sqrt(8)", out: "2√2" });
    he(b, { in: "integrate(x^2, x)", frac: ["x³", "3"] });
    he(b, { in: "factor(x^4-1)", out: "(x−1)(x+1)(x²+1)" });
    inputLine(b, "solve(x^2 = 2, x)");
    softbar(s, SHELL_KEYS);
  }],
  ["04", "Saisie · aide contextuelle", "Dès qu'une commande est reconnue, la fiche d'aide s'affiche au-dessus de la saisie : description, syntaxe, exemples. ⇧1 / ⇧2 insère l'exemple, Back masque l'aide.", async (s) => {
    await shellBackground(s, { input: "integrate(", exe: false });
    const h = I(KH.C.HelpCard); s.appendChild(h); h.x = 8; h.y = 46;
  }],
  ["05", "Menu de fonctions ⇧2", "⇧ + chiffre ouvre le menu correspondant en panneau. ← → passe d'un menu à l'autre (Algèbre, Calcul, Tracer, Éditer, Régressions, Linéaire, Complexes, Arithmétique, Listes…). 1–8 insère directement.", async (s) => {
    await shellBackground(s, { shift: true, status: { "Shift actif": true } });
    scrim(s, 20, 198);
    const sh = F("VERTICAL", { name: "Panneau Calcul", w: 320, h: 178, fill: "bg/surface", px: 6, pt: 6, pb: 4, gap: 1, clip: true, align: "MIN" });
    sh.cornerRadius = 0; sh.topLeftRadius = 12; sh.topRightRadius = 12; await effect(sh, "Élévation/2");
    s.appendChild(sh); sh.x = 0; sh.y = 40;
    chipsRow(sh, ["Algèbre", "Calcul", "Tracer", "Éditer", "2D", "Régr.", "Linéaire", "Complexes"], 1, { pb: 4, px: 2 });
    const items = [["'", "Dérivée (prime)"], ["diff(", "Dériver"], ["integrate(", "Intégrer"], ["limit(", "Limite"], ["series(", "Développement"], ["solve(", "Résoudre"], ["desolve(", "Équation diff."], ["rsolve(", "Récurrence"]];
    items.forEach(([l, d], i) => menuItem(sh, { i: i + 1, label: l, desc: d, sel: i === 2 }));
  }],
  ["06", "Afficheur 2D", "EXE sur un résultat ouvre l'afficheur : expression en rendu mathématique, ↑↓←→ sélectionne une sous-expression, ⇧1…⇧6 lui applique Algèbre / Calcul / Annuler / Éditer / ± / Approx. EXE quitte, le résultat va dans last.", async (s) => {
    status(s, { "Titre": "Afficheur 2D", "Session": "· → last" });
    const b = body(s, { p: 12, gap: 10, align: "CENTER", justify: "CENTER" });
    const ex = F("HORIZONTAL", { name: "Expression", gap: 6 }); b.appendChild(ex);
    const sig = F("VERTICAL", { name: "Somme", gap: 0 }); ex.appendChild(sig);
    sig.appendChild(await T("n", "Math/Small Italic", "text/primary"));
    const S = await T("∑", "Math/Display", "text/primary", "∑"); S.fontSize = 30; S.lineHeight = { unit: "PIXELS", value: 30 }; sig.appendChild(S);
    sig.appendChild(await T("k=1", "Math/Small", "text/primary"));
    ex.appendChild(await T("k²", "Math/Italic", "text/primary"));
    ex.appendChild(await T("=", "Math/Display", "text/primary"));
    const selF = F("HORIZONTAL", { name: "Sélection", px: 3, py: 2, radius: 4, fill: "accent/primary-soft", stroke: "accent/primary" }); ex.appendChild(selF);
    const fr = frac("n(n+1)(2n+1)", "6"); selF.appendChild(fr);
    const info = F("HORIZONTAL", { name: "Sélection info", gap: 6, px: 8, py: 4, radius: 999, fill: "bg/surface", stroke: "border/default" }); b.appendChild(info);
    info.appendChild(await T("Sélection", "UI/Caption", "text/tertiary"));
    info.appendChild(await T("n(n+1)(2n+1)/6", "Code/Small", "text/primary"));
    const foot = F("HORIZONTAL", { name: "Actions", gap: 10 }); b.appendChild(foot);
    action(foot, "↑↓←→", "Naviguer");
    action(foot, "EXE", "Quitter → last", "Primary");
    softbar(s, VIEW2D_KEYS);
  }],
  ["07", "Variables (Var)", "La touche Var liste les variables et fonctions définies avec leur valeur. OK insère le nom, ⌫ supprime la variable, ⇧ édite.", async (s) => {
    status(s, { "Titre": "Variables", "Session": "· 5 définies" });
    const b = body(s, { p: 8, gap: 2 });
    const rows = [["f(x)", "x² + 1", "function"], ["a", "3", "variable"], ["M", "[[1, 2], [3, 4]]", "matrix"], ["L", "[1, 4, 2, 1]", "list"], ["last", "x³/3", "variable"]];
    rows.forEach(([n, v, ic], i) => {
      const sel = i === 0;
      const r = F("HORIZONTAL", { name: "Variable " + n, gap: 8, px: 8, py: 6, radius: 6, fill: sel ? "accent/primary-soft" : null }); add(b, r, { fillW: true });
      r.appendChild(icon(ic, sel ? "accent/primary" : "text/tertiary", 14));
      return r;
    });
    for (const [i, [n, v]] of rows.entries()) {
      const r = b.children[i];
      r.appendChild(await T(n, "Code/Strong", i === 0 ? "accent/primary-strong" : "syntax/function"));
      r.appendChild(await T(":=", "Code/Input", "text/tertiary"));
      spacer(r);
      r.appendChild(await T(v, "Code/Input", "text/primary"));
    }
    hintbar(s, [["OK", "Insérer"], ["⇧", "Éditer"], ["⌫", "Supprimer"], ["Back", "Fermer"]]);
  }],
  ["08", "Confirmation (toast)", "Les confirmations (session enregistrée, script sauvé, copie…) apparaissent en toast 2 s au lieu d'écraser la barre de titre.", async (s) => {
    await shellBackground(s, { input: "solve(x^2 = 2, x)" });
    toast(s, "Session enregistrée · session.xw");
  }],
]);

// ------------------------------------------------------------ Catalogue
flow("3 · Catalogue & aide", "Toolbox ouvre un vrai catalogue : catégories à gauche, commandes à droite, recherche par lettres (α), fiche complète de chaque commande.", [
  ["09", "Catalogue", "Toolbox ouvre le catalogue. ↑↓ dans les commandes, ← → change de catégorie, α + lettres filtre. OK insère, → ouvre la fiche. 22 catégories : Tout, Algèbre, Algèbre linéaire, Analyse, Arithmétique, Complexes, Courbes, Polynômes, Probabilités, Programmes, Réels, Résoudre, Statistiques, Trigonométrie, Listes, Variables, Constantes et unités physiques, Géométrie, 3D, Tortue.", async (s) => {
    status(s, { "Titre": "Catalogue", "Session": "· 1 024 commandes" });
    const b = body(s, { gap: 0 });
    const top = F("HORIZONTAL", { name: "Recherche", p: 6 }); add(b, top, { fillW: true });
    const sr = F("HORIZONTAL", { name: "Champ", gap: 6, px: 8, py: 4, radius: 8, fill: "bg/surface", stroke: "border/default" }); add(top, sr, { grow: true });
    sr.appendChild(icon("search", "text/tertiary", 13));
    sr.appendChild(await T("Rechercher une commande…", "UI/Body", "text/tertiary"));
    spacer(sr); sr.appendChild(key("α", "Alpha"));
    const split = F("HORIZONTAL", { name: "Colonnes", align: "MIN" }); add(b, split, { fillW: true, grow: true });
    const left = F("VERTICAL", { name: "Catégories", w: 112, fill: "bg/surface-2", p: 4, gap: 1, align: "MIN", clip: true }); add(split, left, { fillH: true });
    const cats = ["Tout", "Algèbre", "Algèbre linéaire", "Analyse", "Arithmétique", "Complexes", "Courbes", "Polynômes", "Probabilités", "Programmes", "Réels", "Résoudre"];
    for (const [i, c] of cats.entries()) {
      const r = F("HORIZONTAL", { name: c, px: 6, py: 3, radius: 5, fill: i === 3 ? "accent/primary-soft" : null }); add(left, r, { fillW: true });
      r.appendChild(await T(c, "UI/Label", i === 3 ? "accent/primary-strong" : "text/secondary"));
    }
    const right = F("VERTICAL", { name: "Commandes", p: 4, gap: 1, align: "MIN", clip: true }); add(split, right, { grow: true, fillH: true });
    [["diff(", "Dériver"], ["integrate(", "Intégrer"], ["limit(", "Limite"], ["series(", "Dév. limité"], ["sum(", "Somme"], ["taylor(", "Taylor"], ["tabvar(", "Variations"]]
      .forEach(([l, d], i) => menuItem(right, { label: l, desc: d, sel: i === 1 }));
    hintbar(s, [["OK", "Insérer"], ["→", "Fiche"], ["←", "Catégories"], ["Back", "Fermer"]]);
  }],
  ["10", "Fiche commande", "→ depuis le catalogue (ou Toolbox pendant la saisie) : description complète, syntaxe, exemples exécutables. ⇧1 / ⇧2 insère l'exemple, OK insère la commande, les commandes liées sont accessibles.", async (s) => {
    status(s, { "Titre": "Catalogue", "Session": "· Analyse" });
    const b = body(s, { p: 12, gap: 7 });
    const head = F("HORIZONTAL", { name: "En-tête", gap: 8 }); add(b, head, { fillW: true });
    const fn = await T("integrate", "Code/Strong", "syntax/function"); fn.fontSize = 15; fn.lineHeight = { unit: "PIXELS", value: 20 }; head.appendChild(fn);
    spacer(head); chip(head, "Analyse", false);
    addWrap(b, await T("Primitive d'une expression par rapport à une variable, ou intégrale définie entre deux bornes.", "UI/Body", "text/secondary"));
    const syn = F("HORIZONTAL", { name: "Syntaxe", px: 8, py: 4, radius: 6, fill: "bg/surface-2" }); add(b, syn, { fillW: true });
    syn.appendChild(await T("integrate(expr, x, [a, b])", "Code/Input", "text/primary"));
    await sectionLabel(b, "Exemples");
    for (const [k, e, r] of [["⇧1", "integrate(1/x, x)", "ln|x|"], ["⇧2", "integrate(sin(x), x, 0, π)", "2"]]) {
      const row = F("HORIZONTAL", { name: "Exemple " + k, gap: 6 }); add(b, row, { fillW: true });
      row.appendChild(key(k)); row.appendChild(await T(e, "Code/Small", "text/primary")); spacer(row);
      row.appendChild(await T("= " + r, "Math/Small", "text/secondary"));
    }
    const see = F("HORIZONTAL", { name: "Voir aussi", gap: 4 }); b.appendChild(see);
    see.appendChild(await T("Voir aussi", "UI/Caption", "text/tertiary"));
    for (const c of ["diff", "limit", "sum"]) chip(see, c, false);
    hintbar(s, [["OK", "Insérer", "Primary"], ["⇧1", "Exemple"], ["←", "Catalogue"], ["Back", "Fermer"]]);
  }],
  ["11", "Aide · raccourcis clavier", "Menu ▸ Aide (log) : toutes les touches de KhiCAS sur une page, groupées.", async (s) => {
    status(s, { "Titre": "Aide", "Session": "· raccourcis" });
    const b = body(s, { px: 10, py: 8, gap: 3 });
    const rows = [["EXE", "Évaluer / valider"], ["↑ ↓", "Parcourir l'historique"], ["⇧1…⇧9", "Menus de fonctions"], ["Toolbox", "Catalogue des commandes"], ["Var", "Variables"], ["x,n,t", "Variable courante (x ou t)"], ["Home", "Menu KhiCAS · ×3 quitte"], ["⇧ Ans", "Applications"], ["Back", "Annuler / revenir"]];
    for (const [k, d] of rows) {
      const r = F("HORIZONTAL", { name: "Raccourci " + k, gap: 8 }); add(b, r, { fillW: true });
      const kc = F("HORIZONTAL", { name: "Touche", w: 64 }); r.appendChild(kc); kc.appendChild(key(k, k === "EXE" ? "Primary" : undefined));
      r.appendChild(await T(d, "UI/Body", "text/primary"));
    }
    hintbar(s, [["Back", "Fermer"]]);
  }],
]);

// ------------------------------------------------------------ Graphes
flow("4 · Graphes", "Tracé épuré avec grille légère, légende, mode trace et menu latéral. Les réglages de fenêtre deviennent un vrai formulaire.", [
  ["12", "Graphe · trace", "plot(), plotparam(), plotpolar(), plotseq(), plotfield(), histogram(), barplot()… + / − zoom, flèches déplacent (ou suivent la courbe en mode trace), Toolbox ouvre le menu, EXE quitte.", async (s) => {
    status(s, { "Titre": "Graphe", "Session": "· 2 courbes" });
    const { fr, X, Y } = await plotArea(s, { x: 0, y: 20, w: 320, h: 198, xmin: -7, xmax: 7, ymin: -2.2, ymax: 2.2, curves: [{ f: Math.sin, color: "plot/curve-1", label: "sin" }, { f: (x) => x * x / 8 - 1, color: "plot/curve-2", label: "parabole" }] });
    const leg = F("VERTICAL", { name: "Légende", gap: 3, px: 7, py: 5, radius: 8, fill: "bg/surface", stroke: "border/default", align: "MIN" }); fr.appendChild(leg); leg.x = 8; leg.y = 8;
    for (const [c, t] of [["plot/curve-1", "sin(x)"], ["plot/curve-2", "x²/8 − 1"]]) { const r = F("HORIZONTAL", { name: t, gap: 6 }); leg.appendChild(r); r.appendChild(rect(10, 2, c, { radius: 1 })); r.appendChild(await T(t, "Code/Small", "text/primary")); }
    const px = X(Math.PI / 2), py = Y(1);
    const vl = rect(1, 198, "accent/primary", { op: 0.35, name: "Trace verticale" }); fr.appendChild(vl); vl.x = Math.round(px); vl.y = 0;
    const dot = figma.createEllipse(); dot.name = "Point"; dot.resize(8, 8); dot.fills = [paint("bg/surface")]; dot.strokes = [paint("accent/primary")]; dot.strokeWeight = 2; fr.appendChild(dot); dot.x = px - 4; dot.y = py - 4;
    const tip = F("HORIZONTAL", { name: "Coordonnées", gap: 6, px: 7, py: 3, radius: 6, fill: "text/primary" }); fr.appendChild(tip);
    tip.appendChild(await T("x = 1,571", "Code/Small", "bg/surface")); tip.appendChild(await T("y = 1", "Code/Small", "bg/surface"));
    tip.x = Math.round(px + 8); tip.y = Math.round(py - 24);
    hintbar(s, [["+ −", "Zoom"], ["↑↓←→", "Trace"], ["Toolbox", "Menu"], ["EXE", "Quitter"]]);
  }],
  ["13", "Graphe · menu", "Toolbox dans le graphe : orthonormaliser (/), autoscale (×), zoom avant / arrière (+ −), zoom vertical ((−)), axes, fenêtre, raccourcis 3D. Les raccourcis d'origine restent affichés.", async (s) => {
    status(s, { "Titre": "Graphe", "Session": "· 2 courbes" });
    await plotArea(s, { x: 0, y: 20, w: 320, h: 198, xmin: -7, xmax: 7, ymin: -2.2, ymax: 2.2, curves: [{ f: Math.sin, color: "plot/curve-1", label: "sin" }, { f: (x) => x * x / 8 - 1, color: "plot/curve-2", label: "parabole" }] });
    const p = F("VERTICAL", { name: "Menu graphe", w: 172, h: 198, fill: "bg/surface", p: 6, gap: 1, align: "MIN", clip: true }); await effect(p, "Élévation/2");
    s.appendChild(p); p.x = 148; p.y = 20;
    const items = [["maximize", "Orthonormaliser", "/"], ["sparkles", "Autoscale", "×"], ["zoom-in", "Zoom avant", "+"], ["zoom-out", "Zoom arrière", "−"], ["move", "Zoom vertical", "(−)"], ["eye", "Masquer les axes", " "], ["settings", "Fenêtre…", " "], ["cube", "Raccourcis 3D", " "]];
    items.forEach(([ic, l, d], i) => menuItem(p, { i: i + 1, icon: ic, label: l, desc: d, sel: i === 0, chevron: l.endsWith("…") }));
    hintbar(s, [["OK", "Appliquer"], ["Back", "Fermer"]]);
  }],
  ["14", "Graphe · fenêtre", "Menu ▸ Fenêtre : bornes x / y / z (3D) en champs, ↑↓ pour naviguer, saisie directe des nombres, interrupteurs pour orthonormé et axes. OK applique.", async (s) => {
    status(s, { "Titre": "Graphe", "Session": "· fenêtre" });
    const b = body(s, { p: 12, gap: 6 });
    b.appendChild(await T("Fenêtre d'affichage", "UI/Title", "text/primary"));
    for (const [a, va, bb, vb, sel] of [["x min", "−7", "x max", "7", true], ["y min", "−2,2", "y max", "2,2", false], ["z min", "−5", "z max", "5", false]]) {
      const r = F("HORIZONTAL", { name: "Ligne " + a, gap: 8 }); add(b, r, { fillW: true });
      const f1 = field(r, a, va, { sel, fill: false }); f1.layoutGrow = 1; const f2 = field(r, bb, vb, { fill: false }); f2.layoutGrow = 1;
    }
    divider(b);
    configRow(b, { ctl: "Interrupteur off", label: "Repère orthonormé", icon: "maximize" });
    configRow(b, { ctl: "Interrupteur on", label: "Afficher les axes", icon: "eye" });
    hintbar(s, [["OK", "Appliquer", "Primary"], ["↑↓", "Champ"], ["Back", "Annuler"]]);
  }],
  ["15", "Paramètre (curseur)", "Menu ▸ Créer un paramètre (,) : nom, bornes, pas et valeur. Dans le graphe, ← → fait varier le paramètre et redessine en direct.", async (s) => {
    status(s, { "Titre": "Graphe", "Session": "· a = 1,5" });
    await plotArea(s, { x: 0, y: 20, w: 320, h: 198, xmin: -7, xmax: 7, ymin: -2.2, ymax: 2.2, curves: [{ f: (x) => Math.sin(1.5 * x), color: "plot/curve-1", label: "sin(a·x)" }] });
    scrim(s, 20, 198);
    const d = F("VERTICAL", { name: "Créer un paramètre", w: 248, gap: 8, p: 12, radius: 12, fill: "bg/surface", stroke: "border/default", align: "MIN" }); await effect(d, "Élévation/2");
    s.appendChild(d); d.x = 36; d.y = 34;
    const h = F("HORIZONTAL", { name: "Titre", gap: 6 }); d.appendChild(h); h.appendChild(icon("slider", "accent/primary", 16)); h.appendChild(await T("Créer un paramètre", "UI/Title", "text/primary"));
    const r1 = F("HORIZONTAL", { name: "Ligne 1", gap: 6 }); add(d, r1, { fillW: true });
    field(r1, "Nom", "a", { fill: false }).layoutGrow = 1; field(r1, "Pas", "0,1", { fill: false }).layoutGrow = 1;
    const r2 = F("HORIZONTAL", { name: "Ligne 2", gap: 6 }); add(d, r2, { fillW: true });
    field(r2, "Min", "−5", { fill: false }).layoutGrow = 1; field(r2, "Max", "5", { fill: false }).layoutGrow = 1;
    const sl = F("VERTICAL", { name: "Valeur", gap: 4, align: "MIN" }); add(d, sl, { fillW: true });
    const top = F("HORIZONTAL", { name: "Haut", gap: 6 }); add(sl, top, { fillW: true }); top.appendChild(await T("Valeur", "UI/Caption", "text/tertiary")); spacer(top); top.appendChild(await T("a = 1,5", "Code/Strong", "accent/primary"));
    const track = F(null, { name: "Piste", fill: "bg/surface-2", radius: 999, w: 224, h: 4 }); add(sl, track, { fillW: true });
    const fl = rect(146, 4, "accent/primary", { radius: 999, name: "Rempli" }); track.appendChild(fl); fl.x = 0; fl.y = 0;
    const kn = figma.createEllipse(); kn.name = "Poignée"; kn.resize(12, 12); kn.fills = [paint("bg/surface")]; kn.strokes = [paint("accent/primary")]; kn.strokeWeight = 2; d.appendChild(kn); kn.layoutPositioning = "ABSOLUTE";
    const acts = F("HORIZONTAL", { name: "Actions", gap: 10, justify: "MAX" }); add(d, acts, { fillW: true });
    action(acts, "Back", "Annuler"); action(acts, "OK", "Créer", "Primary");
    kn.x = 12 + 146 - 6; kn.y = sl.y + 16;
  }],
  ["16", "Tortue (Logo)", "Programmes tortue (avance, recule, tourne_gauche/droite, crayon, rond, disque, repete, efface) : dessin plein écran, commande rappelée en bas.", async (s) => {
    status(s, { "Titre": "Tortue", "Session": "· logo" });
    const fr = F(null, { name: "Toile", fill: "bg/surface", clip: true, w: 320, h: 198 }); s.appendChild(fr); fr.x = 0; fr.y = 20;
    let x = 0, y = 0, a = 0; const pts = [[0, 0]];
    for (let i = 0; i < 36; i++) { x += 110 * Math.cos(a); y -= 110 * Math.sin(a); pts.push([x, y]); a += 170 * Math.PI / 180; }
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const P = pts.map(([px, py]) => [160 + (px - cx) * 0.8, 92 + (py - cy) * 0.8]);
    vectorPath(fr, [P], "plot/curve-3", 1, "Étoile");
    const t = icon("turtle", "accent/primary", 14); fr.appendChild(t); t.x = P[P.length - 1][0] - 7; t.y = P[P.length - 1][1] - 7;
    const cmd = F("HORIZONTAL", { name: "Commande", gap: 6, px: 8, py: 4, radius: 8, fill: "bg/surface-2" }); fr.appendChild(cmd); cmd.x = 8; cmd.y = 170;
    cmd.appendChild(await T("›", "Code/Small", "text/tertiary"));
    cmd.appendChild(await T("repete(36, avance 110, tourne_gauche 170)", "Code/Small", "text/primary"));
    hintbar(s, [["EXE", "Revenir au shell"], ["Back", "Fermer"]]);
  }],
]);

// ------------------------------------------------------------ Menu KhiCAS
const MENU_TABS = ["Session", "Scripts", "Outils", "Système"];
async function menuScreen(s, tab, items, selIdx = 0) {
  status(s, { "Titre": "Menu", "Session": "· KhiCAS" });
  const b = body(s, { p: 8, gap: 2 });
  chipsRow(b, MENU_TABS, tab, { pb: 4 });
  items.forEach(([ic, l, d, chev], i) => menuItem(b, { i: i + 1, icon: ic, label: l, desc: d, sel: i === selIdx, chevron: !!chev }));
  hintbar(s, [["←→", "Onglet"], ["OK", "Ouvrir"], ["Back", "Fermer"]]);
}
flow("5 · Menu KhiCAS", "Le menu principal (touche Home) passe d'une longue liste à 4 onglets : Session, Scripts, Outils, Système. Chaque entrée garde son raccourci d'origine.", [
  ["17", "Menu · Session", "Enregistrer, enregistrer sous, charger, nouvelle session, exécuter la session, effacer l'historique (0).", async (s) => {
    await menuScreen(s, 0, [["save", "Enregistrer", "session.xw"], ["copy", "Enregistrer sous…", " "], ["folder", "Charger une session", " ", true], ["file-plus", "Nouvelle session", " "], ["play", "Exécuter la session", " "], ["trash", "Effacer l'historique", "0"]]);
  }],
  ["18", "Menu · Scripts", "Éditeur de script, ouvrir, exécuter, effacer le script (e^x), enregistrer les commandes en script (Record / Stop).", async (s) => {
    await menuScreen(s, 1, [["code", "Éditeur de script", " "], ["folder", "Ouvrir un script", " ", true], ["play", "Exécuter le script", " "], ["record", "Enregistrer en script", "Record"], ["trash", "Effacer le script", "eˣ"]]);
  }],
  ["19", "Menu · Outils", "Applications (⇧ Ans), éditeur de matrice (i), créer un paramètre (,), variables.", async (s) => {
    await menuScreen(s, 2, [["apps", "Applications", "⇧ Ans", true], ["matrix", "Éditer une matrice", "i"], ["slider", "Créer un paramètre", ","], ["variable", "Variables", "Var"]]);
  }],
  ["20", "Menu · Système", "Configuration & examen (ln), aide raccourcis (log), multi-firmware, à propos (xʸ), quitter (Home).", async (s) => {
    await menuScreen(s, 3, [["settings", "Configuration & examen", "ln", true], ["keyboard", "Aide · raccourcis", "log"], ["refresh", "Multi-firmware", " ", true], ["info", "À propos", "xʸ"], ["log-out", "Quitter KhiCAS", "Home"]], 0);
  }],
  ["21", "Multi-firmware", "Redémarrer sur un autre firmware (slots 1–3, bootloader), sauvegarde et restauration multi-firmware. Les slots invalides sont grisés.", async (s) => {
    status(s, { "Titre": "Multi-firmware", "Session": " " });
    const b = body(s, { p: 8, gap: 2 });
    const slots = [["Slot 1", "Upsilon 1.1.2", true], ["Slot 2", "Epsilon 15.5", true], ["Slot 3", "Invalide", false], ["Bootloader", "Mode récupération", true]];
    for (const [i, [n, d, ok]] of slots.entries()) {
      const r = F("HORIZONTAL", { name: n, gap: 8, px: 8, py: 6, radius: 6, fill: i === 0 ? "accent/primary-soft" : null }); add(b, r, { fillW: true });
      r.appendChild(key(String(i + 1), i === 0 ? "Primary" : "Plain"));
      r.appendChild(await T(n, "UI/Body Strong", ok ? (i === 0 ? "accent/primary-strong" : "text/primary") : "text/tertiary"));
      spacer(r);
      r.appendChild(await T(d, "UI/Caption", ok ? "text/secondary" : "status/danger"));
      r.appendChild(icon(ok ? "check" : "x", ok ? "status/success" : "status/danger", 12));
    }
    divider(b);
    menuItem(b, { i: 5, icon: "save", label: "Sauvegarde multi-firmware", desc: " " });
    menuItem(b, { i: 6, icon: "undo", label: "Restauration multi-firmware", desc: " " });
    hintbar(s, [["OK", "Redémarrer", "Primary"], ["Back", "Annuler"]]);
  }],
]);

// ------------------------------------------------------------ Configuration
flow("6 · Configuration & examen", "Tous les réglages d'origine en liste à interrupteurs, mémoire en jauges, mode examen explicite.", [
  ["22", "Configuration", "Interpréteur, syntaxe (Xcas / Python ^=** / ^=xor / JS), radians, √, x,n,t → t, chiffres, langue (5 langues). ← → change la valeur, OK bascule.", async (s) => {
    status(s, { "Titre": "Configuration", "Session": " " });
    const b = body(s, { p: 8, gap: 1 });
    configRow(b, { label: "Interpréteur", val: "Xcas", icon: "sigma" });
    configRow(b, { label: "Syntaxe", val: "Python ^=**", icon: "code" });
    configRow(b, { ctl: "Interrupteur on", label: "Angles en radians", icon: "crosshair" });
    configRow(b, { ctl: "Interrupteur on", label: "Simplifier les √", icon: "function" });
    configRow(b, { ctl: "Interrupteur off", label: "Touche x,n,t → t", icon: "variable" });
    configRow(b, { label: "Chiffres", val: "12", icon: "hash" });
    configRow(b, { label: "Langue", val: "Français", icon: "globe", sel: true });
    hintbar(s, [["←→", "Valeur"], ["OK", "Basculer"], ["→", "Mémoire"], ["Back", "Fermer"]]);
  }],
  ["23", "Mémoire & examen", "Mémoire (stockage, tas MicroPython / JS, pile) en jauges. Mode examen : sauvegarde des scripts puis verrouillage (eˣ). Quitter / relancer le mode examen.", async (s) => {
    status(s, { "Titre": "Configuration", "Session": "· mémoire" });
    const b = body(s, { px: 16, py: 10, gap: 8 });
    await sectionLabel(b, "Mémoire");
    for (const [l, v, w] of [["Stockage", "24 / 64 Ko", 108], ["Tas MicroPython / JS", "8 / 64 Ko", 36], ["Pile", "3 / 40 Ko", 22]]) {
      const g = I(KH.C.Gauge, { "Libellé": l, "Valeur": v }); b.appendChild(g); g.layoutSizingHorizontal = "FILL";
      const fl = g.findOne((n) => n.name === "Remplissage"); if (fl) fl.resize(w, 5);
    }
    await sectionLabel(b, "Examen");
    const ex = F("HORIZONTAL", { name: "Mode examen", gap: 8, p: 8, radius: 8, fill: "accent/shift-soft" }); add(b, ex, { fillW: true });
    ex.appendChild(icon("shield", "accent/shift", 16));
    const tx = F("VERTICAL", { name: "Texte", gap: 1, align: "MIN" }); add(ex, tx, { grow: true });
    tx.appendChild(await T("Mode examen", "UI/Body Strong", "text/primary"));
    addWrap(tx, await T("Sauvegarde les scripts, puis verrouille.", "UI/Caption", "text/secondary"));
    action(ex, "eˣ", "Lancer");
    hintbar(s, [["←", "Réglages"], ["Back", "Fermer"]]);
  }],
  ["24", "Confirmation examen", "Avant d'entrer en mode examen : dialogue explicite (ce qui est sauvegardé, comment sortir).", async (s) => {
    status(s, { "Titre": "Configuration", "Session": "· mémoire" });
    body(s, { p: 12 });
    scrim(s, 20, 220);
    await dialog(s, { icon: "shield", warn: true, title: "Lancer le mode examen ?", msg: "Vos scripts sont sauvegardés puis masqués. Pour sortir : Menu ▸ Système ▸ Quitter le mode examen.", primary: ["OK", "Lancer"], secondary: ["Back", "Annuler"] });
  }],
  ["25", "À propos", "Version, licence, crédits (B. Parisse, Giac / Xcas, portage Upsilon), mémoire libre.", async (s) => {
    status(s, { "Titre": "À propos", "Session": " " });
    const b = body(s, { p: 16, gap: 8, align: "CENTER", justify: "CENTER" });
    const logo = F("HORIZONTAL", { name: "Logo", fill: "accent/primary", radius: 12, w: 44, h: 44, justify: "CENTER" }); b.appendChild(logo);
    const chi = await T("χ", "Math/Italic", "text/on-accent", "χ"); chi.fontSize = 30; chi.lineHeight = { unit: "PIXELS", value: 32 }; logo.appendChild(chi);
    b.appendChild(await T("KhiCAS 1.6", "UI/Hero", "text/primary"));
    b.appendChild(await T("Giac / Xcas · MicroPython · QuickJS", "UI/Caption", "text/secondary"));
    const c = await T("© 2020 Bernard Parisse et al. · Licence GPL 2\nPortage Upsilon-External", "UI/Caption", "text/tertiary"); c.textAlignHorizontal = "CENTER"; b.appendChild(c);
    hintbar(s, [["Back", "Fermer"]]);
  }],
]);

// ------------------------------------------------------------ Scripts
flow("7 · Éditeur de script", "Éditeur de code lisible : numéros de ligne, coloration syntaxique, ligne courante, barre d'état. Menus de programmation en ⇧1…⇧6.", [
  ["26", "Éditeur", "Coloration (mots-clés, fonctions, nombres, chaînes, commentaires). ⇧1 test, ⇧2 boucle, ⇧3 annuler, ⇧4 divers, ⇧5 ±, ⇧6 tortue (+ linalg, numpy, arit, couleurs, dessin, matplotlib via ← →).", async (s) => {
    status(s, { "Titre": "Script", "Session": "· syracuse.py", "Interpréteur": "Python" });
    await editorBody(s, SYRACUSE, 8);
    softbar(s, EDITOR_KEYS);
  }],
  ["27", "Éditeur · menu", "Home dans l'éditeur : tester la syntaxe, enregistrer, enregistrer sous, insérer, effacer, chercher / remplacer, aller à la ligne, syntaxe, taille de police, à propos, quitter.", async (s) => {
    status(s, { "Titre": "Script", "Session": "· syracuse.py", "Interpréteur": "Python" });
    await editorBody(s, SYRACUSE, 8, { caret: false });
    softbar(s, EDITOR_KEYS);
    scrim(s, 20, 220);
    const p = F("VERTICAL", { name: "Menu éditeur", w: 200, h: 198, fill: "bg/surface", p: 6, gap: 1, align: "MIN", clip: true }); await effect(p, "Élévation/2");
    s.appendChild(p); p.x = 120; p.y = 20;
    const items = [["check", "Tester la syntaxe"], ["save", "Enregistrer"], ["copy", "Enregistrer sous…"], ["plus", "Insérer"], ["search", "Chercher / remplacer"], ["arrow-right", "Aller à la ligne"], ["code", "Syntaxe", true], ["type", "Taille de police"], ["trash", "Effacer"], ["info", "À propos"], ["log-out", "Quitter"]];
    items.forEach(([ic, l, ch], i) => menuItem(p, { i: i < 9 ? i + 1 : null, icon: ic, label: l, sel: i === 0, chevron: !!ch }));
  }],
  ["28", "Chercher / remplacer", "Panneau en bas de l'éditeur : deux champs, compteur d'occurrences, EXE remplace et passe à la suivante.", async (s) => {
    status(s, { "Titre": "Script", "Session": "· syracuse.py", "Interpréteur": "Python" });
    await editorBody(s, SYRACUSE, 6, { caret: false });
    const p = F("VERTICAL", { name: "Chercher", w: 320, fill: "bg/surface", p: 8, gap: 6, align: "MIN" }); await effect(p, "Élévation/2");
    p.cornerRadius = 0; p.topLeftRadius = 12; p.topRightRadius = 12;
    s.appendChild(p);
    const r1 = F("HORIZONTAL", { name: "Champs", gap: 6 }); add(p, r1, { fillW: true });
    field(r1, "Chercher", "n", { sel: true, fill: false }).layoutGrow = 1;
    field(r1, "Remplacer", "k", { fill: false }).layoutGrow = 1;
    const r2 = F("HORIZONTAL", { name: "Infos", gap: 10 }); add(p, r2, { fillW: true });
    r2.appendChild(await T("3 / 9 occurrences", "UI/Caption", "text/secondary"));
    spacer(r2);
    action(r2, "↑↓", "Précédent / suivant"); action(r2, "EXE", "Remplacer", "Primary");
    p.x = 0; p.y = 240 - p.height;
  }],
  ["29", "Syntaxe du script", "Choix de la syntaxe : QuickJS, MicroPython, Xcas français, Xcas compatible Python (^ = ** ou ^ = xor).", async (s) => {
    status(s, { "Titre": "Script", "Session": "· syracuse.py", "Interpréteur": "Python" });
    await editorBody(s, SYRACUSE, 8, { caret: false });
    softbar(s, EDITOR_KEYS);
    scrim(s, 20, 220);
    const d = F("VERTICAL", { name: "Syntaxe", w: 248, gap: 2, p: 10, radius: 12, fill: "bg/surface", stroke: "border/default", align: "MIN" }); await effect(d, "Élévation/2");
    s.appendChild(d);
    d.appendChild(await T("Syntaxe du script", "UI/Title", "text/primary"));
    const opts = ["QuickJS", "MicroPython", "Xcas (français)", "Xcas compat. Python ^ = **", "Xcas compat. Python ^ = xor"];
    opts.forEach((l, i) => { const m = menuItem(d, { i: i + 1, label: l, sel: i === 1, icon: i === 1 ? "check" : null }); });
    d.x = 36; d.y = Math.round(20 + (198 - d.height) / 2);
  }],
  ["30", "Erreur de syntaxe", "Tester la syntaxe (⇧1 ou menu) : l'erreur pointe la ligne et le message, OK y amène le curseur.", async (s) => {
    status(s, { "Titre": "Script", "Session": "· syracuse.py", "Interpréteur": "Python" });
    await editorBody(s, SYRACUSE, 4, { caret: false });
    softbar(s, EDITOR_KEYS);
    scrim(s, 20, 220);
    await dialog(s, { icon: "alert", danger: true, title: "Erreur de syntaxe · ligne 4", msg: "« : » attendu après while n != 1", primary: ["OK", "Aller à la ligne"], secondary: ["Back", "Fermer"] });
  }],
]);

// ------------------------------------------------------------ Applications
const PERIODIC = "H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og".split(" ");
function periodicPos(z) {
  if (z === 1) return [1, 1]; if (z === 2) return [1, 18];
  const blocks = [[3, 2], [11, 3]];
  for (const [s0, p] of blocks) { if (z >= s0 && z < s0 + 8) { const i = z - s0; return [p, i < 2 ? i + 1 : i + 11]; } }
  if (z >= 19 && z <= 36) return [4, z - 18]; if (z >= 37 && z <= 54) return [5, z - 36];
  for (const [s0, p] of [[55, 6], [87, 7]]) {
    if (z === s0 || z === s0 + 1) return [p, z - s0 + 1];
    if (z === s0 + 2) return [p, 3];
    if (z > s0 + 2 && z < s0 + 17) return null; // bloc f
    if (z >= s0 + 17 && z <= s0 + 31) return [p, z - s0 - 13];
  }
  return null;
}
function periodicFamily(z, g) {
  if (z === 1) return "nonmetal";
  if ([5, 14, 32, 33, 51, 52].includes(z)) return "metalloid";
  if ([6, 7, 8, 15, 16, 34].includes(z)) return "nonmetal";
  if (g === 1) return "alkali"; if (g === 2) return "alkaline"; if (g === 17) return "halogen"; if (g === 18) return "noble";
  if (z === 57 || z === 89) return "lanthanide";
  if (g >= 3 && g <= 12) return "transition";
  return "post";
}
flow("8 · Applications", "⇧ Ans ouvre un lanceur en grille. Chaque application intégrée a son écran repensé.", [
  ["31", "Applications", "Tableur, table périodique, prêt, épargne (TVM), table des caractères, exemples (Syracuse, Mastermind, Mandelbrot), personnaliser la flash, applications utilisateur. 1–9 lance directement.", async (s) => {
    status(s, { "Titre": "Applications", "Session": " " });
    const b = body(s, { dir: "HORIZONTAL", p: 8, gap: 6, wrap: true, wrapGap: 6 });
    const apps = [["table", "Tableur"], ["atom", "Table périodique"], ["coins", "Prêt"], ["trending-up", "Épargne"], ["type", "Caractères"], ["sparkles", "Syracuse"], ["grid", "Mastermind"], ["layers", "Mandelbrot"], ["hard-drive", "Flash"], ["apps", "Mes applis"]];
    for (const [i, [ic, l]] of apps.entries()) {
      const sel = i === 0;
      const t = F("VERTICAL", { name: l, w: 71, h: 56, gap: 4, radius: 10, fill: sel ? "accent/primary-soft" : "bg/surface", stroke: sel ? "accent/primary" : "border/default", sw: sel ? 1.5 : 1, justify: "CENTER" });
      b.appendChild(t);
      t.appendChild(icon(ic, sel ? "accent/primary" : "text/secondary", 18));
      const lt = await T(l, "UI/Caption", sel ? "accent/primary-strong" : "text/primary"); lt.textAlignHorizontal = "CENTER"; t.appendChild(lt);
      if (i < 9) { const k = key(String(i + 1), sel ? "Primary" : "Plain"); t.appendChild(k); k.layoutPositioning = "ABSOLUTE"; k.x = 4; k.y = 4; }
    }
    hintbar(s, [["OK", "Ouvrir", "Primary"], ["1…9", "Accès direct"], ["Back", "Fermer"]]);
  }],
  ["32", "Tableur", "Feuille de calcul : barre de formule, en-têtes figés, cellule active. ⇧1 éditer, ⇧2 remplir, ⇧3 trier, ⇧4 tracer, ⇧5 configuration, ⇧6 menu tableur.", async (s) => {
    status(s, { "Titre": "Tableur", "Session": "· feuille.tab" });
    const b = body(s, { gap: 0 });
    const fb = F("HORIZONTAL", { name: "Barre de formule", gap: 8, px: 8, py: 5, fill: "bg/surface" }); add(b, fb, { fillW: true });
    const ref_ = F("HORIZONTAL", { name: "Réf", px: 5, py: 1, radius: 4, fill: "accent/primary" }); fb.appendChild(ref_); ref_.appendChild(await T("B3", "UI/Micro", "text/on-accent"));
    fb.appendChild(await T("= A3^2", "Code/Input", "text/primary"));
    spacer(fb); fb.appendChild(await T("9", "Code/Input", "text/secondary"));
    const grid = F("VERTICAL", { name: "Grille", fill: "bg/surface" }); add(b, grid, { fillW: true });
    grid.strokes = [paint("border/default")]; grid.strokeWeight = 1; grid.strokeAlign = "INSIDE";
    const cols = ["", "A", "B", "C", "D"]; const widths = [22, 74, 74, 74, 76];
    const data = (r, c) => c === 1 ? String(r) : c === 2 ? String(r * r) : c === 3 ? String(r * r * r) : (r === 1 ? "= SUM(B1:B7)" : r === 2 ? "140" : "");
    for (let r = 0; r <= 7; r++) {
      const row = F("HORIZONTAL", { name: r ? "Ligne " + r : "En-têtes" }); add(grid, row, { fillW: true });
      for (let c = 0; c < 5; c++) {
        const head = r === 0 || c === 0; const sel = r === 3 && c === 2;
        const cell = F("HORIZONTAL", { name: cols[c] + r, w: widths[c], h: 20, px: 5, fill: sel ? "accent/primary-soft" : head ? "bg/surface-2" : null, justify: head ? "CENTER" : "MAX", stroke: sel ? "accent/primary" : null, sw: 1.5 });
        if (!sel) { cell.strokes = [paint("border/default")]; cell.strokeWeight = 1; cell.strokeAlign = "INSIDE"; cell.strokeTopWeight = 0; cell.strokeLeftWeight = 0; }
        row.appendChild(cell);
        const txt = r === 0 ? cols[c] : c === 0 ? String(r) : data(r, c);
        if (txt) cell.appendChild(await T(txt, head ? "UI/Micro" : "Code/Small", head ? (sel ? "accent/primary" : "text/tertiary") : "text/primary"));
      }
    }
    softbar(s, SHEET_KEYS);
  }],
  ["33", "Table périodique", "Grille colorée par famille, ← ↑ ↓ → déplace la sélection, fiche de l'élément (numéro, masse, famille, configuration). OK insère le symbole ou la masse.", async (s) => {
    status(s, { "Titre": "Table périodique", "Session": " " });
    const b = F(null, { name: "Contenu", w: 320, h: 198, clip: true }); s.appendChild(b); b.x = 0; b.y = 20;
    for (let z = 1; z <= 118; z++) {
      const pos = periodicPos(z); if (!pos) continue; const [p, g] = pos;
      const fam = periodicFamily(z, g); const sel = z === 26;
      const c = F("VERTICAL", { name: PERIODIC[z - 1], w: 16, h: 16, radius: 2, fill: "periodic/" + fam, justify: "CENTER", stroke: sel ? "accent/primary" : null, sw: 1.5 });
      b.appendChild(c); c.x = 7 + (g - 1) * 17; c.y = 6 + (p - 1) * 17;
      const t = await T(PERIODIC[z - 1], "UI/Micro", "text/primary"); t.fontSize = 7; t.lineHeight = { unit: "PIXELS", value: 8 }; c.appendChild(t);
    }
    const card = F("HORIZONTAL", { name: "Fiche Fe", gap: 10, p: 8, radius: 10, fill: "bg/surface", stroke: "border/default", w: 306 }); b.appendChild(card); card.x = 7; card.y = 132;
    const big = F("VERTICAL", { name: "Symbole", w: 46, h: 46, radius: 8, fill: "periodic/transition", justify: "CENTER" }); card.appendChild(big);
    big.appendChild(await T("26", "UI/Micro", "text/secondary")); const sym = await T("Fe", "UI/Hero", "text/primary"); big.appendChild(sym);
    const info = F("VERTICAL", { name: "Infos", gap: 2, align: "MIN" }); add(card, info, { grow: true });
    info.appendChild(await T("Fer", "UI/Title", "text/primary"));
    info.appendChild(await T("Métal de transition · période 4", "UI/Caption", "text/secondary"));
    info.appendChild(await T("M = 55,845 g/mol · [Ar] 3d⁶ 4s²", "Code/Small", "text/primary"));
    hintbar(s, [["OK", "Insérer", "Primary"], ["↑↓←→", "Élément"], ["Back", "Fermer"]]);
  }],
  ["34", "Finance · prêt", "Prêt (mensualité, coût total) et Épargne (TVM : valeur future, taux, durée). Laisser un champ vide = c'est lui qu'on calcule.", async (s) => {
    status(s, { "Titre": "Finance", "Session": "· prêt" });
    const b = body(s, { p: 10, gap: 6 });
    chipsRow(b, ["Prêt", "Épargne"], 0);
    const r1 = F("HORIZONTAL", { name: "Ligne 1", gap: 6 }); add(b, r1, { fillW: true });
    field(r1, "Capital", "200 000", { unit: "€", fill: false }).layoutGrow = 1; field(r1, "Taux", "3,2", { unit: "%", fill: false, sel: true }).layoutGrow = 1;
    const r2 = F("HORIZONTAL", { name: "Ligne 2", gap: 6 }); add(b, r2, { fillW: true });
    field(r2, "Durée", "20", { unit: "ans", fill: false }).layoutGrow = 1; field(r2, "Périodes / an", "12", { fill: false }).layoutGrow = 1;
    const res = F("VERTICAL", { name: "Résultat", gap: 2, p: 10, radius: 10, fill: "accent/primary-soft", align: "MIN" }); add(b, res, { fillW: true });
    res.appendChild(await T("Mensualité", "UI/Caption", "accent/primary"));
    res.appendChild(await T("1 129,36 €", "UI/Hero", "accent/primary-strong"));
    res.appendChild(await T("Coût total du crédit : 71 046 €", "UI/Caption", "text/secondary"));
    hintbar(s, [["EXE", "Calculer", "Primary"], ["↑↓", "Champ"], ["←→", "Prêt / Épargne"], ["Back", "Fermer"]]);
  }],
  ["35", "Table des caractères", "Tous les caractères insérables, ← ↑ ↓ → pour choisir, code décimal / hexadécimal affiché, OK insère.", async (s) => {
    status(s, { "Titre": "Caractères", "Session": " " });
    const b = F(null, { name: "Contenu", w: 320, h: 198, clip: true }); s.appendChild(b); b.x = 0; b.y = 20;
    for (let c = 32; c < 128; c++) {
      const i = c - 32, row = Math.floor(i / 16), col = i % 16, sel = c === 65;
      const cell = F("HORIZONTAL", { name: "U+" + c.toString(16), w: 18, h: 20, radius: 4, justify: "CENTER", fill: sel ? "accent/primary" : null });
      b.appendChild(cell); cell.x = 16 + col * 18; cell.y = 8 + row * 22;
      cell.appendChild(await T(c === 127 ? "⌫" : String.fromCharCode(c), "Code/Input", sel ? "text/on-accent" : "text/primary"));
    }
    const info = F("HORIZONTAL", { name: "Infos", gap: 10, px: 10, py: 6, radius: 8, fill: "bg/surface", stroke: "border/default", w: 288 }); b.appendChild(info); info.x = 16; info.y = 148;
    info.appendChild(await T("A", "Code/Strong", "accent/primary"));
    info.appendChild(await T("Lettre majuscule A", "UI/Caption", "text/secondary"));
    spacer(info); info.appendChild(await T("65 · 0x41", "Code/Small", "text/primary"));
    hintbar(s, [["OK", "Insérer", "Primary"], ["↑↓←→", "Choisir"], ["Back", "Fermer"]]);
  }],
  ["36", "Éditeur de matrice", "Menu ▸ Éditer une matrice (i) : grille avec crochets, dimensions ajustables, cellule active éditable. EXE renvoie la matrice dans le shell.", async (s) => {
    status(s, { "Titre": "Matrice", "Session": "· M" });
    const b = body(s, { p: 12, gap: 10, align: "CENTER" });
    const top = F("HORIZONTAL", { name: "Dimensions", gap: 8 }); add(b, top, { fillW: true });
    top.appendChild(await T("M", "Math/Italic", "text/primary")); top.appendChild(await T("=", "Math/Display", "text/secondary"));
    spacer(top); top.appendChild(await T("3 × 3", "Code/Strong", "text/primary")); action(top, "+ −", "Taille");
    const m = F("HORIZONTAL", { name: "Matrice", gap: 4 }); b.appendChild(m);
    const br = (side) => { const r = F(null, { name: "Crochet " + side, w: 6, h: 96 }); r.strokes = [paint("text/primary")]; r.strokeWeight = 1.5; r.strokeAlign = "INSIDE"; if (side === "g") r.strokeRightWeight = 0; else r.strokeLeftWeight = 0; return r; };
    m.appendChild(br("g"));
    const g = F("VERTICAL", { name: "Cellules", gap: 2 }); m.appendChild(g);
    const vals = [["1", "2", "0"], ["0", "−1", "3"], ["4", "0", "x"]];
    for (let r = 0; r < 3; r++) {
      const row = F("HORIZONTAL", { name: "Ligne " + (r + 1), gap: 2 }); g.appendChild(row);
      for (let c = 0; c < 3; c++) {
        const sel = r === 1 && c === 1;
        const cell = F("HORIZONTAL", { name: `m${r + 1}${c + 1}`, w: 52, h: 30, radius: 6, justify: "CENTER", fill: sel ? "accent/primary-soft" : "bg/surface", stroke: sel ? "accent/primary" : "border/default", sw: sel ? 1.5 : 1 });
        row.appendChild(cell); cell.appendChild(await T(vals[r][c], vals[r][c] === "x" ? "Math/Small Italic" : "Math/Small", "text/primary"));
      }
    }
    m.appendChild(br("d"));
    hintbar(s, [["OK", "Modifier"], ["EXE", "Valider", "Primary"], ["Back", "Annuler"]]);
  }],
  ["37", "Fichiers flash", "Applications ▸ Personnaliser la flash : fichiers présents, taille, place libre ; ⇧ modifie, ⌫ supprime.", async (s) => {
    status(s, { "Titre": "Flash", "Session": "· 3 fichiers" });
    const b = body(s, { p: 8, gap: 4 });
    const g = I(KH.C.Gauge, { "Libellé": "Espace flash", "Valeur": "1,2 / 6 Mo" }); b.appendChild(g); g.layoutSizingHorizontal = "FILL";
    const fl = g.findOne((n) => n.name === "Remplissage"); if (fl) fl.resize(58, 5);
    divider(b);
    [["code", "syracuse.py", "1,2 Ko"], ["save", "session.xw", "8,4 Ko"], ["table", "feuille.tab", "2,1 Ko"]].forEach(([ic, n, sz], i) => menuItem(b, { i: i + 1, icon: ic, label: n, desc: sz, sel: i === 0 }));
    hintbar(s, [["OK", "Ouvrir"], ["⇧", "Modifier"], ["⌫", "Supprimer"], ["Back", "Fermer"]]);
  }],
]);
// =====================================================================
//  Planches de documentation + orchestration
// =====================================================================
const PAGE_NAMES = ["Design system", "Écrans", "Thème sombre"];
// Nœuds laissés par les essais précédents (via MCP) à supprimer aussi
const LEGACY = ["Composants / Icônes", "Key", "Composants / Base", "StatusBar", "SoftKey", "État=Default", "État=Shift"];

function docBoard(name, o = {}) {
  const f = F("VERTICAL", Object.assign({ name, gap: 24, p: 40, radius: 24, fill: "bg/surface", align: "MIN", w: o.w || 1400 }, o));
  return markRoot(f);
}

async function buildCover(page, y) {
  const f = docBoard("KhiCAS · Couverture", { fill: "text/primary", gap: 28, p: 64 });
  page.appendChild(f); f.x = 0; f.y = y;
  const brand = F("HORIZONTAL", { name: "Marque", gap: 20 }); f.appendChild(brand);
  const logo = F("HORIZONTAL", { name: "Logo", fill: "accent/primary", radius: 22, w: 88, h: 88, justify: "CENTER" }); brand.appendChild(logo);
  const chi = await T("χ", "Math/Italic", "text/on-accent"); chi.fontSize = 64; chi.lineHeight = { unit: "PIXELS", value: 70 }; logo.appendChild(chi);
  const tt = F("VERTICAL", { name: "Titres", gap: 4, align: "MIN" }); brand.appendChild(tt);
  tt.appendChild(await T("KhiCAS — Redesign", "Doc/Display", "bg/surface"));
  tt.appendChild(await T("Interface repensée pour le calcul formel sur NumWorks (Upsilon-External) · écran 320 × 240 · 100 % clavier", "Doc/Body", "border/strong"));
  const pr = F("HORIZONTAL", { name: "Principes", gap: 16, align: "MIN" }); add(f, pr, { fillW: true });
  const P = [
    ["Lisible d'abord", "Typo dédiée par rôle : Geist (interface), JetBrains Mono (saisie), STIX Two (maths). Contrastes AA, hiérarchie claire."],
    ["Le clavier est l'interface", "Chaque action affiche sa touche (keycaps). ⇧ en ambre et α en vert, comme sur la calculatrice. Rien n'est caché."],
    ["Mêmes fonctions, moins de bruit", "Toutes les fonctionnalités de KhiCAS 1.6 sont conservées. Les menus sont regroupés en panneaux et onglets."],
    ["Un système, deux thèmes", "Tokens de couleur nommés (bg, text, accent, syntax, plot), déclinés en clair et en sombre. Composants réutilisables."],
  ];
  for (const [h, d] of P) {
    const c = F("VERTICAL", { name: h, gap: 8, p: 20, radius: 16, fill: "text/secondary", op: 0.25, align: "MIN" }); add(pr, c, { grow: true });
    c.appendChild(await T(h, "Doc/H2", "bg/surface"));
    addWrap(c, await T(d, "Doc/Body", "border/strong"));
  }
  return f;
}

async function buildColorBoard(page, y) {
  const f = docBoard("KhiCAS · Couleurs"); page.appendChild(f); f.x = 0; f.y = y;
  f.appendChild(await T("Couleurs", "Doc/H1", "text/primary"));
  addWrap(f, await T("Deux collections de variables aux noms identiques : « KhiCAS / Couleurs (clair) » et « (sombre) ». Les écrans utilisent toujours le token, jamais la valeur.", "Doc/Body", "text/secondary"));
  const groups = {};
  for (const n of Object.keys(COLORS)) { const g = n.split("/")[0]; if (!groups[g]) groups[g] = []; groups[g].push(n); }
  for (const [g, names] of Object.entries(groups)) {
    const row = F("VERTICAL", { name: g, gap: 10, align: "MIN" }); add(f, row, { fillW: true });
    row.appendChild(await T(g, "Doc/Label", "text/tertiary"));
    const sw = F("HORIZONTAL", { name: "Pastilles " + g, gap: 12, wrap: true, wrapGap: 12, w: 1320, align: "MIN" }); row.appendChild(sw);
    for (const n of names) {
      const c = F("VERTICAL", { name: n, gap: 6, align: "MIN", w: 150 }); sw.appendChild(c);
      const pair = F("HORIZONTAL", { name: "Clair / sombre", radius: 10, clip: true, w: 150, h: 48, stroke: "border/default" }); c.appendChild(pair);
      const l = rect(75, 48, n, { name: "Clair" }); pair.appendChild(l);
      const d = rect(75, 48, null, { name: "Sombre" }); d.fills = [figma.variables.setBoundVariableForPaint({ type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", KH.VD[n])]; pair.appendChild(d);
      c.appendChild(await T(n, "Doc/Mono", "text/primary"));
      c.appendChild(await T(COLORS[n][0] + " · " + COLORS[n][1], "Doc/Mono", "text/tertiary"));
    }
  }
  return f;
}

async function buildTypeBoard(page, y) {
  const f = docBoard("KhiCAS · Typographie"); page.appendChild(f); f.x = 0; f.y = y;
  f.appendChild(await T("Typographie", "Doc/H1", "text/primary"));
  addWrap(f, await T(`Interface : ${KH.font.ui.family} · Saisie : ${KH.font.mono.family} · Maths : ${KH.font.math.family}. Tailles pensées pour un écran de 320 × 240 px.`, "Doc/Body", "text/secondary"));
  const samples = {
    "UI/Hero": "KhiCAS 1.6", "UI/Title": "Choisissez l'interpréteur", "UI/Body": "Enregistrer la session", "UI/Body Strong": "Mode examen", "UI/Label": "Calcul · session.xw", "UI/Caption": "Modifiable dans Configuration", "UI/Micro": "RAD · XCAS · 22:29",
    "Code/Input": "integrate(x^2, x)", "Code/Small": "integrate(expr, x, [a, b])", "Code/Strong": "integrate",
    "Math/Display": "2√2 = (x−1)(x+1)", "Math/Italic": "f(x) = x² + 1", "Math/Small": "n(n+1)(2n+1)", "Math/Small Italic": "x³",
  };
  for (const [n, txt] of Object.entries(samples)) {
    const r = F("HORIZONTAL", { name: n, gap: 24 }); add(f, r, { fillW: true });
    const lab = F("VERTICAL", { name: "Nom", w: 220, gap: 2, align: "MIN" }); r.appendChild(lab);
    lab.appendChild(await T(n, "Doc/Label", "text/primary"));
    const st = KH.TS[n]; lab.appendChild(await T(`${st.fontName.family} ${st.fontName.style} · ${st.fontSize}/${st.lineHeight.value}`, "Doc/Mono", "text/tertiary"));
    const smp = await T(txt, n, "text/primary"); r.appendChild(smp);
    const big = await T(txt, n, "text/primary", "Aperçu ×3"); big.fontSize = st.fontSize * 3; big.lineHeight = { unit: "PIXELS", value: st.lineHeight.value * 3 }; r.appendChild(big);
  }
  return f;
}

async function buildDesignSystemPage(page) {
  let y = 0;
  const cover = await buildCover(page, y); y += cover.height + 80;
  const colors = await buildColorBoard(page, y); y += colors.height + 80;
  const type = await buildTypeBoard(page, y); y += type.height + 80;
  const ib = docBoard("KhiCAS · Icônes"); page.appendChild(ib); ib.x = 0; ib.y = y;
  ib.appendChild(await T("Icônes", "Doc/H1", "text/primary"));
  addWrap(ib, await T("Composants « Icon/… », 16 px, trait 1,5 (style Lucide). La couleur se surcharge sur l'instance.", "Doc/Body", "text/secondary"));
  const grid = F("HORIZONTAL", { name: "Grille d'icônes", gap: 20, wrap: true, wrapGap: 20, w: 1320 }); ib.appendChild(grid);
  await buildIcons(grid);
  y += ib.height + 80;
  const cb = docBoard("KhiCAS · Composants"); page.appendChild(cb); cb.x = 0; cb.y = y;
  cb.appendChild(await T("Composants", "Doc/H1", "text/primary"));
  addWrap(cb, await T("Tous les écrans sont construits à partir de ces composants (instances + propriétés). Modifier un composant met à jour tous les écrans.", "Doc/Body", "text/secondary"));
  const wrap = F("HORIZONTAL", { name: "Composants", gap: 32, wrap: true, wrapGap: 32, w: 1320, align: "MIN" }); cb.appendChild(wrap);
  await buildComponents(wrap);
  return page;
}

async function buildScreensPage(page) {
  const root = markRoot(F("VERTICAL", { name: "KhiCAS · Écrans", gap: 96, p: 80, fill: "bg/surface-2", align: "MIN" }));
  page.appendChild(root); root.x = 0; root.y = 0;
  const head = F("VERTICAL", { name: "En-tête", gap: 8, align: "MIN" }); root.appendChild(head);
  head.appendChild(await T("Écrans", "Doc/Display", "text/primary"));
  head.appendChild(await T("37 écrans · 8 parcours · chaque fonctionnalité de KhiCAS 1.6 a sa place (voir fonctionnalites-khicas.md).", "Doc/Body", "text/secondary"));
  const built = {};
  for (const fl of FLOWS) {
    const sec = F("VERTICAL", { name: fl.title, gap: 20, align: "MIN" }); root.appendChild(sec);
    sec.appendChild(await T(fl.title, "Doc/H1", "text/primary"));
    const d = await T(fl.desc, "Doc/Body", "text/secondary"); sec.appendChild(d); d.resize(900, d.height); d.textAutoResize = "HEIGHT";
    const row = F("HORIZONTAL", { name: "Écrans " + fl.title, gap: 48, align: "MIN" }); sec.appendChild(row);
    for (const [id, title, note, fn] of fl.screens) {
      const card = F("VERTICAL", { name: id + " · " + title, gap: 12, align: "MIN", w: 320 }); row.appendChild(card);
      const lab = F("HORIZONTAL", { name: "Titre", gap: 8 }); card.appendChild(lab);
      lab.appendChild(key(id, "Dark")); lab.appendChild(await T(title, "Doc/H2", "text/primary"));
      const s = screenFrame(id + " · " + title); card.appendChild(s);
      s.strokes = [paint("border/default")]; s.strokeWeight = 1; s.strokeAlign = "OUTSIDE";
      await effect(s, "Élévation/Doc");
      try { await fn(s); }
      catch (e) { const t = await T("⚠ " + e.message, "UI/Caption", "status/danger", "Erreur"); s.appendChild(t); t.x = 8; t.y = 100; KH.errors.push(id + " : " + e.message); }
      addWrap(card, await T(note, "Doc/Body", "text/secondary"));
      built[id] = s;
    }
  }
  return built;
}

// Clone des écrans + re-liaison de chaque couleur vers la collection sombre
async function rebindDark(node, map) {
  const remap = (paints) => paints.map((p) => {
    const id = p.boundVariables && p.boundVariables.color && p.boundVariables.color.id;
    return id && map[id] ? figma.variables.setBoundVariableForPaint(p, "color", map[id]) : p;
  });
  const nodes = [node, ...node.findAll(() => true)];
  for (const n of nodes) {
    if (n.type === "TEXT" && n.fills === figma.mixed) {
      for (const seg of n.getStyledTextSegments(["fills"])) n.setRangeFills(seg.start, seg.end, remap(seg.fills));
    } else if ("fills" in n && Array.isArray(n.fills) && n.fills.length) n.fills = remap(n.fills);
    if ("strokes" in n && Array.isArray(n.strokes) && n.strokes.length) n.strokes = remap(n.strokes);
  }
}

async function buildDarkPage(page, built) {
  const map = {}; for (const n of Object.keys(COLORS)) map[KH.V[n].id] = KH.VD[n];
  const root = markRoot(F("VERTICAL", { name: "KhiCAS · Thème sombre", gap: 32, p: 80, fill: "bg/app", align: "MIN" }));
  page.appendChild(root); root.x = 0; root.y = 0;
  root.appendChild(await T("Thème sombre", "Doc/Display", "text/primary"));
  root.appendChild(await T("Mêmes écrans, couleurs liées à « KhiCAS / Couleurs (sombre) ». Idéal en salle sombre et pour l'autonomie.", "Doc/Body", "text/secondary"));
  const row = F("HORIZONTAL", { name: "Écrans sombres", gap: 48, wrap: true, wrapGap: 48, w: 1600, align: "MIN" }); root.appendChild(row);
  for (const id of ["03", "05", "06", "09", "12", "22", "26", "31"]) {
    if (!built[id]) continue;
    const c = built[id].clone(); row.appendChild(c); c.name = built[id].name + " · sombre";
  }
  await rebindDark(root, map);
}

async function buildKhiCAS() {
  KH.errors = [];
  await resolveFonts();
  // Pages (le plan Starter en autorise 3)
  while (figma.root.children.length < 3) figma.createPage();
  const pages = figma.root.children.slice(0, 3);
  pages.forEach((p, i) => { p.name = PAGE_NAMES[i]; });
  // Nettoyage des générations précédentes
  for (const p of pages) {
    await figma.setCurrentPageAsync(p);
    for (const n of [...p.children]) if (n.getPluginData("khicas") === "1" || LEGACY.includes(n.name) || n.name.startsWith("KhiCAS · ")) n.remove();
  }
  await buildTokens();
  await figma.setCurrentPageAsync(pages[0]); await buildDesignSystemPage(pages[0]);
  await figma.setCurrentPageAsync(pages[1]); const built = await buildScreensPage(pages[1]);
  await figma.setCurrentPageAsync(pages[2]); await buildDarkPage(pages[2], built);
  await figma.setCurrentPageAsync(pages[1]);
  figma.viewport.scrollAndZoomIntoView(pages[1].children);
  return KH.errors;
}

// Pas de « await » au niveau racine : l'exécuteur de Scripter ne l'accepte pas.
const __out = (m) => { if (typeof print === "function") print(m); else console.log(m); };
buildKhiCAS()
  .then((errs) => __out(errs.length ? "KhiCAS : terminé, écrans en erreur — " + errs.join(" | ") : "KhiCAS : design généré ✓"))
  .catch((e) => __out("KhiCAS — erreur : " + (e && e.message)));
