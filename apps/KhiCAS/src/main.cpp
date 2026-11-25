#include <extapp_api.h>
#include <cstring>
#include "kui.h"

#ifndef SIMULATOR
namespace Ion {
namespace Timing {
uint64_t millis() {
  return extapp_millis();
}
}
}

extern "C" const char * mp_hal_input(const char * prompt) {
  return 0;
}

#endif

extern "C" {

int ext_main();
void extapp_main() {
  kui::fill(0, 0, 320, 240, kui::SURFACE);
  kui::status("KhiCAS", "", "", ""); // barre d'état dès le démarrage
  ext_main();
}

uint64_t millis() {
  return extapp_millis();
}

int os_file_browser(const char ** filenames, int maxrecords, const char * extension,int storage) {
  int n = extapp_fileListWithExtension(filenames, maxrecords, extension, storage);
  filenames[n] = 0;
  return n;
}

bool file_exists(const char * filename) {
  return extapp_fileExists(filename, EXTAPP_BOTH_FILE_SYSTEM);
}

bool erase_file(const char * filename){
  return extapp_fileErase(filename, EXTAPP_RAM_FILE_SYSTEM);
}

  void console_output(const char * s,int l);
const char * read_file(const char * filename){
  const char * ptr = extapp_fileRead(filename, NULL, EXTAPP_RAM_FILE_SYSTEM);
  if (0 && ptr && ( (unsigned char) *ptr<0x20) ) {
    // extapp_fileRead in scriptstore now always skips 1st byte
    // console_output("scriptstore\n",12); console_output(ptr,8);
    // script from scriptstore
    return ptr + 1;
  }
  //if (ptr){ console_output("scriptstore ",12); console_output(ptr,8); console_output("\n",1); return ptr;}
  if (!ptr)
    ptr=extapp_fileRead(filename, NULL, EXTAPP_FLASH_FILE_SYSTEM);
  //if (ptr){ console_output("flash ",6); console_output(ptr,8); console_output("\n",1); }
  return ptr;
}

bool write_file(const char * filename, const char * content, size_t len) {
  if(len) {
    return extapp_fileWrite(filename, content, len, EXTAPP_RAM_FILE_SYSTEM);
  } else {
    return extapp_fileWrite(filename, content, strlen(content) + 1, EXTAPP_RAM_FILE_SYSTEM);
  }
}

// Redesign : le texte de KhiCAS passe par les polices anti-aliasées de kui
// (JetBrains Mono en cellules 10×18 et 7×14, mêmes métriques que les polices système)
// et ses couleurs historiques sont converties vers le thème.
int numworks_draw_string(int x, int y, int c, int bg, const char * text, bool fake) {
  return kui::text_cells(x, y + 18, text, kf_mono_l, kui::remap_text(c), kui::remap_text(bg), fake);
}

int numworks_draw_string_small(int x, int y, int c, int bg, const char * text, bool fake) {
  return kui::text_cells(x, y + 18, text, kf_mono_s, kui::remap_text(c), kui::remap_text(bg), fake);
}

// Primitives kui en coordonnées écran absolues (320 × 240), avec rognage
void kui_fill_rect(int x, int y, int w, int h, uint16_t c) {
  if (x < 0) { w += x; x = 0; }
  if (y < 0) { h += y; y = 0; }
  if (x + w > LCD_WIDTH) w = LCD_WIDTH - x;
  if (y + h > LCD_HEIGHT) h = LCD_HEIGHT - y;
  if (w <= 0 || h <= 0) return;
  extapp_pushRectUniform(x, y, w, h, c);
}

void kui_push_rect(int x, int y, int w, int h, const uint16_t * px) {
  if (w <= 0 || h <= 0) return;
  if (x >= 0 && y >= 0 && x + w <= LCD_WIDTH && y + h <= LCD_HEIGHT) {
    extapp_pushRect(x, y, w, h, px);
    return;
  }
  int x0 = x < 0 ? -x : 0, x1 = x + w > LCD_WIDTH ? LCD_WIDTH - x : w;
  if (x1 <= x0) return;
  for (int j = 0; j < h; j++) {
    int yy = y + j;
    if (yy < 0 || yy >= LCD_HEIGHT) continue;
    extapp_pushRect(x + x0, yy, x1 - x0, 1, px + j * w + x0);
  }
}

void kui_pull_rect(int x, int y, int w, int h, uint16_t * px) {
  extapp_pullRect(x, y, w, h, px);
}

bool kui_shift_active() { return false; } // pas exposé par l'API des apps externes
bool kui_alpha_active() { return false; }

bool waitforvblank() {
  return extapp_waitForVBlank();
}

void numworks_set_pixel(int x, int y, int color) {
  if (x<0 || x>=LCD_WIDTH || y<0 || y>=LCD_HEIGHT-18)
    return;
  extapp_pushRectUniform(x, y + 18, 1, 1, color);
}

void numworks_fill_rect(int x, int y, int w, int h, int c) {
  if (x<0) {
    w += x;
    x=0;
  }
  if (y<0) {
    h += y;
    y=0;
  }
  if (h+y>=LCD_HEIGHT-18)
    h=LCD_HEIGHT-18-y;
  if (x+w>=LCD_WIDTH)
    w=LCD_WIDTH-x;
  if (h<=0 || w<=0)
    return;
  if (c == 57083) c = kui::PRIMARY_SOFT; // fond de sélection historique (color_gris) → thème
  extapp_pushRectUniform(x, y + 18, w, h, c);
}

int numworks_get_pixel(int x, int y) {
  uint16_t color;
  extapp_pullRect(x, y, 1, 1, &color);
  return color;
}

void numworks_wait_1ms(int ms) {
  for (int i=0; i<ms/128; ++i) {
#ifdef SIMULATOR
    extapp_msleep(0);
#endif
    uint64_t scan = extapp_scanKeyboard();
    if (scan & SCANCODE_Back) {
      return;
    }
    extapp_msleep(128);
  }
  extapp_msleep(ms % 128);
}

static bool interruptible = true;

bool back_key_pressed() {
  static int c = 0;

  ++c;
  if (!interruptible || c%1024 != 0) {
    return false;
  } else {
    #ifdef SIMULATOR
    extapp_msleep(0);
    #endif
    return extapp_scanKeyboard() & SCANCODE_Back;
  }
}

void enable_back_interrupt() {
  interruptible = true;
}

void disable_back_interrupt() {
  interruptible = false;
}

bool os_set_angle_unit(int mode) {
  return false;
}

int os_get_angle_unit() {
  return 0;
}

void numworks_hide_graph() {
}

void numworks_show_graph() {
}

void statuslinemsg(const char * msg) {
  kui::status_message(msg);
}

void statusline(int mode, size_t heap) {
}

void lock_alpha() {
  extapp_lockAlpha();
}

void reset_kbd() {
  extapp_resetKeyboard();
}

static bool alphawasactive_ = false;
bool alphawasactive () {
  return alphawasactive_;
}

int getkey(int allow_suspend) {
  int k = extapp_getKey(allow_suspend, &alphawasactive_);
  // le système redessine sa barre de titre pendant getKey : on remet la nôtre
  kui::status_redraw();
  return k;
}


bool iskeydown(int key) {
  return extapp_isKeydown(key);
}

void GetKey(int * key) {
  *key = getkey(true);
}

bool inexammode(){
#ifdef SIMULATOR
  return false; // API du simulateur Upsilon : extapp_inExamMode
#else
  return extapp_inexammode();
#endif
}

} // end extern "C"

#ifdef SIMULATOR
// Symboles fournis par le firmware sur la calculatrice, absents du simulateur.
// « shutdown » doit être une variable : sinon elle se résout sur shutdown() de la libc.
extern "C" { short exam_mode = 0; short int shutdown_state = 0; int (*shutdown)() = 0; }
#endif
