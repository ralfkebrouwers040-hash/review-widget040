// server.js
const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 8080;

// --- JOUW API KEY + PLACE ID ---
const API_KEY = 'AIzaSyDh4ZeUWbzpkAHItolTv4-e4ZqNkachMeE';
const PLACE_ID = 'ChIJ4boUAQBDZIMR4LQpPG4yjSo';

// Endpoint voor reviews
app.get('/reviews', async (req, res) => {
  try {
    const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=rating,reviews&key=${API_KEY}`);
    const data = await response.json();

    if (!data.result) {
      return res.status(500).json({ error: 'Geen reviews gevonden' });
    }

    // Stuur alleen rating + 3 meest recente reviews
    const reviews = (data.result.reviews || []).slice(0, 3).map(r => ({
      author: r.author_name,
      rating: r.rating,
      text: r.text,
      time: r.relative_time_description
    }));

    res.json({
      rating: data.result.rating || 0,
      reviews
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kon de reviews niet ophalen' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server draait op poort ${PORT}`);
});
