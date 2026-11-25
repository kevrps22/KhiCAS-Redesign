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
