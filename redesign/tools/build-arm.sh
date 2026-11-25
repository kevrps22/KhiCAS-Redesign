#!/usr/bin/env bash
# Compile KhiCAS (avec le redesign) pour la calculatrice NumWorks (Cortex-M7) et produit apps.tar.
# Étapes reprises : une bibliothèque déjà construite (src/lib/*.a) n'est pas recompilée.
#   tools/build-arm.sh            → tout
#   tools/build-arm.sh giac       → force la recompilation de giac (après une modif de l'interface)
set -e
cd "$(dirname "$0")/.."
ROOT=$PWD
EXT=$ROOT/Upsilon-External
K=$EXT/apps/KhiCAS
S=$K/src
LOG=$ROOT/tools/arm-logs; mkdir -p "$LOG"
J=$(nproc)
CF="-Os -fdata-sections -ffunction-sections -DNDEBUG -mthumb -march=armv7e-m -mfloat-abi=hard -mcpu=cortex-m7 -mfpu=fpv5-sp-d16 -fno-strict-aliasing --specs=nosys.specs -std=gnu17 -Wno-error"
mkdir -p "$S/lib" "$S/include"
step() { echo "==> $1"; }

if [ ! -f "$S/lib/libgmp.a" ]; then
  step "gmp"
  ( cd "$S/gmp-6.2.1" && ./configure --host=arm-none-eabi --disable-assembly --disable-shared CFLAGS="$CF" && make -j"$J" ) > "$LOG/gmp.log" 2>&1
  cp "$S/gmp-6.2.1/.libs/libgmp.a" "$S/lib/" && cp "$S/gmp-6.2.1/gmp.h" "$S/include/"
fi

if [ ! -f "$S/lib/libmpfr.a" ]; then
  step "mpfr"
  ( cd "$S/mpfr-4.1.0" && autoreconf -fi && ./configure --with-gmp="$S" --host=arm-none-eabi --disable-shared CFLAGS="$CF" && make -j"$J" ) > "$LOG/mpfr.log" 2>&1
  cp "$S/mpfr-4.1.0/src/.libs/libmpfr.a" "$S/lib/" && cp "$S/mpfr-4.1.0/src/mpfr.h" "$S/include/"
fi

if [ ! -f "$S/lib/libmpfi.a" ]; then
  step "mpfi"
  ( cd "$S/mpfi-1.5.4" && autoreconf -fi && ./configure --with-mpfr="$S" --with-gmp="$S" --host=arm-none-eabi --disable-shared CFLAGS="$CF -Wno-incompatible-pointer-types" && make -j"$J" -C src ) > "$LOG/mpfi.log" 2>&1
  cp "$S/mpfi-1.5.4/src/.libs/libmpfi.a" "$S/lib/" && cp "$S/mpfi-1.5.4/src/mpfi.h" "$S/include/"
fi

if [ ! -f "$S/lib/libmicropy.a" ]; then
  step "MicroPython"
  sed -i 's/\$(CC) \$(CFLAGS)/\$(CC) \$(CFLAGS) -Wno-error/g' "$S/micropython-1.12/py/mkrules.mk" || true
  ( cd "$S/micropython-1.12/numworks" && bash ./mklib ) > "$LOG/micropython.log" 2>&1
fi

if [ ! -f "$S/lib/libgiac.a" ] || [ "$1" = "giac" ]; then
  step "giac (long)"
  ( cd "$S/giac-1.6.0/src" && python3 "$ROOT/tools/fontgen.py" kfonts.h && make -f Makefile.numworks.n0110 -j"$J" libgiac.a ) > "$LOG/giac.log" 2>&1
  cp "$S/giac-1.6.0/src/libgiac.a" "$S/lib/"
fi

