#!/bin/bash
echo "Instalando dependencias..."

# Actualizar apt
sudo apt-get update

# Instalar Python3 para yt-dlp
sudo apt-get install -y python3 python3-pip

# Instalar FFmpeg
sudo apt-get install -y ffmpeg

# Descargar yt-dlp
echo "Descargando yt-dlp"
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp

# Verificar instalación
echo "Verificando instalacion"
python3 --version || echo "Python3 no disponible"
ffmpeg -version || echo "FFmpeg no disponible"
yt-dlp --version || echo "yt-dlp no disponible"

echo "Instalación completada"

# Instalar dependencias de Node
npm install