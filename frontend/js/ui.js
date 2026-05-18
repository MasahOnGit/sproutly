import { state } from './state.js';

const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => document.querySelectorAll(selector);

export function showScreen(screenId) {
    qsa('.screen').forEach((screen) => screen.classList.remove('screen-active'));
    qs(`#${screenId}`).classList.add('screen-active');
}

export function setupTheme() {
    const root = document.documentElement;
    let theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.setAttribute('data-theme', theme);
    qs('#themeToggle').textContent = theme === 'dark' ? '☾' : '☼';

    qs('#themeToggle').addEventListener('click', () => {
        theme = theme === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', theme);
        qs('#themeToggle').textContent = theme === 'dark' ? '☾' : '☼';
    });
}

export function setupTabs() {
    qsa('.tab').forEach((tab) => {
        tab.addEventListener('click', () => {
            qsa('.tab').forEach((item) => item.classList.remove('active'));
            qsa('.auth-form').forEach((form) => form.classList.remove('active'));
            tab.classList.add('active');
            qs(`#${tab.dataset.tab}Form`).classList.add('active');
        });
    });
}

export function updateModeUI() {
    const isGuest = state.mode === 'guest';
    qs('#modeBadge').textContent = isGuest ? 'Guest' : 'Logged In';
    qs('#modeTitle').textContent = isGuest ? 'Guest Mode' : 'Full Experience';
    qs('#modeDescription').textContent = isGuest
        ? 'You can add one plant and get care guidance.'
        : 'Your plants are stored in the database and you have the full experience.';

    qs('#logoutBtn').classList.toggle('hidden', isGuest);

    if (state.loggedInUser) {
        qs('#dashboardIntro').textContent = `Welcome back, ${state.loggedInUser.displayName || state.loggedInUser.email}. Your plants and routines are saved.`;
    } else {
        qs('#dashboardIntro').textContent = 'You are exploring Sproutly as a guest. Add one plant and check care guidance.';
    }
}

export function renderPlants(plants, handlers) {
    const grid = qs('#plantGrid');
    const countSoon = plants.filter((plant) => handlers.daysUntilWatering(plant) <= 2).length;
    qs('#plantCount').textContent = plants.length;
    qs('#wateringCount').textContent = countSoon;

    if (state.mode === 'guest') {
        qs('#guestLimitMessage').textContent = plants.length >= 1
            ? 'Guest mode limit reached: you can only add one plant.'
            : 'Guest mode: one plant only, not saved to the database.';
    } else {
        qs('#guestLimitMessage').textContent = '';
    }

    if (!plants.length) {
        grid.innerHTML = `<div class="soft-panel"><h3>No plants yet</h3><p>${state.mode === 'guest' ? 'Add one plant to instantly see care information.' : 'Add your first plant to start tracking care routines.'}</p></div>`;
        return;
    }

    grid.innerHTML = plants.map((plant) => {
        const days = handlers.daysUntilWatering(plant);
        const status = days <= 0 ? 'Water today' : days === 1 ? 'Water tomorrow' : `${days} days left`;

        return `
      <article class="plant-card">
        <img src="${plant.photoUrl || 'https://picsum.photos/seed/sproutly-plant/800/600'}" alt="${plant.name}">
        <div class="plant-card-content">
          <div>
            <h3>${plant.name}</h3>
            <p class="plant-type">${plant.type}</p>
          </div>
          <div class="tag-row">
            <span class="tag">${plant.location || 'Indoors'}</span>
            <span class="tag">${status}</span>
          </div>
          <p>${plant.notes || 'No notes yet.'}</p>
          <div class="card-actions">
            ${state.mode === 'guest'
            ? `<button class="ghost-button" data-care="${plant.type || plant.name}">View care guide</button>
                 <button class="ghost-button" data-remove-guest="true">Remove</button>`
            : `<button class="ghost-button" data-water="${plant.id}">Mark watered</button>
                 <button class="ghost-button" data-delete="${plant.id}">Delete</button>`}
          </div>
        </div>
      </article>
    `;
    }).join('');
}

export function bindPlantCardActions(handlers) {
    const grid = qs('#plantGrid');

    if (!grid) return;

    grid.onclick = async (event) => {
        const waterButton = event.target.closest('[data-water]');
        const deleteButton = event.target.closest('[data-delete]');
        const careButton = event.target.closest('[data-care]');
        const removeGuestButton = event.target.closest('[data-remove-guest]');

        if (waterButton) {
            await handlers.waterPlant(Number(waterButton.dataset.water));
            return;
        }

        if (deleteButton) {
            await handlers.deletePlant(Number(deleteButton.dataset.delete));
            return;
        }

        if (careButton) {
            await handlers.loadCareGuide(careButton.dataset.care);
            return;
        }

        if (removeGuestButton) {
            handlers.removeGuestPlant();
        }
    };
}