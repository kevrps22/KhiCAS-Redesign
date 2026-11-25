// kui — couche d'interface du redesign KhiCAS (voir kui.h)
#include "kui.h"
#include "kfonts.h"
#include <string.h>
#include <string>
#include <math.h>

namespace kui {
  // Tampon de ligne partagé (la RAM statique d'une app externe est limitée à 16 Ko)
  static uint16_t g_row[320];

  // ---------------------------------------------------------------- couleurs
  uint16_t blend(uint16_t bg, uint16_t fg, int a) {
    if (a <= 0) return bg;
    if (a >= 15) return fg;
    int br = bg >> 11, bgc = (bg >> 5) & 63, bb = bg & 31;
    int fr = fg >> 11, fgc = (fg >> 5) & 63, fb = fg & 31;
    int r = br + ((fr - br) * a + 7) / 15;
    int g = bgc + ((fgc - bgc) * a + 7) / 15;
    int b = bb + ((fb - bb) * a + 7) / 15;
    return (uint16_t)((r << 11) | (g << 5) | b);
  }

  uint16_t remap_text(uint16_t c) {
    switch (c) {
      case 0x0000: return TEXT;           // noir
      case 0xF800: return DANGER;         // rouge
      case 0x0400: return SYN_STR;        // vert
      case 0x001F: return PRIMARY;        // bleu
      case 0xF81F: return SYN_KW;         // magenta
      case 0x07FF: return ALPHA;          // cyan
      case 0xFFE0: return SHIFT;          // jaune (illisible sur blanc)
      case 57083:  return PRIMARY_SOFT;   // color_gris : fond de sélection
      default: return c;
    }
  }

  // ---------------------------------------------------------------- polices
  static uint32_t utf8(const char *& p) {
    const unsigned char * s = (const unsigned char *)p;
    uint32_t c = *s;
    int n = 0;
    if (c < 0x80) n = 0;
    else if ((c & 0xE0) == 0xC0) { c &= 0x1F; n = 1; }
    else if ((c & 0xF0) == 0xE0) { c &= 0x0F; n = 2; }
    else if ((c & 0xF8) == 0xF0) { c &= 0x07; n = 3; }
    else { p++; return '?'; }
    p++;
    for (int i = 0; i < n; i++) {
      if ((*(const unsigned char *)p & 0xC0) != 0x80) return '?';
      c = (c << 6) | (*(const unsigned char *)p & 0x3F); p++;
    }
    return c;
  }

  static const kglyph * find(const kfont & f, uint32_t cp) {
    int lo = 0, hi = f.n - 1;
    while (lo <= hi) {
      int m = (lo + hi) / 2;
      if (f.g[m].cp == cp) return &f.g[m];
      if (f.g[m].cp < cp) lo = m + 1; else hi = m - 1;
    }
    return 0;
  }
  static const kglyph * glyph_or_fallback(const kfont & f, uint32_t cp) {
    const kglyph * g = find(f, cp);
    if (!g && cp == 0x2212) g = find(f, '-');   // signe moins
    if (!g && cp == 0x00A0) g = find(f, ' ');
    if (!g) g = find(f, '?');
    return g;
  }
  static inline int nibble(const kfont & f, const kglyph * g, int idx) {
    uint8_t b = f.data[g->off + (idx >> 1)];
    return (idx & 1) ? (b & 15) : (b >> 4);
  }

  int width(const char * s, const kfont & f) {
    int w = 0;
    for (const char * p = s; *p;) {
      uint32_t cp = utf8(p);
      if (f.cell) { w += f.cell; continue; }
      const kglyph * g = glyph_or_fallback(f, cp);
      if (g) w += g->adv;
    }
    return w;
  }

  // Dessine les glyphes de s dans une bande [sx, sx+sw) d'un tampon de hauteur f.height.
  static void raster(uint16_t * buf, int sx, int sw, const char * s, const kfont & f, uint16_t fg, uint16_t bg) {
    int H = f.height;
    for (int i = 0; i < sw * H; i++) buf[i] = bg;
    int pen = 0;
    for (const char * p = s; *p;) {
      uint32_t cp = utf8(p);
      const kglyph * g = glyph_or_fallback(f, cp);
      int adv = f.cell ? f.cell : (g ? g->adv : 0);
      if (g && g->w) {
        int gx = pen + g->xoff, gy = f.base + g->yoff;
        if (gx < sx + sw && gx + g->w > sx) {
          for (int j = 0; j < g->h; j++) {
            int yy = gy + j; if (yy < 0 || yy >= H) continue;
            for (int i = 0; i < g->w; i++) {
              int xx = gx + i - sx; if (xx < 0 || xx >= sw) continue;
              int a = nibble(f, g, j * g->w + i);
              if (a) buf[yy * sw + xx] = blend(buf[yy * sw + xx], fg, a);
            }
          }
        }
      }
      pen += adv;
      if (pen >= sx + sw + 24) break;
    }
  }

