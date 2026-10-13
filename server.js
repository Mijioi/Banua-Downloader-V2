const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(__dirname));
app.post('/api/download', async (req,res)=>{
  try{
    const { url } = req.body;
    const api = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
    const r = await fetch(api);
    const data = await r.json();
    if(!data.data) return res.status(500).json({error:'Gagal ambil video'});
    res.json({ video: data.data.play, music: data.data.music, title: data.data.title });
  }catch(e){ res.status(500).json({error:e.message}) }
});
app.get('/', (req,res)=> res.sendFile(path.join(__dirname,'index.html')));
module.exports = app;
