const express = require('express');
const fetch = require('node-fetch');
const app = express();

// Cloud Run vertelt ons de poort via process.env.PORT (meestal 8080)
const PORT = process.env.PORT || 8080;

// De geheimen komen uit de Cloud Run instellingen
const API_KEY = process.env.GOOGLE_API_KEY;
const PLACE_ID = 'ChIJ4boUAQBDZIMR4LQpPG4yjSo';

app.get('/', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*'); // Iedereen mag de data zien

  if (!API_KEY) {
    return res.status(500).send("Fout: GOOGLE_API_KEY niet gevonden in variabelen.");
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=rating,user_ratings_total,reviews&key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.result) {
      return res.status(500).send("Google API gaf een foutmelding.");
    }

    const rating = data.result.rating || 0;
    res.send(`<h2>⭐ ${rating} sterren</h2><p>Verbinding met Google is gelukt!</p>`);
  } catch (err) {
    res.status(500).send("Server fout.");
  }
});

// DIT IS DE FIX: we luisteren op 0.0.0.0 in plaats van localhost
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server luistert op poort ${PORT}`);
});
