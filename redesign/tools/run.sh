#!/usr/bin/env bash
# Lance le simulateur Upsilon avec KhiCAS (fenêtre + clavier cliquable).
cd "$(dirname "$0")/.."
exec ./Upsilon/output/release/simulator/linux/epsilon.bin "$@"