  int text(int x, int y, const char * s, const kfont & f, uint16_t fg, uint16_t bg, bool fake) {
    int W = width(s, f);
    if (fake || W <= 0) return x + W;
    const int STRIP = 32;
    uint16_t buf[STRIP * 32];
    int H = f.height > 32 ? 32 : f.height;
    for (int sx = 0; sx < W; sx += STRIP) {
      int sw = W - sx < STRIP ? W - sx : STRIP;
      raster(buf, sx, sw, s, f, fg, bg);
      kui_push_rect(x + sx, y, sw, H, buf);
    }
    return x + W;
  }

  int text_cells(int x, int y, const char * s, const kfont & f, uint16_t fg, uint16_t bg, bool fake) {
    int n = 0;
    for (const char * p = s; *p; n++) utf8(p);
    if (fake) return x + n * f.cell;
    // une cellule = un petit tampon ; on pousse les cellules par paquets de 4 pour limiter les appels
    uint16_t buf[4 * 10 * 18];
    const char * p = s;
    int cx = x;
    while (*p) {
      // jusqu'à 4 caractères
      const char * q = p; int k = 0;
      while (*q && k < 4) { utf8(q); k++; }
      char tmp[32]; int len = (int)(q - p); if (len > 31) len = 31;
      memcpy(tmp, p, len); tmp[len] = 0;
      int sw = k * f.cell;
      raster(buf, 0, sw, tmp, f, fg, bg);
      kui_push_rect(cx, y, sw, f.height, buf);
      cx += sw; p = q;
    }
    return cx;
  }

  int text_clip(int x, int y, const char * s, const kfont & f, uint16_t fg, uint16_t bg, int xmax) {
    if (x + width(s, f) <= xmax) return text(x, y, s, f, fg, bg);
    char tmp[128]; int n = 0;
    int ell = width("…", f);
    for (const char * p = s; *p && n < 120;) {
      const char * q = p; utf8(q);
      char save[8]; int l = (int)(q - p);
      memcpy(save, p, l); save[l] = 0;
      memcpy(tmp + n, p, l); tmp[n + l] = 0;
      if (x + width(tmp, f) + ell > xmax) { tmp[n] = 0; break; }
      n += l; p = q;
    }
    strcat(tmp, "…");
    return text(x, y, tmp, f, fg, bg);
  }

  int text_wrap(int x, int y, int w, const char * s, const kfont & f, uint16_t fg, uint16_t bg, int maxlines, int lineh) {
    if (!lineh) lineh = f.height;
    char line[160]; int n = 0, lines = 0;
    const char * p = s;
    while (*p && lines < maxlines) {
      // mot suivant (espaces inclus devant)
      const char * q = p; while (*q == ' ') q++;
      const char * e = q; while (*e && *e != ' ' && *e != '\n') e++;
      char cand[160]; int cl = n;
      memcpy(cand, line, n);
      int wl = (int)(e - p); if (cl + wl > 158) wl = 158 - cl;
      memcpy(cand + cl, n ? p : q, n ? wl : (int)(e - q)); cand[cl + (n ? wl : (int)(e - q))] = 0;
      if (n && width(cand, f) > w) {               // passe à la ligne
        line[n] = 0;
        bool last = lines == maxlines - 1;
        if (last) text_clip(x, y, (std::string(line) + " " + q).c_str(), f, fg, bg, x + w);
        else text(x, y, line, f, fg, bg);
        y += lineh; lines++; n = 0;
        if (last) return y;
        p = q; continue;
      }
      n = (int)strlen(cand); memcpy(line, cand, n);
      p = e;
      if (*p == '\n') { line[n] = 0; text(x, y, line, f, fg, bg); y += lineh; lines++; n = 0; p++; }
    }
    if (n && lines < maxlines) { line[n] = 0; text(x, y, line, f, fg, bg); y += lineh; }
    return y;
  }

