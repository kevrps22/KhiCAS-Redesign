# KhiCAS — Redesign

Redesign complet de l'interface de KhiCAS (calcul formel pour NumWorks, Upsilon-External) :
design system + 37 écrans couvrant toutes les fonctionnalités de KhiCAS 1.6, générés dans Figma
par un plugin (le plan Figma Starter bloque la génération automatique à distance).

Fichier Figma : https://www.figma.com/design/pNP4tPUV2GhS5v0SiXsjqc

## Lancer le générateur

Le plugin est ré-exécutable : il supprime ce qu'il a généré avant et reconstruit tout (~1 min).

### Option A — Navigateur (recommandé sous Linux) : plugin « Scripter »

1. Ouvrir le fichier Figma ci-dessus dans le navigateur.
2. Menu **Plugins → Rechercher « Scripter »** (plugin communautaire gratuit de Rasmus Andersson) → Lancer.
3. Dans Scripter : nouveau script, effacer le contenu, coller **tout** le contenu de `scripter.js`.
4. Cliquer sur **▶ Run**. À la fin, Scripter affiche « KhiCAS : design généré ✓ ».

### Option B — Figma desktop (Windows / macOS)

1. Ouvrir le fichier Figma dans l'app desktop.
2. **Plugins → Development → Import plugin from manifest…** → choisir `plugin/manifest.json`.
3. **Plugins → Development → KhiCAS Redesign**. Le message de fin s'affiche en bas de l'écran.

Si un écran échoue, le plugin continue : l'écran affiche le message d'erreur en rouge et la liste
apparaît dans le message de fin. Envoie-moi une capture et je corrige.

## Ce qui est généré

| Page | Contenu |
|---|---|
| **Design system** | Couverture et principes, couleurs (clair + sombre), typographie, 58 icônes, composants (Key, StatusBar, SoftKey/SoftKeyBar, HintBar, ActionHint, MenuItem, HistoryEntry, InputLine, HelpCard, Dialog, ConfigRow, Field, Chip, Toast, Gauge, Math/Fraction) |
| **Écrans** | 37 écrans 320 × 240 en 8 parcours, chacun avec une note (touches + fonctionnalités couvertes) |
| **Thème sombre** | 8 écrans clés liés à la collection de couleurs sombre |

Parcours : Démarrage · Shell & calcul · Catalogue & aide · Graphes · Menu KhiCAS ·
Configuration & examen · Éditeur de script · Applications. La correspondance avec
`fonctionnalites-khicas.md` est dans les notes sous chaque écran.

## Modifier le design

Éditer `src/*.js`, puis :

```bash
./build.sh          # régénère plugin/code.js et scripter.js
node test/run.js    # exécute le générateur contre une maquette de l'API Figma
```

| Fichier | Rôle |
|---|---|
| `src/01-core.js` | Polices (avec repli), tokens de couleur, styles, helpers |
| `src/02-components.js` | Icônes et composants |
| `src/03-screen-kit.js` | Helpers d'écran (barres, menus, tracés, code coloré) |
| `src/04-screens.js` | Les 37 écrans, groupés par parcours |
| `src/05-main.js` | Planches de doc, page sombre, orchestration |
| `test/mock-figma.js` | Maquette stricte de l'API Plugin (auto-layout, polices, propriétés de composants, limites Starter) |
| `captures-originales/` | Captures de KhiCAS 1.6 actuel (simulateur Upsilon) pour comparer |
