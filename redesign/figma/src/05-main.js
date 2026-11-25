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
