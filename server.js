const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

const API_KEY = process.env.GOOGLE_API_KEY;
const PLACE_ID = 'ChIJ4boUAQBDZIMR4LQpPG4yjSo';

app.get('/', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (!API_KEY) return res.send("Fout: Geen API_KEY.");

  try {
    const url = `https://places.googleapis.com/v1/places/${PLACE_ID}?fields=rating,userRatingCount,displayName,reviews&key=${API_KEY}&languageCode=nl`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) return res.send(`Fout: ${data.error.message}`);

    const rating = data.rating ? data.rating.toFixed(1) : "5.0";
    const reviewsCount = data.userRatingCount || 0;
    const reviews = data.reviews || [];

    let cardsHtml = '';
    reviews.forEach(rev => {
      const avatarUrl = rev.authorAttribution.photoUri;
      const avatarHtml = avatarUrl 
        ? `<img src="${avatarUrl}" class="avatar-img">`
        : `<div class="avatar-initial">${rev.authorAttribution.displayName.charAt(0).toUpperCase()}</div>`;
      
      cardsHtml += `
        <div class="review-card">
          <div class="card-header">
            <div class="avatar-container">
              ${avatarHtml}
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" class="google-g">
            </div>
            <div class="author-info">
              <div class="author-name-row">
                <span class="author-name">${rev.authorAttribution.displayName}</span>
                <span class="verified-vinkje">✔️</span>
              </div>
              <span class="publish-time">${rev.relativePublishTimeDescription}</span>
            </div>
          </div>
          <div class="stars">★★★★★</div>
          <p class="review-text">${rev.text.text.substring(0, 160)}${rev.text.text.length > 160 ? '...' : ''}</p>
        </div>
      `;
    });

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: sans-serif; margin: 0; padding: 10px; background: transparent; overflow: hidden; }
          .container { max-width: 1000px; margin: 0 auto; position: relative; padding: 0 40px; }
          
          /* Border-bottom aangepast naar subtiel wit voor donkere achtergronden */
          .reviews-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 15px; }
          
          /* Rating value is nu WIT */
          .rating-value { font-size: 28px; font-weight: bold; margin-right: 10px; color: #ffffff; }
          
          .stars { color: #fabb00; font-size: 18px; }
          .review-btn { background: #1a73e8; color: white; padding: 10px 18px; border-radius: 20px; text-decoration: none; font-size: 13px; font-weight: bold; }

          .carousel-container { overflow: hidden; width: 100%; }
          .carousel-viewport { display: flex; transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); gap: 15px; }
          
          .review-card { min-width: calc(33.333% - 10px); background: white; padding: 15px; border-radius: 12px; border: 1px solid #e0e0e0; box-sizing: border-box; height: 200px; }
          @media (max-width: 800px) { .review-card { min-width: 100%; } }

          .card-header { display: flex; align-items: center; margin-bottom: 12px; }
          .avatar-container { position: relative; width: 40px; height: 40px; margin-right: 12px; }
          .avatar-img { width: 100%; height: 100%; border-radius: 50%; }
          .avatar-initial { width: 100%; height: 100%; border-radius: 50%; background: #4285f4; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; }
          .google-g { position: absolute; bottom: -2px; right: -2px; width: 16px; background: white; border-radius: 50%; }
          
          .author-name { font-size: 14px; font-weight: bold; color: #333; }
          .verified-vinkje { color: #1a73e8; font-size: 12px; margin-left: 4px; }
          .publish-time { font-size: 11px; color: #777; }
          .review-text { font-size: 13px; color: #444; line-height: 1.5; }

          .nav-btn { position: absolute; top: 60%; width: 36px; height: 36px; background: white; border: 1px solid #ddd; border-radius: 50%; cursor: pointer; z-index: 10; box-shadow: 0 2px 5px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; font-size: 20px; }
          .prev { left: 0; } .next { right: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="reviews-header">
            <div>
              <span class="rating-value">${rating}</span>
              <span class="stars">★★★★★</span>
              <span style="color:#ffffff; font-size:14px;">(${reviewsCount})</span>
            </div>
            <a href="https://search.google.com/local/writereview?placeid=${PLACE_ID}" target="_blank" class="review-btn">Review us on Google</a>
          </div>

          <div class="carousel-container">
            <div class="carousel-viewport" id="viewport">
              ${cardsHtml}
            </div>
          </div>

          <button class="nav-btn prev" onclick="move(-1)">‹</button>
          <button class="nav-btn next" onclick="move(1)">›</button>
        </div>

        <script>
          let position = 0;
          const viewport = document.getElementById('viewport');
          
          function move(direction) {
            const cardWidth = document.querySelector('.review-card').offsetWidth + 15; 
            const maxScroll = viewport.scrollWidth - viewport.offsetWidth;
            
            position += (direction * -cardWidth);
            
            if (position < -maxScroll) position = 0;
            if (position > 0) position = -maxScroll;
            
            viewport.style.transform = "translateX(" + position + "px)";
          }
        </script>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send("Fout: " + err.message);
  }
});

app.listen(PORT, '0.0.0.0', () => { console.log("Poort " + PORT); });
