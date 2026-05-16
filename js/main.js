console.log("main.js script is loaded");

// FETCH data from GET /trips endpoints backend provided by Express server
fetch("http://localhost:3000/trips")
  .then((response) => response.json())
  .then((data) => {
    //console.log('Trips data:', data); // Log the data to verify it's correct
  })
  .catch((error) => {
    console.error("Error fetching trips:", error);
  });

// FETCH data from GET /trips endpoints backend provided by Express server
// fetch('http://localhost:3000/trips/search?departure=Lyon&arrival=Marseille')
//   .then(response => response.json())
//   .then(data => {
//     console.log('Trips data:', data); // Log the data to verify it's correct
//   })
//   .catch(error => {
//     console.error('Error fetching trips:', error);
//   });



// ─── Select DOM elements ───────────────────────────────────────────────────
const searchBtn          = document.querySelector('#btn-search');
const resultsPlaceholder = document.querySelector('#results-placeholder');
const resultsList        = document.querySelector('#results-list');
 
 
// ─── Search button click ───────────────────────────────────────────────────
searchBtn.addEventListener('click', function (event) {
  event.preventDefault();
 
  const departure = document.querySelector('#departure').value.trim();
  const arrival   = document.querySelector('#arrival').value.trim();
  const date      = document.querySelector('#date').value.trim();
 
  if (!departure || !arrival || !date) {
    alert('Please fill in all fields');
    return;
  }
 
  showLoading();
 
  const url = `http://localhost:3000/trips/search?departure=${departure}&arrival=${arrival}&date=${date}`;
  console.log('Fetching:', url);
 
  fetch(url)
    .then(function (response) {
      if (!response.ok) {
        throw new Error('Server returned an error: ' + response.status);
      }
      return response.json();
    })
    .then(function (data) {
      renderResults(data);
    })
    .catch(function (error) {
      console.error('Fetch error:', error);
      showError('Something went wrong. Please try again.');
    });
});
 
 
// ─── Render trip cards ─────────────────────────────────────────────────────
function renderResults(response) {
  const tripArray = response.data;
 
  resultsPlaceholder.style.display = 'none';
  resultsList.style.display        = 'block';
  resultsList.innerHTML            = '';
 
  if (!tripArray || tripArray.length === 0) {
    resultsList.innerHTML = '<p style="padding:1rem;color:var(--text-light)">No trips found for this search.</p>';
    return;
  }
 
  for (const trip of tripArray) {
    const dateObj       = new Date(trip.date);
    const formattedDate = dateObj.toLocaleDateString('fr-FR');
    const formattedTime = dateObj.getUTCHours().toString().padStart(2, '0') + 'h' + dateObj.getUTCMinutes().toString().padStart(2, '0');
 
    resultsList.innerHTML += `
      <div class="trip-card">
        <span class="trip-route">${trip.departure} &gt; ${trip.arrival}</span>
        <span class="trip-date">${formattedDate} à ${formattedTime}</span>
        <span class="trip-price">${trip.price} €</span>
        <button class="btn-book" data-id="${trip._id}">Book</button>
      </div>
    `;
  }
}
 
 
// ─── Helper: loading state ─────────────────────────────────────────────────
function showLoading() {
  resultsPlaceholder.style.display = 'none';
  resultsList.style.display        = 'block';
  resultsList.innerHTML            = '<p style="padding:1rem;color:var(--text-light)">Searching trips…</p>';
}
 
 
// ─── Helper: error message ─────────────────────────────────────────────────
function showError(message) {
  resultsPlaceholder.style.display = 'none';
  resultsList.style.display        = 'block';
  resultsList.innerHTML            = `<p class="error-msg" style="padding:1rem">${message}</p>`;
}

/**
   * // Update results
        for (const trip of data.trips) {
          document.querySelector('#results').innerHTML += `
   */