  // ---------------------------------------------------------------- formes
  void fill(int x, int y, int w, int h, uint16_t c) { if (w > 0 && h > 0) kui_fill_rect(x, y, w, h, c); }
  void hline(int x, int y, int w, uint16_t c) { fill(x, y, w, 1, c); }
  void vline(int x, int y, int h, uint16_t c) { fill(x, y, 1, h, c); }

  static void shape(int x, int y, int w, int h, int r, uint16_t c, uint16_t bg) {
    if (w <= 0 || h <= 0) return;
    if (2 * r > h) r = h / 2;
    if (2 * r > w) r = w / 2;
    if (r <= 0) { fill(x, y, w, h, c); return; }
    fill(x, y + r, w, h - 2 * r, c);
    uint16_t * row = g_row;
    if (w > 320) w = 320;
    for (int j = 0; j < r; j++) {
      for (int i = 0; i < w; i++) {
        float cxp;
        if (i < r) cxp = (float)r; else if (i >= w - r) cxp = (float)(w - r); else { row[i] = c; continue; }
        float dx = (i + 0.5f) - cxp, dy = (j + 0.5f) - r;
        float d = sqrtf(dx * dx + dy * dy);
        float cov = r - d + 0.5f;
        int a = cov <= 0 ? 0 : cov >= 1 ? 15 : (int)(cov * 15 + 0.5f);
        row[i] = blend(bg, c, a);
      }
      kui_push_rect(x, y + j, w, 1, row);
      kui_push_rect(x, y + h - 1 - j, w, 1, row);
    }
  }

  void box(int x, int y, int w, int h, int r, uint16_t fillc, uint16_t border, uint16_t bg) {
    if (border == fillc) { shape(x, y, w, h, r, fillc, bg); return; }
    shape(x, y, w, h, r, border, bg);
    shape(x + 1, y + 1, w - 2, h - 2, r > 1 ? r - 1 : 0, fillc, border);
  }

  void seg(float x0, float y0, float x1, float y1, float w, uint16_t c, uint16_t bg) {
    float r = w * 0.5f + 1.0f;
    float fx0 = fminf(x0, x1) - r, fx1 = fmaxf(x0, x1) + r, fy0 = fminf(y0, y1) - r, fy1 = fmaxf(y0, y1) + r;
    if (fx1 < 0 || fy1 < 0 || fx0 > 320 || fy0 > 240) return;          // hors écran
    int bx0 = fx0 < 0 ? 0 : (int)floorf(fx0), bx1 = fx1 > 320 ? 320 : (int)ceilf(fx1);
    int by0 = fy0 < 0 ? 0 : (int)floorf(fy0), by1 = fy1 > 240 ? 240 : (int)ceilf(fy1);
    int bw = bx1 - bx0; if (bw <= 0) return;
    float dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy;
    uint16_t * row = g_row;
    static uint8_t al[320];
    (void)bg; // on mélange avec les pixels déjà à l'écran (jonctions de segments propres)
    for (int y = by0; y < by1; y++) {
      int i0 = -1, i1 = -1;
      for (int i = 0; i < bw; i++) {
        float px = bx0 + i + 0.5f, py = y + 0.5f;
        float t = L2 > 0 ? ((px - x0) * dx + (py - y0) * dy) / L2 : 0;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        float ex = x0 + t * dx - px, ey = y0 + t * dy - py;
        float d = sqrtf(ex * ex + ey * ey);
        float cov = w * 0.5f + 0.5f - d;
        int a = cov <= 0 ? 0 : cov >= 1 ? 15 : (int)(cov * 15 + 0.5f);
        al[i] = (uint8_t)a;
        if (a) { if (i0 < 0) i0 = i; i1 = i; }
      }
      if (i0 < 0) continue;
      int n = i1 - i0 + 1;
      kui_pull_rect(bx0 + i0, y, n, 1, row);
      for (int i = 0; i < n; i++) row[i] = blend(row[i], c, al[i0 + i]);
      kui_push_rect(bx0 + i0, y, n, 1, row);
    }
  }
  void arrow(float x0, float y0, float x1, float y1, uint16_t c, uint16_t bg) {
    seg(x0, y0, x1, y1, 1.6f, c, bg);
    float dx = x1 - x0, dy = y1 - y0, L = sqrtf(dx * dx + dy * dy);
    if (L < 1) return;
    dx /= L; dy /= L;
    const float len = 6.5f, ca = 0.866f, sa = 0.5f; // ±30°
    float ax = -dx * ca + dy * sa, ay = -dy * ca - dx * sa;
    float bx = -dx * ca - dy * sa, by = -dy * ca + dx * sa;
    seg(x1, y1, x1 + ax * len, y1 + ay * len, 1.6f, c, bg);
    seg(x1, y1, x1 + bx * len, y1 + by * len, 1.6f, c, bg);
  }
  void cupcap(float cx, float cy, bool up, uint16_t c, uint16_t bg) {
    const float r = 4.5f, hgt = 5.0f;
    float sgn = up ? 1.0f : -1.0f;
    // deux jambages verticaux + demi-cercle
    seg(cx - r, cy - sgn * hgt, cx - r, cy, 1.4f, c, bg);
    seg(cx + r, cy - sgn * hgt, cx + r, cy, 1.4f, c, bg);
    float px = cx - r, py = cy;
    for (int k = 1; k <= 8; k++) {
      float a = 3.14159265f * k / 8;
      float nx = cx - r * cosf(a), ny = cy + sgn * r * sinf(a);
      seg(px, py, nx, ny, 1.4f, c, bg);
      px = nx; py = ny;
    }
  }
  void hatch(int x, int y, int w, int h, uint16_t c, uint16_t bg) {
    uint16_t * row = g_row;
    if (w > 320) w = 320;
    for (int j = 0; j < h; j++) {
      for (int i = 0; i < w; i++) row[i] = ((i + j) % 6 == 0) ? c : bg;
      kui_push_rect(x, y + j, w, 1, row);
    }
  }

