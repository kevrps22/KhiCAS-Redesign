#!/usr/bin/env bash
# Assemble les sources en un plugin Figma (plugin/code.js) et une version Scripter (scripter.js)
set -e
cd "$(dirname "$0")"
# Scripter et le bac à sable Figma n'acceptent pas toutes les syntaxes récentes
if grep -nE '(\?\?|\?\.[A-Za-z_(\[]|\|\|=|&&=|\?\?=)' src/*.js | grep -vE '^\S+:[0-9]+:\s*//'; then
  echo "ERREUR : syntaxe non supportée (??, ?., ||=, &&=) ci-dessus" >&2; exit 1
fi
SRC=$(cat src/*.js)
{
  echo "// Généré par build.sh — ne pas modifier, éditer src/*.js"
  echo "$SRC"
  cat <<'JS'

buildKhiCAS()
  .then((errs) => figma.closePlugin(errs.length ? `KhiCAS : terminé, ${errs.length} écran(s) en erreur — ${errs.join(" | ")}` : "KhiCAS : design généré ✓"))
  .catch((e) => { console.error(e); figma.closePlugin("KhiCAS — erreur : " + (e && e.message)); });
JS
} > plugin/code.js
{
  echo "// KhiCAS Redesign — version Scripter (coller dans le plugin « Scripter » et lancer)"
  echo "$SRC"
  cat <<'JS'

// Pas de « await » au niveau racine : l'exécuteur de Scripter ne l'accepte pas.
const __out = (m) => { if (typeof print === "function") print(m); else console.log(m); };
buildKhiCAS()
  .then((errs) => __out(errs.length ? "KhiCAS : terminé, écrans en erreur — " + errs.join(" | ") : "KhiCAS : design généré ✓"))
  .catch((e) => __out("KhiCAS — erreur : " + (e && e.message)));
JS
} > scripter.js
node --check scripter.js && node --check plugin/code.js && echo "plugin/code.js OK ($(wc -l < plugin/code.js) lignes)"
