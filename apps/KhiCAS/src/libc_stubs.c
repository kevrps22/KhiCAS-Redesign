/* Fonctions référencées par la libstdc++ / newlib récentes (GCC >= 14) mais absentes de
 * newlib-nano. KhiCAS n'utilise ni flux de caractères larges, ni chemins, ni entropie.
 * Fichier C volontairement sans en-têtes : getwc/putwc sont des macros dans <wchar.h>. */
typedef __SIZE_TYPE__ size_t;
#define K_WEOF 0xffffffffu
unsigned int getwc(void * f) { (void)f; return K_WEOF; }
unsigned int putwc(int c, void * f) { (void)c; (void)f; return K_WEOF; }
unsigned int ungetwc(unsigned int c, void * f) { (void)c; (void)f; return K_WEOF; }
int swprintf(void * s, size_t n, const void * fmt, ...) { (void)s; (void)n; (void)fmt; return -1; }
char * realpath(const char * p, char * r) { (void)p; (void)r; return 0; }
int _getentropy(void * b, size_t n) { (void)b; (void)n; return -1; }
