const express = require('express');
const fetch = require('node-fetch');
const app = express();

// Google Cloud Run vertelt de server op welke poort hij moet luisteren via 'process.env.PORT'
const PORT = process.env.PORT || 8080;

// We halen de geheimen uit de instellingen, niet uit de tekst hier!
const API_KEY = process.env.GOOGLE_API_KEY;
const PLACE_ID = 'ChIJ4boUAQBDZIMR4LQpPG4yjSo';

app.get('/', async (req, res) => {
  // Dit zorgt dat je eigen website de data mag ophalen (CORS)
  res.set('Access-Control-Allow-Origin', '*');

  if (!API_KEY) {
    return res.status(500).send("Fout: De GOOGLE_API_KEY is niet ingesteld in de Cloud Run variabelen.");
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=rating,user_ratings_total,reviews&key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.result) {
      return res.status(500).send("Google geeft geen reviews terug. Check je API key restricties.");
    }

    // Een simpele weergave voor je website
    const rating = data.result.rating || 0;
    const total = data.result.user_ratings_total || 0;
    
    res.send(`<h2>⭐ ${rating} (${total} reviews)</h2><p>Widget is succesvol verbonden!</p>`);
  } catch (err) {
    res.status(500).send("Er ging iets mis bij het ophalen van de data.");
  }
});

// DIT IS HET BELANGRIJKSTE STUKJE:
app.listen(PORT, '0.0.0.0', () => {
  console.log(`De server is wakker en luistert op poort ${PORT}`);
});