  // ---------------------------------------------------------------- composants
  static void key_colors(KeyType t, uint16_t & bgc, uint16_t & fg, uint16_t & br) {
    switch (t) {
      case KEY_SHIFT: bgc = SHIFT_SOFT; fg = SHIFT; br = SHIFT_SOFT; break;
      case KEY_ALPHA: bgc = ALPHA_SOFT; fg = ALPHA; br = ALPHA_SOFT; break;
      case KEY_PRIMARY: bgc = PRIMARY; fg = ON_ACCENT; br = PRIMARY; break;
      case KEY_DARK: bgc = TEXT; fg = SURFACE; br = TEXT; break;
      default: bgc = SURFACE2; fg = TEXT2; br = BORDER_STRONG; break;
    }
  }
  int keycap_width(const char * label) { int w = width(label, kf_ui_9sb) + 8; return w < 14 ? 14 : w; }
  int keycap(int x, int y, const char * label, KeyType t, uint16_t bg) {
    uint16_t bgc, fg, br; key_colors(t, bgc, fg, br);
    int w = keycap_width(label), h = 14;
    box(x, y, w, h, 4, bgc, br, bg);
    if (t == KEY_PLAIN) hline(x + 3, y + h - 1, w - 6, BORDER_STRONG); // relief bas
    int tw = width(label, kf_ui_9sb);
    // boîte de ligne 13 px, ligne de base 10 → centrée dans 14 px
    text(x + (w - tw) / 2, y + 1, label, kf_ui_9sb, fg, bgc);
    return x + w;
  }
  int chip(int x, int y, const char * label, bool sel, uint16_t bg) {
    int w = width(label, kf_ui_11m) + 14, h = 16;
    uint16_t c = sel ? TEXT : SURFACE2, fg = sel ? SURFACE : TEXT2;
    box(x, y, w, h, 8, c, c, bg);
    text(x + 7, y, label, kf_ui_11m, fg, c);
    return x + w;
  }

  // ---------------------------------------------------------------- barre d'état
  static char st_title[32] = "Calcul", st_sub[64] = "", st_interp[16] = "Xcas", st_angle[8] = "RAD", st_msg[96] = "";
  static void copy(char * d, const char * s, int n) { if (!s) s = ""; strncpy(d, s, n - 1); d[n - 1] = 0; }

  static int mini_chip(int xr, const char * label) { // aligné à droite sur xr, renvoie le nouveau bord gauche
    int w = width(label, kf_ui_9sb) + 8;
    int x = xr - w;
    box(x, 2, w, 13, 3, SURFACE2, SURFACE2, SURFACE);
    text(x + 4, 2, label, kf_ui_9sb, TEXT2, SURFACE2);
    return x;
  }

