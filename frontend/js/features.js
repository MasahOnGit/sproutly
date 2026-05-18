import { api } from './api.js';
import { state } from './state.js';
import { renderPlants, bindPlantCardActions } from './ui.js';

const qs = (selector) => document.querySelector(selector);

export function daysUntilWatering(plant) {
    const last = new Date(plant.lastWatered || new Date());
    const next = new Date(last);
    next.setDate(next.getDate() + (Number(plant.wateringIntervalDays) || 7));
    const now = new Date();
    return Math.ceil((next - now) / (1000 * 60 * 60 * 24));
}

export async function loadPlants() {
    if (state.mode === 'guest') {
        renderPlants(state.guestPlants, exportedHandlers);
        bindPlantCardActions(exportedHandlers);
        return;
    }

    state.plants = await api('/plants');
    renderPlants(state.plants, exportedHandlers);
    bindPlantCardActions(exportedHandlers);
}

export async function loadWeather(city = 'Vienna') {
    const weather = await api(`/weather?city=${encodeURIComponent(city)}`);
    qs('#weatherTemp').textContent = weather.temperature ? `${weather.temperature}°C` : '--°C';
    qs('#weatherCard').innerHTML = `
    <h3>${weather.city || city}</h3>
    <p><strong>${weather.temperature ?? '--'}°C</strong> · Humidity ${weather.humidity ?? '--'}%</p>
    <p>${weather.description || 'Current conditions unavailable.'}</p>
    <p>${weather.wateringAdvice || 'Weather advice unavailable.'}</p>
  `;
}

export async function loadCareGuide(plant = 'Monstera') {
    const care = await api(`/care-guide?plant=${encodeURIComponent(plant)}`);
    qs('#careCard').innerHTML = `
    <h3>${care.query || plant}</h3>
    <p><strong>Sunlight:</strong> ${care.sunlight || 'Not available'}</p>
    <p><strong>Watering:</strong> ${care.watering || 'Not available'}</p>
    <p><strong>Care level:</strong> ${care.careLevel || 'Not available'}</p>
  `;
}

export async function waterPlant(id) {
    try {
        await api(`/plants/${id}/water`, { method: 'PATCH' });
        await loadPlants();
    } catch (error) {
        console.error('Water plant failed:', error);
        alert('Could not mark plant as watered.');
    }
}

export async function deletePlant(id) {
    try {
        await api(`/plants/${id}`, { method: 'DELETE' });
        await loadPlants();
    } catch (error) {
        console.error('Delete plant failed:', error);
        alert('Could not delete plant.');
    }
}

export function removeGuestPlant() {
    state.guestPlants = [];
    renderPlants(state.guestPlants, exportedHandlers);
    bindPlantCardActions(exportedHandlers);
}

export function buildPlantPayload(formElement) {
    const formData = new FormData(formElement);
    const payload = Object.fromEntries(formData.entries());
    payload.wateringIntervalDays = Number(payload.wateringIntervalDays || 7);
    payload.lastWatered = new Date().toISOString().split('T')[0];
    return payload;
}

export const exportedHandlers = {
    daysUntilWatering,
    waterPlant,
    deletePlant,
    loadCareGuide,
    removeGuestPlant
};