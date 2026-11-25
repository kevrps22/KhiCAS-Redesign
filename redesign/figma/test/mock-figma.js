// Maquette minimale et stricte de l'API Plugin Figma, pour exécuter le générateur hors de Figma.
// Elle reproduit les règles qui font échouer un script en vrai (auto-layout, polices, propriétés
// de composants, instances exposées, mode dynamic-page, limites du plan Starter).
"use strict";
let ID = 1;
const nid = () => `${ID++}:${ID}`;
const MIXED = Symbol("mixed");
const AVAILABLE_FONTS = {
  Inter: ["Regular", "Italic", "Medium", "Semi Bold", "Bold"],
  Geist: ["Regular", "Medium", "SemiBold", "Bold"],
  "JetBrains Mono": ["Regular", "Medium", "Bold"],
  "STIX Two Text": ["Regular", "Italic", "Bold"],
};
const loaded = new Set();
const fkey = (f) => `${f.family}|${f.style}`;
const CONTAINERS = new Set(["PAGE", "FRAME", "COMPONENT", "COMPONENT_SET", "INSTANCE", "GROUP"]);
const fail = (m) => { throw new Error(m); };

class Node {
  constructor(type) {
    this.id = nid(); this.type = type; this._name = type; this.parent = null; this.visible = true;
    this.x = 0; this.y = 0; this.width = 100; this.height = 100;
    this._fills = type === "FRAME" || type === "COMPONENT" ? [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }] : [];
    this.strokes = []; this.effects = []; this._pd = {}; this.opacity = 1;
    if (CONTAINERS.has(type)) this.children = [];
    this.layoutMode = "NONE"; this._refs = null; this._exposed = false;
  }
  get name() { return this._name; } set name(v) { if (typeof v !== "string") fail("name doit être une chaîne"); this._name = v; }
  get fills() { return this._fills; }
  set fills(v) { if (!Array.isArray(v)) fail("fills doit être un tableau"); for (const p of v) checkPaint(p); this._fills = v; }
  get removed() { return !this.parent; }
  insideInstance() { let p = this.parent; while (p) { if (p.type === "INSTANCE") return true; p = p.parent; } return false; }
  appendChild(c) {
    if (!this.children) fail(`${this.type} ne peut pas avoir d'enfants`);
    if (this.type === "INSTANCE" || this.insideInstance()) fail("Cannot move node. New parent is an instance or is inside of an instance");
    if (c.parent) c.parent.children.splice(c.parent.children.indexOf(c), 1);
    this.children.push(c); c.parent = this;
    if (c._absolute) c._absolute = false;
  }
  insertChild(i, c) { this.appendChild(c); this.children.splice(this.children.indexOf(c), 1); this.children.splice(i, 0, c); }
  remove() { if (this.parent) { this.parent.children.splice(this.parent.children.indexOf(this), 1); this.parent = null; } }
  resize(w, h) {
    if (!(w >= 0.01 && h >= 0.01)) fail(`resize invalide ${w}×${h} sur ${this.name}`);
    this.width = w; this.height = h;
    if (this.layoutMode !== "NONE") { this._pa = "FIXED"; this._ca = "FIXED"; }
  }
  get primaryAxisSizingMode() { return this._pa || "AUTO"; } set primaryAxisSizingMode(v) { if (!["FIXED", "AUTO"].includes(v)) fail("primaryAxisSizingMode: " + v); this._pa = v; }
  get counterAxisSizingMode() { return this._ca || "AUTO"; } set counterAxisSizingMode(v) { if (!["FIXED", "AUTO"].includes(v)) fail("counterAxisSizingMode: " + v); this._ca = v; }
  set layoutWrap(v) { if (v === "WRAP" && this.layoutMode !== "HORIZONTAL") fail("layoutWrap WRAP exige layoutMode HORIZONTAL (" + this.name + ")"); this._wrap = v; }
  get layoutWrap() { return this._wrap || "NO_WRAP"; }
  parentAL() { return this.parent && this.parent.layoutMode && this.parent.layoutMode !== "NONE"; }
  set layoutSizingHorizontal(v) { this._sizing("H", v); } get layoutSizingHorizontal() { return this._lsh || "FIXED"; }
  set layoutSizingVertical(v) { this._sizing("V", v); } get layoutSizingVertical() { return this._lsv || "FIXED"; }
  _sizing(axis, v) {
    if (v === "FILL" && (!this.parentAL() || this._absolute)) fail(`in set_layoutSizing${axis === "H" ? "Horizontal" : "Vertical"}: FILL can only be set on children of auto-layout frames (${this.name})`);
    if (v === "HUG" && !(this.layoutMode !== "NONE" || (this.type === "TEXT" && this.parentAL()))) fail(`HUG invalide sur ${this.name}`);
    if (axis === "H") this._lsh = v; else this._lsv = v;
  }
  set layoutGrow(v) { if (!this.parentAL()) fail(`layoutGrow exige un parent auto-layout (${this.name})`); this._grow = v; } get layoutGrow() { return this._grow || 0; }
  set layoutPositioning(v) { if (v === "ABSOLUTE" && !this.parentAL()) fail(`ABSOLUTE exige un parent auto-layout (${this.name})`); this._absolute = v === "ABSOLUTE"; }
  set isExposedInstance(v) {
    if (this.type !== "INSTANCE") fail("isExposedInstance sur non-instance");
    let p = this.parent, ok = false; while (p) { if (p.type === "COMPONENT" || p.type === "COMPONENT_SET") { ok = true; break; } p = p.parent; }
    if (!ok) fail("in set_isExposedInstance: Instance must be contained within a component or component set to be exposed.");
    this._exposed = v;
  }
  get isExposedInstance() { return this._exposed; }
  set componentPropertyReferences(refs) {
    const owner = propOwner(this);
    if (!owner) fail(`componentPropertyReferences : ${this.name} n'est pas dans un composant`);
    for (const [k, key] of Object.entries(refs)) {
      const d = owner._defs[key]; if (!d) fail(`Référence à une propriété inexistante ${key} (${this.name})`);
      if (k === "characters" && (this.type !== "TEXT" || d.type !== "TEXT")) fail(`characters → ${key} invalide sur ${this.type}`);
      if (k === "visible" && d.type !== "BOOLEAN") fail(`visible → ${key} n'est pas BOOLEAN`);
      if (k === "mainComponent" && (this.type !== "INSTANCE" || d.type !== "INSTANCE_SWAP")) fail(`mainComponent → ${key} invalide`);
    }
    this._refs = refs;
  }
  get componentPropertyReferences() { return this._refs; }
  setPluginData(k, v) { this._pd[k] = v; } getPluginData(k) { return this._pd[k] || ""; }
  async setEffectStyleIdAsync(id) { if (!STORE.effectStyles.find((s) => s.id === id)) fail("effect style inconnu"); this._effectStyle = id; }
  set effectStyleId(v) { fail("in set_effectStyleId: Cannot call with documentAccess: dynamic-page. Use node.setEffectStyleIdAsync instead."); }
  set textStyleId(v) { fail("in set_textStyleId: Cannot call with documentAccess: dynamic-page. Use node.setTextStyleIdAsync instead."); }
  findAll(fn = () => true) { const out = []; const walk = (n) => { for (const c of n.children || []) { if (fn(c)) out.push(c); walk(c); } }; walk(this); return out; }
  findOne(fn) { return this.findAll(fn)[0] || null; }
  findAllWithCriteria({ types }) { return this.findAll((n) => types.includes(n.type)); }
  clone() { const c = deepClone(this); if (this.parent) this.parent.appendChild(c); return c; }
  // texte
  get characters() { return this._chars ?? ""; }
  set characters(v) { this._needFont(); if (typeof v !== "string") fail("characters doit être une chaîne"); this._chars = v; this._rangeFills = null; this.width = Math.max(1, v.length * (this._fontSize || 12) * 0.55); this.height = (this._fontSize || 12) * 1.3; }
  _needFont() { if (this.type !== "TEXT") fail("propriété texte sur " + this.type); if (!loaded.has(fkey(this.fontName))) fail(`Cannot write to node with unloaded font "${this.fontName.family} ${this.fontName.style}"`); }
  set fontSize(v) { this._needFont(); this._fontSize = v; } get fontSize() { return this._fontSize; }
  set lineHeight(v) { this._needFont(); if (typeof v !== "object") fail("lineHeight doit être un objet"); this._lh = v; } get lineHeight() { return this._lh; }
  set textAutoResize(v) { if (this.type !== "TEXT") fail("textAutoResize"); if (!["NONE", "HEIGHT", "WIDTH_AND_HEIGHT", "TRUNCATE"].includes(v)) fail("textAutoResize " + v); this._tar = v; }
  set textAlignHorizontal(v) { this._tah = v; }
  async setTextStyleIdAsync(id) {
    const s = STORE.textStyles.find((x) => x.id === id); if (!s) fail("text style inconnu " + id);
    if (!loaded.has(fkey(s.fontName))) fail(`style ${s.name} : police non chargée ${s.fontName.family} ${s.fontName.style}`);
    this.fontName = s.fontName; this._fontSize = s.fontSize;
  }
  setRangeFills(s, e, p) { this._needFont(); if (s < 0 || e > this.characters.length || s >= e) fail(`setRangeFills hors limites ${s}-${e} / ${this.characters.length}`); for (const x of p) checkPaint(x); (this._rangeFills ||= []).push({ start: s, end: e, fills: p }); }
  getStyledTextSegments() { return [{ start: 0, end: this.characters.length, fills: this._fills }].concat(this._rangeFills || []); }
  // composants
  addComponentProperty(name, type, def) {
    if (this.type === "COMPONENT" && this.parent && this.parent.type === "COMPONENT_SET") fail("in addComponentProperty: Can only add component properties to a component set or non-variant component");
    if (this.type !== "COMPONENT" && this.type !== "COMPONENT_SET") fail("addComponentProperty sur " + this.type);
    if (type === "INSTANCE_SWAP" && !(NODES.get(def) && NODES.get(def).type === "COMPONENT")) fail("INSTANCE_SWAP : valeur par défaut doit être l'id d'un composant");
    if (type === "TEXT" && typeof def !== "string") fail("TEXT default");
    const key = `${name}#${ID++}:0`; (this._defs ||= {})[key] = { type, defaultValue: def }; return key;
  }
  get componentPropertyDefinitions() { if (this.type === "COMPONENT" && this.parent?.type === "COMPONENT_SET") fail("componentPropertyDefinitions sur une variante"); return this._defs; }
  get defaultVariant() { return this.children[0]; }
  createInstance() {
    if (this.type !== "COMPONENT") fail("createInstance sur " + this.type);
    const inst = deepClone(this, true); inst.type = "INSTANCE"; inst._main = this; inst.name = this.parent?.type === "COMPONENT_SET" ? this.parent.name : this.name;
    inst._props = {}; const owner = this.parent?.type === "COMPONENT_SET" ? this.parent : this;
    for (const [k, d] of Object.entries(owner._defs || {})) inst._props[k] = { type: d.type, value: d.type === "VARIANT" ? variantValue(this, k) : d.defaultValue };
    figma.currentPage.appendChild(inst); return inst;
  }
  get componentProperties() { if (this.type !== "INSTANCE") fail("componentProperties sur " + this.type); return this._props; }
  get exposedInstances() { const out = []; const walk = (n) => { for (const c of n.children || []) { if (c.type === "INSTANCE" && c._exposed) out.push(c); else if (c.type !== "INSTANCE") walk(c); } }; walk(this); return out; }
  setProperties(obj) {
    if (this.type !== "INSTANCE") fail("setProperties sur " + this.type);
    for (const [k, v] of Object.entries(obj)) {
      const p = this._props[k]; if (!p) fail(`setProperties : propriété inconnue « ${k} » sur ${this.name} (dispo : ${Object.keys(this._props).join(", ")})`);
      if (p.type === "VARIANT") {
        const set = this._main.parent; const want = Object.assign(parseVariant(this._main.name), { [k]: v });
        const target = set.children.find((c) => { const pv = parseVariant(c.name); return Object.entries(want).every(([a, b]) => pv[a] === String(b)); });
        if (!target) fail(`Variante introuvable ${JSON.stringify(want)} dans ${set.name}`);
        const keepName = this.name, exposedName = this._exposed;
        const fresh = deepClone(target, true); this.children = fresh.children; for (const c of this.children) c.parent = this; this._main = target; this.name = keepName; this._exposed = exposedName;
        p.value = String(v);
        // ré-applique les autres props texte/bool
        for (const [k2, p2] of Object.entries(this._props)) if (p2.type !== "VARIANT") applyProp(this, k2, p2);
      } else {
        if (p.type === "TEXT" && typeof v !== "string") fail(`TEXT ${k} attend une chaîne`);
        if (p.type === "BOOLEAN" && typeof v !== "boolean") fail(`BOOLEAN ${k} attend un booléen`);
        if (p.type === "INSTANCE_SWAP" && !(NODES.get(v) && NODES.get(v).type === "COMPONENT")) fail(`INSTANCE_SWAP ${k} : id de composant attendu`);
        p.value = v; applyProp(this, k, p);
      }
    }
  }
  swapComponent(c) { this._main = c; }
  set cornerRadius(v) { this._cr = v; } get cornerRadius() { return this._cr || 0; }
  set vectorPaths(v) { if (this.type !== "VECTOR") fail("vectorPaths"); for (const p of v) if (!/^M /.test(p.data) || /NaN|Infinity/.test(p.data)) fail("vectorPaths data invalide : " + p.data.slice(0, 60)); this._vp = v; }
}
function propOwner(n) { let p = n.parent; while (p) { if (p.type === "COMPONENT_SET") return p; if (p.type === "COMPONENT" && !(p.parent && p.parent.type === "COMPONENT_SET")) return p; if (p.type === "INSTANCE") return null; p = p.parent; } return null; }
function parseVariant(name) { const o = {}; for (const part of name.split(",")) { const [a, b] = part.split("=").map((s) => s.trim()); if (b !== undefined) o[a] = b; } return o; }
function variantValue(comp, k) { return parseVariant(comp.name)[k]; }
function applyProp(inst, k, p) {
  const walk = (n) => { for (const c of n.children || []) { const r = c._refs || {}; if (r.characters === k) { c._chars = p.value; } if (r.visible === k) c.visible = p.value; if (r.mainComponent === k) c._main = NODES.get(p.value); if (c.type !== "INSTANCE") walk(c); } };
  walk(inst);
}
const NODES = new Map();
function track(n) { NODES.set(n.id, n); return n; }
function deepClone(n, keepRefs) {
  const c = track(new Node(n.type));
  for (const k of Object.keys(n)) { if (["id", "parent", "children", "_pd"].includes(k)) continue; c[k] = n[k]; }
  c._props = n._props ? JSON.parse(JSON.stringify(n._props)) : undefined;
  if (n.children) { c.children = []; for (const ch of n.children) { const cc = deepClone(ch, keepRefs); c.children.push(cc); cc.parent = c; } }
  if (n.type === "COMPONENT" && keepRefs) { /* devient instance plus haut */ }
  return c;
}
function checkPaint(p) {
  if (!p || typeof p !== "object") fail("paint invalide");
  if (p.type === "SOLID") { if ("a" in p.color) fail("paint.color ne doit pas contenir a"); for (const v of Object.values(p.color)) if (v < 0 || v > 1) fail("couleur hors [0,1]"); }
}

