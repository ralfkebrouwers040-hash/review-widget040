const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

const API_KEY = process.env.GOOGLE_API_KEY;
const MY_PLACE_ID = 'ChIJ4boUAQBDZIMR4LQpPG4yjSo'; 

app.get('/', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (!API_KEY) return res.send("Fout: De API_KEY is leeg in Cloud Run variabelen.");

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${MY_PLACE_ID}&fields=name,rating,user_ratings_total&key=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    // Als het misgaat, laten we PRECIES zien wat Google terugstuurt
    if (data.status !== "OK") {
      return res.send(`
        <h3>Google API Fout</h3>
        <p><b>Status:</b> ${data.status}</p>
        <p><b>Bericht:</b> ${data.error_message || 'Geen extra info'}</p>
        <p><i>Check: Staat 'Don't restrict key' aan bij je Credentials?</i></p>
      `);
    }

    const bedrijf = data.result;
    res.send(`
      <div style="font-family: Arial; text-align: center; border: 1px solid #eee; padding: 20px; border-radius: 15px; width: 220px;">
        <div style="font-size: 32px; color: #fbbc05; font-weight: bold;">★ ${bedrijf.rating}</div>
        <div style="font-size: 14px; color: #333; margin: 10px 0;"><b>${bedrijf.user_ratings_total}</b> Google reviews</div>
        <div style="font-size: 12px; color: #4285F4; font-weight: bold;">STORTRIJDERS</div>
      </div>
    `);
  } catch (err) {
    res.status(500).send("Server Fout: " + err.message);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Live op poort ${PORT}`);
});
