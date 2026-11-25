// kui — couche d'interface du redesign KhiCAS
// Rendu de texte anti-aliasé (polices Geist / JetBrains Mono / STIX Two), formes arrondies,
// touches (keycaps), barre d'état, barre de raccourcis, thème de couleurs.
// Toutes les coordonnées sont ABSOLUES sur l'écran 320 × 240 (la zone de l'app KhiCAS commence à y = 18).
#pragma once
#include <stdint.h>

struct kglyph { uint16_t cp; uint8_t adv; int8_t xoff, yoff; uint8_t w, h; uint32_t off; };
struct kfont { uint8_t height, base, cell; uint16_t n; const kglyph * g; const uint8_t * data; };

extern const kfont kf_mono_l, kf_mono_s, kf_mono_sm, kf_ui_9sb, kf_ui_10, kf_ui_11m, kf_ui_12, kf_ui_12m, kf_ui_13sb, kf_ui_20sb, kf_math_11i, kf_math_17, kf_math_17i, kf_math_13, kf_math_13i;

#ifdef __cplusplus
extern "C" {
#endif
  // Fournis par la plateforme (main.cpp) : coordonnées écran absolues, avec rognage.
  void kui_push_rect(int x, int y, int w, int h, const uint16_t * pixels);
  void kui_fill_rect(int x, int y, int w, int h, uint16_t color);
  void kui_pull_rect(int x, int y, int w, int h, uint16_t * pixels);
  bool kui_shift_active();
  bool kui_alpha_active();
#ifdef __cplusplus
}
#endif

namespace kui {
  // ---------- Couleurs (RGB565) — tokens du Figma « KhiCAS / Couleurs (clair) » ----------
  constexpr uint16_t rgb(uint32_t h) { return (uint16_t)((((h >> 16) & 0xF8) << 8) | (((h >> 8) & 0xFC) << 3) | ((h & 0xFF) >> 3)); }
  constexpr uint16_t BG_APP = rgb(0xF5F6FA), SURFACE = rgb(0xFFFFFF), SURFACE2 = rgb(0xEEF0F5), SUNKEN = rgb(0xE7EAF1);
  constexpr uint16_t BORDER = rgb(0xE0E3EC), BORDER_STRONG = rgb(0xC9CEDA);
  constexpr uint16_t TEXT = rgb(0x141824), TEXT2 = rgb(0x5A6174), TEXT3 = rgb(0x8E94A6), ON_ACCENT = rgb(0xFFFFFF);
  constexpr uint16_t PRIMARY = rgb(0x4A57E3), PRIMARY_SOFT = rgb(0xE9ECFF), PRIMARY_STRONG = rgb(0x3440C2);
  constexpr uint16_t SHIFT = rgb(0xE8930C), SHIFT_SOFT = rgb(0xFFF3DC), ALPHA = rgb(0x0E9F77), ALPHA_SOFT = rgb(0xDDF6EE);
  constexpr uint16_t DANGER = rgb(0xDC3E42), DANGER_SOFT = rgb(0xFDECEC), SUCCESS = rgb(0x1F9D55);
  constexpr uint16_t SYN_FN = rgb(0x4A57E3), SYN_KW = rgb(0xA23AA0), SYN_STR = rgb(0x0E8A66), SYN_NUM = rgb(0xB45309), SYN_COMMENT = rgb(0x8E94A6);
  constexpr uint16_t SCRIM = rgb(0x9A9DA8);

  // Couleurs « historiques » de KhiCAS → thème (texte uniquement, pour ne pas altérer les graphes)
  uint16_t remap_text(uint16_t c);
  uint16_t blend(uint16_t bg, uint16_t fg, int a15);  // a15 ∈ [0, 15]

