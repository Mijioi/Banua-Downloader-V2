export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL kosong' });
    const r = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ url })
    });
    const j = await r.json();
    if (j.url) return res.json({ medias: [{ url: j.url, quality: 'HD' }], title: 'Video' });
    if (j.picker) return res.json({ medias: j.picker.map(p => ({ url: p.url, quality: p.type })), title: 'Video' });
    return res.status(500).json({ error: 'Gagal ambil video' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
