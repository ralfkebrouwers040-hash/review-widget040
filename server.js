// server.js
const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 8080;

// --- JOUW API KEY + PLACE ID ---
const API_KEY = 'AIzaSyDh4ZeUWbzpkAHItolTv4-e4ZqNkachMeE';
const PLACE_ID = 'ChIJ4boUAQBDZIMR4LQpPG4yjSo';

// Root endpoint toont direct rating + 3 meest recente reviews
app.get('/', async (req, res) => {
  try {
    // Haal data op van Google Places
    const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=rating,user_ratings_total,reviews&key=${API_KEY}`);
    const data = await response.json();

    if (!data.result) {
      return res.status(500).send('Geen reviews gevonden');
    }

    const rating = data.result.rating || 0;
    const totalReviews = data.result.user_ratings_total || 0;

    // Pak 3 meest recente reviews
    const reviews = (data.result.reviews || []).slice(0, 3).map(r => ({
      author: r.author_name,
      rating: r.rating,
      text: r.text,
      time: r.relative_time_description
    }));

    // Bouw simpele HTML widget
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
    console.error(err);
    res.status(500).send('Kon de reviews niet ophalen');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server draait op poort ${PORT}`);
});