  void status_mode(const char * t) { copy(st_title, t, sizeof st_title); st_msg[0] = 0; status_redraw(); }

  void status_redraw() {
    fill(0, 0, 320, STATUS_H - 1, SURFACE);
    hline(0, STATUS_H - 1, 320, BORDER);
    // logo χ
    box(6, 2, 13, 13, 3, PRIMARY, PRIMARY, SURFACE);
    text(6 + (13 - width("χ", kf_math_11i)) / 2, 2, "χ", kf_math_11i, ON_ACCENT, PRIMARY);
    // partie droite
    int xr = 314;
    if (st_angle[0]) xr = mini_chip(xr, st_angle) - 4;
    if (st_interp[0]) xr = mini_chip(xr, st_interp) - 6;
    // titre + sous-titre (ou message)
    int x = text(25, 1, st_title, kf_ui_11m, TEXT, SURFACE);
    const char * sub = st_msg[0] ? st_msg : st_sub;
    if (sub[0]) text_clip(x + 5, 2, sub, kf_ui_10, st_msg[0] ? PRIMARY : TEXT3, SURFACE, xr - 2);
  }
  void status(const char * title, const char * subtitle, const char * interp, const char * angle) {
    copy(st_title, title, sizeof st_title); copy(st_sub, subtitle, sizeof st_sub);
    copy(st_interp, interp, sizeof st_interp); copy(st_angle, angle, sizeof st_angle);
    st_msg[0] = 0;
    status_redraw();
  }
  void status_message(const char * msg) {
    // le mode courant devient le titre (éditeur, graphe, afficheur 2D)
    if (!msg) msg = "";
    if (strncmp(msg, "edit ", 5) == 0) { copy(st_title, "Script", sizeof st_title); msg += 5; }
    else if (strncmp(msg, "tabl ", 5) == 0) { copy(st_title, "Tableur", sizeof st_title); msg += 5; }
    else if (strcmp(msg, "Graphe") == 0 || strcmp(msg, "Graph") == 0) { copy(st_title, msg, sizeof st_title); msg = ""; }
    else if (strncmp(msg, "EXE: quit", 9) == 0) { copy(st_title, "Afficheur 2D", sizeof st_title); msg = "EXE : quitter → last"; }
    copy(st_msg, msg, sizeof st_msg);
    status_redraw();
  }

  // ---------------------------------------------------------------- barres du bas
  static void bar_bg() {
    fill(0, SOFTBAR_Y, 320, SOFTBAR_H, SURFACE);
    hline(0, SOFTBAR_Y, 320, BORDER);
  }
  void softkeys(const char * const keys[6], const char * const labels[6], bool shift) {
    bar_bg();
    for (int i = 0; i < 6; i++) {
      if (!labels[i] || !labels[i][0]) continue;
      int x0 = i * 320 / 6, x1 = (i + 1) * 320 / 6;
      int kw = keycap_width(keys[i]);
      int lw = width(labels[i], kf_ui_9sb);
      int tot = kw + 2 + lw, avail = x1 - x0;
      int x = x0 + (tot < avail ? (avail - tot) / 2 : 0);
      x = keycap(x, SOFTBAR_Y + 5, keys[i], shift ? KEY_SHIFT : KEY_PLAIN, SURFACE);
      text_clip(x + 2, SOFTBAR_Y + 6, labels[i], kf_ui_9sb, shift ? TEXT : TEXT2, SURFACE, x1 + 1);
    }
  }
  void hints(const char * const keys[4], const char * const labels[4], const KeyType types[4]) {
    bar_bg();
    int x = 8;
    for (int i = 0; i < 2; i++) {
      if (!labels[i]) continue;
      x = keycap(x, SOFTBAR_Y + 5, keys[i], types ? types[i] : KEY_PLAIN, SURFACE);
      x = text(x + 4, SOFTBAR_Y + 5, labels[i], kf_ui_10, TEXT2, SURFACE) + 12;
    }
    int xr = 312;
    for (int i = 3; i >= 2; i--) {
      if (!labels[i]) continue;
      int w = keycap_width(keys[i]) + 4 + width(labels[i], kf_ui_10);
      int xx = xr - w;
      xx = keycap(xx, SOFTBAR_Y + 5, keys[i], types ? types[i] : KEY_PLAIN, SURFACE);
      text(xx + 4, SOFTBAR_Y + 5, labels[i], kf_ui_10, TEXT2, SURFACE);
      xr -= w + 12;
    }
  }

