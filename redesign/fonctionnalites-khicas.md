# KhiCAS — inventaire des fonctionnalités (v1.6, Upsilon-External)

Relevé dans le code source (`giac-1.6.0/src/kdisplay.cc`, `kadd.cc`) et dans les captures du simulateur.
Sert de checklist pour le redesign : chaque ligne doit avoir sa place dans les maquettes Figma.

## Démarrage
- Choix de la langue (OK : Français, Back : English)
- Écran d'accueil : copyright, « HOME plusieurs fois pour quitter », avertissement mode examen
- Choix de l'interpréteur : Xcas ou MicroPython (modifiable dans Config)

## Shell (console)
- Historique entrées / sorties, résultat exact, affichage 2D (fractions, racines, puissances)
- Bulle d'aide contextuelle pendant la saisie (description, syntaxe, exemples)
- Barre d'en-tête : mode (shell, Py/Xcas), syntaxe `^=**`, RAD/DEG, nom de session, heure
- Barre de raccourcis (shift-1…9) : menus de fonctions
- EXE sur un résultat → afficheur/éditeur 2D (EXE : quitte, résultat dans `last`)

## Menus de fonctions (shift + chiffre), mode Xcas
- F1 algb : simplify, factor, partfrac, tcollect, texpand, sum, oo, product
- F2 calc : ', diff, integrate, limit, series, solve, desolve, rsolve
- F3 plot : plot, plotseq, plotlist, plotparam, plotpolar, plotfield, histogram, barplot
- F4 menu / edt (édition), F5 2d (afficheur 2D)
- F6 regr : linear/logarithmic/exponential/power/polynomial/sin regression_plot, scatterplot, matrix
- F7 lin : matrix, det, matpow, ranm, rref, tran, egvl, egv
- F8 cplx : abs, arg, re, im, conj, csolve, cfactor, cpartfrac
- F9 arit : mod, irem, ifactor, gcd, isprime, nextprime, powmod, iegcd
- poly : proot, pcoeff, quo, rem, gcd, egcd, resultant, GF
- list : makelist, range, seq, len, append, ranv, sort, apply
- real : exact, approx, floor, ceil, round, sign, max, min
- prog : `:` `&` `#` hexprint, binprint, f(x):=, debug, python
- misc : !, rand, binomial, normald, exponentiald, and, or, periodic_table
- geo : point, line, circle, plane
- color : color=, red, cyan, green, blue, magenta, yellow
- Mode MicroPython : misc, math, c&rand, tortue, linalg, numpy, arit, color, draw, plot (matplotl), list, prog

## Catalogue (touche Toolbox) — « Liste de commandes »
Tout, Algèbre, Algèbre linéaire, Analyse, Arithmétique/crypto, Complexes, Courbes, Polynômes,
Probabilités, Programmes cmds, Réels, Résoudre, Statistiques, Trigonométrie, Listes, Programmes,
Modifier variables, Constantes physiques, Unités physiques, Géométrie, 3D, Tortue.
Chaque commande : description, syntaxe, 1–2 exemples (insérables).

## Afficheur / éditeur 2D
- Affichage formaté, sélection de sous-expression
- Barre : shift-1 algb | 2 calc | 3 undo | 4 edt | 5 +- | 6 approx

## Graphes
- Tracé 2D (fonctions, paramétrique, polaire, suites, champs, histogrammes, barres)
- Tracé 3D (zmin/zmax, raccourcis 3D)
- Zoom +/-, Y-zoom, autoscale, orthonormaliser, déplacement (pad), afficher/cacher axes
- toolbox : cfg (ymin, ymax, xmin, xmax…)

## Menu principal KhiCAS (touche Home/menu)
- Applications (shift ANS)
- Enregistrer / Enregistrer sous / Charger session / Nouvelle session / Exécuter session
- Éditeur script / Ouvrir script / Exécuter script
- Effacer historique / Effacer script
- Configuration / examen
- Aide interface (raccourcis)
- Éditer matrice
- Créer paramètre (slider)
- Enregistrer un script (Record / Stop recording)
- À propos, Quitter
- Multi-firmware : reboot autre firmware, backup/restore, slots 1–3, bootloader

## Configuration
- x,n,t → t ; Syntaxe (Xcas / Python / JS) ; Radians ; Sqrt ; Digits
- Langue : Français, English, Spanish, Greek, Deutsch
- Raccourcis clavier ; Mode examen / backup ; Quitter mode examen
- Mémoire : Storage, heap MicroPython/JS, stack

## Éditeur de script
- Tester syntaxe, Sauvegarder, Sauvegarder comme, Insérer, Effacer
- Chercher/remplacer, Aller à la ligne
- Syntaxe : QuickJS, MicroPython, Xcas français, Xcas compat Python (^=** ou ^=xor)
- Taille des caractères, À propos, Quitter
- Menus de programmation : test, loop, misc, tortue, lin, arit, plot, cplx…

## Applications
- Tableur (+ configuration tableur, menu tableur)
- Table périodique
- Prêt (mortgage) / Épargne (TVM)
- Table des caractères
- Exemples : Syracuse, Mastermind, fractale de Mandelbrot
- Personnaliser la flash (fichiers flash)

## Autres
- Éditeur de matrice
- Paramètre / slider (« Parameter »)
- Variables (touche Var)
- Tortue (Logo) : avance, recule, tourne_gauche/droite, crayon, rond, disque, repete, efface
