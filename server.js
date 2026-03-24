const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

const API_KEY = process.env.GOOGLE_API_KEY;
// Vul hier je exacte bedrijfsnaam in zoals deze op Google Maps staat:
const SEARCH_QUERY = 'Stortrijders'; 

app.get('/', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  try {
    // STAP A: We zoeken eerst het bedrijf op basis van de naam
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(SEARCH_QUERY)}&inputtype=textquery&fields=place_id,rating,user_ratings_total&key=${API_KEY}`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.candidates || searchData.candidates.length === 0) {
      return res.send("Bedrijf niet gevonden op Google. Controleer de naam.");
    }

    const result = searchData.candidates[0];
    const rating = result.rating || 0;
    const total = result.user_ratings_total || 0;

    // De HTML voor je website
    res.send(`
      <div style="font-family: Arial; border: 1px solid #eee; padding: 15px; border-radius: 10px; text-align: center; max-width: 200px;">
        <div style="color: #fbbc05; font-size: 20px; font-weight: bold;">★ ${rating}</div>
        <div style="color: #666; font-size: 14px;">${total} Google reviews</div>
        <div style="margin-top: 5px; font-size: 12px; color: #4285F4; font-weight: bold;">Stortrijders</div>
      </div>
    `);
  } catch (err) {
    res.status(500).send("Fout bij ophalen gegevens.");
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Live op poort ${PORT}`);
});