step "api + app.elf"
make -C "$EXT/api" > "$LOG/app.log" 2>&1
APPCF="-DNDEBUG -I$EXT/api -I$S/giac-1.6.0/src -Os -mcpu=cortex-m7 -mthumb -mfpu=fpv5-sp-d16 -mfloat-abi=hard -fno-common -fdata-sections -ffunction-sections -fno-exceptions -fno-strict-aliasing"
arm-none-eabi-g++ $APPCF -fno-threadsafe-statics -c "$S/main.cpp" -o "$S/main.o" >> "$LOG/app.log" 2>&1
arm-none-eabi-gcc $APPCF -c "$S/libc_stubs.c" -o "$S/libc_stubs.o" >> "$LOG/app.log" 2>&1
# édition de liens partielle (-Ur) : le placement final en flash est fait par tool/archive
arm-none-eabi-gcc "$S/main.o" "$S/libc_stubs.o" "$S/lib/libgiac.a" "$S/lib/libmpfi.a" "$S/lib/libmpfr.a" "$S/lib/libgmp.a" "$S/lib/libmicropy.a" \
  -o "$K/app.elf" $APPCF -Wl,-L"$EXT/api" -Wl,--gc-sections -Wl,--entry=entrypoint --specs=nano.specs -nostartfiles -Wl,-Ur \
  -lc -lstdc++ -lm -lapi -lnosys >> "$LOG/app.log" 2>&1
# retire symboles et infos de débogage inutiles (27 Mo → 12 Mo), sans changer le binaire installé
arm-none-eabi-strip --strip-unneeded "$K/app.elf"
if arm-none-eabi-nm -u "$K/app.elf" | grep " U " | grep -vqE "_section_|exidx|init_array"; then
  echo "symboles non résolus :"; arm-none-eabi-nm -u "$K/app.elf" | grep " U " | grep -vE "_section_|exidx|init_array"; exit 1
fi

step "app.elf pré-placé (< 6 Mo)"
# L'installeur web relie app.elf à l'adresse de sa position dans l'archive ; KhiCAS y est
# toujours en premier (index.js). On le relie donc nous-mêmes à la position 0, puis on
# emballe le binaire dans un ELF minimal sans relocations : 5,3 Mo au lieu de 12.
cp "$K/app.elf" "$K/app-reloc.elf"
sed "s/+ (0)/+ (0)/" "$EXT/apps/external.ld" > "$LOG/t0.ld"
arm-none-eabi-ld "$K/app-reloc.elf" -o "$LOG/pos0.elf" -T"$LOG/t0.ld" >> "$LOG/app.log" 2>&1
arm-none-eabi-objcopy -O binary "$LOG/pos0.elf" "$LOG/KhiCAS.bin"
( cd "$LOG" && arm-none-eabi-objcopy -I binary -O elf32-littlearm -B arm \
    --rename-section .data=.entrypoint,alloc,load,readonly,contents,code KhiCAS.bin pre.elf && arm-none-eabi-strip --strip-all pre.elf )
cp "$LOG/pre.elf" "$K/app.elf"
ls -la "$K/app.elf"

step "apps.tar"
( cd "$EXT" && ./tool/archive "$ROOT/apps.tar" KhiCAS ) >> "$LOG/app.log" 2>&1
# contrôle de la RAM statique (limite 16 Ko pour une app externe)
sed "s/+ (0)/+ (0)/" "$EXT/apps/external.ld" > "$LOG/t.ld"
arm-none-eabi-ld "$K/app-reloc.elf" -o "$LOG/linked.elf" -T"$LOG/t.ld" 2>/dev/null
RAM=$(arm-none-eabi-size -A "$LOG/linked.elf" | awk '$1==".data"||$1==".bss"{s+=$2} END{print s}')
echo "RAM statique : $RAM / 16384 octets"
[ "$RAM" -lt 16384 ] || { echo "ERREUR : RAM statique dépassée"; exit 1; }
ls -la "$ROOT/apps.tar"
echo "OK : $ROOT/apps.tar"
