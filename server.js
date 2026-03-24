const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

const API_KEY = process.env.GOOGLE_API_KEY;

app.get('/', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (!API_KEY) return res.send("Fout: GOOGLE_API_KEY ontbreekt in Cloud Run variabelen.");

  try {
    // We zoeken specifiek op jouw naam in Eindhoven
    const zoekTerm = encodeURIComponent('Stortrijders Eindhoven');
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${zoekTerm}&inputtype=textquery&fields=rating,user_ratings_total,name,place_id&key=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    // Als Google 'ZERO_RESULTS' zegt, proberen we het nóg breder
    if (data.status === "ZERO_RESULTS") {
       return res.send("Google kan 'Stortrijders Eindhoven' niet vinden. Controleer of de bedrijfsnaam exact klopt op Maps.");
    }

    if (data.status !== "OK") {
      return res.send(`Google API melding: ${data.status}. (Check of 'Places API' op ENABLE staat in je Dashboard)`);
    }

    const bedrijf = data.candidates[0];
    const rating = bedrijf.rating || 0;
    const reviews = bedrijf.user_ratings_total || 0;

    res.send(`
      <div style="font-family: sans-serif; text-align: center; border: 1px solid #fbc02d; padding: 15px; border-radius: 12px; width: 200px; background: #fff;">
        <div style="font-size: 24px; color: #fbc02d; font-weight: bold;">★ ${rating}</div>
        <div style="font-size: 14px; color: #333; margin: 5px 0;">${reviews} Google reviews</div>
        <div style="font-size: 12px; color: #777; font-weight: bold;">${bedrijf.name}</div>
      </div>
    `);
  } catch (err) {
    res.status(500).send("Fout bij het verbinden met de server.");
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server gestart op poort ${PORT}`);
});
