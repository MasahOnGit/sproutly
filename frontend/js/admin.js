/**
 * Base URL for all backend API requests.
 */
const API_BASE = 'http://localhost:8080/api';

/**
 * Sends a GET request to the backend API.
 *
 * Credentials are included so session authentication
 * works correctly with Spring Security.
 *
 * @param {string} path API endpoint path
 * @returns {Promise<Object>} parsed JSON response
 * @throws {Error} if the request fails
 */
async function api(path) {

  // Send request to backend
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include'
  });

  // Throw an error if the response was unsuccessful
  if (!response.ok) {
    throw new Error('Request failed');
  }

  // Convert response body to JSON
  return response.json();
}

/**
 * Loads dashboard data for the admin page.
 *
 * This includes:
 * - User plants
 * - Weather information
 * - Plant care guide data
 *
 * Data is loaded in parallel using Promise.all()
 * for better performance.
 */
async function loadAdminData() {

  // Load plant, weather, and care guide data simultaneously
  const [plants, weather, care] = await Promise.all([
    api('/plants'),
    api('/weather?city=Vienna'),
    api('/care-guide?plant=Monstera')
  ]);

  // Render the user's plants
  document.querySelector('#adminPlants').innerHTML = plants.map(plant => `
    <div class="admin-item">
      <strong>${plant.name}</strong>
      <p>${plant.type} · ${plant.location || 'No location'}</p>
    </div>
  `).join('');

  // Render weather information
  document.querySelector('#adminWeather').innerHTML = `
    <strong>${weather.city}</strong>
    <p>${weather.temperature}°C · ${weather.description}</p>
    <p>${weather.wateringAdvice}</p>
  `;

  // Render care guide information
  document.querySelector('#adminCare').innerHTML = `
    <strong>${care.query}</strong>
    <p>Sunlight: ${care.sunlight}</p>
    <p>Watering: ${care.watering}</p>
    <p>Care level: ${care.careLevel}</p>
  `;
}

/**
 * Reloads admin dashboard data when the refresh button is clicked.
 */
document.querySelector('#adminRefreshBtn')
    .addEventListener('click', loadAdminData);

/**
 * Loads admin dashboard data when the page finishes loading.
 */
document.addEventListener('DOMContentLoaded', loadAdminData);