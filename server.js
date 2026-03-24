const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

const API_KEY = process.env.GOOGLE_API_KEY;

app.get('/', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (!API_KEY) return res.send("Fout: Geen API_KEY gevonden.");

  try {
    // We gebruiken exact het nummer zoals op Maps: 06 85093954
    // We voegen 'locationbias' toe zodat Google weet dat we in Nederland zoeken
    const telefoon = encodeURIComponent('06 85093954');
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${telefoon}&inputtype=phonenumber&fields=rating,user_ratings_total,name&locationbias=circle:50000@51.4416,5.4697&key=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "ZERO_RESULTS") {
      return res.send("Google vindt geen bedrijf bij 06 85093954. Dit gebeurt vaak als de 'Places API' (de oude versie) niet op ENABLE staat.");
    }

    if (data.status !== "OK") {
      return res.send(`Google melding: ${data.status}. ${data.error_message || ''}`);
    }

    const bedrijf = data.candidates[0];
    res.send(`
      <div style="font-family: sans-serif; text-align: center; border: 1px solid #eee; padding: 20px; border-radius: 15px; width: 220px; background: #fff;">
        <div style="font-size: 28px; color: #fbbc05; font-weight: bold;">★ ${bedrijf.rating}</div>
        <div style="font-size: 14px; color: #333; margin: 5px 0;">${bedrijf.user_ratings_total} reviews</div>
        <div style="font-size: 12px; color: #4285F4; font-weight: bold; text-transform: uppercase;">${bedrijf.name}</div>
      </div>
    `);
  } catch (err) {
    res.status(500).send("Server fout: " + err.message);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server draait op poort ${PORT}`);
});
