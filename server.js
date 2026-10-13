const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/download', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL kosong!' });

    const lower = url.toLowerCase();
    let platform = 'video';
    if (lower.includes('tiktok.com')) platform = 'tiktok';
    else if (lower.includes('instagram.com')) platform = 'instagram';
    else if (lower.includes('facebook.com') || lower.includes('fb.watch')) platform = 'facebook';
    else if (lower.includes('youtube.com') || lower.includes('youtu.be')) platform = 'youtube';
    else if (lower.includes('x.com') || lower.includes('twitter.com')) platform = 'twitter';

    // 1. TikTok pakai tikwm
    if (platform === 'tiktok') {
      try {
        const r = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&count=12&cursor=0&web=1&hd=1`);
        const j = await r.json();
        if (j.data) {
          return res.json({
            platform: 'tiktok',
            title: j.data.title || 'TikTok Video',
            thumbnail: j.data.cover,
            medias: [{ quality: 'HD No Watermark', url: j.data.hdplay || j.data.play, type: 'video' }]
          });
        }
      } catch (e) {}
    }

    // 2. All in one pakai cobalt
    try {
      const r = await fetch('https://api.cobalt.tools/api/json', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const j = await r.json();
      if (j.url) {
        return res.json({
          platform,
          title: 'Download ' + platform,
          thumbnail: j.thumb || '',
          medias: [{ quality: 'Original', url: j.url, type: 'video' }]
        });
      }
      if (j.picker && j.picker.length > 0) {
        return res.json({
          platform,
          title: 'Download ' + platform,
          medias: j.picker.map(p => ({ quality: p.type || 'Video', url: p.url, type: 'video' }))
        });
      }
    } catch (e) {
      console.log(e.message);
    }

    return res.status(500).json({ error: 'Gagal download, coba link lain bro' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = app;