  const char * friendly(const char * s) {
    static const char * const map[][2] = {
      {"algb", "Algèbre"}, {"calc", "Calcul"}, {"plot", "Tracer"}, {"plt", "Tracer"}, {"edt", "Éditer"}, {"edit", "Éditer"},
      {"2d", "2D"}, {"regr", "Régr."}, {"reg", "Régr."}, {"logo", "Tortue"}, {"tortue", "Tortue"}, {"lin", "Linéaire"},
      {"linalg", "Linalg"}, {"matr", "Matrice"}, {"arit", "Arith."}, {"cplx", "Complexe"}, {"rand", "Hasard"},
      {"c&rand", "Hasard"}, {"misc", "Divers"}, {"math", "Maths"}, {"test", "Test"}, {"loop", "Boucle"},
      {"undo", "Annuler"}, {"+-", "±"}, {"list", "Listes"}, {"real", "Réels"}, {"prog", "Prog."}, {"poly", "Polyn."},
      {"geo", "Géom."}, {"color", "Couleur"}, {"numpy", "NumPy"}, {"draw", "Dessin"}, {"approx", "Approx."},
      {"stat1d", "Stat 1D"}, {"seq", "Suites"}, {"view", "Vue"}, {"graph", "Graphe"}, {"R", "R"}, {"menu", "Menu"},
    };
    for (unsigned i = 0; i < sizeof(map) / sizeof(map[0]); i++) if (strcmp(map[i][0], s) == 0) return map[i][1];
    return s;
  }

  static const char * const * mh_k = 0, * const * mh_l = 0;
  void menu_hints(const char * const k[4], const char * const l[4]) { mh_k = k; mh_l = l; }
  bool take_menu_hints(const char * const *& k, const char * const *& l) {
    if (!mh_k) return false;
    k = mh_k; l = mh_l; mh_k = mh_l = 0; return true;
  }

  static char last_bar[128] = "";
  void softkeys_redraw(bool shift) { if (last_bar[0]) softkeys_from_legacy(last_bar, shift); }

  void dim(int x, int y, int w, int h) {
    uint16_t * row = g_row;
    if (w > 320) w = 320;
    for (int j = 0; j < h; j++) {
      kui_pull_rect(x, y + j, w, 1, row);
      for (int i = 0; i < w; i++) row[i] = blend(row[i], TEXT, 5);
      kui_push_rect(x, y + j, w, 1, row);
    }
  }

