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
