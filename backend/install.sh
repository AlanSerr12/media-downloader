#!/bin/bash
echo "Instalando dependencias..."

# Actualizar apt
apt-get update

# Instalar Python3 para yt-dlp
apt-get install -y python3 python3-pip

# Instalar FFmpeg
apt-get install -y ffmpeg

# Descargar yt-dlp
echo "Descargando yt-dlp"
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
chmod a+rx /usr/local/bin/yt-dlp

# Verificar instalación
echo "Verificando instalacion"
python3 --version
ffmpeg -version
yt-dlp --version

echo "Instalación completada"

# Instalar dependencias de Node
npm install