const API_BASE = 'http://localhost:8080/api';

async function api(path) {
  const response = await fetch(`${API_BASE}${path}`, { credentials: 'include' });
  if (!response.ok) throw new Error('Request failed');
  return response.json();
}

async function loadAdminData() {
  const [plants, weather, care] = await Promise.all([
    api('/plants'),
    api('/weather?city=Vienna'),
    api('/care-guide?plant=Monstera')
  ]);

  document.querySelector('#adminPlants').innerHTML = plants.map(plant => `
    <div class="admin-item">
      <strong>${plant.name}</strong>
      <p>${plant.type} · ${plant.location || 'No location'}</p>
    </div>
  `).join('');

  document.querySelector('#adminWeather').innerHTML = `
    <strong>${weather.city}</strong>
    <p>${weather.temperature}°C · ${weather.description}</p>
    <p>${weather.wateringAdvice}</p>
  `;

  document.querySelector('#adminCare').innerHTML = `
    <strong>${care.query}</strong>
    <p>Sunlight: ${care.sunlight}</p>
    <p>Watering: ${care.watering}</p>
    <p>Care level: ${care.careLevel}</p>
  `;
}

document.querySelector('#adminRefreshBtn').addEventListener('click', loadAdminData);
document.addEventListener('DOMContentLoaded', loadAdminData);
