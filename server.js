const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

const API_KEY = process.env.GOOGLE_API_KEY;

app.get('/', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (!API_KEY) return res.send("Fout: Geen API_KEY gevonden.");

  try {
    // STAP 1: Zoek het bedrijf op naam + stad (werkt altijd voor SAB's)
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent('Stortrijders Eindhoven')}&inputtype=textquery&fields=place_id,rating,user_ratings_total,name&key=${API_KEY}`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (searchData.status !== "OK" || !searchData.candidates[0]) {
      return res.send(`Zoekfout: ${searchData.status}. Google kan 'Stortrijders Eindhoven' niet vinden via de API.`);
    }

    const bedrijf = searchData.candidates[0];
    const rating = bedrijf.rating || 0;
    const reviews = bedrijf.user_ratings_total || 0;

    // STAP 2: Toon de resultaten
    res.send(`
      <div style="font-family: Arial, sans-serif; text-align: center; border: 2px solid #fbbc05; padding: 20px; border-radius: 15px; width: 220px; background: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        <div style="font-size: 32px; color: #fbbc05; font-weight: bold;">★ ${rating}</div>
        <div style="font-size: 14px; color: #333; margin: 10px 0;"><b>${reviews}</b> Google reviews</div>
        <div style="font-size: 12px; color: #4285F4; font-weight: bold; text-transform: uppercase;">${bedrijf.name}</div>
        <p style="font-size: 9px; color: #ccc; margin-top: 10px;">ID gevonden: ${bedrijf.place_id}</p>
      </div>
    `);
  } catch (err) {
    res.status(500).send("Server Fout: " + err.message);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Live op poort ${PORT}`);
});