  const char * describe(const char * cmd) {
    char k[24]; int n = 0;
    for (const char * p = cmd; *p && n < 23; p++) if (*p != '(' && *p != ' ') k[n++] = *p;
    k[n] = 0;
    static const char * const d[][2] = {
      {"simplify", "Simplifier"}, {"factor", "Factoriser"}, {"partfrac", "Éléments simples"}, {"tcollect", "Linéariser (trigo)"},
      {"texpand", "Développer (trigo)"}, {"expand", "Développer"}, {"normal", "Forme normale"}, {"sum", "Somme"}, {"oo", "Infini"}, {"product", "Produit"},
      {"'", "Dérivée (prime)"}, {"diff", "Dériver"}, {"integrate", "Intégrer"}, {"limit", "Limite"}, {"series", "Développement"},
      {"taylor", "Taylor"}, {"solve", "Résoudre"}, {"desolve", "Équation diff."}, {"rsolve", "Récurrence"},
      {"plot", "Courbe"}, {"plotseq", "Suite (toile)"}, {"plotlist", "Points"}, {"plotparam", "Paramétrique"}, {"plotpolar", "Polaire"},
      {"plotfield", "Champ de vecteurs"}, {"histogram", "Histogramme"}, {"barplot", "Barres"}, {"scatterplot", "Nuage de points"},
      {"linear_regression_plot", "Rég. linéaire"}, {"logarithmic_regression_plot", "Rég. logarithmique"}, {"exponential_regression_plot", "Rég. exponentielle"},
      {"power_regression_plot", "Rég. puissance"}, {"polynomial_regression_plot", "Rég. polynomiale"}, {"sin_regression_plot", "Rég. sinusoïdale"},
      {"matrix", "Matrice"}, {"det", "Déterminant"}, {"matpow", "Puissance"}, {"ranm", "Matrice aléatoire"}, {"rref", "Échelonner"},
      {"tran", "Transposée"}, {"egvl", "Valeurs propres"}, {"egv", "Vecteurs propres"}, {"abs", "Module"}, {"arg", "Argument"},
      {"re", "Partie réelle"}, {"im", "Partie imaginaire"}, {"conj", "Conjugué"}, {"csolve", "Résoudre dans C"}, {"cfactor", "Factoriser dans C"},
      {"cpartfrac", "Él. simples dans C"}, {"mod", "Modulo"}, {"irem", "Reste"}, {"ifactor", "Facteurs premiers"}, {"gcd", "PGCD"},
      {"lcm", "PPCM"}, {"isprime", "Est premier ?"}, {"nextprime", "Premier suivant"}, {"powmod", "Puissance mod."}, {"iegcd", "Bézout"},
      {"proot", "Racines"}, {"pcoeff", "Coefficients"}, {"quo", "Quotient"}, {"rem", "Reste"}, {"egcd", "Bézout"}, {"resultant", "Résultant"},
      {"GF", "Corps fini"}, {"makelist", "Liste"}, {"range", "Intervalle"}, {"seq", "Séquence"}, {"len", "Longueur"}, {"append", "Ajouter"},
      {"ranv", "Vecteur aléatoire"}, {"sort", "Trier"}, {"apply", "Appliquer"}, {"exact", "Valeur exacte"}, {"approx", "Valeur approchée"},
      {"floor", "Partie entière"}, {"ceil", "Arrondi sup."}, {"round", "Arrondi"}, {"sign", "Signe"}, {"max", "Maximum"}, {"min", "Minimum"},
      {"rand", "Aléatoire"}, {"binomial", "Loi binomiale"}, {"normald", "Loi normale"}, {"exponentiald", "Loi exponentielle"},
      {"periodic_table", "Table périodique"}, {"point", "Point"}, {"line", "Droite"}, {"circle", "Cercle"}, {"plane", "Plan"},
      {"print", "Afficher"}, {"input", "Saisir"}, {"debug", "Déboguer"}, {"python", "Traduire en Python"}, {"hexprint", "Hexadécimal"},
      {"binprint", "Binaire"}, {"f(x):=", "Définir f"}, {"and", "Et"}, {"or", "Ou"}, {"color=", "Couleur"},
    };
    for (unsigned i = 0; i < sizeof(d) / sizeof(d[0]); i++) if (strcmp(d[i][0], k) == 0) return d[i][1];
    return 0;
  }

  void softkeys_from_legacy(const char * menu, bool shift) {
    if (menu != last_bar) { strncpy(last_bar, menu, sizeof last_bar - 1); last_bar[sizeof last_bar - 1] = 0; }
    static char keys[6][4], labs[6][16];
    const char * K[6] = {0, 0, 0, 0, 0, 0}; const char * L[6] = {0, 0, 0, 0, 0, 0};
    const char * p = menu;
    if (strncmp(p, "shift-", 6) == 0) p += 6;
    int n = 0;
    while (*p && n < 6) {
      const char * e = strchr(p, '|'); if (!e) e = p + strlen(p);
      // jeton « N libellé »
      const char * q = p; while (q < e && *q == ' ') q++;
      int kl = 0; while (q < e && *q != ' ' && kl < 3) keys[n][kl++] = *q++;
      keys[n][kl] = 0;
      if (kl > 1 && keys[n][0] >= '0' && keys[n][0] <= '9') { // « 9arit » : chiffre collé
        strncpy(labs[n], keys[n] + 1, 15); keys[n][1] = 0;
      } else labs[n][0] = 0;
      while (q < e && *q == ' ') q++;
      char raw[16]; int rl = 0; while (q < e && rl < 15) raw[rl++] = *q++;
      while (rl && raw[rl - 1] == ' ') rl--;
      raw[rl] = 0;
      if (raw[0]) strncpy(labs[n], friendly(raw), 15);
      labs[n][15] = 0;
      K[n] = keys[n]; L[n] = labs[n][0] ? labs[n] : 0;
      n++;
      p = *e ? e + 1 : e;
    }
    softkeys(K, L, shift);
  }
}
