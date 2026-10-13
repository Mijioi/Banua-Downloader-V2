export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { url } = req.body || {};
    if (!url) return res.status(400).json({ error: 'URL kosong' });

    // COBA ENDPOINT 1 (WUK.SH - Punya Cobalt, gak di block Vercel)
    try {
      const r1 = await fetch('https://co.wuk.sh/api/json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ url })
      });
      const j1 = await r1.json();
      if (j1.url) return res.json({ medias: [{ url: j1.url, quality: 'HD' }] });
      if (j1.picker) return res.json({ medias: j1.picker.map(p => ({ url: p.url, quality: p.type })) });
    } catch (e) {}

    // COBA ENDPOINT 2 (Fallback TikWM buat TikTok)
    if (url.includes('tiktok')) {
      const r2 = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
      const j2 = await r2.json();
      if (j2.data && j2.data.play) {
        return res.json({ 
          medias: [
            { url: j2.data.play, quality: 'No Watermark' },
            { url: j2.data.wmplay, quality: 'With Watermark' }
          ] 
        });
      }
    }

    return res.status(500).json({ error: 'Gagal ambil video, coba link TikTok dulu bro buat tes' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
             }
