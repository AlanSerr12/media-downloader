#!/usr/bin/env bash
# exit on error
set -o errexit

# Instalar dependencias de Node.js
npm install

# Instalar yt-dlp
pip install yt-dlp

# Verificar instalación
yt-dlp --version