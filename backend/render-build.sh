#!/usr/bin/env bash
# exit on error
set -o errexit

# Instalar dependencias de Node.js
npm install

# Instalar yt-dlp
pip install yt-dlp

# Configurar Node.js como runtime para yt-dlp
export PATH=$PATH:/usr/bin

# Verificar instalación
yt-dlp --version
node --version