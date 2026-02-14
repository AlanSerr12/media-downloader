import { useState } from "react";
import {Download, AlertCircle} from 'lucide-react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:4000';

function App(){
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const [error, setError] = useState('');

  const handleGetInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setVideoInfo(null);

    try {
      const response = await axios.post(`${API_URL}/api/video-info`, {url});
      setVideoInfo(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');      
    } finally {
      setLoading(false);
    }
  }

  const handleDownload = async (format) => {
    try {
      const response = await axios.post(`${API_URL}/api/download`,
        {url, format},
        {responseType: 'blob'}
      );

      // Create a link to download the file
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${videoInfo.title}.${format === 'audio' ? 'mp3' : 'mp4'}`); 
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred while downloading');
    }
  }

  return (
    <div className="app">
      <header className="header">
        <Download size={32}/>
        <h1>YouTube Downloader</h1>
        <p>Descarga videos y audios de Youtube</p>
      </header>

      <div className="disclaimer">
        <AlertCircle size={20}/>
        <p>Esta aplicación es solo para fines educativos. 
          Asegúrate de respetar los derechos de autor y las políticas de YouTube al descargar contenido.
        </p>
      </div>

      <main className="main">
        <form onSubmit={handleGetInfo} className="form">
          <input 
          type="text" 
          placeholder="Pega aqui la Url de Youtube" 
          value={url} 
          onChange={(e) => setUrl(e.target.value)} 
          className="input"
          /> 
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Cargando...' : 'Obtener Informacion'}
          </button>
        </form>

        { error && (
          <div className="error">
            <AlertCircle size={20}/>
            <p>{error}</p>
          </div>
        )}

        { videoInfo && (
          <div className="video-info">
            <img src={videoInfo.thumbnail} alt={videoInfo.title} className="thumbnail"/>
            <h2>{videoInfo.title}</h2>
            <p className="author">Por: {videoInfo.author}</p>
            <p className="stats">
              Duración: {Math.floor(videoInfo.duration / 60)}:{(videoInfo.duration % 60).toString().padStart(2, '0')} | 
              Vistas: {parseInt(videoInfo.views).toLocaleString()}
            </p>

            <div className="download-buttons">
              <button onClick={() => handleDownload('video')} className="btn-download">
                Descargar Video (MP4)
              </button>
              <button onClick={() => handleDownload('audio')} className="btn-download">
                Descargar Audio (MP3)
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Hecho por Alan</p>
      </footer>
    </div>
  );
}

export default App;