# KhiCAS — implémentation du redesign

| Dossier | Contenu |
|---|---|
| `Upsilon-External/` | Dépôt de l'app (branche `redesign`). Le code modifié est dans `apps/KhiCAS/src/` |
| `Upsilon/` | Firmware Upsilon, sert uniquement de **simulateur Linux** (quelques patchs de debug : capture d'écran par touche) |
| `hostdeps/` | `mpfi` compilé pour le PC (nécessaire au simulateur) |
| `tools/` | Scripts de développement |
| `shots/` | Captures produites par `tools/shoot.py` |

## Boucle de développement

```bash
tools/sim.sh                                   # recompile giac + kui (incrémental, ~10 s) et relie le simulateur
tools/shoot.py demo "OK OK 1 Div 3 EXE S:2"    # rejoue des touches et capture l'écran à chaque touche
```

Captures dans `shots/<nom>/` (+ `planche.png`). Les 5 premières touches (Down×4 OK) ouvrent KhiCAS ;
ensuite `OK OK` passe la langue et l'interpréteur. Préfixes : `S:` = ⇧, `A:` = α.
Touches : `Left Up Down Right OK Back Home Toolbox Var XNT EXE Backspace Sine Sqrt Square Power LPar RPar
Mul Div Plus Minus Comma Ans 0…9`.

## Ce qui a changé (phase 1)

Nouveau module **`giac-1.6.0/src/kui.{h,cc}`** + polices générées **`kfonts.h`** (`tools/fontgen.py`,
Geist / JetBrains Mono / STIX Two, alpha 4 bits, ~104 Ko) :

- **Texte** : tout le texte de KhiCAS passe par JetBrains Mono anti-aliasée, avec les mêmes cellules
  (10×18 et 7×14) que les polices système. Aucun changement de mise en page. Les couleurs historiques
  (noir, bleu, rouge, magenta…) sont converties vers le thème. Les accents français sont réactivés.
- **Barre d'état** : logo χ, titre, fichier de session, interpréteur, angle (`kui::status`).
- **Barre du bas** : raccourcis ⇧1…⇧6 avec touches et libellés en clair. Version ⇧ en ambre.
- **Menus** (`doMenu` → `kmenu_draw`) : panneau arrondi, indices en touches, sélection indigo,
  barre de défilement, barre d'aide `[OK] Choisir · [1…9] · [Back] Fermer`.
- **Menus ⇧N** (`Console_Draw_FMenu`) : panneau du bas avec onglets (← → change de menu), descriptions
  en français, voile sur le shell. Corrige aussi le changement de menu ⇧ depuis un menu ouvert (bug d'origine).
- **Dialogues** (`confirm`) : carte avec titre, message et actions en touches ; `inputline` recadré.
- **Fiche d'aide** pendant la saisie (remplace la bulle jaune).
- **Shell** : séparateurs entre calculs, barre de focus sur la ligne en cours.

## Phase 2

- **Tableaux de variation** (`ktabvar_view`, appelé au début de `eqw`) : la matrice de `tabvar` est
  dessinée comme un vrai tableau. Lignes x / y′ / y / y″, flèches lissées, valeurs en haut ou en bas
  selon le sens, signes colorés, ∪/∩ pour la convexité, doubles barres pour les valeurs interdites,
  hachures si non défini. Écritures ∞, √2, e², x². Défilement ← →, valeurs trop longues abrégées,
  OK = matrice brute.
- **Graphes** : grille légère, axes gris, graduations « 0,5 » au-dessus de la barre d'aide, courbes
  indigo par défaut et anti-aliasées (sous-pixel), barre d'aide `[+ −] Zoom · [↑↓←→] · [Toolbox] Menu · [EXE]`.
- **Afficheur 2D** : rendu en STIX Two (17 / 13 px), variables en italique, π, ·, vrai signe moins,
  sélection indigo clair.
- **Éditeur de script** : marge des numéros de ligne, numéro courant en indigo.
- **Barre d'état** : titre selon le mode (Calcul, Script, Graphe, Afficheur 2D).
- `tools/shoot.py` accepte `T:texte` pour taper du texte (lettres via α).

## Phase 3

- **Menus** : libellés français accentués (« Exécuter la session », « Table périodique », « Probabilités »…),
  raccourci d'origine affiché en touche à droite (`(ln)` → [ln], `(shift ANS)` → [⇧ Ans]).
- **Fiche du catalogue** (`kfiche`) : nom en mono indigo, description sur plusieurs lignes, syntaxe,
  exemples avec leur touche, barre `[OK] Insérer · [Ans] Exemple · [Back] Retour`.
- **Tableur** : en-têtes gris, numéro de ligne courant en indigo, cellule active entourée, référence en
  pastille, barre ⇧ en clair (Stat 1D, 2D, Suites…), titre « Tableur ».
- **Accueil** : logo, crédits, bannière examen ; dialogues « Langue · Language » et « Interpréteur ? ».
- **Tortue** : carte x / y / cap. Le code compile mais l'écran n'a pas encore été vu au simulateur.
- `kui::text_wrap` (texte multiligne), glyphes ˣ ʸ χ ajoutés.

## Phase 4

- **Tableau périodique** : cases arrondies aux couleurs douces par famille, sélection indigo, carte
  de l'élément (symbole, nom, Z, A, masse, électronégativité) dans l'espace libre du tableau, ligne
  des touches d'insertion ([5] symbole, [(] Z, [8] A, [7] masse, [,] χ).
- **Finance** (prêt, épargne) : libellés accentués, valeurs alignées à droite (`libellé\tvaleur`
  dans les menus), barre `[Ans] Résoudre · [EXE] Modifier · [Toolbox] Aide`, titre « Finance ».
- **Table des caractères** : grille aérée, sélection indigo, carte code décimal / hexadécimal.
- Menus : `kui::menu_hints()` remplace la barre d'aide du prochain `doMenu`. `kui::status_mode()`
  change le titre de la barre d'état (Applications, Finance, Caractères…).

## Build pour la calculatrice

```bash
tools/build-arm.sh          # gmp, mpfr, mpfi, MicroPython, giac (une fois), puis app.elf et apps.tar
tools/build-arm.sh giac     # après une modification de l'interface : recompile giac et relie
```

Produit `apps.tar` (~5,3 Mo, limite 6 Mo). Le script contrôle la RAM statique (≤ 16 Ko pour une app
externe ; actuellement ~13,2 Ko). Journaux dans `tools/arm-logs/`.
Adaptations pour la chaîne actuelle (GCC 16, automake 1.20) : macro `AX_PTHREAD` minimale pour
mpfr/mpfi, `src/libc_stubs.c` (fonctions absentes de newlib-nano), édition de liens faite par le script.
L'autoreconf modifie des fichiers suivis de gmp/mpfr/mpfi : ne pas les committer.

### Flasher (Upsilon avec bootloader)

1. `sudo pacman -S dfu-util`
2. Calculatrice : bouton reset au dos → menu du bootloader, brancher en USB.
3. `sudo dfu-util -i 0 -a 0 -s 0x90200000 -D apps.tar`
4. Redémarrer, ouvrir l'app « External » → KhiCAS.

L'archive remplace toutes les apps externes installées (elle ne contient que KhiCAS). Pour revenir à
la version officielle : installeur web d'Upsilon-External.

## Limites connues

- La barre de titre (18 px) appartient au firmware : il la redessine quand on appuie sur ⇧/α. La nôtre
  revient à la touche suivante. L'API des apps externes n'expose ni l'état ⇧/α, ni l'heure, ni la batterie.
- Pas encore testé sur la vraie calculatrice : `kui.cc` et `main.cpp` compilent pour ARM, mais la
  chaîne complète (gmp/mpfr/giac pour ARM → `app.elf`) n'a pas été relancée.
