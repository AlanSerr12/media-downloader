# 🎥 Media Downloader

Aplicación web educativa para descargar videos y audio de YouTube utilizando yt-dlp.

![Media Downloader](./screenshots/Prueba1.png)

## ⚠️ Aviso Legal

Esta aplicación es **solo para fines educativos**. Solo descarga contenido del cual tengas derechos o que sea de dominio público. El usuario es responsable del uso que le dé al contenido descargado.

## ⚙️ Limitaciones

- **Demo en producción no disponible**: YouTube bloquea descargas desde servidores cloud. La aplicación funciona perfectamente en localhost.
- **FFmpeg requerido para MP3**: Sin FFmpeg, el audio se descarga en formato WEBM.

## ✨ Características

- ✅ Descarga videos en formato MP4
- ✅ Descarga audio en formato WEBM/MP3
- ✅ Vista previa con thumbnail, título y duración
- ✅ Interfaz moderna y responsive
- ✅ Múltiples calidades disponibles

## 🛠️ Tecnologías

### Frontend
- React 18
- Vite
- Axios
- Lucide React (iconos)

### Backend
- Node.js
- Express
- yt-dlp
- FFmpeg (opcional para MP3)

## 📦 Instalación Local

### Requisitos previos

- Node.js 18+ 
- yt-dlp instalado ([Instrucciones](https://github.com/yt-dlp/yt-dlp#installation))
- FFmpeg (opcional, para conversión a MP3)

### Backend
```bash
cd backend
npm install
npm run dev
```

El backend correrá en `http://localhost:4000`

### Frontend
```bash
cd frontend
npm install
npm run dev
```

El frontend correrá en `http://localhost:5173`

### Configuración

Crea un archivo `.env` en `backend/`:
```env
PORT=4000
NODE_ENV=development
```

## 🚀 Uso

1. Abre el frontend en tu navegador
2. Pega la URL de un video de YouTube
3. Click en "Obtener Información"
4. Selecciona formato (Video o Audio)
5. Click en "Descargar"

## 📸 Screenshots

### Vista principal
![Vista principal](./screenshots/Prueba2.png)

### Descarga en progreso
![Descarga](./screenshots/Prueba3.png)

## 🏗️ Estructura del Proyecto
```
media-downloader/
├── frontend/           # React + Vite
│   ├── src/
│   │   ├── App.jsx    # Componente principal
│   │   └── App.css    # Estilos
│   └── package.json
├── backend/            # Node.js + Express
│   ├── server.js      # Servidor principal
│   ├── temp/          # Archivos temporales
│   └── package.json
└── README.md
```

## 🔧 Troubleshooting

### Error: "yt-dlp not found"

Instala yt-dlp:

**Windows:**
```bash
winget install yt-dlp
```

**Mac/Linux:**
```bash
brew install yt-dlp
```

### Error: "ffmpeg not found"

Instala FFmpeg:

**Windows:**
```bash
winget install ffmpeg
```

**Mac:**
```bash
brew install ffmpeg
```

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Autor

**Alan Serrano**

- Portfolio: [alandevjr.vercel.app](https://alandevjr.vercel.app)
- GitHub: [@AlanSerr12](https://github.com/AlanSerr12)

## 🙏 Agradecimientos

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - Herramienta de descarga
- [React](https://react.dev/) - Framework frontend
- [Express](https://expressjs.com/) - Framework backend

---

⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub