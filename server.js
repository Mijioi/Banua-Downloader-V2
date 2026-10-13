const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });
app.post('/api/download', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL kosong bro!' });
    const lower = url.toLowerCase();
    let platform = 'unknown';
    if (lower.includes('tiktok.com')) platform = 'tiktok';
    else if (lower.includes('instagram.com')) platform = 'instagram';
    else if (lower.includes('facebook.com') || lower.includes('fb.watch')) platform = 'facebook';
    else if (lower.includes('youtube.com') || lower.includes('youtu.be')) platform = 'youtube';
    try {
      if (platform === 'tiktok') {
        const tikRes = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&count=12&cursor=0&web=1&hd=1`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const tikJson = await tikRes.json();
        if (tikJson.data) {
          const data = tikJson.data;
          return res.json({ platform: 'tiktok', title: data.title || 'TikTok Video', thumbnail: data.cover, medias: [{ quality: 'HD No Watermark', url: data.hdplay || data.play, type: 'video' }] });
        }
      }
      const cobaltRes = await fetch('https://api.cobalt.tools/api/json', { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ url: url }) });
      const cobaltJson = await cobaltRes.json();
      if (cobaltJson.url) {
        return res.json({ platform, title: `Download ${platform}`, thumbnail: cobaltJson.thumb || '', medias: [{ quality: 'Original', url: cobaltJson.url, type: 'video' }] });
      }
      if (cobaltJson.picker) {
        let medias = cobaltJson.picker.map(p => ({ quality: p.type || 'Video', url: p.url, type: 'video' }));
        return res.json({ platform, title: `Download ${platform}`, medias });
      }
    } catch (e) { console.log(e.message); }
    return res.status(500).json({ error: `Gagal download ${platform}` });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Running'));
module.exports = app;
