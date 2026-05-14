/* ============================
   TICKETHACK – main.js
   ============================ */

// ── CONFIG ────────────────────────────────────────────────────────────────────
// ⚠️  Change this URL to match your Express backend



// FETCH data from GET /trips endpoints backend provided by Express server
fetch('http://localhost:3000/trips')
  .then(response => response.json())
  .then(data => {
    //console.log('Trips data:', data); // Log the data to verify it's correct 
  })
  .catch(error => {
    console.error('Error fetching trips:', error);
  });




  // FETCH data from GET /trips endpoints backend provided by Express server
fetch('http://localhost:3000/trips/search?departure=Lyon&arrival=Marseille')
  .then(response => response.json())
  .then(data => {
    console.log('Trips data:', data); // Log the data to verify it's correct 
  })
  .catch(error => {
    console.error('Error fetching trips:', error);
  });





