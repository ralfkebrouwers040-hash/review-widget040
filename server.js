const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

const API_KEY = process.env.GOOGLE_API_KEY;
// De ID waarvan we weten dat hij werkt:
const PLACE_ID = 'ChIJ4boUAQBDZIMR4LQpPG4yjSo';

app.get('/', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (!API_KEY) return res.send("Fout: Geen API_KEY gevonden.");

  try {
    // DIT IS DE NIEUWE V1 ROUTE (Speciaal voor de 'New' API)
    const url = `https://places.googleapis.com/v1/places/${PLACE_ID}?fields=rating,userRatingCount,displayName&key=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    // De nieuwe API geeft fouten op een andere manier terug:
    if (data.error) {
      return res.send(`Google New API Fout: ${data.error.status}. Bericht: ${data.error.message}`);
    }

    const rating = data.rating || 0;
    const reviews = data.userRatingCount || 0;
    const naam = data.displayName ? data.displayName.text : "Stortrijders";

    res.send(`
      <div style="font-family: sans-serif; text-align: center; border: 2px solid #fbbc05; padding: 20px; border-radius: 15px; width: 220px; background: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        <div style="font-size: 32px; color: #fbbc05; font-weight: bold;">★ ${rating}</div>
        <div style="font-size: 14px; color: #333; margin: 10px 0;"><b>${reviews}</b> Google reviews</div>
        <div style="font-size: 12px; color: #4285F4; font-weight: bold;">${naam.toUpperCase()}</div>
      </div>
    `);
  } catch (err) {
    res.status(500).send("Fout: " + err.message);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Live op poort ${PORT}`);
});
