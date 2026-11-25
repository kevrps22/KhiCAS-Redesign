#!/usr/bin/env bash
# Recompile KhiCAS (giac + kui) pour le simulateur Linux et relie Upsilon.
set -e
cd "$(dirname "$0")/.."
ROOT=$PWD
K=$ROOT/Upsilon-External/apps/KhiCAS/src
G=$K/giac-1.6.0/src
A=$ROOT/Upsilon/apps/external/app
if [ ! -f "$G/kfonts.h" ] || [ tools/fontgen.py -nt "$G/kfonts.h" ]; then python3 tools/fontgen.py "$G/kfonts.h"; fi
make -s -C "$G" -f Makefile.numworks.simulator -j"$(nproc)" \
  CXX="g++ -I$ROOT/hostdeps/inst/include -std=gnu++14 -fpermissive -w" simu/libgiac.a
cp "$G/simu/libgiac.a" "$A/libgiac_simulator.a"
cp "$K/main.cpp" "$G/kui.h" "$A/"
make -s -C Upsilon PLATFORM=simulator -j"$(nproc)" > "$ROOT/tools/.build.log" 2>&1 || { grep -E "error|undefined" "$ROOT/tools/.build.log" | head -30; exit 1; }
echo "simulateur prêt : Upsilon/output/release/simulator/linux/epsilon.bin"
