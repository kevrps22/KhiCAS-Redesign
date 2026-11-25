// Exécute plugin/code.js contre la maquette d'API et affiche un résumé.
const fs = require("fs");
const vm = require("vm");
const path = require("path");
const { figma, STORE, root } = require("./mock-figma");
let closed = null;
figma.closePlugin = (m) => { closed = m; };
const code = fs.readFileSync(path.join(__dirname, "../plugin/code.js"), "utf8");
const ctx = vm.createContext({ figma, console, Math, JSON, Object, Array, String, Number, Set, Map, Symbol, Promise, Error, isFinite, parseInt });
vm.runInContext(code, ctx, { filename: "code.js" });
setTimeout(() => {
  console.log("closePlugin :", closed);
  console.log("pages :", root.children.map((p) => `${p.name} (${p.children.length} nœuds racine)`).join(" · "));
  console.log("variables :", STORE.variables.length, "· styles texte :", STORE.textStyles.length, "· effets :", STORE.effectStyles.length);
  const all = root.children.flatMap((p) => p.findAll());
  const count = (t) => all.filter((n) => n.type === t).length;
  console.log("composants :", count("COMPONENT"), "· sets :", count("COMPONENT_SET"), "· instances :", count("INSTANCE"), "· textes :", count("TEXT"));
  const screens = root.children[1].findAll((n) => n.type === "FRAME" && /^\d\d · /.test(n.name) && n.width === 320 && n.height === 240);
  console.log("écrans :", screens.length);
  const dark = root.children[2].findAll((n) => /· sombre$/.test(n.name));
  console.log("écrans sombres :", dark.length);
  // couleurs non liées à une variable (hors blanc par défaut des frames)
  const unbound = all.filter((n) => Array.isArray(n.fills) && n.fills.some((p) => p.type === "SOLID" && !p.boundVariables));
  console.log("nœuds avec remplissage non lié :", unbound.length, unbound.slice(0, 5).map((n) => n.type + " " + n.name));
  if (!closed || !/✓/.test(closed)) process.exitCode = 1;
}, 50);
