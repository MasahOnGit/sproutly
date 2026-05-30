import { api } from './api.js';
import { state } from './state.js';
import { renderPlants, bindPlantCardActions } from './ui.js';

/**
 * Shortcut for selecting a single element from the page.
 *
 * @param {string} selector CSS selector
 * @returns {Element|null} matching element or null
 */
const qs = (selector) => document.querySelector(selector);

/**
 * Calculates how many days are left until a plant should be watered.
 *
 * If the plant has no lastWatered date, today's date is used.
 * If the plant has no watering interval, 7 days is used by default.
 *
 * @param {Object} plant plant object
 * @returns {number} number of days until the next watering date
 */
export function daysUntilWatering(plant) {
    const last = new Date(plant.lastWatered || new Date());
    const next = new Date(last);

    // Add the watering interval to the last watered date
    next.setDate(next.getDate() + (Number(plant.wateringIntervalDays) || 7));

    const now = new Date();

    // Convert the time difference from milliseconds to days
    return Math.ceil((next - now) / (1000 * 60 * 60 * 24));
}

/**
 * Loads plants for the current mode.
 *
 * In guest mode, plants are loaded from frontend state.
 * In user mode, plants are loaded from the backend database.
 */
export async function loadPlants() {

    // Guest plants are stored only in frontend state
    if (state.mode === 'guest') {
        renderPlants(state.guestPlants, exportedHandlers);
        bindPlantCardActions(exportedHandlers);
        return;
    }

    // Logged-in users load saved plants from the backend
    state.plants = await api('/plants');

    renderPlants(state.plants, exportedHandlers);
    bindPlantCardActions(exportedHandlers);
}

/**
 * Loads current weather data for a city and updates the weather UI.
 *
 * @param {string} [city='Vienna'] city to check weather for
 */
export async function loadWeather(city = 'Vienna') {

    // Request weather data from the backend
    const weather = await api(`/weather?city=${encodeURIComponent(city)}`);

    // Update the small weather statistic card
    qs('#weatherTemp').textContent =
        weather.temperature ? `${weather.temperature}°C` : '--°C';

    // Render the full weather card
    qs('#weatherCard').innerHTML = `
    <h3>${weather.city || city}</h3>
    <p>
      <strong>${weather.temperature ?? '--'}°C</strong>
      · Humidity ${weather.humidity ?? '--'}%
    </p>
    <p>${weather.description || 'Current conditions unavailable.'}</p>
    <p>${weather.wateringAdvice || 'Weather advice unavailable.'}</p>
  `;
}

/**
 * Loads care guide information for a plant and updates the care guide UI.
 *
 * @param {string} [plant='Monstera'] plant name to search for
 */
export async function loadCareGuide(plant = 'Monstera') {

    // Request care guide data from the backend
    const care = await api(`/care-guide?plant=${encodeURIComponent(plant)}`);

    // Render care guide card
    qs('#careCard').innerHTML = `
    <h3>${care.query || plant}</h3>
    <p><strong>Sunlight:</strong> ${care.sunlight || 'Not available'}</p>
    <p><strong>Watering:</strong> ${care.watering || 'Not available'}</p>
    <p><strong>Care level:</strong> ${care.careLevel || 'Not available'}</p>
  `;
}

/**
 * Marks a saved plant as watered.
 *
 * This updates the backend and reloads the plant list.
 *
 * @param {number|string} id plant ID
 */
export async function waterPlant(id) {
    try {
        // Update the plant's last watered date in the backend
        await api(`/plants/${id}/water`, { method: 'PATCH' });

        // Reload plants so the UI shows the updated watering date
        await loadPlants();
    } catch (error) {
        console.error('Water plant failed:', error);
        alert('Could not mark plant as watered.');
    }
}

/**
 * Deletes a saved plant.
 *
 * This removes the plant from the backend and reloads the plant list.
 *
 * @param {number|string} id plant ID
 */
export async function deletePlant(id) {
    try {
        // Delete the plant from the backend
        await api(`/plants/${id}`, { method: 'DELETE' });

        // Reload plants so the UI updates
        await loadPlants();
    } catch (error) {
        console.error('Delete plant failed:', error);
        alert('Could not delete plant.');
    }
}

/**
 * Removes the guest plant from frontend state.
 *
 * Guest plants are not stored in the backend,
 * so this only updates local state and the UI.
 */
export function removeGuestPlant() {

    // Clear all guest plants
    state.guestPlants = [];

    // Re-render empty guest plant list
    renderPlants(state.guestPlants, exportedHandlers);
    bindPlantCardActions(exportedHandlers);
}

/**
 * Builds a plant object from the plant form.
 *
 * The form values are converted into an object that can be sent
 * to the backend or stored temporarily in guest mode.
 *
 * @param {HTMLFormElement} formElement plant form element
 * @returns {Object} plant payload
 */
export function buildPlantPayload(formElement) {
    const formData = new FormData(formElement);
    const payload = Object.fromEntries(formData.entries());

    // Convert watering interval from string to number
    payload.wateringIntervalDays = Number(payload.wateringIntervalDays || 7);

    // Set today's date as the last watered date
    payload.lastWatered = new Date().toISOString().split('T')[0];

    return payload;
}

/**
 * Functions passed into UI rendering so plant cards
 * can call feature logic such as watering or deleting.
 */
export const exportedHandlers = {
    daysUntilWatering,
    waterPlant,
    deletePlant,
    loadCareGuide,
    removeGuestPlant
};