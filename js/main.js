/* ============================
   TICKETHACK – main.js
   ============================ */

// ── CONFIG ────────────────────────────────────────────────────────────────────
// ⚠️  Change this URL to match your Express backend
const API_BASE = 'http://localhost:3000';

// ── CART (localStorage) ───────────────────────────────────────────────────────

function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function addToCart(trip) {
  const cart = getCart();
  // Avoid duplicates by trip _id
  if (!cart.find(t => t._id === trip._id)) {
    cart.push(trip);
    saveCart(cart);
    alert(`"${trip.departure} → ${trip.arrival}" added to cart!`);
  } else {
    alert('This trip is already in your cart.');
  }
}

function removeFromCart(tripId) {
  const cart = getCart().filter(t => t._id !== tripId);
  saveCart(cart);
}

function updateCartCount() {
  const count = getCart().length;
  document.querySelectorAll('#cart-count').forEach(el => {
    el.textContent = count;
  });
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// Countdown: returns a human-readable string from now to a future date
function countdown(departureDateStr) {
  const now = new Date();
  const dep = new Date(departureDateStr);
  const diff = dep - now;

  if (diff <= 0) return 'Departed';

  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `Departs in ${days} day(s)`;
  }
  return `Departs in ${hours}h ${minutes}min`;
}

// Build a trip card HTML element
function createTripCard(trip, options = {}) {
  // options: { showAdd, showRemove, showCountdown }
  const card = document.createElement('div');
  card.classList.add('trip-card');

  const depTime = trip.departureTime ? formatTime(trip.departureTime) : '—';
  const arrTime = trip.arrivalTime ? formatTime(trip.arrivalTime) : '—';
  const dateStr = trip.departureTime ? formatDate(trip.departureTime) : '—';

  card.innerHTML = `
    <div class="trip-info">
      <p class="trip-route">${trip.departure} → ${trip.arrival}</p>
      <p class="trip-detail">${dateStr} &nbsp;|&nbsp; ${depTime} → ${arrTime}</p>
      ${options.showCountdown ? `<p class="countdown">${countdown(trip.departureTime)}</p>` : ''}
    </div>
    <div class="trip-price">${trip.price} €</div>
    <div class="trip-actions">
      ${options.showAdd ? `<button class="btn-secondary btn-add">Add to cart</button>` : ''}
      ${options.showRemove ? `<button class="btn-danger btn-remove">Remove</button>` : ''}
    </div>
  `;

  if (options.showAdd) {
    card.querySelector('.btn-add').addEventListener('click', () => addToCart(trip));
  }
  if (options.showRemove) {
    card.querySelector('.btn-remove').addEventListener('click', () => {
      removeFromCart(trip._id);
      renderCart(); // re-render cart page
    });
  }

  return card;
}

// ── PAGE : INDEX (search) ─────────────────────────────────────────────────────

function initSearchPage() {
  const btnSearch = document.getElementById('btn-search');
  if (!btnSearch) return;

  btnSearch.addEventListener('click', handleSearch);
}

async function handleSearch() {
  const departure = document.getElementById('departure').value.trim();
  const arrival = document.getElementById('arrival').value.trim();
  const date = document.getElementById('date').value;
  const errorEl = document.getElementById('search-error');

  // Basic validation
  if (!departure || !arrival || !date) {
    errorEl.textContent = 'Please fill in all fields.';
    errorEl.classList.remove('hidden');
    return;
  }
  errorEl.classList.add('hidden');

  try {
    // ⚠️ Adapt the route to match your backend
    const response = await fetch(
      `${API_BASE}/trips?departure=${encodeURIComponent(departure)}&arrival=${encodeURIComponent(arrival)}&date=${date}`
    );

    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const trips = await response.json();
    renderSearchResults(trips);

  } catch (err) {
    errorEl.textContent = `Error: ${err.message}`;
    errorEl.classList.remove('hidden');
  }
}

function renderSearchResults(trips) {
  const placeholder = document.getElementById('results-placeholder');
  const list = document.getElementById('results-list');

  list.innerHTML = '';

  if (!trips || trips.length === 0) {
    list.innerHTML = '<p class="empty-msg">No trips found for these criteria.</p>';
    placeholder.classList.add('hidden');
    list.classList.remove('hidden');
    return;
  }

  placeholder.classList.add('hidden');
  list.classList.remove('hidden');

  trips.forEach(trip => {
    list.appendChild(createTripCard(trip, { showAdd: true }));
  });
}

// ── PAGE : CART ───────────────────────────────────────────────────────────────

function renderCart() {
  const listEl = document.getElementById('cart-list');
  const footerEl = document.getElementById('cart-footer');
  if (!listEl) return;

  const cart = getCart();
  listEl.innerHTML = '';

  if (cart.length === 0) {
    listEl.innerHTML = '<p class="empty-msg">Your cart is empty.</p>';
    footerEl.classList.add('hidden');
    return;
  }

  cart.forEach(trip => {
    listEl.appendChild(createTripCard(trip, { showRemove: true }));
  });

  const total = cart.reduce((sum, t) => sum + (t.price || 0), 0);
  document.getElementById('cart-total').textContent = `${total} €`;
  footerEl.classList.remove('hidden');
}

function initCartPage() {
  const btnPay = document.getElementById('btn-pay');
  if (!btnPay) return;

  renderCart();
  btnPay.addEventListener('click', handlePayment);
}

async function handlePayment() {
  const cart = getCart();
  if (cart.length === 0) return;

  try {
    // ⚠️ Adapt the route to match your backend
    const response = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trips: cart }),
    });

    if (!response.ok) throw new Error(`Payment error: ${response.status}`);

    // Empty cart then redirect to bookings
    saveCart([]);
    window.location.href = 'booking.html';

  } catch (err) {
    alert(`Error during payment: ${err.message}`);
  }
}

// ── PAGE : BOOKINGS ───────────────────────────────────────────────────────────

async function initBookingsPage() {
  const listEl = document.getElementById('bookings-list');
  if (!listEl) return;

  try {
    // ⚠️ Adapt the route to match your backend
    const response = await fetch(`${API_BASE}/bookings`);
    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const bookings = await response.json();
    renderBookings(bookings);

  } catch (err) {
    listEl.innerHTML = `<p class="empty-msg">Error loading bookings: ${err.message}</p>`;
  }
}

function renderBookings(bookings) {
  const listEl = document.getElementById('bookings-list');
  listEl.innerHTML = '';

  if (!bookings || bookings.length === 0) {
    listEl.innerHTML = '<p class="empty-msg">No bookings yet.</p>';
    return;
  }

  bookings.forEach(booking => {
    // Depending on your backend, booking may contain trip data directly or via a trips array
    const trips = booking.trips || [booking];
    trips.forEach(trip => {
      listEl.appendChild(createTripCard(trip, { showCountdown: true }));
    });
  });
}

// ── INIT ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  initSearchPage();
  initCartPage();
  initBookingsPage();
});
