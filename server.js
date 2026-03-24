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

    // HTML voor de Header
    const headerHtml = `
      <div class="reviews-header">
        <div class="header-left">
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" class="google-logo">
          <span class="header-text">Reviews</span>
          <div class="header-rating">
            <span class="rating-value">${rating}</span>
            <span class="stars">★★★★★</span>
            <span class="rating-count">(${reviewsCount})</span>
          </div>
        </div>
        <a href="https://search.google.com/local/writereview?placeid=${PLACE_ID}" target="_blank" class="review-btn">Review us on Google</a>
      </div>
    `;

    // HTML voor de Review Cards
    let cardsHtml = '';
    reviews.forEach(rev => {
      // Gebruik de avatar URL als deze er is, anders een initiaal
      const avatarUrl = rev.authorAttribution.photoUri;
      const avatarHtml = avatarUrl 
        ? `<img src="${avatarUrl}" class="avatar-img">`
        : `<div class="avatar-initial">${rev.authorAttribution.displayName.charAt(0).toUpperCase()}</div>`;
      
      const text = rev.text ? rev.text.text : '';
      const shortenedText = text.substring(0, 150);
      const showReadMore = text.length > 150;

      cardsHtml += `
        <div class="review-card">
          <div class="card-header">
            <div class="avatar-container">
              ${avatarHtml}
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_\"G\"_logo.svg" alt="G" class="google-g">
            </div>
            <div class="author-info">
              <div class="author-name-row">
                <span class="author-name">${rev.authorAttribution.displayName}</span>
                <span class="verified-vinkje">✔️</span>
              </div>
              <span class="publish-time">${rev.relativePublishTimeDescription}</span>
            </div>
          </div>
          <div class="stars card-stars">★★★★★</div>
          <p class="review-text">${shortenedText}${showReadMore ? '...' : ''}</p>
          ${showReadMore ? `<a href="#" class="read-more">Read more</a>` : ''}
        </div>
      `;
    });

    res.send(`
      <!DOCTYPE html>
      <html lang="nl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Stortrijders Google Reviews</title>
        <style>
          /* ALGEMENE STIJLEN */
          body { font-family: 'Open Sans', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 20px; background-color: #f7f9fc; }
          .container { max-width: 1100px; margin: 0 auto; overflow: hidden; position: relative; }

          /* HEADER STIJLEN */
          .reviews-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; border-bottom: 1px solid #e1e4e8; margin-bottom: 30px; }
          .google-logo { height: 20px; margin-right: 8px; }
          .header-text { font-size: 18px; font-weight: 600; color: #333; }
          .header-rating { display: flex; align-items: center; margin-top: 5px; }
          .rating-value { font-size: 24px; font-weight: bold; color: #333; margin-right: 8px; }
          .stars { color: #fabb00; font-size: 18px; }
          .rating-count { color: #666; font-size: 14px; margin-left: 5px; }
          .review-btn { background-color: #1a73e8; color: white; padding: 10px 20px; border-radius: 20px; text-decoration: none; font-size: 14px; font-weight: 600; }

          /* CARROUSEL STIJLEN */
          .carousel-viewport { display: flex; gap: 20px; transition: transform 0.5s ease-in-out; }
          .review-card { flex: 0 0 calc(33.333% - 14px); min-width: 300px; background: white; padding: 20px; border-radius: 12px; border: 1px solid #e1e4e8; box-shadow: 0 4px 10px rgba(0,0,0,0.03); box-sizing: border-border-box; }
          .card-header { display: flex; align-items: center; margin-bottom: 15px; }
          
          /* AVATAR STIJLEN */
          .avatar-container { position: relative; width: 44px; height: 44px; margin-right: 12px; }
          .avatar-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
          .avatar-initial { width: 100%; height: 100%; border-radius: 50%; background-color: #4285f4; color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; }
          .google-g { position: absolute; bottom: -2px; left: -2px; width: 18px; height: 18px; background: white; border-radius: 50%; padding: 1px; }

          /* AUTEUR STIJLEN */
          .author-info { display: flex; flex-direction: column; }
          .author-name-row { display: flex; align-items: center; }
          .author-name { font-weight: 600; font-size: 14px; color: #333; }
          .verified-vinkje { color: #1a73e8; font-size: 12px; margin-left: 5px; }
          .publish-time { color: #888; font-size: 11px; }
          .card-stars { font-size: 16px; margin-bottom: 10px; }
          .review-text { color: #555; font-size: 13px; line-height: 1.5; margin: 0 0 10px; }
          .read-more { color: #1a73e8; text-decoration: none; font-size: 12px; font-weight: 600; }

          /* CARROUSEL BESTURING */
          .carousel-btn { position: absolute; top: 50%; transform: translateY(-50%); width: 40px; height: 40px; border-radius: 50%; background-color: white; border: 1px solid #ddd; color: #555; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
          .carousel-btn.prev { left: 0; }
          .carousel-btn.next { right: 0; }
          .carousel-dots { display: flex; justify-content: center; gap: 8px; margin-top: 20px; }
          .dot { width: 8px; height: 8px; border-radius: 50%; background-color: #ddd; cursor: pointer; }
          .dot.active { background-color: #1a73e8; }
        </style>
      </head>
      <body>
        <div class="container">
          ${headerHtml}
          <div class="carousel-viewport" id="carousel-viewport">
            ${cardsHtml}
          </div>
          <button class="carousel-btn prev" id="prev-btn">‹</button>
          <button class="carousel-btn next" id="next-btn">›</button>
          <div class="carousel-dots" id="carousel-dots"></div>
        </div>

        <script>
          // CARROUSEL JAVASCRIPT
          const viewport = document.getElementById('carousel-viewport');
          const prevBtn = document.getElementById('prev-btn');
          const nextBtn = document.getElementById('next-btn');
          const dotsContainer = document.getElementById('carousel-dots');
          const cards = document.querySelectorAll('.review-card');

          let currentIndex = 0;
          const totalCards = cards.length;
          // Toon 3 kaarten op desktop, 1 op mobiel
          let cardsToShow = window.innerWidth > 900 ? 3 : 1; 

          // Maak de stipjes (dots)
          const totalDots = Math.ceil(totalCards / cardsToShow);
          for (let i = 0; i < totalDots; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
              currentIndex = i * cardsToShow;
              updateCarousel();
            });
            dotsContainer.appendChild(dot);
          }
          const dots = document.querySelectorAll('.dot');

          function updateCarousel() {
            // Beperk currentIndex tot geldige waarden
            currentIndex = Math.max(0, Math.min(currentIndex, totalCards - cardsToShow));
            
            // Bereken de verschuiving
            const offset = -(currentIndex * (100 / totalCards));
            viewport.style.transform = 'translateX(' + offset + '%)';

            // Update dots
            dots.forEach((dot, index) => {
              dot.classList.add('dot'); // reset
              if (index === Math.floor(currentIndex / cardsToShow)) {
                dot.classList.add('active');
              } else {
                dot.classList.remove('active');
              }
            });
          }

          nextBtn.addEventListener('click', () => {
            currentIndex += 1; // Schuif 1 kaart op
            if (currentIndex > totalCards - cardsToShow) {
              currentIndex = 0; // Terug naar het begin
            }
            updateCarousel();
          });

          prevBtn.addEventListener('click', () => {
            currentIndex -= 1;
            if (currentIndex < 0) {
              currentIndex = totalCards - cardsToShow; // Naar het einde
            }
            updateCarousel();
          });

          // Responsiviteit bij aanpassen venstergrootte
          window.addEventListener('resize', () => {
            cardsToShow = window.innerWidth > 900 ? 3 : 1;
            updateCarousel();
          });
        }
        </script>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send("Fout: " + err.message);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Live op poort ${PORT}`);
});
