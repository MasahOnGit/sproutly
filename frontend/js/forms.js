import { api } from './api.js';
import { state } from './state.js';
import {
    loadPlants,
    loadWeather,
    loadCareGuide,
    buildPlantPayload
} from './features.js';

const qs = (selector) => document.querySelector(selector);

export function setupDashboardForms() {
    const plantForm = qs('#plantForm');
    const weatherForm = qs('#weatherForm');
    const careForm = qs('#careForm');
    const refreshPlantsBtn = qs('#refreshPlantsBtn');
    const guestLimitMessage = qs('#guestLimitMessage');

    plantForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        guestLimitMessage.textContent = '';

        const payload = buildPlantPayload(plantForm);

        if (state.mode === 'guest') {
            if (state.guestPlants.length >= 1) {
                guestLimitMessage.textContent = 'Guest users can only add one plant.';
                return;
            }

            payload.id = Date.now();
            state.guestPlants = [payload];

            await loadPlants();
            await loadCareGuide(payload.type || payload.name || 'Monstera');
            plantForm.reset();
            return;
        }

        try {
            await api('/plants', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            plantForm.reset();
            await loadPlants();
            await loadCareGuide(payload.type || payload.name || 'Monstera');
        } catch (error) {
            guestLimitMessage.textContent = error.message || 'Could not add plant.';
        }
    });

    weatherForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const city = qs('#cityInput')?.value?.trim() || 'Vienna';
        await loadWeather(city);
    });

    careForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const plant = qs('#careInput')?.value?.trim() || 'Monstera';
        await loadCareGuide(plant);
    });

    refreshPlantsBtn?.addEventListener('click', async () => {
        guestLimitMessage.textContent = '';
        await loadPlants();
    });
}