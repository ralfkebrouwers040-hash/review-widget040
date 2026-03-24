const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

const API_KEY = process.env.GOOGLE_API_KEY;
const PLACE_ID = 'ChIJ4boUAQBDZIMR4LQpPG4yjSo';

app.get('/', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (!API_KEY) return res.send("Fout: Geen API_KEY.");

  try {
    // We vragen nu ook om 'reviews' in de fields
    const url = `https://places.googleapis.com/v1/places/${PLACE_ID}?fields=rating,userRatingCount,displayName,reviews&key=${API_KEY}&languageCode=nl`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) return res.send(`Fout: ${data.error.message}`);

    const rating = data.rating ? data.rating.toFixed(1).replace('.', ',') : "5,0";
    const reviewsCount = data.userRatingCount || 0;
    const reviews = data.reviews || [];

    // HTML Opbouw
    let reviewsHtml = '';
    reviews.slice(0, 3).forEach(rev => {
      reviewsHtml += `
        <div style="margin-bottom: 15px; text-align: left; border-bottom: 1px solid #eee; padding-bottom: 10px;">
          <div style="font-weight: bold; font-size: 14px; color: #333;">${rev.authorAttribution.displayName}</div>
          <div style="font-size: 11px; color: #999; margin-bottom: 5px;">${rev.relativePublishTimeDescription}</div>
          <div style="color: #fbbc05; font-size: 12px; margin-bottom: 5px;">★★★★★</div>
          <div style="font-size: 13px; color: #555; line-height: 1.4;">${rev.text.text.substring(0, 150)}${rev.text.text.length > 150 ? '...' : ''}</div>
        </div>
      `;
    });

    res.send(`
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 15px; background: #fff; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #fbbc05; padding-bottom: 10px; }
        .rating-num { font-size: 36px; font-weight: bold; color: #333; }
        .stars { color: #fbbc05; font-size: 20px; }
        .count { color: #666; font-size: 14px; }
        .google-link { display: inline-block; margin-top: 5px; color: #4285F4; text-decoration: none; font-size: 12px; font-weight: bold; }
      </style>
      <div class="header">
        <div class="rating-num">${rating}</div>
        <div class="stars">★★★★★</div>
        <div class="count">(${reviewsCount}) Google reviews</div>
        <a href="https://search.google.com/local/writereview?placeid=${PLACE_ID}" target="_blank" class="google-link">Review ons op Google</a>
      </div>
      <div class="reviews-container">
        ${reviewsHtml}
      </div>
    `);
  } catch (err) {
    res.status(500).send("Fout: " + err.message);
  }
});

app.listen(PORT, '0.0.0.0', () => { console.log(`Poort ${PORT}`); });
