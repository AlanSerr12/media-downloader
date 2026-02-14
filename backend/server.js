import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

dotenv.config();

const execPromise = promisify(exec);
const app = express();
const PORT = process.env.PORT || 4000;

// CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ success: true, message: 'Media downloader API' });
});

// Obtener info del video
app.post('/api/video-info', async (req, res) => {
    try {
        const { url } = req.body;
        
        console.log('Request recibido:', url);
        
        if (!url) {
            return res.status(400).json({
                success: false,
                message: 'URL is required'
            });
        }

        if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
            return res.status(400).json({
                success: false,
                message: 'Invalid YouTube URL'
            });
        }

        console.log('Obteniendo info...');

        // Limpiar URL
        const cleanUrl = url.split('&')[0];
        console.log('URL:', cleanUrl);

        // Usar yt-dlp con timeout
        const command = `yt-dlp -J "${cleanUrl}"`;
        console.log('Ejecutando:', command);

        const { stdout, stderr } = await execPromise(command, {
            timeout: 30000, // 30 segundos timeout
            maxBuffer: 1024 * 1024 * 10 // 10MB buffer
        });

        if (stderr) {
            console.log('Warnings:', stderr);
        }

        console.log('Respuesta recibida, parseando...');
        const info = JSON.parse(stdout);
        console.log('Info obtenida:', info.title);

        // Extraer formatos de video
        const videoFormats = info.formats
            .filter(f => f.vcodec !== 'none' && f.acodec !== 'none' && f.height)
            .sort((a, b) => (b.height || 0) - (a.height || 0))
            .map(f => ({
                quality: f.height + 'p',
                ext: f.ext,
                filesize: f.filesize || 'unknown'
            }))
            .slice(0, 5);

        // Extraer formatos de audio
        const audioFormats = info.formats
            .filter(f => f.vcodec === 'none' && f.acodec !== 'none')
            .sort((a, b) => (b.abr || 0) - (a.abr || 0))
            .map(f => ({
                quality: (f.abr || 'unknown') + ' kbps',
                ext: f.ext,
                filesize: f.filesize || 'unknown'
            }))
            .slice(0, 3);

        console.log('Formatos:', videoFormats.length, 'video,', audioFormats.length, 'audio');

        res.json({
            success: true,
            data: {
                title: info.title,
                author: info.uploader || info.channel || 'Unknown',
                thumbnail: info.thumbnail,
                duration: info.duration,
                views: info.view_count || 0,
                videoFormats,
                audioFormats
            }
        });

    } catch (error) {
        console.error('Error completo:', error);
        
        let errorMessage = 'Error getting video info';
        if (error.code === 'ETIMEDOUT') {
            errorMessage = 'Timeout: El video tardó mucho en responder';
        } else if (error.stderr) {
            errorMessage = error.stderr;
        } else {
            errorMessage = error.message;
        }
        
        res.status(500).json({
            success: false,
            message: errorMessage
        });
    }
});

// Descargar video/audio
app.post('/api/download', async (req, res) => {
    try {
        const { url, format } = req.body; // format: 'video' o 'audio'
        
        console.log('Download request:', url, format);
        
        if (!url) {
            return res.status(400).json({
                success: false,
                message: 'URL is required'
            });
        }

        // Crear carpeta temporal
        const tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        // Obtener título del video
        const { stdout: infoJson } = await execPromise(`yt-dlp -J "${url}"`);
        const info = JSON.parse(infoJson);
        const safeTitle = info.title.replace(/[^\w\s-]/gi, '').substring(0, 100);

        let filename;
        let command;

        if (format === 'audio') {
            filename = `${safeTitle}.mp3`;
            // Descargar solo audio y convertir a MP3
            command = `yt-dlp -x --audio-format mp3 -o "${path.join(tempDir, filename)}" "${url}"`;
        } else {
            filename = `${safeTitle}.mp4`;
            // Descargar video con mejor calidad disponible
            command = `yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" -o "${path.join(tempDir, filename)}" "${url}"`;
        }

        console.log('Descargando...');
        await execPromise(command);

        const filePath = path.join(tempDir, filename);

        // Enviar archivo
        res.download(filePath, filename, (err) => {
            if (err) {
                console.error('rror sending file:', err);
            }
            // Eliminar archivo después de enviarlo
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
            });
        });

    } catch (error) {
        console.error('Download error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Download error: ' + error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});