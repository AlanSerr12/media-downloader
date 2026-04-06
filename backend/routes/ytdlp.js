const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// API Key de ScraperAPI
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

router.post('/info', async (req, res) => {
    const { url } = req.body;
    
    console.log('Received request for URL:', url);
    
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    if (!SCRAPER_API_KEY) {
        return res.status(500).json({ error: 'ScraperAPI key not configured' });
    }

    // Configurar proxy de ScraperAPI
    const proxyUrl = `http://scraperapi:${SCRAPER_API_KEY}@proxy-server.scraperapi.com:8001`;
    
    console.log('Using ScraperAPI proxy...');
    
    const command = `yt-dlp --proxy "${proxyUrl}" -J --no-warnings "${url}"`;

    exec(command, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
            console.error('Error:', stderr);
            return res.status(500).json({ 
                error: 'Error getting video info', 
                details: stderr 
            });
        }

        try {
            const info = JSON.parse(stdout);
            
            console.log('Video info extracted:', info.title);
            
            res.json({
                success: true,
                title: info.title || 'Unknown',
                duration: info.duration || 0,
                thumbnail: info.thumbnail || '',
                uploader: info.uploader || 'Unknown',
                views: info.view_count || 0,
                formats: info.formats ? info.formats.length : 0
            });
        } catch (e) {
            console.error('Parse error:', e.message);
            res.status(500).json({ error: 'Error parsing video info' });
        }
    });
});

router.post('/download', async (req, res) => {
    const { url, format } = req.body;
    
    console.log('⬇Download request:', { url, format });
    
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    if (!SCRAPER_API_KEY) {
        return res.status(500).json({ error: 'ScraperAPI key not configured' });
    }

    const proxyUrl = `http://scraperapi:${SCRAPER_API_KEY}@proxy-server.scraperapi.com:8001`;
    
    // Directorio temporal en Render
    const outputDir = process.env.NODE_ENV === 'production' 
        ? '/tmp/downloads' 
        : path.join(__dirname, '../downloads');
    
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputTemplate = path.join(outputDir, '%(title)s.%(ext)s');
    const formatOption = format === 'audio' ? 'bestaudio' : 'best';
    
    console.log('Output directory:', outputDir);
    
    const command = `yt-dlp --proxy "${proxyUrl}" -f ${formatOption} -o "${outputTemplate}" "${url}"`;

    exec(command, { maxBuffer: 50 * 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
            console.error('Download error:', stderr);
            return res.status(500).json({ 
                error: 'Download failed', 
                details: stderr 
            });
        }

        console.log('Download completed');
        console.log(stdout);

        res.json({
            success: true,
            message: 'Video downloaded successfully',
            output: stdout
        });
    });
});

module.exports = router;