export function detectPlataform(url) {
    
    if ( url.includes("youtube.com") || url.includes("youtu.be") ) {
        return "youtube";
    }
    if ( url.includes( "spotify.com") || url.includes( "open.spotify.com") ) {
        return "spotify";
    }
    if ( url.includes( "instagram.com") || url.includes( "www.instagram.com") ) {
        return "instagram";
    }
    if (url.includes('tiktok.com')) {
    return 'tiktok';
    }
    if (url.includes('twitter.com') || url.includes('x.com')) {
        return 'twitter';
    }
    if (url.includes('facebook.com') || url.includes('fb.watch')) {
        return 'facebook';
    }  

    return "unknown";
}

export function isPlataformSupported(url) {
    const platform = detectPlataform(url);
    return platform !== "unknown";
}

export function getPlataform(url) {
    const plataforms = {
        "youtube": "YouTube",
        "spotify": "Spotify",
        "instagram": "Instagram",
        "tiktok": "TikTok",
        "twitter": "Twitter",
        "facebook": "Facebook",
        "unknown": "Unknown"
    };

    const plataform = detectPlataform(url);
    return plataforms[plataform] || "Unknown"; 
   
}