export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method salah' });

  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL kosong bro' });

    const response = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ url: url })
    });

    const data = await response.json();
    
    if (data.url) {
      return res.status(200).json({ medias: [{ url: data.url, quality: 'HD' }] });
    }
    if (data.picker) {
      return res.status(200).json({ medias: data.picker.map(p => ({ url: p.url, quality: p.type })) });
    }
    return res.status(500).json({ error: 'Gagal ambil video', raw: data });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
