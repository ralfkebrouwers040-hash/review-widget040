// server.js
require('dotenv').config(); 
const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 8080;

// Geen hardcoded keys meer hier!
const API_KEY = process.env.GOOGLE_API_KEY; 
const PLACE_ID = process.env.PLACE_ID || 'ChIJ4boUAQBDZIMR4LQpPG4yjSo';

app.get('/', async (req, res) => {
  if (!API_KEY) {
    return res.status(500).send('Systeemfout: API_KEY ontbreekt in de server configuratie.');
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=rating,user_ratings_total,reviews&key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.result) {
      return res.status(500).send('Google API fout: Check of de key en Place ID correct zijn.');
    }

    const rating = data.result.rating || 0;
    const totalReviews = data.result.user_ratings_total || 0;

    const reviews = (data.result.reviews || []).slice(0, 3).map(r => ({
      author: r.author_name,
      rating: r.rating,
      text: r.text,
      time: r.relative_time_description
    }));

    let html = `<h2>⭐ ${rating} van 5 sterren (${totalReviews} reviews)</h2>`;
    reviews.forEach(r => {
      html += `<div style="border-top:1px solid #eee; padding:5px; margin-top:5px;">
                  <strong>${r.author}</strong> (${r.rating}⭐)<br>
                  ${r.text}<br>
                  <em>${r.time}</em>
               </div>`;
    });

    res.send(html);

  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).send('Kon de reviews niet ophalen');
  }
});

app.listen(PORT, () => {
  console.log(`Server draait veilig op poort ${PORT}`);
});
