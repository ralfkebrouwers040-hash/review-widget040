const express = require('express');
const app = express();

// Gebruik de poort van Google Cloud Run (8080)
const PORT = process.env.PORT || 8080;

// De geheimen halen we uit de Cloud Run instellingen (Environment Variables)
const API_KEY = process.env.GOOGLE_API_KEY;
const PLACE_ID = 'ChIJ4boUAQBDZIMR4LQpPG4yjSo';

app.get('/', async (req, res) => {
  // Dit zorgt dat je eigen website de data mag ophalen
  res.set('Access-Control-Allow-Origin', '*');

  // Check of de API key wel aanwezig is in de instellingen
  if (!API_KEY) {
    return res.status(500).send("Fout: GOOGLE_API_KEY is niet ingesteld in Cloud Run.");
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=rating,user_ratings_total,reviews&key=${API_KEY}`;
    
    // We gebruiken de ingebouwde fetch van Node.js
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
      return res.status(500).send(`Google API Fout: ${data.status} - ${data.error_message || 'Check je API key en machtigingen'}`);
    }

    const rating = data.result.rating || 0;
    const total = data.result.user_ratings_total || 0;
    
    // Dit is wat er op je scherm verschijnt
    res.send(`
      <div style="font-family: sans-serif; border: 1px solid #ccc; padding: 10px; border-radius: 8px; display: inline-block;">
        <h3 style="margin: 0; color: #fbbc05;">⭐ ${rating} / 5</h3>
        <p style="margin: 5px 0 0; font-size: 0.9em;">Gebaseerd op ${total} Google reviews</p>
      </div>
    `);
    
  } catch (err) {
    console.error(err);
    res.status(500).send("Er ging iets mis op de server.");
  }
});

// Luisteren op 0.0.0.0 is verplicht voor Cloud Run
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is live op poort ${PORT}`);
});
