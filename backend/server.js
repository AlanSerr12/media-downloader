import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { title } from 'process';
import { isPlataformSupported, getPlataform } from './utils/detectPlataform.js';

dotenv.config();


const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;
const USE_PROXY = process.env.USE_PROXY === 'true';

const execPromise = promisify(exec);
const app = express();
const PORT = process.env.PORT || 4000;

// CORS
// app.use(cors({
//     origin: 'http://localhost:5173',
//     credentials: true
// }));

// CORS Producción
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      'https://media-downloader-murex.vercel.app', // Front
      'https://media-downloader-api-nrck.onrender.com' // Back
    ]
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Media downloader API',
        scraperApiConfigured: !!SCRAPER_API_KEY,
        proxyEnabled: USE_PROXY
    });
});

// Helper proxy opcional
function buildYtDlpCommand(baseCommand) {
    if (USE_PROXY && SCRAPER_API_KEY) {
        const proxyUrl = `http://scraperapi:${SCRAPER_API_KEY}@proxy-server.scraperapi.com:8001`;
        return `yt-dlp --proxy "${proxyUrl}" ${baseCommand}`;
    }
    return `yt-dlp ${baseCommand}`;
}

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

        if(!isPlataformSupported(url)) {
            return res.status(400).json({
                success: false,
                message: 'Plataforma no soportada. Plataformas válidas: YouTube, Instagram, TikTok, Twitter, Facebook'
            });
        }
        const platform = getPlataform(url);
        console.log('Plataforma detectada:', platform);

        // Limpiar URL
        const cleanUrl = url.split('&')[0];
        console.log('URL:', cleanUrl);

        // Usar yt-dlp con timeout
        const command = buildYtDlpCommand(`-J "${cleanUrl}"`);

        if (USE_PROXY) {
            console.log('Usando ScraperAPI proxy');
        }

        console.log('Ejecutando.....');

        const { stdout, stderr } = await execPromise(command, {
            timeout: 30000,
            maxBuffer: 1024 * 1024 * 10,
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
        const { url, format } = req.body;

        console.log('Download request:', url, format);

        if (!url) {
            return res.status(400).json({
                success: false,
                message: 'URL is required'
            });
        }

        const tempDir = process.env.NODE_ENV === 'production'
        ? '/tmp'
        :path.join(process.cwd(), 'temp');


        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        console.log(' Format Download:', format);
        const cleanUrl = url.split('&')[0].split('?')[0] + '?v=' + url.split('v=')[1]?.split('&')[0];

        const infoCommand = buildYtDlpCommand(`-J "${cleanUrl}"`);
        const { stdout: infoJson } = await execPromise(infoCommand);
        const info = JSON.parse(infoJson);

        const safeTitle = info.title
            .replace(/[^\w\s-]/gi, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .toLowerCase()
            .substring(0, 50);

        let baseCommand;
        let expectedExt;

        console.log('Video Title:', info.title);

        if (format === 'audio') {
            expectedExt = 'mp3';
            baseCommand = `-x --audio-format mp3 --output "${tempDir}/${safeTitle}.%(ext)s" "${cleanUrl}"`;
        } else {
            expectedExt = 'mp4';
            baseCommand = `-f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best" --merge-output-format mp4 --output "${tempDir}/${safeTitle}.%(ext)s" "${cleanUrl}"`;
        }

        const command = buildYtDlpCommand(baseCommand);

        if (USE_PROXY) {
            console.log('Descargando con proxy.....');
}

        const startTime = Date.now();
        await execPromise(command, {
            timeout: 120000,
            maxBuffer: 1024 * 1024 * 50
        });
        const endTime = Date.now();

        console.log(`Download Completed in ${(endTime - startTime) / 1000}s`);

        // Buscar el archivo descargado
        const files = fs.readdirSync(tempDir).filter(f => f.startsWith(safeTitle));
        console.log('Files Found:', files);

        if (files.length === 0) {
            throw new Error('The downloaded file was not found.');
        }

        const downloadedFile = files[0];
        const filePath = path.join(tempDir, downloadedFile);
        const fileSize = fs.statSync(filePath).size;

        console.log(`File: ${downloadedFile}`);
        console.log(`Size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
        console.log('Sending file...');

        res.download(filePath, downloadedFile, (err) => {
            if (err) {
                console.error('Error sending file:', err);
            } else {
                console.log('Sent File');
            }

            fs.unlink(filePath, (unlinkErr) => {
                if (!unlinkErr) {
                    console.log('Delete FIle');
                }
            });
        });

    } catch (error) {
        console.error('Error:', error.message);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`¿Server running on http://localhost:${PORT}`);
    console.log(` ScraperAPI: ${SCRAPER_API_KEY ? 'Configured' : 'NOT configured'}`);
    console.log(`Proxy Mode: ${USE_PROXY ? 'ENABLED ' : 'DISABLED'}`);
});