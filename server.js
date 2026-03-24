const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

const API_KEY = process.env.GOOGLE_API_KEY;

app.get('/', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (!API_KEY) return res.send("Fout: Geen API_KEY gevonden.");

  try {
    // WE GEBRUIKEN NU HET INTERNATIONALE FORMAAT: +31...
    // En we voegen 'locationbias' toe om Google te helpen in Nederland te zoeken
    const telefoon = encodeURIComponent('+31685093954');
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${telefoon}&inputtype=phonenumber&fields=rating,user_ratings_total,name,place_id&key=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "INVALID_REQUEST") {
       return res.send("Google zegt nog steeds INVALID_REQUEST. Dit betekent vaak dat de 'Places API (New)' niet aan staat of dat er geen facturering gekoppeld is.");
    }

    if (data.status !== "OK") {
      return res.send(`Status: ${data.status}. Melding: ${data.error_message || 'Geen'}`);
    }

    const bedrijf = data.candidates[0];
    res.send(`
      <div style="font-family: sans-serif; text-align: center; border: 1px solid #eee; padding: 15px; border-radius: 12px; width: 200px;">
        <div style="font-size: 24px; color: #fbbc05; font-weight: bold;">★ ${bedrijf.rating}</div>
        <div style="font-size: 14px; color: #666;">${bedrijf.user_ratings_total} reviews</div>
        <div style="font-size: 13px; font-weight: bold; margin-top: 5px;">${bedrijf.name}</div>
      </div>
    `);
  } catch (err) {
    res.status(500).send("Fout: " + err.message);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Poort ${PORT} actief.`);
});