  // ---------- Texte ----------
  // y = haut de la boîte de ligne (hauteur font.height). Renvoie le x de fin. fake = mesure seulement.
  int text(int x, int y, const char * s, const kfont & f, uint16_t fg, uint16_t bg, bool fake = false);
  int text_clip(int x, int y, const char * s, const kfont & f, uint16_t fg, uint16_t bg, int xmax); // rogne avec « … »
  int width(const char * s, const kfont & f);
  // Texte sur plusieurs lignes (coupure aux espaces), au plus maxlines lignes ; renvoie le y suivant
  int text_wrap(int x, int y, int w, const char * s, const kfont & f, uint16_t fg, uint16_t bg, int maxlines = 8, int lineh = 0);
  // Texte mono en cellules fixes (remplace les polices système 10×18 et 7×14)
  int text_cells(int x, int y, const char * s, const kfont & f, uint16_t fg, uint16_t bg, bool fake = false);

  // ---------- Formes ----------
  void fill(int x, int y, int w, int h, uint16_t c);
  // Rectangle arrondi anti-aliasé. border = couleur de bordure (ou = fill pour aucune), bg = couleur dessous.
  void box(int x, int y, int w, int h, int r, uint16_t fillc, uint16_t border, uint16_t bg);
  void hline(int x, int y, int w, uint16_t c);
  // Segment anti-aliasé d'épaisseur w (le fond sous le segment est supposé uni = bg)
  void seg(float x0, float y0, float x1, float y1, float w, uint16_t c, uint16_t bg);
  // Flèche anti-aliasée de (x0,y0) vers (x1,y1)
  void arrow(float x0, float y0, float x1, float y1, uint16_t c, uint16_t bg);
  // Symbole ∪ (convexe, up=true) ou ∩ (concave) dessiné en traits lissés, centré sur (cx, cy)
  void cupcap(float cx, float cy, bool up, uint16_t c, uint16_t bg);
  // Hachures diagonales fines (zone non définie)
  void hatch(int x, int y, int w, int h, uint16_t c, uint16_t bg);
  void vline(int x, int y, int h, uint16_t c);

  // ---------- Composants ----------
  enum KeyType { KEY_PLAIN, KEY_SHIFT, KEY_ALPHA, KEY_PRIMARY, KEY_DARK };
  int keycap_width(const char * label);
  int keycap(int x, int y, const char * label, KeyType t, uint16_t bg);  // hauteur 14 ; renvoie x de fin
  int chip(int x, int y, const char * label, bool selected, uint16_t bg);    // hauteur 16 ; renvoie x de fin

  constexpr int STATUS_H = 18;      // barre d'état (zone titre du système)
  constexpr int SOFTBAR_Y = 216;    // barre du bas : 216 → 240
  constexpr int SOFTBAR_H = 24;

  // Barre d'état. Les valeurs sont mémorisées pour être redessinées après chaque touche
  // (le système redessine sa propre barre de titre pendant getkey).
  void status(const char * title, const char * subtitle, const char * interp, const char * angle);
  void status_message(const char * msg);   // message ponctuel à la place du sous-titre
  void status_mode(const char * title);    // change le titre (mode courant) sans message
  void status_redraw();

  // Barre des raccourcis : 6 couples (touche, libellé). Libellé nul = emplacement vide.
  void softkeys(const char * const keys[6], const char * const labels[6], bool shift);
  // Barre d'aide : jusqu'à 4 actions [touche] libellé ; les deux dernières à droite.
  void hints(const char * const keys[4], const char * const labels[4], const KeyType types[4]);
  // Libellés lisibles pour les abréviations des menus de KhiCAS (« algb » → « Algèbre »)
  const char * friendly(const char * shortname);
  // Dessine la barre du bas à partir d'une chaîne historique « shift-1 algb|2 calc|… »
  void softkeys_from_legacy(const char * menu, bool shift);
  void softkeys_redraw(bool shift);
  // Barre d'aide du prochain menu (doMenu) à la place de [OK] Choisir · [1…9] · [Back] Fermer
  void menu_hints(const char * const keys[4], const char * const labels[4]);
  bool take_menu_hints(const char * const *& keys, const char * const *& labels);      // redessine la dernière barre (ex. en état ⇧)
  // Assombrit une zone déjà dessinée (voile derrière un panneau)
  void dim(int x, int y, int w, int h);
  // Description courte en français d'une commande (« integrate( » → « Intégrer »), ou 0
  const char * describe(const char * cmd);
}
