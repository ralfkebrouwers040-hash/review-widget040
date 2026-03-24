const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

// De variabelen die je in Cloud Run hebt ingevuld
const API_KEY = process.env.GOOGLE_API_KEY;
const PLACE_ID = 'ChIJ4boUAQBDZIMR4LQpPG4yjSo';

app.get('/', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=rating,user_ratings_total,reviews&key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
      return res.send(`Foutje bij Google: ${data.status}`);
    }

    const rating = data.result.rating || 0;
    const total = data.result.user_ratings_total || 0;
    
    // De HTML die op je site komt
    res.send(`
      <div style="font-family: Arial; border: 1px solid #eee; padding: 15px; border-radius: 10px; text-align: center;">
        <h2 style="margin: 0; color: #fbbc05;">★ ${rating} / 5</h2>
        <p style="margin: 5px 0 0; color: #666;">${total} Google reviews</p>
      </div>
    `);
  } catch (err) {
    res.status(500).send("Server fout bij ophalen reviews.");
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Live op poort ${PORT}`);
});
