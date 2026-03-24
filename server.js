const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

const API_KEY = process.env.GOOGLE_API_KEY;

app.get('/', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (!API_KEY) return res.send("Fout: Geen API_KEY gevonden in de instellingen.");

  try {
    // We zoeken op je telefoonnummer, dat is uniek voor Google
    const telefoon = encodeURIComponent('06 85093954');
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${telefoon}&inputtype=phonenumber&fields=rating,user_ratings_total,name,place_id&key=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "ZERO_RESULTS") {
       return res.send("Google kan het bedrijf niet vinden via het telefoonnummer. Controleer of de 'Places API' wel aan staat in je Google Cloud Console.");
    }

    if (data.status !== "OK") {
      return res.send(`Google API Fout: ${data.status}. (Heeft u Billing/Facturering gekoppeld?)`);
    }

    const bedrijf = data.candidates[0];
    const rating = bedrijf.rating || 0;
    const reviews = bedrijf.user_ratings_total || 0;

    res.send(`
      <div style="font-family: Arial, sans-serif; text-align: center; border: 1px solid #eee; padding: 15px; border-radius: 12px; width: 220px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="font-size: 24px; color: #fbbc05; font-weight: bold;">★ ${rating.toFixed(1)}</div>
        <div style="font-size: 14px; color: #666; margin: 5px 0;">${reviews} Google reviews</div>
        <div style="font-size: 13px; font-weight: bold; color: #333;">${bedrijf.name}</div>
        <div style="font-size: 10px; color: #ccc; margin-top: 10px;">ID: ${bedrijf.place_id}</div>
      </div>
    `);
  } catch (err) {
    res.status(500).send("Fout bij ophalen: " + err.message);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server draait op poort ${PORT}`);
});