const STORE = { textStyles: [], effectStyles: [], collections: [], variables: [], pages: [] };
const page = (name) => { const p = track(new Node("PAGE")); p.name = name; p._loaded = false; return p; };
const root = { children: [] };
const figma = {
  mixed: MIXED,
  root,
  get currentPage() { return this._cur; },
  set currentPage(v) { fail("Setting figma.currentPage is not supported"); },
  async setCurrentPageAsync(p) { p._loaded = true; this._cur = p; },
  createPage() { if (root.children.length >= 3) fail("in createPage: The Starter plan only comes with 3 pages."); const p = page("Page " + (root.children.length + 1)); root.children.push(p); return p; },
  async loadFontAsync(f) { const st = AVAILABLE_FONTS[f.family]; if (!st || !st.includes(f.style)) fail(`The font "${f.family} ${f.style}" could not be loaded`); loaded.add(fkey(f)); },
  _make(type) { const n = track(new Node(type)); this._cur.appendChild(n); return n; },
  createFrame() { return this._make("FRAME"); },
  createComponent() { return this._make("COMPONENT"); },
  createRectangle() { return this._make("RECTANGLE"); },
  createEllipse() { return this._make("ELLIPSE"); },
  createVector() { return this._make("VECTOR"); },
  createText() { const t = this._make("TEXT"); t.fontName = { family: "Inter", style: "Regular" }; t._fontSize = 12; return t; },
  createNodeFromSvg(svg) {
    if (!/viewBox/.test(svg) || !/width=/.test(svg)) fail("svg sans viewBox/width");
    const f = this._make("FRAME"); f.width = 24; f.height = 24; f._fills = [];
    const shapes = (svg.match(/<(path|circle|rect|ellipse|polyline|polygon|line)\b/g) || []).length; if (!shapes) fail("svg vide");
    for (let i = 0; i < shapes; i++) { const v = track(new Node("VECTOR")); v.strokes = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }]; f.appendChild(v); }
    return f;
  },
  createComponentFromNode(n) {
    if (n.type !== "FRAME") fail("createComponentFromNode attend un frame");
    const c = track(new Node("COMPONENT")); Object.assign(c, { width: n.width, height: n.height }); c.children = n.children; for (const ch of c.children) ch.parent = c;
    const par = n.parent; const i = par.children.indexOf(n); par.children[i] = c; c.parent = par; n.parent = null; return c;
  },
  combineAsVariants(comps, parent) {
    if (!comps.length) fail("combineAsVariants vide");
    for (const c of comps) { if (c.type !== "COMPONENT") fail("combineAsVariants : composants seulement"); if (!/=/.test(c.name)) fail("nom de variante invalide : " + c.name); }
    const set = track(new Node("COMPONENT_SET")); parent.appendChild(set); set._defs = {};
    for (const c of comps) { set.appendChild(c); for (const [k, v] of Object.entries(parseVariant(c.name))) { set._defs[k] ||= { type: "VARIANT", defaultValue: v, variantOptions: [] }; set._defs[k].variantOptions.push(v); } if (c._defs && Object.keys(c._defs).length) fail("variante avec propriétés propres : " + c.name); }
    return set;
  },
  getLocalTextStylesAsync: async () => STORE.textStyles,
  getLocalEffectStylesAsync: async () => STORE.effectStyles,
  createTextStyle() { const s = { id: "S:" + ID++, name: "", type: "TEXT", set fontName(v) { if (!loaded.has(fkey(v))) fail("style : police non chargée " + fkey(v)); this._f = v; }, get fontName() { return this._f; } }; STORE.textStyles.push(s); return s; },
  createEffectStyle() { const s = { id: "E:" + ID++, name: "", effects: [] }; STORE.effectStyles.push(s); return s; },
  async getNodeByIdAsync(id) { return NODES.get(id) || null; },
  getNodeById() { fail("getNodeById interdit en dynamic-page"); },
  viewport: { scrollAndZoomIntoView() {} },
  closePlugin() {},
  variables: {
    async getLocalVariableCollectionsAsync() { return STORE.collections; },
    async getLocalVariablesAsync(type) { return STORE.variables.filter((v) => !type || v.resolvedType === type); },
    async getVariableByIdAsync(id) { return STORE.variables.find((v) => v.id === id) || null; },
    createVariableCollection(name) {
      const c = { id: "VC:" + ID++, name, modes: [{ modeId: ID++ + ":0", name: "Mode 1" }], variableIds: [], renameMode(id, n) { const m = this.modes.find((x) => x.modeId === id); if (!m) fail("mode inconnu"); m.name = n; }, addMode() { fail("in addMode: Limited to 1 modes only"); } };
      STORE.collections.push(c); return c;
    },
    createVariable(name, col, type) {
      if (typeof col === "string") col = STORE.collections.find((c) => c.id === col);
      if (!col) fail("collection inconnue");
      if (STORE.variables.find((v) => v.name === name && v.variableCollectionId === col.id)) fail("variable en double " + name);
      const v = { id: "V:" + ID++, name, resolvedType: type, variableCollectionId: col.id, values: {}, scopes: ["ALL_SCOPES"], setValueForMode(m, val) { if (!col.modes.find((x) => x.modeId === m)) fail("mode inconnu"); if (type === "COLOR" && ("a" in val)) {} this.values[m] = val; } };
      STORE.variables.push(v); col.variableIds.push(v.id); return v;
    },
    setBoundVariableForPaint(p, field, v) {
      if (!v || v.resolvedType !== "COLOR") fail("setBoundVariableForPaint : variable COLOR attendue");
      if (field !== "color") fail("champ " + field);
      return Object.assign({}, p, { boundVariables: { color: { type: "VARIABLE_ALIAS", id: v.id } } });
    },
  },
};
// fichier existant : 1 page (comme un fichier neuf), quelques restes d'un essai précédent
const p0 = page("Page 1"); root.children.push(p0); figma._cur = p0; p0._loaded = true;
module.exports = { figma, STORE, NODES, root };
